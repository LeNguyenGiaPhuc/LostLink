# LostLink Open Questions

This document tracks questions that the primary sources did not resolve. Open questions do not silently change a requirement or accepted decision. Resolved questions are retained at the end for traceability and point to their accepted decision records.

## Decision Triage

| Classification | Questions | Handling |
| --- | --- | --- |
| `DECIDE_BEFORE_FEATURE` | `Q-001`-`Q-017`, `Q-019`-`Q-035` | Resolve only before the feature or milestone identified by each question. |
| `DEFERRED` | `Q-018`, `Q-036` | Keep deferred until the optional draft-description capability is selected or production-like release expectations exist. |
| `RESOLVED` | `Q-037`-`Q-040` | Accepted during Planning Baseline review; see `docs/DECISIONS.md` and `docs/TECH_STACK.md`. |

Current unresolved total: 36 questions. This triage applies YAGNI: an unresolved question is not automatically a blocker.

## Q-001 - May a User Draft or Submit a Found Report Before Counter Intake?

### Category
Product

### Why It Matters
It changes the Found Report actor, intake workflow, moderation, and custody assumptions.

### What the Source Currently Says
Staff receives an item at the Lost-and-Found counter and creates the Found Report. The proposal also broadly describes users submitting lost or found information without defining a direct user Found Report flow.

### Decision Needed Before
Final Found Report creation API and UI.

## Q-002 - Is Public Found-Report Browsing Authenticated?

### Category
Product

### Why It Matters
It affects privacy exposure, abuse controls, and the Gateway authorization contract.

### What the Source Currently Says
Users can view masked Found Reports; it does not state whether unauthenticated visitors can browse them.

### Decision Needed Before
Public report-query API and Web Client access model.

## Q-003 - Which Optional AI Capabilities Are Included in Phase 1?

### Category
Product

### Why It Matters
Image similarity, text similarity, and draft-description assistance have different data, UI, cost, and evaluation needs.

### What the Source Currently Says
Image/text similarity and reranking are supported; the proposal also supports a user-reviewed draft description from an image. It does not choose the minimum Phase 1 subset.

### Decision Needed Before
AI milestone scope and inference contracts.

## Q-004 - What Is the Minimum Valid Data for Each Report Type?

### Category
Business Rule

### Why It Matters
It defines validation, moderation readiness, matching quality, and acceptance tests.

### What the Source Currently Says
Reports are structured and validated for minimum data, with category, color, time, location, description, image, and secret characteristics referenced. Mandatory versus optional fields are not specified.

### Decision Needed Before
Report request contracts, validation, and UI forms.

## Q-005 - What Are the Exact Report Transitions Involving REJECTED, HIDDEN, and EXPIRED?

### Category
Business Rule

### Why It Matters
Undefined transitions could incorrectly publish events, expose reports, or permit reopening.

### What the Source Currently Says
Baseline lifecycle is `DRAFT -> PENDING_REVIEW -> ACTIVE -> RESERVED -> RESOLVED`; the three additional states exist, but their incoming/outgoing transitions are unspecified.

### Decision Needed Before
Report state-machine implementation and event triggers.

## Q-006 - What Are Moderation, Hiding, and Expiration Rules?

### Category
Business Rule

### Why It Matters
Staff decisions, automatic jobs, public visibility, reasons, and audit behavior depend on these rules.

### What the Source Currently Says
Staff may approve, reject, hide, or expire reports according to business rules; the rules and durations are not defined.

### Decision Needed Before
Moderation APIs, state transitions, and expiration processing.

## Q-007 - What Makes a User Eligible to Submit or Repeat a Claim?

### Category
Business Rule

### Why It Matters
Eligibility affects abuse prevention, duplicate claims, self-claims, and rate limits.

### What the Source Currently Says
Users may submit Direct Claims or claims from match results and must provide evidence. Duplicate/self-claim/withdrawal rules are absent.

### Decision Needed Before
Claim creation contract and validation.

## Q-008 - How Does a Claim Return from NEED_MORE_INFORMATION?

### Category
Business Rule

### Why It Matters
The baseline state list shows a forward chain but does not define resubmission, deadline, or expiration.

### What the Source Currently Says
Staff can request more information and the claimant can supplement evidence; the next transition is not specified.

### Decision Needed Before
Claim state machine and additional-evidence APIs.

## Q-009 - How Are Multiple Claims, Reservation, and Competing Approval Handled?

### Category
Business Rule

### Why It Matters
It controls when a report becomes `RESERVED`, whether one or several claims can remain active, and how conflicts are prevented.

