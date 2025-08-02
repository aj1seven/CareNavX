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
  Users
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

export default function OnboardingMedical() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get patient ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId');
  
  if (!patientId) {
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
      const response = await apiRequest("PATCH", `/api/patients/${patientId}`, {
        ...data,
        onboardingStep: 3,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setLocation(`/onboarding/confirmation?patientId=${patientId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save medical information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
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
    onError: () => {
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

  const progress = 75; // Third step

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentStep="medical" patientId={patientId} />

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step 3 of 4</span>
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
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Medical History</CardTitle>
            <p className="text-gray-600">
              Share relevant medical information to help us provide the best care possible
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Privacy Notice */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Heart className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Your Privacy is Protected</h3>
                  <p className="text-sm text-blue-800">
                    All medical information is encrypted and stored securely according to HIPAA regulations. 
                    This information helps our medical team provide you with safe, effective care.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Allergies Section */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <h3 className="font-semibold text-yellow-900">Allergies & Adverse Reactions</h3>
                </div>
                <Label htmlFor="allergies" className="text-sm font-medium text-gray-700">
                  Please list any known allergies (medications, foods, environmental)
                </Label>
                <Textarea
                  id="allergies"
                  {...form.register("allergies")}
                  placeholder="Example: Penicillin (rash), Peanuts (severe reaction), Latex (skin irritation)..."
                  className="mt-2 h-24 bg-white"
                />
                <p className="text-xs text-yellow-700 mt-2">
                  ⚠️ This is critical safety information. Please be as specific as possible about reactions.
                </p>
              </div>

              {/* Current Medications */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <Pill className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-900">Current Medications</h3>
                </div>
                <Label htmlFor="medications" className="text-sm font-medium text-gray-700">
                  List all medications you're currently taking (including vitamins and supplements)
                </Label>
                <Textarea
                  id="medications"
                  {...form.register("medications")}
                  placeholder="Example: Lisinopril 10mg daily, Vitamin D 1000IU daily, Tylenol as needed..."
                  className="mt-2 h-24 bg-white"
                />
                <p className="text-xs text-green-700 mt-2">
                  Include prescription medications, over-the-counter drugs, vitamins, and herbal supplements.
                </p>
              </div>

              {/* Medical Conditions */}
              <div>
                <Label htmlFor="conditions" className="text-sm font-medium text-gray-700">
                  Current Medical Conditions
                </Label>
                <Textarea
                  id="conditions"
                  {...form.register("medicalHistory.conditions")}
                  placeholder="Example: High blood pressure, Diabetes type 2, Arthritis..."
                  className="mt-2 h-20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  List any ongoing medical conditions or chronic illnesses
                </p>
              </div>

              {/* Previous Surgeries */}
              <div>
                <Label htmlFor="surgeries" className="text-sm font-medium text-gray-700">
                  Previous Surgeries or Hospitalizations
                </Label>
                <Textarea
                  id="surgeries"
                  {...form.register("medicalHistory.surgeries")}
                  placeholder="Example: Appendectomy (2018), Knee replacement (2020)..."
                  className="mt-2 h-20"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include major surgeries, procedures, and hospital stays
                </p>
              </div>

              {/* Family History */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold text-purple-900">Family Medical History</h3>
                </div>
                <Label htmlFor="familyHistory" className="text-sm font-medium text-gray-700">
                  Relevant family medical history (parents, siblings, grandparents)
                </Label>
                <Textarea
                  id="familyHistory"
                  {...form.register("medicalHistory.familyHistory")}
                  placeholder="Example: Mother - breast cancer, Father - heart disease, Grandmother - diabetes..."
                  className="mt-2 h-24 bg-white"
                />
                <p className="text-xs text-purple-700 mt-2">
                  Helps us understand your potential health risks and provide preventive care.
                </p>
              </div>

              {/* Skip Option */}
              <div className="text-center py-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  You can skip this section and provide information during your visit if preferred.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/onboarding/confirmation?patientId=${patientId}&completed=true`)}
                  className="mr-4"
                >
                  Skip for Now
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(`/onboarding/insurance?patientId=${patientId}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Insurance
                </Button>

                <Button
                  type="submit"
                  disabled={completeOnboardingMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
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
      </main>
    </div>
  );
}