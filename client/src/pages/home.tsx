import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hospital, UserPlus, AlertTriangle, Users, Activity, Clock, Ambulance } from "lucide-react";
import { DashboardStats } from "@/components/dashboard-stats";
import { OnboardingForm } from "@/components/onboarding-form";
import { NavigationSidebar } from "@/components/navigation-sidebar";
import { ConfirmationModal } from "@/components/confirmation-modal";

export default function Home() {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedPatient, setCompletedPatient] = useState<any>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<{
    patientsToday: number;
    pendingOnboarding: number;
    emergencyCases: number;
    completedOnboarding: number;
  }>({
    queryKey: ["/api/stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const handleOnboardingComplete = (patient: any) => {
    setCompletedPatient(patient);
    setShowOnboarding(false);
  };

  const handleCloseModal = () => {
    setCompletedPatient(null);
  };

  const handleNewOnboarding = () => {
    setShowOnboarding(true);
  };

  const handleEmergencyOnboarding = () => {
    setEmergencyMode(true);
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return (
      <OnboardingForm
        emergencyMode={emergencyMode}
        onComplete={handleOnboardingComplete}
        onCancel={() => {
          setShowOnboarding(false);
          setEmergencyMode(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="bg-card-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Hospital className="h-8 w-8 text-medical-blue" />
                <h1 className="text-xl font-bold text-text-primary">CareNav-X</h1>
              </div>
              <span className="text-text-secondary text-sm">Hospital Onboarding System</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Emergency Mode Toggle */}
              <div className="flex items-center space-x-2 bg-emergency-red bg-opacity-10 px-3 py-1 rounded-full">
                <AlertTriangle className="h-4 w-4 text-emergency-red" />
                <span className="text-emergency-red font-medium text-sm">Emergency Mode</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emergency-red focus:ring-offset-2 ${
                    emergencyMode ? 'bg-emergency-red' : 'bg-gray-200'
                  }`}
                  onClick={() => setEmergencyMode(!emergencyMode)}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                      emergencyMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <img 
                  className="h-8 w-8 rounded-full" 
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&h=32" 
                  alt="Staff member" 
                />
                <span className="text-text-primary font-medium">Dr. Sarah Johnson</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Dashboard Stats */}
            <DashboardStats stats={stats} isLoading={statsLoading} />
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Patient Onboarding</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button 
                    onClick={handleNewOnboarding}
                    className="bg-medical-blue hover:bg-blue-700 text-white"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    New Patient Onboarding
                  </Button>
                  <Button 
                    onClick={handleEmergencyOnboarding}
                    variant="destructive"
                    className="bg-emergency-red hover:bg-red-700"
                  >
                    <Ambulance className="h-4 w-4 mr-2" />
                    Emergency Onboarding
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activitiesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                ) : activities && Array.isArray(activities) && activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity: any) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.action === 'onboarding_completed' ? 'bg-success-green' :
                          activity.action === 'patient_created' ? 'bg-medical-blue' :
                          'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-text-primary text-sm font-medium">{activity.description}</p>
                          <p className="text-text-secondary text-xs">
                            {activity.createdAt ? new Date(activity.createdAt).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-text-secondary text-sm">No recent activities</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <NavigationSidebar />
        </div>
      </main>

      {/* Confirmation Modal */}
      {completedPatient && (
        <ConfirmationModal 
          patient={completedPatient} 
          onClose={handleCloseModal} 
        />
      )}
    </div>
  );
}
