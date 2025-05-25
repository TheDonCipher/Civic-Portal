import React from 'react';
import { Users, Building2, Info, CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface RoleExplainerProps {
  selectedRole?: 'citizen' | 'official';
  onRoleSelect?: (role: 'citizen' | 'official') => void;
  className?: string;
}

const roleData = {
  citizen: {
    title: 'Citizen',
    icon: Users,
    description: 'Community member who can report and track civic issues',
    features: [
      'Report civic issues in your area',
      'Vote and comment on issues',
      'Track issue progress and updates',
      'Propose solutions to problems',
      'Follow issues of interest',
      'Engage with community discussions',
    ],
    requirements: [
      'Valid email address',
      'Botswana constituency selection',
      'Email verification',
    ],
    badge: 'Community Member',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
  },
  official: {
    title: 'Government Official',
    icon: Building2,
    description:
      'Government stakeholder who manages and responds to civic issues',
    features: [
      'Manage department-specific issues',
      'Update issue status and progress',
      'Provide official responses',
      'Access department analytics',
      'Coordinate with other departments',
      'Publish official updates',
    ],
    requirements: [
      'Valid government email address',
      'Official identity verification',
      'Admin approval required',
      'Department assignment',
    ],
    badge: 'Requires Verification',
    color: 'bg-amber-50 border-amber-200 text-amber-900',
  },
};

export function RoleExplainer({
  selectedRole,
  onRoleSelect,
  className,
}: RoleExplainerProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Choose Your Role</h3>
        <p className="text-sm text-muted-foreground">
          Select the role that best describes your relationship with Botswana's
          civic community
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(roleData).map(([role, data]) => {
          const Icon = data.icon;
          const isSelected = selectedRole === role;

          return (
            <Card
              key={role}
              className={cn(
                'role-card-enhanced cursor-pointer transition-all duration-300',
                isSelected && 'selected',
                data.color
              )}
              onClick={() => onRoleSelect?.(role as 'citizen' | 'official')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="civic-icon">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{data.title}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {data.badge}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
                <CardDescription className="text-sm">
                  {data.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features */}
                <div>
                  <h4 className="text-sm font-medium mb-2">What you can do:</h4>
                  <ul className="space-y-1">
                    {data.features.slice(0, 3).map((feature, index) => (
                      <li
                        key={index}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    {data.features.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{data.features.length - 3} more features
                      </li>
                    )}
                  </ul>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                  <ul className="space-y-1">
                    {data.requirements.map((requirement, index) => (
                      <li
                        key={index}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      {selectedRole === 'official' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Government Official accounts require verification.</strong>{' '}
            After registration, your account will be reviewed by administrators.
            You'll receive an email notification once your account is approved
            and you're assigned to a department.
          </AlertDescription>
        </Alert>
      )}

      {selectedRole === 'citizen' && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Citizen accounts are activated immediately.</strong> You'll
            be able to start reporting issues and engaging with your community
            right after email verification.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactRoleExplainer({
  selectedRole,
  onRoleSelect,
  className,
}: RoleExplainerProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3">
        {Object.entries(roleData).map(([role, data]) => {
          const Icon = data.icon;
          const isSelected = selectedRole === role;

          return (
            <div
              key={role}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                isSelected && 'ring-2 ring-primary ring-offset-1',
                'hover:bg-muted/50'
              )}
              onClick={() => onRoleSelect?.(role as 'citizen' | 'official')}
            >
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">{data.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {data.badge}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.description}
                </p>
              </div>
              {isSelected && <CheckCircle className="w-4 h-4 text-primary" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoleExplainer;
