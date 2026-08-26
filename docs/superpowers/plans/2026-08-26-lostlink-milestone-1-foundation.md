# LostLink Milestone 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the independently runnable LostLink Phase 1 service and infrastructure foundation without implementing any business workflow.

**Architecture:** Use one npm-workspace monorepo for the React Web Client, four independent NestJS processes, and a contract-only package; keep the FastAPI AI service as an independent Python project. Run the complete local environment with Docker Compose, one PostgreSQL server with three isolated schemas/users, RabbitMQ, and single-node Garage, while exposing only Web Client and API Gateway to the host.

**Tech Stack:** Node.js 24.19.0, npm 11.17.0, TypeScript 5.9.3, NestJS 11.2.3, React 19.2.8, Vite 8.2.2, Python 3.13.15, FastAPI 0.141.1, Prisma 7.10.0, PostgreSQL 18.6, RabbitMQ 4.3.5, Garage 2.3.0, Docker Compose, Jest/Supertest, Vitest/React Testing Library, pytest/TestClient.

**Spec:** `docs/superpowers/specs/2026-08-24-lostlink-milestone-1-foundation-design.md`

## Global Constraints

- Read `AGENTS.md`, the spec, and requirements `ARCH-001`, `ARCH-002`, `ARCH-003`, `ARCH-004`, `ARCH-006`, `OPS-001`, and `OPS-002` before implementation.
- Milestone 1 contains no authentication, report, moderation, matching, event, claim, verification, handover, notification, dispute, or AI inference feature.
- API Gateway is the only public backend entry point; internal services and infrastructure receive no host-published ports.
- Identity, Lost-and-Found, and Matching use only `identity_schema`, `lost_found_schema`, and `matching_schema`, respectively, with distinct database users.
- Services do not share Entity, Repository, generated Prisma Client, domain model, or business logic. `packages/contracts` remains contract-only and exports no domain contract in Milestone 1.
- AI Inference Service is stateless and optional. Matching readiness must remain healthy when AI is stopped.
- Only Lost-and-Found Service receives Garage credentials. Garage buckets remain private.
- Use exact versions and explicit image tags. Do not use `latest`, caret ranges, or tilde ranges in direct dependencies.
- JavaScript exact resolution is committed in root `package-lock.json`; Python packages use `==` pins in `requirements.txt`.
- Every HTTP service exposes `GET /health/live` and `GET /health/ready`; no domain endpoint is created.
- Use container ports 3000 (Gateway), 3001 (Identity), 3002 (Lost-and-Found), 3003 (Matching), and 8000 (AI) consistently in configuration, Dockerfiles, Compose, and tests.
- Use structured JSON console logs and `X-Correlation-Id`; never log credentials, connection strings, tokens, secret evidence, or request bodies.
- Follow TDD for behavior: failing test, confirm failure, minimal implementation, confirm pass, then commit.
- Do not mark the milestone `COMPLETED`. After all checks pass, update it to `READY_FOR_REVIEW` in notes while retaining an allowed milestone status until human approval.

---

## File and Responsibility Map

| Path | Responsibility |
| --- | --- |
| `package.json`, `package-lock.json` | Root npm workspace, pinned toolchain, aggregate scripts. |
| `.nvmrc`, `.npmrc`, `.gitignore`, `.dockerignore`, `.env.example` | Runtime pinning, dependency policy, ignored secrets/artifacts, documented local variables. |
| `apps/web/` | Minimal React/Vite application shell and smoke tests; no business UI. |
| `services/api-gateway/` | Public NestJS edge process, health, OpenAPI, JSON logging, correlation context. |
| `services/identity-service/` | NestJS process and Prisma/database readiness for `identity_schema`. |
| `services/lost-found-service/` | NestJS process, Prisma readiness, and private Garage readiness. |
| `services/matching-service/` | NestJS process and Prisma readiness; AI remains optional. |
| `services/ai-inference-service/` | Stateless FastAPI process, health, config, JSON logging, correlation middleware. |
| `packages/contracts/` | Empty contract-only package boundary; no domain implementation. |
| `infra/postgres/init/` | Idempotent role/schema bootstrap and privilege isolation. |
| `compose.yaml` | One-command local environment with internal networking and health conditions. |
| `tests/architecture/` | Static workspace, boundary, dependency, tag, and credential checks. |
| `tests/integration/` | Compose smoke checks and real PostgreSQL privilege assertions. |
| `scripts/verify-foundation.ps1` | Repeatable Milestone 1 verification entry point. |
| `README.md` | Exact local prerequisites, setup, start, verify, and stop commands. |
| `docs/TRACEABILITY.md`, `docs/PROJECT_STATUS.md` | Evidence-backed requirement and milestone status after verification. |

---

### Task 1: Establish the Root Workspace and Contract Boundary

**Requirements:** ARCH-001, ARCH-002, ARCH-006, OPS-002

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `.nvmrc`
- Create: `.npmrc`
- Modify: `.gitignore`
- Create: `.dockerignore`
- Create: `.env.example`
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/src/index.ts`
- Create: `tests/architecture/workspace-layout.test.mjs`

**Interfaces:**
- Consumes: approved directory layout and pinned versions from the spec.
- Produces: npm workspace names `@lostlink/web`, `@lostlink/api-gateway`, `@lostlink/identity-service`, `@lostlink/lost-found-service`, `@lostlink/matching-service`, and `@lostlink/contracts`; root verification scripts used by later tasks.

- [ ] **Step 1: Write the failing workspace-boundary test**

```js
// tests/architecture/workspace-layout.test.mjs
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
```

- [ ] **Step 2: Run the test and confirm the missing root workspace fails**

Run: `node --test tests/architecture/workspace-layout.test.mjs`

Expected: FAIL because `package.json` and `packages/contracts/package.json` do not exist.

- [ ] **Step 3: Create the minimal root workspace**

```json
{
  "name": "lostlink",
  "private": true,
  "version": "0.0.0",
  "packageManager": "npm@11.17.0",
  "engines": {
    "node": "24.19.0",
    "npm": "11.17.0"
  },
  "workspaces": [
    "apps/*",
    "services/api-gateway",
    "services/identity-service",
    "services/lost-found-service",
    "services/matching-service",
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test:architecture && npm run test --workspaces --if-present",
    "test:architecture": "node --test tests/architecture/*.test.mjs",
    "compose:config": "docker compose config --quiet",
    "compose:up": "docker compose up -d --build --wait",
    "compose:down": "docker compose down",
    "verify": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-foundation.ps1"
  }
}
```

Create `.nvmrc` containing `24.19.0`, and `.npmrc` containing:

```ini
save-exact=true
engine-strict=true
fund=false
audit=true
```

Create `packages/contracts/package.json`:

```json
{
  "name": "@lostlink/contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": "./src/index.ts"
}
```

Create `packages/contracts/src/index.ts` with exactly:

```ts
export {};
```

Ensure `.gitignore` includes `.env`, `node_modules/`, `dist/`, `.venv/`, `__pycache__/`, `.pytest_cache/`, and every `src/generated/prisma/` directory. Ensure `.dockerignore` excludes `.git`, `node_modules`, `.venv`, test caches, local `.env`, and generated build output.

- [ ] **Step 4: Generate the root lockfile and rerun the architecture test**

Run: `npm install --package-lock-only`

Run: `node --test tests/architecture/workspace-layout.test.mjs`

Expected: 2 tests PASS.

- [ ] **Step 5: Verify no application or domain code was added**

Run: `git diff --check`

Run: `rg -n "ReportActivated|MatchFound|ReportResolved|class .*Entity|class .*Repository" packages`

Expected: `git diff --check` exits 0; `rg` finds no domain implementation.

- [ ] **Step 6: Commit**

```powershell
git add package.json package-lock.json .nvmrc .npmrc .gitignore .dockerignore .env.example packages/contracts tests/architecture/workspace-layout.test.mjs
git commit -m "chore: initialize LostLink workspace"
```

---

### Task 2: Create the Minimal Web Client

**Requirements:** ARCH-001, ARCH-002, OPS-002

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.app.json`
- Create: `apps/web/tsconfig.node.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/App.test.tsx`
- Create: `apps/web/src/test/setup.ts`
- Create: `apps/web/src/index.css`

