import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  BarChart3,
  Users,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  Settings,
  Download,
  Filter,
  Search,
  Bell,
  Crown,
  Building2,
  Target,
  Zap,
  FileText,
  Send,
} from 'lucide-react';

/**
 * Kgotla+ Local Governance Solutions Dashboard Mockup
 *
 * This mockup demonstrates the "Kgotla+" subscription interface for Ward Councilors,
 * District Councils, and government entities (BWP 750-6500/month tiers).
 *
 * Features:
 * - Ward-specific issue management
 * - Performance analytics and metrics
 * - Direct citizen communication tools
 * - Task assignment and tracking
 * - USSD interface integration
 * - Setswana/English translation options
 */

interface WardStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
  citizenSatisfaction: number;
  activeProjects: number;
  budgetUtilization: number;
}

interface WardIssue {
  id: string;
  title: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'high' | 'medium' | 'low';
  reportedDate: string;
  location: string;
  reportedBy: string;
  assignedTo?: string;
  estimatedCost?: number;
  votes: number;
  comments: number;
}

const mockWardStats: WardStats = {
  totalIssues: 156,
  openIssues: 23,
  inProgressIssues: 18,
  resolvedIssues: 115,
  avgResolutionTime: 12.5,
  citizenSatisfaction: 87,
  activeProjects: 5,
  budgetUtilization: 68,
};

const mockIssues: WardIssue[] = [
  {
    id: 'issue-001',
    title: 'Broken streetlight on Segoditshane Road',
    category: 'Infrastructure',
    status: 'in_progress',
    priority: 'high',
    reportedDate: '2024-01-15',
    location: 'Segoditshane Road, Block 7',
    reportedBy: 'Thabo Molefe',
    assignedTo: 'BPC Maintenance Team',
    estimatedCost: 2500,
    votes: 15,
    comments: 8,
  },
  {
    id: 'issue-002',
    title: 'Water shortage in Extension 12',
    category: 'Water & Sanitation',
    status: 'open',
    priority: 'high',
    reportedDate: '2024-01-14',
    location: 'Extension 12',
    reportedBy: 'Keabetswe Setlhare',
    votes: 32,
    comments: 12,
  },
  {
    id: 'issue-003',
    title: 'Pothole on Main Mall',
    category: 'Roads',
    status: 'resolved',
    priority: 'medium',
    reportedDate: '2024-01-10',
    location: 'Main Mall, near Game Store',
    reportedBy: 'Mpho Kgosana',
    assignedTo: 'Roads Department',
    estimatedCost: 1200,
    votes: 8,
    comments: 5,
  },
];

const KgotlaDashboardMockup: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedIssue, setSelectedIssue] = useState<WardIssue | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Crown className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Kgotla+ Ward Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Tlokweng Ward 3 • Kgosi Mmoloki Seretse
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
            Ward Essentials Plan • BWP 750/month
          </Badge>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Issues
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mockWardStats.totalIssues}
                  </p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Resolution Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(
                      (mockWardStats.resolvedIssues /
                        mockWardStats.totalIssues) *
                        100
                    )}
                    %
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg. Resolution
                  </p>
                  <p className="text-2xl font-bold dark:text-white">
                    {mockWardStats.avgResolutionTime} days
                  </p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Satisfaction
                  </p>
                  <p className="text-2xl font-bold dark:text-white">
                    {mockWardStats.citizenSatisfaction}%
                  </p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="issues">Issue Management</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Issues</span>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockIssues.slice(0, 3).map((issue) => (
                    <div
                      key={issue.id}
                      className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getPriorityColor(
                                issue.priority
                              )}`}
                            />
                            <h4 className="font-medium text-sm">
                              {issue.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {issue.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {issue.reportedDate}
                            </span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-16 flex-col">
                    <Send className="h-5 w-5 mb-1" />
                    <span className="text-xs">Send Alert</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <MessageSquare className="h-5 w-5 mb-1" />
                    <span className="text-xs">Bulk SMS</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <Download className="h-5 w-5 mb-1" />
                    <span className="text-xs">Export Report</span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <Phone className="h-5 w-5 mb-1" />
                    <span className="text-xs">USSD Panel</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Ward Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">
                    Interactive performance charts would appear here
                  </p>
                  <p className="text-sm text-gray-500">
                    Issue resolution trends, citizen satisfaction, budget
                    utilization
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Issue Management</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockIssues.map((issue) => (
                  <div
                    key={issue.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getPriorityColor(
                              issue.priority
                            )}`}
                          />
                          <h4 className="font-medium">{issue.title}</h4>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {issue.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {issue.reportedBy}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {issue.reportedDate}
                          </span>
                          {issue.estimatedCost && (
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              BWP {issue.estimatedCost.toLocaleString()}
                            </span>
                          )}
                        </div>
                        {issue.assignedTo && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Assigned to: </span>
                            <span className="font-medium">
                              {issue.assignedTo}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Citizen Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Ward Update (SMS/In-App)
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Emergency Alert System
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  USSD Interface
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Newsletter
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Translation Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <h4 className="font-medium mb-2">Setswana/English Support</h4>
                  <p className="text-sm text-gray-600">
                    Automatic translation for all citizen communications
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  Configure Language Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Issue Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { category: 'Infrastructure', count: 45, percentage: 29 },
                    {
                      category: 'Water & Sanitation',
                      count: 38,
                      percentage: 24,
                    },
                    { category: 'Roads', count: 32, percentage: 21 },
                    { category: 'Public Safety', count: 25, percentage: 16 },
                    { category: 'Other', count: 16, percentage: 10 },
                  ].map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resolution Times</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      12.5
                    </div>
                    <div className="text-sm text-gray-600">Average Days</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>&lt; 7 days</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>7-14 days</span>
                      <span className="font-medium">32%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>14-30 days</span>
                      <span className="font-medium">18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>&gt; 30 days</span>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Citizen Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">87%</div>
                    <div className="text-sm text-gray-600">
                      Satisfaction Rate
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Very Satisfied</span>
                      <span className="font-medium">52%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfied</span>
                      <span className="font-medium">35%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Neutral</span>
                      <span className="font-medium">8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dissatisfied</span>
                      <span className="font-medium">5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KgotlaDashboardMockup;
