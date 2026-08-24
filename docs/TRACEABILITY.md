# LostLink Requirement Traceability

## Purpose and Authority

This document is the requirement-level tracking source for:

`Requirement -> Owner -> Milestone -> Implementation Evidence -> Test Evidence -> Verification Status`

It does not replace `docs/REQUIREMENTS.md` or its acceptance criteria. Original source documents and the planning authority order in `AGENTS.md` remain authoritative. A row in this matrix cannot create or change a requirement.

This initial baseline contains planning coverage only. LostLink has no application implementation or automated tests, so every requirement begins as `NOT_STARTED` with no implementation or test evidence.

## Verification Status Model

| Status | Meaning |
| --- | --- |
| `NOT_STARTED` | No requirement implementation has started. |
| `IN_PROGRESS` | Implementation or relevant tests are being developed. |
| `READY_FOR_VERIFICATION` | Implementation and relevant tests exist and pass, but acceptance-criterion review is not complete. |
| `VERIFIED` | Every acceptance criterion has been reviewed against implementation and passing test evidence. |
| `BLOCKED` | Work cannot proceed because a required decision or external dependency is unresolved. |

Status must be evidence-based. Code existence alone is insufficient for `READY_FOR_VERIFICATION` or `VERIFIED`.

## Evidence Rules

- **Implementation Evidence:** repository-relative source/configuration paths and, when useful, symbols or commit references.
- **Test Evidence:** repository-relative test paths plus the command/result that verifies the relevant acceptance criteria.
- **Verification:** compare every acceptance criterion in `docs/REQUIREMENTS.md`; report `PASS`, `FAIL`, or `UNCERTAIN` during review.
- **Open decisions:** a question in `docs/OPEN_QUESTIONS.md` becomes `BLOCKED` only when it prevents the requirement's approved milestone or feature from continuing.
- **Multiple milestones:** the matrix records the primary implementation milestone. Cross-cutting requirements are rechecked in later milestone acceptance and the Phase 1 end-to-end review.

## Milestone Key

| Key | Milestone |
| --- | --- |
| M1 | Executable Service and Infrastructure Foundation |
| M2 | Identity, Gateway, and Edge Security |
| M3 | Reports, Moderation, Privacy, and Object Storage |
| M4 | Domain Events and ACTIVE-Report Read Model |
| M5 | Explainable Rule-Based Matching |
| M6 | Claims, Verification, Handover, Notifications, and Disputes |
| M7 | Optional AI-Assisted Matching |
| M8 | Phase 1 Acceptance and Operational Hardening |

## Baseline Summary

| Measure | Value |
| --- | --- |
| Total requirements | 72 |
| Functional | 38 |
| Architecture | 13 |
| Security | 10 |
| Reliability | 7 |
| Operational | 4 |
| `NOT_STARTED` | 72 |
| `IN_PROGRESS` | 0 |
| `READY_FOR_VERIFICATION` | 0 |
| `VERIFIED` | 0 |
| `BLOCKED` | 0 |

## Authentication and User

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `AUTH-001` - Authenticate a Registered Account | Identity Service | M2 - identity integration and negative authentication tests | Pending | Pending | `NOT_STARTED` |
| `AUTH-002` - Issue Authentication Tokens | Identity Service | M2 - token contract and integration tests | Pending | Pending | `NOT_STARTED` |
| `AUTH-003` - Support Defined Roles | Identity Service | M2 - role representation and authorization tests | Pending | Pending | `NOT_STARTED` |
| `USER-001` - Manage Profile and Contact Information | Identity Service | M2 - profile API and ownership authorization tests | Pending | Pending | `NOT_STARTED` |
| `USER-002` - View Personal Workflow Information | Lost-and-Found Service | M6 - owner-scoped workflow API and end-to-end tests | Pending | Pending | `NOT_STARTED` |

