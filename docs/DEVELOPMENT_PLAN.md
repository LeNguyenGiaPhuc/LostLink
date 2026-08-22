# LostLink Phase 1 Development Plan

This is a dependency-ordered roadmap, not a schedule. It assumes unresolved decisions in `docs/OPEN_QUESTIONS.md` are resolved only when they become blocking. No application implementation is performed by this document.

## Milestone 1 - Executable Service and Infrastructure Foundation

### Objective

Establish the independently runnable Phase 1 component boundaries and local environment without implementing business workflows.

### Requirements Covered

- ARCH-001, ARCH-002, ARCH-003, ARCH-004, ARCH-006
- OPS-001, OPS-002

### Components Involved

- Web Client, API Gateway, Identity Service, Lost-and-Found Service, Matching Service, AI Inference Service.
- PostgreSQL, Message Broker, Object Storage, Audit/Observability baseline.

### Dependencies

- Technology-stack, repository-layout, configuration, broker, object-storage, and local-secret decisions.
- Source documents and accepted architecture decisions.

### Expected Deliverables

- Independently runnable component processes with health checks.
- One PostgreSQL server with owned schemas/users and no cross-schema grants.
- Local Docker Compose environment representing every Phase 1 component.
- Versioned contract-only shared package boundary if a shared package is used.

### Verification / Completion Criteria

- Each service can start and stop independently.
- One documented Docker Compose command starts the full local environment.
- Each stateful service can access only its own schema.
- No shared entity, repository, domain implementation, or business logic exists.

### Risks / Notes

- Do not choose frameworks or broker/object-storage implementations until the relevant open questions are approved.
- Keep this milestone infrastructure-only; no invented domain endpoints.

## Milestone 2 - Identity, Gateway, and Edge Security

### Objective

Provide authenticated access through the sole public entry point and establish role/security boundaries.

### Requirements Covered

- AUTH-001, AUTH-002, AUTH-003
- USER-001
- SEC-001, SEC-002, SEC-005
- AUDIT-002

### Components Involved

- Web Client, API Gateway, Identity Service, Audit/Observability infrastructure.

### Dependencies

- Milestone 1.
- Authentication/token, internal-credential, role-assignment, and rate-limit decisions.

### Expected Deliverables

- Authentication and profile contracts through Gateway.
- User/Staff/Admin role representation.
- Gateway routing, basic token validation, rate-limit hooks, and correlation propagation.
- Identity-owned persistence only in `identity_schema`.

### Verification / Completion Criteria

- Web Client has no supported direct route to internal services.
- Valid credentials produce a token; invalid credentials do not.
- Owner services can reject an action even after Gateway token validation.
- Login rate limiting and cross-service correlation behavior are verified.

### Risks / Notes

- Gateway must not absorb authorization/business logic.
- Token and internal-credential mechanisms are blocking decisions.

## Milestone 3 - Reports, Moderation, Privacy, and Object Storage

### Objective

Implement the authoritative report intake/moderation workflow and protected-data boundary before matching.

### Requirements Covered

- REPORT-001 through REPORT-006
- MOD-001 through MOD-003
- SEC-003, SEC-004, SEC-006
- AUDIT-001

### Components Involved

- Web Client, API Gateway, Lost-and-Found Service, Identity Service, PostgreSQL, Object Storage, Audit/Observability.

### Dependencies

- Milestones 1-2.
- Decisions for minimum fields, public/private/secret classification, report branch transitions, moderation rules, media access, and retention.

### Expected Deliverables

- Lost Report creation and Staff Found Report registration.
- Public masked Found Report views and owner/staff views.
- Report state-machine enforcement and moderation actions.
- Secret evidence isolation and controlled image metadata/access.
- Sensitive-action audit.

### Verification / Completion Criteria

- A report cannot become ACTIVE without moderation.
- Public views contain no secret evidence, contact data, or exact storage location.
- Lost-and-Found Service is the only service holding protected report evidence.
- Documented report transitions pass state/authorization checks.

