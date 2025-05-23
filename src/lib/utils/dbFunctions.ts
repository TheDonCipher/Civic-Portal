import { supabase } from "@/lib/supabase";
import { IssueSubscriptionOptions } from "@/types/supabase-extensions";

/**
 * Database utility functions for the application
 */

/**
 * Ensures that all required tables exist in the database
 */
export const ensureTablesExist = async (): Promise<boolean> => {
  try {
    // Check if the issues table exists by querying it
    const { error: issuesError } = await supabase
      .from("issues")
      .select("id")
      .limit(1);

    if (issuesError && issuesError.code === "PGRST116") {
      console.error("Issues table does not exist:", issuesError);
      return false;
    }

    // Check if the profiles table exists
    const { error: profilesError } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (profilesError && profilesError.code === "PGRST116") {
      console.error("Profiles table does not exist:", profilesError);
      return false;
    }

    // Check if the comments table exists
    const { error: commentsError } = await supabase
      .from("comments")
      .select("id")
      .limit(1);

    if (commentsError && commentsError.code === "PGRST116") {
      console.error("Comments table does not exist:", commentsError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking database tables:", error);
    return false;
  }
};

/**
 * Get an issue with all its related details
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
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (commentsError) throw commentsError;

    // Get updates for the issue
    const { data: updates, error: updatesError } = await supabase
      .from("updates")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (updatesError) throw updatesError;

    // Get solutions for the issue
    const { data: solutions, error: solutionsError } = await supabase
      .from("solutions")
      .select("*")
      .eq("issue_id", issueId)
      .order("created_at", { ascending: true });

    if (solutionsError) throw solutionsError;

    return {
      issue,
      comments: comments || [],
      updates: updates || [],
      solutions: solutions || [],
    };
  } catch (error) {
    console.error("Error fetching issue details:", error);
    throw error;
  }
};

/**
 * Get issues with optional filtering
 */
export const getIssues = async (
  category,
  status,
  constituency,
  search,
  sortBy = "created_at",
  sortOrder = "desc",
  _limit = 10,
  offset = 0,
  page: number = 1,
  limit: number = 10,
  filters?: {
    category?: string;
    status?: string;
    constituency?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  },
) => {
  try {
    // Use the typed limit parameter from function arguments
    const calculatedOffset = (page - 1) * limit;
    let query = supabase.from("issues").select("*", { count: "exact" });

    // Apply filters if provided
    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.constituency) {
      query = query.eq("constituency", filters.constituency);
    }

    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
      );
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "created_at";
    const sortOrder = filters?.sortOrder || "desc";
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(calculatedOffset, calculatedOffset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  } catch (error) {
    console.error("Error fetching issues:", error);
    throw error;
  }
};

/**
 * Set up realtime subscriptions for issues
 * @param issueId - Optional issue ID to filter changes
 * @param options - Subscription options with callbacks
 */
export const setupIssueSubscriptions = (
  issueId?: string,
  options?: IssueSubscriptionOptions,
) => {
  const channels = [];

  // Issues channel
  const issuesFilter = issueId ? `id=eq.${issueId}` : undefined;
  const issuesChannel = supabase
    .channel(`issues-channel-${issueId || "all"}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "issues", filter: issuesFilter },
      (payload) => {
        console.log("Issues change:", payload);
        if (options?.onIssueUpdated) {
          options.onIssueUpdated(payload.new);
        }
      },
    )
    .subscribe();

  channels.push(issuesChannel);

  // If specific issue ID is provided, subscribe to related tables
  if (issueId) {
    // Comments channel
    const commentsChannel = supabase
      .channel(`comments-channel-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `issue_id=eq.${issueId}`,
        },
        (payload) => {
          console.log("New comment:", payload);
          if (options?.onCommentAdded) {
            options.onCommentAdded(payload.new);
          }
        },
      )
      .subscribe();

    channels.push(commentsChannel);

    // Updates channel
    const updatesChannel = supabase
      .channel(`updates-channel-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "updates",
          filter: `issue_id=eq.${issueId}`,
        },
        (payload) => {
          console.log("New update:", payload);
          if (options?.onUpdateAdded) {
            options.onUpdateAdded(payload.new);
          }
        },
      )
      .subscribe();

    channels.push(updatesChannel);

    // Solutions channel
    const solutionsChannel = supabase
      .channel(`solutions-channel-${issueId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "solutions",
          filter: `issue_id=eq.${issueId}`,
        },
        (payload) => {
          console.log("Solution change:", payload);
          if (options?.onSolutionAdded && payload.eventType === "INSERT") {
            options.onSolutionAdded(payload.new);
          }
        },
      )
      .subscribe();

    channels.push(solutionsChannel);
  }

  // Return cleanup function
  return () => {
    channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
  };
};