## Reports and Moderation

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `REPORT-001` - Create a Lost Report | Lost-and-Found Service | M3 - request validation and report lifecycle integration tests | Pending | Pending | `NOT_STARTED` |
| `REPORT-002` - Register a Found Report at the Lost-and-Found Counter | Lost-and-Found Service | M3 - Staff authorization and intake integration tests | Pending | Pending | `NOT_STARTED` |
| `REPORT-003` - Validate and Separate Report Data | Lost-and-Found Service | M3 - validation plus public/private/secret separation tests | Pending | Pending | `NOT_STARTED` |
| `REPORT-004` - Publish Only Masked Found-Report Information | Lost-and-Found Service | M3 - public projection and privacy-negative tests | Pending | Pending | `NOT_STARTED` |
| `REPORT-005` - Track and Permittedly Update Reports | Lost-and-Found Service | M3 - owner authorization and state-dependent update tests | Pending | Pending | `NOT_STARTED` |
| `REPORT-006` - Enforce the Report State Machine | Lost-and-Found Service | M3 - state-transition unit and integration tests | Pending | Pending | `NOT_STARTED` |
| `MOD-001` - Moderate Reports Before Activation | Lost-and-Found Service | M3 - Staff authorization, state, and event-trigger tests | Pending | Pending | `NOT_STARTED` |
| `MOD-002` - Hide or Expire Reports Under Business Rules | Lost-and-Found Service | M3 - authorized transition and public-visibility tests | Pending | Pending | `NOT_STARTED` |
| `MOD-003` - Audit Moderation Decisions | Lost-and-Found Service | M3 - moderation audit integration tests | Pending | Pending | `NOT_STARTED` |

## Matching

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `MATCH-001` - Maintain an ACTIVE-Report Read Model | Matching Service | M4 - event-consumer, projection, and idempotency tests | Pending | Pending | `NOT_STARTED` |
| `MATCH-002` - Hard-Filter Match Candidates | Matching Service | M5 - deterministic candidate-filter unit tests | Pending | Pending | `NOT_STARTED` |
| `MATCH-003` - Calculate the Baseline Rule Score | Matching Service | M5 - fixed-weight and reproducibility unit tests | Pending | Pending | `NOT_STARTED` |
| `MATCH-004` - Invoke AI Only for a Reduced Candidate Set | Matching Service | M7 - AI invocation-boundary and disabled-AI tests | Pending | Pending | `NOT_STARTED` |
| `MATCH-005` - Rank Candidates with Explainable Scores | Matching Service | M5 - score-breakdown/ranking tests; recheck with AI in M7 | Pending | Pending | `NOT_STARTED` |
| `MATCH-006` - Retain Match History and Detect Potential Duplicates | Matching Service | M5 - persistence and duplicate-processing tests | Pending | Pending | `NOT_STARTED` |
| `MATCH-007` - Emit MatchFound After Persisting Ranked Results | Matching Service | M5 - transaction-order and event-publication tests | Pending | Pending | `NOT_STARTED` |
| `MATCH-008` - Evaluate Matching Quality and Cost | Matching evaluation scope | M5 - Rule-only metrics; compare Rule-plus-AI in M7 | Pending | Pending | `NOT_STARTED` |

## AI Assistance

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `AI-001` - Compute Image Similarity | AI Inference Service, called by Matching | M7 - inference contract, timeout, and advisory-output tests | Pending | Pending | `NOT_STARTED` |
| `AI-002` - Compute Semantic Text Similarity | AI Inference Service, called by Matching | M7 - inference contract, public-input, and fallback tests | Pending | Pending | `NOT_STARTED` |
| `AI-003` - Suggest a Draft Description from an Image | AI Inference and Lost-and-Found boundary | M7 - only if selected; editable-draft and manual-fallback tests | Pending | Pending | `NOT_STARTED` |
| `AI-004` - Keep AI Inference Stateless and Replaceable in Phase 1 | AI Inference Service | M7 - restart/statelessness and replacement-boundary tests | Pending | Pending | `NOT_STARTED` |
| `AI-005` - Enforce the AI Decision and Privacy Boundary | Lost-and-Found, Matching, and AI | M7 - forbidden-data contract and no-business-transition tests | Pending | Pending | `NOT_STARTED` |

