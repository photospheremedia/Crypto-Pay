/**
 * Admin Invite Email Template
 * Beautiful, branded email for inviting new admins
 */

export interface AdminInviteTemplateData {
  recipientName: string;
  recipientEmail: string;
  inviterName: string;
  role: string;
  roleBadgeColor: string;
  loginUrl: string;
  temporaryPassword?: string;
  companyName?: string;
}

export function generateAdminInviteEmail(data: AdminInviteTemplateData): string {
  const {
    recipientName,
    recipientEmail,
    inviterName,
    role,
    roleBadgeColor = '#10b981',
    loginUrl,
    temporaryPassword,
    companyName = 'Crypto Pay',
  } = data;

  const roleDisplayName = {
    rhs_admin: 'Super Administrator',
    admin: 'Administrator',
    owner: 'Business Owner',
    staff: 'Staff Member',
  }[role] || role;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Admin Invitation - ${companyName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <!-- Main Container -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f7fa;">
    <tr>
      <td style="padding: 40px 20px;">
        
        <!-- Email Card -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden;">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #059669 100%); padding: 40px 40px 50px; text-align: center;">
              <!-- Logo/Icon - RHS Brand -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: rgba(255,255,255,0.95); border-radius: 16px; padding: 16px 20px;">
                    <svg viewBox="137 137 116 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#10b981" d="M 169.429688 137.277344 C 178.28125 137.277344 186.292969 140.894531 192.0625 146.726562 L 175.238281 163.550781 C 169.332031 159.5625 159.777344 160.882812 154.3125 175.253906 C 154.019531 176.027344 153.726562 176.804688 153.433594 177.578125 C 152.160156 180.917969 152.839844 184.355469 155.242188 186.757812 C 157.644531 189.160156 161.082031 189.839844 164.421875 188.570312 L 166.746094 187.6875 C 181.121094 182.226562 182.4375 172.667969 178.449219 166.765625 L 195.027344 150.1875 C 200.683594 144.527344 204.332031 140.753906 212.246094 138.496094 C 215.023438 137.703125 217.960938 137.277344 220.996094 137.277344 C 238.578125 137.277344 252.832031 151.53125 252.832031 169.117188 C 252.832031 186.699219 238.578125 200.953125 220.996094 200.953125 C 212.265625 200.953125 204.363281 197.441406 198.609375 191.753906 L 214.21875 176.144531 C 215.546875 176.925781 217.054688 177.261719 218.691406 177.140625 C 221.039062 176.960938 222.984375 175.882812 224.382812 173.988281 L 238.15625 155.273438 L 237.40625 154.519531 L 223.230469 168.695312 C 222.996094 168.929688 222.605469 168.929688 222.367188 168.695312 C 222.132812 168.457031 222.132812 168.066406 222.367188 167.832031 L 236.542969 153.65625 L 235.449219 152.566406 L 221.277344 166.738281 C 221.039062 166.976562 220.652344 166.976562 220.414062 166.738281 C 220.175781 166.503906 220.175781 166.113281 220.414062 165.875 L 234.585938 151.703125 L 233.496094 150.609375 L 219.320312 164.785156 C 219.085938 165.019531 218.695312 165.019531 218.457031 164.785156 C 218.222656 164.546875 218.222656 164.160156 218.457031 163.921875 L 232.632812 149.75 L 231.921875 149.039062 C 231.648438 149.191406 231.382812 149.363281 231.121094 149.554688 L 213.164062 162.773438 C 211.269531 164.167969 210.191406 166.117188 210.011719 168.460938 C 209.890625 170.097656 210.226562 171.605469 211.007812 172.933594 L 195.613281 188.332031 C 190.6875 192.882812 187.113281 196.425781 180.878906 198.832031 C 177.324219 200.203125 173.464844 200.953125 169.429688 200.953125 C 151.847656 200.953125 137.589844 186.699219 137.589844 169.117188 C 137.589844 151.53125 151.847656 137.277344 169.429688 137.277344 Z"/>
                    </svg>
                  </td>
                </tr>
              </table>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 24px 0 8px; letter-spacing: -0.5px;">
                ${companyName}
              </h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">
                Accept crypto payments globally
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 48px 40px;">
              
              <!-- Greeting -->
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
                  <td style="background: linear-gradient(135deg, ${roleBadgeColor}15, ${roleBadgeColor}25); border: 2px solid ${roleBadgeColor}30; border-radius: 12px; padding: 20px 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 16px;">
                          <div style="width: 48px; height: 48px; background: ${roleBadgeColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px; line-height: 48px; text-align: center; display: block; width: 48px;">
                              ${role === 'rhs_admin' ? '👑' : role === 'admin' ? '⭐' : role === 'owner' ? '🏪' : '👤'}
                            </span>
                          </div>
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

              ${temporaryPassword ? `
              <!-- Temporary Password Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: top;">
                          <span style="font-size: 24px;">🔐</span>
                        </td>
                        <td>
                          <p style="color: #92400e; font-size: 14px; font-weight: 600; margin: 0 0 8px;">
                            Your Temporary Password
                          </p>
                          <p style="color: #78350f; font-size: 20px; font-weight: 700; font-family: 'SF Mono', Monaco, 'Courier New', monospace; margin: 0 0 8px; letter-spacing: 2px; background: #fffbeb; padding: 8px 12px; border-radius: 6px; display: inline-block;">
                            ${temporaryPassword}
                          </p>
                          <p style="color: #92400e; font-size: 13px; margin: 0;">
                            Please change this after your first login for security.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : `
              <!-- OAuth Login Info -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 0 32px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-right: 12px; vertical-align: top;">
                          <span style="font-size: 24px;">🔑</span>
                        </td>
                        <td>
                          <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 4px;">
                            Sign in with your Google account
                          </p>
                          <p style="color: #15803d; font-size: 13px; margin: 0;">
                            Use <strong>${recipientEmail}</strong> to sign in securely
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              `}

              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);">
                    <a href="${loginUrl}" 
                       target="_blank"
                       style="display: inline-block; padding: 18px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                      🚀 Access Your Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <!-- What You Can Do Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0 0;">
                <tr>
                  <td>
                    <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 16px;">
                      What you can do:
                    </h3>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      ${role === 'rhs_admin' ? `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">Full system administration</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">Manage all tenants and users</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">Access audit logs and analytics</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">Configure system settings</span>
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">Manage leads and orders</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">View analytics dashboard</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <span style="color: #10b981; margin-right: 8px;">✓</span>
                          <span style="color: #4b5563;">Access team collaboration tools</span>
                        </td>
                      </tr>
                      `}
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 32px 40px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">
                      Questions? Just reply to this email or contact us.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      ${companyName} • Accept crypto payments globally<br>
                      This invitation was sent to ${recipientEmail}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Email Card -->

      </td>
    </tr>
  </table>
  <!-- End Main Container -->

</body>
</html>
  `.trim();
}

export default generateAdminInviteEmail;
