import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { EnhancedSignInForm } from "./EnhancedSignInForm";
import { EnhancedSignUpForm } from "./EnhancedSignUpForm";
import { ForgotPasswordFlow } from "./ForgotPasswordFlow";
import { cn } from "@/lib/utils";

interface EnhancedAuthDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: "sign-in" | "sign-up";
  className?: string;
}

type AuthView = "sign-in" | "sign-up" | "forgot-password";

export function EnhancedAuthDialog({
  open = false,
  onOpenChange = () => {},
  defaultTab = "sign-in",
  className = ""
}: EnhancedAuthDialogProps) {
  const [currentView, setCurrentView] = useState<AuthView>(defaultTab);

  const handleSuccess = () => {
    onOpenChange(false);
    // Reset to sign-in view for next time
    setCurrentView("sign-in");
  };

  const handleSignUpSuccess = () => {
    // After successful sign-up, show sign-in form
    setCurrentView("sign-in");
  };

  const renderContent = () => {
    switch (currentView) {
      case "sign-in":
        return (
          <EnhancedSignInForm
            onSuccess={handleSuccess}
            onForgotPassword={() => setCurrentView("forgot-password")}
          />
        );
      
      case "sign-up":
        return (
          <EnhancedSignUpForm
            onSuccess={handleSignUpSuccess}
            onSignIn={() => setCurrentView("sign-in")}
          />
        );
      
      case "forgot-password":
        return (
          <ForgotPasswordFlow
            onBack={() => setCurrentView("sign-in")}
            onSuccess={() => setCurrentView("sign-in")}
          />
        );
      
      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (currentView) {
      case "sign-in":
        return "Welcome to Civic Portal";
      case "sign-up":
        return "Join Civic Portal";
      case "forgot-password":
        return "Reset Your Password";
      default:
        return "Civic Portal";
    }
  };

  const getDialogDescription = () => {
    switch (currentView) {
      case "sign-in":
        return "Sign in to report issues and engage with your community";
      case "sign-up":
        return "Create an account to participate in Botswana's civic community";
      case "forgot-password":
        return "We'll help you regain access to your account";
      default:
        return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "w-[95vw] max-w-[480px] max-h-[90vh] overflow-y-auto bg-background",
          "sm:max-w-[520px] lg:max-w-[600px]",
          className
        )}
      >
        <DialogHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              {getDialogTitle()}
            </DialogTitle>
            <Badge variant="secondary" className="text-xs">
              Botswana
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {getDialogDescription()}
          </p>
        </DialogHeader>

        {/* Tab Navigation - Only show for sign-in/sign-up */}
        {(currentView === "sign-in" || currentView === "sign-up") && (
          <Tabs 
            value={currentView} 
            onValueChange={(value) => setCurrentView(value as AuthView)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign-in" className="text-sm">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="text-sm">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="sign-in" className="mt-6">
              <EnhancedSignInForm
                onSuccess={handleSuccess}
                onForgotPassword={() => setCurrentView("forgot-password")}
              />
            </TabsContent>
            
            <TabsContent value="sign-up" className="mt-6">
              <EnhancedSignUpForm
                onSuccess={handleSignUpSuccess}
                onSignIn={() => setCurrentView("sign-in")}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Forgot Password Flow */}
        {currentView === "forgot-password" && (
          <div className="mt-6">
            <ForgotPasswordFlow
              onBack={() => setCurrentView("sign-in")}
              onSuccess={() => setCurrentView("sign-in")}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              By using Civic Portal, you agree to our{" "}
              <a 
                href="/terms" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a 
                href="/privacy" 
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure connection</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EnhancedAuthDialog;
