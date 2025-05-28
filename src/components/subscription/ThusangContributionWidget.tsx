import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Coins,
  Heart,
  Users,
  Target,
  TrendingUp,
  Star,
  Calendar,
  MapPin,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useDemoMode } from '@/providers/DemoProvider';
import { useToast } from '@/components/ui/use-toast';

interface ThusangContributionWidgetProps {
  issueId: string;
  issueTitle: string;
  issueLocation?: string;
  currentFunding?: number;
  goalAmount?: number;
  contributorsCount?: number;
  daysLeft?: number;
  variant?: 'compact' | 'detailed' | 'inline';
  showProgress?: boolean;
  className?: string;
}

const ThusangContributionWidget: React.FC<ThusangContributionWidgetProps> = ({
  issueId,
  issueTitle,
  issueLocation,
  currentFunding = 0,
  goalAmount = 5000,
  contributorsCount = 0,
  daysLeft = 30,
  variant = 'compact',
  showProgress = true,
  className = '',
}) => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [contributionAmount, setContributionAmount] = useState(25);
  const [isContributing, setIsContributing] = useState(false);

  const progressPercentage = Math.min((currentFunding / goalAmount) * 100, 100);
  const remainingAmount = Math.max(goalAmount - currentFunding, 0);

  const predefinedAmounts = [10, 25, 50, 100, 250];

  const handleContribution = async (amount: number) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to contribute to community projects.',
        variant: 'destructive',
      });
      return;
    }

    setIsContributing(true);

    try {
      if (isDemoMode) {
        // Simulate contribution in demo mode
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast({
          title: '🎉 Contribution Successful!',
          description: `Your BWP ${amount} contribution to "${issueTitle}" has been processed. Thank you for supporting your community!`,
          duration: 5000,
        });
      } else {
        // TODO: Implement real contribution logic
        // This would integrate with payment providers like Orange Money, MyZaka, etc.
        console.log('Processing contribution:', { issueId, amount });
      }

      setIsContributionDialogOpen(false);
      setContributionAmount(25);
    } catch (error) {
      toast({
        title: 'Contribution Failed',
        description: 'There was an error processing your contribution. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsContributing(false);
    }
  };

  // Compact variant for issue cards
  if (variant === 'compact') {
    return (
      <div className={`space-y-2 ${className}`}>
        {showProgress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Community Funding</span>
              <span className="font-medium">BWP {currentFunding.toLocaleString()} / {goalAmount.toLocaleString()}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{contributorsCount} contributors</span>
            <Calendar className="w-3 h-3 ml-2" />
            <span>{daysLeft} days left</span>
          </div>
          
          <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 text-xs">
                <Coins className="w-3 h-3" />
                Fund
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  Support Community Project
                </DialogTitle>
                <DialogDescription>
                  Help fund "{issueTitle}" through the Thusang Community Action Fund
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Project Info */}
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{issueLocation || 'Community Project'}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">
                            BWP {currentFunding.toLocaleString()} / {goalAmount.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{contributorsCount} contributors</span>
                          <span>{daysLeft} days remaining</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contribution Amount Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Choose your contribution</label>
                  <div className="grid grid-cols-3 gap-2">
                    {predefinedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={contributionAmount === amount ? "default" : "outline"}
                        size="sm"
                        onClick={() => setContributionAmount(amount)}
                        className="text-xs"
                      >
                        BWP {amount}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Custom amount"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(Number(e.target.value))}
                      min={1}
                      max={10000}
                      className="text-sm"
                    />
                    <span className="text-sm text-muted-foreground">BWP</span>
                  </div>
                </div>

                {/* Platform Fee Information */}
                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Transparent Funding</span>
                  </div>
                  <p className="text-muted-foreground">
                    BWP {(contributionAmount * 0.95).toFixed(0)} goes directly to the project • 
                    BWP {(contributionAmount * 0.05).toFixed(0)} platform fee (5%) supports portal operations
                  </p>
                </div>

                {/* Contribution Button */}
                <Button
                  onClick={() => handleContribution(contributionAmount)}
                  disabled={isContributing || contributionAmount < 1}
                  className="w-full gap-2"
                >
                  {isContributing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Contribute BWP {contributionAmount}
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  // Detailed variant for dedicated project pages
  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Thusang Community Funding
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                BWP {currentFunding.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">raised</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {contributorsCount}
              </div>
              <div className="text-sm text-muted-foreground">contributors</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Goal: BWP {goalAmount.toLocaleString()}</span>
              <span>{progressPercentage.toFixed(1)}% funded</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {daysLeft} days left
            </Badge>
            
            <Button
              onClick={() => setIsContributionDialogOpen(true)}
              className="gap-2"
            >
              <Coins className="w-4 h-4" />
              Contribute Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Inline variant for embedding in other components
  return (
    <div className={`flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <Coins className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium">Community Funding</span>
      </div>
      
      <div className="flex-1 text-xs text-muted-foreground">
        BWP {currentFunding.toLocaleString()} / {goalAmount.toLocaleString()} • {contributorsCount} contributors
      </div>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsContributionDialogOpen(true)}
        className="gap-1"
      >
        <ArrowRight className="w-3 h-3" />
        Fund
      </Button>
    </div>
  );
};

export default ThusangContributionWidget;