**Interfaces:**
- Consumes: root npm workspace from Task 1.
- Produces: independently buildable `@lostlink/web` package and a static application shell on container port 4173.

- [ ] **Step 1: Scaffold Vite without accepting floating dependencies**

Run: `npm create vite@8.3.0 apps/web -- --template react-ts`

Change the workspace package name to `@lostlink/web`, set `private: true`, remove caret ranges, and install the approved exact versions:

```powershell
npm install -w @lostlink/web --save-exact react@19.2.8 react-dom@19.2.8
npm install -w @lostlink/web --save-dev --save-exact vite@8.2.2 @vitejs/plugin-react@6.1.0 typescript@5.9.3 vitest@4.1.11 jsdom@30.0.1 @testing-library/react@16.3.2 @testing-library/jest-dom@7.0.1 @types/react@19.2.18 @types/react-dom@19.2.5
```

- [ ] **Step 2: Add the failing shell smoke test**

```tsx
// apps/web/src/App.test.tsx
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('LostLink foundation shell', () => {
  it('identifies the project without exposing unfinished domain UI', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'LostLink' })).toBeInTheDocument();
    expect(screen.getByText('Service foundation is running.')).toBeInTheDocument();
  });
});
```

Configure Vitest in `vite.config.ts` with `environment: 'jsdom'` and `setupFiles: './src/test/setup.ts'`.

- [ ] **Step 3: Run the test and confirm the generated demo fails**

Run: `npm test -w @lostlink/web -- --run`

Expected: FAIL because the generated Vite demo does not render the approved text.

- [ ] **Step 4: Replace the demo with the minimal application shell**

```tsx
// apps/web/src/App.tsx
export default function App() {
  return (
    <main>
      <h1>LostLink</h1>
      <p>Service foundation is running.</p>
    </main>
  );
}
```

Keep CSS limited to readable layout/reset styles. Do not add report cards, authentication controls, matching results, or navigation for unimplemented features.

- [ ] **Step 5: Verify tests and production build**

Run: `npm test -w @lostlink/web -- --run`

Run: `npm run build -w @lostlink/web`

Expected: test PASS and Vite build exits 0.

- [ ] **Step 6: Commit**

```powershell
git add apps/web package.json package-lock.json
git commit -m "feat: add minimal LostLink web shell"
```

---

### Task 3: Create the API Gateway Foundation

**Requirements:** ARCH-001, ARCH-002, OPS-002

**Files:**
- Create: `services/api-gateway/package.json`
- Create: `services/api-gateway/tsconfig.json`
- Create: `services/api-gateway/tsconfig.build.json`
- Create: `services/api-gateway/nest-cli.json`
- Create: `services/api-gateway/src/main.ts`
- Create: `services/api-gateway/src/app.module.ts`
- Create: `services/api-gateway/src/config/env.schema.ts`
- Create: `services/api-gateway/src/common/correlation-id.ts`
- Create: `services/api-gateway/src/common/correlation-context.middleware.ts`
- Create: `services/api-gateway/src/health/health.controller.ts`
- Create: `services/api-gateway/test/app.e2e-spec.ts`
- Create: `services/api-gateway/test/jest-e2e.json`

**Interfaces:**
- Consumes: `PORT`, `LOG_LEVEL`; inbound optional `X-Correlation-Id`.
- Produces: public `GET /health/live`, `GET /health/ready`, `/docs`, JSON logs, and response `X-Correlation-Id`; no database or domain endpoint.

- [ ] **Step 1: Scaffold the independent NestJS workspace without installing floating versions**

Run: `npx --yes @nestjs/cli@11.0.24 new services/api-gateway --package-manager npm --skip-git --skip-install --strict`

Set package name to `@lostlink/api-gateway`, set `private: true`, and remove generated sample controller/service files.

Install exact packages:

```powershell
npm install -w @lostlink/api-gateway --save-exact @nestjs/common@11.2.3 @nestjs/core@11.2.3 @nestjs/platform-express@11.2.3 @nestjs/config@4.0.4 @nestjs/swagger@11.4.7 joi@18.2.5 nestjs-pino@4.6.1 pino@10.3.1 reflect-metadata@0.2.2 rxjs@7.8.2
npm install -w @lostlink/api-gateway --save-dev --save-exact @nestjs/cli@11.0.24 @nestjs/testing@11.2.3 @types/jest@29.5.14 @types/node@24.13.3 @types/supertest@7.2.1 jest@29.7.0 supertest@7.2.2 ts-jest@29.4.12 ts-node@10.9.2 typescript@5.9.3
```

- [ ] **Step 2: Write failing correlation and health tests**

```ts
// services/api-gateway/test/app.e2e-spec.ts
it('returns live and ready without a domain dependency', async () => {
  await request(app.getHttpServer()).get('/health/live').expect(200, { status: 'live' });
  await request(app.getHttpServer()).get('/health/ready').expect(200, { status: 'ready' });
});

it('preserves a valid correlation identifier', async () => {
  await request(app.getHttpServer())
    .get('/health/live')
    .set('X-Correlation-Id', 'lostlink-test-1')
    .expect('X-Correlation-Id', 'lostlink-test-1')
    .expect(200);
});

it('replaces an invalid correlation identifier', async () => {
  const response = await request(app.getHttpServer())
    .get('/health/live')
    .set('X-Correlation-Id', 'contains spaces')
    .expect(200);
  expect(response.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
});
```

- [ ] **Step 3: Run the gateway e2e test and confirm failure**

Run: `npm run test:e2e -w @lostlink/api-gateway`

Expected: FAIL because the health controller and correlation behavior do not exist.

- [ ] **Step 4: Implement validated configuration and correlation context**

```ts
// services/api-gateway/src/common/correlation-id.ts
import { randomUUID } from 'node:crypto';

const acceptedCorrelationId = /^[A-Za-z0-9._:-]{1,128}$/;

export function resolveCorrelationId(value: string | undefined): string {
  return value && acceptedCorrelationId.test(value) ? value : randomUUID();
}
```

```ts
// services/api-gateway/src/common/correlation-context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { resolveCorrelationId } from './correlation-id';

@Injectable()
export class CorrelationContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const id = resolveCorrelationId(req.header('X-Correlation-Id'));
    Object.assign(req, { correlationId: id });
    res.setHeader('X-Correlation-Id', id);
    next();
  }
}
```

Validate `PORT` as integer `1..65535`, default `3000`, and `LOG_LEVEL` as one of `fatal`, `error`, `warn`, `info`, `debug`, `trace`, default `info`. Configure `LoggerModule` for JSON output and exclude request bodies/authorization headers from serializers.

