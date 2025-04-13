import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
  onSearch?: (searchTerm: string) => void;
}

interface FilterState {
  category: string;
  status: string;
  sortBy: string;
}

const FilterBar = ({
  onFilterChange = () => {},
  onSearch = () => {},
}: FilterBarProps) => {
  const [filters, setFilters] = React.useState<FilterState>({
    category: "all",
    status: "all",
    sortBy: "newest",
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div
      className="w-full bg-background border-border rounded-lg p-4 flex flex-col gap-4 shadow-sm"
      data-testid="filter-bar"
    >
      <div className="flex items-center gap-4 w-full">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search issues..."
            className="pl-10"
            onChange={(e) => onSearch(e.target.value)}
            data-testid="search-input"
          />
        </div>

        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          data-testid="filter-button"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Select
          value={filters.category}
          onValueChange={(value) => handleFilterChange("category", value)}
          data-testid="filter-dropdown"
        >
          <SelectTrigger data-testid="category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="infrastructure">Infrastructure</SelectItem>
            <SelectItem value="safety">Safety</SelectItem>
            <SelectItem value="environment">Environment</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
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
          onValueChange={(value) => handleFilterChange("sortBy", value)}
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

      {/* Display active filters */}
      <div className="flex flex-wrap gap-2 mt-2" data-testid="active-filters">
        {filters.category !== "all" && (
          <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-md flex items-center gap-1">
            Category: {filters.category}
          </div>
        )}
        {filters.status !== "all" && (
          <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-md flex items-center gap-1">
            Status: {filters.status}
          </div>
        )}
        {filters.sortBy !== "newest" && (
          <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-md flex items-center gap-1">
            Sort: {filters.sortBy}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
