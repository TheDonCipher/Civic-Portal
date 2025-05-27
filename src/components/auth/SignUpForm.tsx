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
import { useAuth } from '@/lib/auth';
import { sanitizeText, sanitizeEmail } from '@/lib/sanitization';
import { SimpleLegalConsent } from '@/components/auth/SimpleLegalConsent';
import { EnhancedLegalConsent } from '@/components/auth/EnhancedLegalConsent';
import {
  storeLegalConsent,
  validateLegalConsentStorage,
  CURRENT_LEGAL_VERSIONS,
} from '@/lib/services/legalConsentService';

const formSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof formSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
}

export default function SignUpForm({ onSuccess = () => {} }: SignUpFormProps) {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [legalConsentsAccepted, setLegalConsentsAccepted] =
    React.useState(false);
  const [consentTimestamps, setConsentTimestamps] = React.useState<{
    termsAcceptedAt?: Date;
    privacyAcceptedAt?: Date;
    dataProcessingAcceptedAt?: Date;
  }>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Check legal consent acceptance - now more flexible
      if (!legalConsentsAccepted) {
        toast({
          title: 'Legal Consent Required',
          description:
            'Please accept the Terms of Service and Privacy Policy to continue. You can complete additional agreements after account creation.',
          variant: 'destructive',
        });
        return;
      }

      // Sanitize inputs before submission
      const sanitizedEmail = sanitizeEmail(data.email);
      const sanitizedFullName = sanitizeText(data.fullName, 100);

      if (!sanitizedEmail) {
        throw new Error('Please enter a valid email address');
      }

      if (!sanitizedFullName) {
        throw new Error('Please enter a valid full name');
      }

      // Create the user account
      const { data: authData, error: authError } = await signUp(
        sanitizedEmail,
        data.password,
        {
          full_name: sanitizedFullName,
        }
      );

      if (authError) {
        throw authError;
      }

      // Store legal consent if user was created successfully
      if (authData?.user?.id) {
        try {
          const consentResult = await storeLegalConsent(authData.user.id, {
            termsAccepted: true,
            termsAcceptedAt: consentTimestamps.termsAcceptedAt,
            privacyAccepted: true,
            privacyAcceptedAt: consentTimestamps.privacyAcceptedAt,
            dataProcessingConsent: true,
            dataProcessingAcceptedAt:
              consentTimestamps.dataProcessingAcceptedAt,
            marketingOptIn: false,
            timestamp: new Date(),
            versions: CURRENT_LEGAL_VERSIONS,
            // IP address and user agent will be handled by the service
          });

          if (!consentResult.success) {
            console.warn('Failed to store legal consent:', consentResult.error);
            // Don't fail the signup for consent storage issues, but log it
          } else {
            // Validate that the consent was stored correctly
            const validationResult = await validateLegalConsentStorage(
              authData.user.id
            );
            if (validationResult.success && validationResult.isValid) {
              console.log('Legal consent validation passed');
            } else {
              console.warn(
                'Legal consent validation failed:',
                validationResult.error
              );
            }
          }
        } catch (consentError) {
          console.error('Error storing legal consent:', consentError);
          // Continue with signup even if consent storage fails
        }
      }

      toast({
        title: 'Success',
        description:
          'Your account has been created. Please check your email for verification.',
        variant: 'default',
      });
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create account',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="your.email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Legal Consent */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Legal Agreements</label>
          <EnhancedLegalConsent
            onAccept={setLegalConsentsAccepted}
            onTimestampsChange={setConsentTimestamps}
            className="border rounded-lg p-4 bg-muted/20"
            disabled={form.formState.isSubmitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || !legalConsentsAccepted}
        >
          {form.formState.isSubmitting ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
}
