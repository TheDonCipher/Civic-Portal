// Subscription Types for Mmogo Impact Ecosystem
export type SubscriptionTier = 'motse' | 'thusang' | 'tirisano' | 'kgotla' | 'tlhaloso';

export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'expired' | 'trial';

export interface SubscriptionData {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  next_billing_date?: string;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'annual' | 'project' | 'forever';
  payment_method?: string;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  // Enhanced fields for Mmogo Impact Ecosystem
  tier_level?: 'ward' | 'district' | 'national' | 'supporter' | 'champion' | 'impact_partner';
  business_type?: string;
  government_level?: string;
  department_id?: string;
  contribution_history?: ThusangContribution[];
}

export interface ThusangContribution {
  id: string;
  project_id: string;
  amount: number;
  currency: string;
  date: string;
  status: 'pending' | 'completed' | 'refunded';
  payment_method: string;
}

export interface SubscriptionFeatures {
  tier: SubscriptionTier;
  features: string[];
  limitations: string[];
  usage_limits: {
    issues?: number;
    comments?: number;
    analytics?: boolean;
    api_calls?: number;
    ward_management?: boolean;
    district_coordination?: boolean;
    national_oversight?: boolean;
    business_directory?: boolean;
    community_offers?: boolean;
    data_reports?: boolean;
  };
}

export interface SubscriptionUsage {
  subscription_id: string;
  current_usage: {
    issues: number;
    comments: number;
    api_calls: number;
    projects_funded?: number;
    business_visibility?: number;
    data_requests?: number;
  };
  limits: {
    issues?: number;
    comments?: number;
    api_calls?: number;
    monthly_projects?: number;
    directory_listings?: number;
    report_requests?: number;
  };
  period_start: string;
  period_end: string;
}

// Mmogo Impact Ecosystem Tier Configurations
export interface MmogoTierConfig {
  id: SubscriptionTier;
  name: string;
  setswanaName: string;
  description: string;
  pricing: {
    amount: number;
    currency: string;
    billing: string;
    range?: string; // For variable pricing like "BWP 750-6500"
  };
  targetUsers: string[];
  keyFeatures: string[];
  icon: string;
  color: string;
  bgColor: string;
  category: 'foundation' | 'community' | 'business' | 'government' | 'analytics';
  valueProposition: string;
  demoScenarios: string[];
}

// Thusang Project Types
export interface ThusangProject {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  goal_amount: number;
  raised_amount: number;
  contributors_count: number;
  days_left: number;
  image_url: string;
  updates_count: number;
  featured: boolean;
  status: 'active' | 'funded' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  issue_id?: string; // Link to original issue
}

// Business Partnership Types
export interface TirisanoPartnership {
  id: string;
  business_name: string;
  tier: 'supporter' | 'champion' | 'impact_partner';
  subscription_id: string;
  directory_listing: boolean;
  featured_placement: boolean;
  community_offers: string[];
  sponsored_projects: string[];
  visibility_metrics: {
    logo_impressions: number;
    directory_views: number;
    offer_clicks: number;
  };
}

// Government Subscription Types
export interface KgotlaSubscription {
  id: string;
  subscription_id: string;
  level: 'ward' | 'district' | 'national';
  ward_id?: string;
  district_id?: string;
  ministry_id?: string;
  features_enabled: {
    citizen_communication: boolean;
    task_assignment: boolean;
    basic_analytics: boolean;
    advanced_analytics: boolean;
    cross_ward_coordination: boolean;
    policy_simulation: boolean;
  };
  performance_metrics: {
    issues_managed: number;
    resolution_time_avg: number;
    citizen_satisfaction: number;
    budget_utilization: number;
  };
}

// Data & Insights Types
export interface TlhalosoService {
  id: string;
  subscription_id: string;
  service_type: 'thematic_report' | 'custom_project' | 'api_access';
  reports_generated: number;
  api_calls_used: number;
  data_access_level: 'basic' | 'advanced' | 'premium';
  custom_dashboards: string[];
}

// Subscription Tier Display Configuration
export interface SubscriptionTierDisplay {
  tier: SubscriptionTier;
  badge: {
    text: string;
    color: string;
    icon: string;
  };
  upgradePrompt?: {
    message: string;
    ctaText: string;
    targetTier: SubscriptionTier;
  };
  featureGates: {
    [feature: string]: boolean;
  };
}

// Payment Method Configuration
export interface PaymentMethodConfig {
  id: string;
  name: string;
  icon: string;
  supportedTiers: SubscriptionTier[];
  userRoles: ('citizen' | 'official' | 'business' | 'admin')[];
  fees: {
    percentage?: number;
    fixed?: number;
    minimum?: number;
  };
  description: string;
}
