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
import { sanitizeInput } from '@/lib/utils';
import { StepIndicator } from '@/components/ui/step-indicator';
import { PasswordStrength } from '@/components/ui/password-strength';
import { RoleExplainer } from '@/components/auth/RoleExplainer';
import { ConstituencySelector } from '@/components/auth/ConstituencySelector';
import { DepartmentSelector } from '@/components/auth/DepartmentSelector';
import { SimpleCaptcha } from '@/components/auth/SimpleCaptcha';

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
  { id: 2, title: 'Personal Info', description: 'Tell us about yourself' },
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
  const formContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(currentStep === 1 ? step1Schema : signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      role: undefined,
      constituency: '',
      department: '',
    },
    mode: 'onBlur',
  });

  const watchedPassword = form.watch('password');

  const validateCurrentStep = async () => {
    const isValid = await form.trigger(
      currentStep === 1
        ? ['email', 'password', 'confirmPassword']
        : ['fullName', 'role', 'constituency']
    );
    return isValid;
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
          '.max-w-\\[600px\\]',
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
          '.max-w-\\[600px\\]',
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

  const onSubmit = async (data: SignUpFormValues) => {
    if (currentStep < 2) {
      await nextStep();
      return;
    }

    // Check CAPTCHA verification before proceeding
    if (!captchaVerified) {
      toast({
        title: 'Security Check Required',
        description:
          'Please complete the security verification before continuing.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Sanitize inputs
      const sanitizedData = {
        email: sanitizeInput(data.email),
        fullName: sanitizeInput(data.fullName),
        role: data.role,
        constituency: data.constituency
          ? sanitizeInput(data.constituency)
          : null,
        department: data.department ? sanitizeInput(data.department) : null,
      };

      await signUp(data.email, data.password, {
        full_name: sanitizedData.fullName,
        role: sanitizedData.role,
        constituency: sanitizedData.constituency,
        department: sanitizedData.department,
      });

      setCurrentStep(3); // Move to verification step

      toast({
        title: 'Account Created Successfully!',
        description: 'Please check your email for a verification link.',
        variant: 'success',
      });
    } catch (error: any) {
      let errorMessage = 'Failed to create account. Please try again.';

      if (error?.message?.includes('already registered')) {
        errorMessage =
          'An account with this email already exists. Try signing in instead.';
      } else if (error?.message?.includes('Password')) {
        errorMessage = 'Password does not meet security requirements.';
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
            Check Your Email
          </h2>
          <p className="text-muted-foreground mt-2">
            We've sent a verification link to your email address
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
            {form.watch('role') === 'official'
              ? "Wait for admin approval (you'll receive an email notification)"
              : 'Start using Civic Portal immediately'}
          </li>
        </ol>
      </div>

      {form.watch('role') === 'official' && (
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
      className={`space-y-6 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-6 border border-blue-100 dark:border-blue-800 shadow-lg dark:shadow-blue-900/20 ${className}`}
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
                disabled={isLoading || (currentStep === 2 && !captchaVerified)}
                isLoading={isLoading}
                className="flex-1"
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
              className="px-0 font-normal"
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
