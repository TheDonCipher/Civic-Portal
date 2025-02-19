import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  ThumbsUp,
  MessageCircle,
  Calendar,
  MapPin,
  Users,
  ArrowBigUp,
  BarChart2,
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import SuggestSolutionDialog from "./SuggestSolutionDialog";
import UpdateSolutionProgressDialog from "./UpdateSolutionProgressDialog";

interface IssueDetailDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (issueId: string) => void;
  user?: {
    name: string;
    avatar: string;
  };
  issue: {
    id: string;
    title: string;
    description: string;
    category: string;
    status: "open" | "in-progress" | "resolved";
    votes: number;
    comments?: Array<{
      id: number;
      author: {
        name: string;
        avatar: string;
      };
      content: string;
      date: string;
    }>;
    updates?: Array<{
      id: number;
      author: {
        name: string;
        avatar: string;
      };
      content: string;
      date: string;
      type: "status" | "comment" | "solution";
    }>;
    solutions?: Array<{
      id: number;
      title: string;
      description: string;
      proposedBy: {
        name: string;
        avatar: string;
      };
      estimatedCost: number;
      votes: number;
      status: "proposed" | "approved" | "in-progress" | "completed";
    }>;
    date: string;
    author: {
      name: string;
      avatar: string;
    };
    location?: string;
    watchers?: number;
  };
}

const IssueDetailDialog = ({
  open = true,
  onOpenChange = () => {},
  onDelete = () => {},
  user = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  issue = {
    id: "",
    title: "",
    description: "",
    category: "",
    status: "open" as const,
    date: "",
    author: {
      name: "",
      avatar: "",
    },
    votes: 0,
  },
}: IssueDetailDialogProps) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [isSuggestSolutionOpen, setIsSuggestSolutionOpen] =
    React.useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = React.useState(false);
  const [selectedSolution, setSelectedSolution] = React.useState<number | null>(
    null,
  );

  const handleDelete = () => {
    onDelete(issue.id);
    setIsDeleteAlertOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-background overflow-hidden border-border">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                {issue.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Reported by {issue.author.name}</span>
                <span>•</span>
                <span>{issue.date}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDeleteAlertOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 flex flex-col min-h-0">
          <TabsList className="px-6 border-b border-border bg-background">
            <TabsTrigger
              value="details"
              className="data-[state=active]:bg-secondary"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="updates"
              className="data-[state=active]:bg-secondary"
            >
              Updates
            </TabsTrigger>
            <TabsTrigger
              value="solutions"
              className="data-[state=active]:bg-secondary"
            >
              Solutions
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-secondary"
            >
              Comments
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="details" className="h-full">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{issue.description}</p>
                  </div>
                  {issue.location && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Location</h3>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-5 w-5 mr-2" />
                        {issue.location}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="updates" className="h-full">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4">
                  {issue.author.name === user.name && (
                    <div className="flex gap-4 pt-4 border-b pb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea placeholder="Add an update about this issue..." />
                        <div className="flex justify-end">
                          <Button>Post Update</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {issue.updates?.map((update) => (
                    <div
                      key={update.id}
                      className="flex space-x-4 p-4 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={update.author.avatar}
                          alt={update.author.name}
                        />
                        <AvatarFallback>
                          {update.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{update.author.name}</p>
                          <span className="text-sm text-muted-foreground">
                            {update.date}
                          </span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {update.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="solutions" className="h-full">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button onClick={() => setIsSuggestSolutionOpen(true)}>
                      Suggest Solution
                    </Button>
                  </div>
                  {issue.solutions?.map((solution) => (
                    <div
                      key={solution.id}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{solution.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {solution.description}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize ml-2">
                          {solution.status.replace("-", " ")}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={solution.proposedBy.avatar}
                              alt={solution.proposedBy.name}
                            />
                          </Avatar>
                          <span>{solution.proposedBy.name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <ArrowBigUp className="h-4 w-4 mr-1" />
                            <span>{solution.votes}</span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {solution.estimatedCost.toLocaleString()} BWP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comments" className="h-full">
              <ScrollArea className="h-full px-6 py-4">
                <div className="space-y-4">
                  {issue.comments?.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex space-x-4 p-4 border rounded-lg"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{comment.author.name}</p>
                          <span className="text-sm text-muted-foreground">
                            {comment.date}
                          </span>
                        </div>
                        <p className="mt-1 text-muted-foreground">
                          {comment.content}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-4 border-t">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea placeholder="Add a comment..." />
                      <div className="flex justify-end">
                        <Button>Post Comment</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              issue and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SuggestSolutionDialog
        open={isSuggestSolutionOpen}
        onOpenChange={setIsSuggestSolutionOpen}
        issueId={issue.id}
      />

      {selectedSolution !== null && (
        <UpdateSolutionProgressDialog
          open={isUpdateProgressOpen}
          onOpenChange={setIsUpdateProgressOpen}
          solutionId={selectedSolution}
        />
      )}
    </Dialog>
  );
};

export default IssueDetailDialog;
