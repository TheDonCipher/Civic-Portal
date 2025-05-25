import React from 'react';
import { MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { constituencies } from '@/lib/constituencies';

interface ConstituencySelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ConstituencySelector({
  value,
  onValueChange,
  placeholder = 'Select your constituency',
  disabled = false,
  className,
}: ConstituencySelectorProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="h-11">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {constituencies.map((constituency) => (
            <SelectItem 
              key={constituency} 
              value={constituency}
              className="capitalize"
            >
              {constituency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ConstituencySelector;
