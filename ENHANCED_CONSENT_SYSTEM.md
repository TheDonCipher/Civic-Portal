# Enhanced Consent System for Civic Portal

## Overview

The Enhanced Consent System provides a comprehensive solution for managing user legal consent in the Civic Portal, with improved user experience, better error handling, and recovery mechanisms for incomplete consent processes.

## Key Features

### 1. Enhanced Consent Status Management
- **Progress Tracking**: Visual progress indicators showing completion percentage
- **Retry Logic**: Automatic retry with exponential backoff for failed consent checks
- **Session Recovery**: Handles session timeouts during consent process
- **Real-time Updates**: Live status updates and validation

### 2. Improved User Guidance
- **Step-by-step Wizard**: Guided consent completion process
- **Recovery Flows**: Specialized flows for different failure scenarios
- **Contextual Help**: Clear explanations and next steps
- **Progress Indicators**: Visual feedback on completion status

### 3. Better Error Handling
- **Graceful Degradation**: Fallback options when consent fails
- **Recovery Scenarios**: Specific handling for different error types
- **User-friendly Messages**: Clear, actionable error messages
- **Retry Mechanisms**: Smart retry logic with user control

## Components

### Core Components

#### 1. `useConsentStatus` Hook (Enhanced)
```typescript
const {
  consentStatus,
  needsConsent,
  canProceed,
  consentProgress,
  error,
  isRecovering,
  startRecovery,
  lastChecked,
  retryCount
} = useConsentStatus();
```

**New Features:**
- Progress calculation with completion percentage
- Retry logic with exponential backoff
- Recovery mechanisms for failed checks
- Last checked timestamp tracking

#### 2. `ConsentCompletionWizard`
A step-by-step guided process for completing legal consent:

```typescript
<ConsentCompletionWizard
  open={showWizard}
  onOpenChange={setShowWizard}
  onComplete={handleComplete}
  showProgress={true}
/>
```

**Features:**
- Welcome step with progress overview
- Legal agreements step with validation
- Confirmation step with success feedback
- Auto-close after completion

#### 3. `ConsentRecoveryFlow`
Specialized recovery flows for different scenarios:

```typescript
<ConsentRecoveryFlow
  open={showRecovery}
  onOpenChange={setShowRecovery}
  scenario="session_timeout" // or 'partial_signup', 'verification_pending', etc.
  onComplete={handleRecoveryComplete}
/>
```

**Scenarios:**
- `session_timeout`: Session expired during consent
- `partial_signup`: Incomplete registration
- `verification_pending`: Email verification needed
- `consent_failed`: Error during consent process
- `account_locked`: Account access restricted

#### 4. `ConsentStatusBanner` (Enhanced)
Multiple display variants with enhanced features:

```typescript
<ConsentStatusBanner
  variant="card" // 'banner', 'card', 'compact'
  showProgress={true}
  showWizard={true}
  className="mb-4"
/>
```

**Variants:**
- `banner`: Traditional alert-style banner
- `card`: Rich card layout with detailed information
- `compact`: Minimal space-efficient display

#### 5. `ConsentProtectedRoute` (Enhanced)
Enhanced route protection with better UX:

```typescript
<ConsentProtectedRoute
  enhancedUX={true}
  showProgress={true}
  recoveryScenario="partial_signup"
  blockAccess={false}
>
  {children}
</ConsentProtectedRoute>
```

**New Features:**
- Enhanced UX mode with wizard integration
- Progress indicators in blocked states
- Recovery flow integration
- Better error handling and retry options

#### 6. `ConsentStatusWidget`
Comprehensive status widget for dashboards:

```typescript
<ConsentStatusWidget
  variant="full" // 'full', 'compact', 'minimal'
  showActions={true}
  showProgress={true}
  showLastChecked={true}
/>
```

#### 7. `SessionTimeoutHandler`
Automatic session timeout handling with consent recovery:

```typescript
<SessionTimeoutHandler
  timeoutMinutes={30}
  warningMinutes={5}
  checkInterval={60000}
>
  {children}
</SessionTimeoutHandler>
```

## Usage Examples

### 1. User Dashboard with Enhanced Consent Protection

```typescript
<ConsentProtectedRoute 
  showBanner={true} 
  enhancedUX={true} 
  showProgress={true}
  recoveryScenario="partial_signup"
>
  <UserDashboard />
</ConsentProtectedRoute>
```

### 2. Action Button with Consent Protection

```typescript
<ConsentProtectedButton
  action="create_issue"
  onClick={handleCreateIssue}
  className="w-full"
>
  Create New Issue
</ConsentProtectedButton>
```

