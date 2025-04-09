import { useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import { IssuesPage } from "./components/issues/IssuesPage";
import { ReportsPage } from "./components/reports/ReportsPage";
import ProfilePage from "./components/profile/ProfilePage";
import StakeholderDashboard from "./components/stakeholder/StakeholderDashboard";
import AboutPage from "./components/about/AboutPage";
import FAQPage from "./components/faq/FAQPage";
import { useAuth } from "./lib/auth";
import AuthDialog from "./components/auth/AuthDialog";
import TestingBanner from "./components/TestingBanner";
import routes from "tempo-routes";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Toaster } from "./components/ui/toaster-enhanced";
import { ensureTablesExist } from "./lib/utils/dbFunctions";

function App() {
  const { user, profile, isLoading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  // Check URL params for signin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signin") === "true" && !user) {
      setIsAuthDialogOpen(true);
      // Clean up the URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [user]);

  // Verify database tables exist on app startup
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        await ensureTablesExist();
      } catch (error) {
        console.error("Database verification error:", error);
      }
    };

    checkDatabase();
  }, []);

  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;

  return (
    <ErrorBoundary>
      {tempoRoutes}
      <TestingBanner />
      <div className="pt-10">
        {/* Add padding to account for the testing banner */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/issues" element={<IssuesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/stakeholder" element={<StakeholderDashboard />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
        </Routes>
      </div>
      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
