import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { UserProfile } from "./UserProfile";
import { ProfileSettings } from "./ProfileSettings";
import { PageTitle } from "../common/PageTitle";
import { LoadingSpinner } from "../common/LoadingSpinner";

export function ProfilePage() {
  const { user, profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    // Set page title
    document.title = "My Profile | Government Issue Tracking Portal";
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Please sign in to view your profile
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Transform user data to match UserProfile component props
  const userProfileData = {
    name: profile?.full_name || user.email || "User",
    avatar:
      profile?.avatar_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
    email: user.email || "",
    role: profile?.role || "citizen",
    joinDate: user.created_at || new Date().toISOString(),
    issuesCreated: [],
    issuesWatching: [],
    isRealUser: true,
  };

  return (
    <div className="container mx-auto py-8">
      <PageTitle
        title="My Profile"
        description="View and manage your profile information"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <UserProfile
            user={userProfileData}
            onIssueClick={() => {}}
            onCreateIssue={() => {}}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <ProfileSettings onUpdate={() => setActiveTab("profile")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ProfilePage;
