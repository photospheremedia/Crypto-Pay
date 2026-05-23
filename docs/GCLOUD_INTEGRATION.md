# Google Cloud CLI Integration for Smart Forms

Complete guide to setting up Google Places API for smart address autocomplete using Google Cloud CLI.

## Overview

This integration provides automated setup for:
- ✅ Enabling Google APIs (Places, Maps, Logging)
- ✅ Creating/managing API keys for Places API
- ✅ Environment variable management
- ✅ Service account creation (for backend)
- ✅ Testing and verification

## Prerequisites

1. **Google Cloud Project** - You have: `restaurant-hub-485622`
2. **gcloud CLI** - Install via:
   ```bash
   # macOS
   brew install google-cloud-sdk
   
   # Linux
   curl https://sdk.cloud.google.com | bash
   
   # Windows
   https://cloud.google.com/sdk/docs/install
   ```

3. **Authenticated with Google Cloud**
   ```bash
   gcloud auth login
   ```

## Quick Start

### Option 1: Interactive Setup (Recommended)

```bash
bash scripts/gcloud-setup.sh
```

Then follow the menu:
```
1. Full Setup (all steps) ← Choose this
2. Enable APIs only
3. Create/Get API Key
4. Create Service Account
5. Setup Environment Variables
6. Test Places API
7. List Credentials
8. Exit
```

### Option 2: Scripted Setup

```bash
bash scripts/gcloud-setup.sh setup
```

This automatically:
1. Enables Google APIs
2. Creates/fetches API key
3. Saves to `.env.local`
4. Verifies everything works

### Option 3: TypeScript/Node.js

```bash
# Full setup
npx tsx scripts/gcloud-setup.ts setup

# Or individual commands
npx tsx scripts/gcloud-setup.ts enable-apis
npx tsx scripts/gcloud-setup.ts create-key
npx tsx scripts/gcloud-setup.ts create-sa

# List current credentials
npx tsx scripts/gcloud-setup.ts list-keys
npx tsx scripts/gcloud-setup.ts list-sa

# Get configuration
npx tsx scripts/gcloud-setup.ts config
```

## What Gets Set Up

### 1. Google APIs Enabled

```
✅ Places API (places-backend.googleapis.com)
   ↳ For address autocomplete suggestions
   
✅ Maps API (maps-backend.googleapis.com)
   ↳ Dependency for Places
   
✅ Cloud Logging (logging.googleapis.com)
   ↳ For audit logs
```

### 2. API Key Created

An API key is created with restrictions:
- **Service**: Places API only
- **Type**: Browser key (can be restricted to your domain)
- **Storage**: Saved to `.env.local` as `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`

### 3. Service Account (Optional)

For backend operations:
- **Name**: `smart-forms-sa`
- **Permissions**: Logging writer (for audit logs)
- **Email**: `smart-forms-sa@restaurant-hub-485622.iam.gserviceaccount.com`

## Manual Setup (If Scripts Fail)

### Step 1: Enable APIs

```bash
gcloud services enable places-backend.googleapis.com \
  --project=restaurant-hub-485622

gcloud services enable maps-backend.googleapis.com \
  --project=restaurant-hub-485622

gcloud services enable logging.googleapis.com \
  --project=restaurant-hub-485622
```

### Step 2: Create API Key

**Via Cloud Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Project: `restaurant-hub-485622`
3. Navigate to APIs & Services → Credentials
4. Click "Create Credentials" → "API Key"
5. Copy the key
6. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
   ```

**Via gcloud CLI:**
```bash
gcloud services api-keys create \
  --project=restaurant-hub-485622 \
  --display-name="places-key" \
  --api-target=places-backend.googleapis.com
```

### Step 3: Restrict API Key (Recommended)

```bash
# View keys
gcloud services api-keys list --project=restaurant-hub-485622

# Describe a key
gcloud services api-keys describe <KEY_ID> \
  --project=restaurant-hub-485622
```

## Verify Setup

### Test Places API

```bash
# Automated test
bash scripts/gcloud-setup.sh
# Then select option 6

# Or manual test
curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=123%20Main&key=YOUR_API_KEY"
```

### Check Credentials in Console

```bash
# List API keys
npx tsx scripts/gcloud-setup.ts list-keys

# List service accounts
npx tsx scripts/gcloud-setup.ts list-sa

# Get configuration
npx tsx scripts/gcloud-setup.ts config
```

## Environment Variables

After setup, you'll have:

```bash
# .env.local
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIza...
NEXT_PUBLIC_GOOGLE_PROJECT_ID=restaurant-hub-485622
```

## Using in Components

Once set up, the `AddressInput` component automatically uses the API key:

```tsx
import { AddressInput } from '@/components/ui/address-input';