### What the Source Currently Says
The system must support multiple claims and staff comparison; detailed priority/reservation rules are absent.

### Decision Needed Before
Claim approval and report reservation implementation.

## Q-010 - What Is the Dispute Lifecycle?

### Category
Business Rule

### Why It Matters
Disputes can affect claim state, handover, evidence access, appeals, and audit retention.

### What the Source Currently Says
Dispute handling belongs to Lost-and-Found Service in Phase 1; no states or resolution rules are defined.

### Decision Needed Before
Any dispute API, data model, or workflow implementation.

## Q-011 - What Evidence and Identity Checks Are Accepted for Direct Verification?

### Category
Business Rule

### Why It Matters
Ownership verification is the critical human decision and requires testable rules.

### What the Source Currently Says
Staff checks identity and evidence directly; accepted evidence types, failure attempts, and escalation are not defined.

### Decision Needed Before
Verification workflow and acceptance criteria.

## Q-012 - What Are Scheduling, Rescheduling, Cancellation, and No-Show Rules?

### Category
Business Rule

### Why It Matters
They affect claim state, report reservation, notification, and physical custody.

### What the Source Currently Says
Staff schedules pickup at the counter; exception paths are not specified.

### Decision Needed Before
Handover appointment workflow.

## Q-013 - How Are QR and OTP Modes Selected and Controlled?

### Category
Business Rule

### Why It Matters
Expiry, retries, issuance, delivery, and renewal must be unambiguous for secure handover.

### What the Source Currently Says
Handover uses a time-limited QR or OTP; no mode-selection or lifecycle rules are given.

### Decision Needed Before
Handover confirmation API and security tests.

## Q-014 - Which State Changes Generate In-System or Email Notifications?

### Category
Business Rule

### Why It Matters
The trigger matrix drives user expectations, idempotency, and email operations.

### What the Source Currently Says
Notifications occur for matches or state changes through in-system and email channels; complete triggers and preferences are unspecified.

### Decision Needed Before
Notification behavior and templates.

## Q-015 - What Is the Minimum Outbox and Dead-Letter Behavior Required in Phase 1?

### Category
Architecture

### Why It Matters
It determines whether event producers/consumers meet Phase 1 reliability acceptance without claiming Phase 2 operational maturity.

### What the Source Currently Says
Outbox and DLQ/replay are described in reliability; production-ready Outbox and replay tooling are listed for Phase 2.

### Decision Needed Before
Completion criteria for event-producing and event-consuming milestones.

## Q-016 - What Are Event Ordering, Partitioning, and Aggregate-Version Gap Rules?

### Category
Architecture

### Why It Matters
Consumers must reject stale events without silently accepting missing updates.

### What the Source Currently Says
Events include aggregate version and consumers prevent stale overwrite; ordering and gap behavior are not defined.

### Decision Needed Before
Final event contracts and consumer behavior.

## Q-017 - Where Are Cross-Domain Operational Statistics Aggregated?

### Category
Architecture

### Why It Matters
An admin dashboard must not justify cross-schema access or move domain ownership into Gateway.

### What the Source Currently Says
Admins can view operational statistics and observability infrastructure exists; aggregation ownership is not defined.

### Decision Needed Before
Admin statistics APIs and data flow.

## Q-018 - How Does Draft-Description AI Preserve Service Ownership?

### Category
Architecture

### Why It Matters
Matching is the documented caller of AI, while a user-facing draft suggestion originates during report authoring.

### What the Source Currently Says
The proposal allows draft description from image; the architecture design specifies Matching Service requesting similarity but does not define this invocation path.

### Decision Needed Before
Including the draft-description feature in Phase 1 or defining its permitted contract.

## Q-019 - What API Versioning, Error, Pagination, Filtering, and Concurrency Conventions Apply?

### Category
API

### Why It Matters
All services need consistent contracts without sharing business implementation.

### What the Source Currently Says
REST is required for immediate-response use cases; concrete API conventions are absent.

### Decision Needed Before
Final API specifications and contract tests.

## Q-020 - Which Commands Require Client Idempotency Keys?

### Category
API

### Why It Matters
Network retries could duplicate claim submissions, decisions, or handover completion.

### What the Source Currently Says
Event consumers are idempotent; public-command idempotency is not defined.

### Decision Needed Before
Claim and handover command contracts.

## Q-021 - Should Public, Owner, Staff, and Admin Views Use Separate Routes?

### Category
API

### Why It Matters
Privacy-sensitive representation selection can be clearer with separate contracts but increases API surface.

### What the Source Currently Says
Different actors see different information; route strategy is unspecified.

