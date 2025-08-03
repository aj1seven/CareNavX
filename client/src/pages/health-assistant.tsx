import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/navigation";
import { 
  Brain, 
  Heart, 
  Stethoscope, 
  Shield, 
  Activity,
  MessageCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  TrendingUp
} from "lucide-react";

interface SymptomAnalysis {
  possibleConditions: string[];
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  shouldSeekCare: boolean;
}

interface MedicalAdvice {
  advice: string;
  urgency: 'low' | 'medium' | 'high';
  recommendations: string[];
  followUpActions: string[];
}

interface HealthRecommendations {
  recommendations: string[];
  lifestyleTips: string[];
  preventiveMeasures: string[];
  priorityLevel: 'low' | 'medium' | 'high';
}

export default function HealthAssistant() {
  const [activeTab, setActiveTab] = useState<'symptoms' | 'advice' | 'recommendations'>('symptoms');
  const [symptoms, setSymptoms] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [currentSymptoms, setCurrentSymptoms] = useState('');
  const [healthStatus, setHealthStatus] = useState('');
  const { toast } = useToast();

  // Symptom Analysis
  const symptomAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/symptoms/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms, 
          patientAge: patientAge ? parseInt(patientAge) : undefined 
        }),
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json() as Promise<SymptomAnalysis>;
    },
    onSuccess: (data) => {
      toast({
        title: "Symptom Analysis Complete",
        description: `Analysis completed with ${data.urgency} urgency level.`,
      });
    },
    onError: () => {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Medical Advice
  const medicalAdviceMutation = useMutation({
    mutationFn: async () => {
      const patientData = {
        age: patientAge ? parseInt(patientAge) : 30,
        symptoms: currentSymptoms,
        healthStatus
      };
      
      const response = await fetch('/api/medical/advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientData, 
          currentSymptoms 
        }),
      });
      if (!response.ok) throw new Error('Advice generation failed');
      return response.json() as Promise<MedicalAdvice>;
    },
    onSuccess: (data) => {
      toast({
        title: "Medical Advice Generated",
        description: `Personalized advice with ${data.urgency} priority.`,
      });
    },
    onError: () => {
      toast({
        title: "Advice Generation Failed",
        description: "Failed to generate medical advice. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Health Recommendations
  const healthRecommendationsMutation = useMutation({
    mutationFn: async () => {
      const patientData = {
        age: patientAge ? parseInt(patientAge) : 30,
        healthStatus,
        currentSymptoms
      };
      
      const response = await fetch('/api/health/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patientData, 
          currentHealthStatus: healthStatus 
        }),
      });
      if (!response.ok) throw new Error('Recommendations failed');
      return response.json() as Promise<HealthRecommendations>;
    },
    onSuccess: (data) => {
      toast({
        title: "Health Recommendations Generated",
        description: `Personalized recommendations with ${data.priorityLevel} priority.`,
      });
    },
    onError: () => {
      toast({
        title: "Recommendations Failed",
        description: "Failed to generate health recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Health Assistant</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get personalized health insights, symptom analysis, and medical recommendations powered by AI
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <Button
              variant={activeTab === 'symptoms' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('symptoms')}
              className="mr-1"
            >
              <Stethoscope className="h-4 w-4 mr-2" />
              Symptom Analysis
            </Button>
            <Button
              variant={activeTab === 'advice' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('advice')}
              className="mr-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Medical Advice
            </Button>
            <Button
              variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('recommendations')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Health Tips
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                {activeTab === 'symptoms' && <Stethoscope className="h-5 w-5 mr-2" />}
                {activeTab === 'advice' && <MessageCircle className="h-5 w-5 mr-2" />}
                {activeTab === 'recommendations' && <TrendingUp className="h-5 w-5 mr-2" />}
                {activeTab === 'symptoms' ? 'Describe Your Symptoms' : 
                 activeTab === 'advice' ? 'Get Medical Advice' : 'Health Recommendations'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Age Input */}
              <div>
                <Label htmlFor="age">Your Age (Optional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Dynamic Input Based on Tab */}
              {activeTab === 'symptoms' && (
                <div>
                  <Label htmlFor="symptoms">Describe Your Symptoms</Label>
                  <Textarea
                    id="symptoms"
                    placeholder="Describe your symptoms in detail (e.g., chest pain, fever, headache, etc.)"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="mt-1 h-32"
                  />
                  <Button
                    onClick={() => symptomAnalysisMutation.mutate()}
                    disabled={!symptoms.trim() || symptomAnalysisMutation.isPending}
                    className="w-full mt-4"
                  >
                    {symptomAnalysisMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing Symptoms...
                      </>
                    ) : (
                      <>
                        <Stethoscope className="h-4 w-4 mr-2" />
                        Analyze Symptoms
                      </>
                    )}
                  </Button>
                </div>
              )}

              {activeTab === 'advice' && (
                <div>
                  <Label htmlFor="currentSymptoms">Current Symptoms (Optional)</Label>
                  <Textarea
                    id="currentSymptoms"
                    placeholder="Describe any current symptoms or concerns"
                    value={currentSymptoms}
                    onChange={(e) => setCurrentSymptoms(e.target.value)}
                    className="mt-1 h-20"
                  />
                  <Label htmlFor="healthStatus" className="mt-4 block">Health Status</Label>
                  <Textarea
                    id="healthStatus"
                    placeholder="Describe your general health status, medical history, or concerns"
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    className="mt-1 h-20"
                  />
                  <Button
                    onClick={() => medicalAdviceMutation.mutate()}
                    disabled={!healthStatus.trim() || medicalAdviceMutation.isPending}
                    className="w-full mt-4"
                  >
                    {medicalAdviceMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Advice...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Get Medical Advice
                      </>
                    )}
                  </Button>
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <Label htmlFor="healthStatus">Health Status</Label>
                  <Textarea
                    id="healthStatus"
                    placeholder="Describe your current health status, lifestyle, and goals"
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    className="mt-1 h-32"
                  />
                  <Button
                    onClick={() => healthRecommendationsMutation.mutate()}
                    disabled={!healthStatus.trim() || healthRecommendationsMutation.isPending}
                    className="w-full mt-4"
                  >
                    {healthRecommendationsMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Recommendations...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Get Health Recommendations
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="h-5 w-5 mr-2" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === 'symptoms' && symptomAnalysisMutation.data && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={getUrgencyColor(symptomAnalysisMutation.data.urgency)}>
                      {symptomAnalysisMutation.data.urgency.toUpperCase()} URGENCY
                    </Badge>
                    {symptomAnalysisMutation.data.shouldSeekCare && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        SEEK CARE
                      </Badge>
                    )}
                  </div>

                  {symptomAnalysisMutation.data.possibleConditions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Possible Conditions</h4>
                      <div className="space-y-1">
                        {symptomAnalysisMutation.data.possibleConditions.map((condition, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-700">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                            {condition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {symptomAnalysisMutation.data.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                      <div className="space-y-1">
                        {symptomAnalysisMutation.data.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <Activity className="h-3 w-3 mr-2 mt-0.5 text-blue-500" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'advice' && medicalAdviceMutation.data && (
                <div className="space-y-4">
                  <Badge className={getUrgencyColor(medicalAdviceMutation.data.urgency)}>
                    {medicalAdviceMutation.data.urgency.toUpperCase()} PRIORITY
                  </Badge>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Medical Advice</h4>
                    <p className="text-gray-700 text-sm">{medicalAdviceMutation.data.advice}</p>
                  </div>

                  {medicalAdviceMutation.data.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                      <div className="space-y-1">
                        {medicalAdviceMutation.data.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {medicalAdviceMutation.data.followUpActions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Follow-up Actions</h4>
                      <div className="space-y-1">
                        {medicalAdviceMutation.data.followUpActions.map((action, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <Clock className="h-3 w-3 mr-2 mt-0.5 text-blue-500" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recommendations' && healthRecommendationsMutation.data && (
                <div className="space-y-4">
                  <Badge className={getUrgencyColor(healthRecommendationsMutation.data.priorityLevel)}>
                    {healthRecommendationsMutation.data.priorityLevel.toUpperCase()} PRIORITY
                  </Badge>

                  {healthRecommendationsMutation.data.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Health Recommendations</h4>
                      <div className="space-y-1">
                        {healthRecommendationsMutation.data.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <Heart className="h-3 w-3 mr-2 mt-0.5 text-red-500" />
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {healthRecommendationsMutation.data.lifestyleTips.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Lifestyle Tips</h4>
                      <div className="space-y-1">
                        {healthRecommendationsMutation.data.lifestyleTips.map((tip, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <TrendingUp className="h-3 w-3 mr-2 mt-0.5 text-green-500" />
                            {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {healthRecommendationsMutation.data.preventiveMeasures.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Preventive Measures</h4>
                      <div className="space-y-1">
                        {healthRecommendationsMutation.data.preventiveMeasures.map((measure, index) => (
                          <div key={index} className="flex items-start text-sm text-gray-700">
                            <Shield className="h-3 w-3 mr-2 mt-0.5 text-blue-500" />
                            {measure}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!symptomAnalysisMutation.data && !medicalAdviceMutation.data && !healthRecommendationsMutation.data && (
                <div className="text-center text-gray-500 py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter your information and click analyze to get AI-powered insights</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Important Disclaimer</span>
            </div>
            <p className="text-xs text-yellow-700">
              This AI health assistant provides general information and should not replace professional medical advice. 
              Always consult with qualified healthcare providers for diagnosis and treatment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 