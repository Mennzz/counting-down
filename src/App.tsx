import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { MediationDashboard } from "./pages/mediation/MediationDashboard";
import { MediationDiscussionPage } from "./pages/mediation/MediationDiscussionPage";
import { MediationList } from "./pages/mediation/MediationList";
import { MediationNew } from "./pages/mediation/MediationNew";
import { MediationPerspectivePage } from "./pages/mediation/MediationPerspectivePage";
import { isSessionValid } from "@/utils/cookies";
import { AgreementDetailPage } from "./pages/relationship-care/AgreementDetail";
import { AgreementEditorPage } from "./pages/relationship-care/AgreementEditor";
import { RelationshipCareOverviewPage } from "./pages/relationship-care/RelationshipCareOverview";
import { PersonalGoalDetailPage } from "./pages/relationship-care/PersonalGoalDetail";
import { XiaoBaoProvider } from "@/hooks/use-xiaobao";
import { XiaoBaoLauncher } from "@/components/xiaobao/XiaoBaoLauncher";
import XiaoBaoPage from "./pages/XiaoBaoPage";
import RelationshipProfilePage from "./pages/RelationshipProfilePage";
import XiaoBaoInboxPage from "./pages/XiaoBaoInboxPage";
import XiaoBaoRoutinesPage from "./pages/XiaoBaoRoutinesPage";

const queryClient = new QueryClient();

const AuthenticatedShell = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isSessionValid());

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <XiaoBaoProvider>
      <Outlet />
      <XiaoBaoLauncher />
    </XiaoBaoProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AuthenticatedShell />}>
              <Route path="/" element={<Index />} />
              <Route path="/xiaobao" element={<XiaoBaoPage />} />
              <Route path="/xiaobao/routines" element={<XiaoBaoRoutinesPage />} />
              <Route path="/xiaobao/inbox" element={<XiaoBaoInboxPage />} />
              <Route path="/relationship-context" element={<RelationshipProfilePage />} />
              <Route path="/mediation" element={<MediationList />} />
              <Route path="/mediation/new" element={<MediationNew />} />
              <Route path="/mediation/:sessionId" element={<MediationDashboard />} />
              <Route path="/mediation/:sessionId/perspective" element={<MediationPerspectivePage />} />
              <Route path="/mediation/:sessionId/discussion" element={<MediationDiscussionPage />} />
              <Route path="/boundaries-agreements" element={<RelationshipCareOverviewPage />} />
              <Route path="/boundaries-agreements/goals/:goalId" element={<PersonalGoalDetailPage />} />
              <Route path="/boundaries-agreements/agreements/new" element={<AgreementEditorPage />} />
              <Route path="/boundaries-agreements/agreements/:agreementId" element={<AgreementDetailPage />} />
              <Route path="/boundaries-agreements/agreements/:agreementId/revise" element={<AgreementEditorPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