- [ ] **Step 5: Implement health endpoints and OpenAPI bootstrap**

```ts
// services/api-gateway/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('live')
  live() {
    return { status: 'live' as const };
  }

  @Get('ready')
  ready() {
    return { status: 'ready' as const };
  }
}
```

In `main.ts`, use `bufferLogs: true`, `app.useLogger(app.get(Logger))`, enable shutdown hooks, create Swagger document title `LostLink API Gateway`, expose it at `/docs`, and listen on validated `PORT`. Do not register a domain route or proxy target.

- [ ] **Step 6: Verify gateway behavior, type-check, and OpenAPI scope**

Run: `npm run test:e2e -w @lostlink/api-gateway`

Run: `npm run build -w @lostlink/api-gateway`

Run: `rg -n "@(Get|Post|Put|Patch|Delete)" services/api-gateway/src`

Expected: tests/build PASS; route scan reports only `health/live` and `health/ready`.

- [ ] **Step 7: Commit**

```powershell
git add services/api-gateway package.json package-lock.json
git commit -m "feat: add API Gateway foundation"
```

---

### Task 4: Create the Identity Service and Owned Database Boundary

**Requirements:** ARCH-001, ARCH-002, ARCH-003, ARCH-004, OPS-002

**Files:**
- Create: `services/identity-service/package.json`
- Create: `services/identity-service/tsconfig.json`
- Create: `services/identity-service/tsconfig.build.json`
- Create: `services/identity-service/nest-cli.json`
- Create: `services/identity-service/prisma.config.ts`
- Create: `services/identity-service/prisma/schema.prisma`
- Create: `services/identity-service/prisma/migrations/README.md`
- Create: `services/identity-service/src/main.ts`
- Create: `services/identity-service/src/app.module.ts`
- Create: `services/identity-service/src/config/env.schema.ts`
- Create: `services/identity-service/src/common/correlation-id.ts`
- Create: `services/identity-service/src/common/correlation-context.middleware.ts`
- Create: `services/identity-service/src/database/prisma.service.ts`
- Create: `services/identity-service/src/health/database-readiness.service.ts`
- Create: `services/identity-service/src/health/health.controller.ts`
- Create: `services/identity-service/test/health.e2e-spec.ts`

**Interfaces:**
- Consumes: `PORT`, `LOG_LEVEL`, `DATABASE_URL` for `identity_service` and `identity_schema` only.
- Produces: internal `GET /health/live`, `GET /health/ready`; generated Prisma Client local to Identity Service.

- [ ] **Step 1: Scaffold and install the exact Identity dependencies**

Run: `npx --yes @nestjs/cli@11.0.24 new services/identity-service --package-manager npm --skip-git --skip-install --strict`

Set package name to `@lostlink/identity-service`, remove generated sample endpoints, and install these exact packages:

```powershell
npm install -w @lostlink/identity-service --save-exact @nestjs/common@11.2.3 @nestjs/core@11.2.3 @nestjs/platform-express@11.2.3 @nestjs/config@4.0.4 @nestjs/swagger@11.4.7 joi@18.2.5 nestjs-pino@4.6.1 pino@10.3.1 reflect-metadata@0.2.2 rxjs@7.8.2 prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg@8.23.0 dotenv@17.4.2
npm install -w @lostlink/identity-service --save-dev --save-exact @nestjs/cli@11.0.24 @nestjs/testing@11.2.3 @types/jest@29.5.14 @types/node@24.13.3 @types/pg@8.23.1 @types/supertest@7.2.1 jest@29.7.0 supertest@7.2.2 ts-jest@29.4.12 ts-node@10.9.2 tsx@4.23.12 typescript@5.9.3
```

- [ ] **Step 2: Write failing readiness tests with a mocked database boundary**

```ts
it('reports ready when its owned database connection succeeds', async () => {
  databaseReadiness.check.mockResolvedValue(undefined);
  await request(app.getHttpServer()).get('/health/ready').expect(200, { status: 'ready' });
});

it('reports unavailable when its owned database connection fails', async () => {
  databaseReadiness.check.mockRejectedValue(new Error('database unavailable'));
  await request(app.getHttpServer()).get('/health/ready').expect(503, {
    status: 'not_ready',
    dependencies: { database: 'down' },
  });
});

it('remains live when its database is unavailable', async () => {
  databaseReadiness.check.mockRejectedValue(new Error('database unavailable'));
  await request(app.getHttpServer()).get('/health/live').expect(200, { status: 'live' });
});

it('returns the validated correlation identifier', async () => {
  await request(app.getHttpServer())
    .get('/health/live')
    .set('X-Correlation-Id', 'identity-health-test')
    .expect('X-Correlation-Id', 'identity-health-test')
    .expect(200);
});
```

- [ ] **Step 3: Run the Identity health test and confirm failure**

Run: `npm run test:e2e -w @lostlink/identity-service`

Expected: FAIL because readiness and Prisma boundaries do not exist.

- [ ] **Step 4: Create the Prisma 7 configuration with no business model**

```ts
// services/identity-service/prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: env('DATABASE_URL') },
});
```

```prisma
// services/identity-service/prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
  schemas  = ["identity_schema"]
}
```

`prisma/migrations/README.md` must state that Milestone 1 creates only the owned schema/user through infrastructure bootstrap and that the first business migration belongs to the requirement that introduces the first Identity model.

- [ ] **Step 5: Implement Prisma runtime setup and database readiness**

```ts
// services/identity-service/src/database/prisma.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(databaseUrl: string) {
    super({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
```

Provide `PrismaService` from a factory that reads validated `DATABASE_URL`. `DatabaseReadinessService.check(): Promise<void>` executes `SELECT 1` through Prisma. Map a failed check to HTTP 503 with the exact response used in the test; never include the thrown error or connection string in the response.

Create service-local correlation files that accept only `^[A-Za-z0-9._:-]{1,128}$`, otherwise generate `randomUUID()`, and return the identifier as `X-Correlation-Id`. Configure JSON logging and Identity-local OpenAPI titled `LostLink Identity Service`; document only the two health routes. Do not call `$connect()` during application bootstrap: Prisma connects lazily so a transient database outage leaves liveness available while readiness reports 503.

```ts
// services/identity-service/src/common/correlation-id.ts
import { randomUUID } from 'node:crypto';
const validCorrelationId = /^[A-Za-z0-9._:-]{1,128}$/;
export const resolveCorrelationId = (value?: string): string =>
  value && validCorrelationId.test(value) ? value : randomUUID();
```

- [ ] **Step 6: Generate, validate, test, and build**

Run: `npm exec --workspace @lostlink/identity-service -- prisma generate`

Run: `npm exec --workspace @lostlink/identity-service -- prisma validate`

Run: `npm run test:e2e -w @lostlink/identity-service`

Run: `npm run build -w @lostlink/identity-service`

Expected: Prisma commands, tests, and build all exit 0.

- [ ] **Step 7: Commit**

```powershell
git add services/identity-service package.json package-lock.json
git commit -m "feat: add Identity service foundation"
```

---

### Task 5: Create the Lost-and-Found Service with Private Storage Readiness

**Requirements:** ARCH-001, ARCH-002, ARCH-003, ARCH-004, OPS-002

