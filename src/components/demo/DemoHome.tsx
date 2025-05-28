import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import StatCards from '@/components/dashboard/StatCards';
import IssueGrid from '@/components/issues/IssueGrid';
import IssueDetailDialog from '@/components/issues/IssueDetailDialog';
import LatestUpdates from '@/components/issues/LatestUpdates';
import CreateIssueDialog from '@/components/issues/CreateIssueDialog';
import { DemoBanner } from './DemoBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Users,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Target,
  Activity,
  Crown,
  Building2,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Issue } from '@/components/issues/IssueGrid';

const DemoHome: React.FC = () => {
  const { isDemoMode, getDemoIssues, getDemoStats, demoUser } = useDemoMode();
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [showBusinessModel, setShowBusinessModel] = useState(true);

  const demoIssues = getDemoIssues();
  const demoStats = getDemoStats();

  // Show feature tour on first visit
  useEffect(() => {
    if (isDemoMode) {
      const hasSeenTour = localStorage.getItem('demo-tour-seen');
      if (!hasSeenTour) {
        setShowFeatureTour(true);
        localStorage.setItem('demo-tour-seen', 'true');
      }
    }
  }, [isDemoMode]);

  const handleSearch = (term: string) => {
    console.log('Demo search:', term);
  };

  const handleFilterChange = (filters: any) => {
    console.log('Demo filters:', filters);
  };

  const handleCreateIssue = (data: any) => {
    console.log('Demo issue creation:', data);
    setIsCreateDialogOpen(false);
  };

  // Feature highlights for demo
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Citizen Engagement',
      description: 'Citizens can report issues, vote, and track progress',
      stats: `${demoStats.totalUsers.toLocaleString()} active users`,
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Real-time Communication',
      description: 'Direct communication between citizens and government',
      stats: `${demoStats.totalComments.toLocaleString()} comments posted`,
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: 'Issue Resolution',
      description: 'Track issues from report to resolution',
      stats: `${demoStats.resolvedIssues} issues resolved`,
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Data-Driven Insights',
      description: 'Analytics help prioritize community needs',
      stats: '18 government departments',
    },
  ];

  return (
    <>
      <DemoBanner />
      <MainLayout
        onCreateIssue={() => setIsCreateDialogOpen(true)}
        onSearch={handleSearch}
      >
        <div className="max-w-[1800px] mx-auto section-spacing mobile-padding">
          {/* Demo Welcome Section */}
          {showFeatureTour && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Lightbulb className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-blue-900 dark:text-blue-100">
                          Welcome to the Botswana Civic Portal Demo
                        </CardTitle>
                        <p className="text-blue-700 dark:text-blue-300 mt-1">
                          Explore how citizens and government collaborate to
                          solve community issues
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeatureTour(false)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-blue-600 dark:text-blue-400">
                            {feature.icon}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {feature.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {feature.description}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {feature.stats}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Target className="h-4 w-4 mr-2" />
                      Explore Issues
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Try Creating an Issue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Mmogo Impact Ecosystem Showcase */}
          {showBusinessModel && (
            <motion.section
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-full"
            >
              <Card className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                        <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-green-900 dark:text-green-100">
                          Mmogo Impact Ecosystem Demo
                        </CardTitle>
                        <p className="text-green-700 dark:text-green-300 mt-1">
                          Experience our 4-tier business model in action
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBusinessModel(false)}
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Motse Platform */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-100 dark:border-green-800"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Motse Platform
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Free for all citizens - the foundation of our village
                      </p>
                      <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700">
                        FREE Forever
                      </Badge>
                    </motion.div>

                    {/* Thusang Projects */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Thusang Projects
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Community crowdfunding with transparent impact
                      </p>
                      <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                        5-7% Project Fee
                      </Badge>
                    </motion.div>

                    {/* Tirisano Business */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-purple-100 dark:border-purple-800"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Tirisano Business
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Business partnerships with community impact
                      </p>
                      <Badge className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-700">
                        BWP 200-1500+/mo
                      </Badge>
                    </motion.div>

                    {/* Kgotla+ Governance */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-yellow-100 dark:border-yellow-800"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          Kgotla+ Governance
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        Government solutions for efficient civic management
                      </p>
                      <Badge className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700">
                        BWP 750-6500/mo
                      </Badge>
                    </motion.div>
                  </div>
                  <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                    <Button
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 w-full sm:w-auto"
                      onClick={() => navigate('/pricing')}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Explore Full Business Model
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => navigate('/demo/stakeholder')}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Try Stakeholder Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => navigate('/demo/mmogo-ecosystem')}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Interactive Demo Tour
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Demo Stats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <StatCards demoData={demoStats} />
          </motion.section>

          {/* Latest Updates - Mobile (appears before Issues Grid) */}
          <section className="lg:hidden">
            <div className="mb-6 sm:mb-8">
              <LatestUpdates
                onIssueClick={(issueId) => {
                  const issue = demoIssues.find((i) => i.id === issueId);
                  if (issue) {
                    setSelectedIssue(issue);
                  }
                }}
              />
            </div>
          </section>

          {/* Main Content Layout */}
          <section className="w-full">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
              {/* Issues Grid - Main Content */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 min-w-0"
              >
                <IssueGrid
                  issues={demoIssues}
                  onFilterChange={handleFilterChange}
                  onSearch={handleSearch}
                  onIssueClick={(issue) => setSelectedIssue(issue)}
                  enablePagination={true}
                  initialPageSize={20}
                />
              </motion.div>

              {/* Latest Updates Sidebar - Desktop */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="w-full lg:w-[400px] xl:w-[420px] hidden lg:block"
              >
                <div className="sticky top-[100px]">
                  <LatestUpdates
                    onIssueClick={(issueId) => {
                      const issue = demoIssues.find((i) => i.id === issueId);
                      if (issue) {
                        setSelectedIssue(issue);
                      }
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </section>
        </div>

        {/* Dialogs */}
        <CreateIssueDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateIssue}
        />

        {selectedIssue && (
          <IssueDetailDialog
            open={true}
            onOpenChange={() => setSelectedIssue(null)}
            issue={selectedIssue}
          />
        )}
      </MainLayout>
    </>
  );
};

export default DemoHome;
