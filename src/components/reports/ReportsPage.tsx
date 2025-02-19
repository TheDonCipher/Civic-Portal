import React, { useState } from "react";
import Header from "../layout/Header";
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
import { Download, Filter } from "lucide-react";
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

const mockData = {
  issuesByCategory: [
    { name: "Infrastructure", value: 45, previousValue: 38 },
    { name: "Environment", value: 32, previousValue: 28 },
    { name: "Safety", value: 28, previousValue: 25 },
    { name: "Community", value: 15, previousValue: 12 },
  ],
  issuesByStatus: [
    { name: "Open", value: 35, previousValue: 42 },
    { name: "In Progress", value: 25, previousValue: 18 },
    { name: "Resolved", value: 40, previousValue: 32 },
  ],
  monthlyTrends: [
    { month: "Jan", issues: 24, resolved: 18, responseTime: 8.2 },
    { month: "Feb", issues: 18, resolved: 15, responseTime: 7.5 },
    { month: "Mar", issues: 32, resolved: 28, responseTime: 6.8 },
    { month: "Apr", issues: 45, resolved: 38, responseTime: 5.2 },
    { month: "May", issues: 38, resolved: 35, responseTime: 4.9 },
    { month: "Jun", issues: 28, resolved: 25, responseTime: 4.5 },
  ],
  departmentPerformance: [
    { name: "Public Works", resolutionRate: 82, avgResponseDays: 3.5 },
    { name: "Environmental", resolutionRate: 75, avgResponseDays: 4.2 },
    { name: "Public Safety", resolutionRate: 88, avgResponseDays: 2.8 },
    { name: "Community Dev", resolutionRate: 70, avgResponseDays: 5.1 },
  ],
  budgetAllocation: [
    { category: "Infrastructure", allocated: 250000, spent: 180000 },
    { category: "Environment", allocated: 150000, spent: 120000 },
    { category: "Safety", allocated: 200000, spent: 160000 },
    { category: "Community", allocated: 100000, spent: 75000 },
  ],
  citizenEngagement: [
    { month: "Jan", votes: 450, comments: 120, satisfaction: 85 },
    { month: "Feb", votes: 380, comments: 95, satisfaction: 82 },
    { month: "Mar", votes: 520, comments: 150, satisfaction: 88 },
    { month: "Apr", votes: 620, comments: 180, satisfaction: 86 },
    { month: "May", votes: 580, comments: 160, satisfaction: 89 },
    { month: "Jun", votes: 480, comments: 140, satisfaction: 87 },
  ],
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export const ReportsPage = () => {
  const [timeframe, setTimeframe] = useState("6m");
  const [department, setDepartment] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-[72px] px-6 pb-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              Government Analytics Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Select value={timeframe} onValueChange={setTimeframe}>
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
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">120</div>
                <p className="text-sm text-green-600">+12% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78%</div>
                <p className="text-sm text-green-600">+5% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg. Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.5 days</div>
                <p className="text-sm text-green-600">-0.8 days improvement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Citizen Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87%</div>
                <p className="text-sm text-green-600">+3% from last period</p>
              </CardContent>
            </Card>
          </div>

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
                    <Button variant="ghost" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={mockData.issuesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {mockData.issuesByCategory.map((entry, index) => (
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={mockData.monthlyTrends}>
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
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockData.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="resolutionRate" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Response Time by Department</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockData.departmentPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgResponseDays" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
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
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={mockData.budgetAllocation}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="allocated" fill="#8884d8" />
                        <Bar dataKey="spent" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resource Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={mockData.budgetAllocation}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percent }) =>
                            `${category} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="spent"
                        >
                          {mockData.budgetAllocation.map((entry, index) => (
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
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockData.citizenEngagement}>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Satisfaction Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={mockData.citizenEngagement}>
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
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ReportsPage;
