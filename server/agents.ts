// Import dotenv to load environment variables from a .env file during development
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

export interface VerificationResult {
  success: boolean;
  documentType: string;
  confidence: number;
  extractedData: any;
  verificationStatus: 'verified' | 'pending' | 'failed';
  flags: string[];
  recommendations: string[];
}

export interface IdentityVerification {
  documentType: string;
  documentNumber: string;
  name: string;
  dateOfBirth: string;
  address: string;
  validity: boolean;
  inconsistencies: string[];
  verificationScore: number;
}

export interface ReferralData {
  referringHospital: string;
  referringDoctor: string;
  patientName: string;
  diagnosis: string;
  treatmentPlan: string;
  urgency: 'low' | 'medium' | 'high';
  department: string;
  specialInstructions: string;
}

/**
 * Identity Verifier Agent
 */
export async function identityVerifier(documentText: string, documentType: string): Promise<IdentityVerification> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an Identity Verification Agent for a hospital system. 
Analyze the provided document text and extract identity information.
          
For Indian documents:
- Aadhaar: 12-digit number, verify format and checksum
- PAN: 10-character alphanumeric, verify format
- Passport: Check format and validity
- Driver's License: Verify format and details

Return JSON with:
- documentType: type of document
- documentNumber: extracted document number
- name: extracted full name
- dateOfBirth: extracted date of birth
- address: extracted address
- validity: boolean indicating if document appears valid
- inconsistencies: array of any inconsistencies found
- verificationScore: number between 0-100 indicating confidence

Be thorough in checking for inconsistencies and validity.`
        },
        {
          role: "user",
          content: `Document Type: ${documentType}\nDocument Text: ${documentText}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      documentType: result.documentType || documentType,
      documentNumber: result.documentNumber || "",
      name: result.name || "",
      dateOfBirth: result.dateOfBirth || "",
      address: result.address || "",
      validity: Boolean(result.validity),
      inconsistencies: Array.isArray(result.inconsistencies) ? result.inconsistencies : [],
      verificationScore: Math.max(0, Math.min(100, result.verificationScore || 0))
    };

  } catch (error) {
    console.error("Identity verification failed:", error);
    return {
      documentType: documentType,
      documentNumber: "",
      name: "",
      dateOfBirth: "",
      address: "",
      validity: false,
      inconsistencies: ["Verification failed due to technical error"],
      verificationScore: 0
    };
  }
}

/**
 * Referral Parser Agent
 */
export async function referralParser(referralText: string): Promise<ReferralData> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Referral Parser Agent for a hospital system.
Extract key information from hospital referral documents and determine routing.
          
Extract and return JSON with:
- referringHospital: name of referring hospital
- referringDoctor: name of referring doctor
- patientName: patient's full name
- diagnosis: primary diagnosis
- treatmentPlan: recommended treatment plan
- urgency: low/medium/high based on medical context
- department: appropriate department for routing (cardiology, neurology, etc.)
- specialInstructions: any special instructions or notes

Analyze medical terminology and context to determine urgency and department routing.`
        },
        {
          role: "user",
          content: `Referral Document: ${referralText}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      referringHospital: result.referringHospital || "",
      referringDoctor: result.referringDoctor || "",
      patientName: result.patientName || "",
      diagnosis: result.diagnosis || "",
      treatmentPlan: result.treatmentPlan || "",
      urgency: ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'medium',
      department: result.department || "general",
      specialInstructions: result.specialInstructions || ""
    };

  } catch (error) {
    console.error("Referral parsing failed:", error);
    return {
      referringHospital: "",
      referringDoctor: "",
      patientName: "",
      diagnosis: "",
      treatmentPlan: "",
      urgency: 'medium',
      department: "general",
      specialInstructions: ""
    };
  }
}

/**
 * Document Analyzer Agent
 */
export async function documentAnalyzer(documentText: string, documentType?: string): Promise<VerificationResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a Document Analysis Agent for a hospital system.
Analyze any type of document and extract relevant information.
          
