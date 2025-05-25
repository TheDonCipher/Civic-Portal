import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { EnhancedAuthDialog } from '@/components/auth/EnhancedAuthDialog';
import { OnboardingFlow } from '@/components/auth/OnboardingFlow';
import { LegalConsent } from '@/components/auth/LegalConsent';
import { useAuth } from '@/lib/auth';

/**
 * Example component demonstrating the enhanced authentication system
 * This shows how to integrate the new authentication components
 */
export function EnhancedAuthExample() {
  const { user, profile } = useAuth();
  const [showBasicAuth, setShowBasicAuth] = useState(false);
  const [showEnhancedAuth, setShowEnhancedAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showLegalConsent, setShowLegalConsent] = useState(false);

  const handleLegalConsentAccept = (consents: any) => {
    console.log('Legal consents accepted:', consents);
    setShowLegalConsent(false);
  };

  const handleOnboardingComplete = () => {
    console.log('Onboarding completed');
    setShowOnboarding(false);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Enhanced Authentication System</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Demonstration of the comprehensive authentication system for Botswana's Civic Portal,
          featuring modern UI/UX, enhanced security, and Botswana-specific requirements.
        </p>
      </div>

      {/* Current User Status */}
      {user && profile ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Welcome back!
              <Badge variant={profile.role === 'official' ? 'default' : 'secondary'}>
                {profile.role === 'official' ? 'Government Official' : 'Citizen'}
              </Badge>
            </CardTitle>
            <CardDescription>
              You are currently signed in to Civic Portal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {profile.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Constituency:</strong> {profile.constituency || 'Not specified'}</p>
            {profile.role === 'official' && (
              <p><strong>Department:</strong> {profile.department_id || 'Not assigned'}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Not Signed In</CardTitle>
            <CardDescription>
              Try the authentication components below
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Authentication Components Demo */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Authentication</CardTitle>
            <CardDescription>
              Original authentication dialog with basic features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowBasicAuth(true)}
              className="w-full"
            >
              Open Basic Auth
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Enhanced Authentication
              <Badge variant="default" className="text-xs">New</Badge>
            </CardTitle>
            <CardDescription>
              Modern multi-step authentication with enhanced security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowEnhancedAuth(true)}
              className="w-full"
            >
              Open Enhanced Auth
            </Button>
          </CardContent>
        </Card>

        {/* Onboarding Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Onboarding Flow</CardTitle>
            <CardDescription>
              Guided tour for new users explaining platform features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowOnboarding(true)}
              className="w-full"
              disabled={!profile}
            >
              {profile ? 'Show Onboarding' : 'Sign in first'}
            </Button>
          </CardContent>
        </Card>

        {/* Legal Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Legal Consent</CardTitle>
            <CardDescription>
              Terms of Service and Privacy Policy consent management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setShowLegalConsent(true)}
              className="w-full"
            >
              Show Legal Consent
            </Button>
          </CardContent>
        </Card>

        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Security Features</CardTitle>
            <CardDescription>
              Rate limiting, input sanitization, and session management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>✓ Rate limiting (5 attempts/15min)</p>
              <p>✓ Input sanitization</p>
              <p>✓ Password strength validation</p>
              <p>✓ Session security</p>
            </div>
          </CardContent>
        </Card>

        {/* Botswana Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Botswana Features</CardTitle>
            <CardDescription>
              Constituency selection and government verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>✓ 57 constituencies</p>
              <p>✓ Government ID validation</p>
              <p>✓ Official email verification</p>
              <p>✓ Admin approval workflow</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>
            Comparison between basic and enhanced authentication systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-center py-2">Basic</th>
                  <th className="text-center py-2">Enhanced</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2">Multi-step registration</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Password strength indicator</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Rate limiting</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Role selection</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Constituency selection</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Legal consent tracking</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Government verification</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Onboarding flow</td>
                  <td className="text-center">❌</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Mobile responsive</td>
                  <td className="text-center">⚠️</td>
                  <td className="text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-2">Accessibility (WCAG 2.1)</td>
                  <td className="text-center">⚠️</td>
                  <td className="text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AuthDialog
        open={showBasicAuth}
        onOpenChange={setShowBasicAuth}
        enhanced={false}
      />

      <EnhancedAuthDialog
        open={showEnhancedAuth}
        onOpenChange={setShowEnhancedAuth}
      />

      {showOnboarding && profile && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <OnboardingFlow
                user={profile}
                onComplete={handleOnboardingComplete}
                onSkip={handleOnboardingComplete}
              />
            </div>
          </div>
        </div>
      )}

      {showLegalConsent && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <LegalConsent
                onAccept={handleLegalConsentAccept}
                onDecline={() => setShowLegalConsent(false)}
                showOptional={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedAuthExample;
