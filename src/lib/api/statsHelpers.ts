import { supabase } from "@/lib/supabase";

/**
 * Helper functions for fetching trending issues data
 */
export const fetchTrendingIssues = async (): Promise<
  Array<{
    title: string;
    category: string;
    engagement: number;
    constituency: string;
  }>
> => {
  let trendingIssues: Array<{
    title: string;
    category: string;
    engagement: number;
    constituency: string;
  }> = [];
  try {
    const { data: trendingData, error: trendingError } = await supabase
      .from("issues")
      .select("id, title, category, constituency, votes, created_at")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order("votes", { ascending: false })
      .limit(5);

    if (trendingError) {
      console.warn("Error fetching trending issues:", trendingError);
    } else {
      // For each issue, get comment count
      const issuesWithComments = await Promise.all(
        (trendingData || []).map(async (issue) => {
          const { count, error } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("issue_id", issue.id || "");

          return {
            ...issue,
            comments_count: error ? 0 : count || 0,
          };
        }),
      );

      trendingIssues = issuesWithComments.map((issue) => ({
        title: issue.title || "",
        category: issue.category || "",
        engagement: (issue.votes || 0) + (issue.comments_count || 0),
        constituency: issue.constituency || "Unknown",
      }));
    }
  } catch (error) {
    console.warn("Exception in trending issues fetch:", error);
  }
  return trendingIssues;
};

/**
 * Helper function for fetching funding statistics
 */
