import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Shield,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/utils';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long')
    .transform((email) => email.toLowerCase().trim()),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFlowProps {
  onBack?: () => void;
  onSuccess?: () => void;
  className?: string;
}

export function ForgotPasswordFlow({
  onBack = () => {},
  onSuccess = () => {},
  className = '',
}: ForgotPasswordFlowProps) {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    if (resendCount >= 3) {
      toast({
        title: 'Too Many Requests',
        description:
          'Please wait 15 minutes before requesting another reset email.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const sanitizedEmail = sanitizeInput(data.email);

      await resetPassword(sanitizedEmail);

      setEmailSent(true);
      setSentEmail(sanitizedEmail);
      setResendCount((prev) => prev + 1);

      // Temporarily disable resend for 60 seconds
      setCanResend(false);
      setTimeout(() => setCanResend(true), 60000);

      toast({
        title: 'Reset Email Sent',
        description: 'Check your email for password reset instructions.',
        variant: 'success',
      });
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';

      if (error?.message?.includes('User not found')) {
        errorMessage = 'No account found with this email address.';
      } else if (error?.message?.includes('Too many requests')) {
        errorMessage =
          'Too many reset requests. Please wait before trying again.';
      }

      toast({
        title: 'Reset Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (canResend && resendCount < 3) {
      form.handleSubmit(onSubmit)();
    }
  };

  if (emailSent) {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Check Your Email
            </h2>
            <p className="text-muted-foreground mt-2">
              We've sent password reset instructions to
            </p>
            <p className="font-medium text-primary">{sentEmail}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="font-medium flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Next Steps:
          </h3>
          <ol className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                1
              </span>
              Check your email inbox (and spam folder)
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                2
              </span>
              Click the "Reset Password" link in the email
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                3
              </span>
              Create a new secure password
            </li>
            <li className="flex items-start gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
                4
              </span>
              Sign in with your new password
            </li>
          </ol>
        </div>

        {/* Security Notice */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> The reset link will expire in 1
            hour for your security. If you don't receive the email within a few
            minutes, check your spam folder.
          </AlertDescription>
        </Alert>

        {/* Resend and Navigation */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Didn't receive the email?
          </div>

          <Button
            variant="outline"
            onClick={handleResend}
            disabled={!canResend || resendCount >= 3}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {!canResend ? 'Wait 60 seconds to resend' : 'Resend Email'}
          </Button>

          {resendCount >= 3 && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Maximum resend attempts reached. Please wait 15 minutes before
                trying again.
              </AlertDescription>
            </Alert>
          )}

          <Button variant="ghost" onClick={onBack} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a reset link
        </p>
      </div>

      {/* Rate Limiting Warning */}
      {resendCount >= 2 && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {resendCount >= 3
              ? 'Maximum reset attempts reached. Please wait 15 minutes.'
              : `${
                  3 - resendCount
                } attempts remaining before temporary lockout.`}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    disabled={isLoading || resendCount >= 3}
                    className="h-11"
                  />
                </FormControl>
                <FormDescription>
                  We'll send password reset instructions to this email
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || resendCount >= 3}
            isLoading={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      </Form>

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={onBack}
        disabled={isLoading}
        className="w-full"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sign In
      </Button>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Reset links expire after 1 hour for your security
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordFlow;
