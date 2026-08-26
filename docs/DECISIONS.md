# LostLink Accepted Architecture Decisions

Accepted decisions in this document are either established by the primary sources or explicitly approved during Planning Baseline review. Unresolved choices belong in `docs/OPEN_QUESTIONS.md`.

## DEC-001 - Use Microservices Architecture

### Status
Accepted

### Decision
LostLink Phase 1 uses genuine independently deployable service boundaries rather than in-process modules labeled as services.

### Rationale
The project aims to isolate workloads/failures and demonstrate service-level ownership while keeping the initial system sustainable for one developer.

### Consequences
Cross-service contracts, independent operation, eventual consistency, and additional reliability work are required.

### Source
- Architecture design, "Goals" and "Phase 1 Architecture"
- Proposal, Sections 5 and 7

## DEC-002 - Make API Gateway the Only Public Backend Entry Point

### Status
Accepted

### Decision
Web Client communicates with backend services only through API Gateway.

### Rationale
The Gateway centralizes routing and edge concerns while internal services remain non-public.

### Consequences
Gateway performs basic token validation, rate limiting, and correlation, but cannot own domain data or business decisions.

### Source
- Architecture design, "API Gateway" and "Security and Privacy"
- Proposal, Section 5

## DEC-003 - Enforce Service-Level Data Ownership

### Status
Accepted

### Decision
Each stateful service owns its domain data and persistence boundary.

### Rationale
Ownership prevents hidden coupling and preserves independent change/deployment boundaries.

### Consequences
Services cannot directly access another service's storage and must obtain cross-domain information through contracts.

### Source
- Architecture design, "Data Ownership"
- Proposal, Sections 5 and 7

## DEC-004 - Use Separate Schemas on One PostgreSQL Server in Phase 1

### Status
Accepted

### Decision
Identity, Lost-and-Found, and Matching use `identity_schema`, `lost_found_schema`, and `matching_schema`, respectively, with separate database users on one PostgreSQL server.

### Rationale
This preserves logical ownership while reducing single-developer operational cost.

### Consequences
Credentials/privileges must prevent cross-schema access; separate physical database servers remain unnecessary in Phase 1.

### Source
- Architecture design, "Data Ownership"
- Proposal, Sections 5 and 6

## DEC-005 - Make Rule-Based Matching the Reliable Core

### Status
Accepted

### Decision
Hard filtering and the fixed baseline Rule Score operate independently of AI.

### Rationale
The core matching path must remain explainable, reproducible, and available during AI failure.

### Consequences
Rule Score breakdown is stored; AI is applied only after candidate reduction; Rule-only evaluation remains mandatory.

### Source
- Architecture design, "Context," "Goals," and "Matching Service"
- Proposal, Sections 2, 3.2, and 7

## DEC-006 - Treat AI as an Optional Enhancement

### Status
Accepted

### Decision
AI supplies optional image/text similarity, reranking, or another explicitly source-supported assistance capability and is never a mandatory workflow dependency.

### Rationale
AI can improve candidate ordering without compromising reliability or turning uncertain inference into a business verdict.

### Consequences
Matching must provide Rule Score fallback, and report/claim/verification/handover workflows continue when AI is unavailable.

### Source
- Architecture design, "AI Inference Service" and "Reliability and Recovery"
- Proposal, Sections 2 and 3.3

## DEC-007 - Keep AI Inference Service Stateless in Phase 1

### Status
Accepted

### Decision
AI Inference Service owns no business workflow state in Phase 1; Matching Service owns stored embeddings, model metadata references, and reproducible scoring records.

### Rationale
A stateless inference boundary is easier to replace, scale, and recover.

### Consequences
AI restarts do not lose domain state, and model/state persistence must not leak into the inference service.

### Source
- Architecture design, "AI Inference Service" and "Key Trade-offs"
- Proposal, Section 5

## DEC-008 - Prohibit AI Ownership Decisions

### Status
Accepted

### Decision
AI cannot approve a claim, determine the owner, or conclusively declare two reports to be the same item.

### Rationale
Ownership requires protected evidence and authorized human verification.

