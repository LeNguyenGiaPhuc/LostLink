# LostLink Phase 1 Technology Stack

## Purpose and Authority

This document records technology choices explicitly approved during Planning Baseline review. It does not change product requirements, service ownership, security boundaries, or the Phase 1 architecture.

If this document conflicts with the original source documents, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/SERVICE_BOUNDARIES.md`, or an accepted decision in `docs/DECISIONS.md`, the higher-authority document takes precedence.

## Approved Technology Stack

| Component or Concern | Approved Choice | Planning Boundary |
| --- | --- | --- |
| Repository model | Monorepo | Each component remains a separate project and independently runnable/deployable process. |
| Web Client | React 19.2, TypeScript, Vite 8 | Responsive client; all backend access goes through API Gateway. |
| API Gateway | Node.js 24 LTS, TypeScript, NestJS 11 | Routing and edge controls only; no domain data or business decisions. |
| Identity Service | Node.js 24 LTS, TypeScript, NestJS 11 | Owns identity, authentication, tokens, roles, and `identity_schema`. |
| Lost-and-Found Service | Node.js 24 LTS, TypeScript, NestJS 11 | Owns reports, moderation, claims, protected evidence, verification, handover, disputes, notifications, and `lost_found_schema`. |
| Matching Service | Node.js 24 LTS, TypeScript, NestJS 11 | Owns ACTIVE-report read model, Rule Score, ranking, match history, AI integration, and `matching_schema`. |
| AI Inference Service | Python 3.13, FastAPI | Stateless and optional; inference signals only, with no ownership decision or business persistence. |
| ORM and migration | Prisma 7 GA | Identity, Lost-and-Found, and Matching each keep an independent Prisma schema, configuration, and migration history. |
| Relational database | PostgreSQL 18 | One Phase 1 server with service-owned schemas and database users, as established by `DEC-004`. |
| Message Broker | RabbitMQ 4.3 | Carries the three Phase 1 domain events; it does not replace application-level idempotency or reliability design. |
| Object Storage | Garage 2.3 | Single-node local S3-compatible storage; only Lost-and-Found Service receives credentials and controls metadata/access. |
| Local orchestration | Docker Compose | The complete Phase 1 environment must start through one documented Compose command, as established by `DEC-013`. |
| Local configuration | Environment variables | Commit `.env.example` without real secrets; keep the real `.env` outside Git. |

## Verified Initial Versions

The following stable versions were verified against official release channels or package registries on 2026-08-26. Implementation shall pin these exact starting versions unless a newer compatible patch is explicitly reviewed before scaffolding.

| Technology | Initial Version |
| --- | --- |
| Node.js | 24.19.0 |
| npm | 11.17.0 |
| NestJS core packages | 11.2.3 |
| React / React DOM | 19.2.8 |
| Vite | 8.2.2 |
| TypeScript | 5.9.3 |
| Python | 3.13.15 |
| FastAPI | 0.141.1 |
| Prisma / Prisma Client | 7.10.0 |
| PostgreSQL | 18.6 |
| RabbitMQ | 4.3.5 |
| Garage | 2.3.0 |

## Runtime Allocation

- Node.js and TypeScript are the default runtime and language for Gateway and core backend domain services.
- Python is isolated to AI Inference Service because that service is stateless, optional, and replaceable.
- Rule-based candidate filtering, Rule Score, match-result persistence, and candidate ranking ownership remain in Matching Service, not AI Inference Service.
- An AI timeout or outage must not stop Rule-based matching or any report, claim, verification, or handover workflow.

## Repository and Dependency Rules

- Monorepo location does not turn the services into one deployable process.
- Each service requires its own start/build boundary, configuration, health endpoint, container, and deployment lifecycle.
- Stateful services use only their owned schemas and database credentials.
- Services must not share entities, repositories, domain model implementations, or business logic.
- A shared package, if later approved, may contain suitable versioned contracts only.
- Root JavaScript projects use npm workspaces without Turborepo; AI Inference Service remains outside the npm workspace as an independent Python project.
- JavaScript dependencies are exact-resolved by `package-lock.json`; Python dependencies are exact-pinned in `requirements.txt`; container images use explicit non-floating tags.

## Messaging and Storage Rules

- RabbitMQ transports `ReportActivated`, `MatchFound`, and `ReportResolved`.
- Broker selection does not resolve `Q-015` or `Q-016`; the minimum Phase 1 Outbox/DLQ behavior and event ordering/version-gap rules still require decisions before their event milestone.
- Garage buckets must not expose protected original media publicly by default.
- Only Lost-and-Found Service receives Garage credentials; other services access only approved data through documented APIs/events or approved references.
- Lost-and-Found Service owns object metadata and access decisions.
- Matching Service and AI Inference Service receive only approved attributes or time-bounded references; they never receive secret ownership or claim evidence.

## Framework and Testing Conventions

- NestJS configuration uses `@nestjs/config` with Joi validation and fails fast for invalid mandatory configuration.
- FastAPI configuration uses Pydantic Settings and fails fast for invalid mandatory configuration.
- NestJS tests use Jest and Supertest.
- Web Client tests use Vitest and React Testing Library.
- FastAPI tests use pytest and TestClient.
- HTTP services expose `GET /health/live` and `GET /health/ready`.
- HTTP services document implemented endpoints with OpenAPI; Milestone 1 does not invent domain endpoints.
- Milestone 1 observability uses structured JSON console logs and `X-Correlation-Id`, without a full metrics, tracing, or log-aggregation stack.

## Local Configuration Rules

- `.env.example` documents required variable names but contains no real credentials.
- `.env` contains developer-local values and must be excluded from Git.
- Docker Compose supplies only the required values to each component.
- A service must report missing mandatory configuration clearly rather than starting with an unsafe implicit value.
- A production secret manager is not selected by this Phase 1 local-development decision.

## Intentionally Undecided

The following choices remain open until their relevant milestone or feature:

- authentication/token and internal service-credential mechanisms;
- exact API conventions and event serialization/envelope implementation;
- minimum Phase 1 Outbox, retry, Dead-letter Queue, and replay behavior;
- AI capabilities included in Phase 1, AI model, inference libraries, score-combination rules, and evaluation targets;
- production deployment platform and production secret-management solution.

These items must remain `NEEDS_DECISION` until approved. Technology convenience must not silently alter the accepted LostLink architecture.

## Related Decisions

- `DEC-004` - Separate schemas on one PostgreSQL server.
- `DEC-013` - Full Phase 1 environment through Docker Compose.
- `DEC-014` - Monorepo with independent service projects.
- `DEC-015` - TypeScript core backend with Python AI inference.
- `DEC-016` - RabbitMQ and Garage.
- `DEC-017` - Environment-variable-based local configuration.
- `DEC-018` - Milestone 1 foundation toolchain and conventions.
