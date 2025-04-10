import React from "react";
import IssueCard from "./IssueCard";
import FilterBar from "./FilterBar";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "open" | "in-progress" | "resolved";
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
    type: "status" | "comment" | "solution";
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
    status: "proposed" | "approved" | "in-progress" | "completed";
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
  compact?: boolean;
}

const IssueGrid = ({
  issues = [],
  onFilterChange = () => {},
  onSearch = () => {},
  onIssueClick,
}: IssueGridProps) => {
  return (
    <div className="w-full flex flex-col gap-6">
      <FilterBar onFilterChange={onFilterChange} onSearch={onSearch} />
      <div className="flex-1 bg-background border-border rounded-lg p-4 sm:p-6 shadow-sm">
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pb-6">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onIssueClick(issue)}
                className="cursor-pointer transition-transform hover:scale-[1.02]"
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
                  thumbnail={issue.thumbnail}
                  constituency={issue.constituency}
                  watchers={issue.watchers}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueGrid;
