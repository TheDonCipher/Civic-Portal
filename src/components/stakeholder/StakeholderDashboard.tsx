import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import PageTitle from "../common/PageTitle";
import { AlertCircle, CheckCircle, Clock, Users } from "lucide-react";

const StakeholderDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState("overview");

  // We don't need to check auth here anymore since we're using ProtectedRoute
  // The component will only render if the user has the correct role

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle
        title="Stakeholder Dashboard"
        description="Manage government responses to citizen issues"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Stakeholder Dashboard", href: "#" },
        ]}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending Issues</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Open Issues"
              value="24"
              description="Requiring attention"
              icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="In Progress"
              value="18"
              description="Currently being addressed"
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Resolved"
              value="42"
              description="Successfully completed"
              icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
            />
            <StatsCard
              title="Citizen Engagement"
              value="156"
              description="Comments this month"
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Stakeholder dashboard functionality will be implemented in a
                future update.
              </p>
              <Button className="mt-4" onClick={() => navigate("/issues")}>
                View All Issues
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pending issues will be displayed here in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Resolved issues will be displayed here in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

export default StakeholderDashboard;
