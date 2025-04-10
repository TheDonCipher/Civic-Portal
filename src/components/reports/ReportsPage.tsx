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
import { Download, Filter, Info } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SEOHead from "../common/SEOHead";
import { useToast } from "@/components/ui/use-toast-enhanced";

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

export const ReportsPage = () => {
  const [timeframe, setTimeframe] = useState("6m");
  const [department, setDepartment] = useState("all");
  const [reportData, setReportData] = useState(defaultReportData);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalIssues: 0,
    resolutionRate: 0,
    avgResponseTime: "0 days",
    citizenSatisfaction: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await getReportData(timeframe);
        console.log("Fetched report data:", data);

        // Ensure data is properly initialized with default values if any property is missing
        const safeData = {
          ...defaultReportData,
          ...(data || {}),
        };

        setReportData(safeData);

        // Calculate summary data from the fetched data
        const totalIssues =
          safeData?.issuesByCategory?.reduce(
            (sum, item) => sum + (item?.value || 0),
            0,
          ) || 0;

        const resolvedIssues =
          safeData?.issuesByStatus?.find(
            (item) => item?.name?.toLowerCase() === "resolved",
          )?.value || 0;

        const resolutionRate =
          totalIssues > 0
            ? Math.round((resolvedIssues / totalIssues) * 100)
            : 0;

        // Get average response time from monthly trends
        const lastTrendItem =
          safeData?.monthlyTrends?.length > 0
            ? safeData.monthlyTrends[safeData.monthlyTrends.length - 1]
            : null;

        const avgResponseTime =
          lastTrendItem && lastTrendItem?.responseTime !== undefined
            ? `${lastTrendItem.responseTime.toFixed(1)} days`
            : "N/A";

        // Get citizen satisfaction from the latest month
        const lastEngagementItem =
          safeData?.citizenEngagement?.length > 0
            ? safeData.citizenEngagement[safeData.citizenEngagement.length - 1]
            : null;

        const citizenSatisfaction =
          lastEngagementItem && lastEngagementItem?.satisfaction !== undefined
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
  }, [timeframe, toast]);

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
        variant: "success",
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
                  {reportData?.issuesByCategory?.length > 0 &&
                  reportData?.issuesByCategory[0]?.previousValue !== undefined
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
                  {reportData?.issuesByStatus?.length > 0 &&
                  reportData?.issuesByStatus[0]?.previousValue !== undefined
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
                  {reportData?.monthlyTrends?.length > 1 &&
                  reportData?.monthlyTrends[reportData.monthlyTrends.length - 2]
                    ?.responseTime !== undefined &&
                  reportData?.monthlyTrends[reportData.monthlyTrends.length - 1]
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
                  {reportData?.citizenEngagement?.length > 1 &&
                  reportData?.citizenEngagement[
                    reportData.citizenEngagement.length - 1
                  ]?.satisfaction !== undefined &&
                  reportData?.citizenEngagement[
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Issue Distribution</CardTitle>
                  <TooltipProvider>
                    <UITooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Distribution of issues across different categories
                        </p>
                      </TooltipContent>
                    </UITooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent>
                  {reportData?.issuesByCategory?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.issuesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name || "Unknown"} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.issuesByCategory.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData?.monthlyTrends?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={reportData.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="issues"
                          stackId="1"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                        <Area
                          type="monotone"
                          dataKey="resolved"
                          stackId="2"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
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
                  {reportData?.departmentPerformance?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="resolutionRate" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Response Time by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData?.departmentPerformance?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgResponseDays" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
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
                  {reportData?.budgetAllocation?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.budgetAllocation}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="allocated" fill="#8884d8" />
                        <Bar dataKey="spent" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Resource Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData?.budgetAllocation?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.budgetAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) =>
                            `${category || "Unknown"} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="spent"
                        >
                          {reportData.budgetAllocation.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
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
                  {reportData?.citizenEngagement?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.citizenEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="votes"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="comments"
                          stroke="#82ca9d"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Satisfaction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData?.citizenEngagement?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.citizenEngagement}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="satisfaction"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">
                        No data available for the selected timeframe
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
