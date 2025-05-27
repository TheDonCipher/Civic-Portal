import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  location?: string;
  constituency?: string;
  votes?: number;
  thumbnail?: string;
  thumbnails?: string[];
  department_id?: string;
  [key: string]: any; // Allow for additional properties
}

interface UseRealtimeIssuesOptions {
  initialIssues?: Issue[];
  filters?: Record<string, any>;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export function useRealtimeIssues(options: UseRealtimeIssuesOptions = {}) {
  const {
    initialIssues = [],
    filters = {},
    limit = 20,
    sortBy = "created_at",
    sortDirection = "desc",
  } = options;

  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to fetch issues with filters
  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("issues")
        .select("*")
        .order(sortBy, { ascending: sortDirection === "asc" })
        .limit(limit);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (key === "search" && typeof value === "string") {
            // Handle search filter specially
            query = query.or(
              `title.ilike.%${value}%,description.ilike.%${value}%`,
            );
          } else {
            query = query.eq(key, value);
          }
        }
      });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setIssues(data || []);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch issues"),
      );
    } finally {
      setLoading(false);
    }
  }, [filters, limit, sortBy, sortDirection]);

  // Set up realtime subscription with proper cleanup
  useEffect(() => {
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    const setupSubscription = async () => {
      try {
        // Only fetch if component is still mounted
        if (isMounted) {
          await fetchIssues();
        }

        // Create a realtime channel with unique identifier
        const channelName = `issues-${JSON.stringify(filters)}-${limit}`;
        channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "issues" },
            (payload) => {
              if (!isMounted) return;

              console.log("New issue inserted:", payload);
              // Add the new issue to the state if it matches our filters
              setIssues((currentIssues) => {
                // Check if we're at the limit and need to remove the oldest issue
                const newIssues = [...currentIssues];
                if (newIssues.length >= limit) {
                  // Remove the last issue if sorted by created_at desc
                  newIssues.pop();
                }
                return [payload.new as Issue, ...newIssues];
              });
            },
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "issues" },
            (payload) => {
              if (!isMounted) return;

              console.log("Issue updated:", payload);
              // Update the issue in the state
              setIssues((currentIssues) =>
                currentIssues.map((issue) =>
                  issue.id === payload.new.id
                    ? { ...issue, ...payload.new }
                    : issue,
                ),
              );
            },
          )
          .on(
            "postgres_changes",
            { event: "DELETE", schema: "public", table: "issues" },
            (payload) => {
              if (!isMounted) return;

              console.log("Issue deleted:", payload);
              // Remove the issue from the state
              setIssues((currentIssues) =>
                currentIssues.filter((issue) => issue.id !== payload.old.id),
              );
            },
          )
          .subscribe((status, err) => {
            if (!isMounted) return;

            if (err) {
              console.error("Error setting up realtime subscription:", err);
              setError(new Error("Failed to setup real-time updates"));
            } else {
              console.log("Realtime subscription status:", status);
            }
          });
      } catch (err) {
        if (isMounted) {
          console.error("Error in subscription setup:", err);
          setError(err instanceof Error ? err : new Error("Subscription setup failed"));
        }
      }
    };

    setupSubscription();

    // ✅ Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
      if (channel) {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [filters, limit, sortBy, sortDirection, fetchIssues]);

  // Function to refresh issues
  const refreshIssues = useCallback(() => {
    fetchIssues();
  }, [fetchIssues]);

  return { issues, loading, error, refreshIssues };
}
