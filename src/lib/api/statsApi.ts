import { supabase } from '@/lib/supabase';
import type { PostgrestCountQueryResult } from '@/types/supabase-count';
import type { ReportData } from '@/types/supabase-extensions';
import { handleApiError } from '@/lib/utils/errorHandler';
import type { DashboardStats } from '@/types/enhanced';

export const getReportData = async (
  timeframe?: string
): Promise<ReportData | null> => {
  try {
    console.log('Fetching report data for timeframe:', timeframe);

    // Generate comprehensive report data using enhanced database functions and queries
    const reportData: ReportData = {
      id: 'generated-report',
      title: 'Civic Portal Analytics Report',
      description: 'Comprehensive analytics and reporting on civic issues and government response',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: 'system',
      department_id: 'all',
      status: 'published',
      data: {},
      type: 'monthly',
      period: timeframe || '6m',
    };

    // Get issues by category
    const { data: categoryData, error: categoryError } = await supabase
      .from('issues')
      .select('category')
      .then(async (result) => {
        if (result.error) return result;

        const categoryStats = result.data?.reduce((acc: any[], issue: any) => {
          const existing = acc.find(item => item.name === issue.category);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({ name: issue.category, value: 1, previousValue: 0 });
          }
          return acc;
        }, []) || [];

        return { data: categoryStats, error: null };
      });

    // Get issues by status
    const { data: statusData, error: statusError } = await supabase
      .from('issues')
      .select('status')
      .then(async (result) => {
        if (result.error) return result;

        const statusStats = result.data?.reduce((acc: any[], issue: any) => {
          const existing = acc.find(item => item.name === issue.status);
          if (existing) {
            existing.value += 1;
          } else {
            acc.push({ name: issue.status, value: 1, previousValue: 0 });
          }
          return acc;
        }, []) || [];

        return { data: statusStats, error: null };
      });

    // Get monthly trends using enhanced RPC function
    const monthsBack = timeframe === '1m' ? 1 : timeframe === '3m' ? 3 : timeframe === '6m' ? 6 : 12;
    console.log('Fetching monthly stats for months back:', monthsBack);

    const { data: monthlyData, error: monthlyError } = await supabase
      .rpc('get_monthly_issue_stats', { months_back: monthsBack });

    if (monthlyError) {
      console.error('Error fetching monthly stats:', monthlyError);
    } else {
      console.log('Monthly data fetched:', monthlyData?.length || 0, 'records');
    }

    // Get comprehensive dashboard statistics using enhanced RPC function
    console.log('Fetching dashboard stats...');
    const { data: dashboardStats, error: dashboardError } = await supabase
      .rpc('get_dashboard_stats');

    if (dashboardError) {
      console.error('Error fetching dashboard stats:', dashboardError);
    } else {
      console.log('Dashboard stats fetched successfully');
    }

    // Extract department performance from dashboard stats
    const deptData = dashboardStats?.department_performance || [];

    // Get budget allocation data from enhanced budget_allocations table
    console.log('Fetching budget allocation data...');
    const currentYear = new Date().getFullYear();
    const { data: budgetRawData, error: budgetError } = await supabase
      .from('budget_allocations')
      .select(`
        category,
        allocated_amount,
        spent_amount,
        departments (
          name
        )
      `)
      .eq('fiscal_year', currentYear);

    if (budgetError) {
      console.error('Error fetching budget data:', budgetError);
    } else {
      console.log('Budget data fetched:', budgetRawData?.length || 0, 'records');
    }

    // Transform budget data for reports
    const budgetData = budgetRawData?.map((item: any) => ({
      category: item.category,
      allocated: item.allocated_amount,
      spent: item.spent_amount,
      department: item.departments?.name || 'Unknown'
    })) || [];

    // Get citizen engagement data (mock for now, can be enhanced with real data)
    const citizenEngagement = Array.from({ length: monthsBack }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        votes: Math.floor(Math.random() * 100) + 50,
        comments: Math.floor(Math.random() * 80) + 30,
        satisfaction: Math.floor(Math.random() * 20) + 75
      };
    }).reverse();

    // Assemble the enhanced report data with real database information
    console.log('Assembling report data...');

    reportData.issuesByCategory = categoryData || [];
    reportData.issuesByStatus = statusData || [];

    // Enhanced monthly trends with real response time data
    reportData.monthlyTrends = monthlyData?.map((item: any) => ({
      month: item.month,
      issues: item.created,
      resolved: item.resolved,
      responseTime: item.response_time || 0
    })) || [];

    // Enhanced department performance with real resolution rates
    reportData.departmentPerformance = deptData?.map((item: any) => ({
      name: item.department,
      resolutionRate: item.resolution_rate || 0,
      avgResponseDays: item.avg_response_days || 0,
      totalIssues: item.total_issues || 0,
      resolvedIssues: item.resolved_issues || 0
    })) || [];

    reportData.budgetAllocation = budgetData || [];
    reportData.citizenEngagement = citizenEngagement;

    console.log('Report data assembled successfully:', {
      categories: reportData.issuesByCategory?.length || 0,
      statuses: reportData.issuesByStatus?.length || 0,
      monthlyTrends: reportData.monthlyTrends?.length || 0,
      departments: reportData.departmentPerformance?.length || 0,
      budgetItems: reportData.budgetAllocation?.length || 0
    });

    return reportData;
  } catch (error) {
    console.error('Error generating report data:', error);
    // Return fallback mock data
    return {
      id: 'mock-report',
      title: 'Monthly Performance Report',
      description: 'Overview of civic issues and their resolution status',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author_id: 'system',
      department_id: 'all',
      status: 'published',
      data: {},
      type: 'monthly',
      period: timeframe || '6m',
      issuesByCategory: [
        { name: 'infrastructure', value: 25, previousValue: 20 },
        { name: 'health', value: 18, previousValue: 15 },
        { name: 'education', value: 15, previousValue: 12 },
        { name: 'utilities', value: 12, previousValue: 10 }
      ],
      issuesByStatus: [
        { name: 'open', value: 30, previousValue: 25 },
        { name: 'in_progress', value: 20, previousValue: 18 },
        { name: 'resolved', value: 35, previousValue: 30 },
        { name: 'closed', value: 15, previousValue: 12 }
      ],
      monthlyTrends: [
        { month: 'Jan 2024', issues: 45, resolved: 30, responseTime: 3.2 },
        { month: 'Feb 2024', issues: 52, resolved: 35, responseTime: 2.8 },
        { month: 'Mar 2024', issues: 48, resolved: 40, responseTime: 2.5 }
      ],
      departmentPerformance: [
        { name: 'Health', resolutionRate: 85, avgResponseDays: 2.5 },
        { name: 'Transport and Infrastructure', resolutionRate: 78, avgResponseDays: 4.2 },
        { name: 'Education', resolutionRate: 92, avgResponseDays: 1.8 }
      ],
      budgetAllocation: [
        { category: 'Road Maintenance', allocated: 5000000, spent: 3200000 },
        { category: 'Health Services', allocated: 8000000, spent: 6500000 },
        { category: 'Education', allocated: 4500000, spent: 3800000 }
      ],
      citizenEngagement: [
        { month: 'Jan 2024', votes: 85, comments: 65, satisfaction: 78 },
        { month: 'Feb 2024', votes: 92, comments: 72, satisfaction: 82 },
        { month: 'Mar 2024', votes: 88, comments: 68, satisfaction: 80 }
      ]
    };
  }
};

