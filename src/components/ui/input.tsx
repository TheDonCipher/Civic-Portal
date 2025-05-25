import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-input px-3 py-2 text-sm shadow-sm transition-all duration-200',
          'bg-background/50 backdrop-blur-sm',
          'placeholder:text-muted-foreground/70',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
          'focus-visible:border-blue-500/50 dark:focus-visible:border-blue-400/50',
          'hover:border-blue-300/50 dark:hover:border-blue-600/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          // Enhanced dark mode support
          'dark:bg-gray-800/50 dark:border-gray-600/50',
          'dark:text-gray-100 dark:placeholder:text-gray-400/70',
          // Better contrast and readability
          'text-gray-900 border-gray-300/60',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
