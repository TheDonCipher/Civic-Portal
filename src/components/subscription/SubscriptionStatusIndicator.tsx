import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Crown,
  Star,
  Building2,
  Lightbulb,
  Users,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Zap,
  ArrowRight,
  Info,
} from 'lucide-react';

interface SubscriptionStatusIndicatorProps {
  tier: 'motse' | 'thusang' | 'tirisano' | 'kgotla' | 'tlhaloso' | null;
  status: 'active' | 'pending' | 'cancelled' | 'expired' | 'trial' | null;
  variant?: 'compact' | 'detailed' | 'banner';
  showUpgradePrompt?: boolean;
  onUpgradeClick?: () => void;
  className?: string;
  tierLevel?: string; // For sub-tiers like ward/district/national
  showMmogoContext?: boolean; // Show Mmogo Impact Ecosystem context
}

// Enhanced Mmogo Impact Ecosystem Tier Configuration
export const tierConfig = {
  motse: {
    name: 'Motse Platform',
    setswanaName: 'Motse',
    description: 'Our Village - Free Foundation',
    fullDescription:
      'Universal access for all citizens. The bedrock that ensures everyone can participate in building stronger communities.',
    icon: Users,
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    category: 'foundation',
    pricing: 'Free Forever',
    valueProposition: 'Empowers citizens with essential civic engagement tools',
  },
  thusang: {
    name: 'Thusang Action Funds',
    setswanaName: 'Thusang',
    description: 'Community Action Funds',
    fullDescription:
      'Project-focused community crowdfunding with transparent funding and real impact tracking.',
    icon: Star,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    category: 'community',
    pricing: '5-7% platform fee',
    valueProposition: 'Direct community funding with complete transparency',
  },
  tirisano: {
    name: 'Tirisano Mmogo Business',
    setswanaName: 'Tirisano Mmogo',
    description: 'Business & Enterprise Solutions',
    fullDescription:
      'Value-driven community partnerships for enhanced brand reputation and hyperlocal insights.',
    icon: Building2,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    category: 'business',
    pricing: 'BWP 200-1500+/month',
    valueProposition: 'Enhanced community engagement with measurable impact',
  },
  kgotla: {
    name: 'Kgotla+ Governance',
    setswanaName: 'Kgotla+',
    description: 'Local Governance Solutions',
    fullDescription:
      'Efficiency & engagement tools for Ward Councilors, District Councils, and government entities.',
    icon: Crown,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    category: 'government',
    pricing: 'BWP 750-6500/month',
    valueProposition:
      'Demonstrable ROI through faster resolution & citizen satisfaction',
  },
  tlhaloso: {
    name: 'Tlhaloso Intelligence',
    setswanaName: 'Tlhaloso',
    description: 'Data & Insights Services',
    fullDescription:
      'Premium analytics for strategic decision-making with actionable intelligence.',
    icon: Lightbulb,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    category: 'analytics',
    pricing: 'BWP 1000+/report',
    valueProposition: 'Transform decision-making with data-driven insights',
  },
};

// Status configuration - moved outside component for reusability
export const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800',
    description: 'Your subscription is active and all features are available',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Your subscription is pending approval or payment processing',
  },
  cancelled: {
    label: 'Cancelled',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-800',
    description: 'Your subscription has been cancelled',
  },
  expired: {
    label: 'Expired',
    icon: AlertTriangle,
    color: 'bg-gray-100 text-gray-800',
    description: 'Your subscription has expired',
  },
  trial: {
    label: 'Trial',
    icon: Zap,
    color: 'bg-purple-100 text-purple-800',
    description: 'You are currently on a trial period',
  },
};

const SubscriptionStatusIndicator: React.FC<
  SubscriptionStatusIndicatorProps
