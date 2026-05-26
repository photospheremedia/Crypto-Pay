/**
 * Professional Email Templates - Crypto Pay
 * B2B-focused templates matching industry standards
 */

import { generateBaseTemplate, components, brandColors } from './base-template';
import { walletEmailTemplates } from './templates/wallet';

export type EmailTemplate = 
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "wallet_pending_admin"
  | "wallet_status_merchant"
  | "wallet_submitted_merchant"
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "invoice"
  | "payment_received"
  | "payment_failed"
  | "subscription_welcome"
  | "subscription_renewal"
  | "subscription_expired"
  | "abandoned_cart"
  | "reengagement"
  | "promotional"
  | "newsletter"
  | "account_approved"
  | "credit_approved"
  | "low_stock_alert";

interface TemplateConfig {
  subject: string;
  generateHtml: (data: Record<string, unknown>) => string;
}

export const emailTemplates: Record<EmailTemplate, TemplateConfig> = {
  // ============================================
  // ONBOARDING & AUTHENTICATION
  // ============================================
  
  welcome: {
    subject: "Welcome to Crypto Pay — add your payout wallet",
    generateHtml: (data) =>
      generateBaseTemplate(
        `
      ${components.iconHero("👋", `Welcome, ${data.firstName || "there"}!`, "One login — add as many payout wallets as you need.")}
      ${components.contentOpen()}
          ${components.paragraph(`Thanks for joining <strong>Crypto Pay</strong>${data.businessName ? ` for <strong>${data.businessName}</strong>` : ""}. Your next step is to add a public payout address (we never ask for private keys).`)}
          ${components.card(
            `
            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">Setup checklist</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr><td style="padding: 6px 0;"><span style="color: ${brandColors.primary}; font-weight: 700;">✓</span> <span style="margin-left: 8px;">Account created</span></td></tr>
              <tr><td style="padding: 6px 0;"><span style="color: #0891b2; font-weight: 700;">→</span> <span style="margin-left: 8px;"><strong>Add payout wallet</strong> (BTC, ETH, USDT, …)</span></td></tr>
              <tr><td style="padding: 6px 0;"><span style="color: ${brandColors.textMuted};">○</span> <span style="margin-left: 8px;">Admin verifies each address</span></td></tr>
              <tr><td style="padding: 6px 0;"><span style="color: ${brandColors.textMuted};">○</span> <span style="margin-left: 8px;">Accept payments (coming soon)</span></td></tr>
            </table>
          `,
            { highlight: true },
          )}
          ${components.button("Add payout wallet", (data.dashboardUrl as string) || "https://cryptopay.sale/account?tab=wallets")}
          ${components.paragraph(`You'll receive at most a few transactional emails during setup (wallet received, verified, or changes needed).`, { small: true, muted: true, center: true })}
          ${components.paragraph(`Questions? <a href="mailto:support@cryptopay.sale" style="color: ${brandColors.primary};">support@cryptopay.sale</a>`, { muted: true, center: true })}
      ${components.contentClose()}
    `,
        { preheader: `Welcome ${data.firstName || ""} — add your first payout wallet.` },
      ),
  },

  email_verification: {
    subject: "Verify your email — Crypto Pay",
    generateHtml: (data) =>
      generateBaseTemplate(
        `
      ${components.iconHero("✉️", "Verify your email", `Hi ${data.firstName || "there"}, confirm your address to activate your account.`)}
      ${components.contentOpen()}
          ${components.button("Verify email", (data.verificationUrl as string) || "#")}
          ${components.card(`<p style="margin: 0; font-size: 13px; color: ${brandColors.textLight};">Or paste this link:<br><span style="color: ${brandColors.primary}; word-break: break-all;">${data.verificationUrl}</span></p>`)}
          ${components.paragraph("Link expires in 24 hours. Ignore this email if you did not sign up.", { small: true, muted: true, center: true })}
      ${components.contentClose()}
    `,
        { preheader: "Confirm your email to activate Crypto Pay." },
      ),
  },

  password_reset: {
    subject: "Reset your password — Crypto Pay",
    generateHtml: (data) =>
      generateBaseTemplate(
        `
      ${components.iconHero("🔐", "Reset your password", "We received a request to reset your Crypto Pay password.")}
      ${components.contentOpen()}
          ${components.button("Reset password", (data.resetUrl as string) || "#")}
          ${components.card(`
            <p style="margin: 0 0 8px; font-size: 13px; color: ${brandColors.warning}; font-weight: 600;">Security notice</p>
            <p style="margin: 0; font-size: 13px; color: ${brandColors.textLight};">Expires in 1 hour. If you did not request this, ignore the email or contact support.</p>
          `)}
          ${components.paragraph(`Requested: ${data.requestTime || new Date().toLocaleString()}`, { small: true, muted: true, center: true })}
      ${components.contentClose()}
    `,
        { preheader: "Reset your Crypto Pay password." },
      ),
  },

  // ============================================
  // ORDER LIFECYCLE
  // ============================================

  order_confirmation: {
    subject: "Order Confirmed #{{orderNumber}} - Crypto Pay",
    generateHtml: (data) => {
      const items = (data.items as Array<{ name: string; quantity: number; price: number; image?: string }>) || [];
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shipping = (data.shipping as number) || 0;
      const tax = (data.tax as number) || 0;
      const total = subtotal + shipping + tax;

      return generateBaseTemplate(`
        <!-- Success banner -->
        <tr>
          <td style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%); padding: 32px; text-align: center;">
            <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 30px;">✓</span>
            </div>
            <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: white;">Order Confirmed!</h1>
            <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
              Order #${data.orderNumber} • ${data.orderDate || new Date().toLocaleDateString()}
            </p>
          </td>
        </tr>
        
        <tr>
          <td style="padding: 32px;" class="email-content">
            ${components.paragraph(`Hi ${data.customerName},`)}
            ${components.paragraph('Thank you for your order! We\'ve received it and will begin processing shortly. You\'ll receive another email when your order ships.')}
            
            <!-- Order summary -->
            ${components.card(`
              <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">Order Summary</p>
              ${components.orderTable(items, subtotal)}
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 16px; border-top: 1px solid ${brandColors.border}; padding-top: 16px;">
                ${components.infoRow('Subtotal', `$${subtotal.toFixed(2)}`)}
                ${components.infoRow('Shipping', shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`)}
                ${components.infoRow('Tax', `$${tax.toFixed(2)}`)}
                <tr>
                  <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: ${brandColors.secondary}; border-top: 2px solid ${brandColors.border};">Total</td>
                  <td align="right" style="padding: 12px 0 0; font-size: 20px; font-weight: 700; color: ${brandColors.primary}; border-top: 2px solid ${brandColors.border};">$${total.toFixed(2)}</td>
                </tr>
              </table>
            `)}
            
            <!-- Shipping info -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
              <tr>
                <td width="50%" style="padding: 16px; background: ${brandColors.background}; border-radius: 8px 0 0 8px; vertical-align: top;">
                  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Shipping To</p>
                  <p style="margin: 0; font-size: 14px; color: ${brandColors.secondary}; line-height: 1.5;">
                    ${data.shippingAddress || 'Address on file'}
                  </p>
                </td>
                <td width="50%" style="padding: 16px; background: ${brandColors.background}; border-radius: 0 8px 8px 0; vertical-align: top; border-left: 2px solid white;">
                  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Estimated Delivery</p>
                  <p style="margin: 0; font-size: 14px; color: ${brandColors.secondary}; font-weight: 600;">
                    ${data.estimatedDelivery || '3-5 business days'}
                  </p>
                </td>
              </tr>
            </table>
            
            ${components.button('Track Order', data.trackingUrl as string || '#')}
            
            ${components.divider()}
            
            ${components.paragraph('Questions about your order? Contact our B2B support team.', { muted: true, small: true })}
          </td>
        </tr>
      `, { preheader: `Order #${data.orderNumber} confirmed! Estimated delivery: ${data.estimatedDelivery || '3-5 days'}` });
    },
  },

  order_shipped: {
    subject: "Your Order Has Shipped! #{{orderNumber}}",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #eef2ff; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🚚</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.secondary};">Your Order Is On Its Way!</h1>
          <p style="margin: 0; font-size: 14px; color: ${brandColors.textLight};">
            Order #${data.orderNumber}
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph('Great news! Your order has shipped and is on its way to you.')}
          
          ${components.card(`
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow('Carrier', data.carrier as string || 'Standard Shipping')}
              ${components.infoRow('Tracking Number', `<a href="${data.trackingUrl}" style="color: ${brandColors.primary};">${data.trackingNumber}</a>`)}
              ${components.infoRow('Estimated Delivery', data.estimatedDelivery as string || 'See tracking')}
            </table>
          `, { highlight: true })}
          
          ${components.button('Track Your Package', data.trackingUrl as string || '#')}
          
          ${components.paragraph('You can track your package using the link above. We\'ll send another email when it\'s delivered.', { muted: true, small: true })}
        </td>
      </tr>
    `, { preheader: `Your order #${data.orderNumber} is on its way! Track it now.` }),
  },

  order_delivered: {
    subject: "Order Delivered! #{{orderNumber}} ✅",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #f0fdf4; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">📦✅</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.secondary};">Order Delivered!</h1>
          <p style="margin: 0; font-size: 14px; color: ${brandColors.textLight};">
            Order #${data.orderNumber}
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph('Your order has been delivered. We hope everything arrived in perfect condition!')}
          
          ${components.card(`
            <p style="margin: 0 0 12px; font-size: 14px; color: ${brandColors.text};">
              <strong>Delivered:</strong> ${data.deliveryDate || new Date().toLocaleDateString()}<br>
              <strong>Left at:</strong> ${data.deliveryLocation || 'Front door'}
            </p>
          `)}
          
          ${components.divider()}
          
          <p style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: ${brandColors.secondary};">How was your experience?</p>
          
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
              <td>
                <a href="${data.reviewUrl}?rating=5" style="text-decoration: none; font-size: 32px; padding: 0 4px;">⭐</a>
                <a href="${data.reviewUrl}?rating=4" style="text-decoration: none; font-size: 32px; padding: 0 4px;">⭐</a>
                <a href="${data.reviewUrl}?rating=3" style="text-decoration: none; font-size: 32px; padding: 0 4px;">⭐</a>
                <a href="${data.reviewUrl}?rating=2" style="text-decoration: none; font-size: 32px; padding: 0 4px;">⭐</a>
                <a href="${data.reviewUrl}?rating=1" style="text-decoration: none; font-size: 32px; padding: 0 4px;">⭐</a>
              </td>
            </tr>
          </table>
          
          ${components.button('Leave a Review', data.reviewUrl as string || '#', 'secondary')}
          
          ${components.paragraph('Need to reorder? Use our Quick Reorder feature to place the same order with one click.', { muted: true, small: true })}
          
          ${components.button('Reorder →', data.reorderUrl as string || '#', 'outline')}
        </td>
      </tr>
    `, { preheader: `Your order #${data.orderNumber} has been delivered!` }),
  },

  // ============================================
  // BILLING & PAYMENTS
  // ============================================

  invoice: {
    subject: "Invoice #{{invoiceNumber}} - Crypto Pay",
    generateHtml: (data) => {
      const items = (data.items as Array<{ name: string; quantity: number; price: number }>) || [];
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = (data.tax as number) || 0;
      const total = subtotal + tax;

      return generateBaseTemplate(`
        <tr>
          <td style="padding: 32px; border-bottom: 3px solid ${brandColors.primary};">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: ${brandColors.secondary};">INVOICE</h1>
                </td>
                <td align="right">
                  <p style="margin: 0; font-size: 14px; color: ${brandColors.textLight};">
                    Invoice #: <strong style="color: ${brandColors.secondary};">${data.invoiceNumber}</strong><br>
                    Date: ${data.invoiceDate || new Date().toLocaleDateString()}<br>
                    Due: <strong style="color: ${data.isPastDue ? brandColors.error : brandColors.secondary};">${data.dueDate}</strong>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td style="padding: 32px;" class="email-content">
            <!-- Bill To -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 32px;">
              <tr>
                <td width="50%" style="vertical-align: top;">
                  <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Bill To</p>
                  <p style="margin: 0; font-size: 14px; color: ${brandColors.secondary}; line-height: 1.6;">
                    <strong>${data.customerName}</strong><br>
                    ${data.businessName || ''}<br>
                    ${data.billingAddress || ''}
                  </p>
                </td>
                <td width="50%" align="right" style="vertical-align: top;">
                  ${data.isPastDue ? components.badge('PAST DUE', 'error') : data.isPaid ? components.badge('PAID', 'success') : components.badge('PENDING', 'warning')}
                </td>
              </tr>
            </table>
            
            <!-- Line items -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
              <tr style="background: ${brandColors.background};">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Description</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Qty</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Price</th>
                <th style="padding: 12px; text-align: right; font-size: 12px; font-weight: 600; color: ${brandColors.textLight}; text-transform: uppercase;">Amount</th>
              </tr>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid ${brandColors.border};">
                  <td style="padding: 16px 12px; font-size: 14px; color: ${brandColors.secondary};">${item.name}</td>
                  <td style="padding: 16px 12px; font-size: 14px; color: ${brandColors.text}; text-align: center;">${item.quantity}</td>
                  <td style="padding: 16px 12px; font-size: 14px; color: ${brandColors.text}; text-align: right;">$${item.price.toFixed(2)}</td>
                  <td style="padding: 16px 12px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary}; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>
            
            <!-- Totals -->
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="300" style="margin-left: auto;">
              ${components.infoRow('Subtotal', `$${subtotal.toFixed(2)}`)}
              ${components.infoRow('Tax', `$${tax.toFixed(2)}`)}
              <tr>
                <td style="padding: 12px 0; font-size: 18px; font-weight: 700; color: ${brandColors.secondary}; border-top: 2px solid ${brandColors.secondary};">Total Due</td>
                <td align="right" style="padding: 12px 0; font-size: 20px; font-weight: 700; color: ${brandColors.primary}; border-top: 2px solid ${brandColors.secondary};">$${total.toFixed(2)}</td>
              </tr>
            </table>
            
            ${!data.isPaid ? components.button('Pay Now', data.paymentUrl as string || '#') : ''}
            
            ${components.divider()}
            
            ${components.card(`
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: ${brandColors.secondary};">Payment Terms</p>
              <p style="margin: 0; font-size: 13px; color: ${brandColors.textLight};">
                ${data.paymentTerms || 'Net 30'} • Make checks payable to Crypto Pay<br>
                Bank: First National • Account: XXXX-XXXX-1234
              </p>
            `)}
          </td>
        </tr>
      `, { 
        preheader: `Invoice #${data.invoiceNumber} - $${total.toFixed(2)} due ${data.dueDate}`,
        showSocial: false 
      });
    },
  },

  payment_received: {
    subject: "Payment Received - Thank You! 💚",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #f0fdf4; padding: 48px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">💳✓</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.secondary};">Payment Received!</h1>
          <p style="margin: 0; font-size: 18px; color: ${brandColors.primary}; font-weight: 600;">
            $${data.amount}
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph('Thank you for your payment! Here are the details for your records.')}
          
          ${components.card(`
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow('Amount', `$${data.amount}`)}
              ${components.infoRow('Invoice #', data.invoiceNumber as string)}
              ${components.infoRow('Payment Method', data.paymentMethod as string || 'Credit Card')}
              ${components.infoRow('Transaction ID', data.transactionId as string)}
              ${components.infoRow('Date', data.paymentDate as string || new Date().toLocaleDateString())}
            </table>
          `, { highlight: true })}
          
          ${components.button('Download Receipt', data.receiptUrl as string || '#', 'secondary')}
          
          ${components.paragraph('This receipt has been sent to your email for your records.', { muted: true, small: true })}
        </td>
      </tr>
    `, { preheader: `Payment of $${data.amount} received. Thank you!` }),
  },

  payment_failed: {
    subject: "⚠️ Payment Failed - Action Required",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #fef2f2; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.error};">Payment Failed</h1>
          <p style="margin: 0; font-size: 14px; color: ${brandColors.text};">
            We couldn't process your payment of $${data.amount}
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph(`We were unable to process your payment for invoice #${data.invoiceNumber}. This could be due to insufficient funds, an expired card, or a temporary issue with your bank.`)}
          
          ${components.card(`
            <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: ${brandColors.error};">Error Details</p>
            <p style="margin: 0; font-size: 14px; color: ${brandColors.text};">${data.errorMessage || 'Payment declined'}</p>
          `)}
          
          ${components.paragraph('<strong>What to do next:</strong>')}
          <ol style="margin: 0 0 16px; padding-left: 20px; color: ${brandColors.text}; line-height: 1.8;">
            <li>Check your card details are correct</li>
            <li>Ensure sufficient funds are available</li>
            <li>Try a different payment method</li>
            <li>Contact your bank if issues persist</li>
          </ol>
          
          ${components.button('Update Payment Method', data.updatePaymentUrl as string || '#')}
          
          ${components.paragraph("If you need assistance, please contact our billing team at billing@cryptopay.sale", { muted: true, small: true })}
        </td>
      </tr>
    `, { preheader: `Action required: Payment of $${data.amount} failed for invoice #${data.invoiceNumber}` }),
  },

  // ============================================
  // SUBSCRIPTIONS
  // ============================================

  subscription_welcome: {
    subject: "Welcome to {{planName}}! 🎉",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 48px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">🎉</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: white;">Welcome to ${data.planName}!</h1>
          <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
            Your subscription is now active
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph(`Thank you for subscribing to the <strong>${data.planName}</strong> plan! You now have access to all the features included in your subscription.`)}
          
          ${components.card(`
            <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">Your Plan Includes:</p>
            <ul style="margin: 0; padding-left: 20px; color: ${brandColors.text}; line-height: 1.8;">
              ${(data.features as string[] || ['Premium features', 'Priority support', 'Analytics dashboard']).map(f => `<li>${f}</li>`).join('')}
            </ul>
          `, { highlight: true })}
          
          ${components.card(`
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow('Plan', data.planName as string)}
              ${components.infoRow('Price', `$${data.price}/month`)}
              ${components.infoRow('Billing Cycle', data.billingCycle as string || 'Monthly')}
              ${components.infoRow('Next Billing Date', data.nextBillingDate as string)}
            </table>
          `)}
          
          ${components.button('Go to Dashboard', data.dashboardUrl as string || '#')}
        </td>
      </tr>
    `, { preheader: `Your ${data.planName} subscription is now active!` }),
  },

  subscription_renewal: {
    subject: "Your Subscription Renews in {{daysUntil}} Days",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="padding: 32px;" class="email-content">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px;">📅</div>
          </div>
          
          ${components.heading('Subscription Renewal Reminder', 2)}
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph(`Your <strong>${data.planName}</strong> subscription will automatically renew on <strong>${data.renewalDate}</strong>.`)}
          
          ${components.card(`
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow('Plan', data.planName as string)}
              ${components.infoRow('Amount', `$${data.amount}`)}
              ${components.infoRow('Payment Method', data.paymentMethod as string || 'Card on file')}
              ${components.infoRow('Renewal Date', data.renewalDate as string)}
            </table>
          `, { highlight: true })}
          
          ${components.paragraph('No action needed if you want to continue your subscription. Your card will be charged automatically.')}
          
          ${components.button('Manage Subscription', data.manageUrl as string || '#', 'secondary')}
          
          ${components.paragraph('Want to change plans or cancel? You can do so anytime from your account settings.', { muted: true, small: true })}
        </td>
      </tr>
    `, { preheader: `Your ${data.planName} subscription renews on ${data.renewalDate}` }),
  },

  subscription_expired: {
    subject: "Your Subscription Has Expired",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #fef3c7; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">⏰</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.secondary};">Your Subscription Has Expired</h1>
          <p style="margin: 0; font-size: 14px; color: ${brandColors.text};">
            Renew now to regain access to all features
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph(`Your <strong>${data.planName}</strong> subscription expired on ${data.expirationDate}. You've lost access to premium features including:`)}
          
          <ul style="margin: 0 0 24px; padding-left: 20px; color: ${brandColors.text}; line-height: 1.8;">
            ${(data.lostFeatures as string[] || ['Volume discounts', 'Priority support', 'Analytics']).map(f => `<li>${f}</li>`).join('')}
          </ul>
          
          ${components.card(`
            <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: ${brandColors.primary};">🎁 Special Offer: Come Back & Save!</p>
            <p style="margin: 0; font-size: 14px; color: ${brandColors.text};">
              Renew within the next 7 days and get <strong>20% off</strong> your first month back.
            </p>
          `, { highlight: true })}
          
          ${components.button('Reactivate Now', data.reactivateUrl as string || '#')}
        </td>
      </tr>
    `, { preheader: `Your ${data.planName} subscription has expired. Renew to regain access.` }),
  },

  // ============================================
  // MARKETING & ENGAGEMENT
  // ============================================

  abandoned_cart: {
    subject: "You left something in your cart 🛒",
    generateHtml: (data) => {
      const items = (data.items as Array<{ name: string; quantity: number; price: number; image?: string }>) || [];
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return generateBaseTemplate(`
        <tr>
          <td style="padding: 32px;" class="email-content">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="font-size: 48px;">🛒</div>
            </div>
            
            ${components.heading('Forgot Something?', 2)}
            ${components.paragraph(`Hi ${data.customerName || 'there'},`)}
            ${components.paragraph('You left some items in your cart. Complete your order before they run out!')}
            
            ${components.card(`
              ${components.orderTable(items, total)}
            `)}
            
            ${data.discountCode ? components.card(`
              <p style="margin: 0 0 8px; font-size: 14px; color: ${brandColors.primary}; font-weight: 600;">🎁 Special Offer Just For You!</p>
              <p style="margin: 0; font-size: 14px; color: ${brandColors.text};">
                Use code <strong style="background: #f0fdf4; padding: 2px 8px; border-radius: 4px;">${data.discountCode}</strong> for ${data.discountAmount} off your order!
              </p>
            `, { highlight: true }) : ''}
            
            ${components.button('Complete Your Order →', data.cartUrl as string || '#')}
            
            ${components.paragraph('Need help? Our team is available 24/7 to assist with your order.', { muted: true, small: true })}
          </td>
        </tr>
      `, { preheader: `Your cart is waiting! ${items.length} item(s) totaling $${total.toFixed(2)}` });
    },
  },

  reengagement: {
    subject: "We Miss You! Here's {{discountAmount}} Off 💚",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%); padding: 48px 32px; text-align: center;">
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: white;">We Miss You, ${data.firstName || 'Friend'}!</h1>
          <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.9);">
            It's been a while since your last order
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px; text-align: center;" class="email-content">
          ${components.card(`
            <p style="margin: 0 0 8px; font-size: 14px; color: ${brandColors.textLight};">EXCLUSIVE COMEBACK OFFER</p>
            <p style="margin: 0; font-size: 48px; font-weight: 700; color: ${brandColors.primary};">${data.discountAmount || '15% OFF'}</p>
            <p style="margin: 16px 0 0; font-size: 14px; color: ${brandColors.text};">
              Use code: <strong style="background: ${brandColors.background}; padding: 4px 12px; border-radius: 4px; font-family: monospace;">${data.discountCode || 'COMEBACK15'}</strong>
            </p>
          `, { highlight: true })}
          
          ${components.paragraph('Since you\'ve been away, we\'ve added new products, improved our service, and have exclusive deals waiting for you!')}
          
          ${components.button('Shop Now →', data.shopUrl as string || '#')}
          
          ${components.divider()}
          
          ${components.paragraph(`<strong>What's New:</strong>`, { small: true })}
          <ul style="margin: 0; padding-left: 20px; color: ${brandColors.textLight}; font-size: 14px; line-height: 1.8; text-align: left;">
            <li>500+ new products added</li>
            <li>Same-day delivery in select areas</li>
            <li>Improved B2B dashboard</li>
          </ul>
        </td>
      </tr>
    `, { preheader: `We miss you! Here's ${data.discountAmount || '15%'} off your next order.` }),
  },

  promotional: {
    subject: "{{subject}}",
    generateHtml: (data) => generateBaseTemplate(`
      ${data.headerImage ? `
      <tr>
        <td>
          <img src="${data.headerImage}" alt="${data.headline}" width="600" style="width: 100%; display: block; border-radius: 12px 12px 0 0;">
        </td>
      </tr>
      ` : ''}
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.heading(data.headline as string || 'Special Offer')}
          
          <div style="font-size: 15px; color: ${brandColors.text}; line-height: 1.6;">
            ${data.content}
          </div>
          
          ${data.ctaText ? components.button(data.ctaText as string, data.ctaUrl as string || '#') : ''}
          
          ${data.expirationDate ? `
          ${components.paragraph(`<em>Offer expires: ${data.expirationDate}</em>`, { muted: true, small: true })}
          ` : ''}
        </td>
      </tr>
    `, { preheader: data.preheader as string || data.headline as string || '' }),
  },

  newsletter: {
    subject: "{{subject}}",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.heading(data.headline as string || 'Crypto Pay Newsletter')}
          
          <div style="font-size: 15px; color: ${brandColors.text}; line-height: 1.6;">
            ${data.content}
          </div>
          
          ${data.articles ? `
          ${components.divider()}
          ${(data.articles as Array<{ title: string; excerpt: string; url: string; image?: string }>).map(article => `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
              <tr>
                ${article.image ? `
                <td width="120" style="padding-right: 16px; vertical-align: top;">
                  <img src="${article.image}" alt="${article.title}" width="120" style="border-radius: 8px;">
                </td>
                ` : ''}
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: ${brandColors.secondary};">
                    <a href="${article.url}" style="color: ${brandColors.secondary}; text-decoration: none;">${article.title}</a>
                  </p>
                  <p style="margin: 0; font-size: 14px; color: ${brandColors.textLight}; line-height: 1.5;">${article.excerpt}</p>
                </td>
              </tr>
            </table>
          `).join('')}
          ` : ''}
        </td>
      </tr>
    `, { preheader: data.preheader as string || '' }),
  },

  // ============================================
  // B2B SPECIFIC
  // ============================================

  account_approved: {
    subject: "Your B2B Account Has Been Approved! ✅",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #f0fdf4; padding: 48px 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.secondary};">Account Approved!</h1>
          <p style="margin: 0; font-size: 14px; color: ${brandColors.text};">
            You now have full B2B access
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph(`Great news! Your B2B account for <strong>${data.businessName}</strong> has been approved. You now have access to wholesale pricing and B2B features.`)}
          
          ${components.card(`
            <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">Your B2B Benefits:</p>
            <ul style="margin: 0; padding-left: 20px; color: ${brandColors.text}; line-height: 1.8;">
              <li>Wholesale pricing on all products</li>
              <li>Volume discounts available</li>
              <li>${data.paymentTerms || 'Net 30'} payment terms</li>
              <li>Dedicated account manager</li>
              <li>Priority support</li>
            </ul>
          `, { highlight: true })}
          
          ${data.creditLimit ? components.card(`
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow('Credit Limit', `$${data.creditLimit}`)}
              ${components.infoRow('Payment Terms', data.paymentTerms as string || 'Net 30')}
            </table>
          `) : ''}
          
          ${components.button('Start Shopping', data.shopUrl as string || '#')}
        </td>
      </tr>
    `, { preheader: `Your B2B account for ${data.businessName} has been approved!` }),
  },

  credit_approved: {
    subject: "Your Credit Application Has Been Approved!",
    generateHtml: (data) => generateBaseTemplate(`
      <tr>
        <td style="background: #f0fdf4; padding: 32px; text-align: center;">
          <div style="font-size: 48px; margin-bottom: 16px;">💳✅</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: ${brandColors.secondary};">Credit Approved!</h1>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 32px;" class="email-content">
          ${components.paragraph(`Hi ${data.customerName},`)}
          ${components.paragraph('Congratulations! Your credit application has been approved. You can now place orders on credit terms.')}
          
          ${components.card(`
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow('Credit Limit', `$${data.creditLimit}`)}
              ${components.infoRow('Payment Terms', data.paymentTerms as string)}
              ${components.infoRow('Available Credit', `$${data.availableCredit || data.creditLimit}`)}
            </table>
          `, { highlight: true })}
          
          ${components.paragraph('<strong>Important:</strong> Please ensure payments are made within the agreed terms to maintain your credit standing.')}
          
          ${components.button('View Account', data.accountUrl as string || '#')}
        </td>
      </tr>
    `, { preheader: `Your $${data.creditLimit} credit limit has been approved!` }),
  },

  ...walletEmailTemplates,

  low_stock_alert: {
    subject: "⚠️ Low Stock Alert - Reorder Now",
    generateHtml: (data) => {
      const items = (data.items as Array<{ name: string; currentStock: number; reorderPoint: number; sku: string }>) || [];
      
      return generateBaseTemplate(`
        <tr>
          <td style="background: #fef3c7; padding: 24px 32px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td>
                  <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
                  <span style="font-size: 18px; font-weight: 700; color: ${brandColors.secondary};">Low Stock Alert</span>
                </td>
                <td align="right">
                  ${components.badge(`${items.length} items`, 'warning')}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr>
          <td style="padding: 32px;" class="email-content">
            ${components.paragraph(`Hi ${data.customerName},`)}
            ${components.paragraph('The following items from your regular orders are running low and may need to be reordered soon:')}
            
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
              <tr style="background: ${brandColors.background};">
                <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: ${brandColors.textLight};">Product</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: ${brandColors.textLight};">Stock</th>
                <th style="padding: 12px; text-align: center; font-size: 12px; font-weight: 600; color: ${brandColors.textLight};">Reorder At</th>
              </tr>
              ${items.map(item => `
                <tr style="border-bottom: 1px solid ${brandColors.border};">
                  <td style="padding: 16px 12px;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">${item.name}</p>
                    <p style="margin: 0; font-size: 12px; color: ${brandColors.textLight};">SKU: ${item.sku}</p>
                  </td>
                  <td style="padding: 16px 12px; text-align: center;">
                    <span style="display: inline-block; background: ${item.currentStock <= item.reorderPoint / 2 ? '#fee2e2' : '#fef3c7'}; color: ${item.currentStock <= item.reorderPoint / 2 ? '#991b1b' : '#92400e'}; padding: 4px 12px; border-radius: 4px; font-weight: 600;">
                      ${item.currentStock}
                    </span>
                  </td>
                  <td style="padding: 16px 12px; text-align: center; color: ${brandColors.textLight};">
                    ${item.reorderPoint}
                  </td>
                </tr>
              `).join('')}
            </table>
            
            ${components.button('Reorder Now', data.reorderUrl as string || '#')}
          </td>
        </tr>
      `, { preheader: `${items.length} items are running low on stock. Reorder now!` });
    },
  },
};
