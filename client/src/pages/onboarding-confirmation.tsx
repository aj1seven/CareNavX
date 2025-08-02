import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import NavigationBar from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  MapPin, 
  Printer, 
  User, 
  CreditCard, 
  Heart,
  Phone,
  Home,
  Clock,
  Navigation as MapNavigation,
  Star
} from "lucide-react";

export default function OnboardingConfirmation() {
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Get patient ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId');
  const isCompleted = urlParams.get('completed') === 'true';
  const isEmergency = urlParams.get('emergency') === 'true';
  
  const { data: patient, isLoading } = useQuery<{
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    admissionLocation: string;
    insuranceProvider?: string;
    isEmergency?: boolean;
  }>({
    queryKey: ["/api/patients", patientId],
    enabled: !!patientId,
  });

  useEffect(() => {
    if (isCompleted) {
      setShowCelebration(true);
      // Remove celebration effect after animation
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted]);

  if (!patientId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <p className="text-gray-600 mb-4">Invalid patient information. Please start the onboarding process again.</p>
            <Link href="/">
              <Button>Return to Welcome</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading your information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getLocationDetails = (location: string | undefined) => {
    if (location?.includes("Emergency")) {
      return {
        floor: "Ground Floor",
        wing: "East Wing",
        icon: "🚨",
        directions: "Enter through main entrance, follow red signs to Emergency Department",
        estimatedTime: "2 minutes walk"
      };
    }
    return {
      floor: "Floor 2",
      wing: "West Wing", 
      icon: "🏥",
      directions: "Take elevator to Floor 2, turn left and follow blue signs to General Admission",
      estimatedTime: "5 minutes walk"
    };
  };

  const locationDetails = getLocationDetails(patient?.admissionLocation);

  const handlePrintWristband = () => {
    // In a real implementation, this would trigger a print job
    alert("🖨️ Wristband print job sent! Please collect from the front desk upon arrival.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-6xl">🎉</div>
          </div>
          {/* Confetti effect */}
          <div className="absolute top-0 left-1/4 animate-ping">✨</div>
          <div className="absolute top-1/4 right-1/4 animate-ping animation-delay-500">🎊</div>
          <div className="absolute bottom-1/4 left-1/3 animate-ping animation-delay-1000">⭐</div>
        </div>
      )}

      <NavigationBar currentStep="confirmation" patientId={patientId || undefined} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-green-600 h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Welcome to CareNav!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Your hospital onboarding is complete
          </p>
          <p className="text-gray-500">
            {patient?.firstName} {patient?.lastName} • Patient ID: {patient?.id?.substring(0, 13).toUpperCase()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Admission Location Card */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center text-white">
                <MapPin className="h-5 w-5 mr-2" />
                Your Admission Location
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <span className="text-3xl">{locationDetails.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {patient?.admissionLocation || "Room Assignment Pending"}
                    </h3>
                    <p className="text-gray-600">
                      {locationDetails.floor}, {locationDetails.wing}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <MapNavigation className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Directions</span>
                  </div>
                  <p className="text-sm text-blue-800">{locationDetails.directions}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Walking Time</span>
                  </div>
                  <p className="text-sm text-green-800">{locationDetails.estimatedTime} from main entrance</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Patient Information Summary */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <User className="h-5 w-5 mr-2" />
                Registration Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Full Name:</span>
                  <span className="font-medium text-gray-900">
                    {patient?.firstName} {patient?.lastName}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Patient ID:</span>
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {patient?.id?.substring(0, 13).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Date of Birth:</span>
                  <span className="font-medium text-gray-900">{patient?.dateOfBirth}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Phone:</span>
                  <span className="font-medium text-gray-900">{patient?.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Insurance:</span>
                  <Badge 
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    {patient?.insuranceProvider ? "Verified" : "Pending"}
                  </Badge>
                </div>
                {patient?.isEmergency && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 text-sm">Priority:</span>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-200">
                      Emergency
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={handlePrintWristband}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Patient Wristband
            </Button>
            
            <Link href="/help">
              <Button variant="outline" className="px-8 py-3">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </Link>
          </div>

          {/* What's Next Section */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="h-5 w-5 text-yellow-500 mr-2" />
                What's Next?
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Before Your Visit:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Bring a valid photo ID</li>
                    <li>• Bring your insurance card</li>
                    <li>• Arrive 15 minutes early</li>
                    <li>• Fast for 12 hours if required</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">Upon Arrival:</p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Check in at the front desk</li>
                    <li>• Collect your wristband</li>
                    <li>• Proceed to your assigned location</li>
                    <li>• A staff member will assist you</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Return Home Button */}
          <div className="text-center mt-8">
            <Link href="/">
              <Button variant="outline" size="lg">
                <Home className="h-4 w-4 mr-2" />
                Return to Welcome Page
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}