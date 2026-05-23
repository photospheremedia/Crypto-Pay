# Supabase Auth Email Templates Configuration

## Overview
Supabase provides **built-in email templates** for all authentication-related emails. These templates are managed in the Supabase Dashboard and use **SMTP** settings you configure.

**Access:** [Supabase Dashboard](https://supabase.com/dashboard) → Your Project → **Authentication** → **Email Templates**

---

## Authentication Email Templates

### 1. **Confirm Sign Up**
- **Trigger:** User signs up with email/password
- **Purpose:** Verify email address before account activation
- **Variables Available:**
  - `{{ .ConfirmationURL }}` - Email confirmation link
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .TokenHash }}` - Token for manual verification
  - `{{ .Token }}` - Short verification code

**Recommended Template:**
```html
<h2>Welcome to Restaurant Hub!</h2>
<p>Please confirm your email address by clicking the button below:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Confirm Email</a>
<p>Or copy and paste this link into your browser:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
```

---

### 2. **Magic Link**
- **Trigger:** User requests passwordless sign-in
- **Purpose:** One-time login link sent to email
- **Variables Available:**
  - `{{ .ConfirmationURL }}` - Magic link
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .TokenHash }}` - Token for verification

**Recommended Template:**
```html
<h2>Sign in to Restaurant Hub</h2>
<p>Click the button below to sign in:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Sign In</a>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
```

---

### 3. **Invite User**
- **Trigger:** Admin invites a new user
- **Purpose:** Send invitation with account setup link
- **Variables Available:**
  - `{{ .ConfirmationURL }}` - Invitation acceptance link
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .TokenHash }}` - Token for verification

**Recommended Template:**
```html
<h2>You've Been Invited to Restaurant Hub</h2>
<p>An administrator has invited you to join their team.</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This invitation will expire in 7 days.</p>
```

---

### 4. **Reset Password**
- **Trigger:** User requests password reset
- **Purpose:** Send password reset link
- **Variables Available:**
  - `{{ .ConfirmationURL }}` - Password reset link
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .TokenHash }}` - Token for verification
  - `{{ .Token }}` - Short reset code

**Recommended Template:**
```html
<h2>Reset Your Password</h2>
<p>You requested to reset your password. Click the button below:</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 1 hour. If you didn't request this, please ignore this email or contact support.</p>
```

---

### 5. **Change Email Address**
- **Trigger:** User changes their email address
- **Purpose:** Verify new email address
- **Variables Available:**
  - `{{ .ConfirmationURL }}` - Email change confirmation link
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .TokenHash }}` - Token for verification
  - `{{ .NewEmail }}` - New email address
  - `{{ .OldEmail }}` - Previous email address

**Recommended Template:**
```html
<h2>Confirm Email Address Change</h2>
<p>You requested to change your email from <strong>{{ .OldEmail }}</strong> to <strong>{{ .NewEmail }}</strong>.</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Confirm New Email</a>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 24 hours.</p>
```

---

### 6. **Reauthentication**
- **Trigger:** Sensitive action requires re-authentication
- **Purpose:** Confirm user identity before critical action
- **Variables Available:**
  - `{{ .ConfirmationURL }}` - Reauthentication link
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .TokenHash }}` - Token for verification

**Recommended Template:**
```html
<h2>Verify It's You</h2>
<p>A sensitive action requires you to confirm your identity.</p>
<a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">Verify Identity</a>
<p>Or copy and paste this link:</p>
<p>{{ .ConfirmationURL }}</p>
<p>This link will expire in 15 minutes.</p>
```

---

## Security Email Templates (NEW)

### 7. **Password Changed**
- **Trigger:** User's password is successfully changed
- **Purpose:** Notify user of password change for security
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL

**Recommended Template:**
```html
<h2>Password Changed Successfully</h2>
<p>Your password was recently changed. If you made this change, no further action is needed.</p>
<p><strong>If you didn't change your password</strong>, please reset it immediately and contact support.</p>
<a href="{{ .SiteURL }}/reset-password" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
```

---

### 8. **Email Address Changed**
- **Trigger:** User's email address is successfully changed
- **Purpose:** Notify user of email change
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .NewEmail }}` - New email address

**Recommended Template:**
```html
<h2>Email Address Changed</h2>
<p>Your account email has been changed to <strong>{{ .NewEmail }}</strong>.</p>
<p>If you didn't make this change, please contact support immediately.</p>
<a href="{{ .SiteURL }}/support" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Contact Support</a>
```

---

### 9. **Phone Number Changed**
- **Trigger:** User's phone number is changed
- **Purpose:** Notify user of phone number change
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL

**Recommended Template:**
```html
<h2>Phone Number Changed</h2>
<p>Your account phone number has been updated.</p>
<p>If you didn't make this change, please contact support immediately.</p>
<a href="{{ .SiteURL }}/support" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Contact Support</a>
```

---

### 10. **Identity Linked**
- **Trigger:** OAuth provider is linked to account
- **Purpose:** Notify user of new identity link
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .Provider }}` - OAuth provider name (Google, GitHub, etc.)