export const fetchFundingStats = async (): Promise<{
  totalRaised: number;
  targetAmount: number;
  recentDonations: Array<{
    amount: number;
    project: string;
    date: string;
    provider: {
      name: string;
      avatar: string;
    };
  }>;
}> => {
  interface FundingStats {
    totalRaised: number;
    targetAmount: number;
    recentDonations: Array<{
      amount: number;
      project: string;
      date: string;
      provider: {
        name: string;
        avatar: string;
      };
    }>;
  }

  let fundingStats: FundingStats = {
    totalRaised: 125000, // Default values
    targetAmount: 250000,
    recentDonations: [],
  };

  try {
    const { data: fundingData, error: fundingError } = await supabase
      .from("funding_stats")
      .select("*")
      .single();

    if (fundingError && fundingError.code !== "PGRST116") {
      console.warn("Error fetching funding stats:", fundingError);
    } else if (fundingData) {
      fundingStats.totalRaised = fundingData.total_raised || 125000;
      fundingStats.targetAmount = fundingData.target_amount || 250000;
    }

    // Get recent donations
    const { data: donationsData, error: donationsError } = await supabase
      .from("donations")
      .select("amount, project, created_at, provider_name, provider_avatar")
      .order("created_at", { ascending: false })
      .limit(5);

    if (donationsError && donationsError.code !== "PGRST116") {
      console.warn("Error fetching recent donations:", donationsError);
    } else if (donationsData) {
      fundingStats.recentDonations = donationsData.map((donation) => ({
        amount: donation.amount || 0,
        project: donation.project || "Unknown Project",
        date: donation.created_at
          ? new Date(donation.created_at).toISOString().split("T")[0]
          : "",
        provider: {
          name: donation.provider_name || "Anonymous",
          avatar:
            donation.provider_avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${donation.provider_name || "anonymous"}`,
        },
      }));
    }
  } catch (error) {
    console.warn("Exception in funding stats fetch:", error);
  }

  return fundingStats;
};

/**
 * Helper function for fetching total issues count
 */
export const fetchTotalIssuesCount = async () => {
  const { count, error } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true });

  if (error) {
    console.error("Error fetching total issues count:", error);
    throw error;
  }

  return count || 0;
};

/**
 * Helper function for fetching resolved issues count
 */
export const fetchResolvedIssuesCount = async () => {
  const { count, error } = await supabase
    .from("issues")
    .select("*", { count: "exact", head: true })
    .eq("status", "resolved");

  if (error) {
    console.error("Error fetching resolved issues count:", error);
    throw error;
  }

  return count || 0;
};

/**
 * Helper function for fetching average response time
 */
export const fetchAverageResponseTime = async () => {
  try {
    const { data, error } = await supabase.rpc("get_average_response_time");

    if (error) {
      console.warn("Error fetching average response time:", error);
      return "N/A";
    }

    return data !== null ? `${data.toFixed(1)} days` : "N/A";
  } catch (error) {
    console.warn("Exception in average response time calculation:", error);
    return "N/A";
  }
};

/**
 * Helper function for fetching constituency rankings
 */
export const fetchConstituencyRankings = async () => {
  try {
    const { data, error } = await supabase
      .from("constituency_stats")
      .select("*")
      .order("issues", { ascending: false })
      .limit(5);

    if (error) {
      console.warn("Error fetching constituency rankings:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.warn("Exception in constituency rankings fetch:", error);
    return [];
  }
};

/**
 * Helper function for generating constituency rankings from issues table
 */
export const generateConstituencyRankings = async () => {
  try {
    // Get constituencies with issue counts
    const { data: constituencyCounts, error: constituencyCountsError } =
      await supabase
        .from("issues")
        .select("constituency, count")
        .not("constituency", "is", null)
        .group("constituency")
        .order("count", { ascending: false })
        .limit(5);

    if (constituencyCountsError) {
      console.warn(
        "Error fetching constituency counts:",
        constituencyCountsError,
      );
      return [];
    }

    if (!constituencyCounts || constituencyCounts.length === 0) {
      return [];
    }

    // Get resolved issues per constituency
    const resolvedPromises = constituencyCounts.map(async (item) => {
      if (!item.constituency) {
        return {
          name: "Unknown",
          issues: parseInt(item.count?.toString() || "0"),
          resolved: 0,
        };
      }

      const { count, error } = await supabase
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("constituency", item.constituency)
        .eq("status", "resolved");

      return {
        name: item.constituency,
        issues: parseInt(item.count?.toString() || "0"),
        resolved: error ? 0 : count || 0,
      };
    });

    return await Promise.all(resolvedPromises);
  } catch (error) {
    console.warn("Exception in constituency rankings generation:", error);
    return [];
  }
};

/**
 * Helper function for fetching engagement statistics
 */
export const fetchEngagementStats = async (totalIssues: number) => {
  let votesPerIssue = 0;
  let commentsPerIssue = 0;

  try {
    // Try to get average votes per issue
    const { data: votesData, error: votesError } = await supabase.rpc(
      "get_average_votes_per_issue",
    );

    if (votesError) {
      console.warn("Error fetching average votes per issue:", votesError);
      // Calculate manually if RPC fails
      const { data: totalVotes, error: totalVotesError } = await supabase
        .from("issue_votes")
        .select("*", { count: "exact", head: true });

      if (!totalVotesError && totalIssues > 0) {
        votesPerIssue = Math.round((totalVotes || 0) / totalIssues);
      }
    } else {
      votesPerIssue = votesData || 0;
    }

    // Try to get average comments per issue
    const { data: commentsData, error: commentsError } = await supabase.rpc(
      "get_average_comments_per_issue",
    );

    if (commentsError) {
      console.warn("Error fetching average comments per issue:", commentsError);
      // Calculate manually if RPC fails
      const { data: totalComments, error: totalCommentsError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true });

      if (!totalCommentsError && totalIssues > 0) {
        commentsPerIssue = Math.round((totalComments || 0) / totalIssues);
      }
    } else {
      commentsPerIssue = commentsData || 0;
    }

    return { votesPerIssue, commentsPerIssue };
  } catch (error) {
    console.warn("Exception in engagement stats calculation:", error);
    return { votesPerIssue: 0, commentsPerIssue: 0 };
  }
};
