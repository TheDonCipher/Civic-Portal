import React, { useState, useEffect } from "react";
import { getOverallStats } from "@/lib/api/statsApi";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageSquare,
  Banknote,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatCardsProps {
  stats?: {
    totalIssues: number;
    resolutionRate: number;
    avgResponseTime: string;
    engagementStats: {
      votesPerIssue: number;
      commentsPerIssue: number;
      trendingIssues: Array<{
        title: string;
        category: string;
        engagement: number;
        constituency: string;
      }>;
    };
    fundingStats: {
      totalRaised: number;
      targetAmount: number;
      recentDonations: Array<{
        amount: number;
        project: string;
        date: string;
        provider: {
          name: string;
          avatar: string;
        };
      }>;
    };
    constituencyRankings: Array<{
      name: string;
      issues: number;
      resolved: number;
    }>;
  };
}

const StatCards = ({ stats }: StatCardsProps) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalIssues: 0,
    resolutionRate: 0,
    avgResponseTime: "0 days",
    constituencyRankings: [],
    engagementStats: {
      votesPerIssue: 0,
      commentsPerIssue: 0,
      trendingIssues: [],
    },
    fundingStats: {
      totalRaised: 0,
      targetAmount: 0,
      recentDonations: [],
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getOverallStats();
        console.log("Fetched stats data:", data);
        setStatsData(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // If stats are provided as props, use those instead (useful for testing/storybook)
  const displayStats = stats || statsData;
  return (
    <TooltipProvider>
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-full lg:col-span-8 h-[300px] animate-pulse bg-muted rounded-lg"></div>
          <div className="col-span-full lg:col-span-4 h-[300px] animate-pulse bg-muted rounded-lg"></div>
          <div className="col-span-full lg:col-span-6 h-[300px] animate-pulse bg-muted rounded-lg"></div>
          <div className="col-span-full lg:col-span-6 h-[300px] animate-pulse bg-muted rounded-lg"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Key Issue Overview */}
          <Card className="col-span-full lg:col-span-8 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-background to-secondary/20">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Key Issue Overview</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overview of current civic issues and their status</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-primary/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Issues</span>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {displayStats.totalIssues}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    +12% from last month
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-primary/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Resolution Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {displayStats.resolutionRate}%
                  </p>
                  <Progress
                    value={displayStats.resolutionRate}
                    className="h-2"
                  />
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg bg-primary/5 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Avg Response Time
                    </span>
                    <Clock className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold">
                    {displayStats.avgResponseTime}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    -0.5 days vs last month
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* Constituency Rankings */}
          <Card className="col-span-full lg:col-span-4 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Top Constituencies by Issues
                </h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rankings based on issue resolution rates</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ScrollArea className="h-[180px]">
                <div className="space-y-2">
                  {displayStats.constituencyRankings.map((constituency, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {constituency.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {constituency.resolved} resolved
                          </Badge>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        {constituency.issues} issues
                      </span>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Engagement Highlights */}
          <Card className="col-span-full lg:col-span-6 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Trending Issues</h3>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Comments/Issue</span>
                  </div>
                  <span className="font-semibold">
                    {displayStats.engagementStats.commentsPerIssue}
                  </span>
                </div>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-2">
                    {displayStats.engagementStats.trendingIssues.map(
                      (issue, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "hsl(var(--muted))",
                          }}
                          className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-medium truncate">
                              {issue.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {issue.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {issue.constituency}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-blue-500">
                            +{issue.engagement}%
                          </span>
                        </motion.div>
                      ),
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Crowdfunding Success */}
          <Card className="col-span-full lg:col-span-6 hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Crowdfunding Progress</h3>
                <Banknote className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Total Raised</span>
                    <span className="font-semibold text-green-500">
                      {displayStats.fundingStats.totalRaised.toLocaleString()}{" "}
                      BWP
                    </span>
                  </div>
                  <Progress
                    value={
                      (displayStats.fundingStats.totalRaised /
                        displayStats.fundingStats.targetAmount) *
                      100
                    }
                    className="h-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Target:{" "}
                    {displayStats.fundingStats.targetAmount.toLocaleString()}{" "}
                    BWP
                  </p>
                </div>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {displayStats.fundingStats.recentDonations.map(
                      (donation, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: "hsl(var(--muted))",
                          }}
                          className="flex items-center justify-between p-3 rounded-lg bg-primary/5"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={donation.provider.avatar} />
                              <AvatarFallback>
                                {donation.provider.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm font-medium truncate">
                                {donation.project}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {donation.provider.name}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  • {donation.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-green-500 shrink-0">
                            +{donation.amount.toLocaleString()} BWP
                          </span>
                        </motion.div>
                      ),
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </TooltipProvider>
  );
};

export default StatCards;
