/**
 * Create Admin User Script (Alternative Approach)
 * 
 * Uses generateLink to create a signup link and then sets the password
 */
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
const RESEND_API_KEY = cleanEnvValue(process.env.RESEND_API_KEY);
const APP_URL = 'https://crypto-pay.vercel.app';

async function createAdminUser() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) {
    console.error('Missing env vars');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const email = 'prolivdirect@gmail.com';
  const password = 'Welcome2RHS!24';
  const fullName = 'Anass Hassouni';
  
  console.log('Attempting to create user via generateLink method...');
  
  // Method 1: Use generateLink with signup type
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'rhs_admin'
      }
    }
  });

  if (linkError) {
    console.error('generateLink error:', linkError);
    
    // Try inviteUserByEmail as fallback
    console.log('\nTrying inviteUserByEmail as fallback...');
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        full_name: fullName,
        role: 'rhs_admin'
      },
      redirectTo: `${APP_URL}/login`
    });

    if (inviteError) {
      console.error('inviteUserByEmail error:', inviteError);
      return;
    }

    console.log('Invite sent! User:', inviteData.user?.id);
    console.log('\nNote: User will need to set their own password via the email link.');
    console.log('They will receive an email from Supabase with a magic link.');
    return;
  }

  console.log('User created successfully!');
  console.log('User ID:', linkData.user?.id);
  console.log('Email confirmed:', linkData.user?.email_confirmed_at ? 'Yes' : 'No');
  
  // Now send our custom email with the password
  const resend = new Resend(RESEND_API_KEY);
  
  console.log('\nSending custom invitation email...');
  
  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'Restaurant Hub <noreply@restauranthubsolution.com>',
    to: [`${fullName} <${email}>`],
    subject: `🎉 Your Restaurant Hub Solution Account is Ready!`,
    html: `
      <h1>Welcome to Restaurant Hub Solution!</h1>
      <p>Hi ${fullName},</p>
      <p>Your Super Administrator account has been created.</p>
      <h2>Login Credentials:</h2>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p><a href="${APP_URL}/login">Click here to sign in</a></p>
      <p>Please change your password after your first login.</p>
      <p>Best regards,<br>The Restaurant Hub Team</p>
    `,
  });

  if (emailError) {
    console.error('Email error:', emailError);
    return;
  }

  console.log('Email sent! Message ID:', emailData?.id);
}

createAdminUser().catch(console.error);
