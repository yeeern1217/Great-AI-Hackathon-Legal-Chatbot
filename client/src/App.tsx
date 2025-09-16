import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/layout/header";
import Home from "@/pages/home";
import Portals from "@/pages/portals";
import NotFound from "@/pages/not-found";
import TenancyAgreementAnalysis from "@/pages/tenancy-agreement-analysis";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/portals" component={Portals} />
      <Route path="/tenancy-agreement-analysis" component={TenancyAgreementAnalysis} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
