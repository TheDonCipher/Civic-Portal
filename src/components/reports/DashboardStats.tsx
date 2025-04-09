import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getOverallStats } from "@/lib/api/statsApi";
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  loading = false,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      {loading ? (
        <Skeleton className="h-7 w-1/2" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const DashboardStats: React.FC = () => {
  const [stats, setStats] = useState<{
    totalIssues: number;
    resolutionRate: number;
    avgResponseTime: string;
    activeUsers: number;
  }>({
    totalIssues: 0,
    resolutionRate: 0,
    avgResponseTime: "N/A",
    activeUsers: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const overallStats = await getOverallStats();

        // Calculate active users (this is a placeholder - in a real app, you'd fetch this from the database)
        const activeUsers = Math.round(overallStats.totalIssues * 1.5);

        setStats({
          totalIssues: overallStats.totalIssues,
          resolutionRate: overallStats.resolutionRate,
          avgResponseTime: overallStats.avgResponseTime,
          activeUsers,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Issues"
        value={stats.totalIssues}
        icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatsCard
        title="Resolution Rate"
        value={`${stats.resolutionRate}%`}
        description="Of all reported issues"
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatsCard
        title="Avg. Response Time"
        value={stats.avgResponseTime}
        description="From report to first response"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
      <StatsCard
        title="Active Users"
        value={stats.activeUsers}
        description="In the last 30 days"
        icon={<Users className="h-4 w-4 text-muted-foreground" />}
        loading={loading}
      />
    </div>
  );
};

export default DashboardStats;
