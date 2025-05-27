/**
 * Test file for enhanced database integration
 * This file contains test functions to validate the enhanced API integration
 */

import { supabase } from '@/lib/supabase';
import { 
  getReportData, 
  getOverallStats, 
  getDepartmentStats, 
  getBudgetAllocations,
  getSatisfactionRatings,
  createSatisfactionRating
} from './statsApi';

/**
 * Test enhanced report data functionality
 */
export const testReportDataIntegration = async () => {
  console.log('🧪 Testing Enhanced Report Data Integration...');
  
  try {
    // Test different timeframes
    const timeframes = ['1m', '3m', '6m', '1y'];
    
    for (const timeframe of timeframes) {
      console.log(`📊 Testing ${timeframe} timeframe...`);
      const reportData = await getReportData(timeframe);
      
      if (reportData) {
        console.log(`✅ ${timeframe} report data:`, {
          categories: reportData.issuesByCategory?.length || 0,
          statuses: reportData.issuesByStatus?.length || 0,
          monthlyTrends: reportData.monthlyTrends?.length || 0,
          departments: reportData.departmentPerformance?.length || 0,
          budgetItems: reportData.budgetAllocation?.length || 0
        });
      } else {
        console.log(`❌ Failed to fetch ${timeframe} report data`);
      }
    }
  } catch (error) {
    console.error('❌ Report data test failed:', error);
  }
};

/**
 * Test enhanced overall statistics
 */
export const testOverallStatsIntegration = async () => {
  console.log('🧪 Testing Enhanced Overall Stats Integration...');
  
  try {
    const stats = await getOverallStats();
    
    console.log('✅ Overall stats:', {
      totalIssues: stats.totalIssues,
      openIssues: stats.openIssues,
      inProgressIssues: stats.inProgressIssues,
      resolvedIssues: stats.resolvedIssues,
      resolutionRate: stats.resolutionRate,
      avgResponseTime: stats.avgResponseTime,
      activeUsers: stats.activeUsers,
      constituencyCount: stats.constituencyRankings?.length || 0,
      trendingIssues: stats.engagementStats?.trendingIssues?.length || 0
    });
  } catch (error) {
    console.error('❌ Overall stats test failed:', error);
  }
};

/**
 * Test department-specific statistics
 */
export const testDepartmentStatsIntegration = async () => {
  console.log('🧪 Testing Department Stats Integration...');
  
  try {
    // Get list of departments first
    const { data: departments, error } = await supabase
      .from('departments')
      .select('id, name')
      .limit(3);

    if (error) {
      console.error('❌ Failed to fetch departments:', error);
      return;
    }

    if (!departments || departments.length === 0) {
      console.log('⚠️ No departments found for testing');
      return;
    }

    // Test stats for each department
    for (const dept of departments) {
      console.log(`📈 Testing stats for ${dept.name}...`);
      
      try {
        const deptStats = await getDepartmentStats(dept.id);
        
        console.log(`✅ ${dept.name} stats:`, {
          totalIssues: deptStats.totalIssues,
          resolutionRate: deptStats.resolutionRate,
          avgResponseTime: deptStats.avgResponseTime,
          budgetAllocated: deptStats.budgetAllocated,
          budgetSpent: deptStats.budgetSpent,
          budgetUtilization: deptStats.budgetUtilization
        });
      } catch (deptError) {
        console.error(`❌ Failed to get stats for ${dept.name}:`, deptError);
      }
    }
  } catch (error) {
    console.error('❌ Department stats test failed:', error);
  }
};

/**
 * Test budget allocations functionality
 */
export const testBudgetIntegration = async () => {
  console.log('🧪 Testing Budget Integration...');
  
  try {
    // Test getting all budget allocations
    const allBudgets = await getBudgetAllocations();
    console.log('✅ All budget allocations:', allBudgets?.length || 0, 'records');

    // Test getting budget for current year
    const currentYearBudgets = await getBudgetAllocations(undefined, new Date().getFullYear());
    console.log('✅ Current year budgets:', currentYearBudgets?.length || 0, 'records');

    // Test getting budget for specific department (if any exist)
    if (allBudgets && allBudgets.length > 0) {
      const firstDeptId = allBudgets[0].departments?.id;
      if (firstDeptId) {
        const deptBudgets = await getBudgetAllocations(firstDeptId);
        console.log(`✅ Department ${allBudgets[0].departments?.name} budgets:`, deptBudgets?.length || 0, 'records');
      }
    }
  } catch (error) {
    console.error('❌ Budget integration test failed:', error);
  }
};

/**
 * Test RPC functions directly
 */
export const testRPCFunctions = async () => {
  console.log('🧪 Testing RPC Functions...');
  
  try {
    // Test get_monthly_issue_stats
    console.log('📊 Testing get_monthly_issue_stats...');
    const { data: monthlyStats, error: monthlyError } = await supabase
      .rpc('get_monthly_issue_stats', { months_back: 6 });

    if (monthlyError) {
      console.error('❌ get_monthly_issue_stats failed:', monthlyError);
    } else {
      console.log('✅ Monthly stats:', monthlyStats?.length || 0, 'records');
    }

    // Test get_dashboard_stats
    console.log('📊 Testing get_dashboard_stats...');
    const { data: dashboardStats, error: dashboardError } = await supabase
      .rpc('get_dashboard_stats');

    if (dashboardError) {
      console.error('❌ get_dashboard_stats failed:', dashboardError);
    } else {
      console.log('✅ Dashboard stats:', dashboardStats ? 'success' : 'no data');
    }
  } catch (error) {
    console.error('❌ RPC functions test failed:', error);
  }
};

/**
 * Run all integration tests
 */
export const runAllIntegrationTests = async () => {
  console.log('🚀 Starting Enhanced Database Integration Tests...');
  console.log('================================================');
  
  await testRPCFunctions();
  console.log('');
  
  await testReportDataIntegration();
  console.log('');
  
  await testOverallStatsIntegration();
  console.log('');
  
  await testDepartmentStatsIntegration();
  console.log('');
  
  await testBudgetIntegration();
  console.log('');
  
  console.log('✅ All integration tests completed!');
  console.log('================================================');
};

// Export individual test functions for selective testing
export {
  testReportDataIntegration as testReports,
  testOverallStatsIntegration as testStats,
  testDepartmentStatsIntegration as testDepartments,
  testBudgetIntegration as testBudgets,
  testRPCFunctions as testRPC
};
