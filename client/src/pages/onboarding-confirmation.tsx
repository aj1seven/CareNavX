import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
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
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  
  // Get patient ID from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const patientId = urlParams.get('patientId');
  const isCompleted = urlParams.get('completed') === 'true';
  const isEmergency = urlParams.get('emergency') === 'true';
  const emergencyLocation = urlParams.get('location');
  const emergencyType = urlParams.get('emergencyType');
  
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
    enabled: !!patientId && !isEmergency,
  });

  // Save emergency patient to database
  const saveEmergencyPatient = useMutation({
    mutationFn: async () => {
      if (!isEmergency || savedToDatabase) return;
      
      const locationDetails = getLocationDetails(emergencyLocation || undefined);
      const emergencyData = {
        firstName: "Emergency",
        lastName: "Patient",
        dateOfBirth: new Date().toISOString().split('T')[0],
        phone: "Emergency",
        address: "Emergency Admission",
        isEmergency: true,
        admissionLocation: locationDetails.name,
        onboardingStep: 2,
        isCompleted: true,
        emergencyType: emergencyType
      };
      
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emergencyData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save emergency patient');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSavedToDatabase(true);
    },
    onError: (error) => {
      console.error('Error saving emergency patient:', error);
    }
  });

  useEffect(() => {
    if (isCompleted || isEmergency) {
      setShowCelebration(true);
      // Remove celebration effect after animation
      const timer = setTimeout(() => setShowCelebration(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, isEmergency]);

  // Save emergency patient to database when component mounts
  useEffect(() => {
    if (isEmergency && !savedToDatabase) {
      saveEmergencyPatient.mutate();
    }
  }, [isEmergency, savedToDatabase]);

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
    if (isEmergency) {
      // Map emergency location IDs to details
      const emergencyLocations = {
        emergency_room: {
          floor: "Ground Floor",
          wing: "East Wing",
          icon: "🚨",
          directions: "Enter through main entrance, follow red signs to Emergency Room",
          estimatedTime: "2 minutes walk",
          priority: "IMMEDIATE",
          name: "Emergency Room"
        },
        icu: {
          floor: "Floor 3",
          wing: "North Wing",
          icon: "🏥",
          directions: "Take elevator to Floor 3, follow blue signs to ICU",
          estimatedTime: "3 minutes walk",
          priority: "IMMEDIATE",
          name: "Intensive Care Unit"
        },
        trauma_center: {
          floor: "Ground Floor",
          wing: "West Wing",
          icon: "🚑",
          directions: "Enter through main entrance, follow yellow signs to Trauma Center",
          estimatedTime: "2 minutes walk",
          priority: "IMMEDIATE",
          name: "Trauma Center"
        },
        cardiac_unit: {
          floor: "Floor 2",
          wing: "East Wing",
          icon: "❤️",
          directions: "Take elevator to Floor 2, follow red signs to Cardiac Care Unit",
          estimatedTime: "3 minutes walk",
          priority: "IMMEDIATE",
          name: "Cardiac Care Unit"
        },
        pediatric_er: {
          floor: "Ground Floor",
          wing: "South Wing",
          icon: "👶",
          directions: "Enter through main entrance, follow green signs to Pediatric Emergency",
          estimatedTime: "2 minutes walk",
          priority: "IMMEDIATE",
          name: "Pediatric Emergency"
        }
      };
      
      return emergencyLocations[emergencyLocation as keyof typeof emergencyLocations] || emergencyLocations.emergency_room;
    }
    
    if (location?.includes("Emergency")) {
      return {
        floor: "Ground Floor",
        wing: "East Wing",
        icon: "🚨",
        directions: "Enter through main entrance, follow red signs to Emergency Department",
        estimatedTime: "2 minutes walk",
        priority: "IMMEDIATE",
        name: "Emergency Department"
      };
    }
    
    return {
      floor: "Floor 2",
      wing: "West Wing", 
      icon: "🏥",
      directions: "Take elevator to Floor 2, turn left and follow blue signs to General Admission",
      estimatedTime: "5 minutes walk",
      priority: "Standard",
      name: "General Admission"
    };
  };

  const locationDetails = getLocationDetails(patient?.admissionLocation);

  const handlePrintWristband = () => {
    // In a real implementation, this would trigger a print job
    alert("🖨️ Wristband print job sent! Please collect from the front desk upon arrival.");
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isEmergency 
        ? 'bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50' 
        : 'bg-gradient-to-br from-blue-50 via-white to-green-50'
    }`}>
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

      <Navigation currentStep="confirmation" patientId={patientId || undefined} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
            isEmergency ? 'bg-red-100' : 'bg-green-100'
          }`}>
            <CheckCircle className={`h-10 w-10 ${isEmergency ? 'text-red-600' : 'text-green-600'}`} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {isEmergency ? '🚨 Emergency Registration Complete!' : '🎉 Welcome to CareNavX!'}
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            {isEmergency ? 'You have been registered for emergency care' : 'Your hospital onboarding is complete'}
          </p>
          <p className="text-gray-500">
            {patient?.firstName} {patient?.lastName} • Patient ID: {patient?.id?.substring(0, 13).toUpperCase()}
          </p>
          {isEmergency && (
            <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
              <p className="text-red-800 font-medium">⚠️ Emergency Priority - Proceed immediately to Emergency Department</p>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Admission Location Card */}
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className={`text-white rounded-t-lg ${
              isEmergency 
                ? 'bg-gradient-to-r from-red-500 to-orange-500' 
                : 'bg-gradient-to-r from-blue-500 to-green-500'
            }`}>
              <CardTitle className="flex items-center text-white">
                <MapPin className="h-5 w-5 mr-2" />
                {isEmergency ? 'Emergency Department Location' : 'Your Admission Location'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <span className="text-3xl">{locationDetails.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {isEmergency ? locationDetails.name : (patient?.admissionLocation || "Room Assignment Pending")}
                    </h3>
                    <p className="text-gray-600">
                      {locationDetails.floor}, {locationDetails.wing}
                    </p>
                    {isEmergency && emergencyType && (
                      <p className="text-sm text-red-600 font-medium">
                        {emergencyType.charAt(0).toUpperCase() + emergencyType.slice(1)} Emergency
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isEmergency && (
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center mb-2">
                      <span className="text-red-600 mr-2">🚨</span>
                      <span className="font-medium text-red-900">PRIORITY STATUS</span>
                    </div>
                    <p className="text-sm text-red-800 font-bold">IMMEDIATE ATTENTION REQUIRED</p>
                  </div>
                )}
                
                <div className={`rounded-lg p-4 ${
                  isEmergency ? 'bg-red-50 border border-red-200' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center mb-2">
                    <MapNavigation className={`h-4 w-4 mr-2 ${
                      isEmergency ? 'text-red-600' : 'text-blue-600'
                    }`} />
                    <span className={`font-medium ${
                      isEmergency ? 'text-red-900' : 'text-blue-900'
                    }`}>Directions</span>
                  </div>
                  <p className={`text-sm ${
                    isEmergency ? 'text-red-800' : 'text-blue-800'
                  }`}>{locationDetails.directions}</p>
                </div>

                <div className={`rounded-lg p-4 ${
                  isEmergency ? 'bg-orange-50 border border-orange-200' : 'bg-green-50'
                }`}>
                  <div className="flex items-center mb-2">
                    <Clock className={`h-4 w-4 mr-2 ${
                      isEmergency ? 'text-orange-600' : 'text-green-600'
                    }`} />
                    <span className={`font-medium ${
                      isEmergency ? 'text-orange-900' : 'text-green-900'
                    }`}>Walking Time</span>
                  </div>
                  <p className={`text-sm ${
                    isEmergency ? 'text-orange-800' : 'text-green-800'
                  }`}>{locationDetails.estimatedTime} from main entrance</p>
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
                    {isEmergency ? "Emergency Patient" : `${patient?.firstName} ${patient?.lastName}`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 text-sm">Patient ID:</span>
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {isEmergency ? patientId?.substring(0, 13).toUpperCase() : patient?.id?.substring(0, 13).toUpperCase()}
                  </span>
                </div>
                {!isEmergency && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Date of Birth:</span>
                      <span className="font-medium text-gray-900">{patient?.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 text-sm">Phone:</span>
                      <span className="font-medium text-gray-900">{patient?.phone}</span>
                    </div>
                  </>
                )}
                {!isEmergency && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 text-sm">Insurance:</span>
                    <Badge 
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {patient?.insuranceProvider ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                )}
                {isEmergency && (
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
            {isEmergency ? (
              <>
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                  onClick={handlePrintWristband}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Emergency Wristband
                </Button>
                
                <Link href="/help">
                  <Button variant="outline" className="px-8 py-3 border-red-200 text-red-700 hover:bg-red-50">
                    <Phone className="h-4 w-4 mr-2" />
                    Emergency Support
                  </Button>
                </Link>
              </>
            ) : (
              <>
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
              </>
            )}
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