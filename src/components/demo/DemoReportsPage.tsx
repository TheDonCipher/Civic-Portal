import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import { DemoBanner } from './DemoBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  Target,
  Award,
} from 'lucide-react';

const DemoReportsPage: React.FC = () => {
  const { getDemoStats } = useDemoMode();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const demoStats = getDemoStats();

  const StatCard = ({ title, value, description, icon, trend, color = 'blue' }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <Badge variant={trend > 0 ? 'default' : 'secondary'} className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {trend > 0 ? '+' : ''}{trend}%
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
            {icon}
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${color}-400 to-${color}-600`} />
      </CardContent>
    </Card>
  );

  const DepartmentCard = ({ department, issues, resolved, responseTime }: any) => {
    const resolutionRate = Math.round((resolved / issues) * 100);
    
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">{department}</h4>
            <Badge variant="outline" className="text-xs">
              {issues} issues
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Resolution Rate</span>
              <span className="font-medium">{resolutionRate}%</span>
            </div>
            <Progress value={resolutionRate} className="h-2" />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Avg Response: {responseTime} days</span>
            <span>{resolved} resolved</span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <DemoBanner />
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">Platform Analytics</h1>
              <p className="text-muted-foreground">
                Comprehensive insights into civic engagement and government responsiveness
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* Period Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2"
          >
            {[
              { key: '1month', label: 'Last Month' },
              { key: '3months', label: 'Last 3 Months' },
              { key: '6months', label: 'Last 6 Months' },
              { key: '1year', label: 'Last Year' },
            ].map((period) => (
              <Button
                key={period.key}
                variant={selectedPeriod === period.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period.key)}
              >
                {period.label}
              </Button>
            ))}
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="geography">Geography</TabsTrigger>
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              >
                <StatCard
                  title="Total Issues"
                  value={demoStats.totalIssues.toLocaleString()}
                  description="All time submissions"
                  icon={<AlertCircle className="h-5 w-5" />}
                  trend={12}
                  color="blue"
                />
                <StatCard
                  title="Resolution Rate"
                  value={`${Math.round((demoStats.resolvedIssues / demoStats.totalIssues) * 100)}%`}
                  description="Issues successfully resolved"
                  icon={<CheckCircle className="h-5 w-5" />}
                  trend={8}
                  color="green"
                />
                <StatCard
                  title="Active Users"
                  value={demoStats.activeUsers.toLocaleString()}
                  description="Engaged citizens"
                  icon={<Users className="h-5 w-5" />}
                  trend={15}
                  color="purple"
                />
                <StatCard
                  title="Avg Response Time"
                  value="8 days"
                  description="Government response time"
                  icon={<Clock className="h-5 w-5" />}
                  trend={-12}
                  color="orange"
                />
              </motion.div>

              {/* Monthly Trends */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Issue Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demoStats.monthlyData.map((month: any, index: number) => (
                        <div key={month.month} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{month.month}</span>
                            <span className="font-medium">
                              {month.created} created, {month.resolved} resolved
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Progress value={(month.created / 250) * 100} className="h-2" />
                            <Progress value={(month.resolved / 250) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Top Performing Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {demoStats.topConstituencies.slice(0, 5).map((area: any, index: number) => (
                        <div key={area.name} className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{area.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {area.issues} issues, {area.engagement}% engagement
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {area.engagement}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="departments" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Department Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {demoStats.departmentStats.map((dept: any) => (
                        <DepartmentCard
                          key={dept.department}
                          department={dept.department}
                          issues={dept.issues}
                          resolved={dept.resolved}
                          responseTime={dept.responseTime}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="geography" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Issues by Constituency
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {demoStats.topConstituencies.map((area: any) => (
                        <div key={area.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{area.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {area.issues} total issues
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{area.engagement}%</p>
                            <p className="text-xs text-muted-foreground">engagement</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Interactive map visualization would be displayed here</p>
                      <p className="text-xs mt-1">Showing issue density across Botswana</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid gap-6 lg:grid-cols-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Engagement Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Total Comments</span>
                        <span className="font-bold">{demoStats.totalComments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Total Solutions</span>
                        <span className="font-bold">{demoStats.totalSolutions}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>Average Votes per Issue</span>
                        <span className="font-bold">15</span>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-lg">
                        <span>User Retention Rate</span>
                        <span className="font-bold">78%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: 'Thabo Mogale', contributions: 45, type: 'Issues Created' },
                        { name: 'Kefilwe Seretse', contributions: 38, type: 'Solutions Proposed' },
                        { name: 'Mpho Kgositsile', contributions: 67, type: 'Comments Posted' },
                        { name: 'Naledi Mmusi', contributions: 29, type: 'Issues Resolved' },
                      ].map((contributor, index) => (
                        <div key={contributor.name} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{contributor.name}</p>
                            <p className="text-sm text-muted-foreground">{contributor.type}</p>
                          </div>
                          <Badge variant="secondary">
                            {contributor.contributions}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
};

export default DemoReportsPage;
