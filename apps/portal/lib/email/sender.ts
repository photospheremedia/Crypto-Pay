/**
 * Email Sender - Crypto Pay
 * Handles actual email delivery via Resend
 */

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailOptions {
  to: EmailRecipient | EmailRecipient[];
  /** Optional when using a template that defines subject */
  subject?: string;
  template?: string;
  templateData?: Record<string, unknown>;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
  scheduledAt?: Date;
  from?: string;
  idempotencyKey?: string;
  workflow?: {
    event: string;
    entityId?: string;
    actorId?: string;
  };
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

import { emailTemplates, type EmailTemplate } from './templates';
import { getEmailFrom, getReplyTo } from './config';

function sanitizeToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9._:/-]/g, "-").slice(0, 120);
}

function buildWorkflowIdempotencyKey(
  workflow: EmailOptions["workflow"],
  recipients: EmailRecipient[],
): string | undefined {
  if (!workflow?.event) return undefined;

  const recipientKey = recipients
    .map((recipient) => recipient.email.trim().toLowerCase())
    .sort()
    .join(",");

  const parts = [
    sanitizeToken(workflow.event),
    workflow.entityId ? sanitizeToken(workflow.entityId) : "",
    workflow.actorId ? sanitizeToken(workflow.actorId) : "",
    sanitizeToken(recipientKey),
  ].filter(Boolean);

  const key = parts.join("/");
  return key.slice(0, 256);
}

/**
 * Send email via Resend on Vercel (RESEND_API_KEY) or Supabase Edge Function fallback.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const resendKey = process.env.RESEND_API_KEY;

  try {
    // Generate HTML from template if specified
    let html = options.html;
    let subject = options.subject;
    
    if (options.template && emailTemplates[options.template as EmailTemplate]) {
      const template = emailTemplates[options.template as EmailTemplate];
      html = template.generateHtml(options.templateData || {});
      subject = options.subject || template.subject;
      
      // Replace template variables in subject
      let resolvedSubject = subject ?? template.subject;
      if (options.templateData) {
        Object.entries(options.templateData).forEach(([key, value]) => {
          resolvedSubject = resolvedSubject.replace(`{{${key}}}`, String(value));
        });
      }
      subject = resolvedSubject;
    }

    if (!subject?.trim()) {
      subject = "Crypto Pay";
    }

    const recipients = Array.isArray(options.to) ? options.to : [options.to];
    const toAddresses = recipients.map((r) =>
      r.name ? `${r.name} <${r.email}>` : r.email
    );
    const fromEmail = options.from || getEmailFrom();
    const replyTo = options.replyTo || getReplyTo();
    const htmlBody = html || options.text || "";
    const sanitizeTag = (name: string) =>
      name.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);

    const mergedTags = [
      ...(options.tags || []),
      ...(options.workflow?.event
        ? [`workflow_${sanitizeTag(options.workflow.event)}`]
        : []),
    ]
      .map(sanitizeTag)
      .slice(0, 10);
    const resolvedIdempotencyKey =
      options.idempotencyKey || buildWorkflowIdempotencyKey(options.workflow, recipients);

    // Primary: direct Resend (Vercel env RESEND_API_KEY)
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      const { data, error } = await resend.emails.send(
        {
          from: fromEmail,
          to: toAddresses,
          subject,
          html: htmlBody,
          text: options.text,
          replyTo,
          tags: mergedTags.map((name) => ({ name, value: "true" })),
        },
        resolvedIdempotencyKey ? { idempotencyKey: resolvedIdempotencyKey } : undefined,
      );

      if (error) {
        const msg = error.message ?? String(error);
        if (/idempotency|already sent|duplicate/i.test(msg)) {
          console.info(`Email skipped (idempotent): ${subject}`);
          return { success: true };
        }
        console.error("Resend error:", error);
        return { success: false, error: msg };
      }

      console.log(
        `Email sent (Resend): ${subject} to ${recipients.map((r) => r.email).join(", ")} [${data?.id}]`
      );
      return { success: true, messageId: data?.id };
    }

    // Fallback: Supabase Edge Function
    const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
    if (!functionsUrl) {
      console.warn("RESEND_API_KEY and NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL not set");
      return { success: false, error: "Email service not configured" };
    }

    const response = await fetch(`${functionsUrl}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: toAddresses,
        subject,
        html: htmlBody,
        text: options.text,
        replyTo,
        tags: mergedTags,
        idempotencyKey: resolvedIdempotencyKey,
        workflow: options.workflow,
      }),
    });

    if (!response.ok) {
      console.error(`Email send failed: ${response.status}`);
      return { success: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data.success) {
      console.error("Email send error:", data.error);
      return { success: false, error: data.error };
    }

    console.log(
      `Email sent (edge): ${subject} to ${recipients.map((r) => r.email).join(", ")} [${data.messageId}]`
    );
    return { success: true, messageId: data.messageId };
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