## Claims, Verification, and Handover

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `CLAIM-001` - Submit a Claim Through Either Supported Entry Path | Lost-and-Found Service | M6 - Direct Claim/match-originated API integration tests | Pending | Pending | `NOT_STARTED` |
| `CLAIM-002` - Capture Ownership Evidence Privately | Lost-and-Found Service | M6 - protected-evidence storage and access-negative tests | Pending | Pending | `NOT_STARTED` |
| `CLAIM-003` - Enforce the Claim State Machine | Lost-and-Found Service | M6 - claim transition unit and integration tests | Pending | Pending | `NOT_STARTED` |
| `CLAIM-004` - Review and Decide Claims Through Staff Workflow | Lost-and-Found Service | M6 - Staff decision, audit, and AI-exclusion tests | Pending | Pending | `NOT_STARTED` |
| `CLAIM-005` - Handle Multiple Claims and Disputes | Lost-and-Found Service | M6 - competing-claim and dispute representation tests | Pending | Pending | `NOT_STARTED` |
| `VERIFY-001` - Restrict Access to Verification Evidence | Lost-and-Found Service | M6 - fine-grained authorization and audit tests | Pending | Pending | `NOT_STARTED` |
| `VERIFY-002` - Perform Direct Ownership Verification | Lost-and-Found Service | M6 - human-verification workflow tests | Pending | Pending | `NOT_STARTED` |
| `VERIFY-003` - Exclude AI from Ownership Verification | Lost-and-Found Service | M6 - architecture/authorization tests preventing AI transitions | Pending | Pending | `NOT_STARTED` |
| `HANDOVER-001` - Schedule an Approved Handover | Lost-and-Found Service | M6 - state prerequisite and appointment integration tests | Pending | Pending | `NOT_STARTED` |
| `HANDOVER-002` - Confirm Handover with Time-Limited QR or OTP | Lost-and-Found Service | M6 - expiry, invalid-attempt, rate-limit, and audit tests | Pending | Pending | `NOT_STARTED` |
| `HANDOVER-003` - Complete Handover and Resolve the Report | Lost-and-Found Service | M6 - transactional completion and ReportResolved tests | Pending | Pending | `NOT_STARTED` |

## Notifications, Administration, and Audit

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `NOTIFY-001` - Notify Users of Matches and Workflow Changes | Lost-and-Found Service | M6 - trigger, privacy, idempotency, and failure-isolation tests | Pending | Pending | `NOT_STARTED` |
| `NOTIFY-002` - Keep Phase 1 Notification Ownership in Lost-and-Found Service | Lost-and-Found Service | M6 - architecture boundary and duplicate-notification tests | Pending | Pending | `NOT_STARTED` |
| `ADMIN-001` - Manage Accounts and Roles | Identity Service | M6 - Admin authorization and identity-ownership tests | Pending | Pending | `NOT_STARTED` |
| `ADMIN-002` - View Operational Statistics and Manage Supported Configuration | Owning services | M6 - authorization, aggregation-boundary, and audit tests | Pending | Pending | `NOT_STARTED` |
| `AUDIT-001` - Audit Sensitive Business and Security Actions | Owning domain services | M3 - initial report/moderation audit; extend in M6 | Pending | Pending | `NOT_STARTED` |
| `AUDIT-002` - Correlate Requests, Events, and Logs | Gateway and all backend services | M2 - request/event correlation integration tests | Pending | Pending | `NOT_STARTED` |

## Domain Events

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `EVENT-001` - Publish and Consume ReportActivated | Lost-and-Found producer, Matching consumer | M4 - producer/consumer contract and failure-isolation tests | Pending | Pending | `NOT_STARTED` |
| `EVENT-002` - Publish and Consume MatchFound | Matching producer, Lost-and-Found consumer | M5 - stored-result-first and notification-idempotency tests | Pending | Pending | `NOT_STARTED` |
| `EVENT-003` - Publish and Consume ReportResolved | Lost-and-Found producer, Matching consumer | M4 - closure/deactivation and stale-event tests | Pending | Pending | `NOT_STARTED` |
| `EVENT-004` - Apply Event Metadata and Data-Minimization Rules | All event producers | M4 - event contract, metadata, and forbidden-data tests | Pending | Pending | `NOT_STARTED` |
| `EVENT-005` - Process Domain Events Idempotently | All event consumers | M4 - durable redelivery/restart tests | Pending | Pending | `NOT_STARTED` |

## Security and Privacy

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `SEC-001` - Expose Only the API Gateway Publicly | Gateway and deployment environment | M2 - network/exposure and routing tests | Pending | Pending | `NOT_STARTED` |
| `SEC-002` - Enforce Layered Authorization and Internal Credentials | Gateway and all backend services | M2 - defense-in-depth and internal-auth tests | Pending | Pending | `NOT_STARTED` |
| `SEC-003` - Isolate Secret Ownership and Claim Evidence | Lost-and-Found Service | M3 - schema/event/AI forbidden-data tests | Pending | Pending | `NOT_STARTED` |
| `SEC-004` - Protect Contact, Original Media, and Exact Storage Location | Lost-and-Found Service | M3 - public projection and object-access tests | Pending | Pending | `NOT_STARTED` |
| `SEC-005` - Rate-Limit Sensitive Public Operations | API Gateway with domain policy | M2 - login/claim/evidence/OTP rate-limit tests | Pending | Pending | `NOT_STARTED` |
| `SEC-006` - Use Only Simulated or Consented Evaluation Data | Project data/evaluation scope | M3 - data-provenance policy; recheck in M5 and M7 | Pending | Pending | `NOT_STARTED` |

