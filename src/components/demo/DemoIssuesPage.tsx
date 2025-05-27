import React, { useState } from 'react';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import IssueGrid from '@/components/issues/IssueGrid';
import IssueDetailDialog from '@/components/issues/IssueDetailDialog';
import CreateIssueDialog from '@/components/issues/CreateIssueDialog';
import { DemoBanner } from './DemoBanner';
import type { Issue } from '@/components/issues/IssueGrid';
import type { UIIssue } from '@/types/enhanced';

const DemoIssuesPage: React.FC = () => {
  const { getDemoIssues, demoUser } = useDemoMode();
  const [selectedIssue, setSelectedIssue] = useState<UIIssue | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filteredIssues, setFilteredIssues] = useState<UIIssue[]>([]);

  const rawDemoIssues = getDemoIssues();

  // Format demo issues to match the UIIssue interface
  const demoIssues: UIIssue[] = React.useMemo(() => {
    return rawDemoIssues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status as 'open' | 'in-progress' | 'resolved',
      votes: issue.votes || 0,
      // Comments are already formatted by DemoProvider, so use them directly
      comments: issue.comments || [],
      date: issue.date || issue.created_at || new Date().toISOString(),
      // Author is already formatted by DemoProvider
      author: issue.author || {
        name: issue.author_name || 'Unknown',
        avatar:
          issue.author_avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.author_id}`,
      },
      author_id: issue.author_id,
      thumbnail: issue.thumbnail || '',
      location: issue.location || '',
      constituency: issue.constituency || '',
      watchers: issue.watchers || issue.watchers_count || 0,
      watchers_count: issue.watchers_count || 0,
      created_at: issue.created_at || new Date().toISOString(),
      updated_at: issue.updated_at || new Date().toISOString(),
      resolved_at: issue.resolved_at || '',
      resolved_by: issue.resolved_by || '',
      department_id: issue.department_id || '',
    }));
  }, [rawDemoIssues]);

  // Initialize filtered issues with all demo issues
  React.useEffect(() => {
    setFilteredIssues(demoIssues);
  }, [demoIssues]);

  const handleCreateIssue = (data: any) => {
    // In demo mode, we just simulate creating an issue
    console.log('Demo: Creating issue', data);
    setIsCreateDialogOpen(false);
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredIssues(demoIssues);
      return;
    }

    const searchTerm = term.toLowerCase();
    const filtered = demoIssues.filter(
      (issue) =>
        issue.title.toLowerCase().includes(searchTerm) ||
        issue.description.toLowerCase().includes(searchTerm) ||
        issue.category.toLowerCase().includes(searchTerm) ||
        issue.location?.toLowerCase().includes(searchTerm) ||
        issue.constituency?.toLowerCase().includes(searchTerm)
    );
    setFilteredIssues(filtered);
  };

  const handleFilterChange = (filters: any) => {
    let filtered = [...demoIssues];

    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(
        (issue) =>
          issue.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((issue) => issue.status === filters.status);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort(
            (a, b) =>
              new Date(b.created_at || b.date).getTime() -
              new Date(a.created_at || a.date).getTime()
          );
          break;
        case 'oldest':
          filtered.sort(
            (a, b) =>
              new Date(a.created_at || a.date).getTime() -
              new Date(b.created_at || b.date).getTime()
          );
          break;
        case 'most-votes':
          filtered.sort((a, b) => b.votes - a.votes);
          break;
        case 'least-votes':
          filtered.sort((a, b) => a.votes - b.votes);
          break;
        default:
          // Default to newest
          filtered.sort(
            (a, b) =>
              new Date(b.created_at || b.date).getTime() -
              new Date(a.created_at || a.date).getTime()
          );
      }
    }

    setFilteredIssues(filtered);
  };

  return (
    <>
      <DemoBanner />
      <MainLayout
        onCreateIssue={() => setIsCreateDialogOpen(true)}
        onSearch={handleSearch}
      >
        <div className="max-w-[1800px] mx-auto">
          <IssueGrid
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            issues={filteredIssues}
            onIssueClick={(issue) => setSelectedIssue(issue)}
            showDeleteButton={false} // No delete in demo mode
          />
        </div>

        <CreateIssueDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateIssue}
        />

        {selectedIssue && (
          <IssueDetailDialog
            open={true}
            onOpenChange={() => setSelectedIssue(null)}
            issue={selectedIssue}
          />
        )}
      </MainLayout>
    </>
  );
};

export default DemoIssuesPage;