**Recommended Template:**
```html
<h2>New Sign-In Method Added</h2>
<p>Your {{ .Provider }} account has been linked to your Restaurant Hub account.</p>
<p>You can now sign in using {{ .Provider }}.</p>
<p>If you didn't make this change, please contact support immediately.</p>
<a href="{{ .SiteURL }}/support" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Contact Support</a>
```

---

### 11. **Identity Unlinked**
- **Trigger:** OAuth provider is unlinked from account
- **Purpose:** Notify user of identity removal
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL
  - `{{ .Provider }}` - OAuth provider name

**Recommended Template:**
```html
<h2>Sign-In Method Removed</h2>
<p>Your {{ .Provider }} account has been unlinked from your Restaurant Hub account.</p>
<p>You can no longer sign in using {{ .Provider }}.</p>
<p>If you didn't make this change, please contact support immediately.</p>
<a href="{{ .SiteURL }}/support" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Contact Support</a>
```

---

### 12. **Multi-Factor Authentication Method Added**
- **Trigger:** New MFA method is enabled
- **Purpose:** Notify user of MFA addition
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL

**Recommended Template:**
```html
<h2>Two-Factor Authentication Enabled</h2>
<p>A new two-factor authentication method has been added to your account.</p>
<p>Your account is now more secure.</p>
<p>If you didn't enable this, please contact support immediately.</p>
<a href="{{ .SiteURL }}/support" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Contact Support</a>
```

---

### 13. **Multi-Factor Authentication Method Removed**
- **Trigger:** MFA method is disabled
- **Purpose:** Notify user of MFA removal
- **Variables Available:**
  - `{{ .SiteURL }}` - Your application URL

**Recommended Template:**
```html
<h2>Two-Factor Authentication Disabled</h2>
<p>A two-factor authentication method has been removed from your account.</p>
<p><strong>Warning:</strong> Your account is now less secure.</p>
<p>If you didn't disable this, please contact support immediately.</p>
<a href="{{ .SiteURL }}/support" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">Contact Support</a>
```

---

## SMTP Settings Configuration

### Step 1: Access SMTP Settings
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Auth** → **SMTP Settings**

### Step 2: Configure SMTP (Recommended: Resend)

**Option A: Use Resend (Recommended)**
- **Host:** `smtp.resend.com`
- **Port:** `587` or `465`
- **Username:** `resend`
- **Password:** Your Resend API Key (from `.env.local`: `re_2e7dKPSj...`)
- **Sender Email:** `noreply@restauranthub.com` (or your verified domain)
- **Sender Name:** `Restaurant Hub`

**Option B: Use SendGrid (Legacy)**
- Already configured with API key in `.env.local`
- Consider migrating to Resend for better deliverability

**Option C: Use Gmail (Development Only)**
- **Host:** `smtp.gmail.com`
- **Port:** `587`
- **Username:** Your Gmail address
- **Password:** App-specific password (not your regular password)
- ⚠️ **Warning:** Gmail has strict rate limits (100 emails/day)

### Step 3: Test Email Delivery
1. Go to **Authentication** → **Email Templates**
2. Click **Send Test Email** for any template
3. Verify email arrives in your inbox
4. Check spam folder if not received

---

## Configuration Checklist

- [ ] **SMTP Settings Configured** (Resend recommended)
- [ ] **Sender Email Verified** (check DNS records for domain)
- [ ] **All 13 Email Templates Customized** with Restaurant Hub branding
- [ ] **Test Emails Sent** for each template type
- [ ] **Email Deliverability Tested** (inbox, not spam)
- [ ] **Rate Limits Reviewed** (Resend: 3000/month free tier)
- [ ] **Template Variables Tested** (ensure all `{{ }}` render correctly)
- [ ] **Redirect URLs Configured** in Auth settings (`.env.local`: `NEXT_PUBLIC_APP_URL`)

---

## Next Steps

1. **Configure all 13 templates** in Supabase Dashboard
2. **Enable SMTP** with Resend credentials
3. **Test each template** by triggering auth flows
4. **Monitor email logs** in Supabase Dashboard → Logs → Auth
5. **Move to Resend templates** for marketing emails (next todo)

---

## Troubleshooting

**Emails not sending:**
- Check SMTP credentials in Dashboard
- Verify Resend API key is valid
- Check email logs: Dashboard → Logs → Auth
- Confirm sender domain is verified in Resend

**Emails going to spam:**
- Set up SPF, DKIM, DMARC records in DNS
- Use a custom domain (not @gmail.com)
- Verify sender domain in Resend dashboard
- Check email content for spam triggers

**Template variables not rendering:**
- Use correct syntax: `{{ .Variable }}` (with dot prefix)
- Check Supabase documentation for available variables
- Test with "Send Test Email" in dashboard

---

## Resources

- [Supabase Auth Email Templates Docs](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Resend SMTP Configuration](https://resend.com/docs/send-with-smtp)
- [Email Deliverability Best Practices](https://supabase.com/docs/guides/auth/auth-smtp)
