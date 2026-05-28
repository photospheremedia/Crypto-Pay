/**
 * Email Trigger Functions - Crypto Pay
 * Convenient helper functions for sending specific email types
 * 
 * Usage:
 * import { sendWelcomeEmail, sendOrderConfirmation } from '@/lib/email';
 */

import { sendEmail, type EmailResult, type EmailRecipient } from './sender';
import { EMAIL_ROUTES, MERCHANT_SUPPORT_REPLY } from './routing';
import { getEmailMessages, formatEmailString } from './messages';
import { EMAIL_WORKFLOW_EVENTS, workflowIdempotencyKey } from './workflow-keys';

// ============================================
// ONBOARDING & AUTHENTICATION
// ============================================

export async function sendWelcomeEmail(
  email: string,
  data: {
    firstName?: string;
    businessName?: string;
    dashboardUrl?: string;
    locale?: string;
  }
): Promise<EmailResult> {
  const locale = data.locale ?? "en";
  const welcome = getEmailMessages(locale).welcome;
  return sendEmail({
    to: { email, name: data.firstName },
    replyTo: MERCHANT_SUPPORT_REPLY,
    subject: welcome.subject,
    template: "welcome",
    templateData: {
      ...data,
      locale,
      dashboardUrl: data.dashboardUrl ?? EMAIL_ROUTES.accountWallets(),
    },
    tags: ["onboarding", "welcome"],
    idempotencyKey: workflowIdempotencyKey(EMAIL_WORKFLOW_EVENTS.userWelcome, email, email),
    workflow: { event: EMAIL_WORKFLOW_EVENTS.userWelcome, entityId: email },
  });
}

export async function sendEmailVerification(
  email: string,
  data: {
    firstName?: string;
    verificationUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.firstName },
    subject: "Verify Your Email - Crypto Pay",
    template: "email_verification",
    templateData: data,
    tags: ["auth", "verification"],
    workflow: { event: "auth.email_verification", entityId: email },
  });
}

export async function sendPasswordResetEmail(
  email: string,
  data: {
    resetUrl: string;
    requestTime?: string;
    ipAddress?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email },
    subject: "Reset Your Password - Crypto Pay",
    template: "password_reset",
    templateData: {
      ...data,
      requestTime: data.requestTime || new Date().toLocaleString(),
    },
    tags: ["auth", "password-reset"],
    workflow: { event: "auth.password_reset", entityId: email },
  });
}

// ============================================
// ORDER LIFECYCLE
// ============================================

export async function sendOrderConfirmation(
  email: string,
  data: {
    customerName: string;
    orderNumber: string;
    orderDate?: string;
    items: Array<{ name: string; quantity: number; price: number; image?: string }>;
    shipping?: number;
    tax?: number;
    shippingAddress?: string;
    estimatedDelivery?: string;
    trackingUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: `Order Confirmed #${data.orderNumber} - Crypto Pay`,
    template: "order_confirmation",
    templateData: {
      ...data,
      orderDate: data.orderDate || new Date().toLocaleDateString(),
    },
    tags: ["transactional", "order", "confirmation"],
    workflow: { event: "order.confirmation", entityId: data.orderNumber },
  });
}

export async function sendOrderShipped(
  email: string,
  data: {
    customerName: string;
    orderNumber: string;
    carrier?: string;
    trackingNumber?: string;
    trackingUrl: string;
    estimatedDelivery?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: `Your Order Has Shipped! #${data.orderNumber}`,
    template: "order_shipped",
    templateData: data,
    tags: ["transactional", "order", "shipping"],
    workflow: { event: "order.shipped", entityId: data.orderNumber },
  });
}

export async function sendOrderDelivered(
  email: string,
  data: {
    customerName: string;
    orderNumber: string;
    deliveryDate?: string;
    deliveryLocation?: string;
    reviewUrl?: string;
    reorderUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: `Order Delivered! #${data.orderNumber} ✅`,
    template: "order_delivered",
    templateData: {
      ...data,
      deliveryDate: data.deliveryDate || new Date().toLocaleDateString(),
    },
    tags: ["transactional", "order", "delivery"],
  });
}

// ============================================
// BILLING & PAYMENTS
// ============================================

export async function sendInvoice(
  email: string,
  data: {
    customerName: string;
    businessName?: string;
    billingAddress?: string;
    invoiceNumber: string;
    invoiceDate?: string;
    dueDate: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    tax?: number;
    isPaid?: boolean;
    isPastDue?: boolean;
    paymentUrl?: string;
    paymentTerms?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: `Invoice #${data.invoiceNumber} - Crypto Pay`,
    template: "invoice",
    templateData: {
      ...data,
      invoiceDate: data.invoiceDate || new Date().toLocaleDateString(),
    },
    tags: ["billing", "invoice"],
  });
}

