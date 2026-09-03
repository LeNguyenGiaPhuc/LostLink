$ErrorActionPreference = 'Stop'

function Assert-HttpOk {
  param(
    [Parameter(Mandatory)]
    [string]$Uri,

    [string]$RequiredContent
  )

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Uri
  }
  catch {
    throw "HTTP check failed for ${Uri}: $($_.Exception.Message)"
  }

  if ($response.StatusCode -ne 200) {
    throw "HTTP check for $Uri returned status $($response.StatusCode)"
  }

  if ($RequiredContent -and $response.Content -notmatch [regex]::Escape($RequiredContent)) {
    throw "HTTP response from $Uri did not contain '$RequiredContent'"
  }
}

Assert-HttpOk -Uri 'http://localhost:8080' -RequiredContent 'LostLink'
Assert-HttpOk -Uri 'http://localhost:3000/health/live'
Assert-HttpOk -Uri 'http://localhost:3000/health/ready'

$nodeServices = @(
  @{ Name = 'identity-service'; Port = 3001 },
  @{ Name = 'lost-found-service'; Port = 3002 },
  @{ Name = 'matching-service'; Port = 3003 }
)

foreach ($service in $nodeServices) {
  $healthCheck = "fetch('http://127.0.0.1:$($service.Port)/health/live').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1)); fetch('http://127.0.0.1:$($service.Port)/health/ready').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"
  docker compose exec -T $service.Name node -e $healthCheck
  if ($LASTEXITCODE -ne 0) {
    throw "Internal health checks failed for $($service.Name)"
  }
}

$aiHealthCheck = "import urllib.request; assert all(urllib.request.urlopen('http://127.0.0.1:8000' + path, timeout=5).status == 200 for path in ('/health/live', '/health/ready'))"
docker compose exec -T ai-inference-service python -c $aiHealthCheck
if ($LASTEXITCODE -ne 0) {
  throw 'Internal health checks failed for ai-inference-service'
}

$expectedServices = @(
  'ai-inference-service',
  'api-gateway',
  'garage',
  'identity-service',
  'lost-found-service',
  'matching-service',
  'postgres',
  'rabbitmq',
  'web'
) | Sort-Object

$runningServices = @(docker compose ps --status running --services)
if ($LASTEXITCODE -ne 0) {
  throw 'Could not list running Compose services'
}

$actualServices = @(
  $runningServices |
    ForEach-Object { ([string]$_).Trim() } |
    Where-Object { $_ } |
    Sort-Object
)

if (($actualServices -join "`n") -ne ($expectedServices -join "`n")) {
  throw "Unexpected running Compose services. Expected: $($expectedServices -join ', '). Actual: $($actualServices -join ', ')"
}

Write-Host '[verify] Compose health checks passed.'
