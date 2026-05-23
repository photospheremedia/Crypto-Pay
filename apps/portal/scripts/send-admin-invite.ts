/**
 * Send Admin Invite Script
 * 
 * Usage: npx tsx scripts/send-admin-invite.ts
 * 
 * This script:
 * 1. Creates a user in Supabase Auth with a temporary password
 * 2. Sends an admin invitation email with login credentials via Resend
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Clean env values (remove trailing \n if present from Vercel CLI)
const cleanEnvValue = (value: string | undefined): string | undefined => {
  return value?.replace(/\\n$/, '').replace(/\n$/, '');
};

const RESEND_API_KEY = cleanEnvValue(process.env.RESEND_API_KEY);
const SUPABASE_URL = cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);
const APP_URL = 'https://restauranthubsolution.com';

interface InviteParams {
  email: string;
  fullName: string;
  role: 'rhs_admin' | 'admin' | 'owner' | 'staff';
  inviterName: string;
  temporaryPassword?: string;
}

async function sendAdminInvite(params: InviteParams) {
  const { email, fullName, role, inviterName, temporaryPassword } = params;

  // Validate required environment variables
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured');
    process.exit(1);
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
    console.error('   Required for creating user accounts');
    process.exit(1);
  }

  // Initialize Supabase Admin client (requires service_role key)
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const resend = new Resend(RESEND_API_KEY);

  const roleDisplayName = {
    rhs_admin: 'Super Administrator',
    admin: 'Administrator',
    owner: 'Business Owner',
    staff: 'Staff Member',
  }[role];

  const roleBadgeColor = role === 'rhs_admin' ? '#7c3aed' : '#f0531c';
  const loginUrl = `${APP_URL}/login`;

  // Generate temporary password if not provided
  const password = temporaryPassword || generateTemporaryPassword();

  console.log(`\n🔐 Creating user account in Supabase...`);
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${fullName}`);
  console.log(`   Role: ${roleDisplayName}`);

  // Step 1: Create user in Supabase Auth with the temporary password
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email so they can login immediately
    user_metadata: {
      full_name: fullName,
      role,
    },
  });

  if (userError) {
    // Check if user already exists
    if (userError.message.includes('already been registered') || userError.message.includes('already exists')) {
      console.log(`\n⚠️  User already exists. Updating password...`);
      
      // Get existing user by email
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === email);
      
      if (existingUser) {
        // Update the existing user's password
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
          password,
          user_metadata: {
            full_name: fullName,
            role,
          },
        });

        if (updateError) {
          console.error('❌ Failed to update user password:', updateError);
          process.exit(1);
        }
        console.log(`✅ User password updated successfully!`);
      }
    } else {
      console.error('❌ Failed to create user:', userError);
      process.exit(1);
    }
  } else {
    console.log(`✅ User created successfully!`);
    console.log(`   User ID: ${userData.user?.id}`);
  }

  // Step 2: Send the invitation email with credentials
  const html = generateAdminInviteEmail({
    recipientName: fullName,
    recipientEmail: email,
    inviterName,
    role,
    roleBadgeColor,
    loginUrl,
    temporaryPassword: password,
  });

  console.log(`\n📧 Sending invite email...`);
  console.log(`   To: ${fullName} <${email}>`);
  console.log(`   Login URL: ${loginUrl}`);
  console.log(`   Temporary Password: ${password}`);

  const { data, error } = await resend.emails.send({
    from: 'Restaurant Hub <noreply@restauranthubsolution.com>',
    to: [`${fullName} <${email}>`],
    subject: `🎉 You've been invited to Restaurant Hub Solution`,
    html,
    tags: [
      { name: 'type', value: 'admin-invite' },
      { name: 'role', value: role },
    ],
  });

  if (error) {
    console.error('❌ Failed to send email:', error);
    process.exit(1);
  }

  console.log(`\n✅ Email sent successfully!`);
  console.log(`   Message ID: ${data?.id}`);
}

/**
 * Generates a secure temporary password
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

function generateAdminInviteEmail(data: {
  recipientName: string;
  recipientEmail: string;
  inviterName: string;
  role: string;
  roleBadgeColor: string;
  loginUrl: string;
  temporaryPassword?: string;
  companyName?: string;
}): string {
  const {
    recipientName,
    recipientEmail,
    inviterName,
    role,
    roleBadgeColor,
    loginUrl,
    temporaryPassword,
    companyName = 'Restaurant Hub Solution',
  } = data;

  const roleDisplayName = {
    rhs_admin: 'Super Administrator',
    admin: 'Administrator',
    owner: 'Business Owner',
    staff: 'Staff Member',
  }[role] || role;

  const roleIcon = role === 'rhs_admin' ? '👑' : role === 'admin' ? '⭐' : '👤';

  // Build credential rows
  let credentialRows = `
    <tr>
      <td style="padding: 8px 0; color: #64748b; font-size: 14px; width: 120px;">Email:</td>
      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${recipientEmail}</td>
    </tr>`;
  
  if (temporaryPassword) {
    credentialRows += `
    <tr>
      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Password:</td>
      <td style="padding: 8px 0; color: #1e293b; font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace; letter-spacing: 1px;">${temporaryPassword}</td>
    </tr>`;
  }

  credentialRows += `
    <tr>
      <td style="padding: 8px 0; color: #64748b; font-size: 14px;">Login URL:</td>
      <td style="padding: 8px 0;"><a href="${loginUrl}" style="color: #f0531c; font-size: 14px; font-weight: 600; text-decoration: none;">${loginUrl}</a></td>
    </tr>`;

  const passwordSection = temporaryPassword ? `
              <!-- Password Warning -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="color: #92400e; font-size: 14px; margin: 0;">
                      ⚠️ <strong>Important:</strong> Please change your password after your first login for security.
                    </p>
                  </td>
                </tr>
              </table>` : `
              <!-- OAuth Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px;">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="color: #166534; font-size: 14px; margin: 0;">
                      💡 <strong>Tip:</strong> You can also sign in with your Google account using ${recipientEmail}
                    </p>
                  </td>
                </tr>
              </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Admin Invitation - ${companyName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #f0531c 0%, #d94a18 50%, #c24215 100%); padding: 40px 40px 50px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.95); border-radius: 16px; padding: 16px 20px;">
                    <svg viewBox="137 137 116 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f0531c" d="M 169.429688 137.277344 C 178.28125 137.277344 186.292969 140.894531 192.0625 146.726562 L 175.238281 163.550781 C 169.332031 159.5625 159.777344 160.882812 154.3125 175.253906 C 154.019531 176.027344 153.726562 176.804688 153.433594 177.578125 C 152.160156 180.917969 152.839844 184.355469 155.242188 186.757812 C 157.644531 189.160156 161.082031 189.839844 164.421875 188.570312 L 166.746094 187.6875 C 181.121094 182.226562 182.4375 172.667969 178.449219 166.765625 L 195.027344 150.1875 C 200.683594 144.527344 204.332031 140.753906 212.246094 138.496094 C 215.023438 137.703125 217.960938 137.277344 220.996094 137.277344 C 238.578125 137.277344 252.832031 151.53125 252.832031 169.117188 C 252.832031 186.699219 238.578125 200.953125 220.996094 200.953125 C 212.265625 200.953125 204.363281 197.441406 198.609375 191.753906 L 214.21875 176.144531 C 215.546875 176.925781 217.054688 177.261719 218.691406 177.140625 C 221.039062 176.960938 222.984375 175.882812 224.382812 173.988281 L 238.15625 155.273438 L 237.40625 154.519531 L 223.230469 168.695312 C 222.996094 168.929688 222.605469 168.929688 222.367188 168.695312 C 222.132812 168.457031 222.132812 168.066406 222.367188 167.832031 L 236.542969 153.65625 L 235.449219 152.566406 L 221.277344 166.738281 C 221.039062 166.976562 220.652344 166.976562 220.414062 166.738281 C 220.175781 166.503906 220.175781 166.113281 220.414062 165.875 L 234.585938 151.703125 L 233.496094 150.609375 L 219.320312 164.785156 C 219.085938 165.019531 218.695312 165.019531 218.457031 164.785156 C 218.222656 164.546875 218.222656 164.160156 218.457031 163.921875 L 232.632812 149.75 L 231.921875 149.039062 C 231.648438 149.191406 231.382812 149.363281 231.121094 149.554688 L 213.164062 162.773438 C 211.269531 164.167969 210.191406 166.117188 210.011719 168.460938 C 209.890625 170.097656 210.226562 171.605469 211.007812 172.933594 L 195.613281 188.332031 C 190.6875 192.882812 187.113281 196.425781 180.878906 198.832031 C 177.324219 200.203125 173.464844 200.953125 169.429688 200.953125 C 151.847656 200.953125 137.589844 186.699219 137.589844 169.117188 C 137.589844 151.53125 151.847656 137.277344 169.429688 137.277344 Z"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 24px 0 8px; line-height: 1.2;">
                ${companyName}
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">
                Powering restaurant success
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 48px 40px;">
              
              <h2 style="color: #111827; font-size: 24px; font-weight: 600; margin: 0 0 16px; line-height: 1.3;">
                Welcome aboard, ${recipientName}! 🎉
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
                <strong>${inviterName}</strong> has invited you to join the ${companyName} team. 
                You've been granted access as a team member with special privileges.
              </p>

              <!-- Role Badge -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px;">
                <tr>
                  <td style="background: ${roleBadgeColor}15; border: 2px solid ${roleBadgeColor}30; border-radius: 12px; padding: 20px 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 16px; vertical-align: middle;">
                          <span style="font-size: 32px;">${roleIcon}</span>
                        </td>
                        <td>
                          <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px; font-weight: 600;">
                            YOUR ROLE
                          </p>
                          <p style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">
                            ${roleDisplayName}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Login Credentials Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #475569; font-size: 15px; font-weight: 600; margin: 0 0 16px;">
                      📋 Your Login Credentials
                    </p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      ${credentialRows}
                    </table>
                  </td>
                </tr>
              </table>

              ${passwordSection}

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="border-radius: 12px; background: linear-gradient(135deg, #f0531c 0%, #c24215 100%); box-shadow: 0 4px 14px rgba(240, 83, 28, 0.4);">
                          <a href="${loginUrl}" 
                             target="_blank"
                             style="display: inline-block; padding: 18px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                            🚀 Sign In Now
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Clickable Link Backup -->
              <p style="text-align: center; color: #9ca3af; font-size: 13px; margin: 16px 0 0;">
                Or copy and paste this link: <a href="${loginUrl}" style="color: #f0531c;">${loginUrl}</a>
              </p>

              <!-- What You Can Do -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0 0;">
                <tr>
                  <td>
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 16px;">
                      What you can do as ${roleDisplayName}:
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr><td style="padding: 8px 0; color: #4b5563; font-size: 14px;"><span style="color: #f0531c; margin-right: 8px;">✓</span> Full system administration</td></tr>
                      <tr><td style="padding: 8px 0; color: #4b5563; font-size: 14px;"><span style="color: #f0531c; margin-right: 8px;">✓</span> Manage all tenants and users</td></tr>
                      <tr><td style="padding: 8px 0; color: #4b5563; font-size: 14px;"><span style="color: #f0531c; margin-right: 8px;">✓</span> Access audit logs and analytics</td></tr>
                      <tr><td style="padding: 8px 0; color: #4b5563; font-size: 14px;"><span style="color: #f0531c; margin-right: 8px;">✓</span> Configure system settings</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
                Questions? Just reply to this email or contact us.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                ${companyName} • Powering restaurant success<br>
                This invitation was sent to ${recipientEmail}
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ============================================
// CONFIGURATION - Edit this to send invites
// ============================================
const INVITE_CONFIG: InviteParams = {
  email: 'prolivdirect@gmail.com',
  fullName: 'Anass Hassouni',
  role: 'rhs_admin',
  inviterName: 'Wael Ghandour',
  temporaryPassword: 'Welcome2RHS!24',
};

sendAdminInvite(INVITE_CONFIG).catch(console.error);
