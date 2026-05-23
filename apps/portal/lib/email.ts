/**
 * Email Service for Restaurant Hub Solution
 * Supports Resend as the primary provider (can be extended for SendGrid, etc.)
 * 
 * To use:
 * 1. Install Resend: pnpm add resend
 * 2. Add RESEND_API_KEY to your environment variables
 * 3. Configure your domain in Resend dashboard
 */

// Types for email service
export type EmailTemplate = 
  | "welcome"
  | "order_confirmation"
  | "subscription_renewal"
  | "abandoned_cart"
  | "reengagement"
  | "promotional";

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  template?: EmailTemplate;
  templateData?: Record<string, unknown>;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
  scheduledAt?: Date;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Email templates for Restaurant Hub Solution
const emailTemplates: Record<EmailTemplate, { subject: string; generateHtml: (data: Record<string, unknown>) => string }> = {
  welcome: {
    subject: "Welcome to Restaurant Hub Solution! 🎉",
    generateHtml: (data) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #f0531c 0%, #c24215 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Restaurant Hub Solution!</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Hi ${data.firstName || "there"},
              </p>
              <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                Thank you for joining Restaurant Hub Solution! We're excited to help you streamline your restaurant supply chain.
              </p>
              <div style="background: #fff7ed; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #c24215; margin-top: 0;">Here's what you can do next:</h3>
                <ul style="color: #374151; line-height: 1.8;">
                  <li>Complete your store profile</li>
                  <li>Browse our extensive product catalog</li>
                  <li>Set up your preferred payment method</li>
                  <li>Explore exclusive discounts for new members</li>
                </ul>
              </div>
              <a href="${data.dashboardUrl || 'https://restauranthubsolution.com/account'}" 
                 style="display: inline-block; background: #f0531c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 10px;">
                Get Started →
              </a>
              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Need help? Reply to this email or visit our <a href="https://restauranthubsolution.com/faq" style="color: #f0531c;">Help Center</a>.
              </p>
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Restaurant Hub Solution • Powering restaurant success<br>
                <a href="%unsubscribe_url%" style="color: #6b7280;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  order_confirmation: {
    subject: "Order Confirmed - #{{orderNumber}}",
    generateHtml: (data) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
            <div style="background: #f0531c; padding: 30px 20px; text-align: center;">
              <div style="background: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 30px; color: #f0531c;">✓</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 24px;">Order Confirmed!</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #374151;">
                Thank you for your order, ${data.customerName || "valued customer"}!
              </p>
              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">Order Number</p>
                <p style="margin: 0; font-size: 20px; font-weight: 600; color: #111827;">#${data.orderNumber}</p>
              </div>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e7eb;">
                    <th style="text-align: left; padding: 10px 0; color: #6b7280; font-size: 14px;">Item</th>
                    <th style="text-align: right; padding: 10px 0; color: #6b7280; font-size: 14px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${(data.items as Array<{ name: string; quantity: number; price: number }>)?.map(item => `
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 15px 0; color: #374151;">${item.name} × ${item.quantity}</td>
                      <td style="padding: 15px 0; color: #374151; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  `).join('') || ''}
                </tbody>
                <tfoot>
                  <tr>
                    <td style="padding: 15px 0; font-weight: 600; color: #111827;">Total</td>
                    <td style="padding: 15px 0; font-weight: 600; color: #f0531c; text-align: right; font-size: 18px;">$${data.total}</td>
                  </tr>
                </tfoot>
              </table>
              <a href="${data.orderUrl || '#'}" 
                 style="display: inline-block; background: #f0531c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Track Order
              </a>
            </div>
          </div>
        </body>
      </html>
    `,
  },
  subscription_renewal: {
    subject: "Your subscription renews in 7 days",
    generateHtml: (data) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; padding: 30px;">
            <h2 style="color: #111827;">Subscription Renewal Reminder</h2>
            <p style="color: #374151; line-height: 1.6;">
              Hi ${data.customerName},
            </p>
            <p style="color: #374151; line-height: 1.6;">
              Your <strong>${data.planName}</strong> subscription will automatically renew on <strong>${data.renewalDate}</strong>.
            </p>
            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                Amount: <strong>$${data.amount}/month</strong>
              </p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              No action needed if you wish to continue. To manage your subscription, 
              <a href="${data.manageUrl || '#'}" style="color: #f0531c;">click here</a>.
            </p>
          </div>
        </body>
      </html>
    `,
  },
  abandoned_cart: {
    subject: "You left something behind! 🛒",
    generateHtml: (data) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; padding: 30px;">
            <h2 style="color: #111827;">Your cart is waiting! 🛒</h2>
            <p style="color: #374151; line-height: 1.6;">
              Hi ${data.customerName || "there"},
            </p>
            <p style="color: #374151; line-height: 1.6;">
              You left some great items in your cart. Complete your order before they run out!
            </p>
            <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 5px; color: #6b7280; font-size: 14px;">Cart Total</p>
              <p style="margin: 0; font-size: 24px; font-weight: 600; color: #f0531c;">$${data.cartTotal}</p>
            </div>
            <a href="${data.cartUrl || '#'}" 
               style="display: inline-block; background: #f0531c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Complete Order
            </a>
          </div>
        </body>
      </html>
    `,
  },
  reengagement: {
    subject: "We miss you! Come back for 15% off 💚",
    generateHtml: (data) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; padding: 30px; text-align: center;">
            <h2 style="color: #111827;">We miss you, ${data.firstName || "friend"}! 🧡</h2>
            <p style="color: #374151; line-height: 1.6;">
              It's been a while since your last order. We've added new products and features you might love!
            </p>
            <div style="background: linear-gradient(135deg, #f0531c 0%, #c24215 100%); border-radius: 8px; padding: 30px; margin: 20px 0; color: white;">
              <p style="margin: 0 0 10px; font-size: 14px;">EXCLUSIVE OFFER</p>
              <p style="margin: 0; font-size: 36px; font-weight: 700;">15% OFF</p>
              <p style="margin: 10px 0 0; font-size: 14px;">Use code: <strong>COMEBACK15</strong></p>
            </div>
            <a href="${data.shopUrl || '#'}" 
               style="display: inline-block; background: #111827; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Shop Now
            </a>
          </div>
        </body>
      </html>
    `,
  },
  promotional: {
    subject: "{{subject}}",
    generateHtml: (data) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden;">
            ${data.headerImage ? `<img src="${data.headerImage}" style="width: 100%; display: block;" alt="Promotion">` : ''}
            <div style="padding: 30px;">
              <h1 style="color: #111827; margin-top: 0;">${data.headline}</h1>
              <div style="color: #374151; line-height: 1.6;">
                ${data.content}
              </div>
              ${data.ctaText ? `
                <a href="${data.ctaUrl || '#'}" 
                   style="display: inline-block; background: #f0531c; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px;">
                  ${data.ctaText}
                </a>
              ` : ''}
            </div>
            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                Restaurant Hub Solution<br>
                <a href="%unsubscribe_url%" style="color: #6b7280;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
};

/**
 * Send an email using the configured email provider
 * Currently supports Resend - can be extended for SendGrid, etc.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured - email not sent");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    // Dynamically import Resend to avoid issues if not installed
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    // Generate HTML from template if specified
    let html = options.html;
    let subject = options.subject;
    
    if (options.template && emailTemplates[options.template]) {
      const template = emailTemplates[options.template];
      html = template.generateHtml(options.templateData || {});
      subject = options.subject || template.subject;
      
      // Replace template variables in subject
      if (options.templateData) {
        Object.entries(options.templateData).forEach(([key, value]) => {
          subject = subject.replace(`{{${key}}}`, String(value));
        });
      }
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Restaurant Hub Solution <noreply@restauranthubsolution.com>",
      to: recipients.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email)),
      subject,
      html: html || options.text || "",
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags?.map((tag) => ({ name: tag, value: "true" })),
    });

    if (error) {
      console.error("Email send error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("Email send exception:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  email: string,
  firstName?: string,
  dashboardUrl?: string
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: firstName },
    subject: "Welcome to Restaurant Hub Solution! 🎉",
    template: "welcome",
    templateData: {
      firstName,
      dashboardUrl,
    },
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderData: {
    customerName: string;
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: string;
    orderUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: orderData.customerName },
    subject: `Order Confirmed - #${orderData.orderNumber}`,
    template: "order_confirmation",
    templateData: orderData,
  });
}

/**
 * Send abandoned cart reminder
 */
export async function sendAbandonedCartEmail(
  email: string,
  cartData: {
    customerName?: string;
    cartTotal: string;
    cartUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: cartData.customerName },
    subject: "You left something behind! 🛒",
    template: "abandoned_cart",
    templateData: cartData,
  });
}

