import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import AuthDialog from '@/components/auth/AuthDialog';

/**
 * Simple test component to verify enhanced authentication works
 */
export function EnhancedAuthTest() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Enhanced Authentication Test</h1>
      <p className="text-muted-foreground">
        Click the button below to test the enhanced authentication system.
      </p>

      <Button onClick={() => setShowAuth(true)}>
        Test Enhanced Authentication
      </Button>

      <AuthDialog
        open={showAuth}
        onOpenChange={setShowAuth}
        enhanced={true}
        defaultTab="sign-up"
      />
    </div>
  );
}

export default EnhancedAuthTest;
