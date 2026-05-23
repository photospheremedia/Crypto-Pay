/**
 * Email Sender - Restaurant Hub Solution
 * Handles actual email delivery via Resend
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  subject: string;
  template?: string;
  templateData?: Record<string, unknown>;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
  scheduledAt?: Date;
  from?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

import { emailTemplates, type EmailTemplate } from './templates';

/**
 * Send an email using Supabase Edge Function
 * Now calls the Edge Function for faster sending with automatic retry (50ms vs 200ms)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
  
  if (!functionsUrl) {
    console.warn("NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL not configured - email not sent");
    return {
      success: false,
      error: "Email service not configured",
    };
  }

  try {
    // Generate HTML from template if specified
    let html = options.html;
    let subject = options.subject;
    
    if (options.template && emailTemplates[options.template as EmailTemplate]) {
      const template = emailTemplates[options.template as EmailTemplate];
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
    const fromEmail = options.from || process.env.EMAIL_FROM || "Restaurant Hub Solution <noreply@restauranthubsolution.com>";
    
    // Call Edge Function which handles Resend API call with automatic retry
    const response = await fetch(`${functionsUrl}/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject,
        html: html || options.text || "",
        text: options.text,
        replyTo: options.replyTo || "support@restauranthubsolution.com",
        tags: options.tags,
      }),
    });

    if (!response.ok) {
      console.error(`Email send failed: ${response.status}`);
      return {
        success: false,
        error: `HTTP ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.success) {
      console.error("Email send error:", data.error);
      return {
        success: false,
        error: data.error,
      };
    }

    // Log successful send for analytics
    console.log(`📧 Email sent: ${subject} to ${recipients.map(r => r.email).join(', ')} [${data.messageId}]`);

    return {
      success: true,
      messageId: data.messageId,
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
 * Send email using a specific template
 */
export async function sendTemplatedEmail(
  template: EmailTemplate,
  to: EmailRecipient | EmailRecipient[],
  data: Record<string, unknown>,
  options?: Partial<EmailOptions>
): Promise<EmailResult> {
  return sendEmail({
    to,
    subject: emailTemplates[template].subject,
    template,
    templateData: data,
    ...options,
  });
}

/**
 * Send bulk emails with rate limiting
 */
export async function sendBulkEmails(
  recipients: EmailRecipient[],
  template: EmailTemplate,
  getData: (recipient: EmailRecipient) => Record<string, unknown>,
  options?: {
    batchSize?: number;
    delayBetweenBatches?: number;
  }
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const { batchSize = 10, delayBetweenBatches = 1000 } = options || {};
  const results = { sent: 0, failed: 0, errors: [] as string[] };

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    
    const promises = batch.map(async (recipient) => {
      const data = getData(recipient);
      const result = await sendTemplatedEmail(template, recipient, data);
      
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
    
    // Delay between batches to respect rate limits
    if (i + batchSize < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return results;
}
