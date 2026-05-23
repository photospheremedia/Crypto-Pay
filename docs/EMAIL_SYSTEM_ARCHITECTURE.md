# 📧 Email System Architecture - Restaurant Hub Solution

## Overview

Restaurant Hub uses a **multi-provider email strategy** to maximize free tier resources and ensure deliverability.

| Provider | Purpose | Free Tier | Used For |
|----------|---------|-----------|----------|
| **Supabase Auth** | Authentication emails | Unlimited (built-in) | Signup confirmation, password reset, magic links, email change |
| **Resend** | Transactional + Marketing | 3,000 emails/month | Admin invites, order confirmations, welcome emails, promotional |
| **Domain DNS** | Email receiving | N/A | `@restauranthubsolution.com` (configure with email hosting) |

---

## 📬 Email Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMAIL SYSTEM ARCHITECTURE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐                    ┌──────────────────┐              │
│  │   SUPABASE AUTH  │                    │      RESEND      │              │
│  │  (Auth Emails)   │                    │  (App Emails)    │              │
│  └────────┬─────────┘                    └────────┬─────────┘              │
│           │                                       │                         │
│           │                                       │                         │
│  ┌────────▼─────────┐                    ┌────────▼─────────┐              │
│  │ • Signup confirm │                    │ • Order confirm  │              │
│  │ • Password reset │                    │ • Admin invites  │              │
│  │ • Magic links    │                    │ • Welcome emails │              │
│  │ • Email change   │                    │ • Newsletters    │              │
│  │ • User invites   │                    │ • Promotions     │              │
│  │ • MFA codes      │                    │ • Account alerts │              │
│  └──────────────────┘                    └──────────────────┘              │
│                                                                             │
│  From: noreply@xfairwgarmpvbogiuduk      From: noreply@restauranthub       │
│        .supabase.co                             solution.com               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Complete Email Types Catalog

### Category 1: Authentication Emails (Supabase Auth - FREE)

| Email Type | Subject | Trigger | Security Notes |
|------------|---------|---------|----------------|
| **Signup Confirmation** | Confirm Your Restaurant Hub Account | User signs up | Link expires in 24h |
| **Password Reset** | Reset Your Password - Restaurant Hub | User clicks "Forgot Password" | Link expires in 1h, single-use |
| **Magic Link** | Your Login Link - Restaurant Hub | User requests passwordless login | Link expires in 24h, single-use |
| **Email Change** | Confirm Your New Email Address | User updates email in settings | Sent to BOTH old & new email |
| **User Invitation** | You've Been Invited to Restaurant Hub | Admin invites via Supabase | Link expires in 7 days |
| **MFA Verification** | Your Verification Code | MFA email challenge | Code expires in 10 min |

### Category 2: Transactional Emails (Resend - 3,000/month)

| Email Type | Subject | Trigger | Priority |
|------------|---------|---------|----------|
| **Admin Invite** | Admin Portal Access - Restaurant Hub | RHS admin creates staff account | 🔴 Critical |
| **Welcome Email** | Welcome to Restaurant Hub 🎉 | User completes onboarding | 🟡 High |
| **Order Confirmation** | Order Confirmed - #{{orderNumber}} | Order placed successfully | 🔴 Critical |
| **Shipping Notification** | Your Order Has Shipped! | Order ships | 🔴 Critical |
| **Delivery Confirmation** | Your Order Has Been Delivered | Order delivered | 🟡 High |
| **Invoice Email** | Invoice #{{invoiceNumber}} - Restaurant Hub | Invoice generated | 🔴 Critical |
| **Payment Received** | Payment Received - Thank You! | Payment processed | 🟡 High |
| **Payment Failed** | Action Required: Payment Failed | Payment declined | 🔴 Critical |

### Category 3: Account & Security Emails (Resend)

| Email Type | Subject | Trigger | Security Notes |
|------------|---------|---------|----------------|
| **Account Update** | Your Account Was Updated | Profile/settings changed | Include what changed |
| **Password Changed** | Your Password Was Changed | Password reset completed | Include "wasn't me?" link |
| **New Device Login** | New Sign-in to Your Account | Login from new device/IP | Include device info & location |
| **Suspicious Activity** | Unusual Activity on Your Account | Failed login attempts | Include IP & time |
| **Account Locked** | Your Account Has Been Locked | Too many failed attempts | Include unlock instructions |
| **Role Change** | Your Role Has Been Updated | Admin changes user role | Include new permissions |

