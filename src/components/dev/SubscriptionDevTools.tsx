import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
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
  tierConfig,
  statusConfig,
} from '@/components/subscription/SubscriptionStatusIndicator';
import {
  Settings,
  Crown,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Users,
  Building2,
  Lightbulb,
  Star,
  Code,
  Database,
  TestTube,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Shuffle,
  Play,
  Pause,
  RotateCcw,
  Info,
  Sparkles,
  Target,
  Coins,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Gauge,
} from 'lucide-react';

interface SubscriptionDevToolsProps {
  className?: string;
}

interface MockSubscriptionState {
  tier: 'motse' | 'thusang' | 'tirisano' | 'kgotla' | 'tlhaloso';
  status: 'active' | 'pending' | 'cancelled' | 'expired' | 'trial';
  amount: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: string;
  usageLimit: number | null;
  currentUsage: number;
  autoRenew: boolean;
  features: string[];
  description: string;
  businessType?: string;
  governmentLevel?: string;
  serviceType?: string;
}

interface DemoUserRole {
  id: string;
  name: string;
  role: 'citizen' | 'official' | 'business' | 'admin';
  icon: React.ComponentType<any>;
  description: string;
  defaultTier: string;
  color: string;
}

interface TierPreview {
  tier: string;
  features: string[];
  limitations: string[];
  demoScenarios: string[];
}

