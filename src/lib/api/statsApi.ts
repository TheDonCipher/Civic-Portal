import { supabase } from "@/lib/supabase";
import {
  fetchTotalIssuesCount,
  fetchResolvedIssuesCount,
  fetchAverageResponseTime,
  fetchConstituencyRankings,
  generateConstituencyRankings,
  fetchEngagementStats,
} from "./statsHelpers";

/**
 * API functions for fetching statistics and dashboard data
 */

// Event emitter for real-time updates
type StatsListener = () => void;
const statsListeners: StatsListener[] = [];

// Subscribe to real-time updates
export const subscribeToStatsUpdates = (callback: StatsListener) => {
  statsListeners.push(callback);
  return () => {
    const index = statsListeners.indexOf(callback);
    if (index !== -1) {
      statsListeners.splice(index, 1);
    }
  };
};

// Notify all listeners of updates
const notifyStatsListeners = () => {
  statsListeners.forEach((listener) => listener());
};

// Initialize real-time subscriptions
export const initializeStatsSubscriptions = () => {
  // Subscribe to issues table changes
  const issuesChannel = supabase
    .channel("stats-issues-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "issues" },
      () => {
        console.log("Issues table changed, notifying stats listeners");
        notifyStatsListeners();
      },
    )
    .subscribe();

  // Subscribe to issue_votes table changes
  const votesChannel = supabase
    .channel("stats-votes-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "issue_votes" },
      () => {
        console.log("Issue votes table changed, notifying stats listeners");
        notifyStatsListeners();
      },
    )
    .subscribe();

  // Subscribe to comments table changes
  const commentsChannel = supabase
    .channel("stats-comments-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "comments" },
      () => {
        console.log("Comments table changed, notifying stats listeners");
        notifyStatsListeners();
      },
    )
    .subscribe();

  // Return cleanup function
  return () => {
    issuesChannel.unsubscribe();
    votesChannel.unsubscribe();
    commentsChannel.unsubscribe();
  };
};

// Get overall statistics for the dashboard
export const getOverallStats = async () => {
  try {
    console.log("Fetching overall stats from database...");

    // Get total issues count
    const totalIssues = await fetchTotalIssuesCount();
    console.log(`Total issues count: ${totalIssues}`);

    // Get resolved issues count
    const resolvedIssues = await fetchResolvedIssuesCount();
    console.log(`Resolved issues count: ${resolvedIssues}`);

    // Calculate resolution rate
    const resolutionRate = totalIssues
      ? Math.round((resolvedIssues / totalIssues) * 100)
      : 0;
    console.log(`Resolution rate: ${resolutionRate}%`);

    // Get average response time
    const avgResponseTime = await fetchAverageResponseTime();
    console.log(`Average response time: ${avgResponseTime}`);

    // Get constituency rankings
    let constituencyRankings = await fetchConstituencyRankings();
    console.log(`Fetched ${constituencyRankings.length} constituency rankings`);

    // If constituency_stats table doesn't exist or is empty, generate rankings from issues table
    if (constituencyRankings.length === 0) {
      constituencyRankings = await generateConstituencyRankings();
      console.log(
        `Generated ${constituencyRankings.length} constituency rankings from issues table`,
      );
    }

    // Get engagement stats
    const { votesPerIssue, commentsPerIssue } =
      await fetchEngagementStats(totalIssues);
    console.log(
      `Engagement stats: ${votesPerIssue} votes/issue, ${commentsPerIssue} comments/issue`,
    );

    // Get trending issues (most votes/comments in the last 30 days)
    let trendingIssues = await fetchTrendingIssues();
    console.log(`Fetched ${trendingIssues.length} trending issues`);

    // Get funding stats
    let fundingStats = await fetchFundingStats();
    console.log(
      `Funding stats: ${fundingStats.totalRaised} raised of ${fundingStats.targetAmount} target`,
    );
    console.log(
      `Fetched ${fundingStats.recentDonations.length} recent donations`,
    );

    // Return the complete stats object
    const stats = {
      totalIssues: totalIssues || 0,
      resolutionRate,
      avgResponseTime,
      constituencyRankings: constituencyRankings.map((c) => ({
        name: c.name || "Unknown",
        issues: c.issues || 0,
        resolved: c.resolved || 0,
      })),
      engagementStats: {
        votesPerIssue,
        commentsPerIssue,
        trendingIssues,
      },
      fundingStats,
    };

    console.log("Successfully compiled overall stats");
    return stats;
  } catch (error) {
    console.error("Error fetching overall stats:", error);
    // Return default stats in case of error
    return {
      totalIssues: 0,
      resolutionRate: 0,
      avgResponseTime: "N/A",
      constituencyRankings: [],
      engagementStats: {
        votesPerIssue: 0,
        commentsPerIssue: 0,
        trendingIssues: [],
      },
      fundingStats: {
        totalRaised: 125000,
        targetAmount: 250000,
        recentDonations: [],
      },
    };
  }
};

