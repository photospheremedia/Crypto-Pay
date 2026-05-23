# Resend Email Templates Configuration

## Overview
**Resend** handles all **marketing and transactional emails** (non-auth) in Restaurant Hub:
- Welcome campaigns
- Order confirmations
- Subscription renewals
- Abandoned cart reminders
- Promotional emails
- Newsletter

**Current Configuration:**
- API Key: `re_2e7dKPSj...` (in `.env.local`)
- Implementation: `apps/portal/lib/email/sender.ts`
- Edge Function: `/send-email` (already deployed ✅)

---

## Email Templates to Create in Resend

### 1. **Welcome Campaign**
**Template ID:** `welcome`  
**Trigger:** New customer account created  
**Purpose:** Onboard new customers

**Variables:**
- `firstName` - Customer's first name
- `dashboardUrl` - Link to customer dashboard
- `supportUrl` - Link to support page

**Subject:** `Welcome to Restaurant Hub, {{firstName}}!`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to Restaurant Hub!</h1>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px; margin-bottom: 24px;">Hi {{firstName}},</p>
    
    <p>Thank you for joining Restaurant Hub! We're excited to help you streamline your restaurant operations.</p>
    
    <p><strong>Here's what you can do next:</strong></p>
    <ul style="line-height: 2;">
      <li>Browse our product catalog</li>
      <li>Request a custom quote</li>
      <li>Track your orders</li>
      <li>Manage your account settings</li>
    </ul>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{dashboardUrl}}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
    </div>
    
    <p>If you have any questions, our support team is here to help.</p>
    
    <div style="text-align: center; margin-top: 32px;">
      <a href="{{supportUrl}}" style="color: #3b82f6; text-decoration: none;">Contact Support</a>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© 2026 Restaurant Hub. All rights reserved.</p>
    <p>
      <a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
  
</body>
</html>
```

---

### 2. **Order Confirmation**
**Template ID:** `order_confirmation`  
**Trigger:** Order is placed  
**Purpose:** Confirm order details

**Variables:**
- `firstName` - Customer name
- `orderNumber` - Order ID
- `orderTotal` - Total amount
- `estimatedDelivery` - Delivery date
- `orderDetailsUrl` - Link to order page

**Subject:** `Order Confirmed - #{{orderNumber}}`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #10b981; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Order Confirmed!</h1>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px;">Hi {{firstName}},</p>
    
    <p>Thank you for your order! We've received it and we're processing it now.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Order Number:</strong> #{{orderNumber}}</p>
      <p style="margin: 0 0 8px 0;"><strong>Total:</strong> ${{orderTotal}}</p>
      <p style="margin: 0;"><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{orderDetailsUrl}}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">View Order Details</a>
    </div>
    
    <p>We'll send you another email when your order ships.</p>
    
    <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Questions about your order? Contact our support team.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© 2026 Restaurant Hub. All rights reserved.</p>
  </div>
  
</body>
</html>
```

---

### 3. **Subscription Renewal**
**Template ID:** `subscription_renewal`  
**Trigger:** Subscription is renewed  
**Purpose:** Confirm renewal and next billing date

**Variables:**
- `firstName` - Customer name
- `planName` - Subscription plan name
- `renewalAmount` - Amount charged
- `nextBillingDate` - Next billing date
- `manageSubscriptionUrl` - Link to subscription settings

**Subject:** `Subscription Renewed - {{planName}}`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #3b82f6; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Renewed</h1>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px;">Hi {{firstName}},</p>
    
    <p>Your subscription has been successfully renewed.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> {{planName}}</p>
      <p style="margin: 0 0 8px 0;"><strong>Amount Charged:</strong> ${{renewalAmount}}</p>
      <p style="margin: 0;"><strong>Next Billing Date:</strong> {{nextBillingDate}}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{manageSubscriptionUrl}}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Manage Subscription</a>
    </div>
    
    <p style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Want to change your plan? Visit your account settings.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© 2026 Restaurant Hub. All rights reserved.</p>
  </div>
  
</body>
</html>
```

---

### 4. **Abandoned Cart**
**Template ID:** `abandoned_cart`  
**Trigger:** Cart inactive for 24 hours  
**Purpose:** Recover abandoned carts

**Variables:**
- `firstName` - Customer name
- `cartItemCount` - Number of items
- `cartTotal` - Total amount
- `cartUrl` - Link to cart

**Subject:** `You left {{cartItemCount}} items in your cart`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #f59e0b; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Your Cart is Waiting</h1>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px;">Hi {{firstName}},</p>
    
    <p>You left {{cartItemCount}} items in your cart. Complete your order today!</p>
    
    <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 18px; font-weight: 600;">Cart Total: ${{cartTotal}}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{cartUrl}}" style="display: inline-block; padding: 14px 32px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Complete Your Order</a>
    </div>
    
    <p>Need help deciding? Our team is ready to assist you.</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© 2026 Restaurant Hub. All rights reserved.</p>
    <p><a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a></p>
  </div>
  
