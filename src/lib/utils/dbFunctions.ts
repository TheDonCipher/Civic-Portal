import { supabase } from "@/lib/supabase";

/**
 * Database utility functions for the issue tracking system
 */

// Ensure all required tables exist
export const ensureTablesExist = async (): Promise<boolean> => {
  try {
    // Check if the profiles table exists
    const { data: profilesExists, error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profilesError && profilesError.code !== "PGRST116") {
      console.error("Error checking profiles table:", profilesError);
    }

    // Check if the issues table exists
    const { data: issuesExists, error: issuesError } = await supabase
      .from("issues")
      .select("id")
      .limit(1);

    if (issuesError && issuesError.code !== "PGRST116") {
      console.error("Error checking issues table:", issuesError);
    }

    // Check if the issue_watchers table exists
    const { data: watchersExists, error: watchersError } = await supabase
      .from("issue_watchers")
      .select("issue_id")
      .limit(1);

    if (watchersError && watchersError.code !== "PGRST116") {
      console.error("Error checking issue_watchers table:", watchersError);
    }

    // Check if the comments table exists
    const { data: commentsExists, error: commentsError } = await supabase
      .from("comments")
      .select("id")
      .limit(1);

    if (commentsError && commentsError.code !== "PGRST116") {
      console.error("Error checking comments table:", commentsError);
    }

    // Check if the solutions table exists
    const { data: solutionsExists, error: solutionsError } = await supabase
      .from("solutions")
      .select("id")
      .limit(1);

    if (solutionsError && solutionsError.code !== "PGRST116") {
      console.error("Error checking solutions table:", solutionsError);
    }

    // Check if the updates table exists
    const { data: updatesExists, error: updatesError } = await supabase
      .from("updates")
      .select("id")
      .limit(1);

    if (updatesError && updatesError.code !== "PGRST116") {
      console.error("Error checking updates table:", updatesError);
    }

    console.log("Database tables verified successfully");
    return true;
  } catch (error) {
    console.error("Error verifying database tables:", error);
    return false;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { data: null, error };
  }
};

// Get issues created by a user
export const getUserIssues = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching user issues:", error);
    return { data: null, error };
  }
};

// Get issues a user is watching
export const getWatchedIssues = async (userId: string) => {
  try {
    const { data: watchingData, error: watchingError } = await supabase
      .from("issue_watchers")
      .select("issue_id")
      .eq("user_id", userId);

    if (watchingError) throw watchingError;

    if (!watchingData || watchingData.length === 0) {
      return { data: [], error: null };
    }

    const issueIds = watchingData.map((w) => w.issue_id);
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .in("id", issueIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching watched issues:", error);
    return { data: null, error };
  }
};

// Get issues resolved by a user (for officials)
export const getResolvedIssues = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("resolved_by", userId)
      .order("resolved_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching resolved issues:", error);
    return { data: null, error };
  }
};