const SubscriptionDevTools: React.FC<SubscriptionDevToolsProps> = ({
  className = '',
}) => {
  const { isDemoMode, demoUser, setDemoUser } = useDemoMode();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ecosystem');
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoDemo, setAutoDemo] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState(3000);

  // Only show in development mode or demo mode
  const isDevelopment = process.env.NODE_ENV === 'development' || isDemoMode;

  const [mockSubscription, setMockSubscription] =
    useState<MockSubscriptionState>({
      tier: 'motse',
      status: 'active',
      amount: 0,
      currency: 'BWP',
      billingCycle: 'forever',
      nextBillingDate: '',
      usageLimit: 10,
      currentUsage: 3,
      autoRenew: false,
      features: [
        'Issue reporting (text, photo, GPS, voice)',
        'Public issue tracking',
        'Community forums',
        'Basic notifications',
        'Local services directory',
      ],
      description: 'Free community access - the foundation of our village',
    });

  if (!isDevelopment) {
    return null;
  }

  // Enhanced Mmogo Impact Ecosystem configuration
  const ecosystemTiers = [
    {
      id: 'motse',
      name: 'Motse Platform',
      subtitle: 'Our Village - Free Foundation',
      icon: Users,
      color: 'bg-green-100 text-green-800 border-green-200',
      bgGradient: 'from-green-50 to-emerald-50',
      amount: 0,
      currency: 'BWP',
      billingCycle: 'forever',
      usageLimit: 10,
      features: [
        'Issue reporting (text, photo, GPS, voice)',
        'Public issue tracking',
        'Community forums',
        'Basic notifications',
        'Local services directory',
      ],
      description: 'Free community access - the foundation of our village',
      demoScenarios: [
        'Report a pothole on A1 Highway',
        'Join community discussion about water shortage',
        'Track progress of local infrastructure projects',
      ],
    },
    {
      id: 'thusang',
      name: 'Thusang Projects',
      subtitle: 'Community Action Funds',
      icon: Star,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      bgGradient: 'from-blue-50 to-cyan-50',
      amount: 0,
      currency: 'BWP',
      billingCycle: 'project-based',
      usageLimit: null,
      features: [
        'All Motse Platform features',
        'Project crowdfunding participation',
        'Transparent fund tracking',
        'Project impact updates',
        'Recurring thematic fund support',
        'Community project voting',
      ],
      description:
        'Campaign-based crowdfunding for community projects (5-7% project fee)',
      demoScenarios: [
        'Fund Tlokweng Library Roof Repair - BWP 15,000',
        'Support Mogoditshane Ward 3 Streetlights - BWP 8,500',
        'Contribute to Gaborone Parks Maintenance Fund - BWP 20/month',
      ],
    },
    {
      id: 'tirisano',
      name: 'Tirisano Mmogo Business',
      subtitle: 'Value-Driven Community Partnerships',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      bgGradient: 'from-purple-50 to-pink-50',
      amount: 500,
      currency: 'BWP',
      billingCycle: 'monthly',
      usageLimit: 50,
      features: [
        'Community Champion Badge',
        'Featured directory listing',
        'Logo on resolved issues',
        'Community offers promotion',
        'Monthly Local Pulse Report (5km radius)',
        'Issue alerts near business premises',
        'CSR impact tracking',
        'Hyperlocal market insights',
      ],
      description: 'Enhanced community engagement with measurable impact',
      demoScenarios: [
        'Showcase business as Community Champion',
        'Promote local deals to community members',
        'Receive insights about local community needs',
        'Co-create Digital Literacy Drive fund',
      ],
    },
    {
      id: 'kgotla',
      name: 'Kgotla+ Governance',
      subtitle: 'Efficiency & Engagement Solutions',
      icon: Crown,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      bgGradient: 'from-yellow-50 to-amber-50',
      amount: 750,
      currency: 'BWP',
      billingCycle: 'monthly',
      usageLimit: 100,
      features: [
        'Secure ward dashboard',
        'Direct citizen communication (SMS/in-app)',
        'Task assignment and tracking',
        'Basic analytics and reporting',
        'USSD interface for urgent alerts',
        'Setswana/English translation',
      ],
      description: 'Ward Essentials - Streamlined local governance',
      demoScenarios: [
        'Manage ward issues efficiently',
        'Communicate directly with citizens',
        'Track resolution performance metrics',
      ],
    },
    {
      id: 'tlhaloso',
      name: 'Tlhaloso Intelligence',
      subtitle: 'Data & Insights Services',
      icon: Lightbulb,
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      bgGradient: 'from-orange-50 to-red-50',
      amount: 2000,
      currency: 'BWP',
      billingCycle: 'monthly',
      usageLimit: null,
      features: [
        'Thematic Intelligence Reports',
        'Custom data projects',
        'Developer API access',
        'Aggregated national dashboards',
        'Policy impact simulation',
        'Cross-district benchmarking',
        'Anonymized data insights',
      ],
      description: 'Premium analytics for strategic decision-making',
      demoScenarios: [
        'Generate State of Water Access report',
        'Analyze Road Safety Hotspots & Trends',
        'Create Youth Employment Patterns Analysis',
      ],
    },
  ];

  // Demo user roles for quick switching
  const demoUserRoles: DemoUserRole[] = [
    {
      id: 'citizen',
      name: 'Thabo Mogale',
      role: 'citizen',
      icon: Users,
      description: 'Regular citizen using free Motse Platform',
      defaultTier: 'motse',
      color: 'bg-green-100 text-green-800',
    },
    {
      id: 'business',
      name: 'Kefilwe Seretse',
      role: 'business',
      icon: Building2,
      description: 'Local business owner with Tirisano Mmogo partnership',
      defaultTier: 'tirisano',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'official',
      name: 'Mpho Kgosana',
      role: 'official',
      icon: Crown,
      description: 'Government official with Kgotla+ access',
      defaultTier: 'kgotla',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      id: 'admin',
      name: 'Lesego Mothibi',
      role: 'admin',
      icon: Lightbulb,
      description: 'Data analyst with Tlhaloso Intelligence',
      defaultTier: 'tlhaloso',
      color: 'bg-orange-100 text-orange-800',
    },
  ];

  const statusOptions = [
    {
      value: 'active',
      label: 'Active',
      icon: CheckCircle,
      color: 'text-green-600',
      description: 'Subscription is active and all features are available',
    },
    {
      value: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
      description: 'Subscription is pending approval or payment processing',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      icon: AlertTriangle,
      color: 'text-red-600',
      description: 'Subscription has been cancelled',
    },
    {
      value: 'expired',
      label: 'Expired',
      icon: AlertTriangle,
      color: 'text-gray-600',
      description: 'Subscription has expired',
    },
    {
      value: 'trial',
      label: 'Trial',
      icon: Zap,
      color: 'text-blue-600',
      description: 'Currently on a trial period',
    },
  ];

  // Enhanced tier switching with full ecosystem data
  const handleEcosystemTierSwitch = (tierId: string) => {
    const tierData = ecosystemTiers.find((t) => t.id === tierId);
    if (!tierData) return;

    setMockSubscription({
      tier: tierId as any,
      status: 'active',
      amount: tierData.amount,
      currency: tierData.currency,
      billingCycle: tierData.billingCycle,
      nextBillingDate: tierData.billingCycle === 'forever' ? '' : '2024-03-01',
      usageLimit: tierData.usageLimit,
      currentUsage: Math.floor((tierData.usageLimit || 10) * 0.3), // 30% usage
      autoRenew: tierData.billingCycle !== 'forever',
      features: tierData.features,
      description: tierData.description,
    });

    toast({
      title: '🎯 Ecosystem Tier Switched',
      description: `Now experiencing ${tierData.name} - ${tierData.subtitle}`,
      duration: 4000,
    });
  };

  // Demo user role switching
  const handleUserRoleSwitch = (roleId: string) => {
    const role = demoUserRoles.find((r) => r.id === roleId);
    if (!role) return;

    // Update demo user context
    setDemoUser({
      id: role.id,
      name: role.name,
      role: role.role,
      email: `${role.name
        .toLowerCase()
        .replace(' ', '.')}@demo.civic-portal.bw`,
      department:
        role.role === 'official' ? 'Ministry of Local Government' : undefined,
    });

    // Switch to appropriate tier
    handleEcosystemTierSwitch(role.defaultTier);

    toast({
      title: '👤 Demo User Switched',
      description: `Now viewing as ${role.name} (${role.role})`,
      duration: 4000,
    });
  };

  const handleStatusChange = (status: string) => {
    setMockSubscription((prev) => ({
      ...prev,
      status: status as any,
    }));

    const statusInfo = statusOptions.find((s) => s.value === status);
    toast({
      title: '📊 Status Updated',
      description:
        statusInfo?.description || `Subscription status changed to ${status}`,
      duration: 3000,
    });
  };

  // Auto-demo functionality
  useEffect(() => {
    if (!autoDemo) return;

    const interval = setInterval(() => {
      const currentIndex = ecosystemTiers.findIndex(
        (t) => t.id === mockSubscription.tier
      );
      const nextIndex = (currentIndex + 1) % ecosystemTiers.length;
      handleEcosystemTierSwitch(ecosystemTiers[nextIndex].id);
    }, demoSpeed);

    return () => clearInterval(interval);
  }, [autoDemo, demoSpeed, mockSubscription.tier]);

  const simulateLifecycleEvent = (event: string) => {
    switch (event) {
      case 'payment_success':
        setMockSubscription((prev) => ({
          ...prev,
          status: 'active',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        }));
        break;
      case 'payment_failed':
        setMockSubscription((prev) => ({ ...prev, status: 'pending' }));
        break;
      case 'subscription_expired':
        setMockSubscription((prev) => ({ ...prev, status: 'expired' }));
        break;
      case 'trial_started':
        setMockSubscription((prev) => ({
          ...prev,
          status: 'trial',
          nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        }));
        break;
    }

    toast({
      title: '🔄 Lifecycle Event Simulated',
      description: `Simulated: ${event.replace('_', ' ')}`,
      duration: 3000,
    });
  };

  const resetToDefaults = () => {
    handleEcosystemTierSwitch('motse');
    setAutoDemo(false);

    toast({
      title: '🔄 Reset Complete',
      description: 'Demo reset to Motse Platform (free tier)',
      duration: 3000,
    });
  };

  const randomizeTier = () => {
    const randomTier =
      ecosystemTiers[Math.floor(Math.random() * ecosystemTiers.length)];
    handleEcosystemTierSwitch(randomTier.id);
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
              <p>Mmogo Impact Ecosystem Demo Tools</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`fixed bottom-4 right-4 w-[420px] max-h-[85vh] overflow-hidden z-50 ${className}`}
      >
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      Mmogo Impact Ecosystem
                    </CardTitle>
                    <p className="text-blue-100 text-sm">
                      Demo Tools & Business Model Showcase
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsMinimized(!isMinimized)}
                          className="text-white hover:bg-white/20 h-8 w-8 p-0"
                        >
                          {isMinimized ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsVisible(false)}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    ×
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                  Demo Mode Active
                </Badge>
                {autoDemo && (
                  <Badge className="bg-green-500/20 text-green-100 border-green-300/30 backdrop-blur-sm animate-pulse">
                    <Activity className="h-3 w-3 mr-1" />
                    Auto Demo
                  </Badge>
                )}
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
                  <TabsTrigger value="users" className="text-xs">
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="demo" className="text-xs">
                    Demo
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="text-xs">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Ecosystem Tab - Business Model Showcase */}
                <TabsContent value="ecosystem" className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        Mmogo Impact Ecosystem Tiers
                      </h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={randomizeTier}
                              className="h-8"
                            >
                              <Shuffle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Random tier</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                    <div className="space-y-2">
                      {ecosystemTiers.map((tier) => {
                        const isActive = mockSubscription.tier === tier.id;
                        const IconComponent = tier.icon;

                        return (
                          <motion.div
                            key={tier.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                              isActive
                                ? 'border-blue-500 bg-gradient-to-r ' +
                                  tier.bgGradient +
                                  ' shadow-md'
                                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                          >
                            <Button
                              variant="ghost"
                              onClick={() => handleEcosystemTierSwitch(tier.id)}
                              className="w-full h-auto p-3 justify-start hover:bg-transparent"
                            >
                              <div className="flex items-start gap-3 w-full">
                                <div
                                  className={`p-2 rounded-lg ${tier.color} flex-shrink-0`}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm">
                                      {tier.name}
                                    </h4>
                                    {isActive && (
                                      <Badge className="bg-blue-500 text-white text-xs">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {tier.subtitle}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs">
                                    {tier.amount === 0 ? (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        FREE
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-gray-100 text-gray-800 text-xs">
                                        {tier.currency} {tier.amount}/
                                        {tier.billingCycle}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Button>

                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="px-3 pb-3"
                              >
                                <Separator className="mb-3" />
                                <div className="space-y-2">
                                  <p className="text-xs text-gray-700 dark:text-gray-300">
                                    {tier.description}
                                  </p>
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                                      Key Features:
                                    </h5>
                                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                      {tier.features
                                        .slice(0, 3)
                                        .map((feature, idx) => (
                                          <li
                                            key={idx}
                                            className="flex items-center gap-1"
                                          >
                                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                            {feature}
                                          </li>
                                        ))}
                                      {tier.features.length > 3 && (
                                        <li className="text-gray-500">
                                          +{tier.features.length - 3} more
                                          features
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Users Tab - Role Switching */}
                <TabsContent value="users" className="p-4 space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">
                      Demo User Roles
                    </h3>
                    <p className="text-xs text-gray-600">
                      Switch between different user types to experience various
                      subscription tiers
                    </p>

                    <div className="space-y-2">
                      {demoUserRoles.map((role) => {
                        const isActive = demoUser?.role === role.role;
                        const IconComponent = role.icon;

                        return (
                          <motion.div
                            key={role.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`rounded-lg border-2 transition-all duration-200 ${
                              isActive
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}
                          >
                            <Button
                              variant="ghost"
                              onClick={() => handleUserRoleSwitch(role.id)}
                              className="w-full h-auto p-3 justify-start hover:bg-transparent"
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div
                                  className={`p-2 rounded-lg ${role.color} flex-shrink-0`}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="flex-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-sm">
                                      {role.name}
                                    </h4>
                                    {isActive && (
                                      <Badge className="bg-blue-500 text-white text-xs">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 capitalize">
                                    {role.role}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {role.description}
                                  </p>
                                </div>
                              </div>
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                {/* Demo Tab - Auto Demo & Controls */}
                <TabsContent value="demo" className="p-4 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Auto Demo Controls
                      </h3>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Switch
                          id="auto-demo"
                          checked={autoDemo}
                          onCheckedChange={setAutoDemo}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="auto-demo"
                            className="text-sm font-medium"
                          >
                            Auto Demo Mode
                          </Label>
                          <p className="text-xs text-gray-600">
                            Automatically cycle through all tiers
                          </p>
                        </div>
                        {autoDemo ? (
                          <Pause className="h-4 w-4 text-orange-500" />
                        ) : (
                          <Play className="h-4 w-4 text-green-500" />
                        )}
                      </div>

                      {autoDemo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <div>
                            <Label className="text-sm">
                              Demo Speed: {demoSpeed / 1000}s per tier
                            </Label>
                            <input
                              type="range"
                              min="1000"
                              max="10000"
                              step="500"
                              value={demoSpeed}
                              onChange={(e) =>
                                setDemoSpeed(parseInt(e.target.value))
                              }
                              className="w-full mt-2"
                            />
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Quick Actions
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={randomizeTier}
                          className="justify-start"
                        >
                          <Shuffle className="h-4 w-4 mr-2" />
                          Random Tier
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetToDefaults}
                          className="justify-start"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset Demo
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Current Demo State
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Active Tier:</span>
                          <Badge className="bg-blue-100 text-blue-800">
                            {ecosystemTiers.find(
                              (t) => t.id === mockSubscription.tier
                            )?.name || 'Unknown'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Status:</span>
                          <Badge
                            className={
                              statusOptions
                                .find(
                                  (s) => s.value === mockSubscription.status
                                )
                                ?.color.replace('text-', 'bg-')
                                .replace('-600', '-100') +
                              ' ' +
                              statusOptions.find(
                                (s) => s.value === mockSubscription.status
                              )?.color
                            }
                          >
                            {mockSubscription.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Demo User:</span>
                          <span className="font-medium">
                            {demoUser?.name || 'Not set'}
                          </span>
                        </div>
                        {mockSubscription.usageLimit && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Usage:</span>
                              <span className="text-xs">
                                {mockSubscription.currentUsage}/
                                {mockSubscription.usageLimit}
                              </span>
                            </div>
                            <Progress
                              value={
                                (mockSubscription.currentUsage /
                                  mockSubscription.usageLimit) *
                                100
                              }
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Advanced Tab - Technical Controls */}
                <TabsContent value="advanced" className="p-4 space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Advanced Controls
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="amount" className="text-xs">
                          Amount
                        </Label>
                        <Input
                          id="amount"
                          type="number"
                          value={mockSubscription.amount}
                          onChange={(e) =>
                            setMockSubscription((prev) => ({
                              ...prev,
                              amount: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency" className="text-xs">
                          Currency
                        </Label>
                        <Input
                          id="currency"
                          value={mockSubscription.currency}
                          onChange={(e) =>
                            setMockSubscription((prev) => ({
                              ...prev,
                              currency: e.target.value,
                            }))
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="usage-limit" className="text-xs">
                          Usage Limit
                        </Label>
                        <Input
                          id="usage-limit"
                          type="number"
                          value={mockSubscription.usageLimit || ''}
                          onChange={(e) =>
                            setMockSubscription((prev) => ({
                              ...prev,
                              usageLimit: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            }))
                          }
                          className="h-8 text-xs"
                          placeholder="Unlimited"
                        />
                      </div>
                      <div>
                        <Label htmlFor="current-usage" className="text-xs">
                          Current Usage
                        </Label>
                        <Input
                          id="current-usage"
                          type="number"
                          value={mockSubscription.currentUsage}
                          onChange={(e) =>
                            setMockSubscription((prev) => ({
                              ...prev,
                              currentUsage: parseInt(e.target.value) || 0,
                            }))
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Subscription Status</Label>
                      <Select
                        value={mockSubscription.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="h-8 text-xs mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <status.icon
                                  className={`h-3 w-3 ${status.color}`}
                                />
                                <span className="text-xs">{status.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-renew"
                        checked={mockSubscription.autoRenew}
                        onCheckedChange={(checked) =>
                          setMockSubscription((prev) => ({
                            ...prev,
                            autoRenew: checked,
                          }))
                        }
                      />
                      <Label htmlFor="auto-renew" className="text-xs">
                        Auto Renew
                      </Label>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-xs font-medium">
                        Lifecycle Events
                      </Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            simulateLifecycleEvent('payment_success')
                          }
                          className="h-8 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                          Payment Success
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            simulateLifecycleEvent('payment_failed')
                          }
                          className="h-8 text-xs"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1 text-red-600" />
                          Payment Failed
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            simulateLifecycleEvent('subscription_expired')
                          }
                          className="h-8 text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1 text-gray-600" />
                          Expired
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            simulateLifecycleEvent('trial_started')
                          }
                          className="h-8 text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1 text-blue-600" />
                          Start Trial
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
    </AnimatePresence>
  );
};

export default SubscriptionDevTools;
