import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DatabaseTest: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testQueries = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test profiles table structure
      console.log('Testing profiles table...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      testResults.profiles = {
        success: !profilesError,
        error: profilesError?.message,
        data: profilesData,
        columns: profilesData?.[0] ? Object.keys(profilesData[0]) : [],
      };

      // Test departments table
      console.log('Testing departments table...');
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .limit(1);

      testResults.departments = {
        success: !departmentsError,
        error: departmentsError?.message,
        data: departmentsData,
        columns: departmentsData?.[0] ? Object.keys(departmentsData[0]) : [],
      };

      // Test issues table
      console.log('Testing issues table...');
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .limit(1);

      testResults.issues = {
        success: !issuesError,
        error: issuesError?.message,
        data: issuesData,
        columns: issuesData?.[0] ? Object.keys(issuesData[0]) : [],
      };

      // Test the specific query that was failing
      console.log('Testing admin query...');
      const { data: adminQueryData, error: adminQueryError } = await supabase
        .from('issues')
        .select('id, title, status, category, created_at, author_id')
        .order('created_at', { ascending: false })
        .limit(5);

      testResults.adminQuery = {
        success: !adminQueryError,
        error: adminQueryError?.message,
        data: adminQueryData,
      };
    } catch (error) {
      console.error('Test error:', error);
      testResults.generalError =
        error instanceof Error ? error.message : String(error);
    }

    setResults(testResults);
    setLoading(false);
  };

  useEffect(() => {
    testQueries();
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
          <Button onClick={testQueries} disabled={loading}>
            {loading ? 'Testing...' : 'Retest'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(results).map(([table, result]: [string, any]) => (
              <div key={table} className="border p-4 rounded">
                <h3 className="font-semibold text-lg mb-2">{table}</h3>
                <div className="space-y-2">
                  <p>
                    <strong>Success:</strong> {result.success ? 'Yes' : 'No'}
                  </p>
                  {result.error && (
                    <p className="text-red-600">
                      <strong>Error:</strong> {result.error}
                    </p>
                  )}
                  {result.columns && (
                    <div>
                      <strong>Columns:</strong>
                      <ul className="list-disc list-inside ml-4">
                        {result.columns.map((col: string) => (
                          <li key={col}>{col}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.data && (
                    <div>
                      <strong>Sample Data:</strong>
                      <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseTest;