/**
 * Send subscription renewal reminder
 */
export async function sendRenewalReminderEmail(
  email: string,
  subscriptionData: {
    customerName: string;
    planName: string;
    renewalDate: string;
    amount: string;
    manageUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: subscriptionData.customerName },
    subject: "Your subscription renews in 7 days",
    template: "subscription_renewal",
    templateData: subscriptionData,
  });
}

/**
 * Send re-engagement email for inactive users
 */
export async function sendReengagementEmail(
  email: string,
  userData: {
    firstName?: string;
    shopUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: userData.firstName },
    subject: "We miss you! Come back for 15% off 💚",
    template: "reengagement",
    templateData: userData,
  });
}

/**
 * Send bulk promotional campaign
 */
export async function sendBulkCampaign(
  recipients: EmailRecipient[],
  campaignData: {
    subject: string;
    headline: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    headerImage?: string;
  }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // Send in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (recipient) => {
      const result = await sendEmail({
        to: recipient,
        subject: campaignData.subject,
        template: "promotional",
        templateData: {
          ...campaignData,
          firstName: recipient.name,
        },
      });
      
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        if (result.error) {
          results.errors.push(`${recipient.email}: ${result.error}`);
        }
      }
    });

    await Promise.all(promises);
    
    // Small delay between batches
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
