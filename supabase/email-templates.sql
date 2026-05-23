-- Supabase Auth Email Templates
-- Copy these templates to Supabase Dashboard > Authentication > Email Templates
-- These match the professional Restaurant Hub branding

/*
============================================
CONFIRM SIGNUP EMAIL
============================================
Subject: Confirm Your Restaurant Hub Account

Body (HTML):
*/

-- Template for: Confirm signup
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px;">Welcome to Restaurant Hub!</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                Thanks for signing up! Please confirm your email address to activate your account.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Confirm Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                If you didn't create an account, you can safely ignore this email.
              </p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Restaurant Hub Solution • B2B Restaurant Supply Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/

/*
============================================
RESET PASSWORD EMAIL
============================================
Subject: Reset Your Password - Restaurant Hub

Body (HTML):
*/

-- Template for: Reset password
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background: #fef3c7; border-radius: 50%; margin: 0 auto 16px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🔐</span>
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px;">Reset Your Password</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                We received a request to reset the password for your Restaurant Hub account.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px auto;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; color: #92400e; font-size: 13px;">
                  ⚠️ <strong>Security Notice:</strong> This link expires in 1 hour. If you didn't request this, please ignore this email.
                </p>
              </div>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Restaurant Hub Solution • B2B Restaurant Supply Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/

/*
============================================
MAGIC LINK EMAIL
============================================
Subject: Your Login Link - Restaurant Hub

Body (HTML):
*/

-- Template for: Magic link
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background: #f0fdf4; border-radius: 50%; margin: 0 auto 16px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">✨</span>
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px;">Your Login Link</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                Click the button below to securely sign in to your Restaurant Hub account.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px auto;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Sign In to Restaurant Hub
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                This link expires in 24 hours and can only be used once.
              </p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Restaurant Hub Solution • B2B Restaurant Supply Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/

/*
============================================
INVITE USER EMAIL
============================================
Subject: You've Been Invited to Restaurant Hub

Body (HTML):
*/

-- Template for: Invite user
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 24px;">You're Invited! 🎉</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 32px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6;">
                You've been invited to join Restaurant Hub, the B2B platform for restaurant supplies.
              </p>
              <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin: 24px 0;">
                <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #047857;">What you'll get:</p>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.8;">
                  <li>Access to 10,000+ restaurant supplies</li>
                  <li>Wholesale B2B pricing</li>
                  <li>Net 30 payment terms</li>
                  <li>Free shipping on orders $500+</li>
                </ul>
              </div>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Restaurant Hub Solution • B2B Restaurant Supply Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/

/*
============================================
CHANGE EMAIL ADDRESS
============================================
Subject: Confirm Your New Email Address - Restaurant Hub

Body (HTML):
*/

-- Template for: Change email address
/*
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; text-align: center;">
              <div style="width: 64px; height: 64px; background: #e0f2fe; border-radius: 50%; margin: 0 auto 16px; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">📧</span>
              </div>
              <h1 style="margin: 0; color: #111827; font-size: 24px;">Confirm Your New Email</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 0 32px 40px;">
              <p style="margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                You requested to change your email address. Click below to confirm your new email.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px auto;">
                <tr>
                  <td>
                    <a href="{{ .ConfirmationURL }}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Confirm New Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
                If you didn't request this change, please contact support immediately.
              </p>
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                Restaurant Hub Solution • B2B Restaurant Supply Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
*/
