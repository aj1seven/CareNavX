import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface DocumentAnalysisResult {
  extractedText: string;
  documentType: string;
  confidence: number;
  error?: string;
}

export interface PatientDataExtraction {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
  allergies?: string;
  medications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
}

/**
 * Analyzes a document image using OpenAI's vision capabilities
 * @param base64Image - Base64 encoded image data
 * @param mimeType - MIME type of the image
 * @returns Analysis result with extracted text and metadata
 */
export async function analyzeDocument(
  base64Image: string, 
  mimeType: string
): Promise<DocumentAnalysisResult> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    // Validate image format
    if (!mimeType.startsWith('image/')) {
      throw new Error("Only image files are supported for document analysis");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical document analysis expert. Analyze the provided document image and extract all text content. 
          Identify the document type (ID card, insurance card, medical record, etc.) and provide a confidence score.
          Focus on extracting personal information, insurance details, and medical information clearly and accurately.
          Return the result in JSON format with the following structure:
          {
            "extractedText": "all text found in the document",
            "documentType": "type of document (id_card, insurance_card, medical_record, driver_license, etc.)",
            "confidence": "confidence score between 0 and 1"
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this medical/identification document and extract all readable text, identifying the document type and your confidence in the extraction."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      extractedText: result.extractedText || "",
      documentType: result.documentType || "unknown",
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };

  } catch (error) {
    console.error("Document analysis failed:", error);
    return {
      extractedText: "",
      documentType: "unknown",
      confidence: 0,
      error: error instanceof Error ? error.message : "Document analysis failed"
    };
  }
}

/**
 * Extracts structured patient data from analyzed document text
 * @param extractedText - Text extracted from document analysis
 * @returns Structured patient data that can be used to auto-fill forms
 */
export async function extractPatientData(extractedText: string): Promise<PatientDataExtraction> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return {};
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical data extraction specialist. Extract structured patient information from the provided document text.
          Focus on identifying and extracting the following fields when available:
          - Personal Information: firstName, lastName, dateOfBirth, phone, address
          - Insurance Information: insuranceProvider, insurancePolicyNumber, insuranceGroupNumber
          - Medical Information: allergies, medications
          - Emergency Contact: emergencyContactName, emergencyContactPhone, emergencyContactRelationship
          
          Rules:
          1. Only extract information that is clearly present in the text
          2. Format dates as YYYY-MM-DD when possible
          3. Clean up phone numbers to standard format
          4. Do not guess or infer information that isn't explicitly stated
          5. Return empty object if no relevant information is found
          
          Return the result in JSON format with only the available fields.`
        },
        {
          role: "user",
          content: `Extract patient information from this document text: ${extractedText}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Clean and validate extracted data
    const cleanedData: PatientDataExtraction = {};
    
    // Personal information
    if (result.firstName && typeof result.firstName === 'string') {
      cleanedData.firstName = result.firstName.trim();
    }
    if (result.lastName && typeof result.lastName === 'string') {
      cleanedData.lastName = result.lastName.trim();
    }
    if (result.dateOfBirth && typeof result.dateOfBirth === 'string') {
      cleanedData.dateOfBirth = result.dateOfBirth.trim();
    }
    if (result.phone && typeof result.phone === 'string') {
      cleanedData.phone = result.phone.trim();
    }
    if (result.address && typeof result.address === 'string') {
      cleanedData.address = result.address.trim();
    }
    
    // Insurance information
    if (result.insuranceProvider && typeof result.insuranceProvider === 'string') {
      cleanedData.insuranceProvider = result.insuranceProvider.trim();
    }
    if (result.insurancePolicyNumber && typeof result.insurancePolicyNumber === 'string') {
      cleanedData.insurancePolicyNumber = result.insurancePolicyNumber.trim();
    }
    if (result.insuranceGroupNumber && typeof result.insuranceGroupNumber === 'string') {
      cleanedData.insuranceGroupNumber = result.insuranceGroupNumber.trim();
    }
    
    // Medical information
    if (result.allergies && typeof result.allergies === 'string') {
      cleanedData.allergies = result.allergies.trim();
    }
    if (result.medications && typeof result.medications === 'string') {
      cleanedData.medications = result.medications.trim();
    }
    
    // Emergency contact
    if (result.emergencyContactName && typeof result.emergencyContactName === 'string') {
      cleanedData.emergencyContactName = result.emergencyContactName.trim();
    }
    if (result.emergencyContactPhone && typeof result.emergencyContactPhone === 'string') {
      cleanedData.emergencyContactPhone = result.emergencyContactPhone.trim();
    }
    if (result.emergencyContactRelationship && typeof result.emergencyContactRelationship === 'string') {
      cleanedData.emergencyContactRelationship = result.emergencyContactRelationship.trim();
    }
    
    return cleanedData;

  } catch (error) {
    console.error("Patient data extraction failed:", error);
    return {};
  }
}

/**
 * Analyzes patient query text for smart form assistance
 * @param queryText - Natural language query from patient or staff
 * @returns Structured response with suggestions and actions
 */
export async function analyzePatientQuery(queryText: string): Promise<{
  intent: string;
  suggestions: string[];
  urgency: 'low' | 'medium' | 'high';
  response: string;
}> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a healthcare assistant AI for a hospital onboarding system. 
          Analyze patient queries and provide helpful responses with appropriate urgency levels.
          
          Return JSON with:
          - intent: main purpose of the query
          - suggestions: array of helpful suggestions
          - urgency: low/medium/high based on medical context
          - response: helpful response text
          
          Consider medical urgency, hospital procedures, and patient comfort.`
        },
        {
          role: "user",
          content: queryText
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      intent: result.intent || "general_inquiry",
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      urgency: ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'low',
      response: result.response || "I'm here to help with your hospital onboarding process."
    };

  } catch (error) {
    console.error("Query analysis failed:", error);
    return {
      intent: "error",
      suggestions: [],
      urgency: 'low',
      response: "I'm sorry, I'm having trouble processing your request right now. Please speak with a staff member for assistance."
    };
  }
}