**Files:**
- Create: `services/lost-found-service/package.json`
- Create: `services/lost-found-service/tsconfig.json`
- Create: `services/lost-found-service/tsconfig.build.json`
- Create: `services/lost-found-service/nest-cli.json`
- Create: `services/lost-found-service/prisma.config.ts`
- Create: `services/lost-found-service/prisma/schema.prisma`
- Create: `services/lost-found-service/prisma/migrations/README.md`
- Create: `services/lost-found-service/src/main.ts`
- Create: `services/lost-found-service/src/app.module.ts`
- Create: `services/lost-found-service/src/config/env.schema.ts`
- Create: `services/lost-found-service/src/common/correlation-id.ts`
- Create: `services/lost-found-service/src/common/correlation-context.middleware.ts`
- Create: `services/lost-found-service/src/database/prisma.service.ts`
- Create: `services/lost-found-service/src/storage/object-storage.service.ts`
- Create: `services/lost-found-service/src/health/readiness.service.ts`
- Create: `services/lost-found-service/src/health/health.controller.ts`
- Create: `services/lost-found-service/test/health.e2e-spec.ts`

**Interfaces:**
- Consumes: `PORT`, `LOG_LEVEL`, `DATABASE_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`.
- Produces: internal health endpoints; private S3-compatible readiness owned only by Lost-and-Found Service; no upload/report endpoint.

- [ ] **Step 1: Scaffold and install exact dependencies**

Run: `npx --yes @nestjs/cli@11.0.24 new services/lost-found-service --package-manager npm --skip-git --skip-install --strict`

Set package name to `@lostlink/lost-found-service`, remove generated sample endpoints, and install these exact packages:

```powershell
npm install -w @lostlink/lost-found-service --save-exact @nestjs/common@11.2.3 @nestjs/core@11.2.3 @nestjs/platform-express@11.2.3 @nestjs/config@4.0.4 @nestjs/swagger@11.4.7 joi@18.2.5 nestjs-pino@4.6.1 pino@10.3.1 reflect-metadata@0.2.2 rxjs@7.8.2 prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg@8.23.0 dotenv@17.4.2 @aws-sdk/client-s3@3.1117.0
npm install -w @lostlink/lost-found-service --save-dev --save-exact @nestjs/cli@11.0.24 @nestjs/testing@11.2.3 @types/jest@29.5.14 @types/node@24.13.3 @types/pg@8.23.1 @types/supertest@7.2.1 jest@29.7.0 supertest@7.2.2 ts-jest@29.4.12 ts-node@10.9.2 tsx@4.23.12 typescript@5.9.3
```

- [ ] **Step 2: Write failing readiness tests for both owned dependencies**

```ts
it('is ready only when database and object storage are reachable', async () => {
  readiness.checkDatabase.mockResolvedValue(undefined);
  readiness.checkObjectStorage.mockResolvedValue(undefined);
  await request(app.getHttpServer()).get('/health/ready').expect(200, { status: 'ready' });
});

it('does not expose the storage error when Garage is unavailable', async () => {
  readiness.checkDatabase.mockResolvedValue(undefined);
  readiness.checkObjectStorage.mockRejectedValue(new Error('secret endpoint detail'));
  await request(app.getHttpServer()).get('/health/ready').expect(503, {
    status: 'not_ready',
    dependencies: { database: 'up', objectStorage: 'down' },
  });
});

it('remains live when a mandatory dependency is unavailable', async () => {
  readiness.checkObjectStorage.mockRejectedValue(new Error('storage unavailable'));
  await request(app.getHttpServer()).get('/health/live').expect(200, { status: 'live' });
});

it('returns the validated correlation identifier', async () => {
  await request(app.getHttpServer())
    .get('/health/live')
    .set('X-Correlation-Id', 'lost-found-health-test')
    .expect('X-Correlation-Id', 'lost-found-health-test')
    .expect(200);
});
```

- [ ] **Step 3: Run the Lost-and-Found health test and confirm failure**

Run: `npm run test:e2e -w @lostlink/lost-found-service`

Expected: FAIL because database/storage readiness does not exist.

- [ ] **Step 4: Add the isolated Prisma configuration**

Use the Prisma 7 configuration from Task 4 with the exact service-local paths and this datasource:

```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["lost_found_schema"]
}
```

The service-local generated client remains under `services/lost-found-service/src/generated/prisma`; it must not be imported by another workspace.

- [ ] **Step 5: Implement the Garage readiness adapter**

```ts
// services/lost-found-service/src/storage/object-storage.service.ts
import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ObjectStorageService {
  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}

  async check(): Promise<void> {
    await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
  }
}
```

Create the `S3Client` with validated config, `forcePathStyle: true`, and credentials supplied only to this service. `ReadinessService` calls database and object storage checks, returns 200 only when both succeed, and maps failures to the exact non-secret dependency status response in the tests.

Create service-local correlation resolution with the exact `^[A-Za-z0-9._:-]{1,128}$` rule and UUID replacement. Configure JSON logging and Lost-and-Found-local OpenAPI titled `LostLink Lost-and-Found Service`; expose only the health routes. Use lazy Prisma connection so database failure affects readiness rather than process startup.

```ts
// services/lost-found-service/src/common/correlation-id.ts
import { randomUUID } from 'node:crypto';
const validCorrelationId = /^[A-Za-z0-9._:-]{1,128}$/;
export const resolveCorrelationId = (value?: string): string =>
  value && validCorrelationId.test(value) ? value : randomUUID();
```

- [ ] **Step 6: Generate, validate, test, and build**

Run: `npm exec --workspace @lostlink/lost-found-service -- prisma generate`

Run: `npm exec --workspace @lostlink/lost-found-service -- prisma validate`

Run: `npm run test:e2e -w @lostlink/lost-found-service`

Run: `npm run build -w @lostlink/lost-found-service`

Expected: all commands exit 0.

- [ ] **Step 7: Verify storage dependency isolation statically**

Run: `rg -n "@aws-sdk/client-s3|S3_ACCESS_KEY|S3_SECRET_ACCESS_KEY" services`

Expected: matches exist only under `services/lost-found-service`.

- [ ] **Step 8: Commit**

```powershell
git add services/lost-found-service package.json package-lock.json
git commit -m "feat: add Lost-and-Found service foundation"
```

---

### Task 6: Create the Matching Service with Optional AI Boundary

**Requirements:** ARCH-001, ARCH-002, ARCH-003, ARCH-004, ARCH-006, OPS-002

**Files:**
- Create: `services/matching-service/package.json`
- Create: `services/matching-service/tsconfig.json`
- Create: `services/matching-service/tsconfig.build.json`
- Create: `services/matching-service/nest-cli.json`
- Create: `services/matching-service/prisma.config.ts`
- Create: `services/matching-service/prisma/schema.prisma`
- Create: `services/matching-service/prisma/migrations/README.md`
- Create: `services/matching-service/src/main.ts`
- Create: `services/matching-service/src/app.module.ts`
- Create: `services/matching-service/src/config/env.schema.ts`
- Create: `services/matching-service/src/common/correlation-id.ts`
- Create: `services/matching-service/src/common/correlation-context.middleware.ts`
- Create: `services/matching-service/src/database/prisma.service.ts`
- Create: `services/matching-service/src/health/database-readiness.service.ts`
- Create: `services/matching-service/src/health/health.controller.ts`
- Create: `services/matching-service/test/health.e2e-spec.ts`