Return JSON with:
- success: boolean indicating if analysis was successful
- documentType: detected or specified document type
- confidence: number between 0-100 indicating confidence
- extractedData: object with all extracted information
- verificationStatus: verified/pending/failed
- flags: array of any issues or concerns found
- recommendations: array of recommendations for next steps

Handle various document types: medical records, insurance cards, prescriptions, lab reports, etc.`
        },
        {
          role: "user",
          content: `Document Type: ${documentType || 'unknown'}\nDocument Content: ${documentText}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      success: Boolean(result.success),
      documentType: result.documentType || documentType || 'unknown',
      confidence: Math.max(0, Math.min(100, result.confidence || 0)),
      extractedData: result.extractedData || {},
      verificationStatus: ['verified', 'pending', 'failed'].includes(result.verificationStatus) ? result.verificationStatus : 'pending',
      flags: Array.isArray(result.flags) ? result.flags : [],
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
    };

  } catch (error) {
    console.error("Document analysis failed:", error);
    return {
      success: false,
      documentType: documentType || 'unknown',
      confidence: 0,
      extractedData: {},
      verificationStatus: 'failed',
      flags: ["Document analysis failed due to technical error"],
      recommendations: ["Please try uploading the document again or contact support"]
    };
  }
}

/**
 * Multi-Agent Verification System
 */
export async function multiAgentVerification(
  documentText: string, 
  documentType: string,
  patientData?: any
): Promise<{
  identityVerification: IdentityVerification;
  referralData?: ReferralData;
  documentAnalysis: VerificationResult;
  overallStatus: 'verified' | 'pending' | 'failed';
  summary: string;
}> {

  const [identityResult, documentResult] = await Promise.all([
    identityVerifier(documentText, documentType),
    documentAnalyzer(documentText, documentType)
  ]);

  // Run referral parser if document type suggests it's a referral
  let referralResult: ReferralData | undefined;
  if (
    documentType.toLowerCase().includes('referral') || 
    documentText.toLowerCase().includes('referral') ||
    documentText.toLowerCase().includes('referring')
  ) {
    referralResult = await referralParser(documentText);
  }

  // Determine overall status
  const identityScore = identityResult.verificationScore;
  const documentScore = documentResult.confidence;
  const hasInconsistencies = identityResult.inconsistencies.length > 0;
  const hasFlags = documentResult.flags.length > 0;

  let overallStatus: 'verified' | 'pending' | 'failed';
  if (identityScore >= 80 && documentScore >= 80 && !hasInconsistencies && !hasFlags) {
    overallStatus = 'verified';
  } else if (identityScore >= 60 && documentScore >= 60) {
    overallStatus = 'pending';
  } else {
    overallStatus = 'failed';
  }

  // Generate a human-readable summary
  const summary = generateVerificationSummary(
    identityResult,
    documentResult,
    referralResult,
    overallStatus
  );

  return {
    identityVerification: identityResult,
    referralData: referralResult,
    documentAnalysis: documentResult,
    overallStatus,
    summary
  };
}

// Helper: Generate a human-readable summary
function generateVerificationSummary(
  identity: IdentityVerification,
  document: VerificationResult,
  referral?: ReferralData,
  status: string
): string {
  const parts = [];
  parts.push(`Document Type: ${identity.documentType}`);
  parts.push(`Identity Verification Score: ${identity.verificationScore}%`);
  parts.push(`Document Analysis Confidence: ${document.confidence}%`);

  if (identity.inconsistencies.length > 0) {
    parts.push(`Issues Found: ${identity.inconsistencies.join(', ')}`);
  }

  if (document.flags.length > 0) {
    parts.push(`Document Flags: ${document.flags.join(', ')}`);
  }

  if (referral) {
    parts.push(`Referral Department: ${referral.department}`);
    parts.push(`Urgency Level: ${referral.urgency}`);
  }

  parts.push(`Overall Status: ${status.toUpperCase()}`);
  return parts.join(' | ');
}