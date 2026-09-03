import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

function serviceBlock(compose, service) {
  const lines = compose.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `  ${service}:`);
  assert.notEqual(start, -1, `missing Compose service: ${service}`);
  let end = start + 1;
  while (
    end < lines.length &&
    !/^  [A-Za-z0-9_-]+:\s*$/.test(lines[end]) &&
    !/^(networks|volumes):\s*$/.test(lines[end])
  ) {
    end += 1;
  }
  return lines.slice(start, end).join('\n');
}

test('only web and gateway publish host ports', async () => {
  const compose = await readFile(new URL('../../compose.yaml', import.meta.url), 'utf8');

  for (const service of [
    'identity-service',
    'lost-found-service',
    'matching-service',
    'ai-inference-service',
    'postgres',
    'rabbitmq',
    'garage',
  ]) {
    const block = serviceBlock(compose, service);
    assert.doesNotMatch(block, /^\s+ports:/m);
  }
  assert.match(serviceBlock(compose, 'web'), /8080:4173/);
  assert.match(serviceBlock(compose, 'api-gateway'), /3000:3000/);
});

test('compose uses only pinned images', async () => {
  const compose = await readFile(new URL('../../compose.yaml', import.meta.url), 'utf8');

  assert.doesNotMatch(compose, /:latest\b/);
  assert.match(compose, /postgres:18\.6-bookworm/);
  assert.match(compose, /rabbitmq:4\.3\.5-management/);
  assert.match(compose, /dxflrs\/garage:v2\.3\.0/);
});

test('PostgreSQL 18 and Garage use their required persistent mounts', async () => {
  const compose = await readFile(new URL('../../compose.yaml', import.meta.url), 'utf8');
  const garageConfig = await readFile(
    new URL('../../infra/garage/garage.toml', import.meta.url),
    'utf8',
  );

  assert.match(
    serviceBlock(compose, 'postgres'),
    /postgres-data:\/var\/lib\/postgresql(?:\r?\n|$)/,
  );
  assert.match(
    serviceBlock(compose, 'garage'),
    /\.\/infra\/garage\/garage\.toml:\/etc\/garage\.toml:ro/,
  );
  assert.match(garageConfig, /metadata_dir = "\/var\/lib\/garage\/meta"/);
  assert.match(garageConfig, /data_dir = "\/var\/lib\/garage\/data"/);
  assert.match(garageConfig, /\[s3_api\]/);
  assert.doesNotMatch(garageConfig, /\[s3_web\]/);
});