### Risks / Notes

- Do not invent transitions for `REJECTED`, `HIDDEN`, or `EXPIRED`.
- Media flow must not expose unrestricted object-storage paths.

## Milestone 4 - Domain Events and ACTIVE-Report Read Model

### Objective

Connect the authoritative report lifecycle to Matching Service through reliable source-defined events.

### Requirements Covered

- EVENT-001, EVENT-003, EVENT-004, EVENT-005
- MATCH-001
- REL-002, REL-003, REL-004, REL-005, REL-006
- ARCH-005

### Components Involved

- Lost-and-Found Service, Matching Service, Message Broker, owned PostgreSQL schemas, Audit/Observability.

### Dependencies

- Milestones 1 and 3.
- Event-envelope, broker, ordering/version, processed-event retention, and Phase 1 Outbox/DLQ-minimum decisions.

### Expected Deliverables

- Versioned conceptual contracts materialized for `ReportActivated` and `ReportResolved`.
- Idempotent consumer records and aggregate-version protection.
- ACTIVE-report read model containing only approved attributes.
- Retry/recovery behavior matching the approved Phase 1 baseline.

### Verification / Completion Criteria

- Activating a report updates the read model without direct schema access.
- Matching unavailability does not roll back ACTIVE state.
- Duplicate/stale events do not duplicate or regress read-model state.
- Broker interruption behavior matches the approved Outbox scope.

### Risks / Notes

- The exact Phase 1 versus Phase 2 Outbox/DLQ boundary must be decided before completion is claimed.
- Eventual consistency must be visible in tests and operational diagnostics.

## Milestone 5 - Explainable Rule-Based Matching

### Objective

Deliver the complete non-AI matching core and measurement foundation.

### Requirements Covered

- MATCH-002, MATCH-003, MATCH-005, MATCH-006, MATCH-007, MATCH-008
- EVENT-002
- NOTIFY-001 only for the `MatchFound` integration hook, not full delivery behavior

### Components Involved

- Matching Service, Lost-and-Found Service, Message Broker, API Gateway, Web Client, owned schemas.

### Dependencies

- Milestone 4.
- Decisions for filter windows/ranges, missing values, normalization, thresholds, ties, visibility, and evaluation dataset.

### Expected Deliverables

- Hard candidate filtering.
- Fixed-weight Rule Score and persisted component breakdown.
- Ranked result/history and potential-duplicate signal.
- Stored-result-first `MatchFound` publication.
- Rule-only evaluation harness/data protocol for Recall@1, Recall@5, MRR, response time, and AI-call count baseline.

### Verification / Completion Criteria

- Fixed planning weights total 100% and are reproducible.
- AI can be completely absent while matching works.
- Every ranked result has an explainable score breakdown.
- Duplicate event delivery does not create duplicate results.

### Risks / Notes

- Do not convert ranking into an ownership conclusion.
- Calibration may change weights only through an approved change, not silently during implementation.

## Milestone 6 - Claims, Verification, Handover, Notifications, and Disputes

### Objective

Complete the human-controlled Lost & Found workflow from claim submission through physical handover and report resolution.

### Requirements Covered

- USER-002
- CLAIM-001 through CLAIM-005
- VERIFY-001 through VERIFY-003
- HANDOVER-001 through HANDOVER-003
- NOTIFY-001, NOTIFY-002
- ADMIN-001, ADMIN-002
- AUDIT-001

### Components Involved

- Web Client, API Gateway, Identity Service, Lost-and-Found Service, Message Broker, Object Storage, Audit/Observability.

### Dependencies

- Milestones 2-5.
- Decisions for claim transitions, evidence types/retention, multiple-claim reservation, dispute workflow, verification rules, scheduling, QR/OTP behavior, notification triggers/provider, and administrative metrics.

### Expected Deliverables

- Direct and match-originated claims with protected evidence.
- Staff review, additional-information request, preliminary approval/rejection, and dispute support.
- Direct verification, scheduling, time-limited QR/OTP confirmation, handover history, and resolution.
- In-system/email notification behavior inside Lost-and-Found Service.
- `ReportResolved` production after committed completion.

