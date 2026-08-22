# LostLink Microservices Architecture Design

## Context

LostLink is a personal, long-term web project for managing lost-and-found items in a university campus. The product standardizes reporting, moderation, matching, ownership claims, verification, and handover. Rule-based matching remains the reliable core; AI improves image and semantic similarity but never determines ownership.

The project has no fixed academic deadline. Development will therefore proceed in phases, while the first phase remains deliberately small enough for one developer to build, operate, and understand.

## Goals

- Demonstrate genuine microservice boundaries rather than renaming in-process modules as services.
- Allow matching and AI workloads to fail or scale without blocking report, claim, and handover workflows.
- Preserve service-level data ownership while keeping local operation practical.
- Support both synchronous requests and asynchronous domain events.
- Keep AI optional and provide a rule-based fallback.
- Provide a foundation that can later support multiple campuses or organizations.

## Non-goals for Phase 1

- Kubernetes or automatic horizontal scaling.
- Complex service discovery.
- Separate physical database servers for every service.
- Distributed transactions or a general-purpose Saga framework.
- A standalone Notification, Moderation, Handover, or Dispute service.
- Full production-grade distributed tracing.
- Payments, delivery, blockchain, face recognition, or a free-form chatbot.

## Phase 1 Architecture

The system contains one Web Client, one API Gateway, and four independently deployable backend services.

### API Gateway

- Provides the only public API entry point for the Web Client.
- Routes requests to the appropriate service.
- Performs basic token validation, request correlation, and rate limiting.
- Does not own domain data or business decisions.

### Identity Service

- Owns accounts, authentication, token issuance, profile identity, and roles.
- Supports the User, Staff, and Admin roles.
- Owns the `identity_schema` schema.

### Lost-and-Found Service

- Owns lost and found reports, moderation, claims, secret ownership evidence, verification, handover, disputes, and user notifications in Phase 1.
- Enforces report and claim state transitions.
- Keeps secret evidence out of public matching events and AI inputs.
- Owns the `lost_found_schema` schema.

### Matching Service

- Maintains a minimal read model of active public reports from domain events.
- Filters candidates by report type, item category, time window, and location range.
- Calculates Rule Score, optionally requests AI similarity, ranks candidates, and stores score breakdowns.
- Emits match result events without deciding ownership.
- Owns the `matching_schema` schema.

### AI Inference Service

- Computes image and text similarity scores.
- Has no access to secret ownership evidence.
- Does not approve claims or declare two reports to be the same item.
- Is replaceable and optional; Matching Service falls back to Rule Score on timeout or failure.
- Remains stateless in Phase 1; model metadata and stored embeddings are owned by Matching Service.

## Data Ownership

Phase 1 uses one PostgreSQL server for operational simplicity. Each stateful service owns a separate schema and database user. A service may not read or write another service's schema. Cross-service information is obtained through an API contract or a domain event.

Images are stored in object storage. Lost-and-Found Service owns image metadata and access rules. Events and matching requests use approved references rather than direct filesystem paths.

## Communication Model

### Synchronous REST

REST is used when the caller needs an immediate result, including login, report creation, report retrieval, claim submission, claim review, and reading match results. The Web Client calls services only through the API Gateway.

### Asynchronous Events

A message broker carries background workflow events:

- `ReportActivated`: published after a report is committed as active.
- `MatchFound`: published after Matching Service stores ranked candidates.
- `ReportResolved`: published after handover is completed or a report is otherwise closed.

Events contain an `eventId`, event type, aggregate identifier, version, timestamp, and only the public data required by the consumer. Secret evidence is never included.

## Main Workflow

1. A user creates a lost or found report through the API Gateway.
2. Lost-and-Found Service validates and stores the report.
3. Staff moderates the report. When it becomes active, Lost-and-Found Service publishes `ReportActivated`.
4. Matching Service consumes the event, updates its active-report read model, filters candidates, and calculates Rule Score.
5. Matching Service requests optional image or text similarity from AI Inference Service with a strict timeout.
6. Matching Service stores the score breakdown and publishes `MatchFound`.
7. Lost-and-Found Service consumes `MatchFound` and creates a notification for the user.
8. The user submits a claim. Verification, approval, scheduling, OTP or QR confirmation, and handover stay inside Lost-and-Found Service.
9. After handover, Lost-and-Found Service publishes `ReportResolved`; Matching Service removes or deactivates affected candidates.

