import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getReportData } from "@/lib/api/statsApi";
import {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast-enhanced";
import type { ReportData } from "@/types/supabase-extensions";

export type TimeframeType = "1m" | "3m" | "6m" | "1y";

/**
 * Custom hook for real-time reports data with automatic updates
 * @param initialTimeframe The initial timeframe to fetch data for (1m, 3m, 6m, 1y)
 * @returns Report data and state management functions
 */
export function useRealtimeReports(initialTimeframe: TimeframeType = "3m"): {
  timeframe: TimeframeType;
  setTimeframe: React.Dispatch<React.SetStateAction<TimeframeType>>;
  reportData: ReportData | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
} {
  const [timeframe, setTimeframe] = useState<TimeframeType>(initialTimeframe);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Fetch report data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getReportData(timeframe);
        setReportData(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Error fetching report data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch report data"),
        );
        toast({
          title: "Error loading reports",
          description: "Failed to load report data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, toast]);

  // Set up realtime subscription for data changes
  useEffect(() => {
    // Create a realtime channel for issues table changes
    const channel: RealtimeChannel = supabase
      .channel("reports-realtime-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issues" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log("Issue change detected in reports hook:", payload);
          // Refresh the data
          getReportData(timeframe)
            .then((data) => {
              setReportData(data);
              setLastUpdated(new Date());
              toast({
                title: "Reports Updated",
                description:
                  "The reports data has been refreshed with the latest changes.",
                variant: "default",
              });
            })
            .catch((err) => {
              console.error("Error refreshing report data:", err);
            });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Refresh the data when comments change
          getReportData(timeframe)
            .then((data) => {
              setReportData(data);
              setLastUpdated(new Date());
            })
            .catch((err) => {
              console.error("Error refreshing report data:", err);
            });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "issue_votes" },
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Refresh the data when votes change
          getReportData(timeframe)
            .then((data) => {
              setReportData(data);
              setLastUpdated(new Date());
            })
            .catch((err) => {
              console.error("Error refreshing report data:", err);
            });
        },
      )
      .subscribe((status, err) => {
        if (err) {
          console.error("Error setting up realtime subscription:", err);
          toast({
            title: "Realtime Error",
            description:
              "Failed to set up realtime updates. Some data may not refresh automatically.",
            variant: "destructive",
          });
        } else {
          console.log("Realtime subscription status:", status);
        }
      });

    // Cleanup function
    return () => {
      supabase.removeChannel(channel).catch((err) => {
        console.error("Error removing channel:", err);
      });
    };
  }, [timeframe, toast]);

  // Function to manually refresh the data
  const refreshData = async () => {
    try {
      setLoading(true);
      const data = await getReportData(timeframe);
      setReportData(data);
      setLastUpdated(new Date());
      toast({
        title: "Reports Refreshed",
        description: "The reports data has been manually refreshed.",
        variant: "default",
      });
    } catch (err) {
      console.error("Error refreshing report data:", err);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh report data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    timeframe,
    setTimeframe,
    reportData,
    loading,
    error,
    lastUpdated,
    refreshData,
  };
}
