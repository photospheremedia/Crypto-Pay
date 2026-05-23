# Vercel Firewall Configuration Guide

## ✅ Implemented in vercel.json

### WAF Custom Rules (Configured)
The following firewall rules have been added to `vercel.json`:

#### 1. **Bot Challenge Rule**
- **Targets**: Common scraping tools (curl, wget, scrapy, python-requests, go-http-client)
- **Action**: Challenge (JavaScript verification)
- **Purpose**: Block automated scrapers while allowing legitimate browsers

#### 2. **API Protection Rule**
- **Targets**: Requests to `/api/*` without User-Agent header
- **Action**: Deny (Block completely)
- **Purpose**: Prevent unauthorized API access

#### 3. **Security Path Protection**
- **Targets**: Common attack vectors (`/admin`, `/wp-admin`, `/phpMyAdmin`, `.env`, `.git`)
- **Action**: Deny (Block completely)
- **Purpose**: Block common security scanning attempts

### Security Headers (Already Configured)
- ✅ `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- ✅ `X-Frame-Options: DENY` - Prevents clickjacking
- ✅ `X-XSS-Protection: 1; mode=block` - XSS protection
- ✅ `Referrer-Policy: strict-origin-when-cross-origin` - Privacy protection
- ✅ `Permissions-Policy` - Blocks camera, microphone, geolocation

---

## 🚀 Dashboard Configuration (Required)

Vercel Firewall features are primarily managed through the **Vercel Dashboard**. CLI access is limited to viewing logs and deployments.

### Step 1: Access Firewall Dashboard
1. Go to https://vercel.com/dashboard
2. Select project: `crypto-pay`
3. Click **Firewall** tab
4. Click **Configure** button (top right)

### Step 2: Enable Bot Protection (FREE)
**Managed Ruleset - Bot Protection**
1. In Firewall tab → **Bot Management**
2. Enable **Bot Protection Managed Ruleset**
3. Mode: **Challenge** (recommended)
   - Blocks automated non-browser traffic
   - Allows verified bots (Google, Bing, etc.)
   - JavaScript challenge for suspicious clients

**Benefits:**
- ✅ FREE on all plans
- ✅ Automatically updated bot directory
- ✅ Allows verified bots (SEO, webhooks, monitoring)
- ✅ No impact on legitimate users

### Step 3: Enable Attack Challenge Mode (Optional)
**When to use:** During active DDoS attacks

1. In Firewall tab → **Bot Management**
2. Enable **Attack Challenge Mode**
3. All human visitors pass through JavaScript challenge
4. Known bots automatically allowed (Googlebot, etc.)
5. Disable when attack subsides

**Note:** FREE and can run indefinitely without SEO impact

### Step 4: Configure AI Bots (Optional)
**AI Bots Managed Ruleset**
1. In Firewall tab → **Bot Management** → **AI Bots**
2. Choose action:
   - **Log**: Monitor AI bot activity
   - **Deny**: Block AI crawlers (GPTBot, ClaudeBot, etc.)

**Blocks:**
- OpenAI (GPTBot, ChatGPT-User)
- Anthropic (ClaudeBot)
- Google (Google-Extended)
- Meta (Meta-ExternalAgent)
- And 50+ other AI crawlers

---

## 📊 Monitor Traffic

### Live Traffic View
1. Dashboard → Project → **Firewall** tab
2. View real-time traffic (10-minute window)
3. Filter by:
   - IP Address
   - Country
   - User Agent
   - Path
   - Firewall Action

### Analytics
1. Dashboard → Project → **Analytics** tab
2. View:
   - Request volume
   - Top paths
   - Geographic distribution
   - Status codes

### Logs via CLI
```bash
# View recent logs (last 30 minutes)
vercel logs restauranthubsolution.com --since 30m

# View logs with specific query
vercel logs restauranthubsolution.com --since 1h --filter="firewall"