export const getOverallStats = async () => {
  try {
    console.log('Fetching enhanced overall stats using RPC functions...');

    try {
      // Use enhanced RPC function for comprehensive dashboard statistics
      const { data: dashboardStats, error: dashboardError } = await supabase
        .rpc('get_dashboard_stats');

      if (dashboardError) {
        console.error('Error fetching dashboard stats via RPC:', dashboardError);
        throw dashboardError;
      }

      console.log('Dashboard stats from RPC:', dashboardStats);

      // Extract core statistics from RPC response
      const totalIssues = dashboardStats?.total_issues || 0;
      const openIssues = dashboardStats?.open_issues || 0;
      const inProgressIssues = dashboardStats?.in_progress_issues || 0;
      const resolvedIssues = dashboardStats?.resolved_issues || 0;
      const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

      // Get enhanced constituency data with better performance
      let constituencyData = [];
      try {
        const { data, error: constituencyError } = await supabase
          .from('issues')
          .select('constituency, status')
          .not('constituency', 'is', null);

        if (constituencyError) {
          console.error('Error fetching constituency data:', constituencyError);
        } else {
          constituencyData = data || [];
        }
      } catch (constituencyFetchError) {
        console.error('Failed to fetch constituency data:', constituencyFetchError);
      }

      // Get enhanced issue data for trending analysis
      let issuesData = [];
      try {
        const { data, error: issuesError } = await supabase
          .from('issues')
          .select(`
            id,
            title,
            category,
            constituency,
            created_at,
            vote_count,
            comment_count
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (issuesError) {
          console.error('Error fetching issues data:', issuesError);
        } else {
          issuesData = data || [];
        }
      } catch (fetchError) {
        console.error('Failed to fetch issues:', fetchError);
      }

      // Process constituency data for rankings
      const constituencyMap: Record<string, { issues: number; resolved: number }> = {};
      constituencyData?.forEach((issue: any) => {
        if (issue.constituency) {
          if (!constituencyMap[issue.constituency]) {
            constituencyMap[issue.constituency] = { issues: 0, resolved: 0 };
          }
          constituencyMap[issue.constituency].issues++;
          if (issue.status === 'resolved') {
            constituencyMap[issue.constituency].resolved++;
          }
        }
      });

      // Convert to array and sort by issue count
      const constituencyRankings = Object.entries(constituencyMap)
        .map(([name, data]) => ({
          name,
          issues: data.issues,
          resolved: data.resolved,
        }))
        .sort((a, b) => b.issues - a.issues)
        .slice(0, 5);

      // Get trending issues using enhanced engagement metrics
      const trendingIssues = (issuesData || []).slice(0, 3).map((issue: any) => ({
        title: issue.title || 'Untitled Issue',
        category: issue.category || 'Uncategorized',
        engagement: (issue.vote_count || 0) + (issue.comment_count || 0),
        constituency: issue.constituency || 'Unknown',
      }));

      // Calculate average response time using first_response_at
      let avgResponseTime = '4.2 days';
      try {
        const { data: responseTimeData, error: responseError } = await supabase
          .from('issues')
          .select('created_at, first_response_at')
          .not('first_response_at', 'is', null)
          .limit(100);

        if (!responseError && responseTimeData?.length > 0) {
          const responseTimes = responseTimeData.map((issue: any) => {
            const created = new Date(issue.created_at);
            const responded = new Date(issue.first_response_at);
            return (responded.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
          });

          const avgDays = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
          avgResponseTime = `${avgDays.toFixed(1)} days`;
        }
      } catch (responseTimeError) {
        console.error('Error calculating response time:', responseTimeError);
      }

      // Calculate enhanced engagement metrics
      const totalVotes = issuesData.reduce((sum: number, issue: any) => sum + (issue.vote_count || 0), 0);
      const totalComments = issuesData.reduce((sum: number, issue: any) => sum + (issue.comment_count || 0), 0);
      const votesPerIssue = issuesData.length > 0 ? Math.round(totalVotes / issuesData.length) : 0;
      const commentsPerIssue = issuesData.length > 0 ? Math.round(totalComments / issuesData.length) : 0;

      // Return enhanced data with real database metrics
      console.log('Returning enhanced overall stats:', {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        resolutionRate,
        avgResponseTime,
        constituencyCount: constituencyRankings.length,
        trendingCount: trendingIssues.length
      });

      return {
        totalIssues,
        openIssues,
        inProgressIssues,
        resolvedIssues,
        resolutionRate,
        avgResponseTime,
        activeUsers: Math.round(totalIssues * 1.5), // Estimated based on issue activity
        departmentPerformance: resolutionRate, // Use actual resolution rate
        constituencyRankings,
        engagementStats: {
          votesPerIssue,
          commentsPerIssue,
          trendingIssues,
        },
        fundingStats: {
          totalRaised: 250000, // Mock data - can be enhanced with budget_allocations
          targetAmount: 500000,
          recentDonations: [
            {
              amount: 15000,
              project: 'Road Repair Project',
              date: '2 days ago',
              provider: {
                name: 'John D.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
              },
            },
            {
              amount: 8500,
              project: 'Park Cleanup',
              date: '5 days ago',
              provider: {
                name: 'Sarah M.',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
              },
            },
          ],
        },
      };
    } catch (supabaseError) {
      console.error(
        'Error in Supabase queries, using fallback data',
        supabaseError
      );
      throw supabaseError; // Throw to use fallback data
    }
  } catch (error) {
    console.error('Error fetching overall stats:', error);
    // Fall back to mock data if there's an error
    return {
      totalIssues: 104,
      openIssues: 25,
      inProgressIssues: 11,
      resolvedIssues: 68,
      resolutionRate: 65,
      avgResponseTime: '4.2 days',
      activeUsers: 325,
      departmentPerformance: 78,
      constituencyRankings: [
        { name: 'Central', issues: 42, resolved: 28 },
        { name: 'North', issues: 35, resolved: 20 },
        { name: 'South', issues: 27, resolved: 15 },
      ],
      engagementStats: {
        votesPerIssue: 8,
        commentsPerIssue: 5,
        trendingIssues: [
          {
            title: 'Pothole on Main Street',
            category: 'Infrastructure',
            engagement: 35,
            constituency: 'Central',
          },
          {
            title: 'Broken Streetlight',
            category: 'Safety',
            engagement: 28,
            constituency: 'North',
          },
          {
            title: 'Park Cleanup',
            category: 'Environment',
            engagement: 22,
            constituency: 'South',
          },
        ],
      },
      fundingStats: {
        totalRaised: 250000,
        targetAmount: 500000,
        recentDonations: [
          {
            amount: 15000,
            project: 'Road Repair Project',
            date: '2 days ago',
            provider: {
              name: 'John D.',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            },
          },
          {
            amount: 8500,
            project: 'Park Cleanup',
            date: '5 days ago',
            provider: {
              name: 'Sarah M.',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            },
          },
        ],
      },
    };
  }
};

/**
 * Get budget allocation data for departments
 */
export const getBudgetAllocations = async (departmentId?: string, fiscalYear?: number) => {
  try {
    console.log('Fetching budget allocations...', { departmentId, fiscalYear });

    let query = supabase
      .from('budget_allocations')
      .select(`
        *,
        departments (
          id,
          name
        )
      `);

    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    if (fiscalYear) {
      query = query.eq('fiscal_year', fiscalYear);
    } else {
      query = query.eq('fiscal_year', new Date().getFullYear());
    }

    const { data, error } = await query.order('category');

    if (error) {
      console.error('Error fetching budget allocations:', error);
      throw error;
    }

    console.log('Budget allocations fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error) {
    console.error('Error in getBudgetAllocations:', error);
    throw error;
  }
};

/**
 * Get satisfaction ratings for issues
 */
export const getSatisfactionRatings = async (issueId?: string) => {
  try {
    console.log('Fetching satisfaction ratings...', { issueId });

    let query = supabase
      .from('satisfaction_ratings')
      .select(`
        *,
        issues (
          id,
          title,
          category
        ),
        profiles (
          id,
          full_name
        )
      `);

    if (issueId) {
      query = query.eq('issue_id', issueId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching satisfaction ratings:', error);
      throw error;
    }

    console.log('Satisfaction ratings fetched:', data?.length || 0, 'records');
    return data || [];
  } catch (error) {
    console.error('Error in getSatisfactionRatings:', error);
    throw error;
  }
};

/**
 * Create a satisfaction rating
 */
export const createSatisfactionRating = async (
  issueId: string,
  userId: string,
  rating: number,
  feedback?: string
) => {
  try {
    console.log('Creating satisfaction rating...', { issueId, userId, rating });

    const { data, error } = await supabase
      .from('satisfaction_ratings')
      .insert({
        issue_id: issueId,
        user_id: userId,
        rating,
        feedback,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating satisfaction rating:', error);
      throw error;
    }

    console.log('Satisfaction rating created successfully');
    return data;
  } catch (error) {
    console.error('Error in createSatisfactionRating:', error);
    throw error;
  }
};

/**
 * Get department-specific statistics
 */
export const getDepartmentStats = async (departmentId: string) => {
  try {
    console.log('Fetching department-specific stats...', { departmentId });

    // Get issues for the department
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('department_id', departmentId);

    if (issuesError) {
      console.error('Error fetching department issues:', issuesError);
      throw issuesError;
    }

    // Get budget allocations for the department
    const budgetData = await getBudgetAllocations(departmentId);

    // Calculate department statistics
    const totalIssues = issues?.length || 0;
    const openIssues = issues?.filter(issue => issue.status === 'open').length || 0;
    const inProgressIssues = issues?.filter(issue => issue.status === 'in_progress').length || 0;
    const resolvedIssues = issues?.filter(issue => issue.status === 'resolved').length || 0;
    const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

    // Calculate average response time for the department
    const issuesWithResponse = issues?.filter(issue => issue.first_response_at) || [];
    let avgResponseTime = 0;

    if (issuesWithResponse.length > 0) {
      const responseTimes = issuesWithResponse.map(issue => {
        const created = new Date(issue.created_at);
        const responded = new Date(issue.first_response_at);
        return (responded.getTime() - created.getTime()) / (1000 * 60 * 60 * 24); // days
      });
      avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    }

    // Calculate budget utilization
    const totalAllocated = budgetData.reduce((sum, item) => sum + (item.allocated_amount || 0), 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + (item.spent_amount || 0), 0);
    const budgetUtilization = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

    const stats = {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      resolutionRate,
      avgResponseTime: avgResponseTime.toFixed(1),
      budgetAllocated: totalAllocated,
      budgetSpent: totalSpent,
      budgetUtilization,
      monthlyResolved: Math.floor(resolvedIssues * 0.3) // Estimate for last 30 days
    };

    console.log('Department stats calculated:', stats);
    return stats;
  } catch (error) {
    console.error('Error in getDepartmentStats:', error);
    throw error;
  }
};