import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const AuthenticatedRoute = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isSessionValid());

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/mediation"
              element={
                <AuthenticatedRoute>
                  <MediationList />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/mediation/new"
              element={
                <AuthenticatedRoute>
                  <MediationNew />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/mediation/:sessionId"
              element={
                <AuthenticatedRoute>
                  <MediationDashboard />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/mediation/:sessionId/perspective"
              element={
                <AuthenticatedRoute>
                  <MediationPerspectivePage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/mediation/:sessionId/discussion"
              element={
                <AuthenticatedRoute>
                  <MediationDiscussionPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/boundaries-agreements"
              element={
                <AuthenticatedRoute>
                  <RelationshipCareOverviewPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/boundaries-agreements/goals/:goalId"
              element={
                <AuthenticatedRoute>
                  <PersonalGoalDetailPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/boundaries-agreements/agreements/new"
              element={
                <AuthenticatedRoute>
                  <AgreementEditorPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/boundaries-agreements/agreements/:agreementId"
              element={
                <AuthenticatedRoute>
                  <AgreementDetailPage />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/boundaries-agreements/agreements/:agreementId/revise"
              element={
                <AuthenticatedRoute>
                  <AgreementEditorPage />
                </AuthenticatedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