# Real-time logs
vercel logs restauranthubsolution.com --follow
```

---

## 🛡️ Verified Bots (Auto-Allowed)

The following legitimate bots are **automatically allowed** by Vercel Firewall:

### Search Engines
- ✅ Googlebot (Google Search)
- ✅ Bingbot (Microsoft Bing)
- ✅ DuckDuckBot (DuckDuckGo)
- ✅ Yandexbot (Yandex)
- ✅ Baiduspider (Baidu)

### Social Media
- ✅ Twitterbot (Twitter/X previews)
- ✅ FacebookExternalHit (Facebook previews)
- ✅ LinkedInBot (LinkedIn previews)

### Monitoring & Analytics
- ✅ Pingdom
- ✅ UptimeRobot
- ✅ New Relic
- ✅ Datadog
- ✅ Site24x7

### Webhooks
- ✅ Stripe Webhooks
- ✅ GitHub Webhooks
- ✅ PayPal
- ✅ Vercel Build Container

### AI Assistants (User-Initiated)
- ✅ ChatGPT-User (user queries, not training)
- ✅ Claude-User (user queries, not training)
- ✅ Perplexity-User (user queries)

**Full list:** https://vercel.com/docs/bot-management#verified-bots

---

## 🔐 Advanced Custom Rules (Dashboard Only)

Create custom rules for specific scenarios:

### Example 1: Rate Limit API Endpoint
```
IF: Path matches /api/chat
AND: Rate > 60 requests per minute
THEN: Challenge for 5 minutes
```

### Example 2: Geo-Block Specific Countries
```
IF: Country in [CN, RU]
THEN: Challenge
```

### Example 3: Block Specific User Agent
```
IF: User Agent contains "BadBot"
THEN: Deny
```

### Example 4: Whitelist Trusted IPs
```
IF: IP Address in [1.2.3.4, 5.6.7.8]
THEN: Bypass all rules
```

**To create custom rules:**
1. Dashboard → Firewall → Configure
2. Click **+ New Rule**
3. Configure conditions and actions
4. **Save** → **Review Changes** → **Publish**

---

## 📈 Current Deployment Stats

**Latest Deployment:**
- ID: `dpl_GVhCPn36N9zUogFvS7QZfW4RNTLZ`
- Status: ● Ready
- URL: https://restauranthubsolution.com
- Edge Locations: 8 (bom1, fra1, gru1, iad1, lhr1, sfo1, sin1, syd1)
- Middleware: Active (412.61KB)

**Traffic Protection:**
- ✅ Automatic DDoS mitigation (FREE)
- ✅ Security headers configured
- ✅ WAF rules active
- 🟡 Bot Protection: **Configure via Dashboard**
- 🟡 Attack Challenge Mode: **Configure via Dashboard**

---

## 🚨 What to Do During Attack

### Immediate Actions:
1. **Enable Attack Challenge Mode**
   - Dashboard → Firewall → Bot Management → Enable
   - Blocks all non-browser traffic
   - Legitimate users solve JavaScript challenge

2. **Monitor Live Traffic**
   - Dashboard → Firewall → Traffic view
   - Identify attack patterns (IPs, User Agents, Paths)

3. **Create IP Block Rules**
   - Dashboard → Firewall → Configure → IP Blocking
   - Add malicious IP addresses or ranges

4. **Enable Persistent Actions**
   - Dashboard → Firewall → Custom Rules
   - Set "Deny for 1 hour" on suspicious patterns

### After Attack:
1. Disable Attack Challenge Mode
2. Review firewall logs
3. Keep effective custom rules
4. Document attack patterns

---

## 💰 Cost Breakdown

| Feature | Cost | Included |
|---------|------|----------|
| DDoS Mitigation | FREE | All plans |
| WAF Custom Rules | FREE | All plans |
| Bot Protection | FREE | All plans |
| AI Bots Ruleset | FREE | All plans |
| Attack Challenge Mode | FREE | All plans |
| Blocked Traffic | FREE | Doesn't count toward usage |
| Persistent Actions | PAID | Pro/Enterprise only |

**Your Plan:** Hobby/Pro (all firewall features FREE)

---

## 📚 Additional Resources

- **Vercel Firewall Docs**: https://vercel.com/docs/vercel-firewall
- **Bot Management**: https://vercel.com/docs/bot-management
- **Custom Rules**: https://vercel.com/docs/vercel-firewall/vercel-waf/custom-rules
- **Attack Challenge**: https://vercel.com/docs/vercel-firewall/attack-challenge-mode
- **Verified Bots**: https://vercel.com/docs/bot-management#verified-bots

---

## ✅ Next Steps

1. **Deploy this configuration:**
   ```bash
   git add -A
   git commit -m "feat: Add Vercel Firewall WAF rules and bot protection"
   git push origin main
   ```

2. **Configure via Dashboard:**
   - Enable Bot Protection Managed Ruleset (Challenge mode)
   - Review traffic for 24 hours
   - Adjust rules as needed

3. **Monitor:**
   - Check Firewall tab daily for unusual patterns
   - Review Analytics for traffic trends
   - Set up Firewall Alerts (Dashboard → Firewall → Alerts)

---

**Status:** ✅ WAF rules configured in vercel.json  
**Action Required:** Enable Bot Protection via Dashboard  
**ETA to Full Protection:** 5 minutes (dashboard config)
