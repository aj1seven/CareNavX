import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  analyzeSymptoms, 
  getMedicalAdvice, 
  analyzeInsurance, 
  analyzePatientQuery,
  generateHealthRecommendations 
} from "./openai";
import multer from "multer";
import { z } from "zod";

// Validation schemas
const patientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(1, "Phone is required"), // Changed from min(10) to min(1) for emergency patients
  address: z.string().min(1, "Address is required"),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  insuranceGroupNumber: z.string().optional(),
  insuranceStatus: z.string().optional(),
  medicalHistory: z.any().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  onboardingStep: z.number().optional(),
  isCompleted: z.boolean().optional(),
  isEmergency: z.boolean().optional(),
  admissionLocation: z.string().optional(),
  emergencyType: z.string().optional(),
});



const activitySchema = z.object({
  patientId: z.string().optional(),
  action: z.string().min(1, "Action is required"),
  description: z.string().min(1, "Description is required"),
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
      const { id } = req.params;
      
      // Check if ID is valid
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Invalid patient ID" });
      }
      
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }
      res.json(patient);
    } catch (error) {
      console.error("Error getting patient:", error);
      res.status(500).json({ error: "Failed to fetch patient" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = patientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      
      // Log activity
      await storage.createActivity({
        patientId: patient._id.toString(),
        action: "patient_created",
        description: `Patient ${patient.firstName} ${patient.lastName} created`
      });

      res.status(201).json(patient);
    } catch (error) {
      console.error("Error creating patient:", error);
      res.status(400).json({ error: "Invalid patient data" });
    }
  });

  // Update patient
  app.patch("/api/patients/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Check if ID is valid
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Invalid patient ID" });
      }
      
      const patient = await storage.updatePatient(id, updates);
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Log activity
      await storage.createActivity({
        patientId: patient._id.toString(),
        action: "patient_updated",
        description: `Patient ${patient.firstName} ${patient.lastName} updated`
      });

      res.json(patient);
    } catch (error) {
      console.error("Error updating patient:", error);
      res.status(400).json({ error: "Failed to update patient" });
    }
  });

  // Complete onboarding
  app.post("/api/patients/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const { admissionLocation } = req.body;
      
      // Check if ID is valid
      if (!id || id === "undefined") {
        return res.status(400).json({ error: "Invalid patient ID" });
      }
      
      const patient = await storage.completeOnboarding(id, admissionLocation);
      
      if (!patient) {
        return res.status(404).json({ error: "Patient not found" });
      }

      // Log activity
      await storage.createActivity({
        patientId: patient._id.toString(),
        action: "onboarding_completed",
        description: `Onboarding completed for ${patient.firstName} ${patient.lastName} - admitted to ${admissionLocation}`
      });

      res.json(patient);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ error: "Failed to complete onboarding" });
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

  // Symptom analysis endpoint
  app.post("/api/symptoms/analyze", async (req, res) => {
    try {
      const { symptoms, patientAge } = req.body;
      
      if (!symptoms || typeof symptoms !== 'string') {
        return res.status(400).json({ error: "Symptoms description is required" });
      }
      
      const analysis = await analyzeSymptoms(symptoms, patientAge);
      res.json(analysis);
    } catch (error) {
      console.error("Symptom analysis error:", error);
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });

  // Medical advice endpoint
  app.post("/api/medical/advice", async (req, res) => {
    try {
      const { patientData, currentSymptoms } = req.body;
      
      if (!patientData) {
        return res.status(400).json({ error: "Patient data is required" });
      }
      
      const advice = await getMedicalAdvice(patientData, currentSymptoms);
      res.json(advice);
    } catch (error) {
      console.error("Medical advice error:", error);
      res.status(500).json({ error: "Failed to generate medical advice" });
    }
  });

  // Insurance analysis endpoint
  app.post("/api/insurance/analyze", async (req, res) => {
    try {
      const { insuranceData, medicalProcedures } = req.body;
      
      if (!insuranceData) {
        return res.status(400).json({ error: "Insurance data is required" });
      }
      
      const analysis = await analyzeInsurance(insuranceData, medicalProcedures);
      res.json(analysis);
    } catch (error) {
      console.error("Insurance analysis error:", error);
      res.status(500).json({ error: "Failed to analyze insurance" });
    }
  });

  // Health recommendations endpoint
  app.post("/api/health/recommendations", async (req, res) => {
    try {
      const { patientData, currentHealthStatus } = req.body;
      
      if (!patientData) {
        return res.status(400).json({ error: "Patient data is required" });
      }
      
      const recommendations = await generateHealthRecommendations(patientData, currentHealthStatus);
      res.json(recommendations);
    } catch (error) {
      console.error("Health recommendations error:", error);
      res.status(500).json({ error: "Failed to generate health recommendations" });
    }
  });

  // Ambulance arrangement endpoint
  app.post("/api/emergency/ambulance", async (req, res) => {
    try {
      const { latitude, longitude, emergencyType, patientId } = req.body;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: "Location coordinates are required" });
      }

      // Simulate ambulance dispatch
      const ambulanceId = `AMB-${Date.now().toString(36).toUpperCase()}`;
      const eta = Math.floor(Math.random() * 8) + 3; // 3-10 minutes
      
      // In a real implementation, this would:
      // 1. Call emergency services API
      // 2. Notify nearest ambulance
      // 3. Send patient information to emergency services
      // 4. Track ambulance location
      
      const ambulanceData = {
        ambulanceId,
        location: { latitude, longitude },
        emergencyType,
        patientId,
        eta: `${eta} minutes`,
        status: 'dispatched',
        dispatchedAt: new Date().toISOString(),
        estimatedArrival: new Date(Date.now() + eta * 60000).toISOString()
      };

      // Log the emergency dispatch
      if (patientId) {
        await storage.createActivity({
          patientId,
          action: "ambulance_dispatched",
          description: `Emergency ambulance dispatched to coordinates ${latitude}, ${longitude} for ${emergencyType} emergency`
        });
      }

      res.json({
        success: true,
        ambulanceId,
        eta: `${eta} minutes`,
        message: "Ambulance dispatched successfully",
        instructions: [
          "Stay calm and remain at your current location",
          "Keep your phone nearby for emergency calls",
          "If possible, have someone meet the ambulance",
          "Follow any instructions from emergency dispatchers"
        ]
      });
    } catch (error) {
      console.error("Ambulance dispatch error:", error);
      res.status(500).json({ error: "Failed to dispatch ambulance" });
    }
  });

  // Configure multer for file uploads - accept any file type
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    }
  });

  // Document Upload and Storage
  app.post("/api/documents/upload", upload.single('file'), async (req, res) => {
    try {
      const { documentType, patientId } = req.body;
      const file = req.file;
      
      if (!file || !documentType || !patientId) {
        return res.status(400).json({ 
          success: false,
          error: "File, document type, and patient ID are required" 
        });
      }

      // Accept any document type
      if (!documentType) {
        return res.status(400).json({ 
          success: false,
          error: "Document type is required" 
        });
      }

      // Save document to database
      const savedDocument = await storage.createDocument({
        patientId,
        documentType,
        fileName: file.originalname,
        fileSize: file.size,
        fileData: file.buffer,
        mimeType: file.mimetype,
        verificationStatus: 'pending'
      });
      
      // Log the document upload activity
      await storage.createActivity({
        patientId,
        action: "document_uploaded",
        description: `Document uploaded: ${documentType} - ${file.originalname}`
      });

      res.json({
        success: true,
        documentId: savedDocument._id,
        message: "Document uploaded and saved successfully",
        document: {
          id: savedDocument._id,
          type: savedDocument.documentType,
          fileName: savedDocument.fileName,
          uploadedAt: savedDocument.uploadedAt,
          status: savedDocument.verificationStatus,
          fileSize: savedDocument.fileSize
        }
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to upload document" 
      });
    }
  });

  // Get patient documents
  app.get("/api/patients/:patientId/documents", async (req, res) => {
    try {
      const { patientId } = req.params;
      
      const documents = await storage.getPatientDocuments(patientId);
      
      res.json({
        success: true,
        documents: documents.map(doc => ({
          id: doc._id,
          type: doc.documentType,
          fileName: doc.fileName,
          uploadedAt: doc.uploadedAt,
          status: doc.verificationStatus,
          fileSize: doc.fileSize
        }))
      });
    } catch (error) {
      console.error("Error getting patient documents:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to get patient documents" 
      });
    }
  });

  // Simple file upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      const file = req.file;
      const { patientId, documentType } = req.body;
      
      if (!file) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ 
          success: false,
          error: "No file uploaded" 
        });
      }

      // Save document to database
      const savedDocument = await storage.createDocument({
        patientId: patientId || 'unknown',
        documentType: documentType || 'general',
        fileName: file.originalname,
        fileSize: file.size,
        fileData: file.buffer,
        mimeType: file.mimetype,
        verificationStatus: 'pending'
      });

      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        message: "File uploaded successfully",
        documentId: savedDocument._id,
        fileName: file.originalname,
        fileSize: file.size
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.setHeader('Content-Type', 'application/json');
      res.status(500).json({ 
        success: false,
        error: "Failed to upload file" 
      });
    }
  });

  // Test endpoint to verify JSON responses
  app.get("/api/test", (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      message: "API is working correctly",
      timestamp: new Date().toISOString()
    });
  });

  // Error handling middleware for multer errors
  app.use((error: any, req: any, res: any, next: any) => {
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 50MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    next(error);
  });

  // Individual agent endpoints
  app.post("/api/agents/identity", async (req, res) => {
    try {
      const { documentText, documentType } = req.body;
      
      if (!documentText || !documentType) {
        return res.status(400).json({ error: "Document text and type are required" });
      }

      const result = await identityVerifier(documentText, documentType);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Identity verification error:", error);
      res.status(500).json({ error: "Failed to verify identity" });
    }
  });

  app.post("/api/agents/referral", async (req, res) => {
    try {
      const { referralText } = req.body;
      
      if (!referralText) {
        return res.status(400).json({ error: "Referral text is required" });
      }

      const result = await referralParser(referralText);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Referral parsing error:", error);
      res.status(500).json({ error: "Failed to parse referral" });
    }
  });

  app.post("/api/agents/analyze", async (req, res) => {
    try {
      const { documentText, documentType } = req.body;
      
      if (!documentText) {
        return res.status(400).json({ error: "Document text is required" });
      }

      const result = await documentAnalyzer(documentText, documentType);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Document analysis error:", error);
      res.status(500).json({ error: "Failed to analyze document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