### Consequences
AI output remains advisory and cannot directly change report, claim, verification, or handover state.

### Source
- Architecture design, "AI Inference Service"
- Proposal, Sections 2, 3.3, and 7

## DEC-009 - Isolate Secret Evidence in Lost-and-Found Service

### Status
Accepted

### Decision
Secret characteristics, secret ownership evidence, and claim evidence remain inside Lost-and-Found Service and are excluded from matching events and AI inputs.

### Rationale
The evidence is the basis for human verification and would be compromised if publicly exposed or used by candidate scoring.

### Consequences
Matching operates on approved public attributes; evidence access is authorized and audited by Lost-and-Found Service.

### Source
- Architecture design, "Lost-and-Found Service" and "Security and Privacy"
- Proposal, Sections 2, 3, and 5

## DEC-010 - Use an Event-Driven Matching Workflow

### Status
Accepted

### Decision
`ReportActivated`, `MatchFound`, and `ReportResolved` decouple report lifecycle from background matching and notification-related work.

### Rationale
Report activation and resolution must remain authoritative even when Matching or AI is unavailable.

### Consequences
Consumers require idempotency, aggregate-version handling, retries, and eventual-consistency awareness.

### Source
- Architecture design, "Communication Model" and "Main Workflow"
- Proposal, Sections 3.1 and 5

## DEC-011 - Keep Claim, Verification, and Handover in Lost-and-Found Service in Phase 1

### Status
Accepted

### Decision
Claim, secret evidence, verification, handover, dispute, and Phase 1 notification remain one Lost-and-Found Service boundary.

### Rationale
The most sensitive workflow can complete without a distributed transaction or fragmented ownership.

### Consequences
No standalone Moderation, Notification, Handover, or Dispute service is created in Phase 1.

### Source
- Architecture design, "Lost-and-Found Service," "Main Workflow," and "Key Trade-offs"
- Proposal, Sections 5 and 6

## DEC-012 - Do Not Split Services Without a Real Boundary

### Status
Accepted

### Decision
A service is extracted only for a clear data boundary, independent deployment need, distinct workload, or materially different operational responsibility.

### Rationale
Increasing service count without an ownership or operational reason adds complexity without improving the design.

### Consequences
Future service proposals are architecture changes and require explicit review against the extraction criteria.

### Source
- Architecture design, "Evolution Roadmap"
- Proposal, Sections 6 and 7

## DEC-013 - Run the Full Phase 1 Environment with Docker Compose

### Status
Accepted

### Decision
The complete local Phase 1 environment is expected to start through one Docker Compose command.

### Rationale
Local operation must remain practical while preserving independently running service processes.

### Consequences
Every required service and infrastructure dependency must be represented in the future Compose environment; the exact technology stack remains unresolved.

### Source
- Architecture design, "Development and Deployment" and "Testing and Verification"

## DEC-014 - Use a Monorepo with Independent Service Projects

### Status
Accepted

### Decision
LostLink shall use one Git repository. Web Client, API Gateway, Identity Service, Lost-and-Found Service, Matching Service, and AI Inference Service shall each remain a separate project with an independent process, start/build boundary, container, and deployment lifecycle.

### Rationale
A monorepo minimizes coordination and local-development overhead for one developer while keeping the independently deployable service boundaries required by the architecture.

### Consequences
Repository proximity does not permit services to share entities, repositories, domain implementations, or business logic. Any shared package remains limited to suitable versioned contracts. Exact directory names and monorepo tooling are implementation-planning details and are not decided here.

### Source
- Planning Baseline review, `Q-038`
- ARCH-002 and ARCH-006

## DEC-015 - Use TypeScript for the Web and Core Backend, and Python for AI Inference

### Status
Accepted

### Decision
Web Client shall use React, TypeScript, and Vite. API Gateway, Identity Service, Lost-and-Found Service, and Matching Service shall use Node.js, TypeScript, and NestJS. AI Inference Service shall use Python and FastAPI.

### Rationale
The TypeScript-first core provides consistent backend structure and testing conventions while remaining practical for one developer. Python is isolated to the stateless AI boundary, where its inference ecosystem is useful without making the core workflow depend on it.

