import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthDialog from '../auth/AuthDialog';
import { useAuth } from '@/lib/auth';

export function AuthDialogDebug() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'enhanced' | 'basic'>(
    'enhanced'
  );
  const [defaultTab, setDefaultTab] = useState<'sign-in' | 'sign-up'>(
    'sign-in'
  );
  const { user, profile } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">🇧🇼 AuthDialog Debug Panel</h1>
          <p className="text-muted-foreground">
            Test the improved AuthDialog component with Botswana branding
          </p>
        </div>
        <div className="space-y-4">
          {/* Current Auth State */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">
              Current Authentication State:
            </h3>
            <p>
              <strong>User:</strong> {user ? `${user.email}` : 'Not logged in'}
            </p>
            <p>
              <strong>Profile:</strong>{' '}
              {profile
                ? `${profile.full_name} (${profile.role})`
                : 'No profile'}
            </p>
          </div>

          {/* Dialog Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Dialog Mode:
              </label>
              <div className="flex gap-2">
                <Button
                  variant={dialogMode === 'enhanced' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDialogMode('enhanced')}
                >
                  Enhanced
                </Button>
                <Button
                  variant={dialogMode === 'basic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDialogMode('basic')}
                >
                  Basic
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Default Tab:
              </label>
              <div className="flex gap-2">
                <Button
                  variant={defaultTab === 'sign-in' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDefaultTab('sign-in')}
                >
                  Sign In
                </Button>
                <Button
                  variant={defaultTab === 'sign-up' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDefaultTab('sign-up')}
                >
                  Sign Up
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="w-full"
                size="lg"
              >
                🚀 Open AuthDialog ({dialogMode} mode)
              </Button>
            </div>
          </div>

          {/* Features List */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              ✨ Enhanced Features:
            </h3>
            <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
              <li>🇧🇼 Botswana government branding with flag and colors</li>
              <li>🎨 Seamless visual transitions between sections</li>
              <li>📱 Responsive design for all screen sizes</li>
              <li>♿ Proper accessibility with DialogDescription</li>
              <li>✨ Smooth animations and hover effects</li>
              <li>🔒 Enhanced security features and validation</li>
            </ul>
          </div>
        </div>
      </div>

      <AuthDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultTab={defaultTab}
        enhanced={dialogMode === 'enhanced'}
      />
    </div>
  );
}

export default AuthDialogDebug;
