import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { sanitizeInput, cn } from '@/lib/utils';
import { StepIndicator } from '@/components/ui/step-indicator';
import { PasswordStrength } from '@/components/ui/password-strength';
import { RoleExplainer } from '@/components/auth/RoleExplainer';
import { ConstituencySelector } from '@/components/auth/ConstituencySelector';
import { DepartmentSelector } from '@/components/auth/DepartmentSelector';
import { SimpleCaptcha } from '@/components/auth/SimpleCaptcha';
import { SimpleLegalConsent } from '@/components/auth/SimpleLegalConsent';
import { EnhancedLegalConsent } from '@/components/auth/EnhancedLegalConsent';
import { getDepartmentIdByName } from '@/lib/services/departmentService';
import {
  storeLegalConsent,
  validateLegalConsentStorage,
  CURRENT_LEGAL_VERSIONS,
} from '@/lib/services/legalConsentService';

// Enhanced validation schema for step 1 (Basic Info)
const step1Schema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .max(254, 'Email is too long')
      .transform((email) => email.toLowerCase().trim()),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Step 2 schema (Personal Info) - Dynamic based on role
const step2Schema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Full name can only contain letters, spaces, hyphens, and apostrophes'
      ),
    role: z.enum(['citizen', 'official'], {
      required_error: 'Please select your role',
    }),
    constituency: z.string().optional(),
    department: z.string().optional(),
  })
  .refine(
    (data) => {
      // Citizens must select a constituency
      if (data.role === 'citizen' && !data.constituency) {
        return false;
      }
      // Officials must select a department
      if (data.role === 'official' && !data.department) {
        return false;
      }
      return true;
    },
    {
      message:
        'Please select your constituency or department based on your role',
      path: ['constituency'], // This will be overridden in the component
    }
  );

// Combined schema
const signUpSchema = step1Schema.and(step2Schema);

type SignUpFormValues = z.infer<typeof signUpSchema>;

interface EnhancedSignUpFormProps {
  onSuccess?: () => void;
  onSignIn?: () => void;
  className?: string;
}

const STEPS = [
  { id: 1, title: 'Account Setup', description: 'Create your secure account' },
  { id: 2, title: 'Personal Info', description: 'Complete your profile' },
  { id: 3, title: 'Verification', description: 'Verify your email' },
];