### Verification / Completion Criteria

- AI and Matching cannot change claim/verification/handover state.
- Secret evidence is visible only to authorized Lost-and-Found workflows and access is audited.
- Invalid/expired confirmation cannot complete handover.
- Full non-AI business workflow completes through API Gateway.
- Duplicate `MatchFound` does not create duplicate notification.

### Risks / Notes

- This is the highest-risk business milestone; do not split it into additional Phase 1 services.
- Undefined dispute, cancellation, appeal, and no-show rules must remain unimplemented until decided.

## Milestone 7 - Optional AI-Assisted Matching

### Objective

Add measurable AI similarity/reranking only after Rule-based matching and the core workflow are stable.

### Requirements Covered

- MATCH-004, MATCH-005, MATCH-008
- AI-001 through AI-005
- REL-001

### Components Involved

- Matching Service, AI Inference Service, approved media/text access, Audit/Observability.

### Dependencies

- Milestones 1 and 5; Milestone 6 for full workflow regression.
- Decisions for included AI modalities, draft-description scope, model/runtime, input contract, timeout, score combination, dataset, and target metrics.

### Expected Deliverables

- Stateless optional image and/or semantic-similarity inference.
- Candidate reranking integration for the reduced set.
- Explicit AI-used/unavailable state in scoring records.
- Rule-only versus Rule-plus-AI evaluation.
- Optional draft-description capability only if explicitly selected from the source-supported option.

### Verification / Completion Criteria

- Turning AI off does not break matching or any business workflow.
- AI receives no secret characteristics or claim evidence.
- AI output cannot approve claims or determine ownership.
- Rule-only and Rule-plus-AI results include Recall@1, Recall@5, and MRR.

### Risks / Notes

- Do not select or train a model until the relevant decisions are approved.
- Dataset consent/privacy and reproducibility precede optimization.

## Milestone 8 - Phase 1 Acceptance and Operational Hardening

### Objective

Verify the complete Phase 1 baseline end-to-end and raise observability/recovery only to the source-approved Phase 1 level.

### Requirements Covered

- REL-001 through REL-007
- OPS-001 through OPS-003
- ARCH-001 through ARCH-007
- All requirements exercised by the end-to-end workflow

### Components Involved

- Entire Phase 1 environment.

### Dependencies

- Milestones 1-7, except AI remains optional.
- Approved Phase 1 Outbox/DLQ minimum and operational acceptance metrics.

### Expected Deliverables

- End-to-end report -> moderation -> matching -> claim -> verification -> handover -> resolution/audit verification.
- Failure verification for AI unavailable, Matching unavailable, duplicate/delayed/stale events, broker interruption, and retry exhaustion at approved scope.
- Correlated logs, baseline metrics, alerts, and operational instructions.
- Requirement-to-test traceability and Phase 1 acceptance evidence.

### Verification / Completion Criteria

- Each service starts/deploys independently and accesses only its schema.
- Services communicate only through documented APIs/events.
- Matching failure does not invalidate ACTIVE reports.
- AI failure does not prevent Rule-based matching or core workflow.
- Duplicate events create no duplicate match, notification, or transition.
- Full workflow passes through API Gateway.
- One Docker Compose command starts the full local environment.

### Risks / Notes

- Do not claim production-ready distributed tracing or Phase 2 replay tooling unless separately implemented and approved.
- Do not add extra services, Kubernetes, Saga framework, or non-goal product features to satisfy a perceived completeness gap.

## Deferred Evolution

- **Phase 2:** production-ready Outbox processing, controlled DLQ replay tools, richer metrics/logs/distributed tracing, feedback/model-version management, and only justified Notification/Moderation extraction.
- **Phase 3:** multi-campus/organization boundaries, automated deployment/scaling, controlled model lifecycle/retraining, and only justified Handover/Dispute extraction.