### Decision Needed Before
Report, claim, evidence, and administrative API specification.

## Q-022 - What Is the Media Upload and Approved-Reference Flow?

### Category
API

### Why It Matters
Object storage must not be directly exposed, and Matching/AI need only approved inputs.

### What the Source Currently Says
Object Storage holds images; Lost-and-Found Service owns metadata/access and downstream requests use approved references.

### Decision Needed Before
Upload, download, masking/variant, and AI-access contracts.

## Q-023 - What Is the Field-Level Privacy Classification?

### Category
Data Model

### Why It Matters
Public views, event payloads, matching read models, AI inputs, and staff access all depend on it.

### What the Source Currently Says
It distinguishes public attributes, contact data, exact storage location, original images, secret characteristics, and claim evidence, but not an exhaustive field matrix.

### Decision Needed Before
Physical model, request/response DTOs, and event payloads.

## Q-024 - What Are Data Retention and Deletion Rules?

### Category
Data Model

### Why It Matters
Reports, evidence, media, audit, notifications, match history, and idempotency records have different privacy/operational needs.

### What the Source Currently Says
History and audit are retained conceptually; retention periods and deletion behavior are absent.

### Decision Needed Before
Persistence design, privacy operations, backup, and cleanup jobs.

## Q-025 - How Are Identity References Represented Across Services?

### Category
Data Model

### Why It Matters
Services need stable actor/owner references without reading `identity_schema`.

### What the Source Currently Says
Identity Service owns identity; cross-service information uses APIs/events. Reference representation and profile snapshot rules are unspecified.

### Decision Needed Before
Report/claim/audit models and identity contracts.

## Q-026 - Which Embeddings and Model Metadata Are Persisted by Matching Service?

### Category
Data Model

### Why It Matters
Reproducibility, storage cost, privacy, and model replacement depend on this choice.

### What the Source Currently Says
Matching owns stored embeddings, scoring records, and model metadata; exact artifacts are unspecified.

### Decision Needed Before
AI integration persistence model and evaluation reproducibility.

## Q-027 - What Authentication and Token Mechanism Is Used?

### Category
Security

### Why It Matters
Token issuance, Gateway validation, service authorization, expiry, revocation, and testing depend on it.

### What the Source Currently Says
Identity Service issues tokens and Gateway performs basic validation; no mechanism is selected.

### Decision Needed Before
Identity/Gateway implementation.

## Q-028 - What Internal Service Credential Mechanism Is Used?

### Category
Security

### Why It Matters
Internal endpoints must not trust network location alone.

### What the Source Currently Says
Services use explicit internal credentials; type, rotation, and authorization representation are unspecified.

### Decision Needed Before
Any synchronous service-to-service call.

## Q-029 - What Encryption and Object-Access Controls Are Required?

### Category
Security

### Why It Matters
Secret evidence and original media require controlled storage and transport.

### What the Source Currently Says
Access is restricted and downstream uses approved references; encryption, signed references, expiry, scanning, and key handling are unspecified.

### Decision Needed Before
Evidence/media storage implementation.

## Q-030 - What Fine-Grained Permissions Govern Evidence and Audit Access?

### Category
Security

### Why It Matters
User, Staff, and Admin roles alone may not define who can view a specific claim, location, or audit record.

### What the Source Currently Says
Owner services authorize sensitive actions and evidence access is audited; detailed permissions are absent.

### Decision Needed Before
Staff/admin evidence, verification, dispute, and audit APIs.

## Q-031 - Which AI Model and Inference Runtime Will Be Used?

### Category
AI

### Why It Matters
Input contracts, resource needs, licensing, privacy, latency, and deployment depend on the choice.

### What the Source Currently Says
AI supports image/text similarity and remains stateless/replaceable; no model or technology is selected.

### Decision Needed Before
AI Inference Service implementation.

## Q-032 - How Are AI Scores Combined, Timed Out, and Thresholded?

### Category
AI

### Why It Matters
Reranking must be reproducible and fallback behavior must be testable.

### What the Source Currently Says
AI optionally reranks a reduced candidate set with a strict timeout; formula, scale, threshold, and timeout are unspecified.

### Decision Needed Before
Rule-plus-AI ranking implementation and evaluation.

## Q-033 - What Evaluation Dataset and Success Targets Apply?

### Category
AI

### Why It Matters
Recall@1, Recall@5, MRR, latency, and AI-call count require labeled data and agreed targets.

### What the Source Currently Says
Metrics and Rule-only versus Rule-plus-AI comparison are required; dataset size/composition/split and target values are absent.

### Decision Needed Before
Matching evaluation acceptance.