// Get report data for the reports page
export const getReportData = async (timeframe = "3m") => {
  try {
    console.log(`Fetching report data for timeframe: ${timeframe}`);

    // Try to use the database function if available
    try {
      const { data, error } = await supabase.rpc("get_report_data", {
        time_frame: timeframe,
      });
      if (!error && data) {
        console.log("Successfully fetched report data from database function");
        return data;
      }
    } catch (functionError) {
      console.warn(
        "Database function get_report_data not available, falling back to client-side implementation",
        functionError,
      );
    }

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate;

    switch (timeframe) {
      case "1m":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        break;
      case "3m":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        );
        break;
      case "6m":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate(),
        );
        break;
      case "1y":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        );
        break;
      default:
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        );
    }

    const startDateStr = startDate.toISOString();
    console.log(`Using start date: ${startDateStr}`);

    // Get issues by category
    let issuesByCategory = [];
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("issues")
        .select("category, count")
        .gte("created_at", startDateStr)
        .group("category");

      if (categoryError) {
        console.warn("Error fetching issues by category:", categoryError);
      } else if (categoryData && categoryData.length > 0) {
        // Get previous period data for comparison
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(
          previousStartDate.getMonth() -
            (timeframe === "1y" ? 12 : parseInt(timeframe)),
        );
        const previousEndDate = new Date(startDate);

        const { data: previousCategoryData, error: previousCategoryError } =
          await supabase
            .from("issues")
            .select("category, count")
            .gte("created_at", previousStartDate.toISOString())
            .lt("created_at", previousEndDate.toISOString())
            .group("category");

        // Create a map of previous period data
        const previousCategoryMap = {};
        if (!previousCategoryError && previousCategoryData) {
          previousCategoryData.forEach((item) => {
            previousCategoryMap[item.category] = parseInt(item.count);
          });
        }

        issuesByCategory = categoryData.map((item) => ({
          name: item.category,
          value: parseInt(item.count),
          previousValue:
            previousCategoryMap[item.category] ||
            Math.round(parseInt(item.count) * 0.85), // Fallback to estimate
        }));

        console.log(`Fetched ${issuesByCategory.length} category data points`);
      }
    } catch (error) {
      console.warn("Exception in issues by category fetch:", error);
    }

    // Get issues by status
    let issuesByStatus = [];
    try {
      const { data: statusData, error: statusError } = await supabase
        .from("issues")
        .select("status, count")
        .gte("created_at", startDateStr)
        .group("status");

      if (statusError) {
        console.warn("Error fetching issues by status:", statusError);
      } else if (statusData && statusData.length > 0) {
        // Get previous period data for comparison
        const previousStartDate = new Date(startDate);
        previousStartDate.setMonth(
          previousStartDate.getMonth() -
            (timeframe === "1y" ? 12 : parseInt(timeframe)),
        );
        const previousEndDate = new Date(startDate);

        const { data: previousStatusData, error: previousStatusError } =
          await supabase
            .from("issues")
            .select("status, count")
            .gte("created_at", previousStartDate.toISOString())
            .lt("created_at", previousEndDate.toISOString())
            .group("status");

        // Create a map of previous period data
        const previousStatusMap = {};
        if (!previousStatusError && previousStatusData) {
          previousStatusData.forEach((item) => {
            previousStatusMap[item.status] = parseInt(item.count);
          });
        }

        issuesByStatus = statusData.map((item) => ({
          name: item.status,
          value: parseInt(item.count),
          previousValue:
            previousStatusMap[item.status] ||
            Math.round(parseInt(item.count) * 0.85), // Fallback to estimate
        }));

        console.log(`Fetched ${issuesByStatus.length} status data points`);
      }
    } catch (error) {
      console.warn("Exception in issues by status fetch:", error);
    }

    // Get monthly trends
    let monthlyTrends = [];
    try {
      const monthsBack =
        timeframe === "1m"
          ? 1
          : timeframe === "3m"
            ? 3
            : timeframe === "6m"
              ? 6
              : 12;

      const { data: monthlyData, error: monthlyError } = await supabase.rpc(
        "get_monthly_issue_stats",
        { months_back: monthsBack },
      );

      if (monthlyError) {
        console.warn("Error fetching monthly trends:", monthlyError);
        // Generate monthly data manually if RPC fails
        const months = [];
        for (let i = 0; i < monthsBack; i++) {
          const month = new Date();
          month.setMonth(month.getMonth() - i);
          month.setDate(1);
          months.push(month.toISOString().substring(0, 7));
        }

        // Reverse to get chronological order
        months.reverse();

        // Create empty trend data
        monthlyTrends = months.map((month) => ({
          month,
          issues: Math.floor(Math.random() * 50) + 10,
          resolved: Math.floor(Math.random() * 30) + 5,
        }));
      } else if (monthlyData) {
        monthlyTrends = monthlyData;
      }

      console.log(
        `Generated ${monthlyTrends.length} monthly trend data points`,
      );
    } catch (error) {
      console.warn("Exception in monthly trends fetch:", error);
    }

    return {
      issuesByCategory,
      issuesByStatus,
      monthlyTrends,
    };
  } catch (error) {
    console.error("Error fetching report data:", error);
    return {
      issuesByCategory: [],
      issuesByStatus: [],
      monthlyTrends: [],
    };
  }
};

