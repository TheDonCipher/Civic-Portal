import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { useDemoMode } from '@/providers/DemoProvider';
import { useGuidedTour } from './GuidedTourProvider';
import MmogoEcosystemShowcase from '@/components/subscription/MmogoEcosystemShowcase';
import EnhancedSubscriptionDevTools from '@/components/dev/EnhancedSubscriptionDevTools';
import {
  Play,
  Sparkles,
  Target,
  Users,
  Building2,
  Crown,
  Star,
  BarChart3,
  Globe,
  ArrowRight,
  Eye,
  Settings,
  Zap,
  TrendingUp,
  Coins,
  Heart,
  Award,
  Lightbulb,
  CheckCircle,
  Info,
  Briefcase,
  GraduationCap,
  PieChart,
  Activity,
  MessageSquare,
  ThumbsUp,
  Share2,
  Download,
  Filter,
  Search,
  Bell,
  FileText,
  Shield,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Gauge,
  Network,
  Shuffle,
  RotateCcw,
  Pause,
} from 'lucide-react';

interface DemoExperienceHubProps {
  className?: string;
}

interface DemoPreset {
  id: string;
  title: string;
  description: string;
  category: 'user' | 'business' | 'government' | 'investor';
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  actions: {
    showcase?: string;
    tour?: string;
    devTools?: boolean;
  };
}

