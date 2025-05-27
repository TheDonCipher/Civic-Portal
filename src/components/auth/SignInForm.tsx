import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useToast } from '@/components/ui/use-toast-enhanced';
import { useAuth } from '@/hooks/useAuth';
import { useAuthRateLimit, formatTimeRemaining } from '@/hooks/useRateLimit';
import { sanitizeEmail, sanitizeText } from '@/lib/utils';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
}

export function SignInForm({ onSuccess = () => {} }: SignInFormProps) {
  const { toast } = useToast();
  const { signIn } = useAuth();
  const rateLimit = useAuthRateLimit();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Check rate limiting
    if (rateLimit.isRateLimited) {
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${formatTimeRemaining(
          rateLimit.timeUntilReset
        )} before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    // Record the attempt
    if (!rateLimit.recordAttempt()) {
      return; // Rate limited
    }

    try {
      // Sanitize inputs
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedPassword = sanitizeText(data.password);

      if (!sanitizedEmail) {
        throw new Error('Please enter a valid email address');
      }

      await signIn(sanitizedEmail, sanitizedPassword);

      // Reset rate limit on successful login
      rateLimit.reset();

      toast({
        title: 'Success',
        description: 'You have successfully signed in',
        variant: 'success',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to sign in',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label="Sign in to your account"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="signin-email">Email Address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="signin-email"
                  type="email"
                  placeholder="your.email@example.com"
                  autoComplete="email"
                  aria-describedby={
                    form.formState.errors.email ? 'email-error' : undefined
                  }
                  aria-invalid={!!form.formState.errors.email}
                  required
                />
              </FormControl>
              <FormMessage id="email-error" role="alert" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="signin-password">Password</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="signin-password"
                  type="password"
                  placeholder="••••••"
                  autoComplete="current-password"
                  aria-describedby={
                    form.formState.errors.password
                      ? 'password-error'
                      : undefined
                  }
                  aria-invalid={!!form.formState.errors.password}
                  required
                />
              </FormControl>
              <FormMessage id="password-error" role="alert" />
            </FormItem>
          )}
        />
        {rateLimit.isRateLimited && (
          <div
            className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            Too many sign-in attempts. Please wait{' '}
            {formatTimeRemaining(rateLimit.timeUntilReset)} before trying again.
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || rateLimit.isRateLimited}
          aria-describedby={
            rateLimit.isRateLimited ? 'rate-limit-message' : undefined
          }
        >
          {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>

        {rateLimit.attemptsRemaining < 3 && rateLimit.attemptsRemaining > 0 && (
          <p
            className="text-sm text-muted-foreground text-center"
            role="status"
            aria-live="polite"
          >
            {rateLimit.attemptsRemaining} attempt
            {rateLimit.attemptsRemaining !== 1 ? 's' : ''} remaining
          </p>
        )}
      </form>
    </Form>
  );
}

export default SignInForm;
