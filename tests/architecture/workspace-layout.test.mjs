import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('root workspace includes only approved JavaScript projects', async () => {
  const root = await readJson(new URL('../../package.json', import.meta.url));
  assert.equal(root.private, true);
  assert.equal(root.packageManager, 'npm@11.17.0');
  assert.deepEqual(root.workspaces, [
    'apps/*',
    'services/api-gateway',
    'services/identity-service',
    'services/lost-found-service',
    'services/matching-service',
    'packages/*',
  ]);
  assert.equal(JSON.stringify(root.workspaces).includes('ai-inference-service'), false);
});

test('shared package is contract-only and private', async () => {
  const pkg = await readJson(
    new URL('../../packages/contracts/package.json', import.meta.url),
  );
  assert.equal(pkg.name, '@lostlink/contracts');
  assert.equal(pkg.private, true);
});