### Category 4: Re-engagement & Marketing Emails (Resend)

| Email Type | Subject | Trigger | Best Practice |
|------------|---------|---------|---------------|
| **Abandoned Cart** | You Left Something Behind! | Cart inactive 24h+ | Include cart items & images |
| **We Miss You** | It's Been a While! | No login in 30+ days | Offer incentive to return |
| **Product Back in Stock** | {{productName}} is Back! | Wishlisted item restocked | Include direct buy link |
| **Promotional** | Special Offer Inside! | Marketing campaign | Max 1-2 per week |
| **Newsletter** | Restaurant Hub Weekly | Weekly digest | Unsubscribe required |
| **Review Request** | How Was Your Order? | 7 days after delivery | Simple rating link |

### Category 5: Subscription & Billing Emails (Resend)

| Email Type | Subject | Trigger | Required Info |
|------------|---------|---------|---------------|
| **Subscription Welcome** | Welcome to Restaurant Hub Pro! | New subscription | Plan details, billing date |
| **Renewal Reminder** | Your Subscription Renews Soon | 7 days before renewal | Amount, date, cancel link |
| **Subscription Renewed** | Subscription Renewed Successfully | Auto-renewal processed | Receipt, next billing date |
| **Subscription Cancelled** | Your Subscription Has Been Cancelled | User cancels | End date, what they lose |
| **Subscription Expired** | Your Subscription Has Expired | Grace period ended | Reactivation link |
| **Credit Approved** | Net 30 Credit Approved! | B2B credit approved | Credit limit, terms |
| **Credit Limit Increased** | Good News! Credit Limit Increased | Usage qualifies increase | New limit amount |

---

## 🔑 Temporary Passwords & Security Best Practices

### ⚠️ NEVER Do This:
- ❌ Send passwords in plain text emails
- ❌ Include the actual password in email body
- ❌ Use predictable temporary passwords
- ❌ Let temporary passwords never expire

### ✅ DO This Instead:

#### Option A: Password Reset Link (Recommended)
```
Subject: Reset Your Password - Restaurant Hub
Body: Click here to create a new password: [Reset Password Button]
      This link expires in 1 hour.
```

#### Option B: Temporary Password with Forced Reset
```typescript
// Only for admin-created accounts (like our admin invite)
const tempPassword = generateSecurePassword(); // e.g., "Rhs!Temp$2026"
// Send via email
// Force password change on first login
await supabase.auth.admin.updateUserById(userId, {
  user_metadata: { must_change_password: true }
});
```

#### Best Practices for Temporary Passwords:
1. **Generate cryptographically secure passwords** (min 12 chars, mixed case, numbers, symbols)
2. **Expire within 24-72 hours** 
3. **Force password change on first login**
4. **Send over secure channel only** (HTTPS email, never SMS plain text)
5. **Include security notice** ("If you didn't request this...")
6. **Log the event** for audit trail

### Password Reset Email Checklist:
- [ ] Clear subject line
- [ ] Identify who the reset is for (email)
- [ ] Clear CTA button
- [ ] Expiration time prominently displayed
- [ ] "Didn't request this?" reassurance
- [ ] Support contact info
- [ ] IP/device info (optional for high-security apps)

---

## 📧 Auto-Reply Emails

### When to Use Auto-Replies:

| Scenario | Auto-Reply Needed | Content |
|----------|-------------------|---------|
| Contact form submission | ✅ Yes | "We received your message, response within 24h" |
| Support ticket created | ✅ Yes | Ticket #, expected response time |
| Order placed | ✅ Yes | Order confirmation is the auto-reply |
| Quote request | ✅ Yes | "Our team will review and respond within 2 business days" |
| Application/signup | ✅ Yes | "Application received, we'll review within 48h" |
| Newsletter signup | ✅ Yes | Welcome + confirmation email |

### Auto-Reply Template Structure:
```html
Subject: We Received Your {{type}} - Restaurant Hub

1. Acknowledgment: "Thank you for contacting us"
2. Reference: Ticket/Order number
3. Timeline: "We typically respond within X hours"
4. Resources: FAQ, Help Center links
5. Emergency: "For urgent matters, call XXX"
6. Footer: Company info, unsubscribe if applicable
```

---

## 1️⃣ Supabase Auth Emails (FREE - Built-in)

### Purpose
Handles all authentication-related emails automatically.

### Configuration Location
**Supabase Dashboard** → Authentication → Email Templates

### Templates to Configure