> = ({
  tier,
  status,
  variant = 'compact',
  showUpgradePrompt = false,
  onUpgradeClick,
  className = '',
  tierLevel,
  showMmogoContext = false,
}) => {
  // Default to free tier if no tier specified
  const currentTier = tier || 'motse';
  const currentStatus = status || 'active';

  const tierInfo = tierConfig[currentTier];
  const statusInfo = statusConfig[currentStatus];

  const TierIcon = tierInfo.icon;
  const StatusIcon = statusInfo.icon;

  // Enhanced tier display with level information
  const getTierDisplayName = () => {
    let displayName = tierInfo.name;
    if (tierLevel) {
      switch (currentTier) {
        case 'kgotla':
          displayName += ` (${
            tierLevel.charAt(0).toUpperCase() + tierLevel.slice(1)
          })`;
          break;
        case 'tirisano':
          displayName += ` (${
            tierLevel.charAt(0).toUpperCase() + tierLevel.slice(1)
          })`;
          break;
      }
    }
    return displayName;
  };

  // Compact variant - just a small badge
  if (variant === 'compact') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge className={`${tierInfo.color} gap-1 ${className}`}>
              <TierIcon className="w-3 h-3" />
              {showMmogoContext ? tierInfo.setswanaName : getTierDisplayName()}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-2">
              <div>
                <p className="font-medium">{getTierDisplayName()}</p>
                {showMmogoContext && (
                  <p className="text-xs text-muted-foreground">
                    {tierInfo.setswanaName} • {tierInfo.category}
                  </p>
                )}
              </div>
              <p className="text-sm">
                {tierInfo.fullDescription || tierInfo.description}
              </p>
              <div className="flex items-center gap-1">
                <StatusIcon className="w-3 h-3" />
                <span className="text-sm">{statusInfo.label}</span>
              </div>
              {showMmogoContext && (
                <div className="pt-1 border-t">
                  <p className="text-xs font-medium text-blue-600">
                    {tierInfo.pricing}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tierInfo.valueProposition}
                  </p>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Detailed variant - shows more information
  if (variant === 'detailed') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${tierInfo.bgColor}`}>
                <TierIcon className={`w-5 h-5 ${tierInfo.textColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{getTierDisplayName()}</h3>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                  {showMmogoContext && (
                    <Badge variant="outline" className="text-xs">
                      {tierInfo.category}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {tierInfo.fullDescription || tierInfo.description}
                </p>
                {showMmogoContext && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-medium text-blue-600">
                      {tierInfo.pricing}
                    </span>
                    <span>•</span>
                    <span>{tierInfo.valueProposition}</span>
                  </div>
                )}
              </div>
            </div>
            {showUpgradePrompt && currentTier === 'motse' && (
              <Button
                variant="outline"
                size="sm"
                onClick={onUpgradeClick}
                className="gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Upgrade
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner variant - full-width notification style
  if (variant === 'banner') {
    const shouldShowUpgrade =
      showUpgradePrompt &&
      (currentTier === 'motse' || currentStatus === 'expired');

    return (
      <Card
        className={`border-l-4 ${tierInfo.color
          .replace('bg-', 'border-l-')
          .replace('-100', '-500')} ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${tierInfo.bgColor}`}>
                <TierIcon className={`w-6 h-6 ${tierInfo.textColor}`} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{tierInfo.name}</h3>
                  <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {statusInfo.description}
                </p>
                {currentTier === 'motse' && (
                  <p className="text-sm text-muted-foreground">
                    You're using the free tier. Upgrade to unlock premium
                    features and support the platform.
                  </p>
                )}
              </div>
            </div>
            {shouldShowUpgrade && (
              <div className="flex flex-col gap-2">
                <Button onClick={onUpgradeClick} className="gap-2">
                  <Zap className="w-4 h-4" />
                  {currentStatus === 'expired'
                    ? 'Renew Subscription'
                    : 'Upgrade Now'}
                </Button>
                {currentTier === 'motse' && (
                  <p className="text-xs text-muted-foreground text-center">
                    Starting from BWP 200/month
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

// Hook for getting subscription status
export const useSubscriptionStatus = (
  userRole?: string,
  isDemoMode?: boolean
) => {
  // In demo mode, return appropriate demo subscription based on Mmogo Impact Ecosystem
  if (isDemoMode) {
    switch (userRole) {
      case 'official':
        // Government officials get Kgotla+ Governance Solutions
        return { tier: 'kgotla' as const, status: 'active' as const };
      case 'admin':
        // Admins get Tlhaloso Data & Insights Services
        return { tier: 'tlhaloso' as const, status: 'active' as const };
      case 'business':
        // Business users get Tirisano Mmogo Business Solutions
        return { tier: 'tirisano' as const, status: 'active' as const };
      case 'citizen':
      default:
        // Citizens get free Motse Platform, but some may have Thusang project participation
        // Randomly show different tiers for demo variety
        const demoTiers = ['motse', 'thusang'] as const;
        const randomTier =
          demoTiers[Math.floor(Math.random() * demoTiers.length)];
        return { tier: randomTier, status: 'active' as const };
    }
  }

  // TODO: In real implementation, fetch from API
  return { tier: 'motse' as const, status: 'active' as const };
};

// Enhanced component for subscription feature gates
interface SubscriptionFeatureGateProps {
  requiredTier: string[];
  userTier?: string;
  userStatus?: 'active' | 'pending' | 'cancelled' | 'expired' | 'trial';
  fallbackMessage?: string;
  children: React.ReactNode;
  onUpgradeClick?: () => void;
  usageLimit?: number;
  currentUsage?: number;
  featureName?: string;
  variant?: 'card' | 'inline' | 'banner';
  showUsageWarning?: boolean;
}

export const SubscriptionFeatureGate: React.FC<
  SubscriptionFeatureGateProps
> = ({
  requiredTier,
  userTier = 'motse',
  userStatus = 'active',
  fallbackMessage = 'This feature requires a premium subscription.',
  children,
  onUpgradeClick,
  usageLimit,
  currentUsage,
  featureName,
  variant = 'card',
  showUsageWarning = true,
}) => {
  const hasAccess = requiredTier.includes(userTier) && userStatus === 'active';
  const isNearLimit =
    usageLimit && currentUsage && currentUsage / usageLimit > 0.8;
  const isOverLimit = usageLimit && currentUsage && currentUsage >= usageLimit;

  // Show usage warning for users with access but approaching limits
  if (hasAccess && showUsageWarning && isNearLimit && !isOverLimit) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800 dark:text-yellow-200">
            {featureName ? `${featureName}: ` : ''}
            You're approaching your usage limit ({currentUsage}/{usageLimit}).
            Consider upgrading to avoid interruptions.
          </span>
          {onUpgradeClick && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgradeClick}
              className="ml-auto"
            >
              Upgrade
            </Button>
          )}
        </div>
        {children}
      </div>
    );
  }

  // Block access if over limit or insufficient tier
  if (!hasAccess || isOverLimit) {
    const message = isOverLimit
      ? `You've reached your ${
          featureName || 'usage'
        } limit (${currentUsage}/${usageLimit}). Upgrade to continue.`
      : userStatus !== 'active'
      ? `Your subscription is ${userStatus}. Please update your subscription to access this feature.`
      : fallbackMessage;

    if (variant === 'inline') {
      return (
        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded border border-dashed">
          <Crown className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-muted-foreground">{message}</span>
          {onUpgradeClick && (
            <Button size="sm" variant="outline" onClick={onUpgradeClick}>
              Upgrade
            </Button>
          )}
        </div>
      );
    }

    if (variant === 'banner') {
      return (
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
            <Crown className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-purple-900 dark:text-purple-100">
              Premium Feature
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {message}
            </p>
          </div>
          {onUpgradeClick && (
            <Button
              onClick={onUpgradeClick}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          )}
        </div>
      );
    }

    // Default card variant
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Crown className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {isOverLimit ? 'Usage Limit Reached' : 'Premium Feature'}
              </h3>
              <p className="text-muted-foreground mb-4">{message}</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {requiredTier.map((tier) => (
                  <Badge key={tier} variant="outline">
                    {tierConfig[tier]?.name || tier}
                  </Badge>
                ))}
              </div>
              {usageLimit && currentUsage && (
                <div className="mb-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Current Usage: {currentUsage} / {usageLimit}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (currentUsage / usageLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <Button onClick={onUpgradeClick} className="gap-2">
                <ArrowRight className="w-4 h-4" />
                {isOverLimit ? 'Upgrade to Continue' : 'Upgrade to Access'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};

// Quick subscription info component for headers/navbars
export const QuickSubscriptionInfo: React.FC<{
  tier?: string;
  status?: string;
  compact?: boolean;
  onClick?: () => void;
}> = ({ tier = 'motse', status = 'active', compact = true, onClick }) => {
  const tierInfo = tierConfig[tier];
  const statusInfo = statusConfig[status];

  if (!tierInfo || !statusInfo) return null;

  const TierIcon = tierInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="gap-2 h-auto p-2"
    >
      <div className={`p-1 rounded ${tierInfo.bgColor}`}>
        <TierIcon className={`w-4 h-4 ${tierInfo.textColor}`} />
      </div>
      {!compact && (
        <div className="text-left">
          <p className="text-sm font-medium">{tierInfo.name}</p>
          <div className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            <span className="text-xs text-muted-foreground">
              {statusInfo.label}
            </span>
          </div>
        </div>
      )}
    </Button>
  );
};

export default SubscriptionStatusIndicator;
