import React from "react";
import Header from "../layout/Header";
import StatCards from "../dashboard/StatCards";
import IssueGrid from "../issues/IssueGrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const StakeholderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const departmentInfo = {
    name: "City Maintenance",
    constituency: "Gaborone Central",
    role: "official",
    assignedIssues: 45,
    resolvedIssues: 32,
    responseTime: "2.5 days",
    satisfaction: 92,
  };

  const mockIssues = [
    {
      id: "1",
      title: "Road Maintenance Required",
      description:
        "Multiple potholes need attention along the Serowe-Palapye road.",
      category: "Infrastructure",
      status: "in-progress",
      votes: 42,
      comments: [],
      date: "2024-03-20",
      author: {
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      thumbnail:
        "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop",
      location: "Serowe-Palapye Road",
      constituency: "Serowe North",
      watchers: 68,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!user && (
        <div className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 p-4 text-center sticky top-[82px] left-0 right-0 z-10">
          <p>
            Demo Profile: You are viewing a mock department dashboard.{" "}
            <a href="/?signin=true" className="underline">
              Sign in
            </a>{" "}
            as an official to see your actual dashboard.
          </p>
        </div>
      )}
      <main className="pt-4 px-6 pb-6">
        <div className="max-w-[1800px] mx-auto space-y-8">
          {/* Department Header */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <h1 className="text-2xl font-bold">{departmentInfo.name}</h1>
                </div>
                <div className="text-muted-foreground">
                  {departmentInfo.constituency} • Department Dashboard
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {departmentInfo.assignedIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">Assigned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {departmentInfo.resolvedIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {departmentInfo.responseTime}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Avg. Response
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="assigned" className="space-y-6">
            <TabsList>
              <TabsTrigger value="assigned">Assigned Issues</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="team">Team Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="assigned">
              <IssueGrid issues={mockIssues} onIssueClick={() => {}} />
            </TabsContent>

            <TabsContent value="in-progress">
              <IssueGrid
                issues={mockIssues.filter((i) => i.status === "in-progress")}
                onIssueClick={() => {}}
              />
            </TabsContent>

            <TabsContent value="resolved">
              <IssueGrid
                issues={mockIssues.filter((i) => i.status === "resolved")}
                onIssueClick={() => {}}
              />
            </TabsContent>

            <TabsContent value="team">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    name: "Sarah Johnson",
                    role: "Senior Engineer",
                    avatar:
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
                    issuesResolved: 15,
                    avgResponseTime: "1.8 days",
                    satisfaction: 95,
                  },
                  {
                    name: "Michael Chen",
                    role: "Maintenance Specialist",
                    avatar:
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
                    issuesResolved: 12,
                    avgResponseTime: "2.1 days",
                    satisfaction: 88,
                  },
                  {
                    name: "Lisa Patel",
                    role: "Field Technician",
                    avatar:
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
                    issuesResolved: 18,
                    avgResponseTime: "1.5 days",
                    satisfaction: 92,
                  },
                ].map((member, i) => (
                  <Card
                    key={i}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Issues Resolved
                          </div>
                          <div className="font-semibold">
                            {member.issuesResolved}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">
                            Response Time
                          </div>
                          <div className="font-semibold">
                            {member.avgResponseTime}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Satisfaction
                          </div>
                          <span className="text-sm font-medium">
                            {member.satisfaction}%
                          </span>
                        </div>
                        <Progress value={member.satisfaction} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default StakeholderDashboard;