**Interfaces:**
- Consumes: mandatory `PORT`, `LOG_LEVEL`, `DATABASE_URL`; optional `AI_INFERENCE_URL` only.
- Produces: internal health endpoints and a service-local Prisma Client; no matching algorithm, read model, broker consumer, or AI call.

- [ ] **Step 1: Scaffold and install exact Matching dependencies**

Run: `npx --yes @nestjs/cli@11.0.24 new services/matching-service --package-manager npm --skip-git --skip-install --strict`

Set package name to `@lostlink/matching-service`, remove generated sample endpoints, and install these exact packages:

```powershell
npm install -w @lostlink/matching-service --save-exact @nestjs/common@11.2.3 @nestjs/core@11.2.3 @nestjs/platform-express@11.2.3 @nestjs/config@4.0.4 @nestjs/swagger@11.4.7 joi@18.2.5 nestjs-pino@4.6.1 pino@10.3.1 reflect-metadata@0.2.2 rxjs@7.8.2 prisma@7.10.0 @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg@8.23.0 dotenv@17.4.2
npm install -w @lostlink/matching-service --save-dev --save-exact @nestjs/cli@11.0.24 @nestjs/testing@11.2.3 @types/jest@29.5.14 @types/node@24.13.3 @types/pg@8.23.1 @types/supertest@7.2.1 jest@29.7.0 supertest@7.2.2 ts-jest@29.4.12 ts-node@10.9.2 tsx@4.23.12 typescript@5.9.3
```

- [ ] **Step 2: Write the failing optional-AI readiness tests**

```ts
it('reports ready when its database is available and AI URL is absent', async () => {
  databaseReadiness.check.mockResolvedValue(undefined);
  await request(app.getHttpServer()).get('/health/ready').expect(200, { status: 'ready' });
});

it('does not include AI in mandatory readiness dependencies', async () => {
  databaseReadiness.check.mockResolvedValue(undefined);
  const response = await request(app.getHttpServer()).get('/health/ready').expect(200);
  expect(response.body).toEqual({ status: 'ready' });
  expect(JSON.stringify(response.body)).not.toContain('ai');
});

it('remains live when its database is unavailable', async () => {
  databaseReadiness.check.mockRejectedValue(new Error('database unavailable'));
  await request(app.getHttpServer()).get('/health/live').expect(200, { status: 'live' });
});

it('returns the validated correlation identifier', async () => {
  await request(app.getHttpServer())
    .get('/health/live')
    .set('X-Correlation-Id', 'matching-health-test')
    .expect('X-Correlation-Id', 'matching-health-test')
    .expect(200);
});
```

- [ ] **Step 3: Run the Matching health test and confirm failure**

Run: `npm run test:e2e -w @lostlink/matching-service`

Expected: FAIL because health/readiness is not implemented.

- [ ] **Step 4: Add isolated Prisma and validated configuration**

Use the Task 4 Prisma setup with this exact datasource:

```prisma
datasource db {
  provider = "postgresql"
  schemas  = ["matching_schema"]
}
```

Joi requires `DATABASE_URL`; it allows `AI_INFERENCE_URL` as an optional URI and does not require it at startup. No AI client or inference endpoint is created in this milestone.

- [ ] **Step 5: Implement database-only readiness**

`DatabaseReadinessService.check(): Promise<void>` executes `SELECT 1` through the Matching-local Prisma Client. `GET /health/ready` returns `{ "status": "ready" }` when the database check succeeds and a non-secret 503 dependency response when it fails. It does not contact AI Inference Service.

Create service-local correlation resolution with the exact `^[A-Za-z0-9._:-]{1,128}$` rule and UUID replacement. Configure JSON logging and Matching-local OpenAPI titled `LostLink Matching Service`; expose only the health routes. Use lazy Prisma connection so database failure affects readiness rather than process startup.

```ts
// services/matching-service/src/common/correlation-id.ts
import { randomUUID } from 'node:crypto';
const validCorrelationId = /^[A-Za-z0-9._:-]{1,128}$/;
export const resolveCorrelationId = (value?: string): string =>
  value && validCorrelationId.test(value) ? value : randomUUID();
```

- [ ] **Step 6: Generate, validate, test, and build**

Run: `npm exec --workspace @lostlink/matching-service -- prisma generate`

Run: `npm exec --workspace @lostlink/matching-service -- prisma validate`

Run: `npm run test:e2e -w @lostlink/matching-service`

Run: `npm run build -w @lostlink/matching-service`

Expected: all commands exit 0.

- [ ] **Step 7: Prove no forbidden dependency is present**

Run: `npm query '[name="@lostlink/matching-service"]'`

Run: `rg -n "S3_ACCESS_KEY|S3_SECRET_ACCESS_KEY|secret evidence|claim evidence" services/matching-service`

Expected: Matching has no S3 dependency/credential and no protected evidence concept.

- [ ] **Step 8: Commit**

```powershell
git add services/matching-service package.json package-lock.json
git commit -m "feat: add Matching service foundation"
```

---

### Task 7: Create the Stateless AI Inference Service Foundation

**Requirements:** ARCH-001, ARCH-002, ARCH-006, OPS-002

**Files:**
- Create: `services/ai-inference-service/requirements.txt`
- Create: `services/ai-inference-service/requirements-dev.txt`
- Create: `services/ai-inference-service/app/__init__.py`
- Create: `services/ai-inference-service/app/main.py`
- Create: `services/ai-inference-service/app/config.py`
- Create: `services/ai-inference-service/app/logging_config.py`
- Create: `services/ai-inference-service/app/correlation.py`
- Create: `services/ai-inference-service/app/health.py`
- Create: `services/ai-inference-service/tests/test_health.py`
- Create: `services/ai-inference-service/pytest.ini`

**Interfaces:**
- Consumes: `PORT`, `LOG_LEVEL`, optional inbound `X-Correlation-Id`.
- Produces: internal `GET /health/live`, `GET /health/ready`, OpenAPI generated by FastAPI, JSON logs, response correlation header; no database, broker, storage credential, model, or inference route.

- [ ] **Step 1: Create and activate the isolated Python environment**

```powershell
py -3.13 -m venv services/ai-inference-service/.venv
services/ai-inference-service/.venv/Scripts/python.exe -m pip install --upgrade pip
```

Create exact runtime requirements:

```text
fastapi==0.141.1
httpx==0.28.1
pydantic==2.13.4
pydantic-settings==2.15.0
uvicorn[standard]==0.52.4
```

Create exact development requirements:

```text
-r requirements.txt
pytest==9.1.1
```

Run: `services/ai-inference-service/.venv/Scripts/python.exe -m pip install -r services/ai-inference-service/requirements-dev.txt`

- [ ] **Step 2: Write failing health and correlation tests**

```python
# services/ai-inference-service/tests/test_health.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_live_and_ready_are_stateless() -> None:
    assert client.get("/health/live").json() == {"status": "live"}
    assert client.get("/health/ready").json() == {"status": "ready"}


def test_valid_correlation_id_is_preserved() -> None:
    response = client.get(
        "/health/live",
        headers={"X-Correlation-Id": "lostlink-ai-test"},
    )
    assert response.headers["X-Correlation-Id"] == "lostlink-ai-test"


def test_invalid_correlation_id_is_replaced() -> None:
    response = client.get(
        "/health/live",
        headers={"X-Correlation-Id": "contains spaces"},
    )
    assert len(response.headers["X-Correlation-Id"]) == 36
```