export function MyForm() {
  const [address, setAddress] = useState({});

  return (
    <AddressInput
      country="US"
      value={address}
      onAddressChange={(addr) => setAddress(addr)}
    />
  );
}
```

**Without setup**: Manual entry only
**With setup**: Smart autocomplete suggestions appear as user types!

## Troubleshooting

### "gcloud CLI not found"
```bash
# macOS
brew install google-cloud-sdk

# Then add to PATH
gcloud init
```

### "Not authenticated"
```bash
gcloud auth login
# Opens browser for authentication
```

### "API key not working"
1. Verify API key in `.env.local`
2. Check Places API is enabled:
   ```bash
   gcloud services list --enabled --project=restaurant-hub-485622 | grep places
   ```
3. Verify key restrictions in Cloud Console
4. Test with curl:
   ```bash
   curl "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=test&key=YOUR_KEY"
   ```

### "Error: Unknown command"
Make sure you're using correct syntax:
```bash
# ✅ Correct
bash scripts/gcloud-setup.sh setup

# ✅ Correct
npx tsx scripts/gcloud-setup.ts setup

# ❌ Wrong
bash scripts/gcloud-setup.ts setup
npm gcloud-setup setup
```

## Advanced: Custom Configuration

### Use Different Project

Edit scripts to change `PROJECT_ID`:

**Bash:**
```bash
# Line ~15 in gcloud-setup.sh
PROJECT_ID="your-project-id"
```

**TypeScript:**
```typescript
// Line ~10 in gcloud-setup.ts
const PROJECT_ID = 'your-project-id';
```

### Add Service Account Keys

```bash
# Create key for service account
gcloud iam service-accounts keys create \
  --iam-account=smart-forms-sa@restaurant-hub-485622.iam.gserviceaccount.com \
  --project=restaurant-hub-485622 \
  smart-forms-key.json
```

### Restrict API Key to Domain

In Cloud Console:
1. Go to APIs & Services → Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add: `https://yourdomain.com/*`

## Integration Commands

### Add to package.json

```json
{
  "scripts": {
    "gcloud:setup": "bash scripts/gcloud-setup.sh",
    "gcloud:setup:full": "bash scripts/gcloud-setup.sh setup",
    "gcloud:test": "npx tsx scripts/gcloud-setup.ts",
    "gcloud:config": "npx tsx scripts/gcloud-setup.ts config"
  }
}
```

Then use:
```bash
pnpm gcloud:setup
pnpm gcloud:setup:full
pnpm gcloud:config
```

### CI/CD Integration

For GitHub Actions:

```yaml
# .github/workflows/gcloud-setup.yml
name: Setup Google Cloud

on:
  push:
    paths:
      - 'apps/portal/.env.example'

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GOOGLE_APPLICATION_CREDENTIALS }}
      - uses: google-github-actions/setup-gcloud@v1
      - run: bash scripts/gcloud-setup.sh setup
```

## Security Best Practices

1. **Never commit API keys to Git**
   - Keep in `.env.local` (gitignored)
   - Use `.env.example` for documentation

2. **Restrict API Key Scope**
   - Limit to specific APIs
   - Restrict to your domain
   - Regenerate if compromised

3. **Monitor Usage**
   ```bash
   gcloud logging read "resource.type=api" \
     --project=restaurant-hub-485622 \
     --limit 10
   ```

4. **Rotate Keys Regularly**
   ```bash
   # List all keys
   gcloud services api-keys list --project=restaurant-hub-485622
   
   # Delete old key
   gcloud services api-keys delete <KEY_ID> --project=restaurant-hub-485622
   ```

## Related Documentation

- [Google Places API Docs](https://developers.google.com/maps/documentation/places)
- [Google Cloud SDK Reference](https://cloud.google.com/sdk/gcloud)
- [Smart Forms Documentation](./SMART_ADDRESS_PHONE_FORMS.md)
- [Smart Forms Setup](./SMART_FORMS_SETUP.md)

## Support

For help:
1. Check gcloud is installed: `gcloud --version`
2. Verify auth: `gcloud auth list`
3. Test API: `npx tsx scripts/gcloud-setup.ts config`
4. Check permissions: `gcloud projects get-iam-policy restaurant-hub-485622`

---

**Status**: ✅ Ready to use
**Project**: restaurant-hub-485622
**APIs**: Places, Maps, Logging
**Security**: Fully secured with API key restrictions