## Q-034 - Which Email Delivery Provider and Failure Policy Apply?

### Category
Operations

### Why It Matters
Phase 1 includes email notifications, but external delivery and retries must not block the domain workflow.

### What the Source Currently Says
In-system and email channels are required; provider, template, retry, and delivery-status behavior are not defined.

### Decision Needed Before
Email notification implementation and operations.

## Q-035 - What Is the Phase 1 Observability Minimum?

### Category
Operations

### Why It Matters
Logs, metrics, alerts, correlation, and failure recovery need a verifiable baseline without claiming full production tracing.

### What the Source Currently Says
Audit/Observability infrastructure is included; production-ready distributed tracing is not a Phase 1 goal and is expanded in Phase 2.

### Decision Needed Before
Operational acceptance and Milestone 8 completion.

## Q-036 - What Backup, Restore, and Disaster-Recovery Expectations Apply?

### Category
Operations

### Why It Matters
PostgreSQL, object media, secret evidence, and audit history require aligned recovery behavior.

### What the Source Currently Says
Failure/retry behavior is defined, but backup/restore objectives are not.

### Decision Needed Before
Production-like data protection or release readiness.

## Resolved Questions

## Q-037 - How Are Local Configuration and Secrets Supplied to Docker Compose?

### Status
Resolved

### Decision
Use environment variables supplied through Docker Compose. Commit a non-secret `.env.example`, keep the real `.env` outside Git, provide each service only the configuration it requires, and defer a production secret manager until a production-like environment requires one.

### Decision Record
`DEC-017`

### Category
Operations

### Why It Matters
One-command startup must not require committed secrets or undocumented manual setup.

### What the Source Currently Says
Each service has configuration and the full environment starts with one Compose command; secret/config conventions are absent.

### Decision Needed Before
Milestone 1 completion criteria and developer onboarding.

## Q-038 - What Repository Layout Will Represent the Services?

### Status
Resolved

### Decision
Use one monorepo with root npm workspaces and no Turborepo in Phase 1. Web Client lives under `apps/web`; backend and AI components live under `services/`; any shared package is contract-only. Each component preserves a separate project, process, container, build/start boundary, and deployment lifecycle. AI Inference Service remains an independent Python project outside the npm workspace.

### Decision Record
`DEC-014`, `DEC-018`

### Category
Technology Stack

### Why It Matters
Independent processes, contract-only sharing, build commands, and ownership need a stable layout.

### What the Source Currently Says
Services are independently deployable; monorepo versus multiple repositories and folder structure are not selected.

### Decision Needed Before
Project scaffolding.

## Q-039 - Which Frontend, Gateway, and Service Frameworks/Runtimes Will Be Used?

### Status
Resolved

### Decision
Use React 19.2, TypeScript, and Vite 8 for Web Client; Node.js 24 LTS, TypeScript, and NestJS 11 for API Gateway, Identity Service, Lost-and-Found Service, and Matching Service; and Python 3.13 with FastAPI for the optional AI Inference Service. Use Prisma 7 GA for stateful-service ORM/migrations, npm workspaces and lockfile for JavaScript packages, and exact-pinned `requirements.txt` for Python. Testing and configuration conventions follow the approved Milestone 1 foundation design.

### Decision Record
`DEC-015`, `DEC-018`

### Category
Technology Stack

### Why It Matters
API implementation, validation, testing, packaging, and deployment are technology-dependent.

### What the Source Currently Says
The system is a responsive Web Client plus backend services; no frameworks/runtimes are selected.

### Decision Needed Before
Project scaffolding and implementation planning.

## Q-040 - Which Broker and Object-Storage Implementations Will Be Used?

### Status
Resolved

### Decision
Use RabbitMQ 4.3 as the Phase 1 Message Broker and Garage 2.3 as the single-node local S3-compatible Object Storage implementation. Garage buckets remain private by default, and only Lost-and-Found Service receives storage credentials.

### Decision Record
`DEC-016`

### Category
Technology Stack

### Why It Matters
Event semantics, local Compose setup, retry/DLQ behavior, media references, and access control depend on these choices.

### What the Source Currently Says
Phase 1 includes a Message Broker and Object Storage; concrete technologies are not selected.

### Decision Needed Before
Milestones 1, 3, and 4.

## Source Conflicts

No confirmed `SOURCE_CONFLICT` was found between the two primary source documents.

The Outbox/DLQ material is treated as `NEEDS_DECISION`, not a conflict: reliability behavior is part of the architecture direction, while production-ready Outbox processing and replay tooling are explicitly listed for Phase 2.
