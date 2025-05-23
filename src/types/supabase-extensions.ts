// Extended types for Supabase data

export interface ReportData {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  author_id: string;
  department_id: string;
  status: string;
  data: any; // JSON data for the report
  type: string;
  period: string; // e.g., "daily", "weekly", "monthly"
  // Additional properties used in reports
  issuesByCategory?: any[];
  issuesByStatus?: any[];
  monthlyTrends?: any[];
  citizenEngagement?: any[];
  departmentPerformance?: any[];
  budgetAllocation?: any[];
  // Additional properties for stats
  totalIssues?: number;
  resolutionRate?: number;
  avgResponseTime?: string;
  resolvedIssues?: number;
  activeUsers?: number;
  constituencyRankings?: Array<{
    name?: string;
    issues?: number;
    resolved?: number;
  }>;
  engagementStats?: {
    votesPerIssue?: number;
    commentsPerIssue?: number;
    trendingIssues?: Array<{
      title?: string;
      category?: string;
      engagement?: number;
      constituency?: string;
    }>;
  };
  fundingStats?: {
    totalRaised?: number;
    targetAmount?: number;
    recentDonations?: Array<{
      amount?: number;
      project?: string;
      date?: string;
      provider?: {
        name?: string;
        avatar?: string;
      };
    }>;
  };
}

export interface MonthlyData {
  month: string;
  created: number;
  resolved: number;
  responseTime?: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  department_id: string;
}

export interface IssueSubscriptionOptions {
  onCommentAdded?: (comment: any) => void;
  onUpdateAdded?: (update: any) => void;
  onSolutionAdded?: (solution: any) => void;
  onIssueUpdated?: (issue: any) => void;
}

export interface ProfileData {
  avatar_url: string | null;
  constituency: string | null;
  created_at: string;
  full_name: string | null;
  id: string;
  role: string | null;
  updated_at: string;
  username: string | null;
  email?: string | null;
}
