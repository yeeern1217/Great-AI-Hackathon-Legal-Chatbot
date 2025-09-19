import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Header from "@/components/layout/header";
import Home from "@/pages/home";
import ChatAssistant from "@/pages/chat-assistant";
import Portals from "@/pages/portals";
import NotFound from "@/pages/not-found";
import LabourContractAnalysis from "@/pages/labour-contract-analysis";
import LegalExperts from "@/pages/legalExperts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chat-assistant" component={ChatAssistant} />
      <Route path="/portals" component={Portals} />
      <Route path="/labour-contract-analysis" component={LabourContractAnalysis} />
      <Route path="/legal-experts" component={LegalExperts} />

      {/* ✅ fallback route */}
      <Route>
        <NotFound />
      </Route>
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
