# Sync apps/portal/.env.local -> Vercel project (crypto-pay-portal)
# Usage: .\scripts\sync-vercel-env.ps1
# Requires: logged-in Vercel CLI (vercel login)

$ErrorActionPreference = "Continue"
$Root = Split-Path $PSScriptRoot -Parent
$EnvFile = Join-Path $Root "apps\portal\.env.local"
$VercelCli = Join-Path $Root "node_modules\vercel\dist\index.js"

if (-not (Test-Path $EnvFile)) {
  Write-Host "Missing $EnvFile"
  exit 1
}
if (-not (Test-Path $VercelCli)) {
  Write-Host "Run npm/pnpm install in repo root first."
  exit 1
}

# Vars to push (from Restaurant Hub / Crypto Pay ENVIRONMENT.md)
$AllowList = @(
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL",
  "NEXT_PUBLIC_APP_URL",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
  "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
  "GROQ_API_KEY"
)

$targets = @("production", "preview", "development")
$vars = @{}

Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -match '^\s*#' -or $line -eq "") { return }
  if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
    $name = $matches[1]
    $val = $matches[2].Trim().Trim('"').Trim("'")
    if ($AllowList -contains $name -and $val -and $val -notmatch '^__PASTE') {
      $vars[$name] = $val
    }
  }
}

if ($vars.Count -eq 0) {
  Write-Host "No values to sync. Fill apps/portal/.env.local first."
  exit 1
}

Push-Location $Root
Remove-Item Env:VERCEL_ORG_ID -ErrorAction SilentlyContinue
Remove-Item Env:VERCEL_PROJECT_ID -ErrorAction SilentlyContinue

foreach ($name in $vars.Keys) {
  $val = $vars[$name]
  $sensitive = $name -match 'KEY|SECRET|TOKEN|PASSWORD'
  foreach ($target in $targets) {
    $args = @("env", "add", $name, $target, "--yes", "--force")
    if ($sensitive) { $args += "--sensitive" }
    $null = $val | & node $VercelCli @args 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Host "OK: $name -> $target"
    } else {
      Write-Host "WARN: $name ($target) exit $LASTEXITCODE"
    }
  }
}

Write-Host ""
Write-Host "Done. List: node node_modules/vercel/dist/index.js env ls production"
Pop-Location
