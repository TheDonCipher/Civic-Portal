import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EmailVerificationCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        console.log('Starting email verification process...');
        console.log('Current URL:', window.location.href);
        console.log(
          'Expected callback URL format: http://localhost:5173/auth/callback?token_hash=...&type=signup'
        );

        // Parse URL hash parameters (Supabase uses hash-based URLs)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );

        // Check for error parameters first
        const error = hashParams.get('error') || searchParams.get('error');
        const errorDescription =
          hashParams.get('error_description') ||
          searchParams.get('error_description');

        if (error) {
          console.error('Email verification error:', error, errorDescription);

          // Handle specific Supabase errors
          if (
            error === 'server_error' &&
            errorDescription?.includes('Error confirming user')
          ) {
            setStatus('error');
            setErrorMessage(
              'Email verification failed due to Supabase configuration.\n\n' +
                'This is a known issue that occurs when:\n' +
                '• Supabase redirect URLs are not properly configured\n' +
                '• Email confirmation settings need adjustment\n' +
                '• The verification link format is incorrect\n\n' +
                'For development: Use the "Skip Verification" button below.\n' +
                'For production: Contact your administrator to fix Supabase settings.'
            );
          } else {
            setStatus('error');
            setErrorMessage(
              errorDescription
                ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
                : 'Email verification failed'
            );
          }
          return;
        }

        // Extract tokens from URL
        const accessToken =
          hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken =
          hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const type = hashParams.get('type') || searchParams.get('type');

        console.log('URL parameters:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          error,
        });

        // Try to verify the email using the token hash (preferred method)
        const tokenHash =
          hashParams.get('token_hash') || searchParams.get('token_hash');

        if (tokenHash && type === 'signup') {
          console.log('Attempting to verify email with token hash...');

          try {
            // Use Supabase's verifyOtp method for email verification
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'signup',
            });

            if (verifyError) {
              console.error('Email verification error:', verifyError);
              // Don't return here, try other methods
            } else if (data.user) {
              console.log('Email verified successfully:', data.user.id);
              setStatus('success');
              toast({
                title: 'Email Verified Successfully!',
                description:
                  'Your account has been activated. Welcome to Civic Portal!',
                variant: 'success',
              });
              setTimeout(() => {
                navigate(`/user/${data.user.id}`, { replace: true });
              }, 2000);
              return;
            }
          } catch (error) {
            console.error('Verification attempt failed:', error);
            // Continue to try other methods
          }
        }

        // If we have tokens, try to set the session manually
        if (accessToken && refreshToken) {
          console.log('Setting session with tokens...');
          const { data, error: setSessionError } =
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

          if (setSessionError) {
            console.error('Set session error:', setSessionError);
            setStatus('error');
            setErrorMessage(
              'Failed to establish session. Please try signing in manually.'
            );
            return;
          }

          if (data.user) {
            console.log('Session established successfully:', data.user.id);
            setStatus('success');
            toast({
              title: 'Email Verified Successfully!',
              description:
                'Your account has been activated. Welcome to Civic Portal!',
              variant: 'success',
            });
            setTimeout(() => {
              navigate(`/user/${data.user.id}`, { replace: true });
            }, 2000);
            return;
          }
        }

        // Wait for Supabase to process the URL automatically
        console.log('Waiting for Supabase to process authentication...');
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Check current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log('Session check result:', {
          session: !!session,
          user: !!session?.user,
          error: sessionError,
        });

        if (session?.user) {
          console.log('User authenticated successfully:', session.user.id);
          setStatus('success');
          toast({
            title: 'Email Verified Successfully!',
            description:
              'Your account has been activated. Welcome to Civic Portal!',
            variant: 'success',
          });
          setTimeout(() => {
            navigate(`/user/${session.user.id}`, { replace: true });
          }, 2000);
          return;
        }

        // If no session found, show error
        console.log('No valid session found, showing error');
        setStatus('error');
        setErrorMessage('Invalid verification link or link has expired.');
      } catch (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setErrorMessage(
          'An unexpected error occurred during email verification.'
        );
      }
    };

    handleEmailVerification();
  }, [searchParams, navigate, toast]);

  const handleReturnHome = () => {
    navigate('/', { replace: true });
  };

  const handleResendVerification = () => {
    navigate('/?signin=true', { replace: true });
  };

  const handleManualVerification = async () => {
    if (!import.meta.env.DEV) return; // Only in development

    try {
      setStatus('loading');

      // Try to get current user and manually verify
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (user && !user.email_confirmed_at) {
        // In development, we can try to sign in the user directly
        const email = user.email;

        toast({
          title: 'Development Mode',
          description: 'Attempting manual verification for development...',
          variant: 'default',
        });

        // Redirect to sign in with a message
        navigate('/?signin=true&dev_verify=true', { replace: true });
      } else {
        setStatus('error');
        setErrorMessage('No unverified user found.');
      }
    } catch (error) {
      console.error('Manual verification error:', error);
      setStatus('error');
      setErrorMessage('Manual verification failed.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
            <CardTitle>Verifying Your Email</CardTitle>
            <CardDescription>
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-green-800">
              Email Verified Successfully!
            </CardTitle>
            <CardDescription>
              Your account has been activated. You'll be redirected to your
              dashboard shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                🎉 Welcome to Botswana Civic Portal!
              </div>
              <Button
                onClick={() =>
                  navigate('/user/' + searchParams.get('user_id'), {
                    replace: true,
                  })
                }
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-red-800">
            Email Verification Failed
          </CardTitle>
          <CardDescription className="whitespace-pre-line">
            {errorMessage || 'We were unable to verify your email address.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <strong>Common issues:</strong>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Verification link has expired</li>
              <li>• Link has already been used</li>
              <li>• Email was forwarded or modified</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button onClick={handleResendVerification} className="w-full">
              Request New Verification Email
            </Button>
            {import.meta.env.DEV && (
              <Button
                onClick={handleManualVerification}
                variant="secondary"
                className="w-full"
              >
                🔧 Dev: Skip Verification
              </Button>
            )}
            <Button
              onClick={handleReturnHome}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EmailVerificationCallback;
