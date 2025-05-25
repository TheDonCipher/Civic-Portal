import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/utils';

// Enhanced validation schema
const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email is too long')
    .transform((email) => email.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password is too long'),
});

type SignInFormValues = z.infer<typeof signInSchema>;

interface EnhancedSignInFormProps {
  onSuccess?: () => void;
  onForgotPassword?: () => void;
  className?: string;
}

export function EnhancedSignInForm({
  onSuccess = () => {},
  onForgotPassword = () => {},
  className = '',
}: EnhancedSignInFormProps) {
  const { toast } = useToast();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onBlur', // Real-time validation
  });

  const onSubmit = async (data: SignInFormValues) => {
    // Rate limiting check
    if (attemptCount >= 5) {
      setIsRateLimited(true);
      toast({
        title: 'Too Many Attempts',
        description: 'Please wait 15 minutes before trying again.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(data.email),
        password: data.password, // Don't sanitize password as it may contain special chars
      };

      const result = await signIn(sanitizedData.email, sanitizedData.password);

      if (result.error) {
        throw result.error;
      }

      // Reset attempt count on success
      setAttemptCount(0);
      setIsRateLimited(false);

      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in to Civic Portal',
        variant: 'success',
      });

      onSuccess();
    } catch (error: any) {
      setAttemptCount((prev) => prev + 1);

      // Enhanced error handling
      let errorMessage = 'Failed to sign in. Please check your credentials.';

      if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error?.message?.includes('Email not confirmed')) {
        errorMessage =
          'Please check your email and click the verification link before signing in.';
      } else if (error?.message?.includes('Too many requests')) {
        errorMessage =
          'Too many sign-in attempts. Please wait before trying again.';
        setIsRateLimited(true);
      }

      toast({
        title: 'Sign In Failed',
        description: `${errorMessage} (Attempt ${attemptCount + 1}/5)`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`space-y-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-6 border border-blue-100 dark:border-blue-800 shadow-lg dark:shadow-blue-900/20 ${className}`}
    >
      {/* Header */}
      <div className="text-center space-y-3 pb-4 border-b border-blue-100 dark:border-blue-800">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-full shadow-md border-2 border-blue-200 dark:border-blue-600">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-300" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          Welcome back
        </h2>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Sign in to your Civic Portal account
        </p>
      </div>

      {/* Rate limiting warning */}
      {attemptCount >= 3 && !isRateLimited && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {attemptCount >= 4
              ? 'Last attempt before temporary lockout. Consider resetting your password.'
              : `${
                  5 - attemptCount
                } attempts remaining before temporary lockout.`}
          </AlertDescription>
        </Alert>
      )}

      {isRateLimited && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Account temporarily locked due to multiple failed attempts. Please
            wait 15 minutes or reset your password.
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
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    disabled={isLoading || isRateLimited}
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading || isRateLimited}
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isRateLimited}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Hide password' : 'Show password'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              className="px-0 font-normal text-sm"
              onClick={onForgotPassword}
              disabled={isLoading}
            >
              Forgot your password?
            </Button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11"
            disabled={isLoading || isRateLimited}
            isLoading={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Form>

      {/* Security Notice */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Your connection is secured with end-to-end encryption
        </p>
      </div>
    </div>
  );
}

export default EnhancedSignInForm;
