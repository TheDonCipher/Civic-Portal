import React, { useState, useEffect } from "react";
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
import {
  ThumbsUp,
  MessageCircle,
  Calendar,
  MapPin,
  Users,
  ArrowBigUp,
  BarChart2,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast-enhanced";
import {
  handleApiError,
  showSuccess,
  showInfo,
} from "@/lib/utils/errorHandler";
import { supabase } from "@/lib/supabase";
import { getCategoryDefaultImage } from "@/lib/utils/imageUpload";
import { IssueProvider, useIssue } from "./IssueProvider";
import { sanitizeInput } from "@/lib/utils/securityUtils";

import SuggestSolutionDialog from "./SuggestSolutionDialog";
import UpdateSolutionProgressDialog from "./UpdateSolutionProgressDialog";

interface IssueDetailDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDelete?: (issueId: string) => void;
  issue: any;
}

// Inner component that uses the IssueProvider context
const IssueDetailDialogContent = () => {
  const {
    isLoading,
    issue,
    comments,
    updates,
    solutions,
    isLiked,
    isWatched,
    voteCount,
    watchCount,
    addComment,
    addUpdate,
    addSolution,
    toggleLike,
    toggleWatch,
    voteSolution,
    updateSolutionStatus,
  } = useIssue();

  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSuggestSolutionOpen, setIsSuggestSolutionOpen] = useState(false);
  const [isUpdateProgressOpen, setIsUpdateProgressOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<
    number | string | null
  >(null);
  const [isAuthor, setIsAuthor] = useState(false);
  const [isOfficial, setIsOfficial] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Check if the current user is the author or an official
  useEffect(() => {
    if (user && profile && issue) {
      setIsAuthor(user.id === issue.author_id);
      setIsOfficial(profile.role === "official");
    }
  }, [user, profile, issue]);

  // Implement lazy loading for tab content
  const [activeTab, setActiveTab] = useState("details");
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const submitComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;
    setIsSubmittingComment(true);

    try {
      // Use the context method to add a comment
      const success = await addComment(commentText);
      if (success) {
        setCommentText("");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      handleApiError(error, {
        context: "Submitting comment",
        toastTitle: "Comment Failed",
        toastDescription: "We couldn't post your comment. Please try again.",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const submitUpdate = async () => {
    if (!updateText.trim() || isSubmittingUpdate) return;
    setIsSubmittingUpdate(true);

    try {
      // Use the context method to add an update
      const success = await addUpdate(updateText);
      if (success) {
        setUpdateText("");
      }
    } catch (error) {
      console.error("Error submitting update:", error);
      handleApiError(error, {
        context: "Submitting update",
        toastTitle: "Update Failed",
        toastDescription: "We couldn't post your update. Please try again.",
      });
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleSuggestSolution = async (data: any) => {
    // Use the context method to add a solution
    await addSolution(
      data.title,
      data.description,
      parseInt(data.estimatedCost),
    );
  };

  const handleUpdateSolutionProgressSubmit = async (data: any) => {
    if (!selectedSolution) return;

    // Use the context method to update solution status
    const success = await updateSolutionStatus(
      selectedSolution.toString(),
      data.status,
      data.update,
    );

    if (success) {
      setIsUpdateProgressOpen(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
      "in-progress":
        "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      resolved:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      proposed:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
      approved:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    };
    return statusColors[status] || statusColors.open;
  };

  return (
    <>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-background overflow-hidden border-border">
        <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold">
                {issue?.title}
              </DialogTitle>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Reported by {issue?.author?.name}</span>
                <span>•</span>
                <span>
                  {issue?.date &&
                    new Date(issue.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isAuthor && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDeleteAlertOpen(true)}
                  title="Delete issue"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading issue details...</span>
          </div>
        ) : (
          <Tabs
            defaultValue="details"
            className="flex-1 flex flex-col min-h-0"
            onValueChange={handleTabChange}
          >
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
                Updates ({updates?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="solutions"
                className="data-[state=active]:bg-secondary"
              >
                Solutions ({solutions?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-secondary"
              >
                Comments ({comments?.length || 0})
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="details" className="h-full">
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusColor(issue?.status || "open")}
                          >
                            {(issue?.status || "open").charAt(0).toUpperCase() +
                              (issue?.status || "open")
                                .slice(1)
                                .replace("-", " ")}
                          </Badge>
                          <Badge variant="outline">{issue?.category}</Badge>
                          {issue?.constituency && (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10"
                            >
                              {issue.constituency}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold">Description</h3>
                        <p className="text-muted-foreground">
                          {issue?.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-1 ${isLiked ? "text-primary" : ""}`}
                          onClick={toggleLike}
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{voteCount}</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`flex items-center gap-1 ${isWatched ? "text-primary" : ""}`}
                          onClick={toggleWatch}
                        >
                          <Eye className="h-4 w-4" />
                          <span>{watchCount}</span>
                        </Button>
                      </div>
                    </div>
                    {issue?.location && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Location</h3>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-5 w-5 mr-2" />
                          {issue.location}
                        </div>
                      </div>
                    )}
                    {issue?.thumbnails && issue.thumbnails.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Images</h3>
                        <div className="relative rounded-md overflow-hidden max-w-[500px]">
                          {/* Image Slider */}
                          <div className="relative">
                            <div className="overflow-hidden">
                              <div
                                className="flex transition-transform duration-300 ease-in-out"
                                style={{
                                  transform: `translateX(-${activeImageIndex * 100}%)`,
                                }}
                              >
                                {issue.thumbnails.map((thumbnail, index) => (
                                  <div
                                    key={index}
                                    className="w-full flex-shrink-0"
                                  >
                                    <img
                                      src={thumbnail}
                                      alt={`${issue.title} - Image ${index + 1}`}
                                      className="w-full h-auto object-cover"
                                      loading="lazy"
                                      onError={(e) => {
                                        // Fallback to a default image if the thumbnail fails to load
                                        const target =
                                          e.target as HTMLImageElement;
                                        const categoryLower =
                                          issue.category?.toLowerCase() ||
                                          "infrastructure";
                                        const fallbackImage =
                                          getCategoryDefaultImage(
                                            categoryLower,
                                          );
                                        target.src = fallbackImage;
                                        console.log(
                                          "Using fallback image for category:",
                                          categoryLower,
                                          "Fallback image:",
                                          fallbackImage,
                                        );
                                      }}
                                      style={{
                                        objectFit: "cover",
                                        width: "100%",
                                        height: "auto",
                                        maxHeight: "400px",
                                        display: "block",
                                        margin: "0 auto",
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Navigation Arrows */}
                            {issue.thumbnails.length > 1 && (
                              <>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImageIndex((prev) =>
                                      prev === 0
                                        ? issue.thumbnails.length - 1
                                        : prev - 1,
                                    );
                                  }}
                                >
                                  <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImageIndex((prev) =>
                                      prev === issue.thumbnails.length - 1
                                        ? 0
                                        : prev + 1,
                                    );
                                  }}
                                >
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>

                          {/* Image Indicators */}
                          {issue.thumbnails.length > 1 && (
                            <div className="flex justify-center mt-2 gap-1">
                              {issue.thumbnails.map((_, index) => (
                                <button
                                  key={index}
                                  className={`w-2 h-2 rounded-full transition-colors ${index === activeImageIndex ? "bg-primary" : "bg-muted-foreground/30"}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveImageIndex(index);
                                  }}
                                  aria-label={`Go to image ${index + 1}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="updates"
                className="h-full"
                forceMount={activeTab === "updates"}
              >
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    {/* Allow any authenticated user to post updates */}
                    {user && profile && (
                      <div className="flex gap-4 pt-4 border-b pb-4">
                        <Avatar className="h-10 w-10">
                          {user && profile ? (
                            <>
                              <AvatarImage
                                src={
                                  profile.avatar_url ||
                                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                                }
                                alt={profile.full_name || "User"}
                              />
                              <AvatarFallback>
                                {profile.full_name?.[0] || "U"}
                              </AvatarFallback>
                            </>
                          ) : (
                            <AvatarFallback>U</AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <Textarea
                            placeholder="Add an update about this issue..."
                            value={updateText}
                            onChange={(e) => setUpdateText(e.target.value)}
                            disabled={isSubmittingUpdate}
                            maxLength={2000} // Add max length for security
                          />
                          <div className="flex justify-end">
                            <Button
                              onClick={submitUpdate}
                              disabled={
                                !updateText.trim() || isSubmittingUpdate
                              }
                            >
                              {isSubmittingUpdate ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                "Post Update"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    {updates && updates.length > 0 ? (
                      updates.map((update) => (
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
                              <p className="font-medium">
                                {update.author.name}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {update.date}
                              </span>
                            </div>
                            <p className="mt-1 text-muted-foreground">
                              {update.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No updates yet. Check back later for progress on this
                        issue.
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="solutions"
                className="h-full"
                forceMount={activeTab === "solutions"}
              >
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button onClick={() => setIsSuggestSolutionOpen(true)}>
                        Suggest Solution
                      </Button>
                    </div>
                    {solutions && solutions.length > 0 ? (
                      solutions.map((solution) => (
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
                            <Badge
                              variant="secondary"
                              className={`capitalize ml-2 ${getStatusColor(solution.status)}`}
                            >
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
                                <AvatarFallback>
                                  {solution.proposedBy.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{solution.proposedBy.name}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1"
                                onClick={() => voteSolution(solution.id)}
                              >
                                <ArrowBigUp className="h-4 w-4" />
                                <span>{solution.votes}</span>
                              </Button>
                              <div>
                                <span className="font-medium">
                                  {solution.estimatedCost.toLocaleString()} BWP
                                </span>
                              </div>
                              {(isOfficial ||
                                user?.id === solution.proposed_by) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedSolution(solution.id);
                                    setIsUpdateProgressOpen(true);
                                  }}
                                >
                                  Update Progress
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No solutions suggested yet. Be the first to suggest a
                        solution!
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="comments"
                className="h-full"
                forceMount={activeTab === "comments"}
              >
                <ScrollArea className="h-full px-6 py-4">
                  <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                      comments.map((comment) => (
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
                              <p className="font-medium">
                                {comment.author.name}
                              </p>
                              <span className="text-sm text-muted-foreground">
                                {comment.date}
                              </span>
                            </div>
                            <p className="mt-1 text-muted-foreground">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No comments yet. Be the first to comment!
                      </div>
                    )}
                    <div className="flex gap-4 pt-4 border-t">
                      <Avatar className="h-10 w-10">
                        {user && profile ? (
                          <>
                            <AvatarImage
                              src={
                                profile.avatar_url ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                              }
                              alt={profile.full_name || "User"}
                            />
                            <AvatarFallback>
                              {profile?.full_name?.[0] || "U"}
                            </AvatarFallback>
                          </>
                        ) : (
                          <AvatarFallback>U</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          disabled={isSubmittingComment}
                          maxLength={1000} // Add max length for security
                        />
                        <div className="flex justify-end">
                          <Button
                            onClick={submitComment}
                            disabled={
                              !commentText.trim() || isSubmittingComment
                            }
                          >
                            {isSubmittingComment ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Posting...
                              </>
                            ) : (
                              "Post Comment"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        )}
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
            <AlertDialogAction>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {issue && issue.id && (
        <SuggestSolutionDialog
          open={isSuggestSolutionOpen}
          onOpenChange={setIsSuggestSolutionOpen}
          onSubmit={handleSuggestSolution}
          issueId={issue.id}
        />
      )}

      {selectedSolution !== null && issue && issue.id && (
        <UpdateSolutionProgressDialog
          open={isUpdateProgressOpen}
          onOpenChange={setIsUpdateProgressOpen}
          onSubmit={handleUpdateSolutionProgressSubmit}
          solutionId={selectedSolution}
        />
      )}
    </>
  );
};

// Wrapper component that provides the IssueProvider
const IssueDetailDialog = ({
  open = true,
  onOpenChange = () => {},
  onDelete = () => {},
  issue = {
    id: "",
    title: "",
    description: "",
    category: "",
    status: "open",
    date: "",
    author: {
      name: "",
      avatar: "",
    },
    votes: 0,
    comments: [],
    updates: [],
    solutions: [],
    location: "",
    watchers: 0,
  },
}: IssueDetailDialogProps) => {
  // Make sure we have a valid issue ID before rendering the provider
  if (!issue || !issue.id) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-background overflow-hidden border-border">
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading issue details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <IssueProvider issueId={issue.id}>
        <IssueDetailDialogContent />
      </IssueProvider>
    </Dialog>
  );
};

export default IssueDetailDialog;
