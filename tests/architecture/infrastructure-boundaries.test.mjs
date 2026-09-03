import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('database bootstrap defines all owned schemas and revokes cross access', async () => {
  const sql = await readFile(
    new URL('../../infra/postgres/init/001-service-ownership.sh', import.meta.url),
    'utf8',
  );

  for (const schema of [
    'identity_schema',
    'lost_found_schema',
    'matching_schema',
  ]) {
    assert.match(sql, new RegExp(schema));
  }
  assert.match(sql, /REVOKE ALL ON SCHEMA public FROM PUBLIC/);
  assert.match(sql, /ALTER DEFAULT PRIVILEGES/);
});

test('example environment documents separate credentials', async () => {
  const env = await readFile(new URL('../../.env.example', import.meta.url), 'utf8');

  for (const name of [
    'IDENTITY_DB_PASSWORD',
    'LOST_FOUND_DB_PASSWORD',
    'MATCHING_DB_PASSWORD',
    'GARAGE_ACCESS_KEY_ID',
    'GARAGE_SECRET_ACCESS_KEY',
    'RABBITMQ_DEFAULT_USER',
    'RABBITMQ_DEFAULT_PASS',
  ]) {
    assert.match(env, new RegExp(`^${name}=`, 'm'));
  }
});