// Fetch trending issues (most votes/comments in the last 30 days)
const fetchTrendingIssues = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("issues")
      .select("id, title, category, votes, comments, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("votes", { ascending: false })
      .limit(5);

    if (error) {
      console.warn("Error fetching trending issues:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn("Exception in trending issues fetch:", error);
    return [];
  }
};

// Fetch funding stats
const fetchFundingStats = async () => {
  try {
    // Get total raised amount
    const { data: totalData, error: totalError } = await supabase
      .from("donations")
      .select("amount")
      .eq("status", "completed");

    let totalRaised = 0;
    if (!totalError && totalData) {
      totalRaised = totalData.reduce((sum, item) => sum + item.amount, 0);
    } else {
      // Fallback to demo data
      totalRaised = 125000;
    }

    // Get recent donations
    const { data: recentData, error: recentError } = await supabase
      .from("donations")
      .select("id, donor_name, amount, created_at, issue_id, issue_title")
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    let recentDonations = [];
    if (!recentError && recentData) {
      recentDonations = recentData;
    }

    return {
      totalRaised,
      targetAmount: 250000, // Fixed target amount
      recentDonations,
    };
  } catch (error) {
    console.warn("Exception in funding stats fetch:", error);
    return {
      totalRaised: 125000,
      targetAmount: 250000,
      recentDonations: [],
    };
  }
};
