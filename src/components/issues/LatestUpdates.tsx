import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { MessageCircle } from "lucide-react";

interface LatestUpdatesProps {
  updates?: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
    type: string;
    issueTitle: string;
    issueId: string;
  }>;
  onIssueClick?: (issueId: string) => void;
}

const LatestUpdates = ({
  updates = [
    {
      id: 1,
      author: {
        name: "City Maintenance",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=city",
      },
      content: "Issue has been reviewed and scheduled for repair next week.",
      date: "2024-03-22",
      type: "status",
      issueTitle: "Road Maintenance Required",
      issueId: "1",
    },
  ],
  onIssueClick = () => {},
}: LatestUpdatesProps) => {
  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case "status":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300";
      case "solution":
        return "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";
      case "comment":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <Card className="bg-background border-border shadow-sm h-[calc(100vh-88px)] flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-border">
        <CardTitle className="text-xl font-bold">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Latest Updates
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full px-6">
          <div className="py-4 space-y-4">
            {updates.map((update) => (
              <div
                key={update.id}
                className="group relative p-4 border rounded-lg bg-card hover:bg-accent/50 hover:border-border cursor-pointer transition-all duration-200 shadow-sm"
                onClick={() => onIssueClick(update.issueId)}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/10 group-hover:bg-primary/20 rounded-l-lg transition-colors" />
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage
                      src={update.author.avatar}
                      alt={update.author.name}
                    />
                    <AvatarFallback>
                      {update.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{update.author.name}</p>
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        {formatDate(update.date)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {update.content}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getUpdateTypeColor(update.type)}
                      >
                        {update.type.charAt(0).toUpperCase() +
                          update.type.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        on "{update.issueTitle}"
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LatestUpdates;
