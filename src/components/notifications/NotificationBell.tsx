import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Bell,
  Check,
  X,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  Settings,
  MessageSquare,
  Lightbulb,
  FileText,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/utils/notificationUtils';
import { safeDate } from '@/lib/utils/dateUtils';
import { supabase } from '@/lib/supabase';
import {
  playNotificationSound,
  getNotificationPreferences,
} from '@/lib/utils/notificationSound';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  read_at?: string;
  created_at: string;
  data?: any;
  related_issue_id?: string;
  related_comment_id?: string;
  related_solution_id?: string;
  action_url?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
}

interface NotificationGroup {
  category: string;
  notifications: Notification[];
  unreadCount: number;
}

// Notification categories for better organization
const NOTIFICATION_CATEGORIES = {
  ISSUES: 'Issues & Updates',
  ENGAGEMENT: 'Comments & Solutions',
  SYSTEM: 'System & Account',
  ADMIN: 'Admin Announcements',
} as const;

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await getUserNotifications(user.id);
      // Transform database results to UI-safe format
      const transformedNotifications = data.map((notification) => ({
        ...notification,
        created_at: safeDate.toString(notification.created_at),
      }));
      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to categorize notifications (moved before useMemo)
  const getCategoryForNotification = useCallback((type: string): string => {
    switch (type) {
      case 'issue_update':
      case 'status_change':
        return NOTIFICATION_CATEGORIES.ISSUES;
      case 'comment':
      case 'solution':
        return NOTIFICATION_CATEGORIES.ENGAGEMENT;
      case 'verification_approved':
      case 'verification_rejected':
      case 'role_changed':
      case 'system':
        return NOTIFICATION_CATEGORIES.SYSTEM;
      case 'general':
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
        return NOTIFICATION_CATEGORIES.ADMIN;
      default:
        return NOTIFICATION_CATEGORIES.SYSTEM;
    }
  }, []);

  // Set up real-time subscription for new notifications with enhanced security
  useEffect(() => {
    fetchNotifications();

    if (!user?.id) return;

    // Set up real-time subscription with strict user filtering
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Additional client-side validation for security
          if (payload.new.user_id !== user.id) {
            console.warn('Received notification for different user, ignoring');
            return;
          }

          // Check if notification is expired
          if (
            payload.new.expires_at &&
            new Date(payload.new.expires_at) <= new Date()
          ) {
            console.log('Received expired notification, ignoring');
            return;
          }

          const newNotification = {
            ...payload.new,
            created_at: safeDate.toString(payload.new.created_at),
          } as Notification;

          setNotifications((prev) => {
            // Check for duplicates before adding
            const isDuplicate = prev.some(
              (n) =>
                n.id === newNotification.id ||
                (n.type === newNotification.type &&
                  n.related_issue_id === newNotification.related_issue_id &&
                  n.related_comment_id === newNotification.related_comment_id &&
                  n.related_solution_id ===
                    newNotification.related_solution_id &&
                  Math.abs(
                    new Date(n.created_at).getTime() -
                      new Date(newNotification.created_at).getTime()
                  ) < 5000)
            );

            if (isDuplicate) {
              console.log('Duplicate notification detected, ignoring');
              return prev;
            }

            return [newNotification, ...prev];
          });

          setHasNewNotifications(true);

          // Play notification sound if enabled in user preferences
          const preferences = getNotificationPreferences();
          if (preferences.soundEnabled) {
            playNotificationSound(true);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Additional client-side validation for security
          if (payload.new.user_id !== user.id) {
            console.warn(
              'Received notification update for different user, ignoring'
            );
            return;
          }

          const updatedNotification = {
            ...payload.new,
            created_at: safeDate.toString(payload.new.created_at),
          } as Notification;

          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user?.id]);

  // Memoized notification grouping and filtering
  const { groupedNotifications, unreadCount, filteredNotifications } =
    useMemo(() => {
      const unread = notifications.filter((n) => !n.read).length;

      // Group notifications by category
      const groups: Record<string, NotificationGroup> = {
        [NOTIFICATION_CATEGORIES.ISSUES]: {
          category: NOTIFICATION_CATEGORIES.ISSUES,
          notifications: [],
          unreadCount: 0,
        },
        [NOTIFICATION_CATEGORIES.ENGAGEMENT]: {
          category: NOTIFICATION_CATEGORIES.ENGAGEMENT,
          notifications: [],
          unreadCount: 0,
        },
        [NOTIFICATION_CATEGORIES.SYSTEM]: {
          category: NOTIFICATION_CATEGORIES.SYSTEM,
          notifications: [],
          unreadCount: 0,
        },
        [NOTIFICATION_CATEGORIES.ADMIN]: {
          category: NOTIFICATION_CATEGORIES.ADMIN,
          notifications: [],
          unreadCount: 0,
        },
      };

      notifications.forEach((notification) => {
        const category = getCategoryForNotification(notification.type);
        if (groups[category]) {
          groups[category].notifications.push(notification);
          if (!notification.read) {
            groups[category].unreadCount++;
          }
        }
      });

      // Filter notifications based on active tab
      let filtered = notifications;
      if (activeTab !== 'all') {
        const categoryKey = Object.keys(NOTIFICATION_CATEGORIES).find(
          (key) =>
            NOTIFICATION_CATEGORIES[
              key as keyof typeof NOTIFICATION_CATEGORIES
            ] === activeTab
        );
        if (categoryKey) {
          const category =
            NOTIFICATION_CATEGORIES[
              categoryKey as keyof typeof NOTIFICATION_CATEGORIES
            ];
          filtered = groups[category]?.notifications || [];
        } else if (activeTab === 'unread') {
          filtered = notifications.filter((n) => !n.read);
        }
      }

      return {
        groupedNotifications: groups,
        unreadCount: unread,
        filteredNotifications: filtered,
      };
    }, [notifications, activeTab, getCategoryForNotification]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const success = await markNotificationAsRead(notificationId, user.id);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? { ...n, read: true, read_at: new Date().toISOString() }
              : n
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const updatedCount = await markAllNotificationsAsRead(user.id);
      if (updatedCount > 0) {
        const now = new Date().toISOString();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true, read_at: now }))
        );
        setHasNewNotifications(false);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Enhanced notification click handler
  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  }, []);

  // Handle dropdown open/close
  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (open) {
      setHasNewNotifications(false);
    }
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Enhanced notification icon system with Lucide icons
  const getNotificationIcon = useCallback((type: string) => {
    const iconProps = { className: 'h-4 w-4' };

    switch (type) {
      case 'verification_approved':
        return <CheckCheck {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'verification_rejected':
        return <X {...iconProps} className="h-4 w-4 text-red-600" />;
      case 'role_changed':
        return <Users {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'status_change':
        return <Clock {...iconProps} className="h-4 w-4 text-orange-600" />;
      case 'issue_update':
        return <FileText {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'comment':
        return (
          <MessageSquare {...iconProps} className="h-4 w-4 text-purple-600" />
        );
      case 'solution':
        return <Lightbulb {...iconProps} className="h-4 w-4 text-yellow-600" />;
      case 'system':
        return <Settings {...iconProps} className="h-4 w-4 text-gray-600" />;
      case 'general':
        return <Info {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'info':
        return <Info {...iconProps} className="h-4 w-4 text-blue-600" />;
      case 'success':
        return <CheckCheck {...iconProps} className="h-4 w-4 text-green-600" />;
      case 'warning':
        return (
          <AlertCircle {...iconProps} className="h-4 w-4 text-yellow-600" />
        );
      case 'error':
        return <AlertCircle {...iconProps} className="h-4 w-4 text-red-600" />;
      default:
        return <Bell {...iconProps} className="h-4 w-4 text-blue-600" />;
    }
  }, []);

  // Enhanced priority color system with dark mode support
  const getPriorityColor = useCallback((priority: string, isRead: boolean) => {
    const baseClasses = isRead
      ? 'bg-muted/50 border-border dark:bg-muted/30 dark:border-border'
      : '';

    if (isRead) return baseClasses;

    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50';
      case 'high':
        return 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50';
      case 'normal':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50';
      case 'low':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-800/50';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50';
    }
  }, []);

  // Individual notification card component
  const NotificationCard = React.forwardRef<
    HTMLDivElement,
    { notification: Notification }
  >(({ notification }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`mb-2 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 ${getPriorityColor(
          notification.priority || 'normal',
          notification.read
        )}`}
        onClick={() => handleNotificationClick(notification)}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate text-foreground">
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                )}
                {notification.priority === 'urgent' && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    URGENT
                  </Badge>
                )}
                {notification.priority === 'high' && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1 py-0 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                  >
                    HIGH
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {notification.message}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(notification.created_at)}
                </span>
                {notification.action_url && (
                  <span className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    Click to view →
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ));

  // Add display name for debugging
  NotificationCard.displayName = 'NotificationCard';

  if (!user) return null;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`relative transition-all duration-200 hover:scale-105 ${
            hasNewNotifications ? 'animate-pulse' : ''
          }`}
        >
          <Bell
            className={`h-5 w-5 transition-colors duration-200 ${
              unreadCount > 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge
                variant="destructive"
                className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 bg-background/95 backdrop-blur-sm border-border/50 shadow-xl"
        sideOffset={8}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-auto p-1 text-xs hover:bg-background/50"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for categorization */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/30 m-2">
            <TabsTrigger value="all" className="text-xs">
              All
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread
            </TabsTrigger>
            <TabsTrigger
              value={NOTIFICATION_CATEGORIES.ISSUES}
              className="text-xs"
            >
              Issues
              {groupedNotifications[NOTIFICATION_CATEGORIES.ISSUES]
                ?.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {
                    groupedNotifications[NOTIFICATION_CATEGORIES.ISSUES]
                      .unreadCount
                  }
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={NOTIFICATION_CATEGORIES.ENGAGEMENT}
              className="text-xs"
            >
              Social
              {groupedNotifications[NOTIFICATION_CATEGORIES.ENGAGEMENT]
                ?.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {
                    groupedNotifications[NOTIFICATION_CATEGORIES.ENGAGEMENT]
                      .unreadCount
                  }
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={NOTIFICATION_CATEGORIES.SYSTEM}
              className="text-xs"
            >
              System
              {groupedNotifications[NOTIFICATION_CATEGORIES.SYSTEM]
                ?.unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                  {
                    groupedNotifications[NOTIFICATION_CATEGORIES.SYSTEM]
                      .unreadCount
                  }
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Content */}
          <div className="max-h-96 min-h-[200px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="mx-auto mb-2"
                  >
                    <Settings className="h-6 w-6 text-muted-foreground" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    Loading notifications...
                  </p>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {activeTab === 'unread'
                      ? 'No unread notifications'
                      : 'No notifications yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activeTab === 'all'
                      ? "You'll see notifications here when they arrive"
                      : ''}
                  </p>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-96 px-2">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                    />
                  ))}
                </AnimatePresence>
              </ScrollArea>
            )}
          </div>
        </Tabs>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
