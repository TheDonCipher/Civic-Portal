import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { performanceMonitor } from '@/lib/utils/performanceMonitor';
import { checkSupabaseConfiguration } from '@/utils/supabaseConfigCheck';
import AuthDebugPanel from './AuthDebugPanel';
import DatabaseHealthChecker from './DatabaseHealthChecker';
import RealtimeMonitor from './RealtimeMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Database,
  Zap,
  Bug,
  Activity,
  Users,
  Server,
  Wifi,
  Clock,
  MemoryStick,
  HardDrive,
  Shield,
  Eye,
  EyeOff,
  Download,
  Trash2,
} from 'lucide-react';

interface SystemDebugPanelProps {
  debugInfo?: {
    profilesCount: number;
    departmentsCount: number;
    issuesCount: number;
    sampleProfile: any;
    profileColumns: string[];
  } | null;
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    connectionTime: number;
    lastChecked: Date;
    details: string;
  };
  realtime: {
    status: 'connected' | 'disconnected' | 'error';
    subscriptions: number;
    lastEvent: Date | null;
  };
  performance: {
    memoryUsage: number;
    renderTime: number;
    apiLatency: number;
  };
  errors: {
    count: number;
    lastError: Date | null;
    recentErrors: any[];
  };
}

const SystemDebugPanel: React.FC<SystemDebugPanelProps> = ({ debugInfo }) => {
  const { user, profile } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: {
      status: 'error',
      connectionTime: 0,
      lastChecked: new Date(),
      details: 'Not checked',
    },
    realtime: {
      status: 'disconnected',
      subscriptions: 0,
      lastEvent: null,
    },
    performance: {
      memoryUsage: 0,
      renderTime: 0,
      apiLatency: 0,
    },
    errors: {
      count: 0,
      lastError: null,
      recentErrors: [],
    },
  });

  // Check database health
  const checkDatabaseHealth = async () => {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const connectionTime = performance.now() - startTime;

      if (error) {
        setSystemHealth((prev) => ({
          ...prev,
          database: {
            status: 'error',
            connectionTime,
            lastChecked: new Date(),
            details: error.message,
          },
        }));
      } else {
        setSystemHealth((prev) => ({
          ...prev,
          database: {
            status: 'healthy',
            connectionTime,
            lastChecked: new Date(),
            details: 'Connection successful',
          },
        }));
      }
    } catch (error) {
      setSystemHealth((prev) => ({
        ...prev,
        database: {
          status: 'error',
          connectionTime: performance.now() - startTime,
          lastChecked: new Date(),
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  };

  // Check realtime status
  const checkRealtimeStatus = () => {
    const channels = supabase.getChannels();
    setSystemHealth((prev) => ({
      ...prev,
      realtime: {
        status: channels.length > 0 ? 'connected' : 'disconnected',
        subscriptions: channels.length,
        lastEvent: new Date(), // Simplified for now
      },
    }));
  };

  // Get performance metrics
  const getPerformanceMetrics = () => {
    try {
      const report = performanceMonitor.getReport();
      const memoryInfo = (performance as any).memory;

      // Find API latency from custom metrics (customMetrics is an object, not array)
      let apiLatency = 0;
      if (report.customMetrics && typeof report.customMetrics === 'object') {
        const apiMetricEntry = Object.entries(report.customMetrics).find(
          ([key]) => key.toLowerCase().includes('api')
        );
        apiLatency = apiMetricEntry?.[1] || 0;
      }

      setSystemHealth((prev) => ({
        ...prev,
        performance: {
          memoryUsage: memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0,
          renderTime: report.navigation?.domContentLoaded || 0,
          apiLatency,
        },
      }));
    } catch (error) {
      console.warn('Error getting performance metrics:', error);
      // Set default values on error
      setSystemHealth((prev) => ({
        ...prev,
        performance: {
          memoryUsage: 0,
          renderTime: 0,
          apiLatency: 0,
        },
      }));
    }
  };

  // Get error information
  const getErrorInfo = () => {
    try {
      const storedErrors = JSON.parse(
        localStorage.getItem('civic-portal-errors') || '[]'
      );

      setSystemHealth((prev) => ({
        ...prev,
        errors: {
          count: storedErrors.length,
          lastError:
            storedErrors.length > 0
              ? new Date(storedErrors[storedErrors.length - 1].timestamp)
              : null,
          recentErrors: storedErrors.slice(-5),
        },
      }));
    } catch (error) {
      console.warn('Failed to load error info:', error);
    }
  };

  // Refresh all system health checks
  const refreshSystemHealth = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        checkDatabaseHealth(),
        checkRealtimeStatus(),
        getPerformanceMetrics(),
        getErrorInfo(),
      ]);
    } catch (error) {
      console.error('Error refreshing system health:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initial health check
  useEffect(() => {
    refreshSystemHealth();
  }, []);

  // Status indicator component
  const StatusIndicator = ({
    status,
  }: {
    status: 'healthy' | 'warning' | 'error' | 'connected' | 'disconnected';
  }) => {
    const getColor = () => {
      switch (status) {
        case 'healthy':
        case 'connected':
          return 'text-green-500';
        case 'warning':
          return 'text-yellow-500';
        case 'error':
        case 'disconnected':
          return 'text-red-500';
        default:
          return 'text-gray-500';
      }
    };

    const getIcon = () => {
      switch (status) {
        case 'healthy':
        case 'connected':
          return <CheckCircle className="h-4 w-4" />;
        case 'warning':
          return <AlertCircle className="h-4 w-4" />;
        case 'error':
        case 'disconnected':
          return <AlertCircle className="h-4 w-4" />;
        default:
          return <AlertCircle className="h-4 w-4" />;
      }
    };

    return (
      <div className={`flex items-center gap-1 ${getColor()}`}>
        {getIcon()}
        <span className="text-sm capitalize">{status}</span>
      </div>
    );
  };

  // Clear error logs
  const clearErrorLogs = () => {
    localStorage.removeItem('civic-portal-errors');
    getErrorInfo();
  };

  // Export debug data
  const exportDebugData = () => {
    const debugData = {
      timestamp: new Date().toISOString(),
      systemHealth,
      debugInfo,
      userInfo: {
        id: user?.id,
        role: profile?.role,
        hasProfile: !!profile,
      },
      performanceReport: performanceMonitor.getReport(),
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `civic-portal-debug-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!user || profile?.role !== 'admin') {
    return null;
  }

  return (
    <Card className="mb-6 border-2 border-dashed border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">System Debug Panel</CardTitle>
            <Badge variant="outline" className="text-xs">
              Admin Only
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportDebugData}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSystemHealth}
              disabled={isRefreshing}
              className="text-xs"
            >
              {isRefreshing ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs"
            >
              {isExpanded ? (
                <EyeOff className="h-3 w-3 mr-1" />
              ) : (
                <Eye className="h-3 w-3 mr-1" />
              )}
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Quick Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Database:</span>
            <StatusIndicator status={systemHealth.database.status} />
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Realtime:</span>
            <StatusIndicator status={systemHealth.realtime.status} />
          </div>
          <div className="flex items-center gap-2">
            <MemoryStick className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Memory:</span>
            <span className="text-sm">
              {systemHealth.performance.memoryUsage.toFixed(1)}MB
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Errors:</span>
            <span className="text-sm">{systemHealth.errors.count}</span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="database">Database</TabsTrigger>
                  <TabsTrigger value="realtime">Real-time</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="errors">Errors</TabsTrigger>
                  <TabsTrigger value="auth">Auth</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* System Summary */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          System Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Database Status:</span>
                          <StatusIndicator
                            status={systemHealth.database.status}
                          />
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Connection Time:</span>
                          <span>
                            {systemHealth.database.connectionTime.toFixed(2)}ms
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Subscriptions:</span>
                          <span>{systemHealth.realtime.subscriptions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Memory Usage:</span>
                          <span>
                            {systemHealth.performance.memoryUsage.toFixed(1)}MB
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Data Summary */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Data Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {debugInfo && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span>Total Profiles:</span>
                              <span>{debugInfo.profilesCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Departments:</span>
                              <span>{debugInfo.departmentsCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Issues:</span>
                              <span>{debugInfo.issuesCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Profile Columns:</span>
                              <span>{debugInfo.profileColumns.length}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearErrorLogs}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear Error Logs
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => performanceMonitor.logReport()}
                          className="text-xs"
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          Log Performance
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            console.log('System Health:', systemHealth)
                          }
                          className="text-xs"
                        >
                          <Bug className="h-3 w-3 mr-1" />
                          Log Debug Info
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="database" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Database Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Connection Status:
                        </span>
                        <StatusIndicator
                          status={systemHealth.database.status}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Response Time:
                        </span>
                        <span className="text-sm">
                          {systemHealth.database.connectionTime.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Last Checked:
                        </span>
                        <span className="text-sm">
                          {systemHealth.database.lastChecked.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Details:</span>
                        <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                          {systemHealth.database.details}
                        </p>
                      </div>

                      {/* Connection Quality Indicator */}
                      <div className="space-y-2">
                        <span className="text-sm font-medium">
                          Connection Quality:
                        </span>
                        <Progress
                          value={
                            systemHealth.database.connectionTime < 100
                              ? 100
                              : systemHealth.database.connectionTime < 500
                              ? 70
                              : 30
                          }
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {systemHealth.database.connectionTime < 100
                            ? 'Excellent'
                            : systemHealth.database.connectionTime < 500
                            ? 'Good'
                            : 'Slow'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Wifi className="h-4 w-4" />
                        Real-time Connections
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <StatusIndicator
                          status={systemHealth.realtime.status}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Active Subscriptions:
                        </span>
                        <span className="text-sm">
                          {systemHealth.realtime.subscriptions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Event:</span>
                        <span className="text-sm">
                          {systemHealth.realtime.lastEvent
                            ? systemHealth.realtime.lastEvent.toLocaleTimeString()
                            : 'None'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Database Health Monitor */}
                  <DatabaseHealthChecker />
                </TabsContent>

                <TabsContent value="realtime" className="space-y-4">
                  <RealtimeMonitor />
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Performance Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Memory Usage:
                        </span>
                        <span className="text-sm">
                          {systemHealth.performance.memoryUsage.toFixed(1)}MB
                        </span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-sm font-medium">
                          Memory Usage:
                        </span>
                        <Progress
                          value={Math.min(
                            (systemHealth.performance.memoryUsage / 100) * 100,
                            100
                          )}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          {systemHealth.performance.memoryUsage < 50
                            ? 'Good'
                            : systemHealth.performance.memoryUsage < 100
                            ? 'Moderate'
                            : 'High'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Render Time:
                        </span>
                        <span className="text-sm">
                          {systemHealth.performance.renderTime.toFixed(2)}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          API Latency:
                        </span>
                        <span className="text-sm">
                          {systemHealth.performance.apiLatency.toFixed(2)}ms
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Performance Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const report = performanceMonitor.getReport();
                          console.group('📊 Performance Report');
                          console.log('Core Web Vitals:', report.coreWebVitals);
                          console.log('Navigation:', report.navigation);
                          console.log('Memory:', report.memoryUsage);
                          console.log('Custom Metrics:', report.customMetrics);
                          console.groupEnd();
                        }}
                        className="w-full"
                      >
                        <Activity className="h-3 w-3 mr-2" />
                        Generate Performance Report
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="errors" className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Error Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Total Errors:
                        </span>
                        <Badge
                          variant={
                            systemHealth.errors.count > 0
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {systemHealth.errors.count}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Error:</span>
                        <span className="text-sm">
                          {systemHealth.errors.lastError
                            ? systemHealth.errors.lastError.toLocaleTimeString()
                            : 'None'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearErrorLogs}
                          disabled={systemHealth.errors.count === 0}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Clear Logs
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            console.log(
                              'Recent Errors:',
                              systemHealth.errors.recentErrors
                            )
                          }
                          disabled={systemHealth.errors.count === 0}
                        >
                          <Bug className="h-3 w-3 mr-1" />
                          Log Errors
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {systemHealth.errors.recentErrors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Bug className="h-4 w-4" />
                          Recent Errors
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {systemHealth.errors.recentErrors.map(
                            (error, index) => (
                              <div
                                key={index}
                                className="text-xs bg-red-50 border border-red-200 p-2 rounded"
                              >
                                <div className="font-medium text-red-800">
                                  {error.message}
                                </div>
                                <div className="text-red-600">
                                  {new Date(error.timestamp).toLocaleString()}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="auth" className="space-y-4">
                  {/* Include the existing AuthDebugPanel here */}
                  <div className="bg-white rounded-lg border">
                    <AuthDebugPanel />
                  </div>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Session Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">User ID:</span>
                        <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                          {user?.id || 'Not authenticated'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Role:</span>
                        <Badge
                          variant={
                            profile?.role === 'admin' ? 'default' : 'secondary'
                          }
                        >
                          {profile?.role || 'No role'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Profile Status:
                        </span>
                        <StatusIndicator
                          status={profile ? 'healthy' : 'error'}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SystemDebugPanel;
