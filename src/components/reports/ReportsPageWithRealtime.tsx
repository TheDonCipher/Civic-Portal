import React, { useState, useEffect } from "react";
import { getReportData } from "@/lib/api/statsApi";
import MainLayout from "../layout/MainLayout";
import PageTitle from "../common/PageTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SEOHead from "../common/SEOHead";
import { useToast } from "@/components/ui/use-toast-enhanced";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

// Default data structure for reports
const defaultReportData = {
  issuesByCategory: [],
  issuesByStatus: [],
  monthlyTrends: [],
  departmentPerformance: [],
  budgetAllocation: [],
  citizenEngagement: [],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const ReportsPageWithRealtime = () => {
  const [timeframe, setTimeframe] = useState("6m");
  const [department, setDepartment] = useState("all");
  const [reportData, setReportData] = useState(defaultReportData);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [summaryData, setSummaryData] = useState({
    totalIssues: 0,
    resolutionRate: 0,
    avgResponseTime: "0 days",
    citizenSatisfaction: 0,
  });
  const { toast } = useToast();

  // Fetch report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await getReportData(timeframe);
        console.log("Fetched report data:", data);

        // Ensure data has the expected structure
        const safeData = {
          ...defaultReportData,
          ...(data || {}),
        };

        setReportData(safeData);

        // Calculate summary data from the fetched data
        const totalIssues =
          safeData.issuesByCategory?.reduce(
            (sum, item) => sum + (item?.value || 0),
            0,
          ) || 0;

        const resolvedIssues =
          safeData.issuesByStatus?.find(
            (item) => item?.name?.toLowerCase() === "resolved",
          )?.value || 0;

        const resolutionRate =
          totalIssues > 0 && resolvedIssues !== undefined
            ? Math.round((resolvedIssues / totalIssues) * 100)
            : 0;

        // Get average response time from monthly trends
        const lastTrendItem =
          safeData.monthlyTrends?.length > 0
            ? safeData.monthlyTrends[safeData.monthlyTrends.length - 1]
            : null;

        const avgResponseTime =
          lastTrendItem && lastTrendItem.responseTime !== undefined
            ? `${lastTrendItem.responseTime.toFixed(1)} days`
            : "N/A";

        // Get citizen satisfaction from the latest month
        const lastEngagementItem =
          safeData.citizenEngagement?.length > 0
            ? safeData.citizenEngagement[safeData.citizenEngagement.length - 1]
            : null;

        const citizenSatisfaction =
          lastEngagementItem && lastEngagementItem.satisfaction !== undefined
            ? lastEngagementItem.satisfaction
            : 0;

        setSummaryData({
          totalIssues,
          resolutionRate,
          avgResponseTime,
          citizenSatisfaction,
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error loading reports",
          description: "Failed to load report data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, [timeframe, refreshTrigger, toast]);

  // Set up realtime subscription for data changes
  useEffect(() => {
    // Create a realtime channel for issues table changes
    const channel: RealtimeChannel = supabase
      .channel("reports-page-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues" },
        (payload: any) => {
          console.log("Issue change detected in reports page:", payload);
          // Trigger a refresh of the reports data
          setRefreshTrigger((prev) => prev + 1);

          // Show a toast notification about the data update
          toast({
            title: "Data Updated",
            description:
              "Reports data has been refreshed with the latest changes.",
            variant: "default",
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload: any) => {
          console.log("Comment change detected in reports page:", payload);
          // Trigger a refresh of the reports data
          setRefreshTrigger((prev) => prev + 1);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issue_votes" },
        (payload: any) => {
          console.log("Vote change detected in reports page:", payload);
          // Trigger a refresh of the reports data
          setRefreshTrigger((prev) => prev + 1);
        },
      )
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(channel).catch((err) => {
        console.error("Error removing channel:", err);
      });
    };
  }, [toast]);

  const handleExportReport = () => {
    // In a real application, this would generate a PDF or CSV export
    toast({
      title: "Report Export",
      description: `Exporting ${timeframe} report data...`,
      variant: "default",
    });

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Report has been downloaded successfully.",
        variant: "default",
      });
    }, 2000);
  };

  return (
    <MainLayout>
      <SEOHead
        title="Reports & Analytics"
        description="View detailed reports and analytics about civic issues and government response."
      />
      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        <PageTitle
          title="Government Analytics Dashboard"
          description="Comprehensive analytics and reporting on civic issues and government response"
        />

        <div className="flex items-center justify-end gap-4 mb-6">
          <Select
            value={timeframe}
            onValueChange={(value) => {
              setTimeframe(value);
              setLoading(true);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="h-[120px] animate-pulse bg-muted rounded-lg"></div>
            <div className="h-[120px] animate-pulse bg-muted rounded-lg"></div>
            <div className="h-[120px] animate-pulse bg-muted rounded-lg"></div>
            <div className="h-[120px] animate-pulse bg-muted rounded-lg"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.totalIssues}
                </div>
                <p className="text-sm text-green-600">
                  {reportData.issuesByCategory &&
                  reportData.issuesByCategory.length > 0 &&
                  reportData.issuesByCategory[0]?.previousValue
                    ? `+${Math.round(((summaryData.totalIssues - reportData.issuesByCategory[0].previousValue) / reportData.issuesByCategory[0].previousValue) * 100)}% from last period`
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.resolutionRate}%
                </div>
                <p className="text-sm text-green-600">
                  {reportData.issuesByStatus &&
                  reportData.issuesByStatus.length > 0 &&
                  reportData.issuesByStatus[0]?.previousValue
                    ? `+${Math.round(((summaryData.resolutionRate - reportData.issuesByStatus[0].previousValue) / reportData.issuesByStatus[0].previousValue) * 100)}% from last period`
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.avgResponseTime}
                </div>
                <p className="text-sm text-green-600">
                  {reportData.monthlyTrends &&
                  reportData.monthlyTrends.length > 1 &&
                  reportData.monthlyTrends[reportData.monthlyTrends.length - 2]
                    ?.responseTime !== undefined &&
                  reportData.monthlyTrends[reportData.monthlyTrends.length - 1]
                    ?.responseTime !== undefined
                    ? `-${(reportData.monthlyTrends[reportData.monthlyTrends.length - 2].responseTime - reportData.monthlyTrends[reportData.monthlyTrends.length - 1].responseTime).toFixed(1)} days improvement`
                    : ""}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citizen Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {summaryData.citizenSatisfaction}%
                </div>
                <p className="text-sm text-green-600">
                  {reportData.citizenEngagement &&
                  reportData.citizenEngagement.length > 1 &&
                  reportData.citizenEngagement[
                    reportData.citizenEngagement.length - 1
                  ]?.satisfaction !== undefined &&
                  reportData.citizenEngagement[
                    reportData.citizenEngagement.length - 2
                  ]?.satisfaction !== undefined
                    ? `+${(reportData.citizenEngagement[reportData.citizenEngagement.length - 1].satisfaction - reportData.citizenEngagement[reportData.citizenEngagement.length - 2].satisfaction).toFixed(1)}% from last period`
                    : ""}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">
              Department Performance
            </TabsTrigger>
            <TabsTrigger value="financial">Financial Analysis</TabsTrigger>
            <TabsTrigger value="engagement">Citizen Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Reuse the existing content from ReportsPage.tsx */}
            {/* This is just a placeholder - the actual implementation would include the charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Issue Distribution</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Distribution of issues across different categories
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent>
                  {/* The chart would be rendered here */}
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      {!reportData.issuesByCategory ||
                      reportData.issuesByCategory.length === 0
                        ? "No data available for the selected timeframe"
                        : "Issue distribution chart with real-time updates"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* The chart would be rendered here */}
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      {!reportData.monthlyTrends ||
                      reportData.monthlyTrends.length === 0
                        ? "No data available for the selected timeframe"
                        : "Monthly trends chart with real-time updates"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department Resolution Rates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      Department performance data with real-time updates
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      Response time data with real-time updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Budget Allocation vs Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      Budget data with real-time updates
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      Resource utilization data with real-time updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Citizen Participation Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      Participation metrics with real-time updates
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-[300px]">
                    <p className="text-muted-foreground">
                      Satisfaction trend data with real-time updates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPageWithRealtime;
