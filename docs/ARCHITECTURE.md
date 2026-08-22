# LostLink Phase 1 Architecture Reference

**Source documents have higher authority than this summary.**

Primary sources:

- `docs/source/LostLink_Microservices.docx`
- `docs/source/2026-08-23-lostlink-microservices-design.md`

This document is a compact coding reference. It does not add requirements or replace the source documents and `docs/REQUIREMENTS.md`.

## 1. System Overview

LostLink is a microservices-based Lost & Found management platform for an initial single-campus context. Its core workflow is:

`Report -> Moderation -> Matching -> Claim -> Verification -> Handover -> Resolution/Audit`

Rule-based matching is the reliable core. AI supplies optional image/text similarity or another source-supported assistive signal; it never determines ownership and is not required for the workflow to complete.

## 2. Phase 1 Components

| Component | Phase 1 role |
| --- | --- |
| Web Client | Responsive interface for User, Staff, and Admin. |
| API Gateway | Only public backend entry point; routing, basic token validation, rate limiting, correlation identifier. |
| Identity Service | Account, authentication, token issuance, profile identity, roles. |
| Lost-and-Found Service | Reports, moderation, claims, secret evidence, verification, handover, disputes, notifications, business audit. |
| Matching Service | ACTIVE-report read model, filtering, Rule Score, ranking, match history, score breakdown, AI integration. |
| AI Inference Service | Stateless optional image/text inference; no business state or ownership decision. |
| Message Broker | Background delivery of the three Phase 1 domain events. |
| PostgreSQL | One server; separate owned schemas and users for stateful services. |
| Object Storage | Report images; metadata and access rules controlled by Lost-and-Found Service. |
| Audit / Observability | Logs, correlation, operational metrics, and alerts at Phase 1 scope. |

## 3. Service Responsibilities

- **API Gateway:** route public requests; perform basic token validation, rate limiting, and correlation. It owns no domain data or decision.
- **Identity Service:** own identity/authentication and `identity_schema`.
- **Lost-and-Found Service:** own the end-to-end report/claim/verification/handover workflow, protected evidence, Phase 1 notifications, and `lost_found_schema`.
- **Matching Service:** own public ACTIVE-report projection, candidate processing, scoring records, result history, AI integration, and `matching_schema`.
- **AI Inference Service:** return optional similarity or source-supported draft signals; remain stateless and replaceable.

Detailed constraints are in `docs/SERVICE_BOUNDARIES.md`.

## 4. Communication Model

- Web Client calls backend capabilities only through API Gateway.
- Synchronous REST supports immediate-result use cases such as authentication, report commands/queries, claim submission/review, and match-result reading.
- Message Broker carries `ReportActivated`, `MatchFound`, and `ReportResolved`.
- Cross-service information uses a documented API or event contract, never direct cross-schema access.
- Shared packages may contain versioned contracts only, not entities, repositories, domain models, or business logic.

Concrete protocols, broker technology, topics, API paths, and serialization formats are `NEEDS_DECISION`.

## 5. Data Ownership

Phase 1 uses one PostgreSQL server for operational simplicity:

- Identity Service -> `identity_schema` and its own database user.
- Lost-and-Found Service -> `lost_found_schema` and its own database user.
- Matching Service -> `matching_schema` and its own database user.
- AI Inference Service -> no business persistence in Phase 1.

Each service can read/write only its own schema. Lost-and-Found Service controls object-storage metadata and image-access rules. Matching and AI receive approved attributes or references, not unrestricted storage paths or protected evidence.

## 6. Main Workflow

1. User creates a Lost Report, or Staff registers a Found Report received at the counter.
2. Lost-and-Found Service validates and stores public, private, and secret data within its boundary.
3. Staff moderates the report. Once ACTIVE is committed, Lost-and-Found Service publishes `ReportActivated`.
4. Matching Service updates its read model, hard-filters candidates, calculates the fixed baseline Rule Score, and optionally requests AI similarity for the reduced set.
5. Matching Service stores score breakdown and ranked results, then publishes `MatchFound`.
6. Lost-and-Found Service may notify the user. A user submits a Direct Claim or a claim from a match result.
7. Staff reviews private evidence, requests more information if needed, and performs direct verification.
8. After approval, Staff schedules pickup and confirms handover with a time-limited QR or OTP mechanism.
9. Lost-and-Found Service completes the claim, resolves the report, records audit history, and publishes `ReportResolved`.
10. Matching Service deactivates affected candidates.

## 7. AI Boundary

AI may support image similarity, semantic text similarity, candidate reranking, and the optional source-supported draft-description suggestion. It shall not:

- approve or reject a claim;
- determine ownership;
- state conclusively that two reports represent the same item;
- receive secret characteristics or claim evidence;
- become a mandatory dependency of report, matching, claim, verification, or handover workflows.

On AI timeout or error, Matching Service uses Rule Score and records AI unavailability.

## 8. Security Boundary

- API Gateway is the only public backend entry point.
- Gateway performs basic token validation; owner services authorize sensitive actions.
- Internal service requests use explicit internal credentials.
- Secret characteristics and claim evidence remain in Lost-and-Found Service.
- Exact storage location and private contact data are not public.
- Matching and AI receive only public or deliberately approved data.
- Evidence access, moderation, claim decisions, verification, handover, and sensitive administration are auditable.
- Login, claim creation, evidence attempts, and OTP verification are rate-limited.

## 9. Reliability Model

- **AI failure:** Rule Score fallback; core workflow continues.
- **Matching failure:** report remains ACTIVE; matching can retry.
- **Duplicate event:** durable idempotency prevents duplicate results, notifications, or transitions.
- **Broker outage:** Outbox direction decouples business commit from broker availability.
- **Repeated failure:** Dead-letter Queue and controlled replay direction.
- **Stale event:** aggregate version protects newer state.
- **Synchronous failure:** retries are bounded and only used for safe operations.

`NEEDS_DECISION`: the sources establish Outbox and DLQ behavior but place production-ready processing/replay tooling in Phase 2. The minimum Phase 1 completion boundary must be decided before implementation.

## 10. Phase 1 Non-goals

Phase 1 does not include:

- standalone Notification, Moderation, Handover, or Dispute services;
- Kubernetes, complex service discovery, or automatic horizontal scaling;
- a general-purpose Saga framework or distributed transactions;
- separate physical database servers per service;
- full production-grade distributed tracing;
- payments, delivery/shipping, blockchain, face recognition, real-time location tracking, or a free-form chatbot;
- native mobile applications, SMS, call-center, or social-network integrations.

## 11. Evolution Principles

- Complete and stabilize the core workflow before extracting more services.
- Extract a service only for a clear business/data boundary, independent workload, deployment need, or operational responsibility.
- Complete operational tooling in Phase 2 without rewriting service ownership.
- Add multi-campus/organization boundaries in Phase 3.
- Keep AI replaceable and preserve reproducible matching records in Matching Service.
- Run the complete local Phase 1 environment through one Docker Compose command once implementation begins.
