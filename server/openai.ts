import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
});

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

export interface MedicalAdviceResponse {
  advice: string;
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  followUpActions: string[];
}

export interface SymptomAnalysis {
  possibleConditions: string[];
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  shouldSeekCare: boolean;
}

export interface InsuranceGuidance {
  coverageAnalysis: string;
  recommendations: string[];
  estimatedCosts: string;
  nextSteps: string[];
}

/**
 * Analyzes patient symptoms and provides medical guidance
 */
export async function analyzeSymptoms(symptoms: string, patientAge?: number): Promise<SymptomAnalysis> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical AI assistant for a hospital onboarding system. 
          Analyze patient symptoms and provide guidance. Be cautious and always recommend 
          professional medical care when appropriate. Return JSON with:
          - possibleConditions: array of possible conditions
          - urgency: low/medium/high based on symptoms
          - recommendations: array of immediate actions
          - shouldSeekCare: boolean indicating if immediate care is needed`
        },
        {
          role: "user",
          content: `Patient symptoms: ${symptoms}${patientAge ? `\nPatient age: ${patientAge}` : ''}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      possibleConditions: Array.isArray(result.possibleConditions) ? result.possibleConditions : [],
      urgency: ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'low',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      shouldSeekCare: Boolean(result.shouldSeekCare)
    };

  } catch (error) {
    console.error("Symptom analysis failed:", error);
    return {
      possibleConditions: [],
      urgency: 'low',
      recommendations: ["Please consult with a healthcare provider for proper diagnosis"],
      shouldSeekCare: false
    };
  }
}

/**
 * Provides personalized medical advice based on patient data
 */
export async function getMedicalAdvice(
  patientData: any, 
  currentSymptoms?: string
): Promise<MedicalAdviceResponse> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical AI assistant providing personalized health advice. 
          Consider the patient's medical history, medications, and current symptoms.
          Return JSON with:
          - advice: personalized medical advice
          - urgency: low/medium/high
          - recommendations: array of specific recommendations
          - followUpActions: array of follow-up actions`
        },
        {
          role: "user",
          content: `Patient data: ${JSON.stringify(patientData)}
          ${currentSymptoms ? `Current symptoms: ${currentSymptoms}` : ''}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      advice: result.advice || "Please consult with your healthcare provider for personalized medical advice.",
      urgency: ['low', 'medium', 'high'].includes(result.urgency) ? result.urgency : 'low',
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      followUpActions: Array.isArray(result.followUpActions) ? result.followUpActions : []
    };

  } catch (error) {
    console.error("Medical advice generation failed:", error);
    return {
      advice: "Please consult with your healthcare provider for personalized medical advice.",
      urgency: 'low',
      recommendations: ["Schedule a follow-up appointment"],
      followUpActions: ["Contact your primary care physician"]
    };
  }
}

/**
 * Analyzes insurance information and provides guidance
 */
export async function analyzeInsurance(
  insuranceData: any, 
  medicalProcedures?: string[]
): Promise<InsuranceGuidance> {
  try {
    if (!openai.apiKey) {
      throw new Error("OpenAI API key is not configured");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an insurance specialist AI assistant. 
          Analyze insurance coverage and provide guidance on benefits, costs, and next steps.
          Return JSON with:
          - coverageAnalysis: analysis of insurance coverage
          - recommendations: array of insurance recommendations
          - estimatedCosts: estimated costs information
          - nextSteps: array of next steps for insurance matters`
        },
        {
          role: "user",
          content: `Insurance data: ${JSON.stringify(insuranceData)}
          ${medicalProcedures ? `Planned procedures: ${medicalProcedures.join(', ')}` : ''}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      coverageAnalysis: result.coverageAnalysis || "Please contact your insurance provider for detailed coverage information.",
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      estimatedCosts: result.estimatedCosts || "Contact your insurance provider for cost estimates.",
      nextSteps: Array.isArray(result.nextSteps) ? result.nextSteps : ["Contact your insurance provider"]
    };

  } catch (error) {
    console.error("Insurance analysis failed:", error);
    return {
      coverageAnalysis: "Please contact your insurance provider for detailed coverage information.",
      recommendations: ["Contact your insurance provider"],
      estimatedCosts: "Contact your insurance provider for cost estimates.",
      nextSteps: ["Contact your insurance provider"]
    };
  }
}

/**
 * Analyzes patient query for smart form assistance
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

/**
 * Generates personalized health recommendations
 */
export async function generateHealthRecommendations(
  patientData: any,
  currentHealthStatus?: string
): Promise<{
  recommendations: string[];
  lifestyleTips: string[];
  preventiveMeasures: string[];
  priorityLevel: 'low' | 'medium' | 'high';
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
          content: `You are a health AI assistant providing personalized health recommendations.
          Consider the patient's medical history, age, and current health status.
          Return JSON with:
          - recommendations: array of health recommendations
          - lifestyleTips: array of lifestyle improvement tips
          - preventiveMeasures: array of preventive health measures
          - priorityLevel: low/medium/high priority for health improvements`
        },
        {
          role: "user",
          content: `Patient data: ${JSON.stringify(patientData)}
          ${currentHealthStatus ? `Current health status: ${currentHealthStatus}` : ''}`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      lifestyleTips: Array.isArray(result.lifestyleTips) ? result.lifestyleTips : [],
      preventiveMeasures: Array.isArray(result.preventiveMeasures) ? result.preventiveMeasures : [],
      priorityLevel: ['low', 'medium', 'high'].includes(result.priorityLevel) ? result.priorityLevel : 'low'
    };

  } catch (error) {
    console.error("Health recommendations generation failed:", error);
    return {
      recommendations: ["Schedule regular check-ups with your healthcare provider"],
      lifestyleTips: ["Maintain a balanced diet and regular exercise routine"],
      preventiveMeasures: ["Stay up to date with recommended vaccinations"],
      priorityLevel: 'low'
    };
  }
} 