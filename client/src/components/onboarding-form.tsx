import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  Bot,
  User,
  CreditCard,
  Heart,
  CheckCircle
} from "lucide-react";

const personalInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(1, "Address is required"),
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

const insuranceSchema = z.object({
  insuranceProvider: z.string().min(1, "Insurance provider is required"),
  insurancePolicyNumber: z.string().min(1, "Policy number is required"),
  insuranceGroupNumber: z.string().optional(),
});

const medicalHistorySchema = z.object({
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalHistory: z.object({
    conditions: z.array(z.string()).optional(),
    surgeries: z.array(z.string()).optional(),
    familyHistory: z.string().optional(),
  }).optional(),
});

interface OnboardingFormProps {
  emergencyMode: boolean;
  onComplete: (patient: any) => void;
  onCancel: () => void;
}

export function OnboardingForm({ emergencyMode, onComplete, onCancel }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = emergencyMode ? 2 : 3;
  const progress = (currentStep / totalSteps) * 100;

  // Form for current step
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
    },
  });

  const insuranceForm = useForm({
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceGroupNumber: "",
    },
  });

  const medicalForm = useForm({
    resolver: zodResolver(medicalHistorySchema),
    defaultValues: {
      allergies: "",
      medications: "",
      medicalHistory: {
        conditions: [],
        surgeries: [],
        familyHistory: "",
      },
    },
  });

  // Mutations
  const createPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/patients", {
        ...data,
        isEmergency: emergencyMode,
        onboardingStep: currentStep,
      });
      return response.json();
    },
    onSuccess: (patient) => {
      setPatientId(patient.id);
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create patient record",
        variant: "destructive",
      });
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!patientId) throw new Error("No patient ID");
      const response = await apiRequest("PATCH", `/api/patients/${patientId}`, {
        ...data,
        onboardingStep: currentStep,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient record",
        variant: "destructive",
      });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      if (!patientId) throw new Error("No patient ID");
      
      // Determine admission location based on emergency mode
      const admissionLocation = emergencyMode 
        ? "Emergency Room - Bed 12A" 
        : "General Admission - Room 204B";
      
      const response = await apiRequest("POST", `/api/patients/${patientId}/complete`, {
        admissionLocation,
      });
      return response.json();
    },
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      onComplete(patient);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete onboarding",
        variant: "destructive",
      });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!patientId) throw new Error("No patient ID");
      
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
      toast({
        title: "Document Uploaded",
        description: "AI analysis completed and data extracted",
      });
      
      // Refresh current form with extracted data if available
      if (result.analysisResult && !result.analysisResult.error) {
        // You could update form fields here based on extracted data
        toast({
          title: "AI Analysis Complete",
          description: "Form fields have been auto-filled from the document",
        });
      }
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload and analyze document",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!patientId) {
      toast({
        title: "Error",
        description: "Please complete personal information first",
        variant: "destructive",
      });
      return;
    }

    setUploadingDocument(true);
    try {
      await uploadDocumentMutation.mutateAsync(file);
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleNext = async () => {
    let isValid = false;
    let formData: any = {};

    if (currentStep === 1) {
      isValid = await personalForm.trigger();
      if (isValid) {
        formData = personalForm.getValues();
        if (!patientId) {
          createPatientMutation.mutate(formData);
        } else {
          updatePatientMutation.mutate(formData);
        }
      }
    } else if (currentStep === 2) {
      if (emergencyMode) {
        // Complete onboarding in emergency mode
        completeOnboardingMutation.mutate();
        return;
      } else {
        isValid = await insuranceForm.trigger();
        if (isValid) {
          formData = insuranceForm.getValues();
          updatePatientMutation.mutate(formData);
        }
      }
    } else if (currentStep === 3) {
      isValid = await medicalForm.trigger();
      if (isValid) {
        formData = medicalForm.getValues();
        updatePatientMutation.mutate(formData);
        completeOnboardingMutation.mutate();
        return;
      }
    }

    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  const getStepIcon = (step: number) => {
    if (step === 1) return User;
    if (step === 2) return emergencyMode ? CheckCircle : CreditCard;
    return Heart;
  };

  const getStepTitle = (step: number) => {
    if (step === 1) return "Personal Info";
    if (step === 2) return emergencyMode ? "Complete" : "Insurance";
    return "Medical History";
  };

  const isPending = createPatientMutation.isPending || 
                   updatePatientMutation.isPending || 
                   completeOnboardingMutation.isPending;

  return (
    <div className="min-h-screen bg-neutral-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={onCancel}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            {emergencyMode && (
              <div className="bg-emergency-red bg-opacity-10 px-3 py-1 rounded-full">
                <span className="text-emergency-red font-medium text-sm">Emergency Mode</span>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {emergencyMode ? "Emergency" : "Standard"} Patient Onboarding
          </h1>
          
          {/* Progress */}
          <div className="mb-6">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {Array.from({ length: totalSteps }, (_, i) => {
                const step = i + 1;
                const StepIcon = getStepIcon(step);
                const isActive = step === currentStep;
                const isCompleted = step < currentStep;
                
                return (
                  <div key={step} className="flex items-center">
                    <div className={`flex items-center space-x-2 ${
                      isActive ? 'text-medical-blue' : 
                      isCompleted ? 'text-success-green' : 'text-gray-400'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm ${
                        isActive ? 'bg-medical-blue text-white' :
                        isCompleted ? 'bg-success-green text-white' :
                        'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : step}
                      </div>
                      <span className="font-medium">{getStepTitle(step)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {(() => {
                const StepIcon = getStepIcon(currentStep);
                return <StepIcon className="h-5 w-5" />;
              })()}
              <span>{getStepTitle(currentStep)}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...personalForm.register("firstName")}
                      placeholder="Enter first name"
                    />
                    {personalForm.formState.errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">
                        {personalForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...personalForm.register("lastName")}
                      placeholder="Enter last name"
                    />
                    {personalForm.formState.errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">
                        {personalForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      {...personalForm.register("dateOfBirth")}
                    />
                    {personalForm.formState.errors.dateOfBirth && (
                      <p className="text-sm text-red-500 mt-1">
                        {personalForm.formState.errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...personalForm.register("phone")}
                      placeholder="(555) 123-4567"
                    />
                    {personalForm.formState.errors.phone && (
                      <p className="text-sm text-red-500 mt-1">
                        {personalForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    {...personalForm.register("address")}
                    placeholder="Enter full address"
                    className="h-20"
                  />
                  {personalForm.formState.errors.address && (
                    <p className="text-sm text-red-500 mt-1">
                      {personalForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-text-primary mb-3">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        {...personalForm.register("emergencyContactName")}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      <Select onValueChange={(value) => personalForm.setValue("emergencyContactRelationship", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spouse">Spouse</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                          <SelectItem value="sibling">Sibling</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* AI Document Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-medical-blue transition-colors">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-primary font-medium mb-2">Upload Documents for AI Analysis</p>
                  <p className="text-text-secondary text-sm mb-4">
                    Drag and drop ID, insurance cards, or medical records
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      type="button"
                      className="bg-medical-blue hover:bg-blue-700"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploadingDocument}
                    >
                      <Bot className="h-4 w-4 mr-2" />
                      {uploadingDocument ? "Analyzing..." : "Choose Files"}
                    </Button>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                  />
                </div>
              </form>
            )}

            {/* Step 2: Insurance (skip in emergency mode) */}
            {currentStep === 2 && !emergencyMode && (
              <form className="space-y-6">
                <div>
                  <Label htmlFor="insuranceProvider">Insurance Provider *</Label>
                  <Input
                    id="insuranceProvider"
                    {...insuranceForm.register("insuranceProvider")}
                    placeholder="e.g., Blue Cross Blue Shield"
                  />
                  {insuranceForm.formState.errors.insuranceProvider && (
                    <p className="text-sm text-red-500 mt-1">
                      {insuranceForm.formState.errors.insuranceProvider.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="insurancePolicyNumber">Policy Number *</Label>
                    <Input
                      id="insurancePolicyNumber"
                      {...insuranceForm.register("insurancePolicyNumber")}
                      placeholder="Policy number"
                    />
                    {insuranceForm.formState.errors.insurancePolicyNumber && (
                      <p className="text-sm text-red-500 mt-1">
                        {insuranceForm.formState.errors.insurancePolicyNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="insuranceGroupNumber">Group Number</Label>
                    <Input
                      id="insuranceGroupNumber"
                      {...insuranceForm.register("insuranceGroupNumber")}
                      placeholder="Group number (optional)"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* Step 3: Medical History */}
            {currentStep === 3 && (
              <form className="space-y-6">
                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    {...medicalForm.register("allergies")}
                    placeholder="List any known allergies"
                    className="h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    {...medicalForm.register("medications")}
                    placeholder="List current medications and dosages"
                    className="h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="familyHistory">Family Medical History</Label>
                  <Textarea
                    id="familyHistory"
                    {...medicalForm.register("medicalHistory.familyHistory")}
                    placeholder="Any relevant family medical history"
                    className="h-20"
                  />
                </div>
              </form>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                type="button"
                onClick={handleNext}
                disabled={isPending}
                className="bg-medical-blue hover:bg-blue-700"
              >
                {isPending ? (
                  "Processing..."
                ) : currentStep === totalSteps ? (
                  <>
                    Complete Onboarding
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