## Reliability

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `REL-001` - Fall Back to Rule Score When AI Fails | Matching Service | M7 - disabled, timeout, and error fallback tests | Pending | Pending | `NOT_STARTED` |
| `REL-002` - Isolate Matching Failure from Report Activation | Lost-and-Found and Matching | M4 - matching-outage and retry tests | Pending | Pending | `NOT_STARTED` |
| `REL-003` - Prevent Duplicate Event Side Effects | All Phase 1 consumers | M4 - duplicate delivery tests; recheck M5/M6 | Pending | Pending | `NOT_STARTED` |
| `REL-004` - Preserve Events During Broker Outage with an Outbox Direction | Event-producing stateful services | M4 - broker-outage transaction and recovery tests | Pending | Pending | `NOT_STARTED` |
| `REL-005` - Quarantine Repeated Event Failures | Broker and event consumers | M4 - retry-exhaustion, DLQ, and controlled-replay tests | Pending | Pending | `NOT_STARTED` |
| `REL-006` - Reject Stale Event Updates | Stateful event consumers | M4 - duplicate, stale, equal-version, and gap-observability tests | Pending | Pending | `NOT_STARTED` |
| `REL-007` - Bound Cross-Service Retries | Gateway and backend service callers | M8 - safe/unsafe operation retry and duplicate-effect tests | Pending | Pending | `NOT_STARTED` |

## Architecture and Operations

| Requirement | Owner / Scope | Primary Coverage | Implementation Evidence | Test Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| `ARCH-001` - Use the Defined Phase 1 Component Set | Project architecture | M1 - component inventory and architecture review | Pending | Pending | `NOT_STARTED` |
| `ARCH-002` - Deploy Services Independently | Project architecture and operations | M1 - independent process/container startup tests | Pending | Pending | `NOT_STARTED` |
| `ARCH-003` - Give Each Stateful Service an Owned Schema and Database User | Identity, Lost-and-Found, and Matching | M1 - database privilege and schema-isolation tests | Pending | Pending | `NOT_STARTED` |
| `ARCH-004` - Prohibit Cross-Schema Access | All stateful services | M1 - negative database privilege tests | Pending | Pending | `NOT_STARTED` |
| `ARCH-005` - Use REST and Domain Events for Cross-Service Communication | Gateway and all backend services | M4 - contract tests and repository/schema-access review | Pending | Pending | `NOT_STARTED` |
| `ARCH-006` - Avoid Shared Domain Implementation | All backend services | M1 - dependency and shared-package architecture review | Pending | Pending | `NOT_STARTED` |
| `ARCH-007` - Resist Premature Service and Platform Expansion | Project architecture | M8 - component/non-goal architecture review | Pending | Pending | `NOT_STARTED` |
| `OPS-001` - Start the Full Local Phase 1 Environment with Docker Compose | Project operations | M1 - clean-start and clean-shutdown Compose tests | Pending | Pending | `NOT_STARTED` |
| `OPS-002` - Provide Independent Service Operational Assets | Each backend service | M1 - health, configuration, migration, and image checks | Pending | Pending | `NOT_STARTED` |
| `OPS-003` - Establish Phase-Appropriate Observability and Recovery Operations | All services and observability infrastructure | M8 - correlated logs, metrics, alert, and recovery checks | Pending | Pending | `NOT_STARTED` |

## Planning Review Result

- All 72 requirement IDs from `docs/REQUIREMENTS.md` are represented exactly once in this matrix.
- Primary milestone ownership follows `docs/DEVELOPMENT_PLAN.md`; later cross-cutting rechecks are noted without duplicating requirement rows.
- No implementation or test evidence exists at this planning checkpoint.
- No requirement is marked `VERIFIED`.
- The 36 unresolved questions remain governed by `docs/OPEN_QUESTIONS.md` and are not automatically blockers.
- The known source ambiguity about direct User Found Report submission remains `Q-001`; no workflow was invented here.
- The Phase 1 versus Phase 2 Outbox/DLQ minimum remains `Q-015`; this matrix does not silently resolve it.
- No new `SOURCE_CONFLICT` was identified during this traceability pass.
