import { supabase } from "@/lib/supabase";
import type { PostgrestCountQueryResult } from "@/types/supabase-count";
import type { Database } from "@/types/supabase";

/**
 * Ensures that all required database tables exist
 */
export const ensureTablesExist = async () => {
  try {
    // Check if the tables exist by querying them
    const { error: issuesError } = await supabase
      .from("issues")
      .select("id")
      .limit(1);

    const { error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    const { error: commentsError } = await supabase
      .from("comments")
      .select("id")
      .limit(1);

    const { error: updatesError } = await supabase
      .from("updates")
      .select("id")
      .limit(1);

    const { error: solutionsError } = await supabase
      .from("solutions")
      .select("id")
      .limit(1);

    // Log any errors for debugging
    if (issuesError) console.warn("Issues table check:", issuesError.message);
    if (profilesError)
      console.warn("Profiles table check:", profilesError.message);
    if (commentsError)
      console.warn("Comments table check:", commentsError.message);
    if (updatesError)
      console.warn("Updates table check:", updatesError.message);
    if (solutionsError)
      console.warn("Solutions table check:", solutionsError.message);

    return {
      issuesExists: !issuesError,
      profilesExists: !profilesError,
      commentsExists: !commentsError,
      updatesExists: !updatesError,
      solutionsExists: !solutionsError,
    };
  } catch (error) {
    console.error("Error checking database tables:", error);
    throw error;
  }
};

/**
 * Get a single issue with all related data (comments, updates, solutions)
 */
export const getIssueWithDetails = async (issueId: string) => {
  try {
    // Get the issue
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();

    if (issueError) throw issueError;

    // Get comments for the issue
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*, profiles(full_name, avatar_url)")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (commentsError) throw commentsError;

    // Get updates for the issue
    const { data: updates, error: updatesError } = await supabase
      .from("updates")
      .select("*, profiles(full_name, avatar_url)")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (updatesError) throw updatesError;

    // Get solutions for the issue
    const { data: solutions, error: solutionsError } = await supabase
      .from("solutions")
      .select("*, profiles(full_name, avatar_url)")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (solutionsError) throw solutionsError;

    // Format the data for the frontend
    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      author_id: comment.author_id,
      profiles: comment.profiles,
    }));

    const formattedUpdates = updates.map((update) => ({
      id: update.id,
      content: update.content,
      created_at: update.created_at,
      author_id: update.author_id,
      type: update.type,
      profiles: update.profiles,
    }));

    const formattedSolutions = solutions.map((solution) => ({
      id: solution.id,
      title: solution.title,
      description: solution.description,
      created_at: solution.created_at,
      proposed_by: solution.proposed_by,
      estimated_cost: solution.estimated_cost,
      votes: solution.votes,
      status: solution.status,
      profiles: solution.profiles,
    }));

    return {
      issue,
      comments: formattedComments,
      updates: formattedUpdates,
      solutions: formattedSolutions,
    };
  } catch (error) {
    console.error("Error in getIssueWithDetails:", error);
    throw error;
  }
};

/**
 * Get issues with pagination
 */
export const getIssues = async (page = 1, limit = 10, filters = {}) => {
  try {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1;

    // Build the query
    let query = supabase
      .from("issues")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters if provided
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          query = query.eq(key, value);
        }
      });
    }

    // Get paginated results
    const { data, count, error } = await query.range(startIndex, endIndex);

    if (error) throw error;

    // Calculate total pages
    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("Error in getIssues:", error);
    throw error;
  }
};

/**
 * Set up realtime subscriptions for an issue
 */
export const setupIssueSubscriptions = (issueId: string, callbacks: any) => {
  const { onCommentAdded, onUpdateAdded, onSolutionChanged } = callbacks;

  // Subscribe to comments
  const commentsChannel = supabase
    .channel(`issue-comments-${issueId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `issue_id=eq.${issueId}`,
      },
      (payload) => {
        console.log("New comment received:", payload);
        if (onCommentAdded && payload.new) {
          // Get the author details
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", payload.new.author_id)
            .single()
            .then(({ data: profile }) => {
              const newComment = {
                ...payload.new,
                profiles: profile,
              };
              onCommentAdded(newComment);
            });
        }
      },
    )
    .subscribe();

  // Subscribe to updates
  const updatesChannel = supabase
    .channel(`issue-updates-${issueId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "updates",
        filter: `issue_id=eq.${issueId}`,
      },
      (payload) => {
        console.log("New update received:", payload);
        if (onUpdateAdded && payload.new) {
          // Get the author details
          supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", payload.new.author_id)
            .single()
            .then(({ data: profile }) => {
              const newUpdate = {
                ...payload.new,
                profiles: profile,
              };
              onUpdateAdded(newUpdate);
            });
        }
      },
    )
    .subscribe();

  // Subscribe to solutions
  const solutionsChannel = supabase
    .channel(`issue-solutions-${issueId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "solutions",
        filter: `issue_id=eq.${issueId}`,
      },
      () => {
        console.log("Solutions changed, fetching updated solutions");
        if (onSolutionChanged) {
          // Fetch all solutions for this issue
          supabase
            .from("solutions")
            .select("*, profiles(full_name, avatar_url)")
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true })
            .then(({ data: solutions }) => {
              if (solutions) {
                const formattedSolutions = solutions.map((solution) => ({
                  id: solution.id,
                  title: solution.title,
                  description: solution.description,
                  created_at: solution.created_at,
                  proposed_by: solution.proposed_by,
                  estimated_cost: solution.estimated_cost,
                  votes: solution.votes,
                  status: solution.status,
                  profiles: solution.profiles,
                }));
                onSolutionChanged(formattedSolutions);
              }
            });
        }
      },
    )
    .subscribe();

  // Return a cleanup function
  return () => {
    supabase.removeChannel(commentsChannel);
    supabase.removeChannel(updatesChannel);
    supabase.removeChannel(solutionsChannel);
  };
};
