import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    name: string;
    avatar: string;
  };
  [key: string]: any; // Allow for additional properties
}

export function useRealtimeComments(issueId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch comments for an issue
  const fetchComments = useCallback(async () => {
    if (!issueId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("comments")
        .select(
          `
          *,
          profiles:user_id (full_name, avatar_url)
        `,
        )
        .eq("issue_id", issueId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      // Transform the data to match the expected format
      const formattedComments =
        data?.map((comment) => ({
          ...comment,
          author: {
            name: comment.profiles?.full_name || "Anonymous",
            avatar:
              comment.profiles?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`,
          },
          // Format the date for display
          date: new Date(comment.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        })) || [];

      setComments(formattedComments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch comments"),
      );
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  // Set up realtime subscription
  useEffect(() => {
    if (!issueId) return;

    fetchComments();

    // Create a realtime channel
    const channel: RealtimeChannel = supabase
      .channel(`comments-for-issue-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `issue_id=eq.${issueId}`,
        },
        async (payload) => {
          console.log("New comment inserted:", payload);

          // Fetch the user profile for the new comment
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", payload.new.user_id)
            .single();

          if (profileError) {
            console.error(
              "Error fetching profile for new comment:",
              profileError,
            );
          }

          // Add the new comment to the state
          setComments((currentComments) => [
            ...currentComments,
            {
              ...payload.new,
              author: {
                name: profileData?.full_name || "Anonymous",
                avatar:
                  profileData?.avatar_url ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${payload.new.user_id}`,
              },
              date: new Date(payload.new.created_at).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
            },
          ]);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `issue_id=eq.${issueId}`,
        },
        (payload) => {
          console.log("Comment deleted:", payload);
          // Remove the comment from the state
          setComments((currentComments) =>
            currentComments.filter((comment) => comment.id !== payload.old.id),
          );
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.error(
            `Error setting up realtime subscription for issue ${issueId}:`,
            err,
          );
        } else {
          console.log(
            `Realtime subscription status for issue ${issueId}:`,
            status,
          );
        }
      });

    // Cleanup function
    return () => {
      supabase.removeChannel(channel).catch((err) => {
        console.error("Error removing channel:", err);
      });
    };
  }, [issueId, fetchComments]);

  // Function to add a new comment
  const addComment = useCallback(
    async (content: string) => {
      if (!issueId) return false;

      try {
        // Get the current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) throw new Error("User authentication required");

        // Insert the comment
        const { error: insertError } = await supabase.from("comments").insert({
          issue_id: issueId,
          user_id: user.id,
          content,
        });

        if (insertError) throw insertError;

        // The new comment will be added via the realtime subscription
        return true;
      } catch (err) {
        console.error("Error adding comment:", err);
        return false;
      }
    },
    [issueId],
  );

  // Function to delete a comment
  const deleteComment = useCallback(async (commentId: string) => {
    try {
      // Get the current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User authentication required");

      // Delete the comment (RLS policies will ensure the user can only delete their own comments)
      const { error: deleteError } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // The comment will be removed via the realtime subscription
      return true;
    } catch (err) {
      console.error("Error deleting comment:", err);
      return false;
    }
  }, []);

  return {
    comments,
    loading,
    error,
    addComment,
    deleteComment,
    refreshComments: fetchComments,
  };
}
