$ErrorActionPreference = 'Stop'

function Assert-ContainerShell {
  param(
    [Parameter(Mandatory)]
    [string]$Service,

    [Parameter(Mandatory)]
    [string]$Command,

    [Parameter(Mandatory)]
    [string]$FailureMessage
  )

  docker compose exec -T $Service sh -lc $Command
  if ($LASTEXITCODE -ne 0) {
    throw $FailureMessage
  }
}

$withoutGarageCredentials = @(
  'api-gateway',
  'identity-service',
  'matching-service',
  'ai-inference-service'
)

foreach ($service in $withoutGarageCredentials) {
  Assert-ContainerShell `
    -Service $service `
    -Command 'test -z "$S3_ACCESS_KEY_ID" && test -z "$S3_SECRET_ACCESS_KEY"' `
    -FailureMessage "$service unexpectedly received Garage credentials"
}

Assert-ContainerShell `
  -Service 'lost-found-service' `
  -Command 'test -n "$S3_ACCESS_KEY_ID" && test -n "$S3_SECRET_ACCESS_KEY"' `
  -FailureMessage 'Lost-and-Found Service lacks Garage credentials'

$withoutDatabaseCredentials = @('api-gateway', 'ai-inference-service')
foreach ($service in $withoutDatabaseCredentials) {
  Assert-ContainerShell `
    -Service $service `
    -Command 'test -z "$DATABASE_URL"' `
    -FailureMessage "$service unexpectedly received DATABASE_URL"
}

foreach ($service in @('identity-service', 'lost-found-service', 'matching-service')) {
  Assert-ContainerShell `
    -Service $service `
    -Command 'test -n "$DATABASE_URL"' `
    -FailureMessage "$service does not have exactly one non-empty DATABASE_URL"
}

Write-Host '[verify] Credential isolation checks passed.'
