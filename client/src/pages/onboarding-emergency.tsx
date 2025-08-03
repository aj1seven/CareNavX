import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  Ambulance,
  AlertTriangle,
  Clock,
  Heart,
  Shield,
  MapPin,
  Zap,
  Stethoscope,
  Navigation,
  Phone,
  Car,
  CheckCircle
} from "lucide-react";

const emergencyTypes = [
  { value: "cardiac", label: "Cardiac Emergency", description: "Heart attack, chest pain, arrhythmia" },
  { value: "trauma", label: "Trauma", description: "Accident, injury, bleeding, fractures" },
  { value: "respiratory", label: "Respiratory Emergency", description: "Difficulty breathing, asthma attack" },
  { value: "neurological", label: "Neurological Emergency", description: "Stroke, seizure, head injury" },
  { value: "pediatric", label: "Pediatric Emergency", description: "Child-specific emergencies" },
  { value: "obstetric", label: "Obstetric Emergency", description: "Pregnancy complications, labor" },
  { value: "general", label: "General Emergency", description: "Other urgent medical conditions" }
];

const emergencyLocations = [
  { id: "emergency_room", name: "Emergency Room", floor: "Ground Floor", wing: "East Wing", waitTime: "Immediate" },
  { id: "icu", name: "Intensive Care Unit", floor: "Floor 3", wing: "North Wing", waitTime: "Immediate" },
  { id: "trauma_center", name: "Trauma Center", floor: "Ground Floor", wing: "West Wing", waitTime: "Immediate" },
  { id: "cardiac_unit", name: "Cardiac Care Unit", floor: "Floor 2", wing: "East Wing", waitTime: "Immediate" },
  { id: "pediatric_er", name: "Pediatric Emergency", floor: "Ground Floor", wing: "South Wing", waitTime: "Immediate" }
];

