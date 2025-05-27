import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/common/PageTitle';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Megaphone,
  Settings,
  Info,
  Zap,
} from 'lucide-react';
import { formatters } from '@/lib/utils/dateUtils';

interface PlatformUpdate {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  author_name: string;
  author_role: string;
  department_name?: string;
  target_audience: string;
  published_at: string;
  view_count: number;
  total_count: number;
}

interface Department {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 10;

const PlatformUpdatesPage: React.FC = () => {
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<PlatformUpdate[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Fetch platform updates
  const fetchUpdates = async () => {
    setIsLoading(true);
    try {
      if (isDemoMode) {
        // Demo data for platform updates
        const demoUpdates: PlatformUpdate[] = [
          {
            id: '1',
            title: 'New Feature: Enhanced Issue Tracking',
            content:
              'We have launched an enhanced issue tracking system with real-time updates and improved notifications.',
            type: 'feature',
            priority: 'high',
            author_name: 'System Administrator',
            author_role: 'admin',
            department_name: 'IT Department',
            target_audience: 'all',
            published_at: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            view_count: 245,
            total_count: 5,
          },
          {
            id: '2',
            title: 'Scheduled Maintenance Notice',
            content:
              'The platform will undergo scheduled maintenance on Sunday, 3 AM - 6 AM. Some features may be temporarily unavailable.',
            type: 'maintenance',
            priority: 'urgent',
            author_name: 'Technical Team',
            author_role: 'admin',
            target_audience: 'all',
            published_at: new Date(
              Date.now() - 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            view_count: 189,
            total_count: 5,
          },
          {
            id: '3',
            title: 'Policy Update: Community Guidelines',
            content:
              'We have updated our community guidelines to ensure a more respectful and productive environment for all users.',
            type: 'policy',
            priority: 'normal',
            author_name: 'Community Manager',
            author_role: 'admin',
            target_audience: 'all',
            published_at: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            view_count: 156,
            total_count: 5,
          },
          {
            id: '4',
            title: 'Welcome to the Civic Portal',
            content:
              'Welcome to the new Civic Portal! This platform allows citizens to report issues, track progress, and engage with government officials.',
            type: 'announcement',
            priority: 'normal',
            author_name: 'Portal Administrator',
            author_role: 'admin',
            target_audience: 'all',
            published_at: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
            view_count: 423,
            total_count: 5,
          },
          {
            id: '5',
            title: 'Mobile App Coming Soon',
            content:
              'We are excited to announce that a mobile application for the Civic Portal is currently in development and will be available soon.',
            type: 'announcement',
            priority: 'normal',
            author_name: 'Development Team',
            author_role: 'admin',
            target_audience: 'all',
            published_at: new Date(
              Date.now() - 21 * 24 * 60 * 60 * 1000
            ).toISOString(),
            view_count: 312,
            total_count: 5,
          },
        ];

        // Apply filters
        let filteredUpdates = demoUpdates;
        if (searchTerm) {
          filteredUpdates = filteredUpdates.filter(
            (update) =>
              update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              update.content.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        if (selectedType && selectedType !== 'all') {
          filteredUpdates = filteredUpdates.filter(
            (update) => update.type === selectedType
          );
        }

        // Apply pagination
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const paginatedUpdates = filteredUpdates.slice(
          startIndex,
          startIndex + ITEMS_PER_PAGE
        );

        setUpdates(paginatedUpdates);
        setTotalCount(filteredUpdates.length);
      } else {
        // Real data from database - fallback to direct table query
        try {
          let query = supabase
            .from('platform_updates')
            .select(
              `
              id,
              title,
              content,
              type,
              priority,
              target_audience,
              published_at,
              view_count,
              profiles!platform_updates_author_id_fkey(
                full_name,
                role
              ),
              departments(
                name
              )
            `
            )
            .eq('is_published', true)
            .order('published_at', { ascending: false });

          // Apply filters
          if (selectedType && selectedType !== 'all') {
            query = query.eq('type', selectedType);
          }

          if (selectedDepartment && selectedDepartment !== 'all') {
            query = query.eq('department_id', selectedDepartment);
          }

          if (searchTerm) {
            query = query.or(
              `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`
            );
          }

          // Get total count first
          const { count } = await query.select('*', {
            count: 'exact',
            head: true,
          });
          setTotalCount(count || 0);

          // Apply pagination
          const offset = (currentPage - 1) * ITEMS_PER_PAGE;
          const { data, error } = await query.range(
            offset,
            offset + ITEMS_PER_PAGE - 1
          );

          if (error) throw error;

          // Transform data to match expected interface
          const transformedData = (data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            type: item.type,
            priority: item.priority,
            author_name: item.profiles?.full_name || 'Unknown',
            author_role: item.profiles?.role || 'admin',
            department_name: item.departments?.name || null,
            target_audience: item.target_audience,
            published_at: item.published_at,
            view_count: item.view_count || 0,
            total_count: count || 0,
          }));

          setUpdates(transformedData);
        } catch (dbError) {
          console.warn(
            'Platform updates table not available, using demo data:',
            dbError
          );
          // Fallback to demo data if table doesn't exist
          setUpdates([]);
          setTotalCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching platform updates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load platform updates. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    if (isDemoMode) return;

    try {
      const { data, error } = await supabase
        .from('departments')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [currentPage, searchTerm, selectedType, selectedDepartment, isDemoMode]);

  useEffect(() => {
    fetchDepartments();
  }, [isDemoMode]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTypeFilter = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleDepartmentFilter = (value: string) => {
    setSelectedDepartment(value);
    setCurrentPage(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'feature':
        return <Zap className="h-4 w-4 text-blue-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-orange-500" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-green-500" />;
      case 'policy':
        return <Info className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <PageTitle
          title="Platform Updates"
          description="Stay informed about the latest platform announcements, features, and maintenance updates"
        />

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search updates..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={selectedType} onValueChange={handleTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="feature">Features</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="announcement">Announcements</SelectItem>
                  <SelectItem value="policy">Policy Updates</SelectItem>
                </SelectContent>
              </Select>

              {/* Department Filter */}
              {!isDemoMode && (
                <Select
                  value={selectedDepartment}
                  onValueChange={handleDepartmentFilter}
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
              )}

              {/* Clear Filters */}
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                  setSelectedDepartment('all');
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Updates List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading updates...</span>
                </div>
              </CardContent>
            </Card>
          ) : updates.length === 0 ? (
            <Card>
              <CardContent className="p-8">
                <div className="text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No platform updates found.</p>
                  {(searchTerm || selectedType || selectedDepartment) && (
                    <p className="text-sm mt-2">Try adjusting your filters.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${update.author_name}`}
                          alt={update.author_name}
                        />
                        <AvatarFallback>
                          {update.author_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {getTypeIcon(update.type)}
                            <h3 className="font-semibold text-lg">
                              {update.title}
                            </h3>
                            <Badge
                              className={getPriorityColor(update.priority)}
                            >
                              {update.priority}
                            </Badge>
                            <Badge variant="outline">{update.type}</Badge>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed">
                          {update.content}
                        </p>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{update.author_name}</span>
                            <Badge variant="secondary" className="ml-1">
                              {update.author_role}
                            </Badge>
                          </div>

                          {update.department_name && (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              <span>{update.department_name}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatters.relative(update.published_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 ml-auto">
                            <span>{update.view_count} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of{' '}
                  {totalCount} updates
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? 'default' : 'outline'
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default PlatformUpdatesPage;
