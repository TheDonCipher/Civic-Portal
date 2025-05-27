import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Table, 
  Users, 
  FileText,
  MessageSquare,
  Lightbulb,
  Bell
} from 'lucide-react';

interface TableHealth {
  name: string;
  exists: boolean;
  rowCount: number;
  lastUpdated: Date | null;
  status: 'healthy' | 'warning' | 'error';
}

interface DatabaseHealthStatus {
  connection: 'healthy' | 'warning' | 'error';
  tables: TableHealth[];
  functions: {
    name: string;
    exists: boolean;
  }[];
  policies: {
    table: string;
    count: number;
  }[];
  lastChecked: Date;
}

const DatabaseHealthChecker: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<DatabaseHealthStatus>({
    connection: 'error',
    tables: [],
    functions: [],
    policies: [],
    lastChecked: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkTableHealth = async (tableName: string): Promise<TableHealth> => {
    try {
      // Check if table exists and get row count
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        return {
          name: tableName,
          exists: false,
          rowCount: 0,
          lastUpdated: null,
          status: 'error'
        };
      }

      // Try to get the most recent update
      let lastUpdated: Date | null = null;
      try {
        const { data: recentData } = await supabase
          .from(tableName)
          .select('created_at, updated_at')
          .order('created_at', { ascending: false })
          .limit(1);

        if (recentData && recentData.length > 0) {
          const record = recentData[0];
          lastUpdated = new Date(record.updated_at || record.created_at);
        }
      } catch (e) {
        // Some tables might not have these columns
      }

      const rowCount = count || 0;
      const status: 'healthy' | 'warning' | 'error' = 
        rowCount > 0 ? 'healthy' : 
        tableName === 'profiles' || tableName === 'departments' ? 'warning' : 'healthy';

      return {
        name: tableName,
        exists: true,
        rowCount,
        lastUpdated,
        status
      };
    } catch (error) {
      return {
        name: tableName,
        exists: false,
        rowCount: 0,
        lastUpdated: null,
        status: 'error'
      };
    }
  };

  const checkDatabaseFunctions = async () => {
    const requiredFunctions = [
      'increment_issue_votes',
      'decrement_issue_votes',
      'increment_issue_watchers',
      'decrement_issue_watchers',
      'increment_solution_votes',
      'decrement_solution_votes'
    ];

    const functionChecks = await Promise.all(
      requiredFunctions.map(async (funcName) => {
        try {
          // Try to call the function with test parameters to see if it exists
          const { error } = await supabase.rpc(funcName, { issue_id: '00000000-0000-0000-0000-000000000000' });
          // If we get a specific error about the issue not existing, the function exists
          const exists = !error || !error.message.includes('function') || error.message.includes('does not exist');
          
          return {
            name: funcName,
            exists: exists
          };
        } catch (e) {
          return {
            name: funcName,
            exists: false
          };
        }
      })
    );

    return functionChecks;
  };

  const checkRLSPolicies = async () => {
    const tables = ['profiles', 'issues', 'comments', 'solutions', 'notifications'];
    
    const policyChecks = await Promise.all(
      tables.map(async (tableName) => {
        try {
          // This is a simplified check - in a real implementation you'd query pg_policies
          // For now, we'll assume policies exist if we can query the table
          const { error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          return {
            table: tableName,
            count: error ? 0 : 1 // Simplified - assume 1 policy if accessible
          };
        } catch (e) {
          return {
            table: tableName,
            count: 0
          };
        }
      })
    );

    return policyChecks;
  };

  const performHealthCheck = async () => {
    setIsChecking(true);
    
    try {
      // Test basic connection
      const { error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const connectionStatus: 'healthy' | 'warning' | 'error' = 
        connectionError ? 'error' : 'healthy';

      // Check critical tables
      const criticalTables = [
        'profiles', 'issues', 'comments', 'solutions', 
        'departments', 'notifications', 'votes', 'watchers'
      ];

      const tableHealthChecks = await Promise.all(
        criticalTables.map(checkTableHealth)
      );

      // Check database functions
      const functionChecks = await checkDatabaseFunctions();

      // Check RLS policies
      const policyChecks = await checkRLSPolicies();

      setHealthStatus({
        connection: connectionStatus,
        tables: tableHealthChecks,
        functions: functionChecks,
        policies: policyChecks,
        lastChecked: new Date()
      });

    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus(prev => ({
        ...prev,
        connection: 'error',
        lastChecked: new Date()
      }));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    performHealthCheck();
  }, []);

  const getTableIcon = (tableName: string) => {
    switch (tableName) {
      case 'profiles': return <Users className="h-4 w-4" />;
      case 'issues': return <FileText className="h-4 w-4" />;
      case 'comments': return <MessageSquare className="h-4 w-4" />;
      case 'solutions': return <Lightbulb className="h-4 w-4" />;
      case 'notifications': return <Bell className="h-4 w-4" />;
      default: return <Table className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const overallHealth = healthStatus.connection === 'healthy' && 
    healthStatus.tables.every(t => t.status !== 'error') ? 'healthy' :
    healthStatus.tables.some(t => t.status === 'error') ? 'error' : 'warning';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Health Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={overallHealth === 'healthy' ? 'default' : 
                           overallHealth === 'warning' ? 'secondary' : 'destructive'}>
              {overallHealth}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={performHealthCheck}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-2 bg-muted rounded">
          <span className="text-sm font-medium">Database Connection</span>
          {getStatusIcon(healthStatus.connection)}
        </div>

        {/* Tables Health */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tables Status</h4>
          <div className="grid grid-cols-1 gap-2">
            {healthStatus.tables.map((table) => (
              <div key={table.name} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  {getTableIcon(table.name)}
                  <span className="text-sm">{table.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {table.rowCount} rows
                  </Badge>
                </div>
                {getStatusIcon(table.status)}
              </div>
            ))}
          </div>
        </div>

        {/* Functions Status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Database Functions</h4>
          <div className="grid grid-cols-2 gap-2">
            {healthStatus.functions.map((func) => (
              <div key={func.name} className="flex items-center justify-between p-2 border rounded text-xs">
                <span className="truncate">{func.name}</span>
                {func.exists ? 
                  <CheckCircle className="h-3 w-3 text-green-500" /> :
                  <AlertCircle className="h-3 w-3 text-red-500" />
                }
              </div>
            ))}
          </div>
        </div>

        {/* Last Checked */}
        <div className="text-xs text-muted-foreground text-center">
          Last checked: {healthStatus.lastChecked.toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseHealthChecker;
