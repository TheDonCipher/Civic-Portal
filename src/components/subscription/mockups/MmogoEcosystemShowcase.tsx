import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Heart,
  Crown,
  Building2,
  BarChart3,
  Users,
  Target,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  Star,
  CheckCircle2,
  ArrowRight,
  Play,
  Eye,
} from 'lucide-react';

// Import the individual mockup components
import ThusangProjectMockup from './ThusangProjectMockup';
import KgotlaDashboardMockup from './KgotlaDashboardMockup';
import TirisanoMmogoBusinessMockup from './TirisanoMmogoBusinessMockup';
import TlhalosoReportMockup from './TlhalosoReportMockup';

/**
 * Mmogo Impact Ecosystem Showcase
 *
 * This component provides a comprehensive overview and navigation
 * for all four tiers of the Mmogo Impact Ecosystem business model:
 *
 * 1. Motse Platform (Free) - Universal access foundation
 * 2. Thusang Community Action Funds - Project-based crowdfunding
 * 3. Kgotla+ Local Governance Solutions - Government subscriptions
 * 4. Tirisano Mmogo Business & Enterprise Solutions - Business partnerships
 * 5. Tlhaloso Data & Insights Services - Premium analytics
 */

interface EcosystemTier {
  id: string;
  name: string;
  setswanaName: string;
  description: string;
  pricing: string;
  targetUsers: string[];
  keyFeatures: string[];
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  component: React.ComponentType;
}

const ecosystemTiers: EcosystemTier[] = [
  {
    id: 'motse',
    name: 'Motse Platform',
    setswanaName: 'Our Village',
    description:
      'Free foundational platform ensuring universal access and community building',
    pricing: 'Free for All Citizens',
    targetUsers: ['All Citizens', 'Community Members', 'Local Residents'],
    keyFeatures: [
      'Easy issue reporting (text, photo, GPS, voice)',
      'Public issue tracking and progress visualization',
      'Community forums for local discussions',
      'Location-based notifications',
      'Directory of local services and emergency contacts',
    ],
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    component: () => (
      <div className="p-8 text-center text-gray-600">
        Motse Platform is already implemented in the main application
      </div>
    ),
  },
  {
    id: 'thusang',
    name: 'Thusang Community Action Funds',
    setswanaName: 'Together',
    description:
      'Project-focused crowdfunding for community-prioritized initiatives',
    pricing: '5-7% platform fee on funded projects',
    targetUsers: ['Citizens', 'Community Groups', 'Local Organizations'],
    keyFeatures: [
      'Campaign-based crowdfunding for specific projects',
      'Clear budget and goals with cost estimation',
      'Visual progress tracking with thermometer displays',
      'Transparent fee structure (5-7% on disbursed funds)',
      'Project updates with photos and videos',
      'Recurring monthly contribution options',
    ],
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    component: ThusangProjectMockup,
  },
  {
    id: 'kgotla',
    name: 'Kgotla+ Local Governance Solutions',
    setswanaName: 'Traditional Council Plus',
    description: 'Subscription-based efficiency tools for government entities',
    pricing: 'BWP 750 - 6,500/month',
    targetUsers: [
      'Ward Councilors',
      'District Councils',
      'Government Ministries',
    ],
    keyFeatures: [
      'Secure dashboard for ward-specific issue management',
      'Direct citizen communication tools (SMS/in-app)',
      'Task assignment and tracking for resolution teams',
      'Performance analytics and comparative reporting',
      'USSD interface for urgent alerts and updates',
      'Setswana/English translation support',
    ],
    icon: Crown,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    component: KgotlaDashboardMockup,
  },
  {
    id: 'tirisano_mmogo',
    name: 'Tirisano Mmogo Business & Enterprise Solutions',
    setswanaName: 'Working Together',
    description: 'Value-driven partnerships for businesses and organizations',
    pricing: 'BWP 200 - 1,500+/month',
    targetUsers: [
      'Local SMEs',
      'Corporations',
      'NGOs',
      'Development Organizations',
    ],
    keyFeatures: [
      'Enhanced brand visibility through community support',
      'Hyperlocal marketing and community offers',
      'Monthly Local Pulse Reports with anonymized insights',
      'CSR project co-creation opportunities',
      'API access for operational data integration',
      'Community impact measurement and recognition',
    ],
    icon: Building2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    component: TirisanoMmogoBusinessMockup,
  },
  {
    id: 'tlhaloso',
    name: 'Tlhaloso Data & Insights Services',
    setswanaName: 'Explanation/Analysis',
    description: 'Premium analytics for strategic decision-making',
    pricing: 'BWP 1,000+ per report/subscription',
    targetUsers: [
      'Researchers',
      'Policy Makers',
      'Urban Planners',
      'Development Agencies',
    ],
    keyFeatures: [
      'Thematic intelligence reports on civic sectors',
      'Custom data projects and bespoke research',
      'Developer API access to aggregated datasets',
      'Strict ethical framework and privacy protection',
      'Strategic insights for planning and investment',
      'Academic and policy research support',
    ],
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200',
    component: TlhalosoReportMockup,
  },
];

