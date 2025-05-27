/**
 * Optimized StatCard component with React.memo for performance
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'emerald';
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  onClick?: () => void;
  trend?: 'good' | 'bad' | 'neutral' | 'urgent' | null;
  className?: string;
  animationDelay?: number;
}

const colorVariants = {
  blue: {
    text: 'text-blue-600',
    bg: 'bg-blue-50',
    gradient: 'from-blue-400 to-blue-600',
    border: 'border-blue-200',
  },
  green: {
    text: 'text-green-600',
    bg: 'bg-green-50',
    gradient: 'from-green-400 to-green-600',
    border: 'border-green-200',
  },
  red: {
    text: 'text-red-600',
    bg: 'bg-red-50',
    gradient: 'from-red-400 to-red-600',
    border: 'border-red-200',
  },
  purple: {
    text: 'text-purple-600',
    bg: 'bg-purple-50',
    gradient: 'from-purple-400 to-purple-600',
    border: 'border-purple-200',
  },
  orange: {
    text: 'text-orange-600',
    bg: 'bg-orange-50',
    gradient: 'from-orange-400 to-orange-600',
    border: 'border-orange-200',
  },
  emerald: {
    text: 'text-emerald-600',
    bg: 'bg-emerald-50',
    gradient: 'from-emerald-400 to-emerald-600',
    border: 'border-emerald-200',
  },
};

const trendVariants = {
  good: 'text-green-600',
  bad: 'text-red-600',
  neutral: 'text-gray-600',
  urgent: 'text-red-600 animate-pulse',
};

const OptimizedStatCard = memo<StatCardProps>(({
  title,
  value,
  description,
  icon: Icon,
  color = 'blue',
  change,
  changeType = 'neutral',
  onClick,
  trend,
  className = '',
  animationDelay = 0,
}) => {
  const colorClasses = colorVariants[color];
  
  const changeIcon = changeType === 'increase' ? '↗' : changeType === 'decrease' ? '↘' : '';
  const changeColor = changeType === 'increase' ? 'text-green-600' : 
                     changeType === 'decrease' ? 'text-red-600' : 'text-gray-600';

  const cardContent = (
    <Card 
      className={`
        relative overflow-hidden transition-all duration-300 
        hover:shadow-lg hover:shadow-primary/5 
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${colorClasses.border}
        ${className}
      `}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 sm:p-3 rounded-lg ${colorClasses.bg}`}>
            <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${colorClasses.text}`} />
          </div>
          {change && (
            <div className={`text-xs sm:text-sm font-medium ${changeColor}`}>
              {changeIcon} {change}
            </div>
          )}
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          {trend && (
            <div className={`text-xs font-medium ${trendVariants[trend]}`}>
              {trend === 'good' && '✓ Good'}
              {trend === 'bad' && '⚠ Needs attention'}
              {trend === 'urgent' && '🚨 Urgent'}
              {trend === 'neutral' && '— Stable'}
            </div>
          )}
        </div>
        
        {/* Gradient bottom border */}
        <div 
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses.gradient}`} 
        />
      </CardContent>
    </Card>
  );

  if (onClick) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: animationDelay }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="group"
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className="group"
    >
      {cardContent}
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for optimal re-rendering
  return (
    prevProps.title === nextProps.title &&
    prevProps.value === nextProps.value &&
    prevProps.description === nextProps.description &&
    prevProps.color === nextProps.color &&
    prevProps.change === nextProps.change &&
    prevProps.changeType === nextProps.changeType &&
    prevProps.trend === nextProps.trend &&
    prevProps.className === nextProps.className &&
    prevProps.animationDelay === nextProps.animationDelay
  );
});

OptimizedStatCard.displayName = 'OptimizedStatCard';

export default OptimizedStatCard;
