// Urban Piper Integration Types
// These define our reseller model for Urban Piper services

export type UrbanPiperPlan = 'basic' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'pending' | 'active' | 'suspended' | 'cancelled';
export type DeliveryPlatform = 'ubereats' | 'doordash' | 'grubhub' | 'postmates' | 'seamless' | 'caviar' | 'direct';

export interface UrbanPiperSubscription {
  id: string;
  companyId: string;
  
  // Hub Service
  hubEnabled: boolean;
  hubPlan?: UrbanPiperPlan;
  
  // Meraki Service
  merakiEnabled: boolean;
  merakiDomain?: string;
  
  // Account Info (managed by us)
  upAccountId?: string;
  upApiKey?: string; // Encrypted
  
  // Billing
  monthlyFeeCents: number;
  setupFeePaid: boolean;
  billingStartDate?: Date;
  
  // Status
  status: SubscriptionStatus;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryIntegration {
  id: string;
  subscriptionId: string;
  platform: DeliveryPlatform;
  status: 'pending' | 'active' | 'disconnected' | 'error';
  connectedAt?: Date;
  storeId?: string; // Platform-specific store ID
  storeName?: string;
  
  createdAt: Date;
}

// Services we offer (branded as ours)
export const TECHNOLOGY_SERVICES = {
  HUB_BASIC: {
    id: 'hub-basic',
    name: 'Delivery Integration - Basic',
    description: 'Manage all delivery orders from one dashboard',
    features: [
      'Unified order dashboard',
      'Up to 2 delivery platforms',
      'Basic menu sync',
      'Email support',
    ],
    pricing: {
      monthly: 9900, // $99.00
      setup: 19900,  // $199.00
    },
    upProduct: 'hub',
    upPlan: 'basic' as UrbanPiperPlan,
  },
  HUB_PRO: {
    id: 'hub-pro',
    name: 'Delivery Integration - Pro',
    description: 'Advanced order management with analytics',
    features: [
      'Everything in Basic',
      'Unlimited delivery platforms',
      'Advanced menu management',
      'Real-time inventory sync',
      'Analytics dashboard',
      'Priority support',
    ],
    pricing: {
      monthly: 19900, // $199.00
      setup: 29900,   // $299.00
    },
    upProduct: 'hub',
    upPlan: 'pro' as UrbanPiperPlan,
  },
  MERAKI: {
    id: 'meraki',
    name: 'Custom Online Ordering',
    description: 'Your own branded ordering website',
    features: [
      'Custom branded website',
      'Direct ordering (0% commission)',
      'Customer loyalty program',
      'Marketing tools',
      'Integrated payments',
    ],
    pricing: {
      monthly: 14900, // $149.00
      setup: 49900,   // $499.00
    },
    upProduct: 'meraki',
    upPlan: undefined,
  },
} as const;

// Delivery platforms we support (via Urban Piper)
export const SUPPORTED_PLATFORMS: Record<DeliveryPlatform, {
  name: string;
  logo: string;
  color: string;
  available: boolean;
}> = {
  ubereats: {
    name: 'Uber Eats',
    logo: '/images/platforms/ubereats.svg',
    color: '#06C167',
    available: true,
  },
  doordash: {
    name: 'DoorDash',
    logo: '/images/platforms/doordash.svg',
    color: '#FF3008',
    available: true,
  },
  grubhub: {
    name: 'Grubhub',
    logo: '/images/platforms/grubhub.svg',
    color: '#F63440',
    available: true,
  },
  postmates: {
    name: 'Postmates',
    logo: '/images/platforms/postmates.svg',
    color: '#000000',
    available: true,
  },
  seamless: {
    name: 'Seamless',
    logo: '/images/platforms/seamless.svg',
    color: '#0A3B5C',
    available: true,
  },
  caviar: {
    name: 'Caviar',
    logo: '/images/platforms/caviar.svg',
    color: '#FF6F00',
    available: true,
  },
  direct: {
    name: 'Direct Website',
    logo: '/images/platforms/direct.svg',
    color: '#6366F1',
    available: true,
  },
};

// Onboarding form data
export interface TechnologyOnboardingForm {
  // Business Info
  businessName: string;
  businessType: 'restaurant' | 'cafe' | 'dark-kitchen' | 'food-truck' | 'catering' | 'other';
  locations: number;
  monthlyOrders: '0-500' | '500-2000' | '2000-5000' | '5000+';
  
  // Current Setup
  currentPOS?: string; // Toast, Square, Clover, etc.
  currentDeliveryPlatforms: DeliveryPlatform[];
  hasWebsite: boolean;
  websiteUrl?: string;
  
  // Desired Services
  services: {
    deliveryIntegration: boolean;
    deliveryPlan?: 'basic' | 'pro';
    customOrdering: boolean;
  };
  
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  preferredContactTime?: string;
  
  // Notes
  additionalNotes?: string;
}

// Admin tracking
export interface OnboardingTicket {
  id: string;
  companyId: string;
  form: TechnologyOnboardingForm;
  
  // Internal status
  status: 'new' | 'contacted' | 'demo-scheduled' | 'contract-sent' | 'signed' | 'provisioning' | 'active' | 'closed';
  assignedTo?: string;
  
  // Urban Piper coordination
  upTicketId?: string;
  upStatus?: string;
  
  // Timeline
  createdAt: Date;
  lastContactAt?: Date;
  scheduledDemoAt?: Date;
  contractSentAt?: Date;
  activatedAt?: Date;
  
  // Notes
  internalNotes: string[];
}
