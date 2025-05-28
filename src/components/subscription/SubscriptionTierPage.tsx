import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import PaymentMethodSelector from './PaymentMethodSelector';
import SubscriptionUpgrade from './SubscriptionUpgrade';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  Star,
  Building2,
  Lightbulb,
  Users,
  ArrowLeft,
  CheckCircle,
  Info,
  Zap,
  Shield,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface TierConfig {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  currency: string;
  billingCycle: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  benefits: string[];
  targetAudience: string[];
  popular?: boolean;
  enterprise?: boolean;
}

const SubscriptionTierPage: React.FC = () => {
  const { tier } = useParams<{ tier: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  // Tier configurations
  const tierConfigs: Record<string, TierConfig> = {
    intla: {
      id: 'intla',
      name: 'Intla Business Solutions',
      description: 'Comprehensive business community partnership',
      longDescription: 'Join the Intla Business Solutions ecosystem and become a recognized community partner. Gain visibility, engage with local customers, and contribute to community development while growing your business presence in Botswana.',
      price: 500,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      features: [
        'Community Champion Badge',
        'Featured Directory Listing',
        'Local Pulse Reports',
        'Community Offers Promotion',
        'Enhanced Logo Visibility',
        'Monthly Analytics Dashboard',
        'Customer Engagement Tools',
        'Event Promotion Platform',
      ],
      benefits: [
        'Increased local visibility and brand recognition',
        'Direct access to community customers',
        'Insights into local market trends and needs',
        'Opportunity to support community development',
        'Networking with other local businesses',
        'Enhanced corporate social responsibility profile',
      ],
      targetAudience: ['Small Businesses', 'Medium Enterprises', 'Service Providers', 'Local Shops'],
      popular: true,
    },
    kgotla: {
      id: 'kgotla',
      name: 'Kgotla+ Governance Solutions',
      description: 'Advanced governance and citizen engagement tools',
      longDescription: 'Empower your government office with Kgotla+ Governance Solutions. Streamline citizen communication, manage issues efficiently, and gain insights into community needs with our comprehensive governance platform.',
      price: 750,
      currency: 'BWP',
      billingCycle: 'per month',
      icon: Crown,
      color: 'bg-blue-100 text-blue-800',
      features: [
        'Secure Ward Dashboard',
        'Direct Citizen Communication',
        'Task Assignment and Tracking',
        'Advanced Analytics and Reporting',
        'USSD Interface for Alerts',
        'Multi-ward Coordination Tools',
        'Performance Benchmarking',
        'Custom Reporting Tools',
      ],
      benefits: [
        'Improved citizen satisfaction and engagement',
        'Streamlined issue resolution processes',
        'Data-driven decision making capabilities',
        'Enhanced transparency and accountability',
        'Efficient resource allocation',
        'Better coordination across departments',
      ],
      targetAudience: ['Ward Councilors', 'District Councils', 'Government Departments', 'Local Authorities'],
      enterprise: true,
    },
    tlhaloso: {
      id: 'tlhaloso',
      name: 'Tlhaloso Intelligence Services',
      description: 'Premium data insights and analytics platform',
      longDescription: 'Access comprehensive data intelligence with Tlhaloso Services. Get detailed insights, custom reports, and API access to aggregated civic data for research, planning, and strategic decision making.',
      price: 1000,
      currency: 'BWP',
      billingCycle: 'per report',
      icon: Lightbulb,
      color: 'bg-orange-100 text-orange-800',
      features: [
        'Thematic Intelligence Reports',
        'Sector-specific Analysis',
        'Anonymized Data Insights',
        'Custom Research Projects',
        'Academic Partnerships',
        'API Access to Datasets',
        'Real-time Data Feeds',
        'Developer Documentation',
      ],
      benefits: [
        'Evidence-based policy and planning decisions',
        'Understanding of community trends and needs',
        'Academic research and publication opportunities',
        'Competitive intelligence for businesses',
        'Grant application support data',
        'Urban planning and development insights',
      ],
      targetAudience: ['Researchers', 'Urban Planners', 'NGOs', 'Academic Institutions', 'Policy Makers'],
      enterprise: true,
    },
  };

  const currentTier = tier ? tierConfigs[tier] : null;

  if (!currentTier) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto mobile-padding section-spacing">
          <Card>
            <CardContent className="text-center py-12">
              <Info className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Subscription Tier Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The requested subscription tier could not be found.
              </p>
              <Button onClick={() => navigate('/pricing')}>
                View All Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const handleSubscribe = () => {
    setSelectedAmount(currentTier.price);
    setShowPaymentSelector(true);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    console.log('Selected payment method:', methodId);
    // TODO: Process subscription
  };

  const TierIcon = currentTier.icon;

  if (showPaymentSelector) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto mobile-padding section-spacing">
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => setShowPaymentSelector(false)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plan Details
            </Button>

            {/* Subscription Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <TierIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{currentTier.name}</h2>
                    <p className="text-muted-foreground mb-3">{currentTier.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-2xl font-bold text-blue-600">
                        {currentTier.currency} {currentTier.price}
                      </span>
                      <span className="text-muted-foreground">{currentTier.billingCycle}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              userRole={profile?.role || 'citizen'}
              subscriptionTier={currentTier.id}
              amount={selectedAmount}
              onMethodSelect={handlePaymentMethodSelect}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto mobile-padding section-spacing">
        {/* Header */}
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <Badge variant="outline" className={`px-4 py-2 text-sm font-medium ${currentTier.color}`}>
              <TierIcon className="w-4 h-4 mr-2" />
              {currentTier.name}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              {currentTier.name.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {currentTier.name.split(' ').slice(-1)}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {currentTier.longDescription}
            </p>
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {currentTier.currency} {currentTier.price}
              </div>
              <p className="text-muted-foreground">{currentTier.billingCycle}</p>
            </div>
            <Button size="lg" onClick={handleSubscribe} className="gap-2">
              <Zap className="w-5 h-5" />
              Subscribe Now
            </Button>
          </div>
        </div>

        {/* Features and Benefits */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-12">
          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Features Included
              </CardTitle>
              <CardDescription>
                Everything you get with your {currentTier.name} subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentTier.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-600" />
                Key Benefits
              </CardTitle>
              <CardDescription>
                How {currentTier.name} helps you achieve your goals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentTier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Target Audience */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Perfect For
            </CardTitle>
            <CardDescription>
              {currentTier.name} is designed specifically for these user types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {currentTier.targetAudience.map((audience, index) => (
                <Badge key={index} variant="outline" className="px-4 py-2">
                  {audience}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200">
          <CardContent className="text-center py-12">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <TierIcon className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to Get Started?</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  Join the Mmogo Impact Ecosystem and start making a difference today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" onClick={handleSubscribe} className="gap-2">
                    <Zap className="w-5 h-5" />
                    Subscribe to {currentTier.name}
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => navigate('/pricing')} className="gap-2">
                    <Calendar className="w-5 h-5" />
                    Compare All Plans
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="mt-12">
          <CardContent className="text-center py-8">
            <div className="space-y-4">
              <Shield className="w-12 h-12 text-blue-600 mx-auto" />
              <h3 className="text-lg font-semibold">Need Help or Have Questions?</h3>
              <p className="text-muted-foreground">
                Our team is here to help you choose the right plan and get set up successfully.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="gap-2">
                  <Info className="w-4 h-4" />
                  Contact Support: +267 72977535
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SubscriptionTierPage;
