import React, { useState } from "react";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Users, 
  MessageSquare, 
  Vote, 
  Eye, 
  Building2,
  BarChart3,
  Settings,
  Bell,
  MapPin,
  Lightbulb,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StepIndicator } from "@/components/ui/step-indicator";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/auth";

interface OnboardingFlowProps {
  user: UserProfile;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

const ONBOARDING_STEPS = [
  { id: 1, title: "Welcome", description: "Get started with Civic Portal" },
  { id: 2, title: "Features", description: "Discover what you can do" },
  { id: 3, title: "Community", description: "Connect with your community" },
  { id: 4, title: "Ready", description: "You're all set!" },
];

const CITIZEN_FEATURES = [
  {
    icon: MessageSquare,
    title: "Report Issues",
    description: "Submit civic issues in your constituency",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: Vote,
    title: "Vote & Support",
    description: "Vote on issues that matter to you",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    icon: Eye,
    title: "Track Progress",
    description: "Follow issues and get updates",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    icon: Lightbulb,
    title: "Propose Solutions",
    description: "Share your ideas for solving problems",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
];

const OFFICIAL_FEATURES = [
  {
    icon: Building2,
    title: "Manage Issues",
    description: "Handle department-specific civic issues",
    color: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    icon: BarChart3,
    title: "View Analytics",
    description: "Track department performance metrics",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    icon: Settings,
    title: "Update Status",
    description: "Provide official updates on issues",
    color: "bg-purple-50 text-purple-600 border-purple-200",
  },
  {
    icon: Target,
    title: "Coordinate",
    description: "Work with other departments",
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
];

export function OnboardingFlow({ 
  user, 
  onComplete = () => {}, 
  onSkip = () => {},
  className = ""
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const isOfficial = user.role === "official";
  const features = isOfficial ? OFFICIAL_FEATURES : CITIZEN_FEATURES;

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    onSkip();
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-primary/10 rounded-full">
          <Users className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome to Civic Portal, {user.full_name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            {isOfficial 
              ? "Your platform for managing civic issues and serving the community"
              : "Your voice in Botswana's civic community"
            }
          </p>
        </div>
      </div>

      <Card className="text-left">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Your Profile</CardTitle>
            <Badge variant={isOfficial ? "default" : "secondary"}>
              {isOfficial ? "Government Official" : "Citizen"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Constituency:</strong> {user.constituency || "Not specified"}
            </span>
          </div>
          {isOfficial && user.department_id && (
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Department:</strong> {user.department_id}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600">
              Account verified and ready to use
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeaturesStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          {isOfficial ? "Official Tools" : "Citizen Features"}
        </h2>
        <p className="text-muted-foreground">
          {isOfficial 
            ? "Powerful tools to manage civic issues and serve your community"
            : "Everything you need to engage with your community and make a difference"
          }
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card key={index} className={cn("border-2", feature.color)}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isOfficial && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your government official account is {user.verification_status === 'verified' ? 'verified' : 'pending verification'}. 
              {user.verification_status !== 'verified' && 
                " You'll have full access once your account is approved by administrators."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderCommunityStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Your Community</h2>
        <p className="text-muted-foreground">
          Connect with others in {user.constituency} and across Botswana
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Community Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Be respectful and constructive</p>
                <p className="text-xs text-muted-foreground">
                  Engage in civil discourse and focus on solutions
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Report real issues</p>
                <p className="text-xs text-muted-foreground">
                  Submit genuine civic issues that affect your community
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Collaborate for solutions</p>
                <p className="text-xs text-muted-foreground">
                  Work together to find practical solutions to problems
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Getting Started Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm space-y-1">
              <p>• Browse existing issues in your area to see what's happening</p>
              <p>• {isOfficial ? "Review and respond to issues in your department" : "Vote on issues that matter to you"}</p>
              <p>• {isOfficial ? "Provide regular updates on issue progress" : "Follow issues to get notifications about updates"}</p>
              <p>• Engage respectfully in comments and discussions</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReadyStep = () => (
    <div className="text-center space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-center w-20 h-20 mx-auto bg-green-100 rounded-full">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">You're All Set!</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Ready to start making a difference in your community
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-left">
          {isOfficial ? (
            <>
              <p className="text-sm">• Check your department dashboard for pending issues</p>
              <p className="text-sm">• Review and respond to citizen reports</p>
              <p className="text-sm">• Update issue statuses as work progresses</p>
              <p className="text-sm">• Collaborate with other departments when needed</p>
            </>
          ) : (
            <>
              <p className="text-sm">• Explore issues in your constituency</p>
              <p className="text-sm">• Report any civic problems you've noticed</p>
              <p className="text-sm">• Vote and comment on issues that matter to you</p>
              <p className="text-sm">• Propose solutions to help your community</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderWelcomeStep();
      case 2:
        return renderFeaturesStep();
      case 3:
        return renderCommunityStep();
      case 4:
        return renderReadyStep();
      default:
        return renderWelcomeStep();
    }
  };

  const progress = ((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100;

  return (
    <div className={cn("max-w-2xl mx-auto space-y-8", className)}>
      {/* Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Getting Started</h1>
          <Button variant="ghost" size="sm" onClick={skipOnboarding}>
            Skip Tour
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
        <StepIndicator steps={ONBOARDING_STEPS} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={nextStep}
          className="flex items-center gap-2"
        >
          {currentStep === ONBOARDING_STEPS.length ? "Get Started" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default OnboardingFlow;
