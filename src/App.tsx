import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import ImageAnalysis from "./pages/ImageAnalysis";
import PlanningAssistant from "./pages/PlanningAssistant";
import AIAdvisor from "./pages/AIAdvisor";
import ReportGenerator from "./pages/ReportGenerator";
import SettingsPage from "./pages/Settings";
import Auth from "./pages/Auth";
import LandingPage from "./pages/LandingPage";
import { NotificationProvider } from "@/hooks/useNotifications";
import NotFound from "./pages/NotFound";
import AboutPage from "./pages/legal/AboutPage";
import PrivacyPolicyPage from "./pages/legal/PrivacyPolicyPage";
import TermsPage from "./pages/legal/TermsPage";
import CookiePolicyPage from "./pages/legal/CookiePolicyPage";
import MedicalDisclaimerPage from "./pages/legal/MedicalDisclaimerPage";
import { CookieConsentBanner } from "./components/CookieConsentBanner";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/auth" replace />;

  return (
    <AppLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="image-analysis" element={<ImageAnalysis />} />
        <Route path="image-analyzis" element={<Navigate to="/dashboard/image-analysis" replace />} />
        <Route path="planning" element={<PlanningAssistant />} />
        <Route path="ai-advisor" element={<AIAdvisor />} />
        <Route path="reports" element={<ReportGenerator />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppLayout>
  );
}

function AuthRoute() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <CookieConsentBanner />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/medical-disclaimer" element={<MedicalDisclaimerPage />} />
              <Route path="/image-analysis" element={<Navigate to="/dashboard/image-analysis" replace />} />
              <Route path="/image-analyzis" element={<Navigate to="/dashboard/image-analysis" replace />} />
              <Route path="/dashboard/*" element={<ProtectedRoutes />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
