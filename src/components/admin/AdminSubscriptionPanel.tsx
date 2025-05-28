import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  BarChart3,
  PieChart,
  RefreshCw,
} from 'lucide-react';

interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'citizen' | 'official' | 'admin';
  tier: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  lastPayment: string;
  paymentMethod: string;
  autoRenew: boolean;
}

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurring: number;
  averageRevenuePerUser: number;
  churnRate: number;
  growthRate: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
}

const AdminSubscriptionPanel: React.FC = () => {
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);

  // Demo data for admin panel
  const demoSubscriptions: UserSubscription[] = [
    {
      id: 'sub_001',
      userId: 'user_001',
      userName: 'Thabo Mogale',
      userEmail: 'thabo.mogale@email.com',
      userRole: 'citizen',
      tier: 'intla_champion',
      status: 'active',
      amount: 500,
      currency: 'BWP',
      billingCycle: 'monthly',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      lastPayment: '2024-01-01',
      paymentMethod: 'Orange Money',
      autoRenew: true,
    },
    {
      id: 'sub_002',
      userId: 'user_002',
      userName: 'Kefilwe Seretse',
      userEmail: 'kefilwe.seretse@gov.bw',
      userRole: 'official',
      tier: 'kgotla_ward',
      status: 'active',
      amount: 750,
      currency: 'BWP',
      billingCycle: 'monthly',
      startDate: '2023-12-01',
      endDate: '2024-11-30',
      lastPayment: '2024-01-01',
      paymentMethod: 'Request.Finance',
      autoRenew: true,
    },
    {
      id: 'sub_003',
      userId: 'user_003',
      userName: 'Mpho Kgosana',
      userEmail: 'mpho.kgosana@business.co.bw',
      userRole: 'citizen',
      tier: 'intla_corporate',
      status: 'active',
      amount: 1500,
      currency: 'BWP',
      billingCycle: 'monthly',
      startDate: '2024-01-15',
      endDate: '2025-01-14',
      lastPayment: '2024-01-15',
      paymentMethod: 'Request.Finance',
      autoRenew: true,
    },
    {
      id: 'sub_004',
      userId: 'user_004',
      userName: 'Lesego Mothibi',
      userEmail: 'lesego.mothibi@council.gov.bw',
      userRole: 'official',
      tier: 'kgotla_district',
      status: 'pending',
      amount: 2800,
      currency: 'BWP',
      billingCycle: 'quarterly',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      lastPayment: '2023-12-15',
      paymentMethod: 'Bank Transfer',
      autoRenew: true,
    },
    {
      id: 'sub_005',
      userId: 'user_005',
      userName: 'Boitumelo Phiri',
      userEmail: 'boitumelo.phiri@research.org',
      userRole: 'citizen',
      tier: 'tlhaloso_reports',
      status: 'active',
      amount: 1000,
      currency: 'BWP',
      billingCycle: 'per report',
      startDate: '2024-01-10',
      endDate: '2024-12-31',
      lastPayment: '2024-01-10',
      paymentMethod: 'Request.Finance',
      autoRenew: false,
    },
  ];

  const demoMetrics: RevenueMetrics = {
    totalRevenue: 156750,
    monthlyRecurring: 12450,
    averageRevenuePerUser: 1245,
    churnRate: 3.2,
    growthRate: 15.8,
    totalSubscriptions: 126,
    activeSubscriptions: 98,
    pendingSubscriptions: 8,
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      if (isDemoMode) {
        // Simulate loading delay
        setTimeout(() => {
          setSubscriptions(demoSubscriptions);
          setMetrics(demoMetrics);
          setIsLoading(false);
        }, 1000);
      } else {
        // TODO: Load real data from API
        setSubscriptions([]);
        setMetrics(null);
        setIsLoading(false);
      }
    };

    loadData();
  }, [isDemoMode]);

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.tier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesTier = tierFilter === 'all' || sub.tier === tierFilter;
    
    return matchesSearch && matchesStatus && matchesTier;
  });

  const getStatusColor = (status: string) => {
    const statusMap = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };
    return statusMap[status] || statusMap.active;
  };

  const getTierDisplayName = (tier: string) => {
    const tierMap = {
      'intla_supporter': 'Intla Supporter',
      'intla_champion': 'Intla Champion',
      'intla_corporate': 'Intla Corporate',
      'kgotla_ward': 'Kgotla+ Ward',
      'kgotla_district': 'Kgotla+ District',
      'kgotla_national': 'Kgotla+ National',
      'tlhaloso_reports': 'Tlhaloso Reports',
      'tlhaloso_api': 'Tlhaloso API',
    };
    return tierMap[tier] || tier;
  };

  const handleSubscriptionAction = (subscriptionId: string, action: 'view' | 'edit' | 'cancel') => {
    const subscription = subscriptions.find(sub => sub.id === subscriptionId);
    if (subscription) {
      setSelectedSubscription(subscription);
      // TODO: Implement action handlers
      console.log(`${action} subscription:`, subscription);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-muted-foreground">Loading subscription data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Management</h2>
          <p className="text-muted-foreground">
            Monitor and manage all user subscriptions across the Mmogo Impact Ecosystem
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">BWP {metrics.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                +{metrics.growthRate}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Recurring</p>
                  <p className="text-2xl font-bold">BWP {metrics.monthlyRecurring.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Avg BWP {metrics.averageRevenuePerUser} per user
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
                  <p className="text-2xl font-bold">{metrics.activeSubscriptions}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.pendingSubscriptions} pending approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                  <p className="text-2xl font-bold">{metrics.churnRate}%</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Below industry average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Subscriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name, email, or tier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="intla_supporter">Intla Supporter</SelectItem>
                    <SelectItem value="intla_champion">Intla Champion</SelectItem>
                    <SelectItem value="intla_corporate">Intla Corporate</SelectItem>
                    <SelectItem value="kgotla_ward">Kgotla+ Ward</SelectItem>
                    <SelectItem value="kgotla_district">Kgotla+ District</SelectItem>
                    <SelectItem value="kgotla_national">Kgotla+ National</SelectItem>
                    <SelectItem value="tlhaloso_reports">Tlhaloso Reports</SelectItem>
                    <SelectItem value="tlhaloso_api">Tlhaloso API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>User Subscriptions</CardTitle>
              <CardDescription>
                Manage all user subscriptions and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing</TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{subscription.userName}</p>
                          <p className="text-sm text-muted-foreground">{subscription.userEmail}</p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {subscription.userRole}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTierDisplayName(subscription.tier)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(subscription.status)}>
                          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">BWP {subscription.amount}</p>
                          <p className="text-sm text-muted-foreground">{subscription.billingCycle}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{subscription.paymentMethod}</p>
                          <p className="text-xs text-muted-foreground">
                            {subscription.autoRenew ? 'Auto-renew' : 'Manual'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{new Date(subscription.lastPayment).toLocaleDateString()}</p>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSubscriptionAction(subscription.id, 'view')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSubscriptionAction(subscription.id, 'edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>
                Detailed analytics and insights about subscription revenue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Advanced analytics dashboard coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Revenue trends, user acquisition metrics, and churn analysis
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing Management
              </CardTitle>
              <CardDescription>
                Manage billing cycles, invoices, and payment processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Billing management tools coming soon</p>
                <p className="text-sm text-muted-foreground">
                  Invoice generation, payment tracking, and billing cycle management
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSubscriptionPanel;
