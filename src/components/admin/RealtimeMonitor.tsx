import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Play, 
  Pause, 
  Trash2,
  Clock,
  Database,
  Users,
  MessageSquare,
  FileText
} from 'lucide-react';

interface RealtimeEvent {
  id: string;
  timestamp: Date;
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  record: any;
  oldRecord?: any;
}

interface SubscriptionStatus {
  table: string;
  status: 'connected' | 'disconnected' | 'error';
  channel: any;
  eventCount: number;
  lastEvent: Date | null;
}

const RealtimeMonitor: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionStatus[]>([]);
  const subscriptionsRef = useRef<any[]>([]);
  const maxEvents = 50; // Limit stored events to prevent memory issues

  const monitoredTables = [
    'issues',
    'comments', 
    'solutions',
    'notifications',
    'profiles',
    'votes'
  ];

  const addEvent = (table: string, eventType: 'INSERT' | 'UPDATE' | 'DELETE', record: any, oldRecord?: any) => {
    const newEvent: RealtimeEvent = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      table,
      eventType,
      record,
      oldRecord
    };

    setEvents(prev => {
      const updated = [newEvent, ...prev];
      return updated.slice(0, maxEvents); // Keep only the most recent events
    });

    // Update subscription event count
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.table === table 
          ? { ...sub, eventCount: sub.eventCount + 1, lastEvent: new Date() }
          : sub
      )
    );
  };

  const startMonitoring = () => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    
    // Create subscriptions for each table
    const newSubscriptions = monitoredTables.map(table => {
      const channel = supabase
        .channel(`realtime-monitor-${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          (payload) => {
            console.log(`Realtime event on ${table}:`, payload);
            addEvent(table, payload.eventType as any, payload.new, payload.old);
          }
        )
        .subscribe((status) => {
          console.log(`Subscription status for ${table}:`, status);
          setSubscriptions(prev => 
            prev.map(sub => 
              sub.table === table 
                ? { ...sub, status: status === 'SUBSCRIBED' ? 'connected' : 'disconnected' }
                : sub
            )
          );
        });

      return {
        table,
        status: 'disconnected' as const,
        channel,
        eventCount: 0,
        lastEvent: null
      };
    });

    subscriptionsRef.current = newSubscriptions.map(sub => sub.channel);
    setSubscriptions(newSubscriptions);
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    
    // Unsubscribe from all channels
    subscriptionsRef.current.forEach(channel => {
      if (channel) {
        channel.unsubscribe();
      }
    });
    
    subscriptionsRef.current = [];
    setSubscriptions([]);
  };

  const clearEvents = () => {
    setEvents([]);
    setSubscriptions(prev => 
      prev.map(sub => ({ ...sub, eventCount: 0, lastEvent: null }))
    );
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopMonitoring();
    };
  }, []);

  const getTableIcon = (table: string) => {
    switch (table) {
      case 'issues': return <FileText className="h-3 w-3" />;
      case 'comments': return <MessageSquare className="h-3 w-3" />;
      case 'profiles': return <Users className="h-3 w-3" />;
      case 'notifications': return <Activity className="h-3 w-3" />;
      default: return <Database className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'INSERT': return 'text-green-600 bg-green-50';
      case 'UPDATE': return 'text-blue-600 bg-blue-50';
      case 'DELETE': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: 'connected' | 'disconnected' | 'error') => {
    switch (status) {
      case 'connected': return <Wifi className="h-3 w-3 text-green-500" />;
      case 'disconnected': return <WifiOff className="h-3 w-3 text-gray-500" />;
      case 'error': return <WifiOff className="h-3 w-3 text-red-500" />;
    }
  };

  const formatEventData = (record: any) => {
    if (!record) return 'No data';
    
    // Show key fields for different record types
    if (record.title) return record.title;
    if (record.content) return record.content.substring(0, 50) + '...';
    if (record.full_name) return record.full_name;
    if (record.message) return record.message.substring(0, 50) + '...';
    
    return JSON.stringify(record).substring(0, 50) + '...';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time Activity Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={isMonitoring ? stopMonitoring : startMonitoring}
            >
              {isMonitoring ? (
                <Pause className="h-3 w-3 mr-1" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              {isMonitoring ? 'Stop' : 'Start'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearEvents}
              disabled={events.length === 0}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Subscription Status */}
        {subscriptions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Active Subscriptions</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {subscriptions.map((sub) => (
                <div key={sub.table} className="flex items-center justify-between p-2 border rounded text-xs">
                  <div className="flex items-center gap-1">
                    {getTableIcon(sub.table)}
                    <span>{sub.table}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs px-1">
                      {sub.eventCount}
                    </Badge>
                    {getStatusIcon(sub.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Stream */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Event Stream</h4>
            <Badge variant="outline" className="text-xs">
              {events.length} events
            </Badge>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {isMonitoring ? 'Waiting for events...' : 'Start monitoring to see real-time events'}
            </div>
          ) : (
            <ScrollArea className="h-64 border rounded">
              <div className="p-2 space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="border rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getTableIcon(event.table)}
                        <span className="font-medium">{event.table}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-1 ${getEventTypeColor(event.eventType)}`}
                        >
                          {event.eventType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{event.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {formatEventData(event.record)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Statistics */}
        {events.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {events.filter(e => e.eventType === 'INSERT').length}
              </div>
              <div className="text-xs text-muted-foreground">Inserts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {events.filter(e => e.eventType === 'UPDATE').length}
              </div>
              <div className="text-xs text-muted-foreground">Updates</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {events.filter(e => e.eventType === 'DELETE').length}
              </div>
              <div className="text-xs text-muted-foreground">Deletes</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RealtimeMonitor;
