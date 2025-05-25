import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { CommentsTab } from '../issues/tabs/CommentsTab';
import { UpdatesTab } from '../issues/tabs/UpdatesTab';
import { SolutionsTab } from '../issues/tabs/SolutionsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  testDatabaseConnection,
  testRealtimeConnection,
} from '@/utils/testDatabase';

export const TabsTestComponent: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [testIssueId, setTestIssueId] = useState<string | null>(null);
  const [isCreatingTestIssue, setIsCreatingTestIssue] = useState(false);

  // Create a test issue for testing the tabs
  const createTestIssue = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to create a test issue',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingTestIssue(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: 'Test Issue for Tabs',
          description:
            'This is a test issue created to test the tabbed interface functionality.',
          category: 'Infrastructure',
          status: 'open',
          author_id: user.id,
          author_name: profile?.full_name || 'Test User',
          author_avatar:
            profile?.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
          location: 'Test Location',
          constituency: 'Test Constituency',
          thumbnail:
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
        })
        .select()
        .single();

      if (error) throw error;

      setTestIssueId(data.id);
      toast({
        title: 'Success',
        description: 'Test issue created successfully',
      });
    } catch (error) {
      console.error('Error creating test issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to create test issue',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingTestIssue(false);
    }
  };

  // Delete the test issue
  const deleteTestIssue = async () => {
    if (!testIssueId || !user) return;

    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', testIssueId);

      if (error) throw error;

      setTestIssueId(null);
      toast({
        title: 'Success',
        description: 'Test issue deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting test issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete test issue',
        variant: 'destructive',
      });
    }
  };

  // Check for existing test issues
  useEffect(() => {
    const checkForTestIssue = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('issues')
          .select('id')
          .eq('title', 'Test Issue for Tabs')
          .eq('author_id', user.id)
          .limit(1)
          .single();

        if (data && !error) {
          setTestIssueId(data.id);
        }
      } catch (error) {
        // No existing test issue found, which is fine
      }
    };

    checkForTestIssue();
  }, [user]);

  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Tabs Test Component</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please sign in to test the tabbed interface functionality.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Tabs Test Component</CardTitle>
        <div className="flex gap-2">
          <Button
            onClick={async () => {
              const dbResult = await testDatabaseConnection();
              const realtimeResult = await testRealtimeConnection();
              toast({
                title: 'Database Tests',
                description: `Database: ${
                  dbResult ? 'Pass' : 'Fail'
                }, Realtime: ${realtimeResult ? 'Pass' : 'Fail'}`,
                variant: dbResult && realtimeResult ? 'default' : 'destructive',
              });
            }}
            variant="outline"
          >
            Test Database
          </Button>
          {!testIssueId ? (
            <Button onClick={createTestIssue} disabled={isCreatingTestIssue}>
              {isCreatingTestIssue ? 'Creating...' : 'Create Test Issue'}
            </Button>
          ) : (
            <Button onClick={deleteTestIssue} variant="destructive">
              Delete Test Issue
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {testIssueId ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Test Issue ID: {testIssueId}
            </p>
            <p className="text-sm text-muted-foreground">
              User Role: {profile?.role || 'citizen'}
            </p>

            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="solutions">Solutions</TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="space-y-4">
                <h3 className="text-lg font-semibold">Comments Tab Test</h3>
                <p className="text-sm text-muted-foreground">
                  Test adding comments and verify they appear in real-time.
                </p>
                <CommentsTab issueId={testIssueId} />
              </TabsContent>

              <TabsContent value="updates" className="space-y-4">
                <h3 className="text-lg font-semibold">Updates Tab Test</h3>
                <p className="text-sm text-muted-foreground">
                  {profile?.role === 'official'
                    ? 'As an official, you can post updates.'
                    : 'Only officials can post updates. You can view existing updates.'}
                </p>
                <UpdatesTab issueId={testIssueId} />
              </TabsContent>

              <TabsContent value="solutions" className="space-y-4">
                <h3 className="text-lg font-semibold">Solutions Tab Test</h3>
                <p className="text-sm text-muted-foreground">
                  Test proposing solutions and voting on them.
                </p>
                <SolutionsTab issueId={testIssueId} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Create a test issue to test the tabbed interface functionality.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
