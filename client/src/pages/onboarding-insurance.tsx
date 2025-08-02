import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard,
  Shield,
  CheckCircle
} from "lucide-react";

const insuranceSchema = z.object({
  insuranceProvider: z.string().min(1, "Insurance provider is required"),
  insurancePolicyNumber: z.string().min(1, "Policy number is required"),
  insuranceGroupNumber: z.string().optional(),
});

export default function OnboardingInsurance() {
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
    resolver: zodResolver(insuranceSchema),
    defaultValues: {
      insuranceProvider: "",
      insurancePolicyNumber: "",
      insuranceGroupNumber: "",
    },
  });

  const updatePatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", `/api/patients/${patientId}`, {
        ...data,
        onboardingStep: 2,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      setLocation(`/onboarding/medical?patientId=${patientId}`);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save insurance information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updatePatientMutation.mutate(data);
  };

  const progress = 50; // Second step

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button variant="ghost" onClick={() => setLocation(`/onboarding/personal?patientId=${patientId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Personal Info
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Insurance Information</span>
            </div>
            
            <div className="text-sm text-gray-500">
              Step 2 of 4
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step 2 of 4</span>
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
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Insurance Information</CardTitle>
            <p className="text-gray-600">
              Help us verify your insurance coverage for a smooth hospital experience
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Insurance Benefits Info */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-green-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Why We Need This Information</h3>
                  <ul className="space-y-1 text-sm text-green-800">
                    <li>• Verify your coverage and benefits</li>
                    <li>• Determine your co-pay and deductible</li>
                    <li>• Pre-authorize required procedures</li>
                    <li>• Streamline billing and reduce wait times</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="insuranceProvider" className="text-sm font-medium text-gray-700">
                  Insurance Provider *
                </Label>
                <Input
                  id="insuranceProvider"
                  {...form.register("insuranceProvider")}
                  placeholder="e.g., Blue Cross Blue Shield, Aetna, United Healthcare"
                  className="mt-1"
                />
                {form.formState.errors.insuranceProvider && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.insuranceProvider.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Enter the name exactly as it appears on your insurance card
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="insurancePolicyNumber" className="text-sm font-medium text-gray-700">
                    Policy Number *
                  </Label>
                  <Input
                    id="insurancePolicyNumber"
                    {...form.register("insurancePolicyNumber")}
                    placeholder="Policy number"
                    className="mt-1"
                  />
                  {form.formState.errors.insurancePolicyNumber && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.insurancePolicyNumber.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="insuranceGroupNumber" className="text-sm font-medium text-gray-700">
                    Group Number
                  </Label>
                  <Input
                    id="insuranceGroupNumber"
                    {...form.register("insuranceGroupNumber")}
                    placeholder="Group number (if applicable)"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - often provided by your employer
                  </p>
                </div>
              </div>

              {/* Insurance Card Tips */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">💡 Finding Your Insurance Information</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Policy Number:</strong> Usually on the front of your card, may be labeled as "Member ID" or "Policy #"</p>
                  <p><strong>Group Number:</strong> Often on the front or back, may be labeled as "Group #" or "Grp #"</p>
                  <p><strong>Provider Name:</strong> The insurance company name, usually prominently displayed on the card</p>
                </div>
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
                  disabled={updatePatientMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {updatePatientMutation.isPending ? (
                    "Saving Information..."
                  ) : (
                    <>
                      Continue to Medical History
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