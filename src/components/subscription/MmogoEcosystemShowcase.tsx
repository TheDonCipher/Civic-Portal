import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  Star,
  Building2,
  Crown,
  Lightbulb,
  Target,
  Network,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  DollarSign,
  Heart,
  Award,
  Zap,
  Play,
  Pause,
  RotateCcw,
  Eye,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
  PieChart,
  Activity,
  Coins,
  FileText,
  Shield,
  Clock,
  MessageSquare,
  ThumbsUp,
  Share2,
  Download,
  Filter,
  Search,
  Settings,
  Bell,
  ChevronRight,
  ChevronLeft,
  Info,
  Briefcase,
  GraduationCap,
  Home,
  Car,
  Droplets,
  Wifi,
  Truck,
  TreePine,
  Hospital,
  School,
  Building,
  Factory,
} from 'lucide-react';
import SubscriptionStatusIndicator from './SubscriptionStatusIndicator';
import ThusangContributionWidget from './ThusangContributionWidget';
import TirisanoPartnershipDisplay from './TirisanoPartnershipDisplay';
import { useAuth } from '@/lib/auth';
import { useDemoMode } from '@/providers/DemoProvider';

interface EcosystemTier {
  id: string;
  name: string;
  setswanaName: string;
  description: string;
  pricing: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  features: string[];
  valueProposition: string;
  demoComponent?: React.ComponentType<any>;
  targetUsers: string[];
  keyMetrics: {
    users?: string;
    revenue?: string;
    impact?: string;
    growth?: string;
  };
  botswanaExamples: string[];
  mockupData?: any;
}