const DemoExperienceHub: React.FC<DemoExperienceHubProps> = ({ className = '' }) => {
  const { isDemoMode, toggleDemoMode } = useDemoMode();
  const { startTour, scenarios } = useGuidedTour();
  const { toast } = useToast();
  
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);

  // Demo presets for different user types
  const demoPresets: DemoPreset[] = [
    {
      id: 'citizen-experience',
      title: 'Citizen Experience',
      description: 'Complete citizen journey from issue reporting to resolution',
      category: 'user',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Free issue reporting with Motse Platform',
        'Community funding through Thusang',
        'Real-time progress tracking',
        'Government response notifications',
      ],
      estimatedTime: '5 minutes',
      difficulty: 'beginner',
      actions: {
        showcase: 'user-experience',
        tour: 'citizen-journey',
        devTools: true,
      },
    },
    {
      id: 'business-partnership',
      title: 'Business Partnership',
      description: 'Corporate social responsibility with measurable impact',
      category: 'business',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Tirisano Mmogo business solutions',
        'CSR impact tracking and analytics',
        'Community engagement metrics',
        'Brand visibility and recognition',
      ],
      estimatedTime: '4 minutes',
      difficulty: 'intermediate',
      actions: {
        showcase: 'business-integration',
        tour: 'business-partnership',
        devTools: true,
      },
    },
    {
      id: 'government-efficiency',
      title: 'Government Efficiency',
      description: 'Enhanced governance tools for effective public service',
      category: 'government',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      features: [
        'Kgotla+ governance solutions',
        'Ward management dashboards',
        'Citizen communication tools',
        'Performance analytics and reporting',
      ],
      estimatedTime: '6 minutes',
      difficulty: 'advanced',
      actions: {
        showcase: 'government-tools',
        tour: 'government-efficiency',
        devTools: true,
      },
    },
    {
      id: 'investor-overview',
      title: 'Investor Overview',
      description: 'Complete revenue model and growth potential analysis',
      category: 'investor',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Comprehensive revenue streams',
        'Market penetration analysis',
        'Growth projections and metrics',
        'Sustainable business model',
      ],
      estimatedTime: '8 minutes',
      difficulty: 'advanced',
      actions: {
        showcase: 'overview',
        tour: 'investor-overview',
        devTools: true,
      },
    },
  ];

  // Auto-rotation functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRotate) {
      interval = setInterval(() => {
        setCurrentRotation((prev) => (prev + 1) % demoPresets.length);
        setActivePreset(demoPresets[currentRotation].id);
      }, 10000); // Rotate every 10 seconds
    }
    return () => clearInterval(interval);
  }, [autoRotate, currentRotation, demoPresets]);

  const handlePresetActivation = (preset: DemoPreset) => {
    setActivePreset(preset.id);
    
    // Enable demo mode if not already enabled
    if (!isDemoMode) {
      toggleDemoMode();
    }

    toast({
      title: '🎬 Demo Preset Activated',
      description: `Now showcasing: ${preset.title}`,
      duration: 4000,
    });
  };

  const startGuidedTour = (tourId: string) => {
    startTour(tourId);
    toast({
      title: '🎯 Guided Tour Started',
      description: 'Follow the interactive walkthrough',
      duration: 3000,
    });
  };

  const launchFullDemo = () => {
    // Activate comprehensive demo experience
    if (!isDemoMode) {
      toggleDemoMode();
    }
    setAutoRotate(true);
    setActivePreset(demoPresets[0].id);
    
    toast({
      title: '🚀 Full Demo Experience Launched',
      description: 'Auto-rotating through all demo scenarios',
      duration: 5000,
    });
  };

  const resetDemo = () => {
    setActivePreset(null);
    setAutoRotate(false);
    setCurrentRotation(0);
    
    toast({
      title: '🔄 Demo Reset',
      description: 'All demo settings have been reset',
      duration: 3000,
    });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Demo Experience Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Sparkles className="w-4 h-4 mr-2" />
            Enhanced Demo Experience
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Comprehensive{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mmogo Impact
            </span>{' '}
            Demonstration
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience the full power of the Mmogo Impact Ecosystem through interactive 
            demonstrations, guided tours, and comprehensive testing tools designed for 
            citizens, businesses, government officials, and investors.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={launchFullDemo}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
          >
            <Play className="w-5 h-5" />
            Launch Full Demo
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
            size="lg"
          >
            <Settings className="w-5 h-5" />
            Advanced Options
          </Button>
          <Button
            variant="outline"
            onClick={resetDemo}
            className="gap-2"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
            Reset Demo
          </Button>
        </div>

        {/* Demo Status Indicator */}
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto"
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">
                Demo Mode Active
              </span>
            </div>
            {activePreset && (
              <div className="text-sm text-blue-700 dark:text-blue-300">
                Current: {demoPresets.find(p => p.id === activePreset)?.title}
              </div>
            )}
            {autoRotate && (
              <div className="mt-2">
                <Progress
                  value={((currentRotation + 1) / demoPresets.length) * 100}
                  className="h-2"
                />
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Demo Presets Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {demoPresets.map((preset, index) => {
          const IconComponent = preset.icon;
          const isActive = activePreset === preset.id;
          
          return (
            <motion.div
              key={preset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  isActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg'
                    : 'hover:border-blue-300'
                }`}
                onClick={() => handlePresetActivation(preset)}
              >
                <CardHeader className="text-center pb-3">
                  <div
                    className={`w-16 h-16 ${preset.bgColor} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}
                  >
                    <IconComponent className={`w-8 h-8 ${preset.color}`} />
                  </div>
                  <CardTitle className="text-lg">{preset.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {preset.description}
                  </p>
                  <div className="flex justify-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {preset.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {preset.estimatedTime}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features List */}
                  <div className="space-y-2">
                    {preset.features.slice(0, 3).map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                    {preset.features.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{preset.features.length - 3} more features
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t">
                    {preset.actions.tour && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          startGuidedTour(preset.actions.tour!);
                        }}
                        className="w-full justify-start gap-2 text-xs"
                      >
                        <Target className="w-3 h-3" />
                        Guided Tour
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isActive ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePresetActivation(preset);
                      }}
                      className="w-full justify-start gap-2 text-xs"
                    >
                      <Eye className="w-3 h-3" />
                      {isActive ? 'Active Demo' : 'Start Demo'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Integrated Components */}
      <div className="space-y-8">
        {/* Mmogo Ecosystem Showcase */}
        <MmogoEcosystemShowcase />
        
        {/* Enhanced Developer Tools */}
        <EnhancedSubscriptionDevTools />
      </div>
    </div>
  );
};

export default DemoExperienceHub;
