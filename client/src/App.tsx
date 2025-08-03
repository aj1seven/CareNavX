import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Welcome from "@/pages/welcome";
import OnboardingPersonal from "@/pages/onboarding-personal";
import OnboardingEmergency from "@/pages/onboarding-emergency";
import OnboardingMedical from "@/pages/onboarding-medical";
import OnboardingConfirmation from "@/pages/onboarding-confirmation";
import Help from "@/pages/help";
import HealthAssistant from "@/pages/health-assistant";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/onboarding/personal" component={OnboardingPersonal} />
      <Route path="/onboarding/emergency" component={OnboardingEmergency} />
      <Route path="/onboarding/medical" component={OnboardingMedical} />
      <Route path="/onboarding/confirmation" component={OnboardingConfirmation} />
      <Route path="/help" component={Help} />
      <Route path="/health-assistant" component={HealthAssistant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
