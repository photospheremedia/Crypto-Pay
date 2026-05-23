# Urban Piper Reseller Integration Strategy

## Overview

Restaurant Hub Solution will act as a **value-added reseller** for Urban Piper's services, specifically:
- **Hub**: Order aggregation & management platform
- **Meraki**: Custom branded online ordering system

This allows us to offer comprehensive restaurant technology solutions while leveraging Urban Piper's established infrastructure.

## Business Model

### How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Restaurant     │────▶│  Restaurant Hub  │────▶│  Urban Piper    │
│  Client         │     │  (Reseller)      │     │  (Provider)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │                        │                        │
       │ Pays us                │ We manage              │ Backend
       │ single invoice         │ onboarding             │ infrastructure
       │                        │ & support              │
       ▼                        ▼                        ▼
   Simple                 White-glove            Technical
   Experience             Service                Platform
```

### Value Proposition for Clients

1. **Single Vendor Relationship** - Clients deal only with us
2. **Bundled Services** - Supplies + Technology + Support
3. **White-Glove Onboarding** - We handle all technical setup
4. **Consolidated Billing** - One invoice for everything
5. **Local Support** - Direct access to our team

### Revenue Model

| Service | Client Pays | Our Cost | Margin |
|---------|-------------|----------|--------|
| Hub Basic | $99/mo | $59/mo | ~40% |
| Hub Pro | $199/mo | $119/mo | ~40% |
| Meraki | $149/mo | $89/mo | ~40% |
| Setup Fee | $499 | $199 | ~60% |

## Technical Integration

### Client Onboarding Flow

```typescript
// 1. Client signs up through our platform
interface ClientOnboarding {
  businessInfo: {
    name: string;
    type: 'restaurant' | 'cafe' | 'dark-kitchen' | 'food-truck';
    locations: number;
    monthlyOrders: string;
  };
  
  services: {
    supplies: boolean;        // Our core product
    hubIntegration: boolean;  // Urban Piper Hub
    merakiWebsite: boolean;   // Urban Piper Meraki
    posIntegration: string;   // Toast, Square, etc.
  };
  
  deliveryChannels: {
    ubereats: boolean;
    doordash: boolean;
    grubhub: boolean;
    direct: boolean;
  };
}

// 2. We auto-provision Urban Piper account on their behalf
async function provisionUrbanPiper(client: ClientOnboarding) {
  // Call Urban Piper Partner API (when we become partners)
  // For now, manual process via partnerships@urbanpiper.com
  
  return {
    hubAccount: 'provisioned',
    merakiSite: 'pending-setup',
    integrationStatus: 'ready'
  };
}
```

### Database Schema for Tracking

```sql
-- Track client subscriptions to Urban Piper services
CREATE TABLE urban_piper_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  
  -- Services
  hub_enabled BOOLEAN DEFAULT FALSE,
  hub_plan TEXT, -- 'basic' | 'pro' | 'enterprise'
  meraki_enabled BOOLEAN DEFAULT FALSE,
  
  -- Urban Piper Account Info (we manage this)
  up_account_id TEXT,
  up_api_key TEXT, -- Encrypted
  
  -- Billing
  monthly_fee_cents INTEGER,
  setup_fee_paid BOOLEAN DEFAULT FALSE,
  billing_start_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending | active | suspended | cancelled
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track which delivery platforms are connected
CREATE TABLE delivery_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES urban_piper_subscriptions(id),
  platform TEXT NOT NULL, -- ubereats | doordash | grubhub | etc
  status TEXT DEFAULT 'pending',
  connected_at TIMESTAMPTZ,
  store_id TEXT, -- Platform-specific store ID
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Marketing Strategy

### How We Position It

**DON'T say:**
- "We resell Urban Piper"
- "Third-party integration"
- "Powered by Urban Piper"

**DO say:**
- "Integrated order management"
- "Unified delivery dashboard"
- "Multi-channel order consolidation"
- "Part of Restaurant Hub technology suite"

### Website Messaging

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│   🚀 Streamline Your Delivery Operations                   │
│                                                            │
│   Manage all your online orders from one dashboard.        │
│   DoorDash, UberEats, Grubhub - all in one place.         │
│                                                            │
│   ✓ Reduce missed orders                                   │
│   ✓ Sync menus across all platforms                        │
│   ✓ Real-time inventory updates                            │
│   ✓ Detailed analytics & reporting                         │
│                                                            │
│   [Get Started - Free Setup]                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Services Page Content

Instead of a "Pricing" page, we have:

**Technology Solutions** (under Services)
- Delivery Integration Suite
- Custom Online Ordering
- Menu Management
- Analytics Dashboard

Each links to a consultation/demo request form, not a price list.

## Implementation Phases

### Phase 1: Manual Process (Current)
1. Client expresses interest via our platform
2. We collect business info
3. We manually submit to Urban Piper (partnerships@urbanpiper.com)
4. We handle onboarding calls
5. We manage billing separately

### Phase 2: Semi-Automated
1. Client fills comprehensive form
2. Automatic email to our team + Urban Piper partner manager
3. Shared CRM for tracking
4. Consolidated invoicing

### Phase 3: Full Integration (Partner API)
1. Client signs up, selects services
2. Auto-provision via Urban Piper Partner API
3. White-label dashboard (if available)
4. Automated billing & reconciliation

## Admin Dashboard Requirements

### For Our Team

```typescript
// Admin features needed
interface AdminUrbanPiperDashboard {
  // Client Management
  listAllSubscriptions(): Subscription[];
  viewClientStatus(clientId: string): ClientStatus;
  
  // Onboarding
  initiateOnboarding(clientId: string): OnboardingTicket;
  updateOnboardingStatus(ticketId: string, status: string): void;
  
  // Billing
  generateMonthlyInvoices(): Invoice[];
  reconcileWithUrbanPiper(): ReconciliationReport;
  
  // Support
  createSupportTicket(clientId: string, issue: string): Ticket;
  escalateToUrbanPiper(ticketId: string): void;
}
```

### Client Self-Service Portal

Clients should be able to:
- View their delivery channel status
- See basic analytics (orders, revenue)
- Submit support requests
- Access documentation

They should NOT:
- Know they're using Urban Piper
- Access Urban Piper directly
- See our cost/margins

## Next Steps

1. **Contact Urban Piper Partnerships**
   - Email: partnerships@urbanpiper.com
   - WhatsApp: +91-7411558800
   - Request reseller/white-label partnership info

2. **Prepare Partnership Pitch**
   - Our client base/pipeline
   - Target market (US/Canada)
   - Volume projections
   - Integration requirements

3. **Legal/Contract Review**
   - Reseller agreement terms
   - White-label permissions
   - SLA guarantees
   - Data handling

4. **Technical Planning**
   - API access requirements
   - Webhook integrations
   - White-label dashboard options

## Resources

- Urban Piper Hub: https://www.urbanpiper.com/hub
- Urban Piper Meraki: https://www.urbanpiper.com/meraki
- Partner Contact: partnerships@urbanpiper.com
- Knowledge Base: https://help.urbanpiper.com/
- System Status: http://status.urbanpiper.com/
