import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Crown,
  Star,
  Building2,
  Lightbulb,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Users,
  BarChart3,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  limitations?: string[];
  targetAudience: string[];
  popular?: boolean;
  enterprise?: boolean;
}

interface SubscriptionUpgradeProps {
  currentTier?: string;
  userRole: 'citizen' | 'official' | 'admin';
  onUpgrade: (tierId: string) => void;
  onDowngrade: (tierId: string) => void;
}

const SubscriptionUpgrade: React.FC<SubscriptionUpgradeProps> = ({
  currentTier = 'motse',
  userRole,
  onUpgrade,
  onDowngrade,
}) => {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState<'upgrade' | 'downgrade'>('upgrade');

  // Define subscription tiers based on Mmogo Impact Ecosystem
  const subscriptionTiers: SubscriptionTier[] = [
    {
      id: 'motse',
      name: 'Motse Platform',
      description: 'Free community access for all citizens',
      price: 0,
      currency: 'BWP',
      billingCycle: 'Forever Free',
      icon: Users,
      color: 'bg-green-100 text-green-800',
      features: [
        'Issue reporting and tracking',
        'Community forums',
        'Public progress visualization',
        'Basic notifications',
        'Directory of local services',
      ],
      targetAudience: ['All Citizens'],
    },
    {
      id: 'thusang',
      name: 'Thusang Projects',
      description: 'Community crowdfunding participation',
      price: 0,
      currency: 'BWP',
      billingCycle: '5-7% project fee',
      icon: Star,
      color: 'bg-blue-100 text-blue-800',
      features: [
        'All Motse Platform features',
        'Project crowdfunding participation',
        'Transparent fee structure',
        'Project progress updates',
        'Community impact tracking',
      ],
      targetAudience: ['Citizens', 'Community Groups'],
    },
    {
      id: 'intla_supporter',
      name: 'Intla Community Supporter',
      description: 'Basic business community partnership',
      price: 200,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      features: [
        'Sponsor badge and directory listing',
        'Annual project sponsorship option',
        'Business premise issue alerts',
        'Community recognition',
      ],
      targetAudience: ['Small Businesses', 'Local Shops'],
    },
    {
      id: 'intla_champion',
      name: 'Intla Community Champion',
      description: 'Enhanced business visibility and engagement',
      price: 500,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      popular: true,
      features: [
        'All Supporter benefits',
        'Featured directory listing',
        'Community offers promotion',
        'Monthly Local Pulse Report',
        'Enhanced logo visibility',
      ],
      targetAudience: ['Medium Businesses', 'Service Providers'],
    },
    {
      id: 'intla_corporate',
      name: 'Intla Corporate Impact',
      description: 'Enterprise-level community partnership',
      price: 1500,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      enterprise: true,
      features: [
        'All Champion benefits',
        'Co-created CSR projects',
        'Custom data reports',
        'API access for data integration',
        'Dedicated account management',
      ],
      targetAudience: ['Large Corporations', 'NGOs'],
    },
    {
      id: 'kgotla_ward',
      name: 'Kgotla+ Ward Essentials',
      description: 'Local government efficiency tools',
      price: 750,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Crown,
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Secure ward dashboard',
        'Direct citizen communication',
        'Task assignment and tracking',
        'Basic analytics and reporting',
        'USSD interface for alerts',
      ],
      targetAudience: ['Ward Councilors', 'Local Government'],
    },
    {
      id: 'kgotla_district',
      name: 'Kgotla+ District Command',
      description: 'Multi-ward coordination and analytics',
      price: 2800,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Crown,
      color: 'bg-blue-100 text-blue-800',
      popular: userRole === 'official',
      features: [
        'All Ward Essentials features',
        'Cross-ward coordination tools',
        'Advanced analytics dashboard',
        'Performance benchmarking',
        'Custom reporting tools',
      ],
      targetAudience: ['District Councils', 'Regional Government'],
    },
    {
      id: 'kgotla_national',
      name: 'Kgotla+ National Oversight',
      description: 'National-level governance and policy tools',
      price: 6500,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Crown,
      color: 'bg-blue-100 text-blue-800',
      enterprise: true,
      features: [
        'All District Command features',
        'National-level dashboards',
        'Policy impact simulation',
        'Cross-district benchmarking',
        'Minister briefing tools',
      ],
      targetAudience: ['Ministries', 'National Agencies'],
    },
    {
      id: 'tlhaloso_reports',
      name: 'Tlhaloso Intelligence Reports',
      description: 'Premium data insights and analytics',
      price: 1000,
      currency: 'BWP',
      billingCycle: 'per report',
      icon: Lightbulb,
      color: 'bg-orange-100 text-orange-800',
      features: [
        'Thematic intelligence reports',
        'Sector-specific analysis',
        'Anonymized data insights',
        'Custom research projects',
        'Academic partnerships',
      ],
      targetAudience: ['Researchers', 'Urban Planners', 'NGOs'],
    },
    {
      id: 'tlhaloso_api',
      name: 'Tlhaloso Developer API',
      description: 'API access to aggregated datasets',
      price: 2000,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Lightbulb,
      color: 'bg-orange-100 text-orange-800',
      enterprise: true,
      features: [
        'Controlled API access',
        'Aggregated datasets',
        'Real-time data feeds',
        'Custom integration support',
        'Developer documentation',
      ],
      targetAudience: ['Developers', 'Tech Companies', 'Research Institutions'],
    },
  ];

  // Filter tiers based on user role
  const getAvailableTiers = () => {
    switch (userRole) {
      case 'citizen':
        return subscriptionTiers.filter(tier => 
          tier.id.startsWith('motse') || 
          tier.id.startsWith('thusang') || 
          tier.id.startsWith('tlhaloso')
        );
      case 'official':
        return subscriptionTiers.filter(tier => 
          tier.id.startsWith('kgotla') || 
          tier.id.startsWith('tlhaloso')
        );
      case 'admin':
        return subscriptionTiers; // Admins can see all tiers
      default:
        return subscriptionTiers.filter(tier => tier.id === 'motse');
    }
  };

  const availableTiers = getAvailableTiers();
  const currentTierData = subscriptionTiers.find(tier => tier.id === currentTier);

  const handleTierSelect = (tierId: string, action: 'upgrade' | 'downgrade') => {
    setSelectedTier(tierId);
    setActionType(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = () => {
    if (selectedTier) {
      if (actionType === 'upgrade') {
        onUpgrade(selectedTier);
      } else {
        onDowngrade(selectedTier);
      }
    }
    setShowConfirmDialog(false);
    setSelectedTier(null);
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    return React.createElement(tier.icon, { 
      className: "w-8 h-8 text-blue-600" 
    });
  };

  const isCurrentTier = (tierId: string) => tierId === currentTier;
  const isUpgrade = (tier: SubscriptionTier) => {
    if (!currentTierData) return true;
    return tier.price > currentTierData.price;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Subscription Plan</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upgrade or downgrade your subscription to access the features that best fit your needs
        </p>
        {currentTierData && (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Current plan:</span>
            <Badge className={currentTierData.color}>
              {currentTierData.name}
            </Badge>
          </div>
        )}
      </div>

      {/* Subscription Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTiers.map((tier) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`relative h-full transition-all duration-300 hover:shadow-lg ${
              isCurrentTier(tier.id) 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                : tier.popular 
                ? 'border-green-300 hover:border-green-400' 
                : 'hover:border-blue-300'
            }`}>
              {/* Popular Badge */}
              {tier.popular && !isCurrentTier(tier.id) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrentTier(tier.id) && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}

              <CardHeader className={`text-center space-y-4 ${tier.popular || isCurrentTier(tier.id) ? 'pt-8' : ''}`}>
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  {getTierIcon(tier)}
                </div>
                <div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {tier.price === 0 ? 'Free' : `BWP ${tier.price}`}
                  </div>
                  <p className="text-sm text-muted-foreground">{tier.billingCycle}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Target Audience */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Perfect for:</p>
                  <div className="flex flex-wrap gap-1">
                    {tier.targetAudience.map((audience, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  <p className="text-sm font-medium">Features included:</p>
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  {isCurrentTier(tier.id) ? (
                    <Button disabled className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full ${
                        isUpgrade(tier)
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                      onClick={() => handleTierSelect(tier.id, isUpgrade(tier) ? 'upgrade' : 'downgrade')}
                    >
                      {isUpgrade(tier) ? (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Upgrade to {tier.name}
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 mr-2" />
                          Downgrade to {tier.name}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'upgrade' ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-orange-600" />
              )}
              Confirm {actionType === 'upgrade' ? 'Upgrade' : 'Downgrade'}
            </DialogTitle>
            <DialogDescription>
              {selectedTier && (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to {actionType} to{' '}
                    <strong>{subscriptionTiers.find(t => t.id === selectedTier)?.name}</strong>?
                  </p>
                  
                  {actionType === 'upgrade' && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Upgrade Benefits</span>
                      </div>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        You'll gain access to additional features immediately. Your next billing cycle will reflect the new pricing.
                      </p>
                    </div>
                  )}

                  {actionType === 'downgrade' && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Downgrade Notice</span>
                      </div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                        Some features will be removed at the end of your current billing cycle. Your data will be preserved.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              className={actionType === 'upgrade' ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-600 hover:bg-orange-700'}
              onClick={handleConfirmAction}
            >
              Confirm {actionType === 'upgrade' ? 'Upgrade' : 'Downgrade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Help Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Need Help Choosing?</h3>
            <p className="text-muted-foreground">
              Our team can help you select the right plan for your needs and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule Consultation
              </Button>
              <Button variant="outline" className="gap-2">
                <Shield className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionUpgrade;
