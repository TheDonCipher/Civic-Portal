import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  Send,
  Users,
  UserCheck,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface NotificationForm {
  title: string;
  message: string;
  type: string;
  priority: string;
  targetAudience: string;
  departmentId?: string;
  sendNotifications: boolean;
}

interface Department {
  id: string;
  name: string;
}

const AdminNotificationSender: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [userCounts, setUserCounts] = useState({
    total: 0,
    citizens: 0,
    officials: 0,
    admins: 0,
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'general',
    priority: 'normal',
    targetAudience: 'all',
    sendNotifications: true,
  });

  // Fetch departments and user counts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch departments
        const { data: deptData, error: deptError } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');

        if (deptError) throw deptError;
        setDepartments(deptData || []);

        // Fetch user counts
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('role');

        if (profilesError) throw profilesError;

        const counts = {
          total: profilesData?.length || 0,
          citizens:
            profilesData?.filter((p) => p.role === 'citizen').length || 0,
          officials:
            profilesData?.filter((p) => p.role === 'official').length || 0,
          admins: profilesData?.filter((p) => p.role === 'admin').length || 0,
        };
        setUserCounts(counts);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && profile?.role === 'admin') {
      fetchData();
    }
  }, [user, profile, toast]);

  const handleInputChange = (
    field: keyof NotificationForm,
    value: string | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getTargetUserCount = () => {
    switch (form.targetAudience) {
      case 'citizens':
        return userCounts.citizens;
      case 'officials':
        return userCounts.officials;
      case 'admins':
        return userCounts.admins;
      default:
        return userCounts.total;
    }
  };

  const handleSendNotification = async () => {
    if (!user || profile?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Only administrators can send platform notifications.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.title.trim() || !form.message.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both title and message fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // Create platform update with notifications
      const { data, error } = await supabase.rpc(
        'create_platform_update_with_notifications',
        {
          p_title: form.title,
          p_content: form.message,
          p_type: form.type,
          p_priority: form.priority,
          p_author_id: user.id,
          p_department_id: form.departmentId || null,
          p_target_audience: form.targetAudience,
          p_send_notifications: form.sendNotifications,
        }
      );

      if (error) throw error;

      toast({
        title: 'Success!',
        description: `Platform update created and notifications sent to ${getTargetUserCount()} users.`,
      });

      // Reset form
      setForm({
        title: '',
        message: '',
        type: 'general',
        priority: 'normal',
        targetAudience: 'all',
        sendNotifications: true,
      });
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'citizens':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'officials':
        return <UserCheck className="h-4 w-4 text-blue-500" />;
      case 'admins':
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user || profile?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Access denied. Administrator privileges required.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Send Platform Notification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter notification title..."
                maxLength={100}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message Content</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Enter your message content..."
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-muted-foreground">
                {form.message.length}/500 characters
              </p>
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Update Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="feature">New Feature</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="policy">Policy Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Select
                  value={form.priority}
                  onValueChange={(value) =>
                    handleInputChange('priority', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={form.targetAudience}
                onValueChange={(value) =>
                  handleInputChange('targetAudience', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    All Users ({userCounts.total})
                  </SelectItem>
                  <SelectItem value="citizens">
                    Citizens ({userCounts.citizens})
                  </SelectItem>
                  <SelectItem value="officials">
                    Officials ({userCounts.officials})
                  </SelectItem>
                  <SelectItem value="admins">
                    Administrators ({userCounts.admins})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <Label>Department (Optional)</Label>
              <Select
                value={form.departmentId || 'all'}
                onValueChange={(value) =>
                  handleInputChange(
                    'departmentId',
                    value === 'all' ? undefined : value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Preview</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(form.priority)}
                  <span className="font-medium">
                    {form.title || 'Notification Title'}
                  </span>
                  <Badge variant="outline" className="ml-auto">
                    {form.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {form.message || 'Message content will appear here...'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getAudienceIcon(form.targetAudience)}
                  <span>Will be sent to {getTargetUserCount()} users</span>
                </div>
              </div>
            </div>

            {/* Send Button */}
            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogTrigger asChild>
                <Button
                  className="w-full"
                  disabled={
                    !form.title.trim() || !form.message.trim() || isSending
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Notification</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to send this notification to{' '}
                    {getTargetUserCount()} users? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <div className="space-y-2">
                    <p>
                      <strong>Title:</strong> {form.title}
                    </p>
                    <p>
                      <strong>Type:</strong> {form.type}
                    </p>
                    <p>
                      <strong>Priority:</strong> {form.priority}
                    </p>
                    <p>
                      <strong>Audience:</strong> {form.targetAudience} (
                      {getTargetUserCount()} users)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                    disabled={isSending}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSendNotification} disabled={isSending}>
                    {isSending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Send
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminNotificationSender;