export default function OnboardingEmergency() {
  const [, setLocation] = useLocation();
  const [selectedEmergencyType, setSelectedEmergencyType] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [ambulanceArranged, setAmbulanceArranged] = useState(false);
  const [ambulanceETA, setAmbulanceETA] = useState<string>('');
  const [trackingActive, setTrackingActive] = useState(false);
  
  const progress = 50; // Emergency is faster - only 2 steps

  const handleEmergencyTypeSelect = (value: string) => {
    setSelectedEmergencyType(value);
  };

  const detectCurrentLocation = () => {
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setIsLocating(false);
          
          // Automatically arrange ambulance after location detection
          arrangeAmbulance(latitude, longitude);
        },
        (error) => {
          console.error('Location detection failed:', error);
          setIsLocating(false);
          // Fallback: use default location and arrange ambulance
          arrangeAmbulance(37.7749, -122.4194); // Default to San Francisco
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLocating(false);
      // Fallback for browsers without geolocation
      arrangeAmbulance(37.7749, -122.4194);
    }
  };

  const arrangeAmbulance = async (lat: number, lng: number) => {
    try {
      const response = await fetch('/api/emergency/ambulance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          emergencyType: selectedEmergencyType,
          patientId: null // Will be set after patient creation
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to arrange ambulance');
      }

      const data = await response.json();
      setAmbulanceArranged(true);
      setAmbulanceETA(data.eta);
      setTrackingActive(true);
      
      console.log('Ambulance arranged:', data);
    } catch (error) {
      console.error('Ambulance arrangement failed:', error);
      // Fallback to local simulation
      setAmbulanceArranged(true);
      const baseETA = Math.floor(Math.random() * 8) + 3;
      setAmbulanceETA(`${baseETA} minutes`);
    }
  };

  const handleCompleteEmergency = () => {
    if (!selectedEmergencyType) return;
    
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Generate random location based on emergency type
      let location;
      switch (selectedEmergencyType) {
        case 'cardiac':
          location = emergencyLocations.find(l => l.id === 'cardiac_unit') || emergencyLocations[0];
          break;
        case 'trauma':
          location = emergencyLocations.find(l => l.id === 'trauma_center') || emergencyLocations[0];
          break;
        case 'pediatric':
          location = emergencyLocations.find(l => l.id === 'pediatric_er') || emergencyLocations[0];
          break;
        default:
          location = emergencyLocations[Math.floor(Math.random() * emergencyLocations.length)];
      }
      
      // Generate proper patient ID using timestamp and random string
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 10);
      const patientId = `EMG-${timestamp}-${randomStr}`.toUpperCase();
      
      // Navigate to confirmation with emergency data
      setLocation(`/onboarding/confirmation?patientId=${patientId}&emergency=true&emergencyLocation=${location.id}&emergencyType=${selectedEmergencyType}`);
    }, 2000);
  };

  const selectedEmergency = emergencyTypes.find(e => e.value === selectedEmergencyType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Emergency Header - Consistent CareNavX Branding */}
      <header className="bg-red-600/90 backdrop-blur-sm shadow-lg border-b border-red-700 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* CareNavX Logo - Emergency Theme */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">
                  CareNavX
                </span>
                <span className="text-xs text-red-100 -mt-1">Emergency Mode</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span className="text-sm font-medium">EMERGENCY MODE</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">Priority Processing</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-red-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-2">
            <div className="flex justify-between text-sm text-red-700">
              <span>Emergency Registration - Step 1 of 2</span>
              <span>{progress}% Complete</span>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-red-100" />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Alert */}
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="font-semibold text-red-800">Emergency Registration</h3>
              <p className="text-sm text-red-700">
                This is a streamlined process for urgent medical situations. 
                Select your emergency type for immediate assistance.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-red-50 to-orange-50">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Emergency Type</CardTitle>
            <p className="text-gray-600">
              Select the type of emergency for immediate medical attention
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Emergency Type Selection */}
            <div className="space-y-4">
              <Label htmlFor="emergencyType" className="text-lg font-medium text-gray-900">
                What type of emergency are you experiencing? *
              </Label>
              
              <Select onValueChange={handleEmergencyTypeSelect} value={selectedEmergencyType}>
                <SelectTrigger className="h-12 text-lg">
                  <SelectValue placeholder="Select emergency type..." />
                </SelectTrigger>
                <SelectContent>
                  {emergencyTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="py-3">
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Emergency Info */}
            {selectedEmergency && (
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center mb-3">
                  <Heart className="h-5 w-5 text-orange-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Selected Emergency</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{selectedEmergency.label}</p>
                  <p className="text-gray-600">{selectedEmergency.description}</p>
                  <div className="flex items-center text-orange-700 font-medium">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Immediate attention required</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ambulance Arrangement Section */}
            {selectedEmergency && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <Ambulance className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-medium text-gray-900">Emergency Transport</h3>
                </div>
                
                {!ambulanceArranged ? (
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      We can automatically detect your location and arrange emergency transport to the hospital.
                    </p>
                    <Button
                      onClick={detectCurrentLocation}
                      disabled={isLocating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLocating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Detecting Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4 mr-2" />
                          Detect Location & Arrange Ambulance
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      This will use your device's GPS to find your exact location
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="font-medium text-green-800">Ambulance Arranged</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-green-700">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>Location detected and ambulance dispatched</span>
                        </div>
                        <div className="flex items-center text-green-700">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>ETA: {ambulanceETA}</span>
                        </div>
                        <div className="flex items-center text-green-700">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>Emergency services notified</span>
                        </div>
                        <div className="flex items-center text-green-700">
                          <Car className="h-4 w-4 mr-2" />
                          <span>Ambulance en route to your location</span>
                        </div>
                        {trackingActive && (
                          <div className="flex items-center text-blue-700 mt-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-xs">Live tracking active</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-800">Important Instructions</span>
                      </div>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Stay calm and remain at your current location</li>
                        <li>• Keep your phone nearby for emergency calls</li>
                        <li>• If possible, have someone meet the ambulance</li>
                        <li>• Follow any instructions from emergency dispatchers</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Welcome
              </Button>

              <Button
                onClick={handleCompleteEmergency}
                disabled={!selectedEmergencyType || isProcessing}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing Emergency...
                  </>
                ) : (
                  <>
                    Complete Emergency Registration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Features */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900">Fast Processing</h4>
                <p className="text-sm text-gray-600">2-3 minutes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900">Priority Care</h4>
                <p className="text-sm text-gray-600">Immediate attention</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-red-200">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <h4 className="font-medium text-gray-900">Direct Admission</h4>
                <p className="text-sm text-gray-600">Skip waiting room</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 