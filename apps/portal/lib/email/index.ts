/**
 * Crypto Pay — email service (Resend via Edge Function)
 * Enterprise-grade transactional and marketing email system
 * 
 * Features:
 * - Resend as primary provider (scalable, reliable)
 * - Professional B2B templates with brand consistency
 * - Mobile-responsive designs
 * - Tracking and analytics support
 * - Template versioning
 */

export { sendEmail, type EmailOptions, type EmailResult, type EmailRecipient } from './sender';
export { emailTemplates, type EmailTemplate } from './templates';
export * from './triggers';