| Template | Subject | Trigger |
|----------|---------|---------|
| **Confirm signup** | Confirm Your Restaurant Hub Account | User signs up with email/password |
| **Reset password** | Reset Your Password - Restaurant Hub | User requests password reset |
| **Magic link** | Your Login Link - Restaurant Hub | User requests passwordless login |
| **Invite user** | You've Been Invited to Restaurant Hub | Admin invites user via Supabase |
| **Change email** | Confirm Your New Email Address | User changes email in settings |

### How to Apply Templates

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → Authentication → Email Templates
3. Copy templates from `/supabase/email-templates.sql`
4. Paste HTML into each template slot

### Template Variables (Supabase)
```html
{{ .ConfirmationURL }}  - The action link
{{ .Email }}            - User's email
{{ .SiteURL }}          - Your site URL
{{ .Token }}            - Verification token
{{ .TokenHash }}        - Hashed token
```

---

## 2️⃣ Resend Emails (3,000 FREE/month)

### Purpose
Handles transactional and marketing emails from the application.

### Configuration
```env
# .env.local
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=Restaurant Hub <noreply@restauranthubsolution.com>
```

### Verified Domain
- **Domain:** `restauranthubsolution.com`
- **Status:** ✅ Verified
- **From Address:** `noreply@restauranthubsolution.com`

### Available Templates

| Template | Subject | Trigger | Location |
|----------|---------|---------|----------|
| `admin_invite` | Admin Portal Access - Restaurant Hub | Admin invites staff | `/lib/email/templates/admin-invite.ts` |
| `welcome` | Welcome to Restaurant Hub 🎉 | User completes signup | `/lib/email/templates.ts` |
| `email_verification` | Verify Your Email | Manual verification | `/lib/email/templates.ts` |
| `order_confirmation` | Order Confirmed - #{{orderNumber}} | Order placed | `/lib/email/templates.ts` |
| `order_shipped` | Your Order Has Shipped! | Order ships | `/lib/email/templates.ts` |
| `invoice` | Invoice #{{invoiceNumber}} | Invoice generated | `/lib/email/templates.ts` |
| `payment_received` | Payment Received - Thank You! | Payment success | `/lib/email/templates.ts` |
| `payment_failed` | Action Required: Payment Failed | Payment fails | `/lib/email/templates.ts` |
| `subscription_renewal` | Subscription Renewed | Sub renews | `/lib/email/templates.ts` |
| `abandoned_cart` | You Left Something Behind! | Cart abandoned 24h | `/lib/email/templates.ts` |
| `promotional` | Special Offer Inside! | Marketing campaign | `/lib/email/templates.ts` |

### Usage Example
```typescript
import { sendEmail } from "@/lib/email/sender";

await sendEmail({
  to: { email: "customer@example.com", name: "John" },
  template: "order_confirmation",
  templateData: {
    orderNumber: "ORD-12345",
    customerName: "John",
    items: [...],
    total: "$299.00",
  },
});
```

---

## 3️⃣ Email Receiving (DNS Configuration)

### Current Setup
To receive emails at `@restauranthubsolution.com`, configure MX records:

**Option A: Forward to Gmail (Free)**
```dns
MX   @   mx1.improvmx.com     10
MX   @   mx2.improvmx.com     20
```

**Option B: Google Workspace (Paid)**
```dns
MX   @   aspmx.l.google.com        1
MX   @   alt1.aspmx.l.google.com   5
MX   @   alt2.aspmx.l.google.com   5
```

---

## 📊 Resource Allocation Strategy

### ⚠️ Critical Free Tier Limitations (Updated Feb 2026)

| Provider | Monthly Limit | **Daily Limit** | Data Retention | Other Limits |
|----------|---------------|-----------------|----------------|--------------|
| **Resend Free** | 3,000 emails/mo | **100 emails/day** | 1 day | 1 domain, 1 webhook |
| **Supabase Auth** | Unlimited | **2 emails/hour** (built-in SMTP) | N/A | Rate limited |

### 🚨 Key Constraints to Remember:

1. **Resend's 100/day cap** is the biggest bottleneck - plan email sends carefully
2. **Supabase built-in SMTP** has a 2 emails/hour rate limit (adequate for dev, not production)
3. **For production:** Configure custom SMTP in Supabase using Resend SMTP (counts against Resend quota)

### Monthly Email Budget (Free Tiers)

