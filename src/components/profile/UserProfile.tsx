import React from "react";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import IssueCard from "../issues/IssueCard";
import { motion } from "framer-motion";
import { Calendar, Mail, User } from "lucide-react";
import type { Issue } from "../issues/IssueGrid";

interface UserProfileProps {
  user: {
    name: string;
    avatar: string;
    email: string;
    role: string;
    joinDate: string;
    issuesCreated: Issue[];
    issuesWatching: Issue[];
    issuesSolved: Issue[];
  };
  onIssueClick: (issue: Issue) => void;
}

const UserProfile = ({
  user = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    email: "john.doe@example.com",
    role: "Citizen",
    joinDate: "2024-01-01",
    issuesCreated: [],
    issuesWatching: [],
    issuesSolved: [],
  },
  onIssueClick,
}: UserProfileProps) => {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5" />
        <CardContent className="relative pt-16 pb-8 px-6 -mt-12">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col md:flex-row md:items-center gap-6"
          >
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <Badge variant="secondary" className="text-sm">
                  {user.role}
                </Badge>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="created" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="created">
                Created ({user.issuesCreated.length})
              </TabsTrigger>
              <TabsTrigger value="watching">
                Watching ({user.issuesWatching.length})
              </TabsTrigger>
              <TabsTrigger value="solved">
                Solved ({user.issuesSolved.length})
              </TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
            </TabsList>

            <TabsContent value="created" className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.issuesCreated.map((issue) => (
                    <motion.div
                      key={issue.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onIssueClick(issue)}
                      className="cursor-pointer"
                    >
                      <IssueCard {...issue} />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="watching" className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.issuesWatching.map((issue) => (
                    <motion.div
                      key={issue.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onIssueClick(issue)}
                      className="cursor-pointer"
                    >
                      <IssueCard {...issue} />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="solved" className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.issuesSolved.map((issue) => (
                    <motion.div
                      key={issue.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => onIssueClick(issue)}
                      className="cursor-pointer"
                    >
                      <IssueCard {...issue} />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="updates" className="mt-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {user.issuesCreated.map((issue) => (
                    <motion.div
                      key={issue.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{issue.title}</h3>
                        <Badge variant="outline">{issue.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        <Textarea
                          placeholder="Add an update about this issue..."
                          className="w-full"
                        />
                        <div className="flex justify-end">
                          <Button>Post Update</Button>
                        </div>
                      </div>
                      {issue.updates && issue.updates.length > 0 && (
                        <div className="space-y-3 pt-4 border-t">
                          <h4 className="font-medium">Previous Updates</h4>
                          {issue.updates.map((update) => (
                            <motion.div
                              key={update.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={update.author.avatar} />
                                <AvatarFallback>
                                  {update.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-medium text-sm">
                                    {update.author.name}
                                  </p>
                                  <span className="text-xs text-muted-foreground">
                                    {update.date}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{update.content}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
