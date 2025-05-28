import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Crown,
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Smartphone,
  Building2,
  Settings,
  Download,
  RefreshCw,
  Star,
  Zap,
} from 'lucide-react';

interface SubscriptionData {
  id: string;
  tier: 'motse' | 'thusang' | 'intla' | 'kgotla' | 'tlhaloso';
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  features: string[];
  usage: {
    current: number;
    limit: number;
    unit: string;
  };
}

interface BillingHistory {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  paymentMethod: string;
  invoiceUrl?: string;
}

const SubscriptionDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);

  // Demo data for subscription
  const demoSubscription: SubscriptionData = {
    id: 'sub_demo_123',
    tier: profile?.role === 'official' ? 'kgotla' : 'intla',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-01-31',
    nextBillingDate: '2024-02-01',
    amount: profile?.role === 'official' ? 750 : 500,
    currency: 'BWP',
    paymentMethod: profile?.role === 'official' ? 'Request.Finance' : 'Orange Money',
    features: profile?.role === 'official' 
      ? ['Ward Issue Management', 'Basic Analytics', 'Citizen Communication', 'Task Assignment']
      : ['Community Champion Badge', 'Featured Directory Listing', 'Local Pulse Reports', 'Community Offers'],
    usage: {
      current: 45,
      limit: 100,
      unit: 'issues managed'
    }
  };

  const demoBillingHistory: BillingHistory[] = [
    {
      id: 'inv_001',
      date: '2024-01-01',
      amount: demoSubscription.amount,
      status: 'paid',
      description: `${demoSubscription.tier.charAt(0).toUpperCase() + demoSubscription.tier.slice(1)} Subscription - January 2024`,
      paymentMethod: demoSubscription.paymentMethod,
      invoiceUrl: '#'
    },
    {
      id: 'inv_002',
      date: '2023-12-01',
      amount: demoSubscription.amount,
      status: 'paid',
      description: `${demoSubscription.tier.charAt(0).toUpperCase() + demoSubscription.tier.slice(1)} Subscription - December 2023`,
      paymentMethod: demoSubscription.paymentMethod,
      invoiceUrl: '#'
    },
    {
      id: 'inv_003',
      date: '2023-11-01',
      amount: demoSubscription.amount,
      status: 'paid',
      description: `${demoSubscription.tier.charAt(0).toUpperCase() + demoSubscription.tier.slice(1)} Subscription - November 2023`,
      paymentMethod: demoSubscription.paymentMethod,
      invoiceUrl: '#'
    }
  ];

  useEffect(() => {
    const loadSubscriptionData = async () => {
      setIsLoading(true);
      
      if (isDemoMode) {
        // Use demo data
        setSubscription(demoSubscription);
        setBillingHistory(demoBillingHistory);
      } else {
        // TODO: Load real subscription data from API
        // For now, simulate loading
        setTimeout(() => {
          setSubscription(null); // No active subscription
          setBillingHistory([]);
        }, 1000);
      }
      
      setIsLoading(false);
    };

    loadSubscriptionData();
  }, [isDemoMode, profile?.role]);

  const getTierInfo = (tier: string) => {
    const tierMap = {
      motse: { name: 'Motse Platform', color: 'bg-green-100 text-green-800', icon: Crown },
      thusang: { name: 'Thusang Projects', color: 'bg-blue-100 text-blue-800', icon: Star },
      intla: { name: 'Intla Business', color: 'bg-purple-100 text-purple-800', icon: Building2 },
      kgotla: { name: 'Kgotla+ Governance', color: 'bg-blue-100 text-blue-800', icon: Crown },
      tlhaloso: { name: 'Tlhaloso Intelligence', color: 'bg-orange-100 text-orange-800', icon: Zap }
    };
    return tierMap[tier] || tierMap.motse;
  };

  const getStatusColor = (status: string) => {
    const statusMap = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return statusMap[status] || statusMap.active;
  };

  const getPaymentMethodIcon = (method: string) => {
    if (method.includes('Orange') || method.includes('Mobile')) return Smartphone;
    if (method.includes('Request.Finance')) return CreditCard;
    return CreditCard;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto mobile-padding section-spacing">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
              <p className="text-muted-foreground">Loading subscription data...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto mobile-padding section-spacing">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
              <p className="text-muted-foreground">
                Manage your Mmogo Impact Ecosystem subscription and billing
              </p>
            </div>
            {subscription && (
              <Button variant="outline" className="gap-2">
                <Settings className="w-4 h-4" />
                Subscription Settings
              </Button>
            )}
          </div>

          {/* Current Subscription Overview */}
          {subscription ? (
            <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(getTierInfo(subscription.tier).icon, { 
                      className: "w-8 h-8 text-blue-600" 
                    })}
                    <div>
                      <CardTitle className="text-xl">
                        {getTierInfo(subscription.tier).name}
                      </CardTitle>
                      <CardDescription>
                        Active subscription • Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      BWP {subscription.amount}
                    </div>
                    <p className="text-sm text-muted-foreground">per month</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(subscription.status)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {React.createElement(getPaymentMethodIcon(subscription.paymentMethod), { 
                      className: "w-3 h-3" 
                    })}
                    {subscription.paymentMethod}
                  </Badge>
                </div>

                {/* Usage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage this month</span>
                    <span>{subscription.usage.current} / {subscription.usage.limit} {subscription.usage.unit}</span>
                  </div>
                  <Progress 
                    value={(subscription.usage.current / subscription.usage.limit) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-dashed border-gray-300">
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6">
                  You're currently using the free Motse Platform. Upgrade to unlock premium features.
                </p>
                <Button onClick={() => window.location.href = '/pricing'}>
                  View Subscription Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Tabs for detailed management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
            <TabsTrigger value="payment">Payment Methods</TabsTrigger>
            <TabsTrigger value="upgrade">Upgrade/Downgrade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {subscription && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subscription Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Subscription Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan</span>
                        <span className="font-medium">{getTierInfo(subscription.tier).name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Period</span>
                        <span className="font-medium">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Billing</span>
                        <span className="font-medium">{new Date(subscription.nextBillingDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5" />
                      Included Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {subscription.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Billing History
                </CardTitle>
                <CardDescription>
                  View and download your past invoices and payment records
                </CardDescription>
              </CardHeader>
              <CardContent>
                {billingHistory.length > 0 ? (
                  <div className="space-y-4">
                    {billingHistory.map((bill) => (
                      <div key={bill.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{bill.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.date).toLocaleDateString()} • {bill.paymentMethod}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">BWP {bill.amount}</p>
                            <Badge className={bill.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </Badge>
                          </div>
                          {bill.invoiceUrl && (
                            <Button variant="outline" size="sm" className="gap-2">
                              <Download className="w-4 h-4" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No billing history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Payment method management coming soon</p>
                  <p className="text-sm text-muted-foreground">
                    Contact support to update your payment method: +267 72977535
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upgrade" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Upgrade or Downgrade
                </CardTitle>
                <CardDescription>
                  Change your subscription plan to better fit your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Plan changes coming soon</p>
                  <Button onClick={() => window.location.href = '/pricing'}>
                    View All Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SubscriptionDashboard;
