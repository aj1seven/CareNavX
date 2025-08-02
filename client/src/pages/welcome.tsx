import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Hospital, 
  UserPlus, 
  Clock, 
  Shield, 
  Heart, 
  Stethoscope,
  ArrowRight,
  CheckCircle,
  Phone,
  MapPin,
  Ambulance
} from "lucide-react";

export default function Welcome() {
  const [selectedOnboardingType, setSelectedOnboardingType] = useState<'standard' | 'emergency' | null>(null);

  const features = [
    {
      icon: Clock,
      title: "Quick Registration",
      description: "Complete your hospital onboarding in under 10 minutes"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your medical information is encrypted and protected"
    },
    {
      icon: Heart,
      title: "Smart Forms",
      description: "AI-powered document scanning to auto-fill your information"
    },
    {
      icon: Stethoscope,
      title: "Expert Care",
      description: "Connect with our medical professionals seamlessly"
    }
  ];

  const onboardingSteps = [
    "Personal Information",
    "Insurance Details", 
    "Medical History",
    "Document Verification",
    "Location Assignment"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Hospital className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  CareNav
                </h1>
                <p className="text-xs text-gray-500">Hospital Onboarding</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/help">
                <Button variant="ghost" size="sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Help & Support
                </Button>
              </Link>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="h-4 w-4 mr-2" />
            Streamlined Hospital Registration
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              CareNav
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your digital gateway to seamless hospital onboarding. Complete your registration, 
            upload documents, and get your room assignment—all from the comfort of your home.
          </p>

          {/* Onboarding Type Selection */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* Standard Onboarding */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOnboardingType === 'standard' 
                  ? 'ring-2 ring-blue-500 shadow-lg' 
                  : 'hover:ring-1 hover:ring-blue-200'
              }`}
              onClick={() => setSelectedOnboardingType('standard')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Standard Onboarding</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Complete registration process for scheduled appointments and non-urgent care
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Estimated time: 8-12 minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>Full verification process</span>
                  </div>
                </div>
                {selectedOnboardingType === 'standard' && (
                  <Link href="/onboarding/personal">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Start Standard Onboarding
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Emergency Onboarding */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOnboardingType === 'emergency' 
                  ? 'ring-2 ring-red-500 shadow-lg' 
                  : 'hover:ring-1 hover:ring-red-200'
              }`}
              onClick={() => setSelectedOnboardingType('emergency')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ambulance className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-gray-900">Emergency Fast-Track</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  Expedited registration for urgent medical situations and emergency care
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Estimated time: 3-5 minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Ambulance className="h-4 w-4 mr-2" />
                    <span>Priority processing</span>
                  </div>
                </div>
                {selectedOnboardingType === 'emergency' && (
                  <Link href="/onboarding/personal?emergency=true">
                    <Button className="w-full bg-red-600 hover:bg-red-700">
                      Start Emergency Onboarding
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Onboarding Process */}
        <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Your Onboarding Journey</CardTitle>
            <p className="text-gray-600">Simple steps to get you registered and ready for care</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4">
              {onboardingSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{step}</span>
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-16 text-gray-500">
          <p className="mb-4">Need assistance? Our support team is here to help.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/help" className="flex items-center hover:text-blue-600">
              <Phone className="h-4 w-4 mr-1" />
              Live Chat Support
            </Link>
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              123 Medical Center Dr, Healthcare City
            </span>
            <span className="flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              (555) 123-CARE
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}