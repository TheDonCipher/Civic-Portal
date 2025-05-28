// Subscription Management Components
export { default as SubscriptionDashboard } from './SubscriptionDashboard';
export { default as SubscriptionUpgrade } from './SubscriptionUpgrade';
export { default as SubscriptionTierPage } from './SubscriptionTierPage';
export { default as ThusangSubscriptionPage } from './ThusangSubscriptionPage';
export { default as PaymentMethodSelector } from './PaymentMethodSelector';

// Subscription Status Components
export {
  default as SubscriptionStatusIndicator,
  useSubscriptionStatus,
  SubscriptionFeatureGate,
  QuickSubscriptionInfo
} from './SubscriptionStatusIndicator';

// Mmogo Impact Ecosystem Components
export { default as ThusangContributionWidget } from './ThusangContributionWidget';
export { default as TirisanoPartnershipDisplay } from './TirisanoPartnershipDisplay';
export { default as MmogoEcosystemShowcase } from './MmogoEcosystemShowcase';

// Mmogo Impact Ecosystem Mockups
export { default as ThusangProjectMockup } from './mockups/ThusangProjectMockup';
export { default as KgotlaDashboardMockup } from './mockups/KgotlaDashboardMockup';
export { default as TirisanoMmogoBusinessMockup } from './mockups/TirisanoMmogoBusinessMockup';
export { default as TlhalosoReportMockup } from './mockups/TlhalosoReportMockup';
export { default as MmogoEcosystemShowcaseMockup } from './mockups/MmogoEcosystemShowcase';
export { default as MockupNavigation } from './mockups/MockupNavigation';

// Types
export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: string;
  features: string[];
  status: 'active' | 'pending' | 'cancelled' | 'expired' | 'trial';
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  fees: string;
  processingTime: string;
  availability: 'citizens' | 'businesses' | 'government' | 'all';
  recommended?: boolean;
}

export interface SubscriptionData {
  id: string;
  userId: string;
  tier: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  paymentMethod: string;
  autoRenew: boolean;
}