const MmogoEcosystemShowcase: React.FC = () => {
  const { profile } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [activeShowcase, setActiveShowcase] = useState('overview');
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(0);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  // Enhanced ecosystem tiers with comprehensive data
  const ecosystemTiers: EcosystemTier[] = [
    {
      id: 'motse',
      name: 'Motse Platform',
      setswanaName: 'Motse',
      description: 'Our Village - Free Foundation',
      pricing: 'Free Forever',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      features: [
        'Issue reporting (text, photo, GPS, voice)',
        'Public issue tracking',
        'Community forums',
        'Basic notifications',
        'Local services directory',
      ],
      valueProposition:
        'Empowers citizens with essential civic engagement tools',
      targetUsers: ['Citizens', 'Community Members', 'Visitors'],
      keyMetrics: {
        users: '50,000+ active users',
        impact: '15,000+ issues reported',
        growth: '25% monthly growth',
      },
      botswanaExamples: [
        'Gaborone pothole reporting by residents',
        'Francistown water shortage community alerts',
        'Maun tourism infrastructure feedback',
      ],
    },
    {
      id: 'thusang',
      name: 'Thusang Action Funds',
      setswanaName: 'Thusang',
      description: 'Community Action Funds',
      pricing: '5-7% platform fee',
      icon: Star,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      features: [
        'Project-focused crowdfunding',
        'Transparent fund allocation',
        'Community voting on projects',
        'Real-time progress tracking',
        'Impact documentation',
      ],
      valueProposition: 'Direct community funding with complete transparency',
      targetUsers: ['Citizens', 'Community Groups', 'NGOs'],
      keyMetrics: {
        revenue: 'BWP 2.5M+ raised',
        impact: '150+ projects funded',
        growth: '40% quarterly growth',
      },
      botswanaExamples: [
        'Serowe library renovation - BWP 45,000 raised',
        'Kasane school playground - BWP 28,000 funded',
        'Lobatse clinic equipment - BWP 67,000 collected',
      ],
    },
    {
      id: 'tirisano',
      name: 'Tirisano Mmogo Business',
      setswanaName: 'Tirisano Mmogo',
      description: 'Business & Enterprise Solutions',
      pricing: 'BWP 200-1500+/month',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      features: [
        'Community Champion badge',
        'Featured directory listing',
        'Local pulse reports',
        'Community offers promotion',
        'CSR impact tracking',
        'Hyperlocal market insights',
      ],
      valueProposition: 'Enhanced community engagement with measurable impact',
      targetUsers: ['Local Businesses', 'SMEs', 'Corporations'],
      keyMetrics: {
        revenue: 'BWP 850K+ monthly',
        users: '200+ business partners',
        impact: '85% customer satisfaction',
      },
      botswanaExamples: [
        'Choppies supermarket community engagement',
        'Botswana Craft Centre artisan support',
        'Gaborone Motors CSR tracking',
      ],
    },
    {
      id: 'kgotla',
      name: 'Kgotla+ Governance',
      setswanaName: 'Kgotla+',
      description: 'Local Governance Solutions',
      pricing: 'BWP 750-6500/month',
      icon: Crown,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      features: [
        'Secure ward dashboard',
        'Direct citizen communication',
        'Task assignment and tracking',
        'Advanced analytics',
        'Cross-ward coordination',
        'Policy impact simulation',
      ],
      valueProposition:
        'Demonstrable ROI through faster resolution & citizen satisfaction',
      targetUsers: ['Ward Councilors', 'District Officials', 'Government'],
      keyMetrics: {
        revenue: 'BWP 1.2M+ monthly',
        users: '45+ government entities',
        impact: '60% faster issue resolution',
      },
      botswanaExamples: [
        'Gaborone City Council ward management',
        'Francistown District coordination',
        'Maun tourism infrastructure planning',
      ],
    },
    {
      id: 'tlhaloso',
      name: 'Tlhaloso Intelligence',
      setswanaName: 'Tlhaloso',
      description: 'Data & Insights Services',
      pricing: 'BWP 1000+/report',
      icon: Lightbulb,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      features: [
        'Thematic Intelligence Reports',
        'Custom data projects',
        'Developer API access',
        'Policy impact simulation',
        'Cross-district benchmarking',
        'Anonymized data insights',
      ],
      valueProposition: 'Transform decision-making with data-driven insights',
      targetUsers: ['Government Agencies', 'Research Institutions', 'NGOs'],
      keyMetrics: {
        revenue: 'BWP 500K+ monthly',
        users: '25+ institutional clients',
        impact: '90% policy adoption rate',
      },
      botswanaExamples: [
        'National water access analysis for Ministry',
        'Youth employment trends for MYSC',
        'Tourism impact assessment for MEWT',
      ],
    },
  ];

  // Demo scenarios for guided tours
  const demoScenarios = [
    {
      id: 'citizen-journey',
      title: 'Citizen Experience Journey',
      description:
        'Follow Maria from Gaborone as she reports and funds a community issue',
      steps: [
        'Report pothole using Motse Platform',
        'Contribute BWP 50 via Thusang funding',
        'Track progress and engage with community',
        'See issue resolved through government action',
      ],
    },
    {
      id: 'business-partnership',
      title: 'Business Partnership Demo',
      description:
        'See how Choppies supermarket engages with community through Tirisano',
      steps: [
        'Business registers for Tirisano Champion tier',
        'Sponsors local school feeding program',
        'Tracks CSR impact and community engagement',
        'Receives enhanced visibility and customer loyalty',
      ],
    },
    {
      id: 'government-efficiency',
      title: 'Government Efficiency Showcase',
      description:
        'Ward Councilor uses Kgotla+ to manage constituency effectively',
      steps: [
        'Access secure ward dashboard',
        'Communicate directly with citizens via SMS/app',
        'Track issue resolution performance',
        'Generate reports for district coordination',
      ],
    },
    {
      id: 'investor-overview',
      title: 'Investor Revenue Model',
      description:
        'Complete overview of Mmogo Impact Ecosystem revenue streams',
      steps: [
        'Free Motse Platform drives user acquisition',
        'Thusang generates 5-7% transaction fees',
        'Tirisano provides recurring business subscriptions',
        'Kgotla+ delivers government contract revenue',
        'Tlhaloso offers premium data insights',
      ],
    },
  ];

  const demoPartner = {
    id: 'demo-partner-1',
    name: 'Botswana Craft Centre',
    tier: 'champion' as const,
    description:
      'Supporting local artisans and promoting Botswana culture through community engagement.',
    location: 'Gaborone, Botswana',
    website: 'https://botswanacraft.bw',
    phone: '+267 123 4567',
    email: 'info@botswanacraft.bw',
    joinedDate: '2023-06-15',
    sponsoredProjects: 8,
    communityImpact: '500+ artisans supported',
    currentOffers: [
      '15% discount for community members on traditional crafts',
      'Free craft workshops for youth during school holidays',
    ],
    featuredPlacement: true,
  };

  // Auto-play demo functionality with scroll behavior
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentDemoStep((prev) => {
          const nextStep = (prev + 1) % demoScenarios.length;

          // Auto-switch tabs based on demo scenario
          if (nextStep === 0) setActiveShowcase('overview');
          else if (nextStep === 1) setActiveShowcase('user-experience');
          else if (nextStep === 2) setActiveShowcase('business-integration');
          else if (nextStep === 3) setActiveShowcase('government-tools');

          // Scroll to the relevant section
          setTimeout(() => {
            const tabsElement = document.querySelector('[role="tablist"]');
            if (tabsElement) {
              tabsElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
              });
            }
          }, 500);

          return nextStep;
        });
      }, 8000); // Increased to 8 seconds for better viewing
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, demoScenarios.length]);

  return (
    <div className="max-w-7xl mx-auto mobile-padding section-spacing">
      {/* Enhanced Header with Demo Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 py-12"
      >
        <div className="space-y-4">
          <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
            <Network className="w-4 h-4 mr-2" />
            Mmogo Impact Ecosystem Integration
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Integrated{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mmogo
            </span>{' '}
            Experience
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience how the Mmogo Impact Ecosystem is seamlessly integrated
            throughout the Civic Portal interface, creating a unified platform
            for community engagement, business partnerships, and government
            efficiency.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex flex-wrap justify-center gap-4 pt-6">
          <Button
            onClick={() => setShowGuidedTour(true)}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-4 h-4" />
            Start Guided Tour
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="gap-2"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                Pause Demo
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Auto Demo
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setCurrentDemoStep(0);
              setIsAutoPlaying(false);
            }}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Enhanced Demo Scenario Indicator */}
        {(isAutoPlaying || currentDemoStep > 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {isAutoPlaying ? 'Auto Demo' : 'Manual Demo'} - Step{' '}
                  {currentDemoStep + 1} of {demoScenarios.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentDemoStep(Math.max(0, currentDemoStep - 1))
                  }
                  disabled={currentDemoStep === 0}
                  className="h-6 w-6 p-0"
                >
                  <ChevronLeft className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setCurrentDemoStep(
                      (currentDemoStep + 1) % demoScenarios.length
                    )
                  }
                  className="h-6 w-6 p-0"
                >
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              {demoScenarios[currentDemoStep]?.title}
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              {demoScenarios[currentDemoStep]?.description}
            </p>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {demoScenarios.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDemoStep(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentDemoStep
                      ? 'bg-blue-600 dark:bg-blue-400 w-6'
                      : 'bg-blue-300 dark:bg-blue-600 hover:bg-blue-400 dark:hover:bg-blue-500'
                  }`}
                />
              ))}
            </div>

            <div className="mt-3">
              <Progress
                value={((currentDemoStep + 1) / demoScenarios.length) * 100}
                className="h-2"
              />
            </div>

            {!isAutoPlaying && (
              <div className="mt-3 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAutoPlaying(true)}
                  className="text-xs"
                >
                  <Play className="w-3 h-3 mr-1" />
                  Start Auto Demo
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Enhanced Demo Guide */}
        <AnimatePresence>
          {showGuidedTour && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowGuidedTour(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Mmogo Impact Ecosystem Tour
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Interactive journey through our business model
                        integration
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuidedTour(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>

                {/* Tour Progress Indicator */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Tour Progress
                    </span>
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      {currentDemoStep + 1} of {demoScenarios.length} scenarios
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div
                      className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((currentDemoStep + 1) / demoScenarios.length) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {demoScenarios.map((scenario, index) => (
                    <motion.div
                      key={scenario.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
                        currentDemoStep === index
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                      onClick={() => {
                        setCurrentDemoStep(index);
                        setActiveShowcase(
                          index === 0
                            ? 'user-experience'
                            : index === 1
                            ? 'business-integration'
                            : index === 2
                            ? 'government-tools'
                            : 'overview'
                        );
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                            currentDemoStep === index
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                              {scenario.title}
                            </h3>
                            {currentDemoStep === index && (
                              <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {scenario.description}
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {scenario.steps.map((step, stepIndex) => (
                              <div
                                key={stepIndex}
                                className="flex items-center gap-2 text-xs p-2 bg-gray-50 dark:bg-gray-800 rounded border"
                              >
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    currentDemoStep === index
                                      ? 'bg-blue-500'
                                      : 'bg-gray-400 dark:bg-gray-600'
                                  }`}
                                ></div>
                                <span className="text-gray-700 dark:text-gray-300">
                                  {step}
                                </span>
                              </div>
                            ))}
                          </div>
                          {currentDemoStep !== index && (
                            <div className="mt-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentDemoStep(index);
                                  setActiveShowcase(
                                    index === 0
                                      ? 'user-experience'
                                      : index === 1
                                      ? 'business-integration'
                                      : index === 2
                                      ? 'government-tools'
                                      : 'overview'
                                  );
                                }}
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Start This Scenario
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => {
                      setShowGuidedTour(false);
                      setIsAutoPlaying(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Auto Demo
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Integration Showcase Tabs */}
      <Tabs
        value={activeShowcase}
        onValueChange={setActiveShowcase}
        className="space-y-8"
      >
        <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
          <TabsTrigger
            value="overview"
            className={`relative ${
              isAutoPlaying && currentDemoStep === 0
                ? 'ring-2 ring-blue-400 ring-offset-2'
                : ''
            }`}
          >
            Overview
            {isAutoPlaying && currentDemoStep === 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="user-experience"
            className={`relative ${
              isAutoPlaying && currentDemoStep === 1
                ? 'ring-2 ring-blue-400 ring-offset-2'
                : ''
            }`}
          >
            User Experience
            {isAutoPlaying && currentDemoStep === 1 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="business-integration"
            className={`relative ${
              isAutoPlaying && currentDemoStep === 2
                ? 'ring-2 ring-blue-400 ring-offset-2'
                : ''
            }`}
          >
            Business Integration
            {isAutoPlaying && currentDemoStep === 2 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="government-tools"
            className={`relative ${
              isAutoPlaying && currentDemoStep === 3
                ? 'ring-2 ring-blue-400 ring-offset-2'
                : ''
            }`}
          >
            Government Tools
            {isAutoPlaying && currentDemoStep === 3 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecosystemTiers.map((tier, index) => {
              const IconComponent = tier.icon;
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-2 hover:border-blue-200">
                    <CardHeader className="text-center">
                      <div
                        className={`w-16 h-16 ${tier.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      >
                        <IconComponent className={`w-8 h-8 ${tier.color}`} />
                      </div>
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-medium">
                        {tier.setswanaName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                      <Badge variant="outline" className="mx-auto">
                        {tier.pricing}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm font-medium text-center">
                          {tier.valueProposition}
                        </p>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                          {tier.keyMetrics.users && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                {tier.keyMetrics.users}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Users
                              </div>
                            </div>
                          )}
                          {tier.keyMetrics.revenue && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                {tier.keyMetrics.revenue}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Revenue
                              </div>
                            </div>
                          )}
                          {tier.keyMetrics.impact && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {tier.keyMetrics.impact}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Impact
                              </div>
                            </div>
                          )}
                          {tier.keyMetrics.growth && (
                            <div className="text-center">
                              <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {tier.keyMetrics.growth}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Growth
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Target Users */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Target Users
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {tier.targetUsers.map((user, userIndex) => (
                              <Badge
                                key={userIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {user}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Key Features
                          </h4>
                          {tier.features
                            .slice(0, 3)
                            .map((feature, featureIndex) => (
                              <div
                                key={featureIndex}
                                className="flex items-center gap-2 text-sm"
                              >
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          {tier.features.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center">
                              +{tier.features.length - 3} more features
                            </p>
                          )}
                        </div>

                        {/* Botswana Examples */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Botswana Examples
                          </h4>
                          <div className="space-y-1">
                            {tier.botswanaExamples
                              .slice(0, 2)
                              .map((example, exampleIndex) => (
                                <div
                                  key={exampleIndex}
                                  className="text-xs p-2 bg-blue-50 dark:bg-blue-950/30 rounded border border-blue-200 dark:border-blue-800"
                                >
                                  {example}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Revenue Model Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Mmogo Impact Ecosystem Revenue Model
                </CardTitle>
                <p className="text-muted-foreground">
                  Sustainable revenue streams supporting community development
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      FREE
                    </div>
                    <div className="text-sm font-medium">Motse Platform</div>
                    <div className="text-xs text-muted-foreground">
                      Drives user acquisition
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      5-7%
                    </div>
                    <div className="text-sm font-medium">Thusang Fees</div>
                    <div className="text-xs text-muted-foreground">
                      Transaction-based revenue
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      BWP 850K+
                    </div>
                    <div className="text-sm font-medium">Tirisano Monthly</div>
                    <div className="text-xs text-muted-foreground">
                      Business subscriptions
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      BWP 1.7M+
                    </div>
                    <div className="text-sm font-medium">
                      Kgotla+ & Tlhaloso
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Government & data services
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Enhanced User Experience Tab */}
        <TabsContent value="user-experience" className="space-y-8">
          {/* Interactive Demo Scenarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {demoScenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                    currentDemoStep === index
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => setCurrentDemoStep(index)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentDemoStep === index
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <h3 className="font-semibold text-sm">
                        {scenario.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {scenario.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Comprehensive User Journey Sections */}
          <div className="space-y-8">
            {/* Citizen Journey Flow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Complete Citizen Journey
                  </CardTitle>
                  <p className="text-muted-foreground">
                    From issue discovery to resolution - the full citizen
                    experience
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold mb-2">Discover</h4>
                      <p className="text-sm text-muted-foreground">
                        Notice community issue, access Motse Platform
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold mb-2">Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Submit detailed issue with photos, location, voice notes
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold mb-2">Support</h4>
                      <p className="text-sm text-muted-foreground">
                        Vote, comment, contribute via Thusang funding
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h4 className="font-semibold mb-2">Resolve</h4>
                      <p className="text-sm text-muted-foreground">
                        Track progress, receive updates, see completion
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Mobile Experience Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Mobile-First Experience
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Optimized for Botswana's mobile-first digital landscape
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Offline Capabilities
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Draft issues offline</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Cache critical data</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Sync when connected</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Low-Data Mode
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Compressed images</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Text-first interface</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Progressive loading</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                        Accessibility
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Voice input support</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Large touch targets</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>High contrast mode</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language & Cultural Integration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    Cultural & Language Integration
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Respecting Botswana's linguistic diversity and cultural
                    values
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                        Language Support
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="font-medium text-sm">
                            Setswana (Primary)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Native interface with cultural terminology
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="font-medium text-sm">
                            English (Secondary)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Professional and technical contexts
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="font-medium text-sm">Voice Input</div>
                          <div className="text-xs text-muted-foreground">
                            Speech-to-text in both languages
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                        Cultural Values
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="font-medium text-sm">
                            Ubuntu Philosophy
                          </div>
                          <div className="text-xs text-muted-foreground">
                            "I am because we are" - community-first approach
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="font-medium text-sm">
                            Kgotla Respect
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Traditional governance structures honored
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="font-medium text-sm">
                            Consensus Building
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Collaborative decision-making processes
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Subscription Status Display */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Enhanced Subscription Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Subscription status indicators now show Mmogo Impact
                    Ecosystem context with Setswana names, tier levels, and
                    value propositions.
                  </p>
                  <SubscriptionStatusIndicator
                    tier={profile?.role === 'official' ? 'kgotla' : 'tirisano'}
                    status="active"
                    variant="detailed"
                    tierLevel={
                      profile?.role === 'official' ? 'ward' : 'champion'
                    }
                    showMmogoContext={true}
                  />

                  {/* Additional Status Examples */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">
                      Different Tier Examples
                    </h4>
                    <div className="space-y-2">
                      <SubscriptionStatusIndicator
                        tier="motse"
                        status="active"
                        variant="compact"
                        showMmogoContext={true}
                      />
                      <SubscriptionStatusIndicator
                        tier="thusang"
                        status="active"
                        variant="compact"
                        showMmogoContext={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enhanced Thusang Contribution Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Thusang Community Funding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Issue cards now include integrated Thusang contribution
                    options for community-driven project funding.
                  </p>
                  <ThusangContributionWidget
                    issueId="demo-issue-1"
                    issueTitle="Repair Tlokweng Library Roof"
                    issueLocation="Tlokweng, Botswana"
                    currentFunding={8500}
                    goalAmount={15000}
                    contributorsCount={42}
                    daysLeft={18}
                    variant="detailed"
                  />

                  {/* Additional Funding Examples */}
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="text-sm font-medium">
                      Other Active Projects
                    </h4>
                    <div className="space-y-2">
                      <ThusangContributionWidget
                        issueId="demo-issue-2"
                        issueTitle="Maun School Playground Equipment"
                        issueLocation="Maun, Botswana"
                        currentFunding={12000}
                        goalAmount={20000}
                        contributorsCount={67}
                        daysLeft={25}
                        variant="compact"
                      />
                      <ThusangContributionWidget
                        issueId="demo-issue-3"
                        issueTitle="Francistown Community Garden"
                        issueLocation="Francistown, Botswana"
                        currentFunding={5500}
                        goalAmount={8000}
                        contributorsCount={28}
                        daysLeft={12}
                        variant="compact"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Interactive Issue Card Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Interactive Issue Card Demo
                </CardTitle>
                <p className="text-muted-foreground">
                  See how Mmogo ecosystem features are integrated into issue
                  cards
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border shadow-sm">
                  {/* Mock Issue Card */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">
                          Water Shortage in Serowe Ward 12
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            Serowe, Central District
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />3 days ago
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        High Priority
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Residents in Ward 12 have been without water for 5 days.
                      The main pipeline needs urgent repair to restore service
                      to 200+ households.
                    </p>

                    {/* Engagement Metrics */}
                    <div className="flex items-center gap-6 text-sm">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        24 votes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />8 comments
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        156 views
                      </span>
                    </div>

                    {/* Integrated Thusang Widget */}
                    <ThusangContributionWidget
                      issueId="demo-water-issue"
                      issueTitle="Water Shortage in Serowe Ward 12"
                      issueLocation="Serowe, Central District"
                      currentFunding={15000}
                      goalAmount={25000}
                      contributorsCount={89}
                      daysLeft={20}
                      variant="inline"
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="gap-1">
                        <ThumbsUp className="w-4 h-4" />
                        Support
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <MessageSquare className="w-4 h-4" />
                        Comment
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Share2 className="w-4 h-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Enhanced Business Integration Tab */}
        <TabsContent value="business-integration" className="space-y-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Tirisano Mmogo Business Partnerships
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Businesses can now showcase their community engagement through
                integrated partnership displays and sponsorship opportunities.
              </p>
            </motion.div>

            {/* Business Partnership Tiers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
            >
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800 dark:text-green-200">
                    Community Supporter
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    BWP 200/month • Basic community support
                  </p>
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                    <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      <div>• Directory listing</div>
                      <div>• Community badge</div>
                      <div>• Basic analytics</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 ring-2 ring-blue-300 dark:ring-blue-600">
                <CardContent className="p-4 text-center">
                  <Star className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    Community Champion
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    BWP 500/month • Enhanced visibility & engagement
                  </p>
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <div>• Featured placement</div>
                      <div>• Sponsorship opportunities</div>
                      <div>• Detailed impact reports</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                    Corporate Impact Partner
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    BWP 1500+/month • Strategic CSR partnership
                  </p>
                  <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                    <div className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                      <div>• Custom integration</div>
                      <div>• API access</div>
                      <div>• Executive dashboards</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Partner Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <TirisanoPartnershipDisplay
                  partner={demoPartner}
                  variant="featured"
                  showContactInfo={true}
                  showMetrics={true}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <TirisanoPartnershipDisplay
                  partner={{
                    ...demoPartner,
                    name: 'Gaborone Motors',
                    tier: 'impact_partner',
                    description:
                      'Leading automotive dealer supporting community transportation initiatives.',
                    sponsoredProjects: 15,
                    communityImpact: '1000+ families helped',
                    featuredPlacement: false,
                    currentOffers: [
                      'Free vehicle inspections for community members',
                      'Discounted repairs for essential workers',
                    ],
                  }}
                  variant="card"
                  showMetrics={true}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <TirisanoPartnershipDisplay
                  partner={{
                    ...demoPartner,
                    name: 'Botswana Beef',
                    tier: 'supporter',
                    description:
                      'Supporting local food security and nutrition programs.',
                    sponsoredProjects: 5,
                    communityImpact: '200+ meals provided',
                    featuredPlacement: false,
                    currentOffers: [
                      '10% discount on bulk orders for community events',
                      'Free meat donations for school feeding programs',
                    ],
                  }}
                  variant="card"
                  showMetrics={true}
                />
              </motion.div>
            </div>

            {/* Business Impact Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    Business Impact Dashboard Preview
                  </CardTitle>
                  <p className="text-purple-700 dark:text-purple-300">
                    Real-time CSR tracking and community engagement metrics
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        89%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Community Satisfaction
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        12% from last month
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        BWP 45K
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Community Investment
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        25% from last quarter
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        1,247
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Lives Impacted
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        18% from last month
                      </div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        4.8/5
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Brand Perception
                      </div>
                      <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        0.3 from last survey
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                      Recent Community Engagement
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Sponsored Tlokweng Library Roof Repair
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            BWP 15,000 contribution • 200+ community members
                            benefited
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                        >
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Youth Skills Development Workshop
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            BWP 8,000 investment • 45 youth participants
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                        >
                          In Progress
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Community Garden Equipment Donation
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            BWP 12,000 value • 80+ families to benefit
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700"
                        >
                          Planned
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        {/* Enhanced Government Tools Tab */}
        <TabsContent value="government-tools" className="space-y-8">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h2 className="text-2xl font-bold">
                Kgotla+ Governance Solutions
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Government officials now have access to enhanced analytics and
                management tools through subscription-gated features.
              </p>
            </motion.div>

            {/* Government Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    Ward Councilor Dashboard Preview
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Comprehensive governance tools for effective ward management
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Quick Stats */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Ward Performance
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            92%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Issue Resolution Rate
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            156
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Active Issues
                          </div>
                        </div>
                        <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            4.2 days
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Avg Response Time
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Recent Activities
                      </h4>
                      <div className="space-y-2">
                        <div className="p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                          <div className="font-medium">
                            Water issue resolved
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Serowe Ward 12 • 2 hours ago
                          </div>
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                          <div className="font-medium">
                            New road repair request
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Main Street • 4 hours ago
                          </div>
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-900 rounded border text-sm">
                          <div className="font-medium">
                            Community meeting scheduled
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Kgotla Hall • Tomorrow 2 PM
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Communication Tools */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                        Communication Tools
                      </h4>
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          className="w-full justify-start gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Send SMS Alert
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start gap-2"
                        >
                          <Bell className="w-4 h-4" />
                          Push Notification
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-start gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Generate Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Subscription-Gated Analytics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Advanced analytics features are now protected by Kgotla+
                        subscription requirements, ensuring sustainable funding
                        for platform development.
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            Kgotla+ Required
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Advanced analytics and detailed performance insights
                          are available with Kgotla+ Local Governance Solutions
                          subscription.
                        </p>
                      </div>

                      {/* Analytics Preview */}
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium">
                          Available Analytics
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Cross-ward performance comparison</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Citizen satisfaction trends</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Budget utilization tracking</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Policy impact simulation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Tier-Based Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Ward Essentials
                            </Badge>
                            <span className="text-sm font-medium">
                              BWP 750/month
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Basic ward management, citizen communication, task
                            tracking
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              District Command
                            </Badge>
                            <span className="text-sm font-medium">
                              BWP 2,800/month
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Multi-ward coordination, advanced analytics, budget
                            tracking
                          </div>
                        </div>
                        <div className="p-3 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-800">
                              National Oversight
                            </Badge>
                            <span className="text-sm font-medium">
                              BWP 6,500/month
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            National dashboards, policy simulation,
                            cross-district insights
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">
                          ROI Benefits
                        </h4>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>• 60% faster issue resolution</div>
                          <div>• 40% improvement in citizen satisfaction</div>
                          <div>• 25% reduction in administrative overhead</div>
                          <div>• Real-time performance monitoring</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Tlhaloso Data Insights Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-6 h-6 text-orange-600" />
                    Tlhaloso Data Insights Preview
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Premium analytics and intelligence reports for strategic
                    decision-making
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Droplets className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold">Water Access Analysis</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>• 89% household coverage achieved</div>
                        <div>• 12 critical infrastructure gaps identified</div>
                        <div>• BWP 2.3M investment recommendation</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold">
                          Youth Employment Trends
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>• 34% youth unemployment rate</div>
                        <div>• Skills gap in tech sector identified</div>
                        <div>• 5 intervention strategies proposed</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
                      <div className="flex items-center gap-2 mb-3">
                        <Car className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold">
                          Transportation Analysis
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>• 67% public transport satisfaction</div>
                        <div>• 8 high-traffic bottlenecks mapped</div>
                        <div>• Smart traffic solutions recommended</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-6 py-12"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-8">
            <div className="space-y-6">
              <Sparkles className="w-12 h-12 text-blue-600 mx-auto" />
              <h2 className="text-2xl font-bold">
                Experience the Full Ecosystem
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The Mmogo Impact Ecosystem is now fully integrated throughout
                the Civic Portal, providing a seamless experience for citizens,
                businesses, and government officials.
              </p>

              {/* Key Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    BWP 4.1M+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    50,000+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Users
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">270+</div>
                  <div className="text-sm text-muted-foreground">Partners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">92%</div>
                  <div className="text-sm text-muted-foreground">
                    Satisfaction
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Globe className="w-4 h-4" />
                  Explore Pricing
                </Button>
                <Button variant="outline" className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  View Demo Mode
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowGuidedTour(true)}
                >
                  <Play className="w-4 h-4" />
                  Start Tour
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Guided Tour Modal */}
      <AnimatePresence>
        {showGuidedTour && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGuidedTour(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Mmogo Impact Ecosystem Tour
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGuidedTour(false)}
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-6">
                  {demoScenarios.map((scenario, index) => (
                    <Card
                      key={scenario.id}
                      className={`cursor-pointer transition-all duration-300 ${
                        currentDemoStep === index
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                          : 'hover:border-blue-300'
                      }`}
                      onClick={() => {
                        setCurrentDemoStep(index);
                        setActiveShowcase(
                          index === 0
                            ? 'user-experience'
                            : index === 1
                            ? 'business-integration'
                            : index === 2
                            ? 'government-tools'
                            : 'overview'
                        );
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              currentDemoStep === index
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {scenario.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              {scenario.description}
                            </p>
                            <div className="space-y-1">
                              {scenario.steps.map((step, stepIndex) => (
                                <div
                                  key={stepIndex}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                  <span>{step}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowGuidedTour(false)}
                  >
                    Close Tour
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                      className="gap-2"
                    >
                      {isAutoPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Auto Play
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowGuidedTour(false);
                        setIsAutoPlaying(true);
                      }}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Demo
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MmogoEcosystemShowcase;
