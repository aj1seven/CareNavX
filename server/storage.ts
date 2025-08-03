import { 
  Patient, 
  Activity, 
  User,
  Document,
  type IPatient, 
  type IActivity,
  type IUser,
  type IDocument
} from "./db";

export interface IStorage {
  // Patient operations
  getPatient(id: string): Promise<IPatient | undefined>;
  getAllPatients(): Promise<IPatient[]>;
  createPatient(patient: Partial<IPatient>): Promise<IPatient>;
  updatePatient(id: string, updates: Partial<IPatient>): Promise<IPatient | undefined>;
  completeOnboarding(id: string, admissionLocation: string): Promise<IPatient | undefined>;
  
  // Activity operations
  createActivity(activity: Partial<IActivity>): Promise<IActivity>;
  getRecentActivities(limit?: number): Promise<IActivity[]>;
  
  // Document operations
  createDocument(document: Partial<IDocument>): Promise<IDocument>;
  getPatientDocuments(patientId: string): Promise<IDocument[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalPatients: number;
    completedToday: number;
    inProgress: number;
    averageTime: number;
  }>;
  
  // User operations
  getUser(id: string): Promise<IUser | undefined>;
  getUserByUsername(username: string): Promise<IUser | undefined>;
  createUser(user: Partial<IUser>): Promise<IUser>;
}

export class MongoDBStorage implements IStorage {
  async getPatient(id: string): Promise<IPatient | undefined> {
    try {
      const patient = await Patient.findById(id);
      return patient ? patient.toObject() as unknown as IPatient : undefined;
    } catch (error) {
      console.error('Error getting patient:', error);
      return undefined;
    }
  }

  async getAllPatients(): Promise<IPatient[]> {
    try {
      const patients = await Patient.find().sort({ createdAt: -1 });
      return patients.map(patient => patient.toObject() as unknown as IPatient);
    } catch (error) {
      console.error('Error getting all patients:', error);
      return [];
    }
  }

  async createPatient(insertPatient: Partial<IPatient>): Promise<IPatient> {
    try {
      const patient = new Patient({
        ...insertPatient,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      const savedPatient = await patient.save();
      return savedPatient.toObject() as unknown as IPatient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }

  async updatePatient(id: string, updates: Partial<IPatient>): Promise<IPatient | undefined> {
    try {
      const patient = await Patient.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: new Date() },
        { new: true }
      );
      return patient ? patient.toObject() as unknown as IPatient : undefined;
    } catch (error) {
      console.error('Error updating patient:', error);
      return undefined;
    }
  }

  async completeOnboarding(id: string, admissionLocation: string): Promise<IPatient | undefined> {
    try {
      const patient = await Patient.findByIdAndUpdate(
        id,
        { 
          isCompleted: true, 
          admissionLocation,
          updatedAt: new Date() 
        },
        { new: true }
      );
      return patient ? patient.toObject() as unknown as IPatient : undefined;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return undefined;
    }
  }



  async createActivity(insertActivity: Partial<IActivity>): Promise<IActivity> {
    try {
      const activity = new Activity({
        ...insertActivity,
        createdAt: new Date()
      });
      const savedActivity = await activity.save();
      return savedActivity.toObject() as unknown as IActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async getRecentActivities(limit: number = 10): Promise<IActivity[]> {
    try {
      const activities = await Activity.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('patientId', 'firstName lastName');
      return activities.map(activity => activity.toObject() as unknown as IActivity);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  async getDashboardStats(): Promise<{
    totalPatients: number;
    completedToday: number;
    inProgress: number;
    averageTime: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const totalPatients = await Patient.countDocuments();
      const completedToday = await Patient.countDocuments({
        isCompleted: true,
        updatedAt: { $gte: today }
      });
      const inProgress = await Patient.countDocuments({
        isCompleted: false,
        onboardingStep: { $gt: 0 }
      });
      
      // Calculate average time (simplified - just return 8 minutes for now)
      const averageTime = 8;

      return {
        totalPatients,
        completedToday,
        inProgress,
        averageTime
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalPatients: 0,
        completedToday: 0,
        inProgress: 0,
        averageTime: 8
      };
    }
  }

  async getUser(id: string): Promise<IUser | undefined> {
    try {
      const user = await User.findById(id);
      return user ? user.toObject() as unknown as IUser : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    try {
      const user = await User.findOne({ username });
      return user ? user.toObject() as unknown as IUser : undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: Partial<IUser>): Promise<IUser> {
    try {
      const user = new User(insertUser);
      const savedUser = await user.save();
      return savedUser.toObject() as unknown as IUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Document operations
  async createDocument(insertDocument: Partial<IDocument>): Promise<IDocument> {
    try {
      const document = new Document({
        ...insertDocument,
        uploadedAt: new Date()
      });
      const savedDocument = await document.save();
      return savedDocument.toObject() as unknown as IDocument;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  async getPatientDocuments(patientId: string): Promise<IDocument[]> {
    try {
      const documents = await Document.find({ patientId }).sort({ uploadedAt: -1 });
      return documents.map(document => document.toObject() as unknown as IDocument);
    } catch (error) {
      console.error('Error getting patient documents:', error);
      return [];
    }
  }
}

export const storage = new MongoDBStorage();
