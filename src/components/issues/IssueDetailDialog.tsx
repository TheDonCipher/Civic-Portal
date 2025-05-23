import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Issue } from "./IssueGrid";
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

interface IssueDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Issue;
  onDelete?: (issueId: string) => void;
}

const IssueDetailDialog = ({
  open,
  onOpenChange,
  issue,
  onDelete,
}: IssueDetailDialogProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Placeholder for actual implementation
  const handleDelete = async () => {
    if (!user || !issue) {
      toast({
        title: "Error",
        description: !user
          ? "You must be signed in to delete an issue"
          : "Issue data is not available",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if user has permission to delete
      const { data: issueData, error: issueError } = await supabase
        .from("issues")
        .select("author_id")
        .eq("id", issue.id)
        .single();

      if (issueError) throw issueError;

      if (issueData.author_id !== user.id && profile?.role !== "admin") {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to delete this issue",
          variant: "destructive",
        });
        return;
      }

      // Delete the issue
      const { error: deleteError } = await supabase
        .from("issues")
        .delete()
        .eq("id", issue.id);

      if (deleteError) throw deleteError;

      toast({
        title: "Issue Deleted",
        description: "The issue has been successfully deleted",
        variant: "default",
      });

      // Close dialogs and notify parent
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      if (onDelete) onDelete(issue.id);
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast({
        title: "Error",
        description: "Failed to delete issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {issue?.title || "Issue Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Issue metadata */}
          {issue && (
            <div className="flex flex-wrap gap-2 items-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {issue.status || "Unknown"}
              </Badge>
              <Badge variant="outline">
                {issue.category || "Uncategorized"}
              </Badge>
              <div className="flex items-center space-x-2 ml-auto">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={issue.author?.avatar}
                    alt={issue.author?.name}
                  />
                  <AvatarFallback>
                    {issue.author?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">
                  {issue.author?.name || "Unknown"}
                </span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs
            defaultValue="details"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="solutions">Solutions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              {issue ? (
                <>
                  <div className="aspect-video overflow-hidden rounded-md">
                    <img
                      src={
                        issue.thumbnail ||
                        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80"
                      }
                      alt={issue.title || "Issue"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    <p className="text-gray-700">
                      {issue.description || "No description provided."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Location
                      </h4>
                      <p>{issue.location || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Constituency
                      </h4>
                      <p>{issue.constituency || "Not specified"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">
                    Loading issue details...
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <p className="text-muted-foreground">
                Comments functionality will be implemented in a future update.
              </p>
            </TabsContent>

            <TabsContent value="solutions" className="space-y-4">
              <p className="text-muted-foreground">
                Solutions functionality will be implemented in a future update.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex justify-between">
          {user &&
            issue &&
            (user.id === (issue.author as any)?.id ||
              profile?.role === "admin") && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Issue
              </Button>
            )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
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
    </Dialog>
  );
};

export default IssueDetailDialog;
