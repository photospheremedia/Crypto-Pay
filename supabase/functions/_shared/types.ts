/**
 * Shared types for Edge Functions
 */

export interface EdgeFunctionRequest extends Request {
  auth?: {
    user?: {
      id: string;
      email: string;
      [key: string]: unknown;
    };
  };
}

export interface EmailPayload {
  to: string | string[];
  subject: string;
  template?: string;
  templateData?: Record<string, unknown>;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: string[];
}

export interface RateLimitPayload {
  identifier: string;
  limitType: "login" | "signup" | "api" | "anon" | "passwordReset";
}

export interface WebhookPayload {
  type: string;
  [key: string]: unknown;
}

export interface ChatPayload {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  context?: Record<string, unknown>;
  model?: "groq" | "openai";
}

export interface TurnstilePayload {
  token: string;
  remoteIp?: string;
}
