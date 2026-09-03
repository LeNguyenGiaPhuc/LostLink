$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$previousLocation = Get-Location

function Invoke-RequiredCommand {
  param(
    [Parameter(Mandatory)]
    [string]$Description,

    [Parameter(Mandatory)]
    [scriptblock]$Command
  )

  Write-Host "[verify] $Description"
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Description failed with exit code $LASTEXITCODE"
  }
}

try {
  Set-Location $repoRoot

  Invoke-RequiredCommand 'architecture tests' { npm run test:architecture }
  Invoke-RequiredCommand 'workspace tests' { npm test --workspaces --if-present }

  $pythonPath = Join-Path $repoRoot 'services/ai-inference-service/.venv/Scripts/python.exe'
  if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw "AI test Python environment is missing: $pythonPath"
  }
  Invoke-RequiredCommand 'AI service tests' {
    & $pythonPath -m pytest 'services/ai-inference-service/tests'
  }

  Invoke-RequiredCommand 'workspace builds' { npm run build --workspaces --if-present }
  Invoke-RequiredCommand 'Compose configuration' { docker compose config --quiet }
  Invoke-RequiredCommand 'Compose startup and health checks' {
    docker compose up -d --build --wait
  }

  Invoke-RequiredCommand 'Compose component health checks' {
    & (Join-Path $repoRoot 'tests/integration/verify-compose-health.ps1')
  }
  Invoke-RequiredCommand 'correlation identifier checks' {
    & (Join-Path $repoRoot 'tests/integration/verify-correlation.ps1')
  }
  Invoke-RequiredCommand 'credential isolation checks' {
    & (Join-Path $repoRoot 'tests/integration/verify-credential-isolation.ps1')
  }
  Invoke-RequiredCommand 'AI optionality checks' {
    & (Join-Path $repoRoot 'tests/integration/verify-ai-optional.ps1')
  }

  Invoke-RequiredCommand 'PostgreSQL schema ownership checks' {
    docker compose exec -T postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /checks/001-assert-ownership.sql'
  }

  Write-Host '[verify] Foundation verification passed.'
}
finally {
  Set-Location $previousLocation
}