### Consequences
The project operates two runtimes. Matching Service retains Rule-based filtering, scoring, result persistence, and AI orchestration in Node.js; Python performs optional inference only. Exact runtime/framework versions, package managers, and AI libraries remain undecided.

### Source
- Planning Baseline review, `Q-039`
- DEC-005 through DEC-008

## DEC-016 - Use RabbitMQ and Garage in Phase 1

### Status
Accepted

### Decision
RabbitMQ shall implement the Phase 1 Message Broker, and Garage shall provide the local S3-compatible Object Storage implementation.

### Rationale
RabbitMQ supports the project's limited event set, acknowledgements, retry routing, and Dead-letter Queue direction without Kafka-level operational overhead. Garage provides lightweight, self-hosted S3-compatible object storage suitable for the single-node local Phase 1 environment. The primary sources require Object Storage but do not prescribe a product, so replacing the earlier object-storage selection does not change a product requirement or service boundary.

### Consequences
Application-level Outbox, idempotency, aggregate-version handling, and the minimum Phase 1 DLQ/replay boundary remain governed by their separate requirements and open decisions. Garage buckets shall not be public by default. Only Lost-and-Found Service receives Garage credentials and controls object metadata and approved access references. LostLink shall use the S3-compatible interface without depending on unsupported or unnecessary object ACL features.

### Source
- Planning Baseline review, `Q-040`
- Approved Milestone 1 foundation design, 2026-08-26
- ARCH-005, ARCH-006, EVENT-001 through EVENT-005, and SEC-004

## DEC-017 - Supply Local Configuration Through Environment Variables

### Status
Accepted

### Decision
Docker Compose shall supply local configuration through environment variables. The repository shall contain a non-secret `.env.example`; the real `.env` shall remain outside Git. Each service shall receive only the configuration and credentials it requires.

### Rationale
This convention provides a lightweight and documented local setup without introducing a production secret-management platform during Phase 1 planning.

### Consequences
Services must fail clearly when required configuration is missing. Real credentials must not be committed. Local `.env` values remain developer-machine secrets, and a production-grade secret manager is deferred until a production-like environment requires it. Exact variable names and secret-generation workflow remain implementation-planning details.

### Source
- Planning Baseline review, `Q-037`
- OPS-001, OPS-002, SEC-002, and DEC-013

## DEC-018 - Standardize the Milestone 1 Foundation Toolchain

### Status
Accepted

### Decision
Milestone 1 shall use npm workspaces without Turborepo; stable pinned Node.js 24 LTS, NestJS 11, React 19.2, Vite 8, Python 3.13, FastAPI, Prisma 7 GA, PostgreSQL 18, RabbitMQ 4.3, Garage 2.3, and Docker Compose. JavaScript dependencies shall be locked by `package-lock.json`; Python dependencies shall be exact-pinned in `requirements.txt`; container images shall use explicit non-floating tags.

NestJS configuration shall use `@nestjs/config` with Joi validation; FastAPI configuration shall use Pydantic Settings. NestJS tests shall use Jest and Supertest, Web Client tests shall use Vitest and React Testing Library, and FastAPI tests shall use pytest and TestClient. HTTP services shall expose separate liveness and readiness endpoints and document only implemented endpoints with OpenAPI.

### Rationale
The selected versions and tools provide a stable, student-approachable foundation while preserving the approved microservice boundaries. Pinning makes the local environment reproducible, and the narrow Milestone 1 toolset avoids premature orchestration or observability complexity.

### Consequences
Each service remains an independent project and process even though Node.js projects share an npm workspace. AI Inference Service remains a separate Python project. Patch versions are verified before scaffolding and then recorded in lockfiles, exact Python requirements, and explicit container tags. Milestone 1 provides health, configuration, structured logging, OpenAPI, and smoke-test foundations only; it does not add domain endpoints or business logic.

### Source
- Approved Milestone 1 foundation design, 2026-08-26
- DEC-013 through DEC-017
- ARCH-002, ARCH-003, ARCH-004, ARCH-006, OPS-001, and OPS-002
