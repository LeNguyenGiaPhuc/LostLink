# LostLink Phase 1 Technology Stack

## Purpose and Authority

This document records technology choices explicitly approved during Planning Baseline review. It does not change product requirements, service ownership, security boundaries, or the Phase 1 architecture.

If this document conflicts with the original source documents, `docs/REQUIREMENTS.md`, `docs/ARCHITECTURE.md`, `docs/SERVICE_BOUNDARIES.md`, or an accepted decision in `docs/DECISIONS.md`, the higher-authority document takes precedence.

## Approved Technology Stack

| Component or Concern | Approved Choice | Planning Boundary |
| --- | --- | --- |
| Repository model | Monorepo | Each component remains a separate project and independently runnable/deployable process. |
| Web Client | React, TypeScript, Vite | Responsive client; all backend access goes through API Gateway. |
| API Gateway | Node.js, TypeScript, NestJS | Routing and edge controls only; no domain data or business decisions. |
| Identity Service | Node.js, TypeScript, NestJS | Owns identity, authentication, tokens, roles, and `identity_schema`. |
| Lost-and-Found Service | Node.js, TypeScript, NestJS | Owns reports, moderation, claims, protected evidence, verification, handover, disputes, notifications, and `lost_found_schema`. |
| Matching Service | Node.js, TypeScript, NestJS | Owns ACTIVE-report read model, Rule Score, ranking, match history, AI integration, and `matching_schema`. |
| AI Inference Service | Python, FastAPI | Stateless and optional; inference signals only, with no ownership decision or business persistence. |
| Relational database | PostgreSQL | One Phase 1 server with service-owned schemas and database users, as established by `DEC-004`. |
| Message Broker | RabbitMQ | Carries the three Phase 1 domain events; it does not replace application-level idempotency or reliability design. |
| Object Storage | MinIO | Local S3-compatible storage; Lost-and-Found Service controls metadata and access. |
| Local orchestration | Docker Compose | The complete Phase 1 environment must start through one documented Compose command, as established by `DEC-013`. |
| Local configuration | Environment variables | Commit `.env.example` without real secrets; keep the real `.env` outside Git. |

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
- Exact directory names, workspace tooling, and package-manager strategy remain implementation-planning details.

## Messaging and Storage Rules

- RabbitMQ transports `ReportActivated`, `MatchFound`, and `ReportResolved`.
- Broker selection does not resolve `Q-015` or `Q-016`; the minimum Phase 1 Outbox/DLQ behavior and event ordering/version-gap rules still require decisions before their event milestone.
- MinIO buckets must not expose protected original media publicly by default.
- Lost-and-Found Service owns object metadata and access decisions.
- Matching Service and AI Inference Service receive only approved attributes or time-bounded references; they never receive secret ownership or claim evidence.

## Local Configuration Rules

- `.env.example` documents required variable names but contains no real credentials.
- `.env` contains developer-local values and must be excluded from Git.
- Docker Compose supplies only the required values to each component.
- A service must report missing mandatory configuration clearly rather than starting with an unsafe implicit value.
- A production secret manager is not selected by this Phase 1 local-development decision.

## Intentionally Undecided

The following choices remain open until their relevant milestone or feature:

- exact Node.js, Python, framework, PostgreSQL, RabbitMQ, and MinIO versions;
- JavaScript package manager and monorepo workspace tool;
- ORM, migration, validation, API-documentation, and testing libraries;
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
- `DEC-016` - RabbitMQ and MinIO.
- `DEC-017` - Environment-variable-based local configuration.