- [ ] **Step 3: Run pytest and confirm collection/import failure**

Run: `services/ai-inference-service/.venv/Scripts/python.exe -m pytest services/ai-inference-service/tests -q`

Expected: FAIL because `app.main` does not exist.

- [ ] **Step 4: Implement validated settings and health routes**

```python
# services/ai-inference-service/app/config.py
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="forbid")
    port: int = Field(default=8000, ge=1, le=65535)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
```

```python
# services/ai-inference-service/app/health.py
from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/live")
def live() -> dict[str, str]:
    return {"status": "live"}


@router.get("/ready")
def ready() -> dict[str, str]:
    return {"status": "ready"}
```

Implement ASGI correlation middleware using the same `^[A-Za-z0-9._:-]{1,128}$` rule as Gateway and `uuid.uuid4()` for replacement. Configure standard-library logging with a formatter that emits JSON containing timestamp, level, logger, message, and correlationId only.

- [ ] **Step 5: Create the FastAPI application without inference routes**

```python
# services/ai-inference-service/app/main.py
from fastapi import FastAPI
from .correlation import CorrelationMiddleware
from .health import router as health_router

app = FastAPI(title="LostLink AI Inference Service", version="0.0.0")
app.add_middleware(CorrelationMiddleware)
app.include_router(health_router)
```

- [ ] **Step 6: Verify tests and route scope**

Run: `services/ai-inference-service/.venv/Scripts/python.exe -m pytest services/ai-inference-service/tests -q`

Run: `rg -n "@(app|router)\.(get|post|put|patch|delete)" services/ai-inference-service/app`

Expected: tests PASS; route scan finds only the two health routes.

- [ ] **Step 7: Verify no stateful dependency is installed**

Run: `services/ai-inference-service/.venv/Scripts/python.exe -m pip freeze`

Expected: no Prisma, PostgreSQL driver, RabbitMQ client, S3 client, ML framework, or model library.

- [ ] **Step 8: Commit**

```powershell
git add services/ai-inference-service .gitignore
git commit -m "feat: add stateless AI service foundation"
```

---

### Task 8: Define PostgreSQL Ownership and Infrastructure Guard Tests

**Requirements:** ARCH-003, ARCH-004, ARCH-006, OPS-001, OPS-002

**Files:**
- Modify: `.env.example`
- Create: `infra/postgres/init/001-service-ownership.sh`
- Create: `infra/postgres/check/001-assert-ownership.sql`
- Create: `tests/architecture/infrastructure-boundaries.test.mjs`

**Interfaces:**
- Consumes: Compose environment variables for the PostgreSQL admin account and three service passwords.
- Produces: idempotent schemas/roles `identity_service`, `lost_found_service`, `matching_service`; executable SQL assertions used by Task 10.

- [ ] **Step 1: Write the failing infrastructure-boundary test**

```js
// tests/architecture/infrastructure-boundaries.test.mjs
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('database bootstrap defines all owned schemas and revokes cross access', async () => {
  const sql = await readFile(
    new URL('../../infra/postgres/init/001-service-ownership.sh', import.meta.url),
    'utf8',
  );
  for (const schema of ['identity_schema', 'lost_found_schema', 'matching_schema']) {
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
```

- [ ] **Step 2: Run the architecture tests and confirm failure**

Run: `npm run test:architecture`

Expected: FAIL because infrastructure bootstrap and variables do not exist.

- [ ] **Step 3: Document all local configuration names without real secrets**

`.env.example` must list these explicit non-secret sample values:

```dotenv
POSTGRES_DB=lostlink
POSTGRES_USER=lostlink_admin
POSTGRES_PASSWORD=example_only_change_admin_password
IDENTITY_DB_PASSWORD=example_only_change_identity_password
LOST_FOUND_DB_PASSWORD=example_only_change_lost_found_password
MATCHING_DB_PASSWORD=example_only_change_matching_password
GARAGE_ACCESS_KEY_ID=GKexample_only_change_access_key
GARAGE_SECRET_ACCESS_KEY=example_only_change_secret_key
GARAGE_BUCKET=lostlink-items
GARAGE_REGION=garage
RABBITMQ_DEFAULT_USER=lostlink_local
RABBITMQ_DEFAULT_PASS=example_only_change_rabbitmq_password
```

Also document only the ports and URLs required by each service. Do not place a usable credential in `.env.example`.

- [ ] **Step 4: Implement idempotent PostgreSQL role/schema bootstrap**

Create the bootstrap as an executable POSIX shell script with this structure. Keep the here-document single-quoted so the shell does not expand SQL tokens; psql safely quotes each password through `:'variable'`.

```sh
#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=db_name="$POSTGRES_DB" \
  --set=identity_password="$IDENTITY_DB_PASSWORD" \
  --set=lost_found_password="$LOST_FOUND_DB_PASSWORD" \
  --set=matching_password="$MATCHING_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE identity_service LOGIN PASSWORD %L', :'identity_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'identity_service') \gexec
SELECT format('CREATE ROLE lost_found_service LOGIN PASSWORD %L', :'lost_found_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lost_found_service') \gexec
SELECT format('CREATE ROLE matching_service LOGIN PASSWORD %L', :'matching_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'matching_service') \gexec

SELECT format('ALTER ROLE identity_service PASSWORD %L', :'identity_password') \gexec
SELECT format('ALTER ROLE lost_found_service PASSWORD %L', :'lost_found_password') \gexec
SELECT format('ALTER ROLE matching_service PASSWORD %L', :'matching_password') \gexec

REVOKE CREATE ON DATABASE :"db_name" FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

CREATE SCHEMA IF NOT EXISTS identity_schema AUTHORIZATION identity_service;
CREATE SCHEMA IF NOT EXISTS lost_found_schema AUTHORIZATION lost_found_service;
CREATE SCHEMA IF NOT EXISTS matching_schema AUTHORIZATION matching_service;

ALTER SCHEMA identity_schema OWNER TO identity_service;
ALTER SCHEMA lost_found_schema OWNER TO lost_found_service;
ALTER SCHEMA matching_schema OWNER TO matching_service;

REVOKE ALL ON SCHEMA identity_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA lost_found_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA matching_schema FROM PUBLIC;

GRANT USAGE, CREATE ON SCHEMA identity_schema TO identity_service;
GRANT USAGE, CREATE ON SCHEMA lost_found_schema TO lost_found_service;
GRANT USAGE, CREATE ON SCHEMA matching_schema TO matching_service;

ALTER ROLE identity_service SET search_path = identity_schema;
ALTER ROLE lost_found_service SET search_path = lost_found_schema;
ALTER ROLE matching_service SET search_path = matching_schema;

ALTER DEFAULT PRIVILEGES FOR ROLE identity_service IN SCHEMA identity_schema REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE identity_service IN SCHEMA identity_schema REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE identity_service IN SCHEMA identity_schema REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lost_found_service IN SCHEMA lost_found_schema REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lost_found_service IN SCHEMA lost_found_schema REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lost_found_service IN SCHEMA lost_found_schema REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE matching_service IN SCHEMA matching_schema REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE matching_service IN SCHEMA matching_schema REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE matching_service IN SCHEMA matching_schema REVOKE ALL ON FUNCTIONS FROM PUBLIC;
SQL
```

- [ ] **Step 5: Write executable privilege assertions**

