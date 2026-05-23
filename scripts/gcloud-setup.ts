/**
 * Google Cloud Integration for Smart Forms
 * Manages API keys and configuration via gcloud
 */

import { execSync, exec } from 'child_process';
import { readFileSync, writeFileSync, appendFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ID = 'restaurant-hub-485622';
const ENV_FILE = 'apps/portal/.env.local';

/**
 * Google Cloud API configuration
 */
interface GoogleCloudConfig {
  projectId: string;
  places_api_key?: string;
  service_account_email?: string;
}

/**
 * Execute gcloud command
 */
function executeGcloud(command: string): string {
  try {
    return execSync(`gcloud ${command}`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    console.error(`❌ gcloud error: ${error}`);
    throw error;
  }
}

/**
 * Check if gcloud is installed
 */
export function checkGcloudInstalled(): boolean {
  try {
    execSync('gcloud --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if authenticated
 */
export function checkAuthenticated(): boolean {
  try {
    const output = executeGcloud('auth list --filter=status:ACTIVE --format=value(account)');
    return output.length > 0;
  } catch {
    return false;
  }
}

/**
 * Set active project
 */
export function setActiveProject(projectId: string = PROJECT_ID): void {
  console.log(`🔧 Setting project to ${projectId}`);
  executeGcloud(`config set project ${projectId}`);
  console.log(`✅ Project set to ${projectId}`);
}

/**
 * Enable required Google APIs
 */
export function enableApis(): void {
  console.log('🔧 Enabling Google APIs...');

  const apis = [
    'places-backend.googleapis.com',
    'maps-backend.googleapis.com',
    'logging.googleapis.com',
  ];

  apis.forEach(api => {
    try {
      executeGcloud(`services enable ${api}`);
      console.log(`✅ ${api} enabled`);
    } catch (error) {
      console.warn(`⚠️  ${api} may already be enabled`);
    }
  });
}

/**
 * Create or fetch API key for Places
 */
export function createOrFetchApiKey(): string {
  console.log('🔧 Creating/fetching Google Places API key...');

  try {
    // Check if key exists
    const existingKeys = executeGcloud(
      `services api-keys list --project=${PROJECT_ID} --filter="displayName:places-key" --format="value(name)"`
    );

    if (existingKeys) {
      const keyId = existingKeys.split('\n')[0].split('/').pop();
      return fetchApiKey(keyId);
    }

    // Create new key
    const keyId = executeGcloud(
      `services api-keys create --project=${PROJECT_ID} --display-name="places-key" --api-target=places-backend.googleapis.com --format="value(uid)"`
    );

    return fetchApiKey(keyId);
  } catch (error) {
    console.error('❌ Failed to create API key');
    console.info('Please manually create it in Google Cloud Console:');
    console.info('1. Go to https://console.cloud.google.com/apis/credentials');
    console.info('2. Click "Create Credentials" → "API Key"');
    console.info('3. Restrict to Places API');
    throw error;
  }
}

/**
 * Fetch API key value
 */
function fetchApiKey(keyId: string): string {
  try {
    const keyValue = executeGcloud(
      `services api-keys describe ${keyId} --project=${PROJECT_ID} --format="value(keyString)"`
    );
    console.log(`✅ API key retrieved`);
    return keyValue;
  } catch (error) {
    console.error('❌ Failed to fetch API key');
    throw error;
  }
}

/**
 * Save API key to .env.local
 */
export function saveApiKeyToEnv(apiKey: string): void {
  console.log('🔧 Saving API key to .env.local...');

  if (!existsSync(ENV_FILE)) {
    console.warn(`⚠️  ${ENV_FILE} not found`);
    console.info(`Creating ${ENV_FILE}...`);

    const exampleFile = ENV_FILE.replace('.local', '.example');
    if (existsSync(exampleFile)) {
      const content = readFileSync(exampleFile, 'utf-8');
      writeFileSync(ENV_FILE, content);
    } else {
      writeFileSync(ENV_FILE, '');
    }
  }

  const content = readFileSync(ENV_FILE, 'utf-8');

  if (content.includes('NEXT_PUBLIC_GOOGLE_PLACES_API_KEY')) {
    // Update existing
    const updated = content.replace(
      /NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=.*/,
      `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=${apiKey}`
    );
    writeFileSync(ENV_FILE, updated);
  } else {
    // Add new
    appendFileSync(ENV_FILE, `\n# Google Places API for smart address autocomplete\n`);
    appendFileSync(ENV_FILE, `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=${apiKey}\n`);
  }

  console.log(`✅ API key saved to ${ENV_FILE}`);
}

/**
 * Create service account
 */
export function createServiceAccount(name: string = 'smart-forms-sa'): string {
  console.log(`🔧 Creating service account: ${name}`);

  try {
    // Check if exists
    const email = `${name}@${PROJECT_ID}.iam.gserviceaccount.com`;
    try {
      executeGcloud(
        `iam service-accounts describe ${email} --project=${PROJECT_ID}`
      );
      console.log(`✅ Service account already exists: ${email}`);
      return email;
    } catch {
      // Doesn't exist, create it
    }

    // Create
    executeGcloud(
      `iam service-accounts create ${name} --display-name="Smart Forms Backend Service" --project=${PROJECT_ID}`
    );

    // Grant logging permissions
    executeGcloud(
      `projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${email}" --role="roles/logging.logWriter" --quiet`
    );

    console.log(`✅ Service account created: ${email}`);
    return email;
  } catch (error) {
    console.error('❌ Failed to create service account');
    throw error;
  }
}

/**
 * List all API keys
 */
export function listApiKeys(): void {
  console.log('📋 Google Cloud API Keys:');
  const output = executeGcloud(
    `services api-keys list --project=${PROJECT_ID} --format="table(displayName,name)"`
  );
  console.log(output);
}

/**
 * List all service accounts
 */
export function listServiceAccounts(): void {
  console.log('📋 Google Cloud Service Accounts:');
  const output = executeGcloud(
    `iam service-accounts list --project=${PROJECT_ID} --format="table(displayName,email)"`
  );
  console.log(output);
}

/**
 * Get current configuration
 */
export function getConfiguration(): GoogleCloudConfig {
  const config: GoogleCloudConfig = {
    projectId: PROJECT_ID,
  };

  // Get API key from env if exists
  if (existsSync(ENV_FILE)) {
    const content = readFileSync(ENV_FILE, 'utf-8');
    const keyMatch = content.match(/NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=(.+)/);
    if (keyMatch) {
      config.places_api_key = keyMatch[1].trim();
    }
  }

  return config;
}

/**
 * Full setup
 */
export function fullSetup(): void {
  console.log('🚀 Starting full Google Cloud setup...\n');

  if (!checkGcloudInstalled()) {
    console.error('❌ gcloud CLI not installed');
    console.info('Install it: brew install google-cloud-sdk');
    process.exit(1);
  }

  if (!checkAuthenticated()) {
    console.error('❌ Not authenticated with gcloud');
    console.info('Run: gcloud auth login');
    process.exit(1);
  }

  setActiveProject();
  enableApis();
  const apiKey = createOrFetchApiKey();
  saveApiKeyToEnv(apiKey);
  createServiceAccount();

  console.log('\n✅ Google Cloud setup complete!');
  console.log('Your smart forms are now configured with Google Places API.\n');
}

// Export for CLI usage
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      fullSetup();
      break;
    case 'enable-apis':
      enableApis();
      break;
    case 'create-key':
      try {
        const apiKey = createOrFetchApiKey();
        saveApiKeyToEnv(apiKey);
      } catch (error) {
        process.exit(1);
      }
      break;
    case 'create-sa':
      try {
        createServiceAccount();
      } catch (error) {
        process.exit(1);
      }
      break;
    case 'list-keys':
      listApiKeys();
      break;
    case 'list-sa':
      listServiceAccounts();
      break;
    case 'config':
      const config = getConfiguration();
      console.log(JSON.stringify(config, null, 2));
      break;
    default:
      console.log(`
Google Cloud CLI Integration for Smart Forms

Usage:
  npx tsx scripts/gcloud-setup.ts <command>

Commands:
  setup           Full setup (enable APIs, create key, save to env)
  enable-apis     Enable required Google APIs
  create-key      Create or fetch API key
  create-sa       Create service account
  list-keys       List all API keys
  list-sa         List all service accounts
  config          Show current configuration
`);
  }
}

export default {
  checkGcloudInstalled,
  checkAuthenticated,
  setActiveProject,
  enableApis,
  createOrFetchApiKey,
  saveApiKeyToEnv,
  createServiceAccount,
  listApiKeys,
  listServiceAccounts,
  getConfiguration,
  fullSetup,
};
