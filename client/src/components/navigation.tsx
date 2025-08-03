import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  User, 
  HelpCircle, 
  LayoutDashboard,
  Heart,
  Brain,
  CheckCircle,
  Stethoscope
} from "lucide-react";

interface NavigationProps {
  currentStep?: string;
  patientId?: string;
}

export default function Navigation({ currentStep, patientId }: NavigationProps) {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    {
      path: "/",
      label: "Welcome",
      icon: Home,
      description: "Home"
    },
    {
      path: "/health-assistant",
      label: "Health Assistant",
      icon: Brain,
      description: "AI Health"
    },
    {
      path: "/help",
      label: "Help",
      icon: HelpCircle,
      description: "Support"
    }
  ];

  // Show onboarding steps if we have a patient ID (3-step flow)
  const onboardingSteps = patientId ? [
    {
      path: `/onboarding/personal?patientId=${patientId}`,
      label: "Personal",
      icon: User,
      step: "personal",
      description: "Step 1"
    },
    {
      path: `/onboarding/medical?patientId=${patientId}`,
      label: "Medical",
      icon: Brain,
      step: "medical",
      description: "Step 2"
    },
    {
      path: `/onboarding/confirmation?patientId=${patientId}`,
      label: "Complete",
      icon: CheckCircle,
      step: "confirmation",
      description: "Step 3"
    }
  ] : [];

  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Consistent CareNavX Branding */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                  CareNavX
                </span>
                <span className="text-xs text-gray-500 -mt-1">Smart Healthcare</span>
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className={`${
                    isActive(item.path) 
                      ? "bg-blue-600 text-white" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Onboarding Progress */}
          {onboardingSteps.length > 0 && (
            <div className="hidden lg:flex items-center space-x-2">
              <span className="text-sm text-gray-500 mr-2">Progress:</span>
              {onboardingSteps.map((step, index) => (
                <Link key={step.path} href={step.path}>
                  <Badge
                    variant={currentStep === step.step ? "default" : "outline"}
                    className={`cursor-pointer text-xs ${
                      currentStep === step.step
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <step.icon className="h-3 w-3 mr-1" />
                    {step.label}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Current Step Indicator */}
          {currentStep && (
            <div className="md:hidden">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}