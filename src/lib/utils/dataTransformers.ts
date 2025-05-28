/**
 * Data transformation utilities for converting database types to UI-safe types
 * Handles null date conversion and ensures type safety across the application
 */

import { safeDate, formatters, uiDateConverter } from './dateUtils';
import type {
  Issue,
  Comment,
  Solution,
  Update,
  Profile,
  UIIssue,
  UIComment,
  UISolution,
  UIUpdate
} from '@/types/enhanced';

// ✅ Core transformation functions
export const transformers = {
  /**
   * Converts database Issue to UI-safe UIIssue with enhanced schema support
   */
  toUIIssue: (issue: Issue & {
    profiles?: Profile | null;
    departments?: any | null;
    _count?: any;
  }): UIIssue => {
    const safeCreatedAt = safeDate.toString(issue.created_at);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status as 'draft' | 'open' | 'in_progress' | 'resolved' | 'closed',
      priority: issue.priority as 'low' | 'medium' | 'high' | 'urgent' | undefined,
      votes: issue.votes || 0, // Legacy field for backward compatibility
      vote_count: issue.vote_count || 0,
      comment_count: issue.comment_count || 0,
      view_count: issue.view_count || 0,
      comments: [], // Will be populated separately
      date: safeCreatedAt, // Always a string
      author: {
        name: issue.profiles?.full_name || (issue as any).author_name || 'Unknown User',
        avatar: issue.profiles?.avatar_url || '' // Will be dynamically fetched by getUserAvatarUrl
      },
      author_id: issue.author_id,
      thumbnail: (issue as any).thumbnail || (issue as any).thumbnails?.[0] || '',
      location: issue.location || '',
      constituency: issue.constituency || '',
      watchers: (issue as any).watchers_count || 0, // Legacy field
      watchers_count: (issue as any).watchers_count || 0,
      created_at: safeCreatedAt,
      updated_at: safeDate.toString(issue.updated_at),
      resolved_at: issue.resolved_at ? safeDate.toString(issue.resolved_at) : null,
      resolved_by: issue.resolved_by || null,
      first_response_at: issue.first_response_at ? safeDate.toString(issue.first_response_at) : null,
      assigned_to: issue.assigned_to || null,
      department_id: issue.department_id || null,
      department: issue.departments ? {
        id: issue.departments.id,
        name: issue.departments.name,
        description: issue.departments.description || undefined,
      } : null,
      tags: issue.tags || [],
      attachments: issue.attachments || [],
      metadata: issue.metadata || {},
    };
  },

  /**
   * Converts database Comment to UI-safe UIComment with enhanced schema support
   */
  toUIComment: (comment: Comment & { profiles?: Profile | null }): UIComment => {
    return {
      id: comment.id,
      content: comment.content,
      author_id: comment.author_id,
      issue_id: comment.issue_id,
      is_official: comment.is_official || false,
      parent_id: comment.parent_id || null,
      attachments: comment.attachments || [],
      created_at: safeDate.toString(comment.created_at),
      updated_at: safeDate.toString(comment.updated_at),
      profiles: comment.profiles ? {
        full_name: comment.profiles.full_name,
        avatar_url: comment.profiles.avatar_url,
        role: comment.profiles.role,
      } : null,
    };
  },

  /**
   * Converts database Solution to UI-safe UISolution with enhanced schema support
   */
  toUISolution: (solution: Solution & {
    profiles?: Profile | null;
    user_voted?: boolean;
    user_vote_type?: 'up' | 'down' | null;
  }): UISolution => {
    return {
      id: solution.id,
      title: solution.title,
      description: solution.description,
      implementation_plan: solution.implementation_plan || undefined,
      estimated_cost: solution.estimated_cost || undefined,
      estimated_timeline: solution.estimated_timeline || undefined,
      vote_count: solution.vote_count || 0,
      is_official: solution.is_official || false,
      status: solution.status as 'proposed' | 'under_review' | 'approved' | 'rejected' | 'implemented',
      created_at: safeDate.toString(solution.created_at),
      updated_at: safeDate.toString(solution.updated_at),
      author_id: solution.author_id,
      issue_id: solution.issue_id,
      profiles: solution.profiles ? {
        full_name: solution.profiles.full_name,
        avatar_url: solution.profiles.avatar_url,
        role: solution.profiles.role,
      } : null,
      user_voted: solution.user_voted || false,
      user_vote_type: solution.user_vote_type || null,
    };
  },

  /**
   * Converts database Update to UI-safe UIUpdate with enhanced schema support
   */
  toUIUpdate: (update: Update & { profiles?: Profile | null }): UIUpdate => {
    return {
      id: update.id,
      title: update.title,
      content: update.content,
      status_change: update.status_change || null,
      is_official: update.is_official || false,
      attachments: update.attachments || [],
      created_at: safeDate.toString(update.created_at),
      updated_at: safeDate.toString(update.updated_at),
      author_id: update.author_id,
      issue_id: update.issue_id,
      profiles: update.profiles ? {
        full_name: update.profiles.full_name,
        avatar_url: update.profiles.avatar_url,
        role: update.profiles.role,
      } : null,
    };
  },

  /**
   * Batch converts an array of issues
   */
  toUIIssues: (issues: (Issue & { profiles?: Profile | null })[]): UIIssue[] => {
    return issues.map(transformers.toUIIssue);
  },

  /**
   * Batch converts an array of comments
   */
  toUIComments: (comments: (Comment & { profiles?: Profile | null })[]): UIComment[] => {
    return comments.map(transformers.toUIComment);
  },

  /**
   * Batch converts an array of solutions
   */
  toUISolutions: (solutions: (Solution & { profiles?: Profile | null; user_voted?: boolean })[]): UISolution[] => {
    return solutions.map(transformers.toUISolution);
  },

  /**
   * Batch converts an array of updates
   */
  toUIUpdates: (updates: (Update & { profiles?: Profile | null })[]): UIUpdate[] => {
    return updates.map(transformers.toUIUpdate);
  },
};