Keeping claim and handover in one service avoids a distributed transaction in the most sensitive workflow.

## Reliability and Recovery

- AI timeout or error: use Rule Score and record that AI was unavailable.
- Matching failure: keep the report active and retry the matching job; report creation remains successful.
- Duplicate delivery: consumers store processed `eventId` values and handle events idempotently.
- Broker outage: producers persist pending events with business changes and publish them later through an outbox process.
- Repeated processing failure: move the message to a dead-letter queue for inspection and replay.
- Stale events: compare aggregate version before updating the consumer read model.
- Cross-service request failure: apply bounded retries only to safe operations; return a clear temporary-unavailable response for unsafe operations.

Every inbound request and emitted event carries a correlation identifier so logs can be followed across services.

## Security and Privacy

- Only API Gateway is publicly reachable; service endpoints are internal.
- Gateway validates tokens, while each service independently checks authorization for sensitive actions.
- Services use explicit internal credentials for service-to-service requests.
- Secret item characteristics and claim evidence remain in Lost-and-Found Service.
- Matching and AI receive only public or deliberately approved attributes.
- Important actions such as viewing evidence, changing claim status, and confirming handover are audited.
- Rate limits apply to login, claim creation, evidence attempts, and OTP verification.

## Development and Deployment

The complete Phase 1 environment runs locally through one Docker Compose command. Each service has its own process, configuration, health endpoint, migration lifecycle, and deployable image. The shared PostgreSQL server, message broker, and object storage are infrastructure dependencies, not shared application code.

Common event contracts may be kept in a small versioned package, but services must not share entities, repositories, or domain logic.

## Testing and Verification

- Unit tests for state transitions, authorization, candidate filtering, score calculation, and fallback behavior.
- Integration tests for each service's API and owned schema.
- Contract tests for Gateway routes, internal REST calls, and event payloads.
- Event tests for `ReportActivated`, `MatchFound`, and `ReportResolved`.
- End-to-end test for report creation, moderation, matching, claim, verification, and handover.
- Failure tests with AI unavailable, duplicated events, delayed events, broker interruption, and retry exhaustion.
- Matching evaluation comparing Rule-only and Rule-plus-AI using Recall@1, Recall@5, and Mean Reciprocal Rank.

Phase 1 is accepted when:

- Each service starts and can be deployed independently.
- Each stateful service accesses only its owned schema.
- Services communicate only through documented APIs and events.
- Matching failure does not lose or invalidate an active report.
- AI failure does not prevent Rule-based matching.
- Duplicate events do not create duplicate matches or notifications.
- The complete workflow passes end-to-end through the API Gateway.
- The full environment starts with one Docker Compose command.

## Evolution Roadmap

### Phase 2: Operational Separation

- Extract Notification Service when notification volume or delivery channels justify independent scaling.
- Extract Moderation Service when moderation rules and queues become substantial.
- Add production-ready outbox processing, dead-letter replay tools, metrics, centralized logs, and distributed tracing.
- Improve matching, feedback collection, and model version tracking.

### Phase 3: Multi-organization Scale

- Support multiple campuses or organizations with explicit tenant boundaries.
- Extract Handover or Dispute Service only if their workflows require separate ownership or release cycles.
- Add automated deployment, service-level scaling, model registry, controlled retraining, and operational analytics.

The architecture will not split a service merely to increase the service count. Extraction requires a clear data boundary, independent deployment need, distinct workload, or materially different operational responsibility.

## Key Trade-offs

- Separate schemas preserve ownership but require replicated read models and eventual consistency.
- A message broker improves resilience and decoupling but adds retries, idempotency, outbox, and operational work.
- Keeping claims and handover together reduces architectural purity but avoids a distributed transaction in a high-risk workflow.
- A stateless AI service is easier to replace, while Matching Service remains responsible for reproducible scoring records and model-version references.
- Phased extraction delays some service independence, but it keeps the project sustainable for one developer.
