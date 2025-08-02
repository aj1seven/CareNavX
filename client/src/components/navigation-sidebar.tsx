import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Navigation, 
  Activity, 
  PlusCircle, 
  List, 
  BarChart3,
  MapPin,
  Clock
} from "lucide-react";

export function NavigationSidebar() {
  const { data: navigation, isLoading: navLoading } = useQuery<any[]>({
    queryKey: ["/api/navigation"],
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/activities"],
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      {/* Hospital Navigation */}
      <Card className="bg-card-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Navigation className="h-5 w-5" />
            <span>Hospital Navigation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {navLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : navigation && Array.isArray(navigation) && navigation.length > 0 ? (
            <div className="space-y-3">
              {navigation.slice(0, 3).map((dept: any) => (
                <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-medical-blue" />
                    <span className="text-text-primary font-medium">{dept.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-text-secondary" />
                    <span className="text-success-green text-sm">{dept.walkTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Navigation data unavailable</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="bg-card-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : activities && Array.isArray(activities) && activities.length > 0 ? (
            <div className="space-y-3">
              {activities.slice(0, 3).map((activity: any) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.action === 'onboarding_completed' ? 'bg-success-green' :
                    activity.action === 'patient_created' ? 'bg-medical-blue' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="text-text-primary text-sm font-medium line-clamp-2">
                      {activity.description}
                    </p>
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

      {/* Quick Actions */}
      <Card className="bg-card-white shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-3 h-auto"
              onClick={() => {/* Handle emergency onboarding */}}
            >
              <PlusCircle className="h-4 w-4 mr-3 text-emergency-red" />
              <span className="text-text-primary">Emergency Onboarding</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start p-3 h-auto"
              onClick={() => {/* Handle view waiting list */}}
            >
              <List className="h-4 w-4 mr-3 text-medical-blue" />
              <span className="text-text-primary">View Waiting List</span>
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start p-3 h-auto"
              onClick={() => {/* Handle generate report */}}
            >
              <BarChart3 className="h-4 w-4 mr-3 text-success-green" />
              <span className="text-text-primary">Daily Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
