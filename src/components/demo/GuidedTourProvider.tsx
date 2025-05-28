import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Lightbulb,
  CheckCircle,
  Info,
  Sparkles,
  Eye,
  Users,
  Building2,
  Crown,
  Star,
  BarChart3,
  Globe,
  ArrowRight,
  MapPin,
  Clock,
  Heart,
  Award,
  TrendingUp,
  Coins,
  MessageSquare,
  ThumbsUp,
  Share2,
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  content: ReactNode;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void;
  highlight?: boolean;
  duration?: number;
}

interface TourScenario {
  id: string;
  title: string;
  description: string;
  category: 'user' | 'business' | 'government' | 'investor';
  steps: TourStep[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface GuidedTourContextType {
  isActive: boolean;
  currentScenario: TourScenario | null;
  currentStep: number;
  isPlaying: boolean;
  startTour: (scenarioId: string) => void;
  stopTour: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepIndex: number) => void;
  togglePlayback: () => void;
  scenarios: TourScenario[];
}

const GuidedTourContext = createContext<GuidedTourContextType | undefined>(
  undefined
);

export const useGuidedTour = () => {
  const context = useContext(GuidedTourContext);
  if (!context) {
    throw new Error('useGuidedTour must be used within a GuidedTourProvider');
  }
  return context;
};

interface GuidedTourProviderProps {
  children: ReactNode;
}

export const GuidedTourProvider: React.FC<GuidedTourProviderProps> = ({
  children,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<TourScenario | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  // Comprehensive tour scenarios
  const scenarios: TourScenario[] = [
    {
      id: 'citizen-journey',
      title: 'Citizen Experience Journey',
      description:
        'Follow Maria from Gaborone as she reports and funds a community issue',
      category: 'user',
      estimatedTime: '5 minutes',
      difficulty: 'beginner',
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to Civic Portal',
          description: 'Your gateway to community engagement in Botswana',
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Maria Mogale</h3>
                  <p className="text-sm text-muted-foreground">
                    Citizen from Gaborone
                  </p>
                </div>
              </div>
              <p className="text-sm">
                Maria has noticed a large pothole on Independence Avenue that's
                causing problems for drivers and pedestrians. Let's see how she
                uses Civic Portal to report and help fund the solution.
              </p>
            </div>
          ),
          position: 'center',
          duration: 5000,
        },
        {
          id: 'report-issue',
          title: 'Report the Issue',
          description:
            'Using the free Motse Platform to report community issues',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    Motse Platform - Free
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  All citizens can report issues for free using text, photos,
                  GPS, and voice
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Take photo of pothole</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Add GPS location</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Describe the problem</span>
                </div>
              </div>
            </div>
          ),
          target: '#issue-form',
          position: 'right',
          duration: 6000,
        },
        {
          id: 'community-funding',
          title: 'Community Funding with Thusang',
          description: 'Contributing to the solution through crowdfunding',
          content: (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">
                    Thusang Action Funds
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  Community members can contribute BWP 10-100 to fund solutions
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Funding</span>
                  <span className="font-semibold text-blue-600">BWP 2,500</span>
                </div>
                <Progress value={50} className="h-2" />
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>42 contributors</span>
                  <span>Goal: BWP 5,000</span>
                </div>
              </div>
            </div>
          ),
          target: '#thusang-widget',
          position: 'left',
          duration: 7000,
        },
        {
          id: 'track-progress',
          title: 'Track Progress & Engage',
          description: 'Following the issue through to resolution',
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Issue Reported</span>
                  <Badge variant="outline" className="text-xs">
                    Completed
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium">Community Funding</span>
                  <Badge variant="outline" className="text-xs">
                    In Progress
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm font-medium">
                    Government Response
                  </span>
                  <Badge variant="outline" className="text-xs">
                    Pending
                  </Badge>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Maria receives real-time notifications about funding progress
                  and government responses through SMS and app notifications.
                </p>
              </div>
            </div>
          ),
          target: '#issue-timeline',
          position: 'bottom',
          duration: 6000,
        },
        {
          id: 'resolution',
          title: 'Issue Resolved!',
          description: 'Successful community-government collaboration',
          content: (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-green-700">
                  The pothole has been repaired thanks to community funding and
                  government action
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-600">BWP 5,000</div>
                  <div className="text-xs text-blue-700">Community Raised</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="font-semibold text-green-600">7 days</div>
                  <div className="text-xs text-green-700">Resolution Time</div>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800">
                  This demonstrates the power of the Mmogo Impact Ecosystem -
                  bringing citizens, community funding, and government together
                  for real solutions.
                </p>
              </div>
            </div>
          ),
          position: 'center',
          duration: 8000,
        },
      ],
    },
    {
      id: 'business-partnership',
      title: 'Business Partnership Demo',
      description:
        'See how Choppies supermarket engages with community through Tirisano',
      category: 'business',
      estimatedTime: '4 minutes',
      difficulty: 'intermediate',
      steps: [
        {
          id: 'business-intro',
          title: 'Tirisano Mmogo Business Solutions',
          description: 'Corporate social responsibility made measurable',
          content: (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Choppies Supermarket</h3>
                  <p className="text-sm text-muted-foreground">
                    Community Champion Partner
                  </p>
                </div>
              </div>
              <p className="text-sm">
                Choppies wants to strengthen their community engagement and
                track the impact of their CSR investments. Let's see how
                Tirisano helps them achieve this.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-sm font-semibold text-green-600">
                    BWP 500
                  </div>
                  <div className="text-xs text-green-700">Monthly</div>
                </div>
                <div className="p-2 bg-blue-50 rounded">
                  <div className="text-sm font-semibold text-blue-600">
                    Champion
                  </div>
                  <div className="text-xs text-blue-700">Tier</div>
                </div>
                <div className="p-2 bg-purple-50 rounded">
                  <div className="text-sm font-semibold text-purple-600">8</div>
                  <div className="text-xs text-purple-700">Projects</div>
                </div>
              </div>
            </div>
          ),
          position: 'center',
          duration: 6000,
        },
        // Additional steps would be added here...
      ],
    },
    // Additional scenarios would be added here...
  ];

  // Auto-advance functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (
      isPlaying &&
      currentScenario &&
      currentStep < currentScenario.steps.length - 1
    ) {
      const currentStepData = currentScenario.steps[currentStep];
      const duration = currentStepData.duration || 5000;

      interval = setTimeout(() => {
        nextStep();
      }, duration);
    } else if (
      isPlaying &&
      currentScenario &&
      currentStep >= currentScenario.steps.length - 1
    ) {
      setIsPlaying(false);
      toast({
        title: '🎉 Tour Complete!',
        description: `You've completed the ${currentScenario.title} tour`,
        duration: 4000,
      });
    }

    return () => clearTimeout(interval);
  }, [isPlaying, currentStep, currentScenario]);

  const startTour = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setCurrentScenario(scenario);
      setCurrentStep(0);
      setIsActive(true);
      setIsPlaying(false);

      toast({
        title: '🎬 Tour Started',
        description: `Starting ${scenario.title}`,
        duration: 3000,
      });
    }
  };

  const stopTour = () => {
    setIsActive(false);
    setCurrentScenario(null);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const nextStep = () => {
    if (currentScenario && currentStep < currentScenario.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (
      currentScenario &&
      stepIndex >= 0 &&
      stepIndex < currentScenario.steps.length
    ) {
      setCurrentStep(stepIndex);
    }
  };

  const togglePlayback = () => {
    setIsPlaying((prev) => !prev);
  };

  const value: GuidedTourContextType = {
    isActive,
    currentScenario,
    currentStep,
    isPlaying,
    startTour,
    stopTour,
    nextStep,
    previousStep,
    goToStep,
    togglePlayback,
    scenarios,
  };

  return (
    <GuidedTourContext.Provider value={value}>
      {children}

      {/* Tour Overlay */}
      <AnimatePresence>
        {isActive && currentScenario && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              <Card className="border-0 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {currentScenario.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {currentScenario.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopTour}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        Step {currentStep + 1} of {currentScenario.steps.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {currentScenario.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {currentScenario.estimatedTime}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={
                        ((currentStep + 1) / currentScenario.steps.length) * 100
                      }
                      className="h-2"
                    />
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Current Step Content */}
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {currentScenario.steps[currentStep]?.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {currentScenario.steps[currentStep]?.description}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      {currentScenario.steps[currentStep]?.content}
                    </div>
                  </motion.div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={previousStep}
                        disabled={currentStep === 0}
                        className="gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={togglePlayback}
                        className="gap-2"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Auto Play
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentStep < currentScenario.steps.length - 1 ? (
                        <Button onClick={nextStep} className="gap-2">
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={stopTour}
                          className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                          Complete Tour
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Step Indicators */}
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {currentScenario.steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToStep(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? 'bg-blue-600'
                            : index < currentStep
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GuidedTourContext.Provider>
  );
};
