/**
 * Multi-Factor Authentication (MFA) utilities for Supabase
 * Uses Supabase's built-in TOTP (Time-based One-Time Password) support
 */

import { createClient } from '@/lib/supabase/client';
import QRCode from 'qrcode';

export type MFAFactor = {
  id: string;
  type: 'totp';
  friendly_name: string;
  status: 'verified' | 'unverified';
  created_at: string;
};

/**
 * Enroll a new TOTP factor for the authenticated user
 * Returns QR code data URL and secret for manual entry
 */
export async function enrollTOTP(friendlyName: string = 'Authenticator App') {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName,
    });

    if (error) {
      console.error('MFA enroll error:', error);
      return { success: false, error: error.message };
    }

    // Generate QR code from the URI
    const qrCodeDataUrl = await QRCode.toDataURL(data.totp.qr_code);

    return {
      success: true,
      factorId: data.id,
      qrCode: qrCodeDataUrl,
      secret: data.totp.secret,
      uri: data.totp.qr_code,
    };
  } catch (error) {
    console.error('MFA enrollment failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Enrollment failed',
    };
  }
}

/**
 * Verify TOTP code to complete enrollment
 */
export async function verifyTOTPEnrollment(factorId: string, code: string) {
  try {
    const supabase = createClient();

    const challenge = await supabase.auth.mfa.challenge({ factorId });

    if (challenge.error) {
      return { success: false, error: challenge.error.message };
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) {
      return { success: false, error: 'Invalid code. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('TOTP verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify TOTP code during login
 */
export async function verifyTOTPLogin(factorId: string, code: string) {
  try {
    const supabase = createClient();

    const challenge = await supabase.auth.mfa.challenge({ factorId });

    if (challenge.error) {
      return { success: false, error: challenge.error.message };
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) {
      return { success: false, error: 'Invalid code. Please try again.' };
    }

    return { success: true };
  } catch (error) {
    console.error('TOTP login verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Get all MFA factors for the authenticated user
 */
export async function listMFAFactors(): Promise<{
  success: boolean;
  factors?: MFAFactor[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      return { success: false, error: error.message };
    }

    // Supabase returns factors in { totp: [...] } format
    const totpFactors = (data as any)?.totp || [];

    return {
      success: true,
      factors: totpFactors as MFAFactor[],
    };
  } catch (error) {
    console.error('Failed to list MFA factors:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list factors',
    };
  }
}

/**
 * Unenroll (delete) an MFA factor
 */
export async function unenrollMFA(factorId: string) {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('MFA unenroll failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unenroll failed',
    };
  }
}

/**
 * Check if user has any verified MFA factors
 */
export async function hasMFAEnabled(): Promise<boolean> {
  try {
    const result = await listMFAFactors();
    if (!result.success || !result.factors) return false;

    return result.factors.some((factor) => factor.status === 'verified');
  } catch (error) {
    console.error('Failed to check MFA status:', error);
    return false;
  }
}

/**
 * Get the Assurance Level (AAL) of the current session
 * AAL1 = password only, AAL2 = password + MFA
 */
export async function getAssuranceLevel(): Promise<'aal1' | 'aal2' | null> {
  try {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    return (session as any)?.user?.aal || null;
  } catch (error) {
    console.error('Failed to get assurance level:', error);
    return null;
  }
}