```sql
-- infra/postgres/check/001-assert-ownership.sql
DO $block$
BEGIN
  IF NOT has_schema_privilege('identity_service', 'identity_schema', 'USAGE') THEN
    RAISE EXCEPTION 'identity_service lacks identity_schema access';
  END IF;
  IF has_schema_privilege('identity_service', 'lost_found_schema', 'USAGE')
     OR has_schema_privilege('identity_service', 'matching_schema', 'USAGE') THEN
    RAISE EXCEPTION 'identity_service has cross-schema access';
  END IF;
  IF NOT has_schema_privilege('lost_found_service', 'lost_found_schema', 'USAGE') THEN
    RAISE EXCEPTION 'lost_found_service lacks lost_found_schema access';
  END IF;
  IF has_schema_privilege('lost_found_service', 'identity_schema', 'USAGE')
     OR has_schema_privilege('lost_found_service', 'matching_schema', 'USAGE') THEN
    RAISE EXCEPTION 'lost_found_service has cross-schema access';
  END IF;
  IF NOT has_schema_privilege('matching_service', 'matching_schema', 'USAGE') THEN
    RAISE EXCEPTION 'matching_service lacks matching_schema access';
  END IF;
  IF has_schema_privilege('matching_service', 'identity_schema', 'USAGE')
     OR has_schema_privilege('matching_service', 'lost_found_schema', 'USAGE') THEN
    RAISE EXCEPTION 'matching_service has cross-schema access';
  END IF;
END
$block$;
```

- [ ] **Step 6: Run architecture tests and shell-format checks**

Run: `npm run test:architecture`

Run: `git diff --check`

Expected: architecture tests PASS and diff check exits 0.

- [ ] **Step 7: Commit**

```powershell
git add .env.example infra/postgres tests/architecture/infrastructure-boundaries.test.mjs
git commit -m "feat: define service data ownership"
```

---

### Task 9: Containerize Every Component and Compose the Local Environment

**Requirements:** ARCH-001, ARCH-002, ARCH-003, ARCH-004, OPS-001, OPS-002

**Files:**
- Create: `apps/web/Dockerfile`
- Create: `services/api-gateway/Dockerfile`
- Create: `services/identity-service/Dockerfile`
- Create: `services/lost-found-service/Dockerfile`
- Create: `services/matching-service/Dockerfile`
- Create: `services/ai-inference-service/Dockerfile`
- Create: `compose.yaml`
- Create: `tests/architecture/compose-boundaries.test.mjs`

**Interfaces:**
- Consumes: root `.env`, all component build/start/health commands, PostgreSQL bootstrap, Garage default key/bucket variables.
- Produces: host Web Client on `8080`, host API Gateway on `3000`, internal-only Identity/Lost-and-Found/Matching/AI/PostgreSQL/RabbitMQ/Garage.

- [ ] **Step 1: Write the failing Compose boundary test**

```js
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
```

Do not add a YAML runtime dependency for this static boundary test. `docker compose config --quiet` remains the authoritative syntax validation.

- [ ] **Step 2: Run architecture tests and confirm Compose checks fail**

Run: `npm run test:architecture`

Expected: FAIL because `compose.yaml` and Dockerfiles do not exist.

- [ ] **Step 3: Create one Dockerfile per component**

Node Dockerfiles use `node:24.19.0-bookworm-slim`, copy the root workspace manifests and repository source, run `npm ci`, build only the target workspace, switch to the built-in non-root `node` user, and start the target process. The Web Client starts `vite preview --host 0.0.0.0 --port 4173` from its built output.

The AI Dockerfile starts from `python:3.13.15-slim-bookworm`, creates a non-root user, installs `requirements.txt`, copies only `services/ai-inference-service`, and runs:

```dockerfile
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Each Dockerfile exposes only its container port and contains its own healthcheck using Node `fetch` or Python `urllib.request`; it must not copy `.env`.

- [ ] **Step 4: Create the pinned internal Compose topology**

`compose.yaml` must define exactly these services:

```yaml
services:
  web:
  api-gateway:
  identity-service:
  lost-found-service:
  matching-service:
  ai-inference-service:
  postgres:
    image: postgres:18.6-bookworm
  rabbitmq:
    image: rabbitmq:4.3.5-management
  garage:
    image: dxflrs/garage:v2.3.0
