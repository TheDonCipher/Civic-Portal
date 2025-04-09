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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast-enhanced";
import { handleAuthError, showSuccess } from "@/lib/utils/errorHandler";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

interface ResetPasswordFormProps {
  onSuccess?: () => void;
}

const ResetPasswordForm = ({ onSuccess }: ResetPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        throw error;
      }

      showSuccess(
        "Password Reset Email Sent",
        "Please check your email for instructions to reset your password.",
        [{ label: "Email", value: data.email }],
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Password reset error:", error);
      handleAuthError(error, {
        toastTitle: "Password Reset Failed",
        toastDescription: error.message || "Please check your email address",
        details: [{ label: "Email", value: data.email }],
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-lg font-semibold">Reset Your Password</h2>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we'll send you instructions to reset
            your password.
          </p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  autoComplete="email"
                  {...field}
                  disabled={isLoading}
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
              Sending...
            </>
          ) : (
            "Send Reset Instructions"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
