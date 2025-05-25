import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  demoUsers,
  demoIssues,
  demoComments,
  demoSolutions,
  demoUpdates,
  demoStats,
  demoUserActivity,
  demoUserStats,
  getDemoIssueData,
  getDemoUserData,
  getDemoDepartmentData,
} from '@/lib/demoData';

interface DemoContextType {
  isDemoMode: boolean;
  demoUser: any | null;
  setDemoUser: (user: any) => void;
  getDemoIssues: () => any[];
  getDemoIssue: (id: string) => any | null;
  getDemoUser: (id: string) => any | null;
  getDemoDepartment: (id: string) => any | null;
  getDemoStats: () => any;
  getDemoUserActivity: (userId: string) => any[];
  getDemoUserStats: (userId: string) => any;
  toggleDemoMode: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoMode = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoMode must be used within a DemoProvider');
  }
  return context;
};

interface DemoProviderProps {
  children: React.ReactNode;
}

export const DemoProvider: React.FC<DemoProviderProps> = ({ children }) => {
  const location = useLocation();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoUser, setDemoUser] = useState<any | null>(null);

  // Check if we're in demo mode based on URL
  useEffect(() => {
    const isDemo =
      location.pathname.startsWith('/demo') ||
      location.search.includes('demo=true');
    setIsDemoMode(isDemo);

    // Set default demo user if in demo mode and no user is set
    if (isDemo && !demoUser) {
      setDemoUser(demoUsers[0]); // Default to first citizen user
    }
  }, [location, demoUser]);

  const getDemoIssues = () => {
    return demoIssues.map((issue) => ({
      ...issue,
      // Format author data for IssueCard component
      author: {
        name: issue.author_name,
        avatar: issue.author_avatar,
      },
      // Format date for IssueCard component
      date: issue.created_at,
      // Format watchers count
      watchers: issue.watchers_count || 0,
      // Add formatted comments
      comments: demoComments
        .filter((c) => c.issue_id === issue.id)
        .map((comment) => ({
          id: parseInt(comment.id.split('-')[2]) || 1,
          author: {
            name: comment.author_name,
            avatar: comment.author_avatar,
          },
          content: comment.content,
          date: comment.created_at,
        })),
      solutions: demoSolutions.filter((s) => s.issue_id === issue.id),
      updates: demoUpdates.filter((u) => u.issue_id === issue.id),
    }));
  };

  const getDemoIssue = (id: string) => {
    return getDemoIssueData(id);
  };

  const getDemoUserFunc = (id: string) => {
    return getDemoUserData(id);
  };

  const getDemoDepartment = (id: string) => {
    return getDemoDepartmentData(id);
  };

  const getDemoStatsFunc = () => {
    return demoStats;
  };

  const getDemoUserActivityFunc = (userId: string) => {
    return demoUserActivity.filter((activity) => activity.user_id === userId);
  };

  const getDemoUserStatsFunc = (userId: string) => {
    return (
      demoUserStats[userId] || {
        issuesCreated: 0,
        issuesWatching: 0,
        commentsPosted: 0,
        issuesSupported: 0,
        solutionsProposed: 0,
      }
    );
  };

  const toggleDemoMode = () => {
    setIsDemoMode(!isDemoMode);
    if (!isDemoMode) {
      setDemoUser(demoUsers[0]);
    } else {
      setDemoUser(null);
    }
  };

  const value: DemoContextType = {
    isDemoMode,
    demoUser,
    setDemoUser,
    getDemoIssues,
    getDemoIssue,
    getDemoUser: getDemoUserFunc,
    getDemoDepartment,
    getDemoStats: getDemoStatsFunc,
    getDemoUserActivity: getDemoUserActivityFunc,
    getDemoUserStats: getDemoUserStatsFunc,
    toggleDemoMode,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};
