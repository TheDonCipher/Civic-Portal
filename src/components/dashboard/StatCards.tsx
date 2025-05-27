import React, { useState, useEffect, memo } from 'react';
import { getOverallStats } from '@/lib/api/statsApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  TrendingUp,
} from 'lucide-react';

interface StatCardsProps {
  demoData?: any; // Demo data from DemoProvider
}

interface StatData {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  activeUsers: number;
  resolutionRate: number;
}

const StatCards = memo<StatCardsProps>(
  ({ demoData }) => {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState<StatData>({
      totalIssues: 0,
      openIssues: 0,
      inProgressIssues: 0,
      resolvedIssues: 0,
      activeUsers: 0,
      resolutionRate: 0,
    });

    useEffect(() => {
      // If demo data is provided, use it directly
      if (demoData) {
        setStatsData({
          totalIssues: demoData.totalIssues || 0,
          openIssues: demoData.openIssues || 0,
          inProgressIssues: demoData.inProgressIssues || 0,
          resolvedIssues: demoData.resolvedIssues || 0,
          activeUsers: demoData.activeUsers || 0,
          resolutionRate:
            demoData.resolvedIssues && demoData.totalIssues
              ? Math.round(
                  (demoData.resolvedIssues / demoData.totalIssues) * 100
                )
              : 0,
        });
        setLoading(false);
        return;
      }

      const fetchStats = async () => {
        try {
          setLoading(true);
          const data = await getOverallStats();

          setStatsData({
            totalIssues: data?.totalIssues || 0,
            openIssues: data?.openIssues || 0,
            inProgressIssues: data?.inProgressIssues || 0,
            resolvedIssues: data?.resolvedIssues || 0,
            activeUsers: data?.activeUsers || 0,
            resolutionRate: data?.resolutionRate || 0,
          });
        } catch (error) {
          console.error('Error fetching stats:', error);
          // Set default values on error
          setStatsData({
            totalIssues: 0,
            openIssues: 0,
            inProgressIssues: 0,
            resolvedIssues: 0,
            activeUsers: 0,
            resolutionRate: 0,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchStats();
    }, [demoData]);

    // Set up real-time subscriptions for stats updates (only when not using demo data)
    useEffect(() => {
      if (demoData) return; // Skip real-time updates for demo mode

      const subscription = supabase
        .channel('stats-realtime-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'issues',
          },
          (payload) => {
            console.log('Issue change detected in stats:', payload);
            // Refresh stats when issues change
            const fetchStats = async () => {
              try {
                const data = await getOverallStats();
                setStatsData({
                  totalIssues: data?.totalIssues || 0,
                  openIssues: data?.openIssues || 0,
                  inProgressIssues: data?.inProgressIssues || 0,
                  resolvedIssues: data?.resolvedIssues || 0,
                  activeUsers: data?.activeUsers || 0,
                  resolutionRate: data?.resolutionRate || 0,
                });
              } catch (error) {
                console.error('Error refreshing stats:', error);
              }
            };
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }, [demoData]);

    const statCards = [
      {
        title: 'Total Issues',
        value: statsData.totalIssues,
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        change: '+12%',
        changeType: 'increase' as const,
      },
      {
        title: 'Open Issues',
        value: statsData.openIssues,
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        change: '+5%',
        changeType: 'increase' as const,
      },
      {
        title: 'In Progress',
        value: statsData.inProgressIssues,
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        change: '+8%',
        changeType: 'increase' as const,
      },
      {
        title: 'Resolved',
        value: statsData.resolvedIssues,
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        change: '+15%',
        changeType: 'increase' as const,
      },
      {
        title: 'Active Users',
        value: statsData.activeUsers,
        icon: Users,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        change: '+3%',
        changeType: 'increase' as const,
      },
      {
        title: 'Resolution Rate',
        value: `${statsData.resolutionRate}%`,
        icon: TrendingUp,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        change: '+2%',
        changeType: 'increase' as const,
      },
    ];

    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse bg-muted rounded-xl"
            ></div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Card className="h-full border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground font-medium">
                        {stat.change}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {typeof stat.value === 'number'
                        ? stat.value.toLocaleString()
                        : stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo optimization
    return (
      JSON.stringify(prevProps.demoData) === JSON.stringify(nextProps.demoData)
    );
  }
);

StatCards.displayName = 'StatCards';

export default StatCards;
