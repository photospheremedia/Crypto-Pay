# Email System Setup Guide

> **Crypto Pay:** use [`EMAIL_SETUP_CRYPTO_PAY.md`](./EMAIL_SETUP_CRYPTO_PAY.md) — this file documents the original Restaurant Hub setup.

## Current Status ✅

### Resend Configuration
- **API Key**: Configured in Vercel (all environments)
- **SMTP**: Configured in Supabase (`smtp.resend.com:465`)
- **Sender**: `noreply@restauranthub.com`

### Email Templates
All Supabase auth emails use professional B2B templates:
- Signup confirmation
- Password reset
- Magic link login
- User invitation
- Email change confirmation

## Domain Verification (Required for Professional Sending)

### 🔴 Action Required
To send from `@restauranthub.com`, you need to verify the domain in Resend.

### Steps to Verify Domain

1. **Log into Resend Dashboard**
   - Go to: https://resend.com/domains
   - Click "Add Domain"

2. **Add `restauranthub.com`**
   - Enter domain: `restauranthub.com`
   - Choose region: `us-east-1` (or your preferred region)

3. **Add DNS Records**
   Resend will provide DNS records to add to your domain. You'll need to add:
   
   **SPF Record** (TXT)
   ```
   Name: @ or restauranthub.com
   Value: v=spf1 include:_spf.resend.com ~all
   ```
   
   **DKIM Records** (CNAME)
   ```
   Name: resend._domainkey
   Value: [provided by Resend]
   
   Name: resend2._domainkey  
   Value: [provided by Resend]
   ```
   
   **DMARC Record** (TXT) - Recommended
   ```
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@restauranthub.com
   ```

4. **Verify in Resend**
   - Click "Verify Domain"
   - Wait for DNS propagation (can take 24-48 hours)
   - Resend will email you when verified

### Where to Add DNS Records

The DNS records need to be added where your domain is registered:
- **GoDaddy**: Domains → DNS Management
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Cloudflare**: DNS → Add Record
- **Other**: Check your domain registrar's DNS settings

## ImprovMX Integration (Optional)

**ImprovMX** is for *receiving* emails (forwarding), not sending.

### Use Case
- Forward `support@restauranthub.com` → `your-email@gmail.com`
- Forward `orders@restauranthub.com` → `orders@gmail.com`

### ImprovMX Setup
1. Go to: https://improvmx.com
2. Add domain: `restauranthub.com`
3. Add MX records to DNS:
   ```
   Priority: 10
   Host: @
   Value: mx1.improvmx.com
   
   Priority: 20
   Host: @
   Value: mx2.improvmx.com
   ```
4. Create aliases for receiving

### ⚠️ Important
- **ImprovMX**: For *receiving* emails (forwards to your personal email)
- **Resend**: For *sending* emails (via SMTP/API)
- Both can work together on the same domain

## Testing Email Sending

### Test Locally (Development)
Local Supabase uses Inbucket for email testing:
- URL: http://localhost:54324
- All emails sent in dev are captured here
- No real emails sent

### Test Production (After Domain Verification)
1. Sign up with a test account on staging/production
2. Check email delivery
3. Verify email design renders correctly
4. Test all auth flows:
   - Signup confirmation
   - Password reset
   - Magic link login

## Current Email Templates

### Template Files
Located in: `supabase/templates/`
- `confirm.html` - Signup confirmation
- `recovery.html` - Password reset
- `magic_link.html` - Magic link login
- `invite.html` - User invitation
- `email_change.html` - Email change confirmation

### Updating Templates
Run the update script after modifying template files:
```bash
python3 scripts/update_supabase_templates.py
```

This pushes templates to Supabase via Management API.

### Custom Application Emails
For non-auth emails (orders, invoices, etc.), use the Resend integration:

```typescript
import { sendEmail } from '@/lib/email/sender';
import { emailTemplates } from '@/lib/email/templates';

// Send order confirmation
await sendEmail({
  to: 'customer@example.com',
  subject: 'Order Confirmed',
  html: emailTemplates.orderConfirmation({
    orderNumber: '12345',
    items: [...],
    total: '$299.99'
  })
});
```

## Troubleshooting

### "Domain not verified" Error
- Check DNS records are added correctly
- Wait 24-48 hours for DNS propagation
- Use `nslookup` to verify records:
  ```bash
  nslookup -type=TXT restauranthub.com
  nslookup -type=MX restauranthub.com
  ```

### Emails Going to Spam
1. Ensure SPF, DKIM, DMARC records are configured
2. Start with low volume (don't blast 1000s immediately)
3. Use professional content (no spammy words)
4. Include unsubscribe link for marketing emails
5. Consider warming up the domain (gradually increase volume)

### Rate Limits
Current Supabase auth email rate limit: **2 emails/hour per IP**

To increase, update [supabase/config.toml](supabase/config.toml):
```toml
[auth.rate_limit]
email_sent = 10  # Increase from 2
```

Then push config:
```bash
supabase config push --project-ref xfairwgarmpvbogiuduk
```

## Next Steps

### Immediate
1. ✅ Supabase SMTP configured
2. ✅ Email templates deployed
3. ⏳ Verify domain in Resend (action required)

### Future Enhancements
- [ ] Set up email analytics/tracking
- [ ] Add unsubscribe management
- [ ] Implement email preferences center
- [ ] Set up transactional email monitoring
- [ ] Configure email webhooks (bounces, complaints)

## Resources

- [Resend Documentation](https://resend.com/docs)
- [Supabase Auth Emails](https://supabase.com/docs/guides/auth/auth-smtp)
- [ImprovMX Setup](https://improvmx.com/guides/)
- [SPF Record Checker](https://mxtoolbox.com/spf.aspx)
- [DKIM Record Checker](https://mxtoolbox.com/dkim.aspx)
