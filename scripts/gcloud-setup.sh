#!/bin/bash
# Google Cloud CLI Integration for Smart Forms
# Manages Google Places API keys and authentication

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="restaurant-hub-485622"
PLACES_API_NAME="places"
MAPS_API_NAME="maps"

# Functions
print_header() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if gcloud is installed
check_gcloud() {
  if ! command -v gcloud &> /dev/null; then
    print_error "gcloud CLI not found. Please install it first:"
    echo "  macOS: brew install google-cloud-sdk"
    echo "  Linux: curl https://sdk.cloud.google.com | bash"
    echo "  Windows: https://cloud.google.com/sdk/docs/install"
    exit 1
  fi
  print_success "gcloud CLI found"
}

# Check if authenticated
check_auth() {
  if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    print_error "Not authenticated with gcloud. Run: gcloud auth login"
    exit 1
  fi
  print_success "Authenticated with gcloud"
}

# Set project
set_project() {
  print_info "Setting project to $PROJECT_ID"
  gcloud config set project $PROJECT_ID
  print_success "Project set to $PROJECT_ID"
}

# Enable APIs
enable_apis() {
  print_header "Enabling Google APIs"
  
  # Enable Places API
  print_info "Enabling Places API..."
  gcloud services enable places-backend.googleapis.com || print_warning "Places API may already be enabled"
  print_success "Places API enabled"
  
  # Enable Maps API
  print_info "Enabling Maps API..."
  gcloud services enable maps-backend.googleapis.com || print_warning "Maps API may already be enabled"
  print_success "Maps API enabled"
  
  # Enable Cloud Logging
  print_info "Enabling Cloud Logging..."
  gcloud services enable logging.googleapis.com || print_warning "Logging API may already be enabled"
  print_success "Cloud Logging enabled"
}

# Create API key
create_api_key() {
  print_header "Creating Google Places API Key"
  
  # Check if key already exists
  local existing_key=$(gcloud services api-keys list \
    --project=$PROJECT_ID \
    --filter="displayName:places-key" \
    --format="value(name)" 2>/dev/null || echo "")
  
  if [ -n "$existing_key" ]; then
    print_warning "API key already exists: $existing_key"
    local key_id=$(echo $existing_key | rev | cut -d'/' -f1 | rev)
    fetch_api_key "$key_id"
    return
  fi
  
  # Create new key
  print_info "Creating new API key..."
  local key_output=$(gcloud services api-keys create \
    --project=$PROJECT_ID \
    --display-name="places-key" \
    --api-target=places-backend.googleapis.com \
    --format="value(uid)" 2>/dev/null || echo "")
  
  if [ -z "$key_output" ]; then
    # Fallback: Try listing to get key ID
    local key_id=$(gcloud services api-keys list \
      --project=$PROJECT_ID \
      --format="value(name)" | head -1 | rev | cut -d'/' -f1 | rev)
    fetch_api_key "$key_id"
  else
    fetch_api_key "$key_output"
  fi
}

# Fetch API key value
fetch_api_key() {
  local key_id=$1
  
  print_info "Fetching API key..."
  local key_value=$(gcloud services api-keys describe "$key_id" \
    --project=$PROJECT_ID \
    --format="value(keyString)" 2>/dev/null || echo "")
  
  if [ -z "$key_value" ]; then
    print_error "Could not fetch API key"
    print_info "Please manually create key in Google Cloud Console:"
    echo "  1. Go to https://console.cloud.google.com/apis/credentials"
    echo "  2. Click 'Create Credentials' → 'API Key'"
    echo "  3. Restrict to Places API"
    echo "  4. Copy key and add to .env.local"
    return
  fi
  
  print_success "API Key retrieved!"
  echo ""
  echo -e "${GREEN}Your Google Places API Key:${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$key_value"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  save_key_to_env "$key_value"
}

# Save key to .env.local
save_key_to_env() {
  local key=$1
  local env_file="apps/portal/.env.local"
  
  if [ ! -f "$env_file" ]; then
    print_warning ".env.local not found, please create it"
    print_info "Add this line to your .env.local:"
    echo "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=$key"
    return
  fi
  
  # Check if key already exists
  if grep -q "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY" "$env_file"; then
    # Update existing
    sed -i.bak "s|NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=.*|NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=$key|" "$env_file"
    print_success "Updated .env.local"
  else
    # Add new
    echo "" >> "$env_file"
    echo "# Google Places API for smart address autocomplete" >> "$env_file"
    echo "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=$key" >> "$env_file"
    print_success "Added to .env.local"
  fi
}

