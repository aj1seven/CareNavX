import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, Ambulance, CheckCircle } from "lucide-react";

interface StatsProps {
  stats?: {
    patientsToday: number;
    pendingOnboarding: number;
    emergencyCases: number;
    completedOnboarding: number;
  };
  isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: StatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      title: "Patients Today",
      value: stats?.patientsToday || 0,
      icon: Users,
      bgColor: "bg-medical-blue bg-opacity-10",
      iconColor: "text-medical-blue",
      trend: "↗ 12% from yesterday",
      trendColor: "text-success-green"
    },
    {
      title: "Pending Onboarding",
      value: stats?.pendingOnboarding || 0,
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
      trend: "Average wait: 12 min",
      trendColor: "text-text-secondary"
    },
    {
      title: "Emergency Cases",
      value: stats?.emergencyCases || 0,
      icon: Ambulance,
      bgColor: "bg-emergency-red bg-opacity-10",
      iconColor: "text-emergency-red",
      trend: "Immediate attention",
      trendColor: "text-emergency-red"
    },
    {
      title: "Completed Today",
      value: stats?.completedOnboarding || 0,
      icon: CheckCircle,
      bgColor: "bg-success-green bg-opacity-10",
      iconColor: "text-success-green",
      trend: "Processing efficiently",
      trendColor: "text-success-green"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <Card key={index} className="bg-card-white shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`${stat.iconColor} h-5 w-5`} />
              </div>
            </div>
            <div className="mt-2">
              <span className={`${stat.trendColor} text-sm font-medium`}>{stat.trend}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
