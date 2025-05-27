import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import IssueGrid from './IssueGrid';
import IssueDetailDialog from './IssueDetailDialog';
import CreateIssueDialog from './CreateIssueDialog';
import { fetchIssues, deleteIssue } from '@/lib/api/issuesApi';
import type { UIIssue } from '@/types/enhanced';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { useAuth } from '@/lib/auth';
import { handleApiError } from '@/lib/utils/errorHandler';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  constituency: z.string().min(1, 'Constituency is required'),
});

export const IssuesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<UIIssue | null>(null);
  const [issues, setIssues] = useState<UIIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [currentSearch, setCurrentSearch] = useState<string>('');
  const { toast } = useToast();
  const { user, profile } = useAuth() || { user: null, profile: null };

  // Check for create=true URL parameter and open dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateDialogOpen(true);
      // Clean up the URL parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('create');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'You must be signed in to delete issues',
          variant: 'destructive',
        });
        return;
      }

      // Use the centralized delete function
      await deleteIssue(issueId, user.id);

      // Remove the issue from the local state
      setIssues(issues.filter((issue) => issue.id !== issueId));
      setSelectedIssue(null);

      toast({
        title: 'Issue Deleted',
        description: 'The issue has been successfully deleted.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error handling issue deletion:', error);
      handleApiError(error, 'IssuesPage', 'deleteIssue');
    }
  };

  // Centralized function to load issues with current filters and search
  const loadIssues = async () => {
    try {
      setIsLoading(true);
      const { issues: fetchedIssues } = await fetchIssues({
        search: currentSearch || undefined,
        status:
          currentFilters.status !== 'all' ? currentFilters.status : undefined,
        category:
          currentFilters.category !== 'all'
            ? currentFilters.category
            : undefined,
        department_id: currentFilters.department_id || undefined,
        constituency: currentFilters.constituency || undefined,
      });

      setIssues(fetchedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      handleApiError(error, 'IssuesPage', 'loadIssues');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch issues when component mounts or filters change
  useEffect(() => {
    loadIssues();
  }, [currentFilters, currentSearch]);

  const handleCreateIssue = async (data: any) => {
    // Handle issue creation - the issue has already been created by CreateIssueDialog
    // Just refresh the issues list to show the new issue
    console.log('Issue created successfully, refreshing list');

    // Refresh the issues list to include the new issue
    await loadIssues();

    toast({
      title: 'Issue Created',
      description: 'Your issue has been successfully created.',
      variant: 'default',
      duration: 3000,
    });

    setIsCreateDialogOpen(false);
  };

  const handleSearch = (term: string) => {
    setCurrentSearch(term);
    // The useEffect will automatically reload issues with the new search term
  };

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
    // The useEffect will automatically reload issues with the new filters
  };

  return (
    <MainLayout
      onCreateIssue={() => setIsCreateDialogOpen(true)}
      onSearch={handleSearch}
    >
      <div className="max-w-[1800px] mx-auto">
        <IssueGrid
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          issues={issues}
          onIssueClick={(issue) => setSelectedIssue(issue)}
          onDelete={handleDeleteIssue}
          showDeleteButton={!!user}
        />
      </div>

      <CreateIssueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateIssue}
      />

      {selectedIssue && selectedIssue.title && (
        <IssueDetailDialog
          open={true}
          onOpenChange={() => setSelectedIssue(null)}
          issue={selectedIssue}
          onDelete={handleDeleteIssue}
        />
      )}
    </MainLayout>
  );
};