const MmogoEcosystemShowcase: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTier, setSelectedTier] = useState<string>('thusang');
  const [viewMode, setViewMode] = useState<'overview' | 'demo'>('overview');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize from URL parameters
  useEffect(() => {
    const tierParam = searchParams.get('tier');
    const modeParam = searchParams.get('mode');

    if (tierParam && ecosystemTiers.find((t) => t.id === tierParam)) {
      setSelectedTier(tierParam);
    }

    if (modeParam === 'demo') {
      setViewMode('demo');
    }
  }, [searchParams]);

  // Update URL when tier or mode changes
  const updateURL = (tier: string, mode: 'overview' | 'demo') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tier', tier);
    newParams.set('mode', mode);
    setSearchParams(newParams);
  };

  const currentTier = ecosystemTiers.find((tier) => tier.id === selectedTier);
  const CurrentComponent = currentTier?.component;

  // Auto-demo functionality
  React.useEffect(() => {
    if (!isDemoMode) return;

    const interval = setInterval(() => {
      setSelectedTier((current) => {
        const currentIndex = ecosystemTiers.findIndex(
          (tier) => tier.id === current
        );
        const nextIndex = (currentIndex + 1) % ecosystemTiers.length;
        return ecosystemTiers[nextIndex].id;
      });
    }, 5000); // Change tier every 5 seconds

    return () => clearInterval(interval);
  }, [isDemoMode]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge
            variant="outline"
            className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-lg px-4 py-2"
          >
            Mmogo Impact Ecosystem
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Business Model Integration Mockups
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive UI mockups for integrating the "Mmogo Impact
            Ecosystem" business model into our civic portal's issue resolution
            workflow
          </p>
        </motion.div>

        {/* Philosophy Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white p-6 rounded-xl"
        >
          <h2 className="text-xl font-bold mb-2">Core Philosophy</h2>
          <p className="text-blue-100 dark:text-blue-200">
            Shift from just "reporting issues" to becoming an "Action &
            Resolution Platform" where value is tied to facilitation, solutions,
            insights, and stakeholder empowerment. The "Mmogo" (Together)
            principle remains central to our Botswana-focused civic portal.
          </p>
        </motion.div>
      </div>

      {/* Tier Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ecosystem Tiers</span>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('overview');
                  updateURL(selectedTier, 'overview');
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={viewMode === 'demo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewMode('demo');
                  updateURL(selectedTier, 'demo');
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Interactive Demo
              </Button>
              <Button
                variant={isDemoMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={isDemoMode ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isDemoMode ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-pulse" />
                    Auto Demo ON
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Auto Demo
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {ecosystemTiers.map((tier, index) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? `${tier.bgColor} border-current shadow-lg transform scale-105`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  } ${isDemoMode && isSelected ? 'animate-pulse' : ''}`}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    updateURL(tier.id, viewMode);
                  }}
                >
                  <div className="text-center space-y-2">
                    <div
                      className={`p-3 rounded-lg ${tier.bgColor} mx-auto w-fit`}
                    >
                      <Icon className={`h-6 w-6 ${tier.color}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm dark:text-gray-100">
                        {tier.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        {tier.setswanaName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tier.pricing}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>

        {/* Demo Progress Indicator */}
        {isDemoMode && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Auto Demo Progress</span>
              <span>
                {ecosystemTiers.findIndex((t) => t.id === selectedTier) + 1} /{' '}
                {ecosystemTiers.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((ecosystemTiers.findIndex((t) => t.id === selectedTier) +
                      1) /
                      ecosystemTiers.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Content Display */}
      {viewMode === 'overview' && currentTier && (
        <motion.div
          key={selectedTier}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <Card className={`${currentTier.bgColor} border-2`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${currentTier.bgColor}`}>
                  <currentTier.icon
                    className={`h-8 w-8 ${currentTier.color}`}
                  />
                </div>
                <div>
                  <CardTitle className="text-xl">{currentTier.name}</CardTitle>
                  <p className="text-sm text-gray-600 italic">
                    {currentTier.setswanaName}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2 dark:text-gray-100">
                    Description
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    {currentTier.description}
                  </p>

                  <h4 className="font-medium mb-2 dark:text-gray-100">
                    Pricing
                  </h4>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-4">
                    {currentTier.pricing}
                  </p>

                  <h4 className="font-medium mb-2 dark:text-gray-100">
                    Target Users
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentTier.targetUsers.map((user, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {user}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2 dark:text-gray-100">
                    Key Features
                  </h4>
                  <div className="space-y-2">
                    {currentTier.keyFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button onClick={() => setViewMode('demo')} className="w-full">
                  <Play className="h-4 w-4 mr-2" />
                  View Interactive Demo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Interactive Demo */}
      {viewMode === 'demo' && CurrentComponent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4"
        >
          <div className="mb-4 text-center">
            <Badge className={currentTier?.bgColor}>
              Interactive Demo: {currentTier?.name}
            </Badge>
          </div>
          <CurrentComponent />
        </motion.div>
      )}

      {/* Implementation Notes */}
      <Card className="bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            Implementation Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-100">
                Design System Compliance
              </h4>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Uses existing Tailwind CSS + Shadcn UI components</li>
                <li>
                  • Maintains Botswana government branding (blue color scheme)
                </li>
                <li>• Mobile-first responsive design patterns</li>
                <li>• Consistent with current card-based layouts</li>
                <li>• Framer Motion animations for polish</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 dark:text-gray-100">
                Cultural Integration
              </h4>
              <ul className="space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Setswana terminology throughout interfaces</li>
                <li>• Respect for traditional Kgotla structures</li>
                <li>• Ubuntu philosophy in community features</li>
                <li>• Local payment method integration (Orange Money, etc.)</li>
                <li>• Government budget cycle alignment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MmogoEcosystemShowcase;
