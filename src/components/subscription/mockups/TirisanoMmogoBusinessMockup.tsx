import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  Star,
  MapPin,
  TrendingUp,
  Users,
  Heart,
  Award,
  Target,
  BarChart3,
  Calendar,
  Phone,
  Mail,
  Globe,
  Camera,
  FileText,
  Download,
  Share2,
  Crown,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react';

/**
 * Tirisano Mmogo Business & Enterprise Solutions Mockup
 *
 * This mockup demonstrates the "Tirisano Mmogo" (Working Together) partnership interface
 * for Local SMEs, corporations, and NGOs (BWP 200-1500+/month tiers).
 *
 * Features:
 * - Business sponsor displays and recognition
 * - Community impact metrics
 * - Local insights and reports
 * - CSR project co-creation
 * - Hyperlocal marketing opportunities
 * - API access for data integration
 */

interface BusinessProfile {
  id: string;
  name: string;
  logo: string;
  tier: 'supporter' | 'champion' | 'impact_partner';
  industry: string;
  location: string;
  memberSince: string;
  sponsoredProjects: number;
  communityImpact: number;
  rating: number;
  description: string;
  website: string;
  phone: string;
  email: string;
}

interface LocalInsight {
  id: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  radius: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }>;
}

const mockBusinessProfile: BusinessProfile = {
  id: 'business-001',
  name: 'Botswana Builders Supply',
  logo: '/api/placeholder/80/80',
  tier: 'champion',
  industry: 'Construction & Hardware',
  location: 'Gaborone, Block 6',
  memberSince: '2023-08-15',
  sponsoredProjects: 8,
  communityImpact: 95,
  rating: 4.8,
  description:
    'Leading supplier of construction materials and hardware in Gaborone, committed to building stronger communities.',
  website: 'www.botswanabuilders.co.bw',
  phone: '+267 123 4567',
  email: 'community@botswanabuilders.co.bw',
};

const mockLocalInsights: LocalInsight[] = [
  {
    id: 'insight-001',
    title: 'Infrastructure Needs Assessment',
    category: 'Infrastructure',
    summary:
      'Analysis of reported infrastructure issues within 5km radius of your business location.',
    date: '2024-01-15',
    radius: '5km',
    keyMetrics: [
      { label: 'Road Issues', value: '23', trend: 'up' },
      { label: 'Water Problems', value: '12', trend: 'down' },
      { label: 'Electrical Issues', value: '8', trend: 'stable' },
    ],
  },
  {
    id: 'insight-002',
    title: 'Community Sentiment Report',
    category: 'Community',
    summary:
      'Monthly analysis of community satisfaction and engagement trends in your service area.',
    date: '2024-01-01',
    radius: '10km',
    keyMetrics: [
      { label: 'Satisfaction Score', value: '87%', trend: 'up' },
      { label: 'Active Citizens', value: '1,245', trend: 'up' },
      { label: 'Issue Resolution', value: '78%', trend: 'stable' },
    ],
  },
];

const TirisanoMmogoBusinessMockup: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('profile');

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'supporter':
        return {
          name: 'Community Supporter',
          price: 'BWP 200/month',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: Heart,
        };
      case 'champion':
        return {
          name: 'Community Champion',
          price: 'BWP 500/month',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Award,
        };
      case 'impact_partner':
        return {
          name: 'Corporate Impact Partner',
          price: 'BWP 1,500+/month',
          color: 'bg-purple-100 text-purple-700 border-purple-200',
          icon: Crown,
        };
      default:
        return {
          name: 'Community Supporter',
          price: 'BWP 200/month',
          color: 'bg-green-100 text-green-700 border-green-200',
          icon: Heart,
        };
    }
  };

  const tierInfo = getTierInfo(mockBusinessProfile.tier);
  const TierIcon = tierInfo.icon;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge
          variant="outline"
          className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
        >
          Tirisano Mmogo Business & Enterprise Solutions
        </Badge>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Business Partnership Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Empowering businesses to make meaningful community impact • Re thusa
          dikgwebo go dira pharologanyo
        </p>
      </div>

      {/* Business Profile Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={mockBusinessProfile.logo} />
                <AvatarFallback className="bg-white text-blue-600 text-lg font-bold">
                  {mockBusinessProfile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {mockBusinessProfile.name}
                </h2>
                <p className="text-blue-100 dark:text-blue-200">
                  {mockBusinessProfile.industry}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {mockBusinessProfile.location}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge className={tierInfo.color}>
                <TierIcon className="h-4 w-4 mr-1" />
                {tierInfo.name}
              </Badge>
              <p className="text-sm text-blue-100 dark:text-blue-200 mt-1">
                {tierInfo.price}
              </p>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {mockBusinessProfile.sponsoredProjects}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Projects Sponsored
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {mockBusinessProfile.communityImpact}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Community Impact Score
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-2xl font-bold dark:text-white">
                  {mockBusinessProfile.rating}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Community Rating
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Math.floor(
                  (Date.now() -
                    new Date(mockBusinessProfile.memberSince).getTime()) /
                    (1000 * 60 * 60 * 24 * 30)
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Months Active
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Business Profile</TabsTrigger>
          <TabsTrigger value="sponsorship">Sponsorship</TabsTrigger>
          <TabsTrigger value="insights">Local Insights</TabsTrigger>
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Description
                  </label>
                  <p className="text-sm mt-1 text-gray-900 dark:text-gray-100">
                    {mockBusinessProfile.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Website
                    </label>
                    <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                      {mockBusinessProfile.website}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Phone
                    </label>
                    <p className="text-sm mt-1 text-gray-900 dark:text-gray-100">
                      {mockBusinessProfile.phone}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Community Email
                  </label>
                  <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                    {mockBusinessProfile.email}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tier Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tierInfo.name === 'Community Champion' && (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm dark:text-gray-300">
                          Enhanced business directory listing
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm dark:text-gray-300">
                          Logo on resolved community issues
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm dark:text-gray-300">
                          Monthly Local Pulse Reports
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm dark:text-gray-300">
                          Community offers & promotions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <span className="text-sm dark:text-gray-300">
                          Issue alerts near business premises
                        </span>
                      </div>
                    </>
                  )}
                  <Button variant="outline" className="w-full mt-4">
                    Upgrade Tier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TirisanoMmogoBusinessMockup;
