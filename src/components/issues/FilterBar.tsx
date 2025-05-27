import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { constituencies } from '@/lib/constituencies';
import { departments } from '@/lib/demoData';
import { getAllCategories } from '@/lib/api/categoriesApi';

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  onSearch?: (searchTerm: string) => void;
}

interface FilterState {
  category: string;
  status: string;
  sortBy: string;
  department: string;
  constituency: string;
}

// Fallback categories if database table doesn't exist
const fallbackCategories = [
  'Infrastructure',
  'Healthcare',
  'Education',
  'Environment',
  'Water & Sanitation',
  'Youth Development',
  'Agriculture',
  'Public Safety',
  'Local Government',
  'Energy',
  'Technology',
  'Sports & Culture',
  'Trade & Business',
  'Finance',
  'International Affairs',
  'Higher Education',
  'Labour',
];

interface Category {
  id: string;
  name: string;
  description?: string;
  department_id?: string;
}

const FilterBar = ({
  onFilterChange = () => {},
  onSearch = () => {},
}: FilterBarProps) => {
  const [filters, setFilters] = React.useState<FilterState>({
    category: 'all',
    status: 'all',
    sortBy: 'newest',
    department: 'all',
    constituency: 'all',
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories from database or use fallback
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.warn('Error fetching categories:', error);
        // Use fallback categories
        const fallbackCategoryObjects = fallbackCategories.map(
          (name, index) => ({
            id: (index + 1).toString(),
            name,
            description: '',
            department_id: '',
          })
        );
        setCategories(fallbackCategoryObjects);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const defaultFilters = {
      category: 'all',
      status: 'all',
      sortBy: 'newest',
      department: 'all',
      constituency: 'all',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(
    (value, index) => value !== ['all', 'all', 'newest', 'all', 'all'][index]
  );

  return (
    <div
      className="w-full bg-background border-border rounded-lg mobile-padding py-4 flex flex-col gap-4 shadow-sm"
      data-testid="filter-bar"
    >
      <div className="flex items-center gap-2 sm:gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search issues..."
            className="pl-10 touch-target"
            onChange={(e) => onSearch(e.target.value)}
            data-testid="search-input"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 touch-target"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          data-testid="filter-button"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 touch-target text-muted-foreground hover:text-foreground"
            onClick={clearAllFilters}
            data-testid="clear-filters-button"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Basic Filters - Always Visible */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange('category', value)}
          data-testid="filter-dropdown"
        >
          <SelectTrigger data-testid="category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesLoading ? (
              <SelectItem value="loading" disabled>
                Loading categories...
              </SelectItem>
            ) : (
              categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
          data-testid="status-filter"
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(value) => handleFilterChange('sortBy', value)}
          data-testid="sort-filter"
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="most-votes">Most Votes</SelectItem>
            <SelectItem value="least-votes">Least Votes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters - Collapsible */}
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border/50">
          <Select
            value={filters.department}
            onValueChange={(value) => handleFilterChange('department', value)}
            data-testid="department-filter"
          >
            <SelectTrigger>
              <SelectValue placeholder="Department" />
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

          <Select
            value={filters.constituency}
            onValueChange={(value) => handleFilterChange('constituency', value)}
            data-testid="constituency-filter"
          >
            <SelectTrigger>
              <SelectValue placeholder="Constituency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Constituencies</SelectItem>
              {constituencies.map((constituency) => (
                <SelectItem key={constituency} value={constituency}>
                  {constituency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Display active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2" data-testid="active-filters">
          {filters.category !== 'all' && (
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              Category: {filters.category}
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.status !== 'all' && (
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              Status: {filters.status}
              <button
                onClick={() => handleFilterChange('status', 'all')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.sortBy !== 'newest' && (
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              Sort: {filters.sortBy}
              <button
                onClick={() => handleFilterChange('sortBy', 'newest')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.department !== 'all' && (
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              Dept:{' '}
              {departments.find((d) => d.id === filters.department)?.name ||
                filters.department}
              <button
                onClick={() => handleFilterChange('department', 'all')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
          {filters.constituency !== 'all' && (
            <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full flex items-center gap-1">
              Constituency: {filters.constituency}
              <button
                onClick={() => handleFilterChange('constituency', 'all')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
