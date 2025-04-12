import type { Database } from "./supabase";
import type { Json } from "./supabase";

// Extend the Database interface to include additional tables
export interface ExtendedDatabase extends Database {
  Tables: Database["Tables"] & {
    constituency_stats: {
      Row: {
        id: string;
        name: string;
        issues: number;
        resolved: number;
        constituency: string;
        created_at: string;
      };
      Insert: {
        id?: string;
        name: string;
        issues: number;
        resolved: number;
        constituency: string;
        created_at?: string;
      };
      Update: {
        id?: string;
        name?: string;
        issues?: number;
        resolved?: number;
        constituency?: string;
        created_at?: string;
      };
      Relationships: [];
    };
    funding_stats: {
      Row: {
        id: string;
        total_raised: number;
        target_amount: number;
        created_at: string;
      };
      Insert: {
        id?: string;
        total_raised: number;
        target_amount: number;
        created_at?: string;
      };
      Update: {
        id?: string;
        total_raised?: number;
        target_amount?: number;
        created_at?: string;
      };
      Relationships: [];
    };
    donations: {
      Row: {
        id: string;
        amount: number;
        project: string;
        provider_name: string;
        provider_avatar: string;
        created_at: string;
        status: string;
        donor_name?: string;
        issue_id?: string;
        issue_title?: string;
      };
      Insert: {
        id?: string;
        amount: number;
        project: string;
        provider_name?: string;
        provider_avatar?: string;
        created_at?: string;
        status?: string;
        donor_name?: string;
        issue_id?: string;
        issue_title?: string;
      };
      Update: {
        id?: string;
        amount?: number;
        project?: string;
        provider_name?: string;
        provider_avatar?: string;
        created_at?: string;
        status?: string;
        donor_name?: string;
        issue_id?: string;
        issue_title?: string;
      };
      Relationships: [];
    };
  };
  Views: Database["Views"] & {};
  Functions: Database["Functions"] & {
    get_report_data: {
      Args: { time_frame?: string };
      Returns: {
        issuesByCategory: Array<{
          name: string;
          value: number;
          previousValue: number;
        }>;
        issuesByStatus: Array<{
          name: string;
          value: number;
          previousValue: number;
        }>;
        monthlyTrends: Array<{
          month: string;
          issues: number;
          resolved: number;
          responseTime?: number;
        }>;
        departmentPerformance?: any[];
        budgetAllocation?: any[];
        citizenEngagement?: any[];
      };
    };
    get_monthly_issue_stats: {
      Args: { months_back?: number };
      Returns: Array<{
        month: string;
        issues: number;
        resolved: number;
      }>;
    };
    get_average_response_time: {
      Args: Record<string, unknown>;
      Returns: number;
    };
    get_average_votes_per_issue: {
      Args: Record<string, unknown>;
      Returns: number;
    };
    get_average_comments_per_issue: {
      Args: Record<string, unknown>;
      Returns: number;
    };
    increment_watchers_count: {
      Args: { issue_id: string };
      Returns: number;
    };
    decrement_watchers_count: {
      Args: { issue_id: string };
      Returns: number;
    };
    increment_votes_count: {
      Args: { issue_id: string };
      Returns: number;
    };
    decrement_votes_count: {
      Args: { issue_id: string };
      Returns: number;
    };
    increment_issue_votes: {
      Args: { issue_id: string };
      Returns: number;
    };
    decrement_issue_votes: {
      Args: { issue_id: string };
      Returns: number;
    };
    increment_issue_watchers: {
      Args: { issue_id: string };
      Returns: number;
    };
    decrement_issue_watchers: {
      Args: { issue_id: string };
      Returns: number;
    };
    increment_solution_votes: {
      Args: { solution_id: string };
      Returns: number;
    };
    decrement_solution_votes: {
      Args: { solution_id: string };
      Returns: number;
    };
    get_user_issues: {
      Args: { user_id: string };
      Returns: any[];
    };
  };
  Enums: Database["Enums"] & {};
  CompositeTypes: Database["CompositeTypes"] & {};
}

// Helper type for profiles array issue
export type ProfileData = {
  full_name: string;
  avatar_url: string;
};

// Helper function to safely access profile data
export function getProfileData(profiles: any): ProfileData {
  if (!profiles) {
    return {
      full_name: "Unknown",
      avatar_url: "",
    };
  }

  // If profiles is an array, get the first item
  if (Array.isArray(profiles)) {
    const profile = profiles[0];
    return {
      full_name: profile?.full_name || "Unknown",
      avatar_url: profile?.avatar_url || "",
    };
  }

  // If profiles is an object
  return {
    full_name: profiles.full_name || "Unknown",
    avatar_url: profiles.avatar_url || "",
  };
}

// Define ReportData interface
export interface ReportData {
  issuesByCategory: Array<{
    name: string;
    value: number;
    previousValue: number;
  }>;
  issuesByStatus: Array<{
    name: string;
    value: number;
    previousValue: number;
  }>;
  monthlyTrends: Array<MonthlyTrendItem>;
  departmentPerformance?: Array<{
    name: string;
    resolutionRate: number;
    avgResponseDays: number;
  }>;
  budgetAllocation?: Array<{
    category: string;
    allocated: number;
    spent: number;
  }>;
  citizenEngagement?: Array<{
    month: string;
    votes: number;
    comments: number;
    satisfaction: number;
  }>;
}

export interface MonthlyTrendItem {
  month: string;
  issues: number;
  resolved: number;
  responseTime?: number;
}

// Define constituency stats interface
export interface ConstituencyStats {
  name: string;
  issues: number;
  resolved: number;
}

// Define funding stats interface
export interface FundingStats {
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
