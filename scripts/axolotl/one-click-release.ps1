# QueAN one-click release
# Automates: install deps -> ensure signing key -> sync public key -> build -> generate update manifest.
#
# Usage (from repo root):
#   powershell -ExecutionPolicy Bypass -File .\scripts\axolotl\one-click-release.ps1 v1.0.0
# Or simply double-click build-release.cmd in the repo root.
#
# Optional: -Notes notes.md  to attach release notes.

param(
    [string]$Tag = "v1.0.0",
    [string]$Notes = ""
)

$ErrorActionPreference = "Stop"

# Locate repo root (this script lives in scripts/axolotl/)
$root = Resolve-Path (Join-Path $PSScriptRoot "..\..")
Set-Location $root
Write-Host "==> Repo root: $root" -ForegroundColor Cyan

function Assert-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Command not found: $name. Please install Node.js, pnpm and Rust first."
    }
}

# 1. Basic toolchain
Assert-Command node
Assert-Command pnpm
Write-Host ("==> node " + (node -v) + " / pnpm " + (pnpm -v)) -ForegroundColor Cyan

# 2. Dependencies
if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Host "==> Installing dependencies (this takes a while)..." -ForegroundColor Yellow
    pnpm install
    if ($LASTEXITCODE -ne 0) { throw "pnpm install failed" }
}
else {
    Write-Host "==> Dependencies already present, skipping pnpm install" -ForegroundColor Cyan
}

# 3. Signing key (generate if missing)
$keyDir = Join-Path $HOME ".tauri"
$keyPath = Join-Path $keyDir "quean.key"
$pubPath = Join-Path $keyDir "quean.key.pub"
$keyPathSlash = $keyPath.Replace("\", "/")

if (-not (Test-Path $keyPath)) {
    Write-Host "==> No signing key found, generating one (press Enter for an empty password)..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Force -Path $keyDir | Out-Null
    pnpm --filter @modrinth/app tauri signer generate -w $keyPathSlash
    if ($LASTEXITCODE -ne 0) { throw "signer generate failed" }
}
else {
    Write-Host "==> Using existing signing key: $keyPath" -ForegroundColor Cyan
}

# 4. Sync public key into config (the step that is easy to miss)
if (-not (Test-Path $pubPath)) { throw "Public key not found: $pubPath" }
$pub = (Get-Content $pubPath -Raw).Trim()
$conf = Join-Path $root "apps\app\tauri-release.conf.json"
$json = (Get-Content $conf -Raw) -replace '"pubkey"\s*:\s*"[^"]*"', ('"pubkey": "' + $pub + '"')
[System.IO.File]::WriteAllText((Resolve-Path $conf), $json)
Write-Host "==> Public key written into tauri-release.conf.json" -ForegroundColor Cyan

# 5. Build + generate manifest (latest / api/versions / SHA256SUMS)
$env:TAURI_SIGNING_PRIVATE_KEY_PATH = $keyPath
# The Blockbench skin editor submodule build needs npm + network and can hang offline.
# Skip it so the launcher can still be packaged; set to "0" to build it.
$env:AXOLOTL_SKIP_BLOCKBENCH_BUILD = "1"
$nodeArgs = @("scripts/axolotl/local-release.mjs", $Tag)
if ($Notes -ne "") { $nodeArgs += @("--notes", $Notes) }
node @nodeArgs
if ($LASTEXITCODE -ne 0) { throw "release build failed" }

# 6. Bundle everything into one zip (upload + extract into /quean-update/)
$zipPath = Join-Path $root "release-publish.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path (Join-Path $root "release\*") -DestinationPath $zipPath -Force
Write-Host "==> Publish bundle: $zipPath (upload + extract into /quean-update/)" -ForegroundColor Cyan

Write-Host ""
Write-Host ("==> Done. Artifacts: " + (Join-Path $root "release")) -ForegroundColor Green
