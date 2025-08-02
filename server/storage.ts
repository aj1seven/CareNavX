import { 
  type Patient, 
  type InsertPatient, 
  type Document, 
  type InsertDocument,
  type Activity,
  type InsertActivity,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Patient operations
  getPatient(id: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | undefined>;
  completeOnboarding(id: string, admissionLocation: string): Promise<Patient | undefined>;
  
  // Document operations
  createDocument(document: InsertDocument): Promise<Document>;
  getPatientDocuments(patientId: string): Promise<Document[]>;
  
  // Activity operations
  createActivity(activity: InsertActivity): Promise<Activity>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    patientsToday: number;
    pendingOnboarding: number;
    emergencyCases: number;
    completedOnboarding: number;
  }>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private patients: Map<string, Patient> = new Map();
  private documents: Map<string, Document> = new Map();
  private activities: Map<string, Activity> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    // Initialize with sample staff user
    const sampleUser: User = {
      id: randomUUID(),
      username: "dr.johnson",
      password: "password123",
      name: "Dr. Sarah Johnson",
      role: "doctor"
    };
    this.users.set(sampleUser.id, sampleUser);
  }

  async getPatient(id: string): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = randomUUID();
    const now = new Date();
    const patient: Patient = { 
      ...insertPatient, 
      id,
      emergencyContactName: insertPatient.emergencyContactName || null,
      emergencyContactRelationship: insertPatient.emergencyContactRelationship || null,
      emergencyContactPhone: insertPatient.emergencyContactPhone || null,
      insuranceProvider: insertPatient.insuranceProvider || null,
      insurancePolicyNumber: insertPatient.insurancePolicyNumber || null,
      insuranceGroupNumber: insertPatient.insuranceGroupNumber || null,
      insuranceStatus: insertPatient.insuranceStatus || null,
      allergies: insertPatient.allergies || null,
      medications: insertPatient.medications || null,
      admissionLocation: insertPatient.admissionLocation || null,
      createdAt: now,
      updatedAt: now
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient: Patient = {
      ...patient,
      ...updates,
      updatedAt: new Date()
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async completeOnboarding(id: string, admissionLocation: string): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;
    
    const updatedPatient: Patient = {
      ...patient,
      isCompleted: true,
      admissionLocation,
      updatedAt: new Date()
    };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = randomUUID();
    const now = new Date();
    const document: Document = { 
      ...insertDocument, 
      id,
      patientId: insertDocument.patientId || null,
      analysisResult: insertDocument.analysisResult || null,
      createdAt: now
    };
    this.documents.set(id, document);
    return document;
  }

  async getPatientDocuments(patientId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.patientId === patientId);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const now = new Date();
    const activity: Activity = { 
      ...insertActivity, 
      id,
      patientId: insertActivity.patientId || null,
      createdAt: now
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime())
      .slice(0, limit);
  }

  async getDashboardStats(): Promise<{
    patientsToday: number;
    pendingOnboarding: number;
    emergencyCases: number;
    completedOnboarding: number;
  }> {
    const patients = Array.from(this.patients.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const patientsToday = patients.filter(p => 
      p.createdAt && p.createdAt >= today
    ).length;
    
    const pendingOnboarding = patients.filter(p => !p.isCompleted).length;
    const emergencyCases = patients.filter(p => p.isEmergency).length;
    const completedOnboarding = patients.filter(p => p.isCompleted).length;

    return {
      patientsToday,
      pendingOnboarding,
      emergencyCases,
      completedOnboarding
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, role: insertUser.role || null };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
