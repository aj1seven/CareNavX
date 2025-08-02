import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPatientSchema, insertDocumentSchema } from "@shared/schema";
import { analyzeDocument, extractPatientData } from "./openai";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Get all patients
  app.get("/api/patients", async (req, res) => {
    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patients" });
    }
  });

  // Get patient by ID
  app.get("/api/patients/:id", async (req, res) => {
    try {
      const patient = await storage.getPatient(req.params.id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      
      // Log activity
      await storage.createActivity({
        patientId: patient.id,
        action: "patient_created",
        description: `Patient ${patient.firstName} ${patient.lastName} created`
      });

      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ error: "Invalid patient data" });
    }
  });

  // Update patient
  app.patch("/api/patients/:id", async (req, res) => {
    try {
      const updates = req.body;
      const patient = await storage.updatePatient(req.params.id, updates);
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Log activity
      await storage.createActivity({
        patientId: patient.id,
        action: "patient_updated",
        description: `Patient ${patient.firstName} ${patient.lastName} updated`
      });

      res.json(patient);
    } catch (error) {
      res.status(400).json({ error: "Failed to update patient" });
    }
  });

  // Complete onboarding
  app.post("/api/patients/:id/complete", async (req, res) => {
    try {
      const { admissionLocation } = req.body;
      const patient = await storage.completeOnboarding(req.params.id, admissionLocation);
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Log activity
      await storage.createActivity({
        patientId: patient.id,
        action: "onboarding_completed",
        description: `Onboarding completed for ${patient.firstName} ${patient.lastName} - admitted to ${admissionLocation}`
      });

      res.json(patient);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  // Upload and analyze document
  app.post("/api/patients/:id/documents", upload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const patientId = req.params.id;
      const patient = await storage.getPatient(patientId);
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Analyze document with AI
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);
      const base64 = fileBuffer.toString('base64');
      
      let analysisResult;
      try {
        analysisResult = await analyzeDocument(base64, req.file.mimetype);
      } catch (aiError) {
        console.error("AI analysis failed:", aiError);
        analysisResult = { error: "AI analysis failed", extractedText: null };
      }

      // Save document record
      const document = await storage.createDocument({
        patientId,
        fileName: req.file.originalname || req.file.filename,
        fileType: req.file.mimetype,
        filePath: req.file.path,
        analysisResult
      });

      // Extract patient data if analysis was successful
      if (analysisResult && !analysisResult.error) {
        try {
          const extractedData = await extractPatientData(analysisResult.extractedText || "");
          if (extractedData && Object.keys(extractedData).length > 0) {
            await storage.updatePatient(patientId, extractedData);
          }
        } catch (extractError) {
          console.error("Data extraction failed:", extractError);
        }
      }

      // Log activity
      await storage.createActivity({
        patientId,
        action: "document_uploaded",
        description: `Document ${req.file.originalname} uploaded and analyzed`
      });

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      res.json({ document, analysisResult });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to process document" });
    }
  });

  // Get recent activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Get hospital departments/navigation
  app.get("/api/navigation", async (req, res) => {
    try {
      const departments = [
        { id: "emergency", name: "Emergency Room", icon: "fas fa-ambulance", walkTime: "2 min", floor: "Ground Floor", wing: "East" },
        { id: "icu", name: "ICU", icon: "fas fa-heartbeat", walkTime: "5 min", floor: "Floor 3", wing: "North" },
        { id: "radiology", name: "Radiology", icon: "fas fa-x-ray", walkTime: "8 min", floor: "Floor 2", wing: "West" },
        { id: "surgery", name: "Surgery", icon: "fas fa-user-md", walkTime: "6 min", floor: "Floor 4", wing: "South" },
        { id: "pharmacy", name: "Pharmacy", icon: "fas fa-pills", walkTime: "3 min", floor: "Ground Floor", wing: "Center" },
        { id: "lab", name: "Laboratory", icon: "fas fa-flask", walkTime: "4 min", floor: "Floor 1", wing: "East" }
      ];
      res.json(departments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch navigation data" });
    }
  });

  // Chat endpoint for patient support
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }
      
      // Use OpenAI to analyze patient query
      const { analyzePatientQuery } = await import('./openai');
      const analysis = await analyzePatientQuery(message);
      
      res.json({
        response: analysis.response,
        intent: analysis.intent,
        suggestions: analysis.suggestions,
        urgency: analysis.urgency
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        response: "I'm sorry, I'm experiencing technical difficulties. Please contact our support team at (555) 123-CARE for immediate assistance.",
        error: "Chat service temporarily unavailable" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