| Provider | Monthly Limit | Allocation | Usage |
|----------|---------------|------------|-------|
| Supabase Auth | Unlimited* | 100% auth | ~500 emails |
| Resend | 3,000 | 100% transactional | ~2,500 emails |
| **Total** | **3,000+** | | |

*\*Unlimited with custom SMTP; built-in is rate-limited to 2/hour*

### 📅 Daily Planning Strategy (100 emails/day max)

**Priority Queue:**
1. 🔴 **Critical** (always send): Order confirmations, payment issues, security alerts
2. 🟠 **High** (same-day): Admin invites, welcome emails, shipping updates
3. 🟡 **Medium** (can wait): Subscription reminders, review requests
4. 🟢 **Low** (batch weekly): Newsletters, promotions, re-engagement

**Daily Allocation Example:**
```
├── Critical transactional: 40 reserved
├── Admin/account emails:   20 reserved
├── Marketing/promotional:  20 batch-send
└── Buffer/overflow:        20 reserved
```

### Optimization Tips

1. **Use Supabase for all auth flows** - Don't duplicate auth emails in Resend
2. **Batch newsletters** - Send during low-traffic periods
3. **Prioritize transactional** - Orders, invoices = high priority
4. **Track metrics** - Monitor open/click rates in Resend dashboard

---

## 🔄 When Each Email is Sent

### Authentication Flow (Supabase)
```
User Action                    → Email Sent
─────────────────────────────────────────────
Sign up                        → Confirm signup
Forgot password                → Reset password
Request magic link             → Magic link
Change email address           → Change email (to both old & new)
Admin invites via Supabase     → Invite user
```

### Application Flow (Resend)
```
System Event                   → Email Sent
─────────────────────────────────────────────
Admin creates staff user       → Admin invite
Order placed                   → Order confirmation
Order shipped                  → Shipping notification
Invoice generated              → Invoice email
Payment received               → Payment receipt
Payment failed                 → Payment failure alert
Subscription renews            → Renewal confirmation
Cart abandoned 24h             → Abandoned cart reminder
Weekly/Monthly                 → Newsletter/Promotional
```

---

## 📁 File Structure

```
apps/portal/
├── lib/
│   ├── email.ts                    # Legacy email service (deprecated)
│   └── email/
│       ├── index.ts                # Email module exports
│       ├── sender.ts               # Resend sender implementation
│       ├── templates.ts            # All Resend templates
│       ├── base-template.ts        # Shared template components
│       ├── triggers.ts             # Email trigger logic
│       └── templates/
│           └── admin-invite.ts     # Admin invite template
├── scripts/
│   ├── send-admin-invite.ts        # CLI script for admin invites
│   └── create-admin-user.ts        # Create user + send invite
└── .env.local                      # RESEND_API_KEY

supabase/
├── email-templates.sql             # Supabase auth templates (copy to dashboard)
└── templates/
    └── email_change.html           # Email change template
```

---

## 🎯 Email Design Best Practices

### Subject Lines
- ✅ Keep under 50 characters
- ✅ Put important info first
- ✅ Be specific: "Order #12345 Confirmed" not "Order Update"
- ❌ Don't repeat company name if it's in the From field
- ❌ Don't use ALL CAPS or excessive punctuation!!!

### From Address
- ✅ Use recognizable name: "Restaurant Hub" or "Restaurant Hub Orders"
- ✅ Use real reply-to address (not noreply@ when possible)
- ✅ Consider different addresses for filtering: orders@, support@, billing@
- ❌ Avoid generic: "noreply", "info", "alerts"

### Content
- ✅ Include pre-header text (first 40-90 chars shown in preview)
- ✅ Personalize with recipient's name
- ✅ Use absolute dates/times, not "today" or "2 hours ago"
- ✅ Include plain text version
- ✅ Mobile-responsive design (50%+ opens on mobile)
- ❌ Don't make emails too long
- ❌ Don't hide unsubscribe links

### Security Emails
- ✅ Include IP address/location for login alerts
- ✅ Provide "wasn't me" or "secure my account" action
- ✅ Clear expiration times for links
- ✅ Support contact info
- ❌ Never include passwords in plain text
- ❌ Don't confirm/deny account existence to prevent enumeration

---

## 📋 Complete Email Template Checklist

