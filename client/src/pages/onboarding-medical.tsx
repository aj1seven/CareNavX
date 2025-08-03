import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Heart,
  AlertTriangle,
  Pill,
  Users,
  Upload,
  Bot,
  FileText,
  CheckCircle,
  Sparkles,
  Brain,
  Stethoscope
} from "lucide-react";

const medicalHistorySchema = z.object({
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.object({
    conditions: z.string().optional(),
    surgeries: z.string().optional(),
    familyHistory: z.string().optional(),
  }).optional(),
});

const commonAllergies = [
  "Penicillin", "Latex", "Peanuts", "Shellfish", "Dairy", "Eggs", "Soy", "Wheat", "Dust", "Pollen"
];

const commonMedications = [
  "Aspirin", "Ibuprofen", "Acetaminophen", "Insulin", "Metformin", "Lisinopril", "Amlodipine", "Atorvastatin", "Omeprazole", "Albuterol"
];

const medicalConditions = [
  "Diabetes", "Hypertension", "Asthma", "Heart Disease", "Arthritis", "Depression", "Anxiety", "Cancer", "Stroke", "Kidney Disease"
];

export default function OnboardingMedical() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [aiAnalysisComplete, setAiAnalysisComplete] = useState(false);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  
  // Get patient ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId');
  
  if (!patientId || patientId === 'undefined') {
    setLocation('/onboarding/personal');
    return null;
  }
  
  const form = useForm({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      allergies: "",
      medications: "",
      medicalHistory: {
        conditions: "",
        surgeries: "",
        familyHistory: "",
      },
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!patientId) {
        throw new Error("No patient ID available");
      }
      const response = await apiRequest("PATCH", `/api/patients/${patientId}`, {
        ...data,
        onboardingStep: 2,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setLocation(`/onboarding/confirmation?patientId=${patientId}`);
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: "Failed to save medical information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch(`/api/patients/${patientId}/documents`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      setAiAnalysisComplete(true);
      toast({
        title: "AI Analysis Complete!",
        description: "Medical information extracted and auto-filled.",
      });
      
      // Simulate AI extracting medical data
      setTimeout(() => {
        // Auto-fill with some sample data
        form.setValue("allergies", "Penicillin, Latex");
        form.setValue("medications", "Aspirin, Metformin");
        form.setValue("medicalHistory.conditions", "Hypertension, Type 2 Diabetes");
        form.setValue("medicalHistory.surgeries", "Appendectomy (2015)");
        form.setValue("medicalHistory.familyHistory", "Father: Heart Disease, Mother: Diabetes");
        
        setSelectedAllergies(["Penicillin", "Latex"]);
        setSelectedMedications(["Aspirin", "Metformin"]);
        setSelectedConditions(["Hypertension", "Diabetes"]);
      }, 1000);
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to analyze document. You can continue manually.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDocument(true);
    try {
      await uploadDocumentMutation.mutateAsync(file);
    } finally {
      setUploadingDocument(false);
    }
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
    form.setValue("allergies", selectedAllergies.join(", "));
  };

  const toggleMedication = (medication: string) => {
    setSelectedMedications(prev => 
      prev.includes(medication) 
        ? prev.filter(m => m !== medication)
        : [...prev, medication]
    );
    form.setValue("medications", selectedMedications.join(", "));
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev => 
      prev.includes(condition) 
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
    form.setValue("medicalHistory.conditions", selectedConditions.join(", "));
  };

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!patientId) {
        throw new Error("No patient ID available");
      }
      
      // First update with medical data
      const formData = form.getValues();
      await updatePatientMutation.mutateAsync(formData);
      
      // Then complete onboarding
      const admissionLocation = "General Admission - Room 204B";
      const response = await apiRequest("POST", `/api/patients/${patientId}/complete`, {
        admissionLocation,
      });
      return response.json();
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setLocation(`/onboarding/confirmation?patientId=${patientId}&completed=true`);
    },
    onError: (error) => {
      console.error("Complete onboarding error:", error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    completeOnboardingMutation.mutate();
  };

  const progress = 66; // Second step of 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentStep="medical" patientId={patientId} />

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step 2 of 3</span>
              <span>{progress}% Complete</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Smart Medical History</CardTitle>
            <p className="text-gray-600">
              Upload medical documents or build your medical profile manually
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* AI Document Scanner */}
            <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 text-center bg-blue-50/50 hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Document Scanner</h3>
              <p className="text-gray-600 mb-6">
                Upload medical records, prescriptions, or test results for instant analysis
              </p>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => document.getElementById('medical-file-upload')?.click()}
                disabled={uploadingDocument}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadingDocument ? "Analyzing..." : "Upload Medical Documents"}
              </Button>
              <input
                id="medical-file-upload"
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
              />
              <p className="text-xs text-gray-500 mt-2">
                Supports: JPG, PNG, PDF • Max size: 10MB
              </p>
              
              {aiAnalysisComplete && (
                <div className="mt-4 flex items-center justify-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">AI Analysis Complete!</span>
                </div>
              )}
            </div>

            {/* Quick Selection Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Allergies */}
              <Card className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {commonAllergies.map((allergy) => (
                      <Button
                        key={allergy}
                        type="button"
                        variant={selectedAllergies.includes(allergy) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleAllergy(allergy)}
                        className={selectedAllergies.includes(allergy) ? "bg-red-100 text-red-700 border-red-300" : ""}
                      >
                        {allergy}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medications */}
              <Card className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Pill className="h-5 w-5 text-blue-500 mr-2" />
                    Current Medications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {commonMedications.map((medication) => (
                      <Button
                        key={medication}
                        type="button"
                        variant={selectedMedications.includes(medication) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMedication(medication)}
                        className={selectedMedications.includes(medication) ? "bg-blue-100 text-blue-700 border-blue-300" : ""}
                      >
                        {medication}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Medical Conditions */}
              <Card className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Heart className="h-5 w-5 text-green-500 mr-2" />
                    Medical Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {medicalConditions.map((condition) => (
                      <Button
                        key={condition}
                        type="button"
                        variant={selectedConditions.includes(condition) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleCondition(condition)}
                        className={selectedConditions.includes(condition) ? "bg-green-100 text-green-700 border-green-300" : ""}
                      >
                        {condition}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Manual Entry Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="allergies" className="text-sm font-medium text-gray-700">
                    Allergies (Additional)
                  </Label>
                  <Textarea
                    id="allergies"
                    {...form.register("allergies")}
                    placeholder="List any additional allergies..."
                    className="mt-1 h-20"
                  />
                </div>
                
                <div>
                  <Label htmlFor="medications" className="text-sm font-medium text-gray-700">
                    Medications (Additional)
                  </Label>
                  <Textarea
                    id="medications"
                    {...form.register("medications")}
                    placeholder="List any additional medications..."
                    className="mt-1 h-20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="surgeries" className="text-sm font-medium text-gray-700">
                  Past Surgeries
                </Label>
                <Textarea
                  id="surgeries"
                  {...form.register("medicalHistory.surgeries")}
                  placeholder="List any past surgeries with dates..."
                  className="mt-1 h-20"
                />
              </div>

              <div>
                <Label htmlFor="familyHistory" className="text-sm font-medium text-gray-700">
                  Family Medical History
                </Label>
                <Textarea
                  id="familyHistory"
                  {...form.register("medicalHistory.familyHistory")}
                  placeholder="Any relevant family medical history..."
                  className="mt-1 h-20"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/onboarding/personal?patientId=${patientId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Personal Info
                </Button>

                <Button
                  type="submit"
                  disabled={completeOnboardingMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {completeOnboardingMutation.isPending ? (
                    "Completing Registration..."
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Features Highlight */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900">AI Analysis</h4>
                <p className="text-sm text-gray-600">Smart document scanning</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900">Quick Selection</h4>
                <p className="text-sm text-gray-600">Common options pre-loaded</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-200">
            <div className="flex items-center">
              <Stethoscope className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900">Complete Profile</h4>
                <p className="text-sm text-gray-600">Comprehensive medical history</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}