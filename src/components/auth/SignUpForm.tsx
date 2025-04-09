import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast-enhanced";
import { handleAuthError, showSuccess } from "@/lib/utils/errorHandler";
import {
  isStrongPassword,
  getPasswordStrength,
} from "@/lib/utils/validationUtils";
import { Loader2 } from "lucide-react";
import { constituencies } from "@/lib/constituencies";

const formSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name is too long"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine(isStrongPassword, {
        message:
          "Password must include uppercase, lowercase, number, and special character",
      }),
    confirmPassword: z.string(),
    constituency: z.string().min(1, "Constituency is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      constituency: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        full_name: data.fullName,
        constituency: data.constituency,
      });

      if (error) {
        throw error;
      }

      showSuccess(
        "Sign up successful",
        "Please check your email to verify your account.",
        [{ label: "Email", value: data.email }],
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      handleAuthError(error, {
        toastTitle: "Sign up failed",
        toastDescription: error.message || "An error occurred during sign up",
        details: [{ label: "Email", value: data.email }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update password strength indicator when password changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const strength = getPasswordStrength(password);
    setPasswordStrength(strength);
    form.setValue("password", password);
  };

  return (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        Create an account to start reporting and tracking civic issues in your
        community.
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
                    autoComplete="name"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="constituency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Constituency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your constituency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {constituencies.map((constituency) => (
                      <SelectItem
                        key={constituency}
                        value={constituency.toLowerCase()}
                      >
                        {constituency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  <Input
                    type="password"
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    {...field}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />
                </FormControl>
                {field.value && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs">Password strength:</span>
                      <span className="text-xs font-medium">
                        {passwordStrength.score === 0
                          ? "Weak"
                          : passwordStrength.score === 1
                            ? "Fair"
                            : passwordStrength.score === 2
                              ? "Good"
                              : passwordStrength.score === 3
                                ? "Strong"
                                : "Very Strong"}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          passwordStrength.score <= 1
                            ? "bg-red-500"
                            : passwordStrength.score === 2
                              ? "bg-yellow-500"
                              : passwordStrength.score === 3
                                ? "bg-green-500"
                                : "bg-green-600"
                        }`}
                        style={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                      ></div>
                    </div>
                    {passwordStrength.feedback && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {passwordStrength.feedback}
                      </p>
                    )}
                  </div>
                )}
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
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};

export default SignUpForm;