# Create service account for backend
create_service_account() {
  print_header "Creating Service Account (Optional)"
  
  local sa_name="smart-forms-sa"
  
  # Check if exists
  if gcloud iam service-accounts describe "$sa_name@$PROJECT_ID.iam.gserviceaccount.com" \
    --project=$PROJECT_ID &> /dev/null; then
    print_success "Service account already exists"
    return
  fi
  
  print_info "Creating service account: $sa_name"
  gcloud iam service-accounts create $sa_name \
    --display-name="Smart Forms Backend Service" \
    --project=$PROJECT_ID
  
  print_success "Service account created"
  
  # Grant permissions
  print_info "Granting permissions..."
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$sa_name@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter" \
    --condition=None \
    --quiet
  
  print_success "Permissions granted"
}

# Setup environment variables
setup_env_vars() {
  print_header "Environment Variables Setup"
  
  local env_file="apps/portal/.env.local"
  
  if [ ! -f "$env_file" ]; then
    print_warning "Creating $env_file from template"
    cp apps/portal/.env.example "$env_file"
  fi
  
  # Add Google Cloud Project ID
  if grep -q "NEXT_PUBLIC_GOOGLE_PROJECT_ID" "$env_file"; then
    sed -i.bak "s|NEXT_PUBLIC_GOOGLE_PROJECT_ID=.*|NEXT_PUBLIC_GOOGLE_PROJECT_ID=$PROJECT_ID|" "$env_file"
  else
    echo "NEXT_PUBLIC_GOOGLE_PROJECT_ID=$PROJECT_ID" >> "$env_file"
  fi
  
  print_success "Environment variables set"
}

# Test Places API
test_places_api() {
  print_header "Testing Places API"
  
  local api_key=$(grep "NEXT_PUBLIC_GOOGLE_PLACES_API_KEY" apps/portal/.env.local | cut -d'=' -f2)
  
  if [ -z "$api_key" ]; then
    print_error "API key not found in .env.local"
    return
  fi
  
  print_info "Testing address autocomplete..."
  
  # Test autocomplete with curl
  local response=$(curl -s "https://maps.googleapis.com/maps/api/place/autocomplete/json?input=123%20Main&key=$api_key" | grep -o '"predictions"')
  
  if [ -n "$response" ]; then
    print_success "Places API is working!"
  else
    print_error "Places API test failed"
    print_info "Please verify your API key is correct and has the right restrictions"
  fi
}

# List all credentials
list_credentials() {
  print_header "Google Cloud Credentials"
  
  print_info "API Keys:"
  gcloud services api-keys list \
    --project=$PROJECT_ID \
    --format="table(displayName,name)" || echo "  No keys found"
  
  echo ""
  print_info "Service Accounts:"
  gcloud iam service-accounts list \
    --project=$PROJECT_ID \
    --format="table(displayName,email)"
}

# Main menu
show_menu() {
  echo ""
  print_header "Google Cloud Setup for Smart Forms"
  echo ""
  echo "1. Full Setup (all steps)"
  echo "2. Enable APIs only"
  echo "3. Create/Get API Key"
  echo "4. Create Service Account"
  echo "5. Setup Environment Variables"
  echo "6. Test Places API"
  echo "7. List Credentials"
  echo "8. Exit"
  echo ""
}

# Main execution
main() {
  print_header "Smart Forms - Google Cloud CLI Integration"
  
  check_gcloud
  check_auth
  set_project
  
  if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
      show_menu
      read -p "Select option (1-8): " choice
      
      case $choice in
        1)
          enable_apis
          create_api_key
          create_service_account
          setup_env_vars
          test_places_api
          print_success "Full setup complete!"
          ;;
        2)
          enable_apis
          ;;
        3)
          create_api_key
          ;;
        4)
          create_service_account
          ;;
        5)
          setup_env_vars
          ;;
        6)
          test_places_api
          ;;
        7)
          list_credentials
          ;;
        8)
          print_info "Exiting"
          exit 0
          ;;
        *)
          print_error "Invalid option"
          ;;
      esac
    done
  else
    # Command line mode
    case $1 in
      setup)
        enable_apis
        create_api_key
        setup_env_vars
        print_success "Setup complete!"
        ;;
      enable-apis)
        enable_apis
        ;;
      create-key)
        create_api_key
        ;;
      create-sa)
        create_service_account
        ;;
      test)
        test_places_api
        ;;
      *)
        print_error "Unknown command: $1"
        echo "Usage: $0 {setup|enable-apis|create-key|create-sa|test}"
        exit 1
        ;;
    esac
  fi
}

# Run main
main "$@"
