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
const PlatformUpdatesPage = React.lazy(
  () => import('./pages/PlatformUpdatesPage')
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
const PrivacyPolicyPage = React.lazy(
  () => import('./components/legal/PrivacyPolicyPage')
);
const TermsOfServicePage = React.lazy(
  () => import('./components/legal/TermsOfServicePage')
);
const DataProcessingPage = React.lazy(
  () => import('./components/legal/DataProcessingPage')
);
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
const AuthDialogDebug = React.lazy(
  () => import('./components/debug/AuthDialogDebug')
);
const ConsentTimestampFixer = React.lazy(
  () => import('./components/debug/ConsentTimestampFixer')
);
const ConsentManagement = React.lazy(
  () => import('./components/admin/ConsentManagement')
);
const PricingPage = React.lazy(
  () => import('./components/pricing/PricingPage')
);
const SubscriptionDashboard = React.lazy(
  () => import('./components/subscription/SubscriptionDashboard')
);
const ThusangSubscriptionPage = React.lazy(
  () => import('./components/subscription/ThusangSubscriptionPage')
);
const SubscriptionUpgrade = React.lazy(
  () => import('./components/subscription/SubscriptionUpgrade')
);
const SubscriptionTierPage = React.lazy(
  () => import('./components/subscription/SubscriptionTierPage')
);
const MmogoMockupsPage = React.lazy(() => import('./pages/MmogoMockupsPage'));

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

  // ✅ Enhanced loading fallback component with better UX
  const LoadingFallback = ({ name }: { name?: string }) => (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <div className="space-y-2">
          <p className="text-lg font-medium text-foreground">
            {name ? `Loading ${name}...` : 'Loading...'}
          </p>
          <p className="text-sm text-muted-foreground">
            Please wait while we prepare your content
          </p>
        </div>
      </div>
    </div>
  );

  // ✅ Component-specific loading fallbacks
  const ComponentLoader = ({ name }: { name: string }) => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground">Loading {name}...</p>
      </div>
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

            {/* Demo routes with specific loading states */}
            <Route
              path="/demo"
              element={
                <Suspense fallback={<ComponentLoader name="Demo Portal" />}>
                  <DemoHome />
                </Suspense>
              }
            />
            <Route
              path="/demo/issues"
              element={
                <Suspense fallback={<ComponentLoader name="Demo Issues" />}>
                  <DemoIssuesPage />
                </Suspense>
              }
            />
            <Route
              path="/demo/reports"
              element={
                <Suspense fallback={<ComponentLoader name="Demo Reports" />}>
                  <DemoReportsPage />
                </Suspense>
              }
            />
            <Route
              path="/demo/stakeholder"
              element={
                <Suspense
                  fallback={
                    <ComponentLoader name="Demo Stakeholder Dashboard" />
                  }
                >
                  <DemoStakeholderDashboard />
                </Suspense>
              }
            />
            <Route
              path="/demo/user/:userId"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Demo User Dashboard" />}
                >
                  <DemoUserDashboard />
                </Suspense>
              }
            />
            <Route
              path="/demo/profile"
              element={
                <Suspense fallback={<ComponentLoader name="Demo Profile" />}>
                  <DemoUserDashboard />
                </Suspense>
              }
            />
            <Route
              path="/demo/mmogo-ecosystem"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Mmogo Ecosystem Mockups" />}
                >
                  <MmogoMockupsPage />
                </Suspense>
              }
            />

            {/* Static pages */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route
              path="/pricing"
              element={
                <Suspense fallback={<ComponentLoader name="Pricing" />}>
                  <PricingPage />
                </Suspense>
              }
            />

            {/* Subscription routes */}
            <Route
              path="/subscription"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Subscription Dashboard" />}
                >
                  <SubscriptionDashboard />
                </Suspense>
              }
            />
            <Route
              path="/subscription/thusang"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Thusang Projects" />}
                >
                  <ThusangSubscriptionPage />
                </Suspense>
              }
            />
            <Route
              path="/subscription/:tier"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Subscription Tier" />}
                >
                  <SubscriptionTierPage />
                </Suspense>
              }
            />
            <Route
              path="/subscription/upgrade"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Subscription Upgrade" />}
                >
                  <SubscriptionUpgrade />
                </Suspense>
              }
            />

            {/* Legal pages */}
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/legal/terms" element={<TermsOfServicePage />} />
            <Route
              path="/legal/data-processing"
              element={<DataProcessingPage />}
            />

            {/* Debug and test pages */}
            <Route path="/test-tabs" element={<TabsTestComponent />} />
            <Route path="/debug-db" element={<DatabaseTest />} />
            <Route path="/debug-auth" element={<AuthDialogDebug />} />
            <Route path="/debug-consent" element={<ConsentTimestampFixer />} />
            <Route path="/admin/consent" element={<ConsentManagement />} />

            {/* User-specific routes - require authentication */}
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <Suspense
                    fallback={<ComponentLoader name="User Dashboard" />}
                  >
                    <UserDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/:userId/issues"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<ComponentLoader name="Issues" />}>
                    <IssuesPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            <Route
              path="/user/:userId/profile"
              element={
                <ProtectedRoute>
                  <Suspense fallback={<ComponentLoader name="Profile" />}>
                    <ProfilePage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Legacy routes for backward compatibility */}
            <Route
              path="/issues"
              element={
                <Suspense fallback={<ComponentLoader name="Issues" />}>
                  <IssuesPage />
                </Suspense>
              }
            />
            <Route
              path="/reports"
              element={
                <Suspense fallback={<ComponentLoader name="Reports" />}>
                  <ReportsPage />
                </Suspense>
              }
            />
            <Route
              path="/platform-updates"
              element={
                <Suspense
                  fallback={<ComponentLoader name="Platform Updates" />}
                >
                  <PlatformUpdatesPage />
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<ComponentLoader name="Profile" />}>
                  <ProfilePage />
                </Suspense>
              }
            />
            <Route
              path="/profile/:userId"
              element={
                <Suspense fallback={<ComponentLoader name="Profile" />}>
                  <ProfilePage />
                </Suspense>
              }
            />

            {/* Stakeholder dashboard - requires specific role */}
            <Route
              path="/stakeholder"
              element={
                <ProtectedRoute allowedRoles={['official', 'admin']}>
                  <Suspense
                    fallback={<ComponentLoader name="Stakeholder Dashboard" />}
                  >
                    <StakeholderDashboard />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Admin panel - requires admin role */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Suspense fallback={<ComponentLoader name="Admin Panel" />}>
                    <AdminPage />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Add this for Tempo storyboards */}
            {import.meta.env['VITE_TEMPO'] && (
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