// Toggle watching an issue
export const toggleWatchIssue = async (issueId: string, userId: string) => {
  try {
    // Check if the user is already watching this issue
    const { data: existingWatch, error: checkError } = await supabase
      .from("issue_watchers")
      .select("*")
      .eq("issue_id", issueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingWatch) {
      // User is already watching, so unwatch
      const { error: deleteError } = await supabase
        .from("issue_watchers")
        .delete()
        .eq("issue_id", issueId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Decrement the watchers count
      const { error: updateError } = await supabase.rpc(
        "decrement_watchers_count",
        { issue_id: issueId },
      );

      if (updateError) throw updateError;

      return { watching: false, error: null };
    } else {
      // User is not watching, so add watch
      const { error: insertError } = await supabase
        .from("issue_watchers")
        .insert({
          issue_id: issueId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Increment the watchers count
      const { error: updateError } = await supabase.rpc(
        "increment_watchers_count",
        { issue_id: issueId },
      );

      if (updateError) throw updateError;

      return { watching: true, error: null };
    }
  } catch (error) {
    console.error("Error toggling watch status:", error);
    return { watching: false, error };
  }
};

// Toggle voting for an issue
export const toggleVoteIssue = async (issueId: string, userId: string) => {
  try {
    // Check if the user has already voted for this issue
    const { data: existingVote, error: checkError } = await supabase
      .from("issue_votes")
      .select("*")
      .eq("issue_id", issueId)
      .eq("user_id", userId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existingVote) {
      // User has already voted, so remove vote
      const { error: deleteError } = await supabase
        .from("issue_votes")
        .delete()
        .eq("issue_id", issueId)
        .eq("user_id", userId);

      if (deleteError) throw deleteError;

      // Decrement the votes count
      const { error: updateError } = await supabase.rpc(
        "decrement_votes_count",
        { issue_id: issueId },
      );

      if (updateError) throw updateError;

      return { voted: false, error: null };
    } else {
      // User has not voted, so add vote
      const { error: insertError } = await supabase.from("issue_votes").insert({
        issue_id: issueId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      // Increment the votes count
      const { error: updateError } = await supabase.rpc(
        "increment_votes_count",
        { issue_id: issueId },
      );

      if (updateError) throw updateError;

      return { voted: true, error: null };
    }
  } catch (error) {
    console.error("Error toggling vote status:", error);
    return { voted: false, error };
  }
};

// Get issue by ID with all related data
export const getIssueWithDetails = async (issueId: string) => {
  try {
    if (!issueId) {
      console.error(
        "getIssueWithDetails called with invalid issueId:",
        issueId,
      );
      throw new Error("Invalid issue ID");
    }

    console.log("Fetching issue details for ID:", issueId);

    // Add a small delay to ensure database consistency
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get the issue
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();

    if (issueError) {
      console.error("Error fetching issue:", issueError);
      throw issueError;
    }

    if (!issue) {
      console.error("Issue not found with ID:", issueId);
      throw new Error("Issue not found");
    }

    console.log("Successfully fetched issue:", issue.id, issue.title);

    // Get comments
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*, profiles!comments_author_id_fkey(full_name, avatar_url)")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.error("Error fetching comments:", commentsError);
      throw commentsError;
    }

    console.log(`Fetched ${comments.length} comments for issue ${issueId}`);

    // Get updates
    const { data: updates, error: updatesError } = await supabase
      .from("updates")
      .select("*, profiles!updates_author_id_fkey(full_name, avatar_url)")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (updatesError) {
      console.error("Error fetching updates:", updatesError);
      throw updatesError;
    }

    console.log(`Fetched ${updates.length} updates for issue ${issueId}`);

    // Get solutions
    const { data: solutions, error: solutionsError } = await supabase
      .from("solutions")
      .select("*, profiles!solutions_proposed_by_fkey(full_name, avatar_url)")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (solutionsError) {
      console.error("Error fetching solutions:", solutionsError);
      throw solutionsError;
    }

    console.log(`Fetched ${solutions.length} solutions for issue ${issueId}`);

    // Format the data
    const formattedComments = comments.map((comment) => ({
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

    const formattedUpdates = updates.map((update) => ({
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

    const formattedSolutions = solutions.map((solution) => ({
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

    return {
      issue,
      comments: formattedComments,
      updates: formattedUpdates,
      solutions: formattedSolutions,
    };
  } catch (error) {
    console.error("Error getting issue with details:", error);
    throw error;
  }
};

// Get all issues with pagination and optimized search
export const getIssues = async (page = 1, limit = 10, filters = {}) => {
  try {
    let query = supabase.from("issues").select("*", { count: "exact" });

    // Apply filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          if (key === "search" && typeof value === "string") {
            // Use full-text search for better performance if search_vector exists
            if (value.trim().length > 0) {
              try {
                // Use text search for better performance
                query = query.textSearch("search_vector", value, {
                  type: "websearch",
                  config: "english",
                });
              } catch (e) {
                // Fallback to ILIKE if text search fails
                console.warn("Falling back to ILIKE search:", e);
                query = query.or(
                  `title.ilike.%${value}%,description.ilike.%${value}%`,
                );
              }
            }
          } else if (Array.isArray(value) && value.length > 0) {
            // Handle array filters like categories
            query = query.in(key, value);
          } else if (typeof value === "string" && value.trim() !== "") {
            // Handle string filters
            query = query.eq(key, value);
          }
        }
      });
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data,
      count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Error getting issues:", error);
    throw error;
  }
};

// Setup realtime subscriptions for an issue
export const setupIssueSubscriptions = (
  issueId: string,
  callbacks: {
    onCommentAdded?: (comment: any) => void;
    onUpdateAdded?: (update: any) => void;
    onSolutionChanged?: (solution: any) => void;
  },
) => {
  // Subscribe to comments
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
        if (callbacks.onCommentAdded) {
          // Fetch the comment with author details
          const { data, error } = await supabase
            .from("comments")
            .select(
              "*, profiles!comments_author_id_fkey(full_name, avatar_url)",
            )
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            const formattedComment = {
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
            callbacks.onCommentAdded(formattedComment);
          }
        }
      },
    )
    .subscribe();

  // Subscribe to updates
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
        if (callbacks.onUpdateAdded) {
          // Fetch the update with author details
          const { data, error } = await supabase
            .from("updates")
            .select("*, profiles!updates_author_id_fkey(full_name, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (!error && data) {
            const formattedUpdate = {
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
            callbacks.onUpdateAdded(formattedUpdate);
          }
        }
      },
    )
    .subscribe();

  // Subscribe to solutions
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
        if (callbacks.onSolutionChanged) {
          // Fetch all solutions on any change
          const { data, error } = await supabase
            .from("solutions")
            .select(
              "*, profiles!solutions_proposed_by_fkey(full_name, avatar_url)",
            )
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true });

          if (!error && data) {
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
            callbacks.onSolutionChanged(formattedSolutions);
          }
        }
      },
    )
    .subscribe();

  // Return a cleanup function
  return () => {
    supabase.removeChannel(commentsSubscription);
    supabase.removeChannel(updatesSubscription);
    supabase.removeChannel(solutionsSubscription);
  };
};
