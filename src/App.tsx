import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import ErrorBoundary from './components/common/ErrorBoundary';
import { Toaster } from './components/ui/toaster-enhanced';
import { ensureTablesExist } from './lib/utils/dbFunctions';
import { ConnectionStatus } from './components/common/ConnectionStatus';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { logConfigurationStatus } from './utils/supabaseConfigCheck';
// import routes from 'tempo-routes'; // Disabled - not using Tempo

// Lazy load components to reduce initial bundle size
const Home = React.lazy(() => import('./components/home'));
const DemoHome = React.lazy(() => import('./components/demo/DemoHome'));
const DemoStakeholderDashboard = React.lazy(
  () => import('./components/demo/DemoStakeholderDashboard')
);
const DemoReportsPage = React.lazy(
  () => import('./components/demo/DemoReportsPage')
);
const DemoUserDashboard = React.lazy(
  () => import('./components/demo/DemoUserDashboard')
);
const DemoIssuesPage = React.lazy(
  () => import('./components/demo/DemoIssuesPage')
);
const IssuesPage = React.lazy(() =>
  import('./components/issues/IssuesPage').then((module) => ({
    default: module.IssuesPage,
  }))
);
const ReportsPage = React.lazy(() =>
  import('./components/reports/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  }))
);
const ProfilePage = React.lazy(
  () => import('./components/profile/ProfilePage')
);
const StakeholderDashboard = React.lazy(
  () => import('./components/stakeholder/StakeholderDashboard')
);
const AdminPage = React.lazy(() => import('./components/admin/AdminPage'));
const AboutPage = React.lazy(() => import('./components/about/AboutPage'));
const FAQPage = React.lazy(() => import('./components/faq/FAQPage'));
const AuthDialog = React.lazy(() => import('./components/auth/AuthDialog'));
const TestingBanner = React.lazy(() => import('./components/TestingBanner'));
const UserDashboard = React.lazy(
  () => import('./components/user/UserDashboard')
);
const EmailVerificationCallback = React.lazy(
  () => import('./components/auth/EmailVerificationCallback')
);
const TabsTestComponent = React.lazy(() =>
  import('./components/test/TabsTestComponent').then((module) => ({
    default: module.TabsTestComponent,
  }))
);
const DatabaseTest = React.lazy(
  () => import('./components/debug/DatabaseTest')
);

function App() {
  const { user, profile, isLoading } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const location = useLocation();

  // Check URL params for signin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === 'true') {
      setIsAuthDialogOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Note: Removed automatic redirect to allow signed-in users to access home page

  // Verify database tables exist on app startup
  useEffect(() => {
    const checkDatabase = async () => {
      try {
        await ensureTablesExist();
        console.log('Database tables verified successfully');

        // Run configuration check in development
        if (import.meta.env.DEV) {
          setTimeout(() => {
            logConfigurationStatus();
          }, 1000);
        }
      } catch (error) {
        console.error('Database verification error:', error);
        // Add more visible error for demo purposes
        if (import.meta.env.DEV) {
          console.warn(
            'Database connection issue - this may affect app functionality'
          );
        }
      }
    };

    checkDatabase();
  }, []);

  // For Tempo routes - this needs to be outside the Routes component
  // Use a more permissive check for VITE_TEMPO
  // const tempoRoutes = import.meta.env.VITE_TEMPO ? useRoutes(routes) : null; // Disabled - not using Tempo

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="pt-10">
        {/* Add padding to account for the testing banner */}
        <Suspense fallback={<div className="h-10 bg-yellow-100"></div>}>
          <TestingBanner />
        </Suspense>

        {/* Render Tempo routes if enabled */}
        {/* {tempoRoutes} */}

        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Public demo routes - accessible to everyone */}
            <Route path="/" element={<Home />} />
            <Route
              path="/auth/callback"
              element={<EmailVerificationCallback />}
            />
            <Route path="/demo" element={<DemoHome />} />
            <Route path="/demo/issues" element={<DemoIssuesPage />} />
            <Route path="/demo/reports" element={<DemoReportsPage />} />
            <Route
              path="/demo/stakeholder"
              element={<DemoStakeholderDashboard />}
            />
            <Route path="/demo/user/:userId" element={<DemoUserDashboard />} />
            <Route path="/demo/profile" element={<DemoUserDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/test-tabs" element={<TabsTestComponent />} />
            <Route path="/debug-db" element={<DatabaseTest />} />

            {/* User-specific routes - require authentication */}
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId/issues"
              element={
                <ProtectedRoute>
                  <IssuesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/:userId/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Legacy routes for backward compatibility */}
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Stakeholder dashboard - requires specific role */}
            <Route
              path="/stakeholder"
              element={
                <ProtectedRoute allowedRoles={['official', 'admin']}>
                  <StakeholderDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin panel - requires admin role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Add this for Tempo storyboards */}
            {import.meta.env.VITE_TEMPO && (
              <Route path="/tempobook/*" element={null} />
            )}

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <AuthDialog
          open={isAuthDialogOpen}
          onOpenChange={setIsAuthDialogOpen}
        />
      </Suspense>
      <ConnectionStatus />
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