### For Every Email:
- [ ] Clear, concise subject line
- [ ] Proper From name and address
- [ ] Pre-header text
- [ ] Personalization (name, order #, etc.)
- [ ] Primary CTA button above the fold
- [ ] Mobile-responsive design
- [ ] Plain text alternative
- [ ] Company branding (logo, colors)
- [ ] Footer with company info
- [ ] Unsubscribe link (for marketing emails)

### For Security Emails:
- [ ] Expiration time displayed
- [ ] "If this wasn't you" message
- [ ] Support contact info
- [ ] Device/IP info (optional)
- [ ] Single-use tokens

### For Transactional Emails:
- [ ] Order/Reference number
- [ ] Itemized details when relevant
- [ ] Next steps clearly explained
- [ ] Tracking links (for shipping)
- [ ] Receipt/Invoice attached or linked

---

## ✅ Setup Checklist

### Supabase Auth Emails
- [ ] Go to Supabase Dashboard → Authentication → Email Templates
- [ ] Update "Confirm signup" template
- [ ] Update "Reset password" template
- [ ] Update "Magic link" template
- [ ] Update "Invite user" template
- [ ] Update "Change email" template
- [ ] Set "Site URL" to `https://restauranthubsolution.com`

### Resend Configuration
- [x] Create Resend account
- [x] Verify domain `restauranthubsolution.com`
- [x] Add API key to `.env.local`
- [ ] Set up webhook for bounces/complaints (optional)

### DNS Records (Vercel/Namecheap)
- [x] DKIM record for Resend
- [x] SPF record for Resend
- [ ] MX records for receiving (if needed)
- [ ] DMARC record for phishing protection

---

## 🚨 Troubleshooting

### "Email not sent" in development
- Check `RESEND_API_KEY` is set in `.env.local`
- Ensure domain is verified in Resend dashboard

### Supabase emails going to spam
- Configure custom SMTP in Supabase (Pro plan)
- Or use Resend for all emails (requires Pro plan for Supabase SMTP override)

### Resend rate limiting
- Free tier: **100 emails/day**, 3,000/month
- Daily limit resets at midnight UTC
- If exceeded, emails will fail (not queued!)
- **Solution:** Implement queue with retry logic or upgrade to Pro ($20/mo)

### Emails look like phishing
- Implement DMARC policy
- Use consistent branding
- Include company info in footer
- Avoid suspicious-looking URLs

---

## 📈 Scaling Beyond Free Tier

When you outgrow free tiers:

| Need | Solution | Cost | Emails/Day |
|------|----------|------|------------|
| More Resend emails | Resend Pro | $20/mo | Unlimited (50K/mo) |
| Custom Supabase SMTP | Supabase Pro + Resend SMTP | $25/mo + usage | Unlimited |
| High-volume marketing | Add SendGrid/Mailchimp | $15+/mo | 100K+ |
| Email analytics | Resend + Webhooks | Included | N/A |

### When to Upgrade:
- Approaching 80+ emails/day consistently → Upgrade Resend
- Need auth emails > 2/hour → Add custom SMTP to Supabase  
- Launching marketing campaigns → Consider dedicated marketing ESP

---

## 🔐 Environment Variables Summary

```env
# Required
RESEND_API_KEY=re_xxxxx                    # Resend API key
EMAIL_FROM=Restaurant Hub <noreply@...>    # Default from address

# Supabase (built-in, no config needed)
# Auth emails use project's default sender
```

---

## 📚 References

- [Postmark Transactional Email Best Practices](https://postmarkapp.com/guides/transactional-email-best-practices)
- [Postmark Password Reset Best Practices](https://postmarkapp.com/guides/password-reset-email-best-practices)
- [Mailgun Transactional Email Types](https://www.mailgun.com/blog/email/transactional-email-examples/)
- [Auth0 Email Templates](https://auth0.com/docs/customize/email/email-templates)
- [Resend Documentation](https://resend.com/docs)
- [Supabase Auth Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

---

## 🎨 Brand Guidelines (Updated Feb 2026)

All email templates use the new RHS branding:

| Element | Value | Usage |
|---------|-------|-------|
| Primary Color | `#f0531c` | Headers, buttons, links |
| Primary Dark | `#c24215` | Gradients, hover states |
| Primary Light | `#ff6b35` | Accents |
| Logo | RHS icon (SVG) | Email headers |
| Gradient | `linear-gradient(135deg, #f0531c 0%, #c24215 100%)` | Header backgrounds |

### Template Files Updated:
- `/lib/email/base-template.ts` - Brand color constants
- `/lib/email/templates/admin-invite.ts` - Admin invite template
- `/lib/email.ts` - All transactional templates
- `/scripts/send-admin-invite.ts` - CLI invite script

---

*Last updated: February 1, 2026*
