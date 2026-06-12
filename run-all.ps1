<#
  run-all.ps1 - launch all three PATHOS storefronts at once.

  Opens three separate PowerShell windows - the original site plus the two
  redesign prototypes - installs dependencies on first run, and opens each in
  your browser as soon as it's ready.

      original   http://localhost:3000   (admin at /admin)
      v2 (bold)  http://localhost:3100
      v3 (quiet) http://localhost:3200

  USAGE - from the repo root:
      .\run-all.ps1                 # launch all three + open browser tabs
      .\run-all.ps1 -NoBrowser      # launch only, don't open the browser
      .\run-all.ps1 -Only v2,v3     # launch a subset

  If Windows blocks the script ("running scripts is disabled"), allow it for
  this window only, then run it again:
      Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#>

[CmdletBinding()]
param(
  [switch]$NoBrowser,
  [ValidateSet('original', 'v2', 'v3')]
  [string[]]$Only
)

$root = $PSScriptRoot

# Each version: a label, its folder, its port, a window colour, and whether it
# needs the one-time database setup (only the original does).
$apps = @(
  [pscustomobject]@{ Key = 'original'; Title = 'PATHOS original';   Path = $root;                          Port = 3000; Color = 'White'; Setup = $true  }
  [pscustomobject]@{ Key = 'v2';       Title = 'PATHOS v2 (bold)';  Path = (Join-Path $root 'pathos-v2');  Port = 3100; Color = 'Cyan';  Setup = $false }
  [pscustomobject]@{ Key = 'v3';       Title = 'PATHOS v3 (quiet)'; Path = (Join-Path $root 'pathos-v3');  Port = 3200; Color = 'Green'; Setup = $false }
)

if ($Only) { $apps = $apps | Where-Object { $Only -contains $_.Key } }

function Start-App {
  param([pscustomobject]$App)

  if (-not (Test-Path -LiteralPath $App.Path)) {
    Write-Host "  ! Skipping $($App.Title): folder not found ($($App.Path)). Are you on the right branch? Try 'git pull'." -ForegroundColor Yellow
    return
  }

  # Build the script the new window will run. Each line is plain text; `$Host is
  # escaped so it stays literal, the rest interpolate from this scope.
  $lines = @(
    "`$Host.UI.RawUI.WindowTitle = '$($App.Title)'"
    "Write-Host ''"
    "Write-Host '  $($App.Title)  ->  http://localhost:$($App.Port)' -ForegroundColor $($App.Color)"
    "Write-Host ''"
    "Set-Location -LiteralPath '$($App.Path)'"
    "if (-not (Test-Path 'node_modules')) { Write-Host 'First run: installing dependencies (this can take a minute)...' -ForegroundColor Yellow; npm install }"
  )
  if ($App.Setup) {
    $lines += "if (-not (Test-Path '.env')) { Write-Host 'First run: creating .env and seeding the database...' -ForegroundColor Yellow; Copy-Item '.env.example' '.env'; npm run setup }"
  }
  $lines += "Write-Host 'Starting dev server on port $($App.Port) - leave this window open (Ctrl+C to stop).' -ForegroundColor Green"
  $lines += "npm run dev"

  $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes(($lines -join "`n")))
  Start-Process powershell -ArgumentList '-NoProfile', '-NoExit', '-EncodedCommand', $encoded | Out-Null
}

# Waits for a local port to start accepting connections (server is up).
function Wait-Port {
  param([int]$Port, [int]$TimeoutSec = 240)
  $deadline = (Get-Date).AddSeconds($TimeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $client = New-Object Net.Sockets.TcpClient
      $client.Connect('127.0.0.1', $Port)
      $client.Close()
      return $true
    } catch {
      Start-Sleep -Milliseconds 700
    }
  }
  return $false
}

Write-Host ''
Write-Host '  PATHOS - launching the storefront(s)' -ForegroundColor Magenta
Write-Host '  -----------------------------------' -ForegroundColor Magenta
foreach ($a in $apps) { Write-Host ("   {0,-18} http://localhost:{1}" -f $a.Title, $a.Port) }
Write-Host ''

foreach ($a in $apps) {
  Start-App -App $a
  Start-Sleep -Seconds 1   # small stagger so first-run installs don't interleave
}

if (-not $NoBrowser) {
  Write-Host 'Waiting for each server to come up, then opening your browser...' -ForegroundColor DarkGray
  foreach ($a in $apps) {
    if (Wait-Port -Port $a.Port) {
      Start-Process "http://localhost:$($a.Port)"
      Write-Host "  opened http://localhost:$($a.Port)  ($($a.Title))" -ForegroundColor Green
    } else {
      Write-Host "  http://localhost:$($a.Port) didn't come up in time - check its window for errors." -ForegroundColor Yellow
    }
  }
}

Write-Host ''
Write-Host '  Each version runs in its own window. Close a window (or press Ctrl+C in it) to stop that one.' -ForegroundColor Magenta
Write-Host ''
