$ErrorActionPreference = 'Stop'

$provided = Invoke-WebRequest -UseBasicParsing `
  -Uri 'http://localhost:3000/health/live' `
  -Headers @{ 'X-Correlation-Id' = 'lostlink-compose-test' }
if ([string]$provided.Headers['X-Correlation-Id'] -ne 'lostlink-compose-test') {
  throw 'Gateway did not preserve correlation identifier'
}

$generated = Invoke-WebRequest -UseBasicParsing `
  -Uri 'http://localhost:3000/health/live' `
  -Headers @{ 'X-Correlation-Id' = 'invalid value' }
if ([string]$generated.Headers['X-Correlation-Id'] -notmatch '^[0-9a-f-]{36}$') {
  throw 'Gateway did not replace invalid correlation identifier'
}

Write-Host '[verify] Correlation identifier checks passed.'
