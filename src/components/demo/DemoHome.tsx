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
} from 'lucide-react';
import type { Issue } from '@/components/issues/IssueGrid';

const DemoHome: React.FC = () => {
  const { isDemoMode, getDemoIssues, getDemoStats, demoUser } = useDemoMode();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);

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
        <div className="max-w-[1800px] mx-auto space-y-6 sm:space-y-8 mobile-padding">
          {/* Demo Welcome Section */}
          {showFeatureTour && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lightbulb className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-blue-900">
                          Welcome to the Botswana Civic Portal Demo
                        </CardTitle>
                        <p className="text-blue-700 mt-1">
                          Explore how citizens and government collaborate to
                          solve community issues
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeatureTour(false)}
                      className="text-blue-600 hover:text-blue-800"
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
                        className="p-4 bg-white rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-blue-600">{feature.icon}</div>
                          <h3 className="font-semibold text-gray-900">
                            {feature.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
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
            </motion.div>
          )}

          {/* Demo Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatCards demoData={demoStats} />
          </motion.div>

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-8">
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

          {/* Latest Updates - Mobile */}
          <div className="lg:hidden">
            <LatestUpdates
              onIssueClick={(issueId) => {
                const issue = demoIssues.find((i) => i.id === issueId);
                if (issue) {
                  setSelectedIssue(issue);
                }
              }}
            />
          </div>
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
