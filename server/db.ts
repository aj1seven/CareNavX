import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://cherancaiml2023:aj1seven@cluster0.ua0zm4f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Patient Schema
const patientSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  emergencyContactName: { type: String },
  emergencyContactRelationship: { type: String },
  emergencyContactPhone: { type: String },
  insuranceProvider: { type: String },
  insurancePolicyNumber: { type: String },
  insuranceGroupNumber: { type: String },
  insuranceStatus: { type: String, default: 'pending' },
  medicalHistory: { type: mongoose.Schema.Types.Mixed },
  allergies: { type: String },
  medications: { type: String },
  onboardingStep: { type: Number, default: 1 },
  isCompleted: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false },
  admissionLocation: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});



// Activity Schema
const activitySchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  action: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'staff' }
});

// Create models
export const Patient = mongoose.model('Patient', patientSchema);
export const Activity = mongoose.model('Activity', activitySchema);
export const User = mongoose.model('User', userSchema);

const documentSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  documentType: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileData: { type: Buffer, required: true },
  mimeType: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  verificationStatus: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
  notes: { type: String }
});

export const Document = mongoose.model("Document", documentSchema);

// Connect to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Export types for TypeScript
export interface IPatient {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  address: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  insuranceStatus?: string;
  medicalHistory?: any;
  allergies?: string;
  medications?: string;
  onboardingStep: number;
  isCompleted: boolean;
  isEmergency: boolean;
  admissionLocation?: string;
  createdAt: Date;
  updatedAt: Date;
}



export interface IActivity {
  _id: string;
  patientId: string;
  action: string;
  description: string;
  createdAt: Date;
}

export interface IUser {
  _id: string;
  username: string;
  password: string;
  name: string;
  role: string;
}

export interface IDocument {
  _id: string;
  patientId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  fileData: Buffer;
  mimeType: string;
  uploadedAt: Date;
  verificationStatus: 'pending' | 'verified' | 'failed';
  notes?: string;
}
