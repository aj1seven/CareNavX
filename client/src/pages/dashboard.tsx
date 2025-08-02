import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import Navigation from "@/components/navigation";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  Heart,
  Activity,
  ArrowRight,
  Stethoscope
} from "lucide-react";

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email?: string;
  onboardingStep: number;
  isEmergency?: boolean;
  admissionLocation?: string;
  insuranceProvider?: string;
  createdAt: string;
  completedAt?: string;
}

interface DashboardStats {
  totalPatients: number;
  completedToday: number;
  inProgress: number;
  averageTime: number;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: recentPatients, isLoading: patientsLoading } = useQuery<Patient[]>({
    queryKey: ["/api/patients"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
  });

  const getStepName = (step: number) => {
    switch (step) {
      case 0: return "Welcome";
      case 1: return "Personal Info";
      case 2: return "Insurance";
      case 3: return "Medical History";
      case 4: return "Completed";
      default: return "Unknown";
    }
  };

  const getStepProgress = (step: number) => {
    return Math.min((step / 4) * 100, 100);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Filter patients by status
  const inProgressPatients = recentPatients?.filter(p => p.onboardingStep > 0 && p.onboardingStep < 4) || [];
  const completedPatients = recentPatients?.filter(p => p.onboardingStep === 4) || [];
  const recentActivity = activities?.slice(0, 10) || [];

  if (statsLoading || patientsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patient Dashboard</h1>
          <p className="text-gray-600">Monitor patient onboarding status and system activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Patients</p>
                  <p className="text-3xl font-bold text-gray-900">{stats?.totalPatients || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">{stats?.completedToday || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-orange-600">{stats?.inProgress || 0}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                  <p className="text-3xl font-bold text-purple-600">{stats?.averageTime || 0}m</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Patients */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Activity className="h-5 w-5 mr-2 text-blue-600" />
                  Active Patient Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inProgressPatients.length === 0 ? (
                  <div className="text-center py-8">
                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No patients currently in onboarding process</p>
                    <Link href="/">
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        Start New Patient Onboarding
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inProgressPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {patient.firstName} {patient.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Patient ID: {patient.id.substring(0, 13).toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {patient.isEmergency && (
                              <Badge variant="destructive" className="text-xs">
                                Emergency
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getStepName(patient.onboardingStep)}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Progress: {getStepName(patient.onboardingStep)}</span>
                            <span>{Math.round(getStepProgress(patient.onboardingStep))}%</span>
                          </div>
                          <Progress value={getStepProgress(patient.onboardingStep)} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Started: {formatTimeAgo(patient.createdAt)}</span>
                            {patient.admissionLocation && (
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {patient.admissionLocation}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end">
                          <Link 
                            href={
                              patient.onboardingStep === 1 
                                ? `/onboarding/personal?patientId=${patient.id}`
                                : patient.onboardingStep === 2 
                                ? `/onboarding/insurance?patientId=${patient.id}`
                                : patient.onboardingStep === 3 
                                ? `/onboarding/medical?patientId=${patient.id}`
                                : `/onboarding/confirmation?patientId=${patient.id}`
                            }
                          >
                            <Button size="sm" variant="outline">
                              Continue Onboarding
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg text-gray-900">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-gray-900">{activity.description || `Patient ${activity.patientName || 'Unknown'} ${activity.action || 'updated'}`}</p>
                          <p className="text-gray-500 text-xs">{formatTimeAgo(activity.createdAt || new Date().toISOString())}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mt-6">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/">
                  <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
                    <User className="h-4 w-4 mr-2" />
                    Start New Patient
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Patient Support
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Completed Patients Summary */}
        {completedPatients.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mt-8">
            <CardHeader>
              <CardTitle className="flex items-center text-xl text-gray-900">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Recently Completed ({completedPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedPatients.slice(0, 6).map((patient) => (
                  <div
                    key={patient.id}
                    className="border border-green-200 bg-green-50 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {patient.admissionLocation || "Room assignment pending"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Completed: {patient.completedAt ? formatTimeAgo(patient.completedAt) : "Recently"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}