### 3. Dashboard Status Widget

```typescript
// Full widget with all features
<ConsentStatusWidget
  variant="full"
  showActions={true}
  showProgress={true}
  showLastChecked={true}
  className="mb-6"
/>

// Compact widget for sidebars
<ConsentStatusWidget
  variant="compact"
  showActions={true}
  showProgress={true}
/>

// Minimal widget for headers
<ConsentStatusWidget
  variant="minimal"
  showActions={false}
/>
```

### 4. Manual Consent Flow Triggers

```typescript
const [showWizard, setShowWizard] = useState(false);
const [showRecovery, setShowRecovery] = useState(false);

// Trigger wizard
<Button onClick={() => setShowWizard(true)}>
  Complete Registration
</Button>

// Trigger recovery flow
<Button onClick={() => setShowRecovery(true)}>
  Need Help?
</Button>

<ConsentCompletionWizard
  open={showWizard}
  onOpenChange={setShowWizard}
  onComplete={() => setShowWizard(false)}
/>

<ConsentRecoveryFlow
  open={showRecovery}
  onOpenChange={setShowRecovery}
  scenario="partial_signup"
  onComplete={() => setShowRecovery(false)}
/>
```

## Implementation Benefits

### 1. Improved User Experience
- **Clear Progress Indicators**: Users know exactly what's required
- **Step-by-step Guidance**: Reduces confusion and abandonment
- **Recovery Options**: Users can easily recover from errors
- **Contextual Help**: Relevant assistance when needed

### 2. Better Error Handling
- **Graceful Degradation**: System continues to function during errors
- **Smart Retry Logic**: Automatic recovery from temporary issues
- **User-friendly Messages**: Clear, actionable error information
- **Multiple Recovery Paths**: Different options for different scenarios

### 3. Enhanced Compliance
- **Comprehensive Tracking**: Detailed consent status monitoring
- **Audit Trail**: Complete history of consent interactions
- **Version Management**: Proper handling of legal document versions
- **Validation**: Robust consent validation and verification

### 4. Developer Experience
- **Modular Components**: Easy to integrate and customize
- **Consistent API**: Uniform interface across all components
- **TypeScript Support**: Full type safety and IntelliSense
- **Flexible Configuration**: Adaptable to different use cases

## Migration Guide

### From Basic to Enhanced System

1. **Update Imports**:
```typescript
// Old
import { ConsentStatusBanner } from '@/components/auth/ConsentStatusBanner';

// New
import { ConsentStatusBanner } from '@/components/auth/ConsentStatusBanner';
import { ConsentCompletionWizard } from '@/components/auth/ConsentCompletionWizard';
import { ConsentRecoveryFlow } from '@/components/auth/ConsentRecoveryFlow';
```

2. **Update ConsentProtectedRoute Usage**:
```typescript
// Old
<ConsentProtectedRoute showBanner={true}>
  {children}
</ConsentProtectedRoute>

// New
<ConsentProtectedRoute 
  showBanner={true} 
  enhancedUX={true} 
  showProgress={true}
  recoveryScenario="partial_signup"
>
  {children}
</ConsentProtectedRoute>
```

3. **Add Status Widgets**:
```typescript
// Add to user dashboard
<ConsentStatusWidget
  variant="card"
  showActions={true}
  showProgress={true}
  className="mb-6"
/>
```

4. **Wrap with Session Handler**:
```typescript
// In AuthProvider
<SessionTimeoutHandler timeoutMinutes={30} warningMinutes={5}>
  {children}
</SessionTimeoutHandler>
```

## Best Practices

1. **Use Enhanced UX for Critical Flows**: Enable `enhancedUX` for user dashboards and important features
2. **Provide Multiple Recovery Options**: Always include both wizard and recovery flows
3. **Show Progress Indicators**: Help users understand completion status
4. **Handle Session Timeouts**: Implement session timeout handling for consent processes
5. **Test Error Scenarios**: Verify all recovery flows work correctly
6. **Monitor Consent Metrics**: Track completion rates and common failure points

## Configuration Options

### Environment Variables
```env
# Session timeout settings
VITE_SESSION_TIMEOUT_MINUTES=30
VITE_SESSION_WARNING_MINUTES=5

# Consent retry settings
VITE_CONSENT_MAX_RETRIES=3
VITE_CONSENT_RETRY_DELAY=2000
```

### Component Props
All components support extensive customization through props, allowing you to adapt the system to your specific needs while maintaining consistency and compliance.