export async function sendPaymentReceived(
  email: string,
  data: {
    customerName: string;
    amount: string;
    invoiceNumber: string;
    paymentMethod?: string;
    transactionId: string;
    paymentDate?: string;
    receiptUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "Payment Received - Thank You! 💚",
    template: "payment_received",
    templateData: {
      ...data,
      paymentDate: data.paymentDate || new Date().toLocaleDateString(),
    },
    tags: ["billing", "payment", "receipt"],
  });
}

export async function sendPaymentFailed(
  email: string,
  data: {
    customerName: string;
    amount: string;
    invoiceNumber: string;
    errorMessage?: string;
    updatePaymentUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "⚠️ Payment Failed - Action Required",
    template: "payment_failed",
    templateData: data,
    tags: ["billing", "payment", "failed"],
  });
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function sendSubscriptionWelcome(
  email: string,
  data: {
    customerName: string;
    planName: string;
    price: string;
    billingCycle?: string;
    nextBillingDate: string;
    features?: string[];
    dashboardUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: `Welcome to ${data.planName}! 🎉`,
    template: "subscription_welcome",
    templateData: data,
    tags: ["subscription", "welcome"],
  });
}

export async function sendSubscriptionRenewalReminder(
  email: string,
  data: {
    customerName: string;
    planName: string;
    amount: string;
    renewalDate: string;
    daysUntil: number;
    paymentMethod?: string;
    manageUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: `Your Subscription Renews in ${data.daysUntil} Days`,
    template: "subscription_renewal",
    templateData: data,
    tags: ["subscription", "renewal", "reminder"],
  });
}

export async function sendSubscriptionExpired(
  email: string,
  data: {
    customerName: string;
    planName: string;
    expirationDate: string;
    lostFeatures?: string[];
    reactivateUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "Your Subscription Has Expired",
    template: "subscription_expired",
    templateData: data,
    tags: ["subscription", "expired"],
  });
}

// ============================================
// MARKETING & ENGAGEMENT
// ============================================

export async function sendAbandonedCartEmail(
  email: string,
  data: {
    customerName?: string;
    items: Array<{ name: string; quantity: number; price: number; image?: string }>;
    cartUrl: string;
    discountCode?: string;
    discountAmount?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "You left something in your cart 🛒",
    template: "abandoned_cart",
    templateData: data,
    tags: ["marketing", "cart-recovery"],
  });
}

export async function sendReengagementEmail(
  email: string,
  data: {
    firstName?: string;
    shopUrl: string;
    discountAmount?: string;
    discountCode?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.firstName },
    subject: `We Miss You! Here's ${data.discountAmount || '15% Off'} 💚`,
    template: "reengagement",
    templateData: data,
    tags: ["marketing", "reengagement"],
  });
}

export async function sendPromotionalEmail(
  recipients: EmailRecipient[],
  data: {
    subject: string;
    headline: string;
    content: string;
    ctaText?: string;
    ctaUrl?: string;
    headerImage?: string;
    preheader?: string;
    expirationDate?: string;
  }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  // Send in batches
  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (recipient) => {
      const result = await sendEmail({
        to: recipient,
        subject: data.subject,
        template: "promotional",
        templateData: {
          ...data,
          firstName: recipient.name,
        },
        tags: ["marketing", "promotional"],
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
    
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export async function sendNewsletter(
  recipients: EmailRecipient[],
  data: {
    subject: string;
    headline: string;
    content: string;
    articles?: Array<{ title: string; excerpt: string; url: string; image?: string }>;
    preheader?: string;
  }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (recipient) => {
      const result = await sendEmail({
        to: recipient,
        subject: data.subject,
        template: "newsletter",
        templateData: {
          ...data,
          firstName: recipient.name,
        },
        tags: ["marketing", "newsletter"],
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
    
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}

// ============================================
// B2B SPECIFIC
// ============================================

export async function sendAccountApproved(
  email: string,
  data: {
    customerName: string;
    businessName: string;
    paymentTerms?: string;
    creditLimit?: string;
    shopUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "Your B2B Account Has Been Approved! ✅",
    template: "account_approved",
    templateData: data,
    tags: ["b2b", "account", "approved"],
  });
}

export async function sendCreditApproved(
  email: string,
  data: {
    customerName: string;
    creditLimit: string;
    paymentTerms: string;
    availableCredit?: string;
    accountUrl?: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "Your Credit Application Has Been Approved!",
    template: "credit_approved",
    templateData: data,
    tags: ["b2b", "credit", "approved"],
  });
}

export async function sendLowStockAlert(
  email: string,
  data: {
    customerName: string;
    items: Array<{ name: string; currentStock: number; reorderPoint: number; sku: string }>;
    reorderUrl: string;
  }
): Promise<EmailResult> {
  return sendEmail({
    to: { email, name: data.customerName },
    subject: "⚠️ Low Stock Alert - Reorder Now",
    template: "low_stock_alert",
    templateData: data,
    tags: ["b2b", "inventory", "alert"],
  });
}
