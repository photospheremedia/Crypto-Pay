# Vercel CLI Guide

This project is configured for optimal deployment with Vercel CLI.

## Quick Commands

### Initial Setup (One-time)
```bash
# Link project to Vercel
pnpm vercel:link

# Pull environment variables from Vercel
pnpm vercel:env
```

### Development & Deployment
```bash
# Deploy to preview (automatic URL)
pnpm vercel:preview

# Deploy to production
pnpm vercel:deploy

# View deployment logs
pnpm vercel:logs

# Inspect latest deployment
pnpm vercel:inspect
```

## Environment Variables Setup

### Required for Production
Add these in Vercel Dashboard → Settings → Environment Variables:

#### Supabase (Required)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xfairwgarmpvbogiuduk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### AI Chat (Optional - FREE tier available)
```bash
# FREE Groq AI (14,400 requests/day)
GROQ_API_KEY=gsk_...

# Paid OpenAI (fallback)
OPENAI_API_KEY=sk_...
```

#### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### Using Vercel CLI for Environment Variables

```bash
# Add production environment variable
vercel env add GROQ_API_KEY production

# Add preview environment variable
vercel env add GROQ_API_KEY preview

# Add development environment variable
vercel env add GROQ_API_KEY development

# Pull all environment variables to .env.local
pnpm vercel:env
```

## Deployment Configuration

### Automatic Deployments
- **Production**: Push to `main` branch → Automatic production deployment
- **Preview**: Push to any branch → Automatic preview deployment
- **Pull Requests**: Automatic preview deployments with unique URLs

### Manual Deployments
```bash
# Preview deployment (branch-based)
pnpm vercel:preview

# Production deployment
pnpm vercel:deploy
```

## Optimization Features

### Enabled in vercel.json:
- ✅ **Edge regions**: Deployed to IAD1 (US East)
- ✅ **Function timeouts**: API routes limited to 30s
- ✅ **Cache headers**: Optimized for static assets (1 year) and API routes (no cache)
- ✅ **Security headers**: X-Content-Type-Options, X-Frame-Options, CSP
- ✅ **Clean URLs**: No trailing slashes, .html extensions removed
- ✅ **GitHub integration**: Auto-aliasing for branches
- ✅ **Redirects**: SEO-friendly permanent redirects

### Analytics & Monitoring
- **Vercel Analytics**: Enabled via `@vercel/analytics`
- **Speed Insights**: Enabled via `@vercel/speed-insights`
- **Health Check**: `/api/health` endpoint for uptime monitoring

## Vercel CLI Tips

### View Logs
```bash
# Real-time logs
vercel logs --follow

# Logs from specific deployment
vercel logs [deployment-url]

# Filter by function
vercel logs --output [function-name]
```

### List Deployments
```bash
# List all deployments
vercel ls

# List deployments for specific project
vercel ls crypto-pay
```

### Inspect Deployment
```bash
# Get deployment details
vercel inspect [deployment-url]

# View environment variables
vercel env ls
```

### Domain Management
```bash
# Add custom domain
vercel domains add yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains rm yourdomain.com
```

## Troubleshooting

### Build Failures
```bash
# Check build logs
vercel logs --output build

# Test build locally
pnpm build:portal
```

### Environment Variable Issues
```bash
# Pull latest env vars
pnpm vercel:env

# Verify env vars are set
vercel env ls
```

### Performance Issues
- Check Analytics dashboard for slow pages
- Review Speed Insights for Core Web Vitals
- Monitor `/api/health` endpoint response times

## CI/CD Integration

### GitHub Actions (Automatic)
Vercel automatically detects commits and deploys:
- Main branch → Production
- Feature branches → Preview URLs
- Pull requests → Preview with comments

### Manual Triggers
Use Vercel CLI in CI/CD:
```bash
# In GitHub Actions or other CI
vercel --token $VERCEL_TOKEN --prod
```

## Production Checklist

Before deploying to production:
- [ ] All environment variables set in Vercel dashboard
- [ ] Groq API key configured (or OpenAI as fallback)
- [ ] Custom domain configured (optional)
- [ ] Security headers verified
- [ ] Analytics enabled and working
- [ ] Health check endpoint responding
- [ ] Preview deployment tested successfully

## Learn More

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables Guide](https://vercel.com/docs/projects/environment-variables)