// ✅ Legacy format converters for backward compatibility
export const legacyConverters = {
  /**
   * Converts database issue to legacy format expected by existing components
   */
  toLegacyIssue: (issue: Issue & { profiles?: Profile | null }): any => {
    const uiIssue = transformers.toUIIssue(issue);

    return {
      ...uiIssue,
      // Legacy fields that some components might still expect
      thumbnail: uiIssue.thumbnail,
      isLiked: false, // Will be determined by component
      isWatched: false, // Will be determined by component
    };
  },

  /**
   * Converts array of database issues to legacy format
   */
  toLegacyIssues: (issues: (Issue & { profiles?: Profile | null })[]): any[] => {
    return issues.map(legacyConverters.toLegacyIssue);
  },
};

// ✅ Validation helpers for transformed data
export const validators = {
  /**
   * Validates that a UIIssue has all required fields
   */
  isValidUIIssue: (issue: any): issue is UIIssue => {
    return (
      typeof issue.id === 'string' &&
      typeof issue.title === 'string' &&
      typeof issue.description === 'string' &&
      typeof issue.category === 'string' &&
      typeof issue.status === 'string' &&
      typeof issue.votes === 'number' &&
      Array.isArray(issue.comments) &&
      typeof issue.date === 'string' &&
      typeof issue.author === 'object' &&
      typeof issue.author_id === 'string'
    );
  },

  /**
   * Validates that a UIComment has all required fields
   */
  isValidUIComment: (comment: any): comment is UIComment => {
    return (
      typeof comment.id === 'string' &&
      typeof comment.content === 'string' &&
      typeof comment.author_id === 'string' &&
      typeof comment.issue_id === 'string' &&
      typeof comment.created_at === 'string'
    );
  },

  /**
   * Validates that a UISolution has all required fields
   */
  isValidUISolution: (solution: any): solution is UISolution => {
    return (
      typeof solution.id === 'string' &&
      typeof solution.title === 'string' &&
      typeof solution.description === 'string' &&
      typeof solution.estimated_cost === 'number' &&
      typeof solution.votes === 'number' &&
      typeof solution.status === 'string' &&
      typeof solution.created_at === 'string' &&
      typeof solution.proposed_by === 'string' &&
      typeof solution.issue_id === 'string'
    );
  },

  /**
   * Validates that a UIUpdate has all required fields
   */
  isValidUIUpdate: (update: any): update is UIUpdate => {
    return (
      typeof update.id === 'string' &&
      typeof update.content === 'string' &&
      typeof update.type === 'string' &&
      typeof update.created_at === 'string' &&
      typeof update.author_id === 'string' &&
      typeof update.issue_id === 'string'
    );
  },
};

// ✅ Error handling for transformations
export const safeTransformers = {
  /**
   * Safely converts issue with error handling
   */
  toUIIssueSafe: (issue: any): UIIssue | null => {
    try {
      const transformed = transformers.toUIIssue(issue);
      return validators.isValidUIIssue(transformed) ? transformed : null;
    } catch (error) {
      console.error('Error transforming issue:', error, issue);
      return null;
    }
  },

  /**
   * Safely converts comment with error handling
   */
  toUICommentSafe: (comment: any): UIComment | null => {
    try {
      const transformed = transformers.toUIComment(comment);
      return validators.isValidUIComment(transformed) ? transformed : null;
    } catch (error) {
      console.error('Error transforming comment:', error, comment);
      return null;
    }
  },

  /**
   * Safely converts solution with error handling
   */
  toUISolutionSafe: (solution: any): UISolution | null => {
    try {
      const transformed = transformers.toUISolution(solution);
      return validators.isValidUISolution(transformed) ? transformed : null;
    } catch (error) {
      console.error('Error transforming solution:', error, solution);
      return null;
    }
  },

  /**
   * Safely converts update with error handling
   */
  toUIUpdateSafe: (update: any): UIUpdate | null => {
    try {
      const transformed = transformers.toUIUpdate(update);
      return validators.isValidUIUpdate(transformed) ? transformed : null;
    } catch (error) {
      console.error('Error transforming update:', error, update);
      return null;
    }
  },

  /**
   * Safely converts array with filtering out failed transformations
   */
  toUIIssuesSafe: (issues: any[]): UIIssue[] => {
    return issues
      .map(safeTransformers.toUIIssueSafe)
      .filter((issue): issue is UIIssue => issue !== null);
  },
};

// ✅ Export default transformers
export default transformers;
