# Push RESEND_API_KEY from apps/portal/.env.local to Supabase Edge Function secrets
# Requires: supabase CLI logged in, or SUPABASE_ACCESS_TOKEN in environment

$ErrorActionPreference = "Stop"
$ProjectRef = "hwntncyiqaltzvlidscg"
$EnvFile = Join-Path $PSScriptRoot "..\apps\portal\.env.local"

if (-not (Test-Path $EnvFile)) {
  Write-Host "Missing $EnvFile - add RESEND_API_KEY first."
  exit 1
}

$key = $null
Get-Content $EnvFile | ForEach-Object {
  if ($_ -match '^RESEND_API_KEY=(.+)$') { $key = $matches[1].Trim().Trim('"') }
}

if (-not $key) {
  Write-Host "RESEND_API_KEY not found in .env.local"
  exit 1
}

$token = $env:SUPABASE_ACCESS_TOKEN
if (-not $token) {
  $rootEnv = Join-Path $PSScriptRoot "..\.env"
  if (Test-Path $rootEnv) {
    Get-Content $rootEnv | ForEach-Object {
      if ($_ -match '^SUPABASE_ACCESS_TOKEN=(.+)$') { $token = $matches[1].Trim() }
    }
  }
}

if ($token) {
  $secrets = @(
    @{ name = "RESEND_API_KEY"; value = $key }
  )
  foreach ($s in $secrets) {
    $body = $s | ConvertTo-Json
    Invoke-RestMethod -Method POST `
      -Uri "https://api.supabase.com/v1/projects/$ProjectRef/secrets" `
      -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
      -Body $body | Out-Null
    Write-Host "Set Supabase secret: $($s.name)"
  }
  exit 0
}

$supabase = Get-Command supabase -ErrorAction SilentlyContinue
if ($supabase) {
  Push-Location (Join-Path $PSScriptRoot "..")
  supabase secrets set "RESEND_API_KEY=$key" --project-ref $ProjectRef
  Pop-Location
  Write-Host "Set RESEND_API_KEY via Supabase CLI"
  exit 0
}

Write-Host @"
Could not set Supabase secret automatically.
1. Dashboard: https://supabase.com/dashboard/project/$ProjectRef/settings/functions
2. Add secret RESEND_API_KEY (same value as apps/portal/.env.local)
Or run with SUPABASE_ACCESS_TOKEN set and re-run this script.
"@
