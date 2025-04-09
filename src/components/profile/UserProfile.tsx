import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, MapPin, Calendar, Settings } from "lucide-react";
import IssueGrid from "../issues/IssueGrid";
import ProfileSettings from "./ProfileSettings";
import type { Issue } from "../issues/IssueGrid";
import { useAuth } from "@/lib/auth";

interface UserProfileProps {
  user: {
    name: string;
    avatar: string;
    email: string;
    role: string;
    joinDate: string;
    issuesCreated: Issue[];
    issuesWatching: Issue[];
    issuesSolved?: Issue[];
    isRealUser?: boolean;
  };
  onIssueClick: (issue: Issue) => void;
  onCreateIssue: () => void;
}

const UserProfile = ({
  user,
  onIssueClick,
  onCreateIssue,
}: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState("created");
  const { user: authUser } = useAuth();
  const isCurrentUser = authUser?.id && user.isRealUser;

  // Process user issues to ensure no duplicates
  const userWithIssues = {
    ...user,
    // Only add mock issue for demo users, NOT for real users
    issuesCreated: user.isRealUser
      ? [...new Set(user.issuesCreated)]
      : user.issuesCreated,
    // Make sure we don't have duplicate issues between created and watching
    issuesWatching: user.issuesWatching.filter(
      (watchedIssue) =>
        !user.issuesCreated.some(
          (createdIssue) => createdIssue.id === watchedIssue.id,
        ),
    ),
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5" />
        <CardContent className="relative pt-16 pb-8 px-6 -mt-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage
                src={userWithIssues.avatar}
                alt={userWithIssues.name}
              />
              <AvatarFallback>{userWithIssues.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{userWithIssues.name}</h2>
                <Badge variant="secondary" className="text-sm">
                  {userWithIssues.role}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {userWithIssues.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined{" "}
                  {new Date(userWithIssues.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="created">Created Issues</TabsTrigger>
              <TabsTrigger value="watching">Watching</TabsTrigger>
              {user.issuesSolved && user.issuesSolved.length > 0 && (
                <TabsTrigger value="solved">Solved</TabsTrigger>
              )}
              {isCurrentUser && (
                <TabsTrigger value="settings">Settings</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="created">
              <div className="flex justify-end mb-4">
                <Button
                  onClick={onCreateIssue}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Report New Issue
                </Button>
              </div>

              {userWithIssues.issuesCreated.length > 0 ? (
                <IssueGrid
                  issues={userWithIssues.issuesCreated}
                  onIssueClick={onIssueClick}
                  compact
                />
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    You haven't created any issues yet.
                  </p>
                  <Button onClick={onCreateIssue} className="mt-4">
                    Report Your First Issue
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="watching">
              {userWithIssues.issuesWatching.length > 0 ? (
                <IssueGrid
                  issues={userWithIssues.issuesWatching}
                  onIssueClick={onIssueClick}
                  compact
                />
              ) : (
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <p className="text-muted-foreground">
                    You're not watching any issues yet.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("created")}
                    className="mt-4"
                  >
                    Browse Issues
                  </Button>
                </div>
              )}
            </TabsContent>

            {user.issuesSolved && (
              <TabsContent value="solved">
                {user.issuesSolved.length > 0 ? (
                  <IssueGrid
                    issues={user.issuesSolved}
                    onIssueClick={onIssueClick}
                    compact
                  />
                ) : (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">
                      {user.role === "official"
                        ? "You haven't marked any issues as resolved yet."
                        : "You don't have any solved issues yet."}
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            {isCurrentUser && (
              <TabsContent value="settings">
                <ProfileSettings onUpdate={() => setActiveTab("created")} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