export function EnhancedSignUpForm({
  onSuccess = () => {},
  onSignIn = () => {},
  className = '',
}: EnhancedSignUpFormProps) {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [legalConsentsAccepted, setLegalConsentsAccepted] = useState(false);
  const [consentTimestamps, setConsentTimestamps] = useState<{
    termsAcceptedAt?: Date;
    privacyAcceptedAt?: Date;
    dataProcessingAcceptedAt?: Date;
  }>({});
  const formContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(currentStep === 1 ? step1Schema : signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: 'citizen' as const,
      constituency: '',
      department: '',
    },
    mode: 'onBlur',
  });

  const watchedPassword = form.watch('password');

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      return await form.trigger(['email', 'password', 'confirmPassword']);
    } else if (currentStep === 2) {
      const role = form.getValues('role');
      const fieldsToValidate = ['fullName', 'role'];

      // Add role-specific validation
      if (role === 'citizen') {
        fieldsToValidate.push('constituency');
      } else if (role === 'official') {
        fieldsToValidate.push('department');
      }

      return await form.trigger(fieldsToValidate as any);
    }
    return true;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < 3) {
      setCurrentStep(currentStep + 1);

      // Scroll to top of the dialog when moving to next step
      setTimeout(() => {
        // First try the form container ref
        if (formContainerRef.current) {
          formContainerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          return;
        }

        // Try multiple selectors to find the scrollable container
        const selectors = [
          '[role="dialog"]',
          '.auth-dialog-enhanced',
          '[data-radix-dialog-content]',
          '.max-w-\\[480px\\]',
          '.overflow-y-auto',
        ];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          }
        }

        // Fallback: scroll the window itself
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);

      // Scroll to top of the dialog when moving to previous step
      setTimeout(() => {
        // First try the form container ref
        if (formContainerRef.current) {
          formContainerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          return;
        }

        // Try multiple selectors to find the scrollable container
        const selectors = [
          '[role="dialog"]',
          '.auth-dialog-enhanced',
          '[data-radix-dialog-content]',
          '.max-w-\\[480px\\]',
          '.overflow-y-auto',
        ];

        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            element.scrollTo({ top: 0, behavior: 'smooth' });
            break;
          }
        }

        // Fallback: scroll the window itself
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 150);
    }
  };

  // Create account
  const createAccount = async (formData: SignUpFormValues) => {
    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(formData.email),
        fullName: sanitizeInput(formData.fullName),
        role: formData.role,
        constituency: formData.constituency
          ? sanitizeInput(formData.constituency)
          : null,
        department: formData.department
          ? sanitizeInput(formData.department)
          : null,
      };

      // For officials, get department ID from department name
      let departmentId: string | null = null;
      if (sanitizedData.role === 'official' && sanitizedData.department) {
        const departmentResult = await getDepartmentIdByName(
          sanitizedData.department
        );
        if (!departmentResult.success) {
          throw new Error(
            departmentResult.error || 'Invalid department selected'
          );
        }
        departmentId = departmentResult.departmentId!;
      }

      // Create the user account
      const { data: authData, error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          full_name: sanitizedData.fullName,
          role: sanitizedData.role,
          constituency: sanitizedData.constituency,
          department_id: departmentId,
          // Set verification status based on role
          verification_status:
            sanitizedData.role === 'official' ? 'pending' : 'verified',
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
            console.log(
              'Legal consent stored successfully with individual timestamps'
            );

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

      // Show appropriate success message based on role
      const successMessage =
        sanitizedData.role === 'official'
          ? 'Account created! Please check your email for verification and wait for admin approval.'
          : 'Account created successfully! Please check your email for a verification link.';

      toast({
        title: 'Account Created Successfully!',
        description: successMessage,
        variant: 'default',
      });

      // Move to verification step
      setCurrentStep(3);
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';

      if (error?.message?.includes('already registered')) {
        errorMessage =
          'An account with this email already exists. Try signing in instead.';
      } else if (error?.message?.includes('Password')) {
        errorMessage = 'Password does not meet security requirements.';
      } else if (error?.message?.includes('department')) {
        errorMessage = 'Invalid department selected. Please try again.';
      }

      toast({
        title: 'Registration Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SignUpFormValues) => {
    if (currentStep === 1) {
      await nextStep();
      return;
    }

    if (currentStep === 2) {
      // Check CAPTCHA verification before creating account
      if (!captchaVerified) {
        toast({
          title: 'Security Check Required',
          description:
            'Please complete the security verification before continuing.',
          variant: 'destructive',
        });
        return;
      }

      // Check legal consent acceptance - more flexible approach
      if (!legalConsentsAccepted) {
        toast({
          title: 'Legal Consent Required',
          description:
            'Please accept the required legal agreements to continue. You can complete additional agreements after account creation if needed.',
          variant: 'destructive',
        });
        return;
      }

      // Additional validation for officials
      if (data.role === 'official' && !data.department) {
        toast({
          title: 'Department Required',
          description: 'Government officials must select their department.',
          variant: 'destructive',
        });
        return;
      }

      // Additional validation for citizens
      if (data.role === 'citizen' && !data.constituency) {
        toast({
          title: 'Constituency Required',
          description: 'Citizens must select their constituency.',
          variant: 'destructive',
        });
        return;
      }

      // Create the account
      await createAccount(data);
      return;
    }

    // Step 3 (Verification) doesn't need form submission
    if (currentStep >= 3) {
      return;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
        <p className="text-muted-foreground">
          Join Botswana's Civic Portal community
        </p>
      </div>

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
                disabled={isLoading}
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
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
            {watchedPassword && <PasswordStrength password={watchedPassword} />}
          </FormItem>
        )}
      />

      {/* Confirm Password Field */}
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirm Password
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                  className="h-11 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Personal Information
        </h2>
        <p className="text-muted-foreground">
          Tell us about yourself to complete your profile
        </p>
      </div>

      {/* Full Name Field */}
      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Full Name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter your full name as per ID"
                autoComplete="name"
                disabled={isLoading}
                className="h-11"
              />
            </FormControl>
            <FormDescription>
              Please enter your full name exactly as it appears on your
              government-issued ID
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Role Selection */}
      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Type</FormLabel>
            <FormControl>
              <RoleExplainer
                selectedRole={field.value}
                onRoleSelect={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Role-based Location Selection */}
      {form.watch('role') === 'citizen' && (
        <FormField
          control={form.control}
          name="constituency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Constituency
              </FormLabel>
              <FormControl>
                <ConstituencySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select your constituency"
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Select the constituency where you reside or work
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {form.watch('role') === 'official' && (
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Government Department
              </FormLabel>
              <FormControl>
                <DepartmentSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select your department"
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Select the government department where you work
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Security Check (CAPTCHA) */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Security Verification</label>
        <SimpleCaptcha
          onVerify={setCaptchaVerified}
          className="border rounded-lg p-4 bg-muted/20"
        />
      </div>

      {/* Legal Consent */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Legal Agreements</label>
        <EnhancedLegalConsent
          onAccept={setLegalConsentsAccepted}
          onTimestampsChange={setConsentTimestamps}
          className="border rounded-lg p-4 bg-muted/20"
          disabled={isLoading}
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {form.getValues('role') === 'official'
              ? 'Account Created - Pending Approval'
              : 'Check Your Email'}
          </h2>
          <p className="text-muted-foreground mt-2">
            {form.getValues('role') === 'official'
              ? 'Your government official account has been created and is pending admin approval'
              : "We've sent a verification link to your email address"}
          </p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <h3 className="font-medium">Next Steps:</h3>
        <ol className="text-sm text-muted-foreground space-y-2 text-left">
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
              1
            </span>
            Check your email inbox for a verification message
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
              2
            </span>
            Click the verification link in the email
          </li>
          <li className="flex items-start gap-2">
            <span className="flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs font-medium">
              3
            </span>
            {form.getValues('role') === 'official'
              ? "Wait for admin approval (you'll receive an email notification)"
              : 'Start using Civic Portal immediately'}
          </li>
        </ol>
      </div>

      {form.getValues('role') === 'official' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Government Official Account:</strong> Your account requires
            verification by our administrators. This process typically takes 1-2
            business days. You'll receive an email once approved.
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={onSuccess} className="w-full">
        Continue to Sign In
      </Button>
    </div>
  );

  return (
    <div
      className={cn(
        'space-y-6 bg-transparent backdrop-blur-sm rounded-lg p-6',
        className
      )}
      ref={formContainerRef}
    >
      {/* Step Indicator */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        variant="enhanced"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}

              <Button
                type="submit"
                disabled={
                  isLoading ||
                  (currentStep === 2 &&
                    (!captchaVerified ||
                      !legalConsentsAccepted ||
                      (form.watch('role') === 'official' &&
                        !form.watch('department')) ||
                      (form.watch('role') === 'citizen' &&
                        !form.watch('constituency'))))
                }
                isLoading={isLoading}
                className={cn(
                  'flex-1 font-semibold transition-all duration-300',
                  'bg-gradient-to-r from-[var(--gov-primary)] to-[var(--gov-primary-light)]',
                  'hover:from-[var(--gov-primary-dark)] hover:to-[var(--gov-primary)]',
                  'text-white shadow-lg hover:shadow-xl',
                  'transform hover:scale-[1.02] active:scale-[0.98]',
                  'border-0'
                )}
                style={{
                  background:
                    isLoading ||
                    (currentStep === 2 &&
                      (!captchaVerified ||
                        !legalConsentsAccepted ||
                        (form.watch('role') === 'official' &&
                          !form.watch('department')) ||
                        (form.watch('role') === 'citizen' &&
                          !form.watch('constituency'))))
                      ? undefined
                      : 'var(--botswana-gradient)',
                }}
              >
                {currentStep === 2 ? 'Create Account' : 'Continue'}
                {currentStep === 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Sign In Link */}
      {currentStep === 1 && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button
              type="button"
              variant="link"
              className={cn(
                'px-0 font-semibold text-[var(--gov-primary)]',
                'hover:text-[var(--gov-primary-dark)] transition-colors duration-200'
              )}
              onClick={onSignIn}
              disabled={isLoading}
            >
              Sign in here
            </Button>
          </p>
        </div>
      )}
    </div>
  );
}

export default EnhancedSignUpForm;
