import React from 'react';
import { Building2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DepartmentSelectorProps {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Complete list of 18 Botswana government departments
const departments = [
  {
    name: 'Finance',
    description: 'Financial management and economic policy',
    category: 'Economic Affairs',
  },
  {
    name: 'International Relations',
    description: 'Foreign affairs and diplomatic relations',
    category: 'External Affairs',
  },
  {
    name: 'Health',
    description: 'Public health services and medical care',
    category: 'Social Services',
  },
  {
    name: 'Child Welfare and Basic Education',
    description: 'Primary education and child protection services',
    category: 'Education & Welfare',
  },
  {
    name: 'Higher Education',
    description: 'Tertiary education and research institutions',
    category: 'Education & Welfare',
  },
  {
    name: 'Lands and Agriculture',
    description: 'Land management and agricultural development',
    category: 'Natural Resources',
  },
  {
    name: 'Youth and Gender Affairs',
    description: 'Youth development and gender equality programs',
    category: 'Social Services',
  },
  {
    name: 'State Presidency',
    description: 'Executive office and presidential administration',
    category: 'Administration',
  },
  {
    name: 'Justice and Correctional Services',
    description: 'Legal system and correctional facilities',
    category: 'Justice & Security',
  },
  {
    name: 'Local Government and Traditional Affairs',
    description: 'Local governance and traditional leadership',
    category: 'Governance',
  },
  {
    name: 'Minerals and Energy',
    description: 'Mining sector and energy resources',
    category: 'Natural Resources',
  },
  {
    name: 'Communications and Innovation',
    description: 'ICT development and innovation initiatives',
    category: 'Technology & Innovation',
  },
  {
    name: 'Environment and Tourism',
    description: 'Environmental protection and tourism development',
    category: 'Environment & Tourism',
  },
  {
    name: 'Labour and Home Affairs',
    description: 'Employment services and internal affairs',
    category: 'Internal Affairs',
  },
  {
    name: 'Sports and Arts',
    description: 'Sports development and cultural affairs',
    category: 'Culture & Sports',
  },
  {
    name: 'Trade and Entrepreneurship',
    description: 'Business development and trade promotion',
    category: 'Economic Affairs',
  },
  {
    name: 'Transport and Infrastructure',
    description: 'Transportation systems and infrastructure development',
    category: 'Infrastructure',
  },
  {
    name: 'Water and Human Settlement',
    description: 'Water resources and housing development',
    category: 'Infrastructure',
  },
];

// Group departments by category for better organization
const departmentsByCategory = departments.reduce((acc, dept) => {
  if (!acc[dept.category]) {
    acc[dept.category] = [];
  }
  acc[dept.category]!.push(dept);
  return acc;
}, {} as Record<string, typeof departments>);

export function DepartmentSelector({
  value,
  onValueChange,
  placeholder = 'Select your department',
  disabled = false,
  className,
}: DepartmentSelectorProps) {
  const selectedDepartment = departments.find((dept) => dept.name === value);

  return (
    <div className={cn('space-y-3', className)}>
      <Select
        value={value || ''}
        {...(onValueChange && { onValueChange })}
        disabled={disabled}
      >
        <SelectTrigger className="h-11">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {Object.entries(departmentsByCategory).map(([category, depts]) => (
            <div key={category}>
              <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                {category}
              </div>
              {depts.map((department) => (
                <SelectItem
                  key={department.name}
                  value={department.name}
                  className="pl-6 py-3"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">{department.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {department.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>

      {/* Selected department info */}
      {selectedDepartment && (
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border">
          <Building2 className="w-4 h-4 text-primary mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                {selectedDepartment.name}
              </span>
              <Badge variant="secondary" className="text-xs">
                {selectedDepartment.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedDepartment.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default DepartmentSelector;