</body>
</html>
```

---

### 5. **Promotional Campaign**
**Template ID:** `promotional`  
**Trigger:** Manual campaign send  
**Purpose:** Announce sales, promotions, new products

**Variables:**
- `firstName` - Customer name
- `promotionTitle` - Promotion headline
- `promotionDescription` - Promotion details
- `ctaText` - Call-to-action button text
- `ctaUrl` - CTA link
- `expiryDate` - Promotion expiry

**Subject:** `{{promotionTitle}} - Limited Time Offer!`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 50px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">{{promotionTitle}}</h1>
    <p style="color: #fce7f3; margin: 12px 0 0 0; font-size: 18px;">Limited Time Offer</p>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 18px;">Hi {{firstName}},</p>
    
    <p style="font-size: 16px; line-height: 1.8;">{{promotionDescription}}</p>
    
    <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ef4444;">
      <p style="margin: 0; font-weight: 600; color: #dc2626;">⏰ Offer expires: {{expiryDate}}</p>
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ctaUrl}}" style="display: inline-block; padding: 16px 40px; background: #ec4899; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 18px;">{{ctaText}}</a>
    </div>
    
    <p style="margin-top: 32px; font-size: 14px; color: #6b7280;">Don't miss out on this exclusive offer!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© 2026 Restaurant Hub. All rights reserved.</p>
    <p><a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a></p>
  </div>
  
</body>
</html>
```

---

### 6. **Newsletter**
**Template ID:** `newsletter`  
**Trigger:** Monthly newsletter  
**Purpose:** Share updates, tips, industry news

**Variables:**
- `firstName` - Customer name
- `newsletterTitle` - Newsletter headline
- `featuredContent` - Main article HTML
- `ctaText` - Button text
- `ctaUrl` - Button link

**Subject:** `{{newsletterTitle}} - Restaurant Hub Newsletter`

**HTML Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: #1e293b; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Restaurant Hub Newsletter</h1>
    <p style="color: #94a3b8; margin: 8px 0 0 0;">{{newsletterTitle}}</p>
  </div>
  
  <div style="background: white; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px;">Hi {{firstName}},</p>
    
    <div style="margin: 32px 0;">
      {{featuredContent}}
    </div>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="{{ctaUrl}}" style="display: inline-block; padding: 14px 32px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">{{ctaText}}</a>
    </div>
    
    <p style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">Stay tuned for more updates next month!</p>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
    <p>© 2026 Restaurant Hub. All rights reserved.</p>
    <p>
      <a href="{{managePreferencesUrl}}" style="color: #6b7280; margin-right: 12px;">Manage Preferences</a>
      <a href="{{unsubscribeUrl}}" style="color: #6b7280;">Unsubscribe</a>
    </p>
  </div>
  
</body>
</html>
```

---

## Setup Instructions

### Step 1: Create Templates in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/emails)
2. Click **Templates** in sidebar
3. Click **Create Template**
4. For each template above:
   - Name: Use the **Template ID** (e.g., `welcome`)
   - Subject: Copy from above
   - HTML: Copy full HTML template
   - Test: Send test email with sample data
   - Save template

### Step 2: Get Template IDs

After creating each template, Resend will assign a unique ID (e.g., `tmpl_abc123xyz`).

**Update** `apps/portal/lib/email/sender.ts` with these IDs:

```typescript
const RESEND_TEMPLATES = {
  welcome: 'tmpl_welcome_id_here',
  order_confirmation: 'tmpl_order_id_here',
  subscription_renewal: 'tmpl_subscription_id_here',
  abandoned_cart: 'tmpl_cart_id_here',
  promotional: 'tmpl_promo_id_here',
  newsletter: 'tmpl_newsletter_id_here',
};
```

### Step 3: Update Email Sender Function

The current `sender.ts` already supports templates. No code changes needed once template IDs are added.

**Usage Example:**
```typescript
import { sendEmail } from '@/lib/email/sender';

await sendEmail({
  to: { email: 'customer@example.com', name: 'John Doe' },
  subject: 'Welcome to Restaurant Hub!',
  template: 'welcome',
  templateData: {
    firstName: 'John',
    dashboardUrl: 'https://restauranthub.com/account',
    supportUrl: 'https://restauranthub.com/support'
  }
});
```

---

## Configuration Checklist

- [ ] **Create 6 templates** in Resend Dashboard
- [ ] **Test each template** with sample data
- [ ] **Get template IDs** from Resend
- [ ] **Update sender.ts** with template IDs
- [ ] **Test email sending** from admin dashboard
- [ ] **Set up unsubscribe** logic
- [ ] **Configure webhook** for delivery status (optional)
- [ ] **Monitor email metrics** (open rate, click rate, bounces)

---

## Testing

Test each template manually:

```bash
# From admin dashboard:
1. Marketing → Email Campaigns → Create Campaign
2. Select template
3. Add test recipient
4. Send test email
5. Verify email arrives correctly
6. Check all links work
7. Test unsubscribe flow
```

---

## Troubleshooting

**Template not found:**
- Verify template ID in sender.ts matches Resend
- Check template is published (not draft)

**Variables not rendering:**
- Use `{{variableName}}` syntax in Resend templates
- Pass matching keys in `templateData` object
- Check for typos in variable names

**Emails not sending:**
- Verify Resend API key in `.env.local`
- Check rate limits (3000/month on free tier)
- Review Resend logs for errors

---

## Resources

- [Resend Templates Documentation](https://resend.com/docs/send-with-templates)
- [Resend Dashboard](https://resend.com/emails)
- [Email Best Practices](https://resend.com/docs/knowledge-base/email-best-practices)
