import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Grid3X3,
  List,
  LayoutGrid,
  Columns,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type IssueGridLayout = 'grid' | 'list' | 'masonry';

interface LayoutOption {
  id: IssueGridLayout;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  recommended?: boolean;
  mmogoOptimized?: boolean;
}

interface IssueGridLayoutSwitcherProps {
  currentLayout: IssueGridLayout;
  onLayoutChange: (layout: IssueGridLayout) => void;
  className?: string;
}

const layoutOptions: LayoutOption[] = [
  {
    id: 'grid',
    name: 'Card Grid',
    description: 'Traditional card-based grid layout',
    icon: Grid3X3,
    recommended: true,
    mmogoOptimized: true,
  },
  {
    id: 'masonry',
    name: 'Masonry Grid',
    description: 'Dynamic height cards for better content visibility',
    icon: LayoutGrid,
    mmogoOptimized: true,
  },
  {
    id: 'list',
    name: 'List View',
    description: 'Compact horizontal list layout',
    icon: List,
  },
];

const IssueGridLayoutSwitcher: React.FC<IssueGridLayoutSwitcherProps> = ({
  currentLayout,
  onLayoutChange,
  className = '',
}) => {
  const currentOption = layoutOptions.find(
    (option) => option.id === currentLayout
  );
  const CurrentIcon = currentOption?.icon || Grid3X3;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 h-9 px-3 border-border/60 hover:border-primary/30 transition-all duration-200',
            className
          )}
        >
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">
            {currentOption?.name || 'Layout'}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          Layout Options
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {layoutOptions.map((option) => {
          const OptionIcon = option.icon;
          const isActive = currentLayout === option.id;

          return (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onLayoutChange(option.id)}
              className={cn(
                'flex items-start gap-3 p-3 cursor-pointer',
                isActive && 'bg-primary/10 text-primary'
              )}
            >
              <OptionIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{option.name}</span>
                  {option.recommended && (
                    <Badge
                      variant="secondary"
                      className="text-xs px-1.5 py-0.5"
                    >
                      Recommended
                    </Badge>
                  )}
                  {option.mmogoOptimized && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1.5 py-0.5 border-blue-200 text-blue-700 bg-blue-50"
                    >
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                      Mmogo
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </div>
              {isActive && (
                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
              )}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <div className="p-2">
          <p className="text-xs text-muted-foreground text-center">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Mmogo-optimized layouts showcase funding widgets better
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default IssueGridLayoutSwitcher;
