$ErrorActionPreference = 'Stop'

try {
  docker compose stop ai-inference-service
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not stop AI service'
  }

  docker compose exec -T matching-service node -e "fetch('http://127.0.0.1:3003/health/ready').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"
  if ($LASTEXITCODE -ne 0) {
    throw 'Matching readiness incorrectly depends on AI'
  }
}
finally {
  docker compose start ai-inference-service
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not restart AI service after optionality check'
  }
}

Write-Host '[verify] AI optionality check passed.'
