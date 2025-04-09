import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  toggleIssueVote,
  toggleIssueWatch,
  addComment,
  addUpdate,
  toggleSolutionVote,
  updateSolutionStatus,
} from "@/lib/utils/issueHelpers";

/**
 * Custom hook for handling issue interactions (likes, watches, comments, etc.)
 */
export const useIssueInteractions = (issueId: string) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!issueId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching data for issue ID:", issueId);

        // Fetch issue details
        const { data: issueData, error: issueError } = await supabase
          .from("issues")
          .select("votes, watchers_count")
          .eq("id", issueId)
          .single();

        if (issueError) {
          console.error("Error fetching issue data:", issueError);
          throw issueError;
        }

        setVoteCount(issueData.votes || 0);
        setWatchCount(issueData.watchers_count || 0);

        // Fetch comments
        console.log("Fetching comments for issue ID:", issueId);
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("*, profiles!comments_author_id_fkey(full_name, avatar_url)")
          .eq("issue_id", issueId)
          .order("created_at", { ascending: true });

        console.log("Comments query result:", {
          data: commentsData,
          error: commentsError,
        });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
          throw commentsError;
        }

        console.log("Fetched comments:", commentsData);

        // Format comments
        const formattedComments = commentsData.map((comment) => ({
          id: comment.id,
          content: comment.content,
          date: new Date(comment.created_at).toLocaleDateString(),
          author: {
            name: comment.profiles?.full_name || "Unknown",
            avatar:
              comment.profiles?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author_id}`,
          },
          author_id: comment.author_id,
        }));

        setComments(formattedComments);

        // Fetch updates
        console.log("Fetching updates for issue ID:", issueId);
        const { data: updatesData, error: updatesError } = await supabase
          .from("updates")
          .select("*, profiles!updates_author_id_fkey(full_name, avatar_url)")
          .eq("issue_id", issueId)
          .order("created_at", { ascending: true });

        console.log("Updates query result:", {
          data: updatesData,
          error: updatesError,
        });

        if (updatesError) {
          console.error("Error fetching updates:", updatesError);
          throw updatesError;
        }

        console.log("Fetched updates:", updatesData);

        // Format updates
        const formattedUpdates = updatesData.map((update) => ({
          id: update.id,
          content: update.content,
          date: new Date(update.created_at).toLocaleDateString(),
          type: update.type,
          author: {
            name: update.profiles?.full_name || "Unknown",
            avatar:
              update.profiles?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.author_id}`,
          },
          author_id: update.author_id,
        }));

        setUpdates(formattedUpdates);

        // Fetch solutions
        console.log("Fetching solutions for issue ID:", issueId);
        const { data: solutionsData, error: solutionsError } = await supabase
          .from("solutions")
          .select(
            "*, profiles!solutions_proposed_by_fkey(full_name, avatar_url)",
          )
          .eq("issue_id", issueId)
          .order("created_at", { ascending: true });

        console.log("Solutions query result:", {
          data: solutionsData,
          error: solutionsError,
        });

        if (solutionsError) {
          console.error("Error fetching solutions:", solutionsError);
          throw solutionsError;
        }

        console.log("Fetched solutions:", solutionsData);

        // Format solutions
        const formattedSolutions = solutionsData.map((solution) => ({
          id: solution.id,
          title: solution.title,
          description: solution.description,
          estimatedCost: solution.estimated_cost,
          votes: solution.votes,
          status: solution.status,
          date: new Date(solution.created_at).toLocaleDateString(),
          proposedBy: {
            name: solution.profiles?.full_name || "Unknown",
            avatar:
              solution.profiles?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${solution.proposed_by}`,
          },
          proposed_by: solution.proposed_by,
        }));

        setSolutions(formattedSolutions);

        // Check if user has liked or is watching this issue
        if (user) {
          const { data: likeData } = await supabase
            .from("issue_votes")
            .select("*")
            .eq("issue_id", issueId)
            .eq("user_id", user.id)
            .maybeSingle();

          setIsLiked(!!likeData);

          const { data: watchData } = await supabase
            .from("issue_watchers")
            .select("*")
            .eq("issue_id", issueId)
            .eq("user_id", user.id)
            .maybeSingle();

          setIsWatched(!!watchData);
        }
      } catch (error) {
        console.error("Error fetching issue data:", error);
        toast({
          title: "Error",
          description: "Failed to load issue details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up realtime subscriptions
    const commentsSubscription = supabase
      .channel(`comments-channel-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `issue_id=eq.${issueId}`,
        },
        async (payload) => {
          console.log("New comment received:", payload);
          // Fetch the new comment with author details
          const { data, error } = await supabase
            .from("comments")
            .select(
              "*, profiles!comments_author_id_fkey(full_name, avatar_url)",
            )
            .eq("id", payload.new.id)
            .single();

          if (error) {
            console.error("Error fetching new comment:", error);
            return;
          }

          const newComment = {
            id: data.id,
            content: data.content,
            date: new Date(data.created_at).toLocaleDateString(),
            author: {
              name: data.profiles?.full_name || "Unknown",
              avatar:
                data.profiles?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author_id}`,
            },
            author_id: data.author_id,
          };

          setComments((prev) => [...prev, newComment]);
        },
      )
      .subscribe();

    const updatesSubscription = supabase
      .channel(`updates-channel-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "updates",
          filter: `issue_id=eq.${issueId}`,
        },
        async (payload) => {
          console.log("New update received:", payload);
          // Fetch the new update with author details
          const { data, error } = await supabase
            .from("updates")
            .select("*, profiles!updates_author_id_fkey(full_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (error) {
            console.error("Error fetching new update:", error);
            return;
          }

          const newUpdate = {
            id: data.id,
            content: data.content,
            date: new Date(data.created_at).toLocaleDateString(),
            type: data.type,
            author: {
              name: data.profiles?.full_name || "Unknown",
              avatar:
                data.profiles?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author_id}`,
            },
            author_id: data.author_id,
          };

          setUpdates((prev) => [...prev, newUpdate]);
        },
      )
      .subscribe();

    const solutionsSubscription = supabase
      .channel(`solutions-channel-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "solutions",
          filter: `issue_id=eq.${issueId}`,
        },
        async (payload) => {
          console.log("Solution change received:", payload);
          // Refetch all solutions on any change
          const { data, error } = await supabase
            .from("solutions")
            .select(
              "*, profiles!solutions_proposed_by_fkey(full_name, avatar_url)",
            )
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true });

          if (error) {
            console.error("Error fetching solutions:", error);
            return;
          }

          const formattedSolutions = data.map((solution) => ({
            id: solution.id,
            title: solution.title,
            description: solution.description,
            estimatedCost: solution.estimated_cost,
            votes: solution.votes,
            status: solution.status,
            date: new Date(solution.created_at).toLocaleDateString(),
            proposedBy: {
              name: solution.profiles?.full_name || "Unknown",
              avatar:
                solution.profiles?.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${solution.proposed_by}`,
            },
            proposed_by: solution.proposed_by,
          }));

          setSolutions(formattedSolutions);
        },
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(commentsSubscription);
      supabase.removeChannel(updatesSubscription);
      supabase.removeChannel(solutionsSubscription);
    };
  }, [issueId, user, toast]);

  // Handle like/unlike
  const handleToggleLike = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to support this issue",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistic update
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setVoteCount((prev) =>
        newLikedState ? prev + 1 : Math.max(0, prev - 1),
      );

      // Update database
      await toggleIssueVote(issueId, user.id, isLiked);

      toast({
        title: newLikedState ? "Issue Supported" : "Support Removed",
        description: newLikedState
          ? "You are now supporting this issue"
          : "You have removed your support from this issue",
        variant: "default",
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setVoteCount((prev) => (!isLiked ? prev + 1 : Math.max(0, prev - 1)));

      toast({
        title: "Error",
        description: "Failed to update support. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle watch/unwatch
  const handleToggleWatch = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to watch this issue",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistic update
      const newWatchedState = !isWatched;
      setIsWatched(newWatchedState);
      setWatchCount((prev) =>
        newWatchedState ? prev + 1 : Math.max(0, prev - 1),
      );

      // Update database
      await toggleIssueWatch(issueId, user.id, isWatched);

      toast({
        title: newWatchedState ? "Now Watching" : "Stopped Watching",
        description: newWatchedState
          ? "You will receive notifications about this issue"
          : "You will no longer receive notifications about this issue",
        variant: "default",
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsWatched(!isWatched);
      setWatchCount((prev) => (!isWatched ? prev + 1 : Math.max(0, prev - 1)));

      toast({
        title: "Error",
        description: "Failed to update watch status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle adding a comment
  const handleAddComment = async (content: string) => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to comment.",
        variant: "destructive",
      });
      return false;
    }

    if (!content.trim()) return false;

    try {
      console.log(
        "Adding comment to issue:",
        issueId,
        "with content:",
        content,
      );
      const data = await addComment(issueId, user.id, content);
      console.log("Comment added successfully:", data);

      // The comment will be added via the realtime subscription
      // but we can also add it optimistically
      const newComment = {
        id: data.id,
        content: data.content,
        date: new Date().toLocaleDateString(),
        author: {
          name: profile.full_name || "User",
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        author_id: user.id,
      };

      setComments((prev) => [...prev, newComment]);

      toast({
        title: "Comment Posted",
        description: "Your comment has been posted successfully.",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle adding an update
  const handleAddUpdate = async (
    content: string,
    isAuthor: boolean,
    isOfficial: boolean,
  ) => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to post an update.",
        variant: "destructive",
      });
      return false;
    }

    if (!content.trim()) return false;

    // Allow the author or officials to post updates
    // Removed the permission check to allow issue creators to post updates

    try {
      console.log("Adding update to issue:", issueId, "with content:", content);
      const data = await addUpdate(issueId, user.id, content);
      console.log("Update added successfully:", data);

      // The update will be added via the realtime subscription
      // but we can also add it optimistically
      const newUpdate = {
        id: data.id,
        content: data.content,
        date: new Date().toLocaleDateString(),
        type: "status",
        author: {
          name: profile.full_name || "User",
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        author_id: user.id,
      };

      setUpdates((prev) => [...prev, newUpdate]);

      toast({
        title: "Update Posted",
        description: "Your update has been posted successfully.",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Error posting update:", error);
      toast({
        title: "Error",
        description: "Failed to post update. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Handle solution vote
  const handleSolutionVote = async (solutionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on solutions",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the solution
      const solution = solutions.find((s) => s.id === solutionId);
      if (!solution) return;

      console.log("Toggling vote for solution:", solutionId);
      // Check if user has already voted (client-side)
      const hasVoted = await toggleSolutionVote(solutionId, user.id);
      console.log("Vote toggled, new state:", hasVoted ? "voted" : "unvoted");

      // Update the local state optimistically
      setSolutions(
        solutions.map((solution) => {
          if (solution.id === solutionId) {
            return {
              ...solution,
              votes: hasVoted
                ? solution.votes + 1
                : Math.max(0, solution.votes - 1),
            };
          }
          return solution;
        }),
      );

      toast({
        title: hasVoted ? "Vote Added" : "Vote Removed",
        description: hasVoted
          ? "Your vote has been added to this solution"
          : "Your vote has been removed from this solution",
        variant: "default",
      });
    } catch (error) {
      console.error("Error voting on solution:", error);
      toast({
        title: "Error",
        description: "Failed to update vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle updating solution progress
  const handleUpdateSolutionProgress = async (
    solutionId: string,
    status: string,
    updateText: string,
  ) => {
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to update solution progress",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Find the solution
      const solution = solutions.find((s) => s.id === solutionId);
      if (!solution) return false;

      // Check if user is authorized (officials or solution proposer)
      if (profile.role !== "official" && solution.proposed_by !== user.id) {
        toast({
          title: "Permission Denied",
          description: "You don't have permission to update this solution.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Updating solution status:", solutionId, status, updateText);
      // Update the solution status
      await updateSolutionStatus(
        solutionId,
        user.id,
        status,
        updateText,
        issueId,
      );
      console.log("Solution status updated successfully");

      // Update the local state
      setSolutions(
        solutions.map((s) => {
          if (s.id === solutionId) {
            return { ...s, status };
          }
          return s;
        }),
      );

      // Add an update to the updates list
      const newUpdate = {
        id: Date.now(),
        content: `Solution status updated to ${status}: ${updateText}`,
        date: new Date().toLocaleDateString(),
        type: "solution",
        author: {
          name: profile.full_name || "User",
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        author_id: user.id,
      };

      setUpdates((prev) => [...prev, newUpdate]);

      toast({
        title: "Solution Updated",
        description: "The solution progress has been updated successfully.",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Error updating solution:", error);
      toast({
        title: "Error",
        description: "Failed to update solution. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    isLoading,
    isLiked,
    isWatched,
    voteCount,
    watchCount,
    comments,
    updates,
    solutions,
    handleToggleLike,
    handleToggleWatch,
    handleAddComment,
    handleAddUpdate,
    handleSolutionVote,
    handleUpdateSolutionProgress,
  };
};