```

Garage runs `/garage server --single-node --default-bucket`, receives `GARAGE_DEFAULT_ACCESS_KEY`, `GARAGE_DEFAULT_SECRET_KEY`, and `GARAGE_DEFAULT_BUCKET` from `.env`, and stores metadata/data in named volumes. It does not enable website/public bucket access.

Compose must satisfy all of the following:

- Web publishes `8080:4173` and Gateway publishes `3000:3000`.
- No other service has `ports:`.
- All components join one internal application network; only Web/Gateway are host-reachable.
- PostgreSQL mounts `infra/postgres/init` read-only and receives three service password variables.
- Identity gets only its own `DATABASE_URL`.
- Lost-and-Found gets only its own `DATABASE_URL` and Garage endpoint/bucket/key/secret.
- Matching gets only its own `DATABASE_URL` and optional internal AI URL; it gets no Garage variables.
- AI gets no PostgreSQL, RabbitMQ, or Garage variable.
- RabbitMQ is healthchecked with `rabbitmq-diagnostics -q ping`.
- PostgreSQL is healthchecked with `pg_isready`.
- Garage is healthchecked with `/garage status`.
- Stateful services use `depends_on.condition: service_healthy` for their mandatory dependencies.
- Matching does not depend on AI being healthy.

- [ ] **Step 5: Validate Compose without starting containers**

Run: `Copy-Item -LiteralPath .env.example -Destination .env`

Replace every `example_only_...` value in the local `.env` with non-committed local values. Generate the Garage access key in its required `GK`-prefixed format rather than reusing a database or RabbitMQ password.

Run: `docker compose config --quiet`

Expected: exit 0 with no interpolation or schema error.

- [ ] **Step 6: Run architecture and build checks**

Run: `npm run test:architecture`

Run: `docker compose build`

Expected: tests PASS and all six application images build successfully.

- [ ] **Step 7: Confirm no secret file is tracked**

Run: `git check-ignore .env`

Run: `git ls-files .env`

Expected: first command prints `.env`; second command prints nothing.

- [ ] **Step 8: Commit**

```powershell
git add compose.yaml apps/web/Dockerfile services/*/Dockerfile tests/architecture/compose-boundaries.test.mjs package-lock.json
git commit -m "feat: compose LostLink foundation environment"
```

---

### Task 10: Add End-to-End Foundation Verification

**Requirements:** ARCH-001, ARCH-002, ARCH-003, ARCH-004, ARCH-006, OPS-001, OPS-002

**Files:**
- Create: `tests/integration/verify-compose-health.ps1`
- Create: `tests/integration/verify-correlation.ps1`
- Create: `tests/integration/verify-ai-optional.ps1`
- Create: `tests/integration/verify-credential-isolation.ps1`
- Create: `scripts/verify-foundation.ps1`

**Interfaces:**
- Consumes: running Compose environment, health endpoints, PostgreSQL ownership SQL, container environments.
- Produces: one command that returns exit 0 only when all Milestone 1 technical criteria pass.

- [ ] **Step 1: Write the failing verification orchestrator**

```powershell
# scripts/verify-foundation.ps1
$ErrorActionPreference = 'Stop'

npm run test:architecture
npm test --workspaces --if-present
npm run build --workspaces --if-present
docker compose config --quiet
docker compose up -d --build --wait

& tests/integration/verify-compose-health.ps1
& tests/integration/verify-correlation.ps1
& tests/integration/verify-credential-isolation.ps1
& tests/integration/verify-ai-optional.ps1

docker compose exec -T postgres sh -lc 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /checks/001-assert-ownership.sql'
```

Mount `infra/postgres/check` at `/checks:ro` in the PostgreSQL service.

- [ ] **Step 2: Run the orchestrator and confirm missing integration scripts fail**

Run: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/verify-foundation.ps1`

Expected: FAIL at the first missing integration script after the existing unit/build checks.

- [ ] **Step 3: Implement component health verification**

`verify-compose-health.ps1` must:

1. Assert `http://localhost:8080` returns 200 and contains `LostLink`.
2. Assert `http://localhost:3000/health/live` and `/health/ready` return 200.
3. Use `docker compose exec -T <node-service> node -e "fetch(...)"` to assert internal Nest health endpoints.
4. Use `docker compose exec -T ai-inference-service python -c` with `urllib.request.urlopen` to assert both AI health endpoints.
5. Assert `docker compose ps --status running --services` contains exactly all nine Compose services.

Any mismatch throws and makes the script exit non-zero.

- [ ] **Step 4: Implement correlation verification**

```powershell
$provided = Invoke-WebRequest -UseBasicParsing `
  -Uri 'http://localhost:3000/health/live' `
  -Headers @{ 'X-Correlation-Id' = 'lostlink-compose-test' }
if ($provided.Headers['X-Correlation-Id'] -ne 'lostlink-compose-test') {
  throw 'Gateway did not preserve correlation identifier'
}

$generated = Invoke-WebRequest -UseBasicParsing `
  -Uri 'http://localhost:3000/health/live' `
  -Headers @{ 'X-Correlation-Id' = 'invalid value' }
if ($generated.Headers['X-Correlation-Id'] -notmatch '^[0-9a-f-]{36}$') {
  throw 'Gateway did not replace invalid correlation identifier'
}
```

- [ ] **Step 5: Implement credential-isolation verification**

`verify-credential-isolation.ps1` checks container environments, not rendered Compose output:

```powershell
$forbidden = @('api-gateway', 'identity-service', 'matching-service', 'ai-inference-service')
foreach ($service in $forbidden) {
  docker compose exec -T $service sh -lc `
    'test -z "$S3_ACCESS_KEY_ID" && test -z "$S3_SECRET_ACCESS_KEY"'
  if ($LASTEXITCODE -ne 0) {
    throw "$service unexpectedly received Garage credentials"
  }
}

docker compose exec -T lost-found-service sh -lc `
  'test -n "$S3_ACCESS_KEY_ID" && test -n "$S3_SECRET_ACCESS_KEY"'
if ($LASTEXITCODE -ne 0) {
  throw 'Lost-and-Found Service lacks Garage credentials'
}
```

Also assert Gateway/AI receive no `DATABASE_URL` and each stateful service receives exactly one database URL.

- [ ] **Step 6: Implement AI-optional verification with cleanup**

```powershell
try {
  docker compose stop ai-inference-service
  if ($LASTEXITCODE -ne 0) { throw 'Could not stop AI service' }

  docker compose exec -T matching-service node -e `
    "fetch('http://127.0.0.1:3003/health/ready').then(r => { if (!r.ok) process.exit(1) })"
  if ($LASTEXITCODE -ne 0) {
    throw 'Matching readiness incorrectly depends on AI'
  }
}
finally {
  docker compose start ai-inference-service
}
```

Use the actual internal Matching port configured by its validated `PORT`; keep that value consistent in Compose and this script.

- [ ] **Step 7: Run the complete verification from a clean Compose state**

Run: `docker compose down --volumes --remove-orphans`

This is intentionally destructive only to LostLink's named local development volumes. Confirm `docker compose config --volumes` lists only the expected LostLink volumes before running it.

Run: `npm run verify`

Expected: all architecture, workspace, Python, build, Compose, health, correlation, credential, AI-optional, and schema-isolation checks PASS with exit 0.

- [ ] **Step 8: Commit**

```powershell
git add scripts/verify-foundation.ps1 tests/integration compose.yaml
git commit -m "test: verify Milestone 1 foundation"
```

---

### Task 11: Document Operation and Record Evidence for Human Review

**Requirements:** ARCH-001, ARCH-002, ARCH-003, ARCH-004, ARCH-006, OPS-001, OPS-002

**Files:**
- Modify: `README.md`
- Modify: `docs/TRACEABILITY.md`
- Modify: `docs/PROJECT_STATUS.md`

**Interfaces:**
- Consumes: fresh successful output from `npm run verify` and actual repository paths.
- Produces: reproducible onboarding instructions, traceability evidence, and Milestone 1 `READY_FOR_REVIEW` note; no `COMPLETED` status.

- [ ] **Step 1: Write the README verification checklist before editing README**

Create a temporary reviewer checklist in the task notes and require README to contain each exact command:

```powershell
Copy-Item .env.example .env
npm ci
py -3.13 -m venv services/ai-inference-service/.venv
services/ai-inference-service/.venv/Scripts/python.exe -m pip install -r services/ai-inference-service/requirements-dev.txt
docker compose up -d --build --wait
npm run verify
docker compose down
```

README must explain that `.env` values are local secrets, internal services have no host ports, and Milestone 1 contains no business feature.

- [ ] **Step 2: Update traceability with paths and fresh evidence**

For `ARCH-001`, `ARCH-002`, `ARCH-003`, `ARCH-004`, `ARCH-006`, `OPS-001`, and `OPS-002`:

- replace `Pending` implementation evidence with the exact component/configuration paths;
- replace `Pending` test evidence with the exact architecture/integration test paths and the fresh `npm run verify` result;
- set status to `READY_FOR_VERIFICATION`, not `VERIFIED`;
- update the summary counts from 72 `NOT_STARTED` to 65 `NOT_STARTED` and 7 `READY_FOR_VERIFICATION`.

Do not modify any other requirement row.

- [ ] **Step 3: Update the dashboard without claiming human completion**

In `docs/PROJECT_STATUS.md`:

- keep Current Phase as `PLANNING` until the user authorizes a phase transition;
- keep implementation progress evidence-based;
- keep Milestone 1 status `IN_PROGRESS` and place `READY_FOR_REVIEW` in its Notes after technical checks pass;
- list the implemented foundation assets and passing verification factually;
- state that business features remain `NOT_STARTED`;
- make human review/approval the first Next Action.

- [ ] **Step 4: Run final verification and inspect the complete diff**

Run: `npm run verify`

Run: `git diff --check`

Run: `git status --short`

Run: `git diff -- README.md docs/TRACEABILITY.md docs/PROJECT_STATUS.md`

Expected: verification exits 0; diff check exits 0; only intended documentation/evidence changes remain for this task.

- [ ] **Step 5: Commit**

```powershell
git add README.md docs/TRACEABILITY.md docs/PROJECT_STATUS.md
git commit -m "docs: record Milestone 1 verification evidence"
```

- [ ] **Step 6: Stop for human review**

Report the fresh verification commands and results, the commit range for Tasks 1-11, and any remaining uncertainty. Do not mark Milestone 1 `COMPLETED`, do not begin Milestone 2, and do not push unless the user explicitly requests it.
