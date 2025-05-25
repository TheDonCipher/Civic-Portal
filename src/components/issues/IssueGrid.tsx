import React from 'react';
import IssueCard from './IssueCard';
import FilterBar from './FilterBar';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'open' | 'in-progress' | 'resolved';
  votes: number;
  comments: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
  }>;
  updates?: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
    type: 'status' | 'comment' | 'solution';
  }>;
  solutions?: Array<{
    id: number;
    title: string;
    description: string;
    proposedBy: {
      name: string;
      avatar: string;
    };
    estimatedCost: number;
    votes: number;
    status: 'proposed' | 'approved' | 'in-progress' | 'completed';
  }>;
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  author_id?: string;
  author_name?: string;
  author_avatar?: string;
  thumbnail: string;
  thumbnails?: string[];
  location?: string;
  constituency?: string;
  watchers?: number;
  watchers_count?: number;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
  resolved_by?: string;
  department_id?: string;
  search_vector?: unknown;
}

interface IssueGridProps {
  issues?: Issue[];
  onFilterChange?: (filters: any) => void;
  onSearch?: (searchTerm: string) => void;
  onIssueClick: (issue: Issue) => void;
  onDelete?: (issueId: string) => void;
  showDeleteButton?: boolean;
  compact?: boolean;
}

const IssueGrid = ({
  issues = [],
  onFilterChange = () => {},
  onSearch = () => {},
  onIssueClick,
  onDelete,
  showDeleteButton = false,
}: IssueGridProps) => {
  return (
    <div className="w-full flex flex-col gap-6" data-testid="issue-grid">
      <FilterBar onFilterChange={onFilterChange} onSearch={onSearch} />

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-background border border-border/50 rounded-xl">
          <div className="p-4 bg-muted/50 rounded-full mb-6">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No issues found
          </h3>
          <p className="text-muted-foreground max-w-md">
            There are no issues to display at the moment. Try adjusting your
            filters or check back later.
          </p>
        </div>
      ) : (
        <div className="bg-background border border-border/50 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onIssueClick(issue)}
                className="cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                data-testid="issue-card-container"
              >
                <IssueCard
                  id={issue.id}
                  title={issue.title}
                  description={issue.description}
                  category={issue.category}
                  status={issue.status}
                  votes={issue.votes}
                  comments={issue.comments}
                  date={issue.date}
                  author={issue.author}
                  author_id={issue.author_id}
                  thumbnail={issue.thumbnail}
                  constituency={issue.constituency}
                  watchers={issue.watchers}
                  onDelete={onDelete}
                  showDeleteButton={showDeleteButton}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueGrid;
