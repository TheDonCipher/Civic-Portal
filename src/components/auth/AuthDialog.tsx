import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast-enhanced";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import ResetPasswordForm from "./ResetPasswordForm";

interface AuthDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: "sign-in" | "sign-up";
}

const AuthDialog = ({
  open = false,
  onOpenChange = () => {},
  defaultTab = "sign-in",
}: AuthDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "sign-in" | "sign-up" | "reset-password"
  >(defaultTab);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[400px] bg-background">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to Civic Portal
          </DialogTitle>
          <p className="text-center text-muted-foreground mt-1">
            Join our community to report and track civic issues
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="sign-in">Sign In</TabsTrigger>
            <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="sign-in" className="mt-4">
            <SignInForm onSuccess={() => onOpenChange(false)} />
            <div className="mt-4 text-center">
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setActiveTab("reset-password")}
              >
                Forgot your password?
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="sign-up" className="mt-4">
            <SignUpForm
              onSuccess={() => {
                setActiveTab("sign-in");
              }}
            />
          </TabsContent>

          <TabsContent value="reset-password" className="mt-4">
            <ResetPasswordForm
              onSuccess={() => {
                setActiveTab("sign-in");
              }}
            />
            <div className="mt-4 text-center">
              <Button
                variant="link"
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setActiveTab("sign-in")}
              >
                Back to Sign In
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
