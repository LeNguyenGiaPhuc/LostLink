# LostLink Accepted Architecture Decisions

Only decisions explicitly supported by the primary sources are recorded as accepted. Unresolved choices belong in `docs/OPEN_QUESTIONS.md`.

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
