import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { useDemoMode } from '@/providers/DemoProvider';
import { useAuth } from '@/lib/auth';
import {
  Settings,
  Crown,
  Zap,
  RefreshCw,
  CheckCircle,
  Users,
  Building2,
  Lightbulb,
  Star,
  Code,
  TestTube,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Target,
  Coins,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
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
  Heart,
  Award,
  Globe,
  MessageSquare,
  Bell,
  FileText,
  Shield,
  Clock,
  ThumbsUp,
  Share2,
  Download,
  Filter,
  Search,
  Info,
  ChevronRight,
  MapPin,
  Calendar,
  Phone,
  Mail,
  ExternalLink,
} from 'lucide-react';

interface EnhancedSubscriptionDevToolsProps {
  className?: string;
}

interface DemoScenario {
  id: string;
  title: string;
  description: string;
  tier: string;
  role: string;
  features: string[];
  mockData: any;
}

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
  targetUsers: string[];
  keyMetrics: {
    users?: string;
    revenue?: string;
    impact?: string;
    growth?: string;
  };
  botswanaExamples: string[];
}

const EnhancedSubscriptionDevTools: React.FC<
  EnhancedSubscriptionDevToolsProps
> = ({ className = '' }) => {
  const { isDemoMode, demoUser, setDemoUser } = useDemoMode();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Enhanced state management
  const [activeTab, setActiveTab] = useState('ecosystem');
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoDemo, setAutoDemo] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(3000);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [simulationMode, setSimulationMode] = useState(false);

  // Only show in development mode or demo mode
  const isDevelopment = process.env.NODE_ENV === 'development' || isDemoMode;

  if (!isDevelopment) {
    return null;
  }

  // Enhanced ecosystem tiers with comprehensive demo data
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

  // Demo scenarios for comprehensive testing
  const demoScenarios: DemoScenario[] = [
    {
      id: 'citizen-journey',
      title: 'Citizen Experience Journey',
      description:
        'Follow Maria from Gaborone as she reports and funds a community issue',
      tier: 'motse',
      role: 'citizen',
      features: ['Issue reporting', 'Thusang funding', 'Community engagement'],
      mockData: {
        user: { name: 'Maria Mogale', location: 'Gaborone', role: 'citizen' },
        issue: {
          title: 'Pothole on Independence Avenue',
          funding: 2500,
          goal: 5000,
        },
      },
    },
    {
      id: 'business-partnership',
      title: 'Business Partnership Demo',
      description:
        'See how Choppies supermarket engages with community through Tirisano',
      tier: 'tirisano',
      role: 'business',
      features: ['CSR tracking', 'Community sponsorship', 'Brand visibility'],
      mockData: {
        business: {
          name: 'Choppies Supermarket',
          tier: 'champion',
          projects: 8,
        },
        impact: { satisfaction: '89%', investment: 'BWP 45K', lives: 1247 },
      },
    },
    {
      id: 'government-efficiency',
      title: 'Government Efficiency Showcase',
      description:
        'Ward Councilor uses Kgotla+ to manage constituency effectively',
      tier: 'kgotla',
      role: 'official',
      features: [
        'Ward dashboard',
        'Citizen communication',
        'Performance analytics',
      ],
      mockData: {
        official: { name: 'Councilor Thabo Seretse', ward: 'Serowe Ward 12' },
        performance: {
          resolution: '92%',
          response: '4.2 days',
          satisfaction: '87%',
        },
      },
    },
    {
      id: 'investor-overview',
      title: 'Investor Revenue Model',
      description:
        'Complete overview of Mmogo Impact Ecosystem revenue streams',
      tier: 'all',
      role: 'investor',
      features: ['Revenue analytics', 'Growth metrics', 'Market penetration'],
      mockData: {
        revenue: { monthly: 'BWP 4.1M+', growth: '35%', users: '50K+' },
        projections: { year1: 'BWP 65M', year2: 'BWP 120M', year3: 'BWP 200M' },
      },
    },
  ];

  // Auto-demo functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoDemo) {
      interval = setInterval(() => {
        setCurrentScenario((prev) => (prev + 1) % demoScenarios.length);
      }, demoSpeed);
    }
    return () => clearInterval(interval);
  }, [autoDemo, demoSpeed, demoScenarios.length]);

  // Tier switching functionality
  const handleEcosystemTierSwitch = (tierId: string) => {
    const tier = ecosystemTiers.find((t) => t.id === tierId);
    if (tier && setDemoUser) {
      const mockUser = {
        id: `demo-${tierId}-user`,
        name: `Demo ${tier.name} User`,
        role: tierId === 'kgotla' ? 'official' : 'citizen',
        tier: tierId,
        subscription_status: 'active',
        subscription_tier: tierId,
      };
      setDemoUser(mockUser);

      toast({
        title: '🔄 Tier Switched',
        description: `Now demonstrating ${tier.name} (${tier.setswanaName})`,
        duration: 3000,
      });
    }
  };

  // Role switching functionality
  const handleRoleSwitch = (role: string) => {
    if (setDemoUser) {
      const mockUser = {
        id: `demo-${role}-user`,
        name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
        role: role,
        tier:
          role === 'official'
            ? 'kgotla'
            : role === 'business'
            ? 'tirisano'
            : 'motse',
        subscription_status: 'active',
      };
      setDemoUser(mockUser);

      toast({
        title: '👤 Role Switched',
        description: `Now demonstrating ${role} experience`,
        duration: 3000,
      });
    }
  };

  // Scenario simulation
  const simulateScenario = (scenario: DemoScenario) => {
    setCurrentScenario(demoScenarios.indexOf(scenario));
    handleEcosystemTierSwitch(
      scenario.tier === 'all' ? 'motse' : scenario.tier
    );
    handleRoleSwitch(scenario.role);

    toast({
      title: '🎬 Scenario Activated',
      description: `Simulating: ${scenario.title}`,
      duration: 4000,
    });
  };

  // Reset to defaults
  const resetToDefaults = () => {
    handleEcosystemTierSwitch('motse');
    setAutoDemo(false);
    setCurrentScenario(0);
    setSimulationMode(false);

    toast({
      title: '🔄 Reset Complete',
      description: 'Demo reset to Motse Platform (free tier)',
      duration: 3000,
    });
  };

  // Random tier selection
  const randomizeTier = () => {
    const randomTier =
      ecosystemTiers[Math.floor(Math.random() * ecosystemTiers.length)];
    handleEcosystemTierSwitch(randomTier.id);
  };

  // Generate demo data
  const generateDemoData = (type: string) => {
    const demoData = {
      issues: Array.from({ length: 10 }, (_, i) => ({
        id: `demo-issue-${i + 1}`,
        title: `Demo Issue ${i + 1}`,
        description: `This is a demo issue for testing purposes`,
        status: ['open', 'in_progress', 'resolved'][
          Math.floor(Math.random() * 3)
        ],
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        funding: Math.floor(Math.random() * 50000),
        goal: Math.floor(Math.random() * 100000) + 50000,
      })),
      users: Array.from({ length: 50 }, (_, i) => ({
        id: `demo-user-${i + 1}`,
        name: `Demo User ${i + 1}`,
        role: ['citizen', 'official', 'business'][
          Math.floor(Math.random() * 3)
        ],
        tier: ecosystemTiers[Math.floor(Math.random() * ecosystemTiers.length)]
          .id,
      })),
      analytics: {
        totalUsers: Math.floor(Math.random() * 100000) + 50000,
        activeIssues: Math.floor(Math.random() * 1000) + 500,
        resolvedIssues: Math.floor(Math.random() * 5000) + 2000,
        totalFunding: Math.floor(Math.random() * 10000000) + 5000000,
        satisfaction: Math.floor(Math.random() * 20) + 80,
      },
    };

    toast({
      title: '📊 Demo Data Generated',
      description: `Generated ${type} demo data for testing`,
      duration: 3000,
    });

    return demoData;
  };

  if (!isVisible) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsVisible(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg border-0 rounded-full h-12 w-12 p-0"
                size="sm"
              >
                <Sparkles className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 text-white">
              <p>Enhanced Mmogo Impact Ecosystem Demo Tools</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-96 max-h-[80vh] overflow-hidden"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">
                    Enhanced Demo Tools
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Mmogo Impact Ecosystem Testing
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isMinimized ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsVisible(false)}
                  className="h-6 w-6 p-0"
                >
                  <EyeOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          {!isMinimized && (
            <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4 m-4 mb-0">
                  <TabsTrigger value="ecosystem" className="text-xs">
                    Ecosystem
                  </TabsTrigger>
                  <TabsTrigger value="scenarios" className="text-xs">
                    Scenarios
                  </TabsTrigger>
                  <TabsTrigger value="simulation" className="text-xs">
                    Simulation
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Ecosystem Tab */}
                <TabsContent value="ecosystem" className="p-4 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Ecosystem Tiers
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {ecosystemTiers.map((tier) => {
                        const IconComponent = tier.icon;
                        const isActive = demoUser?.tier === tier.id;
                        return (
                          <Button
                            key={tier.id}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleEcosystemTierSwitch(tier.id)}
                            className={`justify-start h-auto p-3 ${
                              isActive ? 'bg-blue-600 text-white' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className={`p-1.5 ${tier.bgColor} rounded`}>
                                <IconComponent
                                  className={`h-3 w-3 ${tier.color}`}
                                />
                              </div>
                              <div className="flex-1 text-left">
                                <div className="text-xs font-medium">
                                  {tier.name}
                                </div>
                                <div className="text-xs opacity-70">
                                  {tier.pricing}
                                </div>
                              </div>
                              {isActive && <CheckCircle className="h-3 w-3" />}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={randomizeTier}
                        className="justify-start text-xs"
                      >
                        <Shuffle className="h-3 w-3 mr-2" />
                        Random Tier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetToDefaults}
                        className="justify-start text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-2" />
                        Reset Demo
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Scenarios Tab */}
                <TabsContent value="scenarios" className="p-4 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Demo Scenarios
                    </h3>
                    <div className="space-y-2">
                      {demoScenarios.map((scenario, index) => {
                        const isActive = currentScenario === index;
                        return (
                          <Card
                            key={scenario.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              isActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                : 'hover:border-blue-300'
                            }`}
                            onClick={() => simulateScenario(scenario)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                    isActive
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xs font-medium mb-1">
                                    {scenario.title}
                                  </h4>
                                  <p className="text-xs text-muted-foreground mb-2">
                                    {scenario.description}
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {scenario.role}
                                    </Badge>
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {scenario.tier}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        Auto Demo
                      </h3>
                      <Switch
                        checked={autoDemo}
                        onCheckedChange={setAutoDemo}
                      />
                    </div>
                    {autoDemo && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Speed: {demoSpeed}ms</span>
                          <span>
                            Step {currentScenario + 1}/{demoScenarios.length}
                          </span>
                        </div>
                        <Slider
                          value={[demoSpeed]}
                          onValueChange={(value) => setDemoSpeed(value[0])}
                          min={1000}
                          max={10000}
                          step={500}
                          className="w-full"
                        />
                        <Progress
                          value={
                            ((currentScenario + 1) / demoScenarios.length) * 100
                          }
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Simulation Tab */}
                <TabsContent value="simulation" className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        Simulation Mode
                      </h3>
                      <Switch
                        checked={simulationMode}
                        onCheckedChange={setSimulationMode}
                      />
                    </div>

                    {simulationMode && (
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-2">
                            <TestTube className="h-4 w-4 text-blue-600" />
                            <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                              Simulation Active
                            </span>
                          </div>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            All interactions are simulated for testing purposes
                          </p>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-xs font-medium">
                            Generate Demo Data
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateDemoData('issues')}
                              className="text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Issues
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateDemoData('users')}
                              className="text-xs"
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Users
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateDemoData('analytics')}
                              className="text-xs"
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              Analytics
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateDemoData('funding')}
                              className="text-xs"
                            >
                              <Coins className="h-3 w-3 mr-1" />
                              Funding
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="p-4 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      Advanced Controls
                    </h3>

                    <div className="space-y-2">
                      <h4 className="text-xs font-medium">Role Switching</h4>
                      <div className="grid grid-cols-3 gap-1">
                        {['citizen', 'business', 'official'].map((role) => (
                          <Button
                            key={role}
                            variant={
                              demoUser?.role === role ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handleRoleSwitch(role)}
                            className="text-xs"
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-xs font-medium">Current State</h4>
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <div>User: {demoUser?.name || 'None'}</div>
                        <div>Role: {demoUser?.role || 'None'}</div>
                        <div>Tier: {demoUser?.tier || 'None'}</div>
                        <div>
                          Demo Mode: {isDemoMode ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-xs font-medium">Developer Actions</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            console.log('Demo State:', {
                              demoUser,
                              currentScenario,
                              autoDemo,
                            })
                          }
                          className="justify-start text-xs"
                        >
                          <Code className="h-3 w-3 mr-2" />
                          Log State
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('/pricing', '_blank')}
                          className="justify-start text-xs"
                        >
                          <Globe className="h-3 w-3 mr-2" />
                          View Pricing
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default EnhancedSubscriptionDevTools;
