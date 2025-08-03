import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import Navigation from "@/components/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  User,
  Ambulance,
  CheckCircle,
  Phone,
  Home
} from "lucide-react";
import FileUpload from "@/components/file-upload";

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

export default function OnboardingPersonal() {
  const [, setLocation] = useLocation();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [showDocumentVerification, setShowDocumentVerification] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if emergency mode from URL params
  const isEmergency = window.location.search.includes('emergency=true');
  
  const form = useForm({
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

  const createPatientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/patients", {
        ...data,
        isEmergency: isEmergency,
        onboardingStep: 1,
      });
      return response.json();
    },
    onSuccess: (patient) => {
      setPatientId(patient.id);
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      
      // Navigate to next step
      if (isEmergency) {
        setLocation(`/onboarding/confirmation?patientId=${patient._id}&emergency=true`);
      } else {
        setLocation(`/onboarding/medical?patientId=${patient._id}`);
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    },
  });



  const onSubmit = (data: any) => {
    createPatientMutation.mutate(data);
  };

  const handleDocumentUploaded = (result: any) => {
    toast({
      title: "File Uploaded Successfully",
      description: `${result.document.type.replace('_', ' ')} has been saved to the database.`,
    });
  };

  const progress = 33; // First step of 3

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation currentStep="personal" patientId={patientId || undefined} />

      {/* Progress Bar */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step 1 of {isEmergency ? '2' : '3'}</span>
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
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Personal Information</CardTitle>
            <p className="text-gray-600">
              Let's start with your basic information to create your patient profile
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">


            {/* Document Verification Section */}
            <div className="border-2 border-dashed border-blue-200 rounded-xl p-6 text-center bg-blue-50/50 hover:border-blue-300 transition-colors">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Document Upload</h3>
              <p className="text-gray-600 mb-4">
                Upload your Medical History, Aadhaar Card, and PAN Card
              </p>
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowDocumentVerification(!showDocumentVerification)}
              >
                {showDocumentVerification ? "Hide File Upload" : "Upload Required Documents"}
              </Button>
            </div>

            {/* File Upload Component */}
            {showDocumentVerification && (
              <FileUpload 
                patientId={patientId || undefined}
                onDocumentUploaded={handleDocumentUploaded}
              />
            )}

            {/* Manual Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    placeholder="Enter your first name"
                    className="mt-1"
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    placeholder="Enter your last name"
                    className="mt-1"
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">
                    Date of Birth *
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...form.register("dateOfBirth")}
                    className="mt-1"
                  />
                  {form.formState.errors.dateOfBirth && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...form.register("phone")}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                  Home Address *
                </Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  placeholder="Enter your full address"
                  className="mt-1 h-20"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              {/* Emergency Contact Section */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center mb-4">
                  <Phone className="h-5 w-5 text-gray-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Emergency Contact</h3>
                  <span className="text-sm text-gray-500 ml-2">(Optional)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName" className="text-sm font-medium text-gray-700">
                      Contact Name
                    </Label>
                    <Input
                      id="emergencyContactName"
                      {...form.register("emergencyContactName")}
                      placeholder="Full name"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="emergencyContactRelationship" className="text-sm font-medium text-gray-700">
                      Relationship
                    </Label>
                    <Select onValueChange={(value) => form.setValue("emergencyContactRelationship", value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="emergencyContactPhone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input
                      id="emergencyContactPhone"
                      type="tel"
                      {...form.register("emergencyContactPhone")}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation('/')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Welcome
                </Button>

                <Button
                  type="submit"
                  disabled={createPatientMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {createPatientMutation.isPending ? (
                    "Saving Information..."
                  ) : (
                    <>
                      {isEmergency ? "Complete Registration" : "Continue to Medical History"}
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