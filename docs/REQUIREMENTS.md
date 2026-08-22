# LostLink Requirements Baseline

This document structures requirements derived from the primary source documents. It does not replace them. If this document conflicts with a source document, the source document has higher authority.

Source documents:

- `docs/source/LostLink_Microservices.docx`
- `docs/source/2026-08-23-lostlink-microservices-design.md`

Markers:

- `NEEDS_DECISION`: the source does not define enough detail for a binding decision.
- `SOURCE_CONFLICT`: the sources state incompatible requirements. No confirmed source conflict was found during this baseline review.

## AUTH-001 - Authenticate a Registered Account

### Type
Functional

### Description
The Identity Service shall authenticate registered accounts for access to LostLink.

### Actor / Owner
User, Staff, Admin / Identity Service

### Preconditions
An account exists and the actor supplies authentication credentials.

### Expected Behavior
The service validates the credentials and returns an authenticated result without exposing credentials to other domain services.

### Failure / Edge Cases
Invalid credentials are rejected. The exact credential types and account-recovery workflow are `NEEDS_DECISION`.

### Acceptance Criteria
- Valid credentials produce an authenticated result.
- Invalid credentials do not produce an authenticated session or token.
- Authentication is owned by Identity Service.

### Related Requirements
- AUTH-002
- SEC-001
- SEC-005

### Source
- Architecture design, "Identity Service" and "Security and Privacy"
- Proposal, Sections 4 and 5

## AUTH-002 - Issue Authentication Tokens

### Type
Functional

### Description
The Identity Service shall issue tokens for successfully authenticated accounts.

### Actor / Owner
Identity Service

### Preconditions
AUTH-001 succeeds.

### Expected Behavior
A token representing the authenticated identity is issued for use through the API Gateway.

### Failure / Edge Cases
Token format, lifetime, refresh, revocation, and signing mechanism are `NEEDS_DECISION`.

### Acceptance Criteria
- Only Identity Service issues authentication tokens.
- A failed authentication attempt does not result in token issuance.
- Gateway can perform basic validation of an issued token without owning identity data.

### Related Requirements
- AUTH-001
- ARCH-001
- SEC-002

### Source
- Architecture design, "Identity Service" and "API Gateway"

## AUTH-003 - Support Defined Roles

### Type
Functional

### Description
Identity Service shall represent the User, Staff, and Admin roles.

### Actor / Owner
Admin / Identity Service

### Preconditions
An account exists.

### Expected Behavior
Role information is available to authorized services for access-control decisions.

### Failure / Edge Cases
Role assignment rules and whether one account may have multiple roles are `NEEDS_DECISION`.

### Acceptance Criteria
- The role set contains User, Staff, and Admin.
- Undefined roles are not silently granted permissions.
- Domain services remain responsible for authorizing sensitive actions.

### Related Requirements
- ADMIN-001
- SEC-002

### Source
- Architecture design, "Identity Service"
- Proposal, Sections 1, 4, and 5

## USER-001 - Manage Profile and Contact Information

### Type
Functional

### Description
An authenticated actor shall be able to manage their profile identity and contact information through Identity Service.

### Actor / Owner
User, Staff, Admin / Identity Service

### Preconditions
The actor is authenticated.

### Expected Behavior
The actor can view and update permitted profile and contact information.

### Failure / Edge Cases
Required fields, verification rules, and which fields are editable are `NEEDS_DECISION`.

### Acceptance Criteria
- Profile identity remains owned by Identity Service.
- Unauthorized actors cannot modify another actor's profile.
- Contact information is not exposed in public report data.

### Related Requirements
- AUTH-003
- SEC-004

### Source
- Architecture design, "Identity Service"
- Proposal, Section 4, "Người dùng"

## USER-002 - View Personal Workflow Information

### Type
Functional

### Description
An authenticated user shall be able to view their report states, claim states, notifications, handover appointments, and handover history.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
The user is authenticated and owns or is authorized to view the relevant record.

### Expected Behavior
The system returns the user's permitted workflow information without exposing another user's private data.

### Failure / Edge Cases
Retention period and pagination are `NEEDS_DECISION`.

### Acceptance Criteria
- The user can see the current state of their own reports and claims.
- The user can see their own notifications and scheduled handovers.
- Cross-user access is rejected unless separately authorized by source-supported staff/admin rules.

### Related Requirements
- REPORT-005
- CLAIM-003
- HANDOVER-001
- NOTIFY-001

### Source
- Proposal, Section 4, "Người dùng"

## REPORT-001 - Create a Lost Report

### Type
Functional

### Description
An authenticated user shall be able to create a structured Lost Report.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
The user is authenticated.

### Expected Behavior
Lost-and-Found Service validates and stores the report in the report lifecycle.

### Failure / Edge Cases
The exact mandatory fields and validation limits are `NEEDS_DECISION`.

### Acceptance Criteria
- A valid submission creates a Lost Report owned by Lost-and-Found Service.
- A newly created report does not bypass moderation before becoming ACTIVE.
- Invalid or incomplete input is rejected without creating an ACTIVE report.

### Related Requirements
- REPORT-003
- REPORT-006
- MOD-001

### Source
- Architecture design, "Main Workflow"
- Proposal, Sections 3.1 and 4

## REPORT-002 - Register a Found Report at the Lost-and-Found Counter

### Type
Functional

### Description
Staff shall be able to register an item received at the Lost-and-Found counter as a structured Found Report and manage its internal storage location.

### Actor / Owner
Staff / Lost-and-Found Service

### Preconditions
Staff is authenticated and has received the found item.

### Expected Behavior
The service stores the Found Report and its exact storage location as internal information.

### Failure / Edge Cases
Whether users may directly draft Found Reports before counter intake is `NEEDS_DECISION`.

### Acceptance Criteria
- Staff can create a Found Report for an item received at the counter.
- Exact storage location is not included in public report data.
- The report follows moderation before becoming ACTIVE.

### Related Requirements
- REPORT-003
- MOD-001
- SEC-004

### Source
- Proposal, Sections 3.1 and 4, "Cán bộ và quản trị viên"

## REPORT-003 - Validate and Separate Report Data

### Type
Functional

### Description
Lost-and-Found Service shall validate the minimum report data and separate public item attributes from secret ownership characteristics and private contact data.

### Actor / Owner
Lost-and-Found Service

### Preconditions
A Lost Report or Found Report is submitted.

### Expected Behavior
The service stores structured report data while keeping secret and private data isolated from public views, matching events, and AI inputs.

### Failure / Edge Cases
The exact minimum field set and classification of each field are `NEEDS_DECISION`.

### Acceptance Criteria
- A report cannot become ACTIVE without the source-required minimum data.
- Secret ownership characteristics remain in Lost-and-Found Service.
- Public and private report attributes can be handled separately.

### Related Requirements
- SEC-003
- EVENT-004
- AI-005

### Source
- Architecture design, "Lost-and-Found Service" and "Security and Privacy"
- Proposal, Sections 3.1 and 5

## REPORT-004 - Publish Only Masked Found-Report Information

### Type
Functional

### Description
The system shall expose only moderated and masked Found Report information in public-facing views.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
The Found Report has been approved for public display.

### Expected Behavior
Public views omit secret characteristics, private contact data, original protected data, and exact storage location.

### Failure / Edge Cases
The masking policy per field is `NEEDS_DECISION`.

### Acceptance Criteria
- A non-approved Found Report is not publicly visible.
- Public views contain no secret ownership evidence or exact storage location.
- Authorized staff retains access required for verification.

### Related Requirements
- MOD-001
- SEC-003
- SEC-004

### Source
- Proposal, Sections 2, 3, and 4
- Architecture design, "Security and Privacy"

## REPORT-005 - Track and Permittedly Update Reports

### Type
Functional

### Description
Users shall be able to track their reports and update report information only when the lifecycle and authorization rules permit it.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
The user owns the report and is authenticated.

### Expected Behavior
The service returns the current state and accepts only permitted updates.

### Failure / Edge Cases
Editable fields and states are `NEEDS_DECISION`.

### Acceptance Criteria
- A report owner can view the current report state.
- An update that is not permitted by state or authorization is rejected.
- Accepted changes are auditable when they are sensitive.

### Related Requirements
- REPORT-006
- AUDIT-001

### Source
- Proposal, Section 4, "Người dùng"
- Architecture design, "Lost-and-Found Service"

## REPORT-006 - Enforce the Report State Machine

### Type
Functional

### Description
Lost-and-Found Service shall enforce the baseline report lifecycle `DRAFT -> PENDING_REVIEW -> ACTIVE -> RESERVED -> RESOLVED` and support the source-defined terminal or visibility states `REJECTED`, `HIDDEN`, and `EXPIRED`.

### Actor / Owner
Lost-and-Found Service

### Preconditions
A report exists.

### Expected Behavior
Only source-supported transitions are allowed and material transitions are recorded.

### Failure / Edge Cases
Transitions to and from `REJECTED`, `HIDDEN`, and `EXPIRED`, including restore/reopen behavior, are `NEEDS_DECISION`.

### Acceptance Criteria
- The baseline sequential lifecycle is represented exactly as specified.
- An undocumented transition is not treated as accepted behavior.
- Ambiguous branch transitions remain marked for decision rather than invented.

### Related Requirements
- MOD-001
- MOD-002
- HANDOVER-003
- EVENT-001
- EVENT-003

### Source
- Proposal, Section 3.1, "Trạng thái chính của tin"
- Architecture design, "Lost-and-Found Service"

## MOD-001 - Moderate Reports Before Activation

### Type
Functional

### Description
Staff shall review a pending report and either approve or reject it before public activation.

### Actor / Owner
Staff / Lost-and-Found Service

### Preconditions
The report is in `PENDING_REVIEW`.

### Expected Behavior
Approval commits the report as `ACTIVE` and triggers `ReportActivated`; rejection moves it to `REJECTED` according to the source-supported workflow.

### Failure / Edge Cases
Moderation criteria and rejection reasons are `NEEDS_DECISION`.

### Acceptance Criteria
- Only authorized Staff or Admin can moderate reports.
- `ReportActivated` is emitted only after the ACTIVE state is committed.
- Rejected reports do not enter the active matching read model.

### Related Requirements
- REPORT-006
- EVENT-001
- AUDIT-001

### Source
- Architecture design, "Main Workflow" and "Asynchronous Events"
- Proposal, Sections 3.1 and 4

## MOD-002 - Hide or Expire Reports Under Business Rules

### Type
Functional

### Description
Authorized staff shall be able to hide or expire reports when source-supported business rules apply.

### Actor / Owner
Staff, Admin / Lost-and-Found Service

### Preconditions
A report exists and the actor is authorized.

### Expected Behavior
The report becomes `HIDDEN` or `EXPIRED` and is no longer presented as an active public candidate when appropriate.

### Failure / Edge Cases
Automatic expiration duration, restoration, and whether these transitions emit `ReportResolved` are `NEEDS_DECISION`.

### Acceptance Criteria
- Only authorized actors can hide or expire a report.
- A hidden or expired report is not shown as an ACTIVE public candidate.
- Undefined restoration or closure behavior is not assumed.

### Related Requirements
- REPORT-006
- EVENT-003
- MATCH-001

### Source
- Proposal, Sections 3.1 and 4

## MOD-003 - Audit Moderation Decisions

### Type
Functional

### Description
Lost-and-Found Service shall record material moderation actions for later review.

### Actor / Owner
Staff, Admin / Lost-and-Found Service

### Preconditions
A moderation action occurs.

### Expected Behavior
The action is associated with the report, actor, action, and time at a conceptual level.

### Failure / Edge Cases
Audit retention and detailed record fields are `NEEDS_DECISION`.

### Acceptance Criteria
- Approval, rejection, hiding, and expiration actions are auditable.
- Audit records are not exposed in public report views.
- Audit failure handling is documented before implementation.

### Related Requirements
- AUDIT-001
- SEC-004

### Source
- Proposal, Sections 1, 4, and 5
- Architecture design, "Security and Privacy"

## MATCH-001 - Maintain an ACTIVE-Report Read Model

### Type
Functional

### Description
Matching Service shall maintain a minimal read model of ACTIVE public reports from domain events.

### Actor / Owner
Matching Service

### Preconditions
Matching Service receives a valid report lifecycle event.

### Expected Behavior
The read model contains only the approved attributes needed for candidate selection and excludes secret ownership evidence.

### Failure / Edge Cases
Exact read-model fields are `NEEDS_DECISION`.

### Acceptance Criteria
- `ReportActivated` can add or update an ACTIVE report representation idempotently.
- `ReportResolved` can deactivate or remove affected candidates.
- The read model is owned by Matching Service in `matching_schema`.

### Related Requirements
- EVENT-001
- EVENT-003
- ARCH-003
- SEC-003

### Source
- Architecture design, "Matching Service" and "Main Workflow"
- Proposal, Sections 3 and 5

## MATCH-002 - Hard-Filter Match Candidates

### Type
Functional

### Description
Matching Service shall reduce the candidate set using report/item type, item category, time window, and location range when supported by available report data.

### Actor / Owner
Matching Service

### Preconditions
An ACTIVE report and an ACTIVE-report read model exist.

### Expected Behavior
Candidates failing the hard constraints are excluded before Rule Score or AI processing.

### Failure / Edge Cases
Time-window size, location-distance calculation, and missing-attribute policy are `NEEDS_DECISION`.

### Acceptance Criteria
- Candidate filtering occurs before Rule Score and AI calls.
- The filter uses only public or approved matching attributes.
- A filtered-out candidate is not sent to AI for that matching run.

### Related Requirements
- MATCH-001
- MATCH-004
- SEC-003

### Source
- Architecture design, "Matching Service"
- Proposal, Sections 3.1 and 3.2

## MATCH-003 - Calculate the Baseline Rule Score

### Type
Functional

### Description
Matching Service shall calculate Rule Score using the baseline weights: item category 30%, color 20%, time 15%, location 20%, and description 15%.

### Actor / Owner
Matching Service

### Preconditions
A candidate passed hard filtering.

### Expected Behavior
The service computes a reproducible total and component scores using the fixed planning baseline.

### Failure / Edge Cases
Normalization formulas, missing-value treatment, thresholds, and later weight calibration are `NEEDS_DECISION`.

### Acceptance Criteria
- The five baseline weights equal 100%.
- Planning does not silently change the specified weights.
- The same inputs and scoring configuration produce the same score breakdown.

### Related Requirements
- MATCH-005
- REL-001

### Source
- Proposal, Section 3.2
- Architecture design, "Matching Service"

## MATCH-004 - Invoke AI Only for a Reduced Candidate Set

### Type
Functional

### Description
Matching Service may request AI similarity only after hard filtering and Rule Score have reduced the candidate set.

### Actor / Owner
Matching Service

### Preconditions
Rule-based candidate processing has completed and AI is enabled and available.

### Expected Behavior
Only approved candidate attributes are sent to AI under a strict timeout.

### Failure / Edge Cases
Candidate-count threshold, score threshold, timeout value, and AI invocation policy are `NEEDS_DECISION`.

### Acceptance Criteria
- AI is not called for candidates rejected by hard filtering.
- Disabling AI leaves Rule Score matching functional.
- Secret evidence is never included in an AI request.

### Related Requirements
- AI-005
- REL-001
- SEC-003

### Source
- Architecture design, "Matching Service" and "Main Workflow"
- Proposal, Sections 3.2 and 3.3

## MATCH-005 - Rank Candidates with Explainable Scores

### Type
Functional

### Description
Matching Service shall rank retained candidates and store the total score and score breakdown used for each result.

### Actor / Owner
Matching Service

### Preconditions
Candidate filtering and Rule Score calculation have completed; optional AI signals may be available.

### Expected Behavior
The stored result explains why a candidate was ranked and whether AI contributed.

### Failure / Edge Cases
Final score-combination formula, tie-breaking, and display wording are `NEEDS_DECISION`.

### Acceptance Criteria
- Every stored result includes Rule Score component values.
- The result identifies whether AI was used or unavailable.
- Ranking output does not state that ownership has been proven.

### Related Requirements
- MATCH-003
- AI-005
- MATCH-007

### Source
- Architecture design, "Matching Service"
- Proposal, Sections 2, 3.2, and 7

## MATCH-006 - Retain Match History and Detect Potential Duplicates

### Type
Functional

### Description
Matching Service shall retain match-result history and support identifying potentially duplicate reports as a matching outcome.

### Actor / Owner
Matching Service

### Preconditions
A matching run has been performed.

### Expected Behavior
Results are stored in `matching_schema` for traceability and later evaluation.

### Failure / Edge Cases
Duplicate thresholds, retention, feedback labels, and automatic merge behavior are `NEEDS_DECISION`; automatic merging is not authorized by source.

### Acceptance Criteria
- Matching history is owned by Matching Service.
- Potential duplicates are presented as candidates rather than automatically merged.
- Reprocessing the same event does not create a duplicate stored result.

### Related Requirements
- MATCH-005
- EVENT-005
- REL-003

### Source
- Proposal, Section 4, "Ghép nối, thông báo và truy vết"
- Architecture design, "Matching Service"

## MATCH-007 - Emit MatchFound After Persisting Ranked Results

### Type
Functional

### Description
Matching Service shall publish `MatchFound` only after ranked candidates and their score breakdown have been stored.

### Actor / Owner
Matching Service

### Preconditions
A matching run has produced a stored ranked result.

### Expected Behavior
The event signals that a match result is available without carrying secret evidence.

### Failure / Edge Cases
The minimum score or candidate count required to emit the event is `NEEDS_DECISION`.

### Acceptance Criteria
- An event is not emitted before its referenced result is stored.
- Duplicate processing does not create duplicate results or notifications.
- Event payload obeys EVENT-004.

### Related Requirements
- EVENT-002
- EVENT-004
- REL-003

### Source
- Architecture design, "Asynchronous Events" and "Main Workflow"
- Proposal, Section 3.1

## MATCH-008 - Evaluate Matching Quality and Cost

### Type
Functional

### Description
The project shall evaluate matching using Recall@1, Recall@5, Mean Reciprocal Rank, response time, and average AI calls per report, including a Rule-only versus Rule-plus-AI comparison.

### Actor / Owner
Project owner / Matching Service evaluation scope

### Preconditions
An approved test dataset or consented data and reproducible matching configurations exist.

### Expected Behavior
Both matching modes are evaluated using the same labeled cases and reported separately.

### Failure / Edge Cases
Dataset composition, split strategy, sample size, target thresholds, and evaluation tooling are `NEEDS_DECISION`.

### Acceptance Criteria
- Results include Recall@1, Recall@5, and MRR for Rule-only and Rule-plus-AI.
- Response time and average AI calls per report are measured.
- Secret ownership evidence is not used to train the model.

### Related Requirements
- AI-005
- SEC-006

### Source
- Proposal, Sections 2, 3.2, 6, and 7
- Architecture design, "Testing and Verification"

## AI-001 - Compute Image Similarity

### Type
Functional

### Description
AI Inference Service may compute an image-similarity signal for approved report images or image references.

### Actor / Owner
Matching Service / AI Inference Service

### Preconditions
AI is enabled, a reduced candidate set exists, and the input is approved for AI processing.

### Expected Behavior
AI Inference Service returns a similarity signal without making a domain decision.

### Failure / Edge Cases
Model, preprocessing, score range, image-reference transport, and threshold are `NEEDS_DECISION`.

### Acceptance Criteria
- The output is a similarity signal, not an ownership verdict.
- The service receives no secret ownership evidence.
- Timeout or failure invokes REL-001 behavior.

### Related Requirements
- MATCH-004
- AI-005
- REL-001

### Source
- Architecture design, "AI Inference Service"
- Proposal, Section 3.3

## AI-002 - Compute Semantic Text Similarity

### Type
Functional

### Description
AI Inference Service may compute semantic similarity between approved public report descriptions.

### Actor / Owner
Matching Service / AI Inference Service

### Preconditions
AI is enabled and the descriptions belong to the reduced candidate set.

### Expected Behavior
The service returns a semantic-similarity signal for candidate reranking.

### Failure / Edge Cases
Language coverage, model, score calibration, and maximum text length are `NEEDS_DECISION`.

### Acceptance Criteria
- Only public or deliberately approved description text is processed.
- The result remains advisory.
- Rule Score remains usable without the result.

### Related Requirements
- MATCH-004
- AI-005
- REL-001

### Source
- Architecture design, "AI Inference Service"
- Proposal, Section 3.3

## AI-003 - Suggest a Draft Description from an Image

### Type
Functional

### Description
If this optional source-supported capability is included, AI may suggest a draft report description from an approved image for the user to review and edit.

### Actor / Owner
User / AI Inference Service, with report persistence owned by Lost-and-Found Service

### Preconditions
The user provides an approved image and explicitly uses the suggestion capability.

### Expected Behavior
The output is an editable draft and is not stored as confirmed report content until the user accepts or modifies it.

### Failure / Edge Cases
Whether this capability is included in Phase 1, its language support, and content-safety behavior are `NEEDS_DECISION`.

### Acceptance Criteria
- The suggestion is visibly a draft.
- The user can edit or reject it before report submission.
- Failure does not block manual report creation.

### Related Requirements
- REPORT-001
- REL-001

### Source
- Proposal, Section 3.3

## AI-004 - Keep AI Inference Stateless and Replaceable in Phase 1

### Type
Architecture

### Description
AI Inference Service shall remain stateless and replaceable in Phase 1.

### Actor / Owner
AI Inference Service

### Preconditions
Phase 1 architecture is used.

### Expected Behavior
The service performs inference without owning business workflow state; Matching Service owns stored embeddings, scoring records, and model metadata.

### Failure / Edge Cases
The exact model-metadata format and whether embeddings are initially persisted are `NEEDS_DECISION`.

### Acceptance Criteria
- Restarting AI Inference Service does not lose domain workflow state.
- AI Inference Service does not own claim, report, or match-result records.
- Replacing the AI implementation does not require changing the core workflow boundary.

### Related Requirements
- ARCH-001
- MATCH-005

### Source
- Architecture design, "AI Inference Service" and "Key Trade-offs"
- Proposal, Section 5

## AI-005 - Enforce the AI Decision and Privacy Boundary

### Type
Security

### Description
AI shall remain a supporting signal and shall not approve claims, determine ownership, conclusively identify two reports as the same item, or receive secret ownership or claim evidence.

### Actor / Owner
AI Inference Service, Matching Service, Lost-and-Found Service

### Preconditions
Any AI capability is invoked.

### Expected Behavior
Only public or deliberately approved attributes are provided, and domain decisions remain in Lost-and-Found Service with authorized staff.

### Failure / Edge Cases
Any requested AI behavior outside this boundary is a change requirement and requires explicit source revision.

### Acceptance Criteria
- No AI response directly changes claim approval or ownership state.
- No AI request contains secret ownership evidence or claim evidence.
- AI output is labeled and handled as advisory similarity or draft content.

### Related Requirements
- CLAIM-004
- VERIFY-003
- SEC-003
- REL-001

### Source
- Architecture design, "AI Inference Service" and "Security and Privacy"
- Proposal, Sections 2, 3.3, and 7

## CLAIM-001 - Submit a Claim Through Either Supported Entry Path

### Type
Functional

### Description
An authenticated user shall be able to submit a Direct Claim from a Found Report or submit a claim from a match result associated with a Lost Report.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
The referenced report is available for claiming and the user is authenticated.

### Expected Behavior
Both entry paths create a claim in the same Lost-and-Found Service workflow.

### Failure / Edge Cases
Claim eligibility by report state, self-claim prevention, and duplicate active claims by one user are `NEEDS_DECISION`.

### Acceptance Criteria
- Both source-supported entry paths are represented.
- Matching Service does not create or own the claim.
- An invalid reference does not create a claim.

### Related Requirements
- CLAIM-002
- CLAIM-003
- ARCH-001

### Source
- Proposal, Sections 3, 3.1, and 4
- Architecture design, "Main Workflow"

## CLAIM-002 - Capture Ownership Evidence Privately

### Type
Functional

### Description
A claimant shall provide secret characteristics or ownership evidence for Lost-and-Found Service to store and present only to authorized reviewers.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
A claim submission is being created or additional information has been requested.

### Expected Behavior
The evidence is stored separately from public report data and excluded from matching and AI flows.

### Failure / Edge Cases
Supported evidence types, file limits, retention, and redaction rules are `NEEDS_DECISION`.

### Acceptance Criteria
- Claim evidence is owned by Lost-and-Found Service.
- Public report views, Matching Service, AI Inference Service, and domain events receive no claim evidence.
- Unauthorized actors cannot view the evidence.

### Related Requirements
- SEC-003
- VERIFY-001
- EVENT-004

### Source
- Architecture design, "Lost-and-Found Service" and "Security and Privacy"
- Proposal, Sections 1, 2, and 3.1

## CLAIM-003 - Enforce the Claim State Machine

### Type
Functional

### Description
Lost-and-Found Service shall enforce the baseline claim lifecycle `SUBMITTED -> UNDER_REVIEW -> NEED_MORE_INFORMATION -> APPROVED -> HANDOVER_SCHEDULED -> COMPLETED`, with invalid claims able to become `REJECTED`.

### Actor / Owner
Lost-and-Found Service

### Preconditions
A claim exists.

### Expected Behavior
Only source-supported state changes are accepted and material changes are recorded.

### Failure / Edge Cases
Whether `NEED_MORE_INFORMATION` returns to `UNDER_REVIEW`, cancellation behavior, and transitions out of `REJECTED` are `NEEDS_DECISION`.

### Acceptance Criteria
- The baseline states are represented exactly.
- Undocumented transitions are not treated as accepted behavior.
- Each material state change is auditable.

### Related Requirements
- CLAIM-004
- HANDOVER-001
- AUDIT-001

### Source
- Proposal, Section 3.1, "Trạng thái chính của claim"

## CLAIM-004 - Review and Decide Claims Through Staff Workflow

### Type
Functional

### Description
Authorized staff shall compare claims, request more information, preliminarily approve a claim, or reject it based on evidence and direct verification.

### Actor / Owner
Staff / Lost-and-Found Service

### Preconditions
A claim is submitted or under review.

### Expected Behavior
The decision is made by authorized staff, recorded in the claim lifecycle, and never delegated to AI or Matching Service.

### Failure / Edge Cases
Approval criteria, scoring presentation to staff, reason codes, and separation-of-duty rules are `NEEDS_DECISION`.

### Acceptance Criteria
- Staff can request additional information without exposing another claimant's evidence.
- AI and Matching Service cannot approve or reject a claim.
- Approval or rejection is recorded and auditable.

### Related Requirements
- AI-005
- VERIFY-002
- AUDIT-001

### Source
- Proposal, Sections 3.1 and 4
- Architecture design, "Main Workflow"

## CLAIM-005 - Handle Multiple Claims and Disputes

### Type
Functional

### Description
Lost-and-Found Service shall support multiple claims for one item and keep dispute handling within the service in Phase 1.

### Actor / Owner
Staff, Admin / Lost-and-Found Service

### Preconditions
Multiple claims or a dispute exists for the same report or handover.

### Expected Behavior
Authorized actors can review the competing claims and related history without creating a standalone Dispute Service.

### Failure / Edge Cases
Priority rules, reservation semantics, dispute outcomes, escalation, and appeal are `NEEDS_DECISION`.

### Acceptance Criteria
- Multiple claims can be represented without overwriting one another.
- Dispute data remains in Lost-and-Found Service in Phase 1.
- No automatic ownership decision is inferred from matching rank.

### Related Requirements
- CLAIM-004
- ARCH-007
- AUDIT-001

### Source
- Proposal, Sections 1, 2, and 4
- Architecture design, "Lost-and-Found Service" and "Key Trade-offs"

## VERIFY-001 - Restrict Access to Verification Evidence

### Type
Security

### Description
Only authorized staff or administrators shall be able to view secret ownership characteristics and claim evidence for verification.

### Actor / Owner
Staff, Admin / Lost-and-Found Service

### Preconditions
The actor is authenticated and assigned an authorized role.

### Expected Behavior
Evidence access is authorized by Lost-and-Found Service and recorded as a sensitive action.

### Failure / Edge Cases
Fine-grained permissions, evidence redaction, and emergency access are `NEEDS_DECISION`.

### Acceptance Criteria
- User-facing public APIs do not return secret evidence.
- Matching and AI paths cannot retrieve the evidence.
- Authorized evidence access creates an audit record.

### Related Requirements
- CLAIM-002
- SEC-002
- AUDIT-001

### Source
- Architecture design, "Security and Privacy"
- Proposal, Sections 2, 3.1, and 5

## VERIFY-002 - Perform Direct Ownership Verification

### Type
Functional

### Description
Staff shall verify claimant identity and ownership evidence directly before confirming handover.

### Actor / Owner
Staff / Lost-and-Found Service

### Preconditions
A claim has passed preliminary review and the claimant attends the handover process.

### Expected Behavior
Staff compares identity and evidence and records the verification outcome.

### Failure / Edge Cases
Accepted identity documents, remote verification, failure attempts, and retry limits are `NEEDS_DECISION`.

### Acceptance Criteria
- Handover is not completed without a recorded verification outcome.
- Verification remains a human/staff business decision.
- Failed verification does not automatically expose secret characteristics to the claimant.

### Related Requirements
- CLAIM-004
- HANDOVER-002
- VERIFY-003

### Source
- Proposal, Sections 2, 3.1, and 4
- Architecture design, "Main Workflow"

## VERIFY-003 - Exclude AI from Ownership Verification

### Type
Security

### Description
AI and Matching Service shall not determine the verification outcome or ownership.

### Actor / Owner
Lost-and-Found Service

### Preconditions
A claim is under review or verification.

### Expected Behavior
Only authorized workflow actions in Lost-and-Found Service can record approval, rejection, or successful verification.

### Failure / Edge Cases
Any proposed automated approval is a change requirement requiring explicit source revision.

### Acceptance Criteria
- No AI or matching response directly changes claim or verification state.
- Ranking is presented only as supporting information.
- Verification decisions identify the authorized actor responsible.

### Related Requirements
- AI-005
- CLAIM-004
- AUDIT-001

### Source
- Architecture design, "AI Inference Service"
- Proposal, Sections 2 and 3.3

## HANDOVER-001 - Schedule an Approved Handover

### Type
Functional

### Description
Staff shall be able to schedule pickup at the Lost-and-Found counter after a claim is approved.

### Actor / Owner
Staff / Lost-and-Found Service

### Preconditions
The claim is `APPROVED`.

### Expected Behavior
An appointment is recorded and the claim advances to `HANDOVER_SCHEDULED`.

### Failure / Edge Cases
Appointment duration, rescheduling, cancellation, no-show, and counter-hours rules are `NEEDS_DECISION`.

### Acceptance Criteria
- Only an approved claim can be scheduled.
- The claimant can view the appointment.
- Scheduling remains inside Lost-and-Found Service in Phase 1.

### Related Requirements
- CLAIM-003
- NOTIFY-001
- ARCH-007

### Source
- Proposal, Sections 3.1 and 4
- Architecture design, "Main Workflow"

## HANDOVER-002 - Confirm Handover with Time-Limited QR or OTP

### Type
Functional

### Description
Lost-and-Found Service shall support a time-limited QR code or OTP as a handover confirmation mechanism after direct verification.

### Actor / Owner
Staff, User / Lost-and-Found Service

### Preconditions
The claim is `HANDOVER_SCHEDULED` and direct verification succeeds.

### Expected Behavior
The service validates the confirmation mechanism and records successful or failed attempts.

### Failure / Edge Cases
Selection between QR and OTP, lifetime, attempt limit, delivery channel, renewal, and offline handling are `NEEDS_DECISION`.

### Acceptance Criteria
- An expired or invalid QR/OTP cannot complete handover.
- Successful confirmation is tied to the scheduled claim.
- Verification and confirmation actions are auditable and rate-limited where applicable.

### Related Requirements
- VERIFY-002
- SEC-005
- AUDIT-001

### Source
- Proposal, Sections 3.1 and 4
- Architecture design, "Main Workflow" and "Security and Privacy"

## HANDOVER-003 - Complete Handover and Resolve the Report

### Type
Functional

### Description
After successful verification and handover confirmation, Lost-and-Found Service shall complete the claim, resolve the report, store the handover history, and publish `ReportResolved`.

### Actor / Owner
Staff / Lost-and-Found Service

### Preconditions
The claim is scheduled, direct verification succeeded, and confirmation is valid.

### Expected Behavior
The claim becomes `COMPLETED`, the report becomes `RESOLVED`, an audit trail is retained, and Matching Service is notified through the domain event.

### Failure / Edge Cases
Partial handover, rollback after physical transfer, and resolution of linked counterpart reports are `NEEDS_DECISION`.

### Acceptance Criteria
- Completion updates claim and report state within Lost-and-Found Service.
- `ReportResolved` is emitted after the state is committed.
- Matching Service can deactivate related candidates without accessing claim evidence.

### Related Requirements
- EVENT-003
- REPORT-006
- AUDIT-001

### Source
- Architecture design, "Main Workflow" and "Asynchronous Events"
- Proposal, Sections 3.1 and 4

## NOTIFY-001 - Notify Users of Matches and Workflow Changes

### Type
Functional

### Description
Lost-and-Found Service shall provide in-system and email notifications for matching results and relevant workflow-state changes in Phase 1.

### Actor / Owner
User / Lost-and-Found Service

### Preconditions
A source-supported notification trigger occurs and the user is eligible to receive it.

### Expected Behavior
The notification communicates the relevant result or state change without exposing secret evidence.

### Failure / Edge Cases
Complete trigger list, templates, preferences, retry policy, email provider, and delivery guarantees are `NEEDS_DECISION`.

### Acceptance Criteria
- A `MatchFound` result can produce a user notification.
- Notifications contain no secret ownership or claim evidence.
- Notification delivery failure does not roll back the domain workflow.

### Related Requirements
- EVENT-002
- SEC-003
- REL-003

### Source
- Architecture design, "Lost-and-Found Service" and "Main Workflow"
- Proposal, Sections 4 and 6

## NOTIFY-002 - Keep Phase 1 Notification Ownership in Lost-and-Found Service

### Type
Functional

### Description
User notification behavior shall remain inside Lost-and-Found Service during Phase 1 and shall not be extracted as a standalone Notification Service.

### Actor / Owner
Lost-and-Found Service

### Preconditions
Phase 1 architecture is in use.

### Expected Behavior
Notification creation follows Lost-and-Found workflow ownership while duplicate events do not create duplicate notifications.

### Failure / Edge Cases
Extraction criteria and Phase 2 delivery-channel expansion remain roadmap decisions.

### Acceptance Criteria
- Phase 1 component inventory contains no standalone Notification Service.
- The same event is not allowed to create duplicate notifications.
- Future extraction requires a clear business, data, workload, or operational boundary.

### Related Requirements
- ARCH-007
- EVENT-005
- REL-003

### Source
- Architecture design, "Lost-and-Found Service," "Non-goals for Phase 1," and "Evolution Roadmap"
- Proposal, Sections 5 and 6

## ADMIN-001 - Manage Accounts and Roles

### Type
Functional

### Description
Authorized administrators shall manage accounts and role assignments through Identity Service capabilities.

### Actor / Owner
Admin / Identity Service

### Preconditions
The administrator is authenticated and authorized.

### Expected Behavior
Account and role changes are applied within the identity boundary and sensitive changes are audited.

### Failure / Edge Cases
Account states, suspension, deletion, invitation, and role-assignment workflow are `NEEDS_DECISION`.

### Acceptance Criteria
- Account and role data remain in `identity_schema`.
- Unauthorized users cannot perform administrative account actions.
- Material administrative changes are auditable.

### Related Requirements
- AUTH-003
- AUDIT-001
- ARCH-003

### Source
- Proposal, Sections 1 and 4
- Architecture design, "Identity Service"

## ADMIN-002 - View Operational Statistics and Manage Supported Configuration

### Type
Functional

### Description
Authorized administrators shall be able to view operational statistics and manage source-supported system configuration.

### Actor / Owner
Admin / Owning service for each configuration or metric

### Preconditions
The administrator is authenticated and authorized.

### Expected Behavior
The system presents operational information without transferring domain-data ownership to the API Gateway or an unrelated service.

### Failure / Edge Cases
Dashboard metrics, configuration keys, write ownership, and aggregation method are `NEEDS_DECISION`.

### Acceptance Criteria
- Access is restricted to authorized administrators.
- Statistics do not expose secret evidence.
- Configuration changes are applied by the owning component and audited when sensitive.

### Related Requirements
- AUDIT-001
- OPS-003
- SEC-002

### Source
- Proposal, Sections 1 and 4

## AUDIT-001 - Audit Sensitive Business and Security Actions

### Type
Security

### Description
The system shall audit sensitive actions including evidence access, report moderation, claim-state changes, verification, handover confirmation, and material administrative changes.

### Actor / Owner
Domain service performing the action; Lost-and-Found Service for its business audit

### Preconditions
A sensitive action is attempted or completed.

### Expected Behavior
An audit record supports later inspection and dispute handling without becoming public report content.

### Failure / Edge Cases
Audit field set, retention, immutability, failure policy, and access roles are `NEEDS_DECISION`.

### Acceptance Criteria
- The actor, affected concept, action, outcome, and time are traceable at a conceptual level.
- Public users cannot browse sensitive audit records.
- Audit ownership follows the service that owns the affected domain data.

### Related Requirements
- MOD-003
- VERIFY-001
- HANDOVER-003
- SEC-004

### Source
- Architecture design, "Security and Privacy"
- Proposal, Sections 1, 4, and 5

## AUDIT-002 - Correlate Requests, Events, and Logs

### Type
Operational

### Description
The system shall propagate a correlation identifier on inbound requests and emitted events when applicable so operations can trace work across services.

### Actor / Owner
API Gateway and all backend services

### Preconditions
A request enters through the Gateway or a service emits an event.

### Expected Behavior
Logs and downstream communication retain correlation context without using it as a business identifier.

### Failure / Edge Cases
Identifier format, trusted-header rules, and retention are `NEEDS_DECISION`.

### Acceptance Criteria
- Gateway assigns or validates correlation context for public requests.
- Events include correlation context when related to a request or workflow.
- Logs can be searched by the same correlation value across participating components.

### Related Requirements
- EVENT-004
- OPS-003

### Source
- Architecture design, "API Gateway" and "Reliability and Recovery"
- Proposal, Section 5

## EVENT-001 - Publish and Consume ReportActivated

### Type
Architecture

### Description
Lost-and-Found Service shall publish `ReportActivated` after an approved report is committed as ACTIVE; Matching Service shall consume it to update its read model and start matching.

### Actor / Owner
Producer: Lost-and-Found Service / Consumer: Matching Service

### Preconditions
Moderation approved the report and the ACTIVE state is committed.

### Expected Behavior
The event causes idempotent read-model synchronization and matching without transferring secret data.

### Failure / Edge Cases
Topic name, payload fields, ordering scope, and compatibility policy are `NEEDS_DECISION`.

### Acceptance Criteria
- The event is not published for a rejected report.
- Consumer processing is idempotent.
- Matching failure does not roll back report activation.

### Related Requirements
- MOD-001
- MATCH-001
- REL-002

### Source
- Architecture design, "Asynchronous Events" and "Main Workflow"
- Proposal, Sections 3.1 and 5

## EVENT-002 - Publish and Consume MatchFound

### Type
Architecture

### Description
Matching Service shall publish `MatchFound` after ranked candidates are stored; Lost-and-Found Service may consume it for notification and related workflow behavior.

### Actor / Owner
Producer: Matching Service / Consumer: Lost-and-Found Service

### Preconditions
A ranked match result is persisted.

### Expected Behavior
The event identifies the available result without containing secret evidence or an ownership decision.

### Failure / Edge Cases
Minimum match threshold, whether zero-result runs emit an event, and exact consumer behavior are `NEEDS_DECISION`.

### Acceptance Criteria
- Stored results precede event publication.
- Lost-and-Found Service can handle duplicate delivery without duplicate notification.
- The event does not approve a claim.

### Related Requirements
- MATCH-007
- NOTIFY-001
- EVENT-004

### Source
- Architecture design, "Asynchronous Events" and "Main Workflow"
- Proposal, Sections 3.1 and 5

## EVENT-003 - Publish and Consume ReportResolved

### Type
Architecture

### Description
Lost-and-Found Service shall publish `ReportResolved` after handover completion or another source-supported report closure; Matching Service shall deactivate related candidates.

### Actor / Owner
Producer: Lost-and-Found Service / Consumer: Matching Service

### Preconditions
The report is committed as resolved or otherwise closed by a defined rule.

### Expected Behavior
Matching Service idempotently removes or deactivates stale candidate participation.

### Failure / Edge Cases
Which non-handover closures publish the event is `NEEDS_DECISION`, particularly `HIDDEN`, `EXPIRED`, and `REJECTED`.

### Acceptance Criteria
- Handover completion can trigger `ReportResolved` after commit.
- Matching Service does not need claim evidence to deactivate candidates.
- A stale or duplicate event cannot restore older read-model state.

### Related Requirements
- HANDOVER-003
- MATCH-001
- REL-006

### Source
- Architecture design, "Asynchronous Events" and "Main Workflow"
- Proposal, Sections 3.1 and 5

## EVENT-004 - Apply Event Metadata and Data-Minimization Rules

### Type
Architecture

### Description
Each domain event shall carry `eventId`, event type, aggregate identifier, aggregate version, timestamp, and correlation identifier when applicable, plus only the minimum approved business data required by consumers.

### Actor / Owner
All event producers

### Preconditions
A domain event is created.

### Expected Behavior
Metadata supports traceability, idempotency, and stale-event protection while payloads exclude secret item characteristics, secret ownership evidence, and claim evidence.

### Failure / Edge Cases
Identifier formats, envelope naming, serialization, schema registry, and exact event-specific fields are `NEEDS_DECISION`.

### Acceptance Criteria
- Every Phase 1 event includes the required conceptual metadata.
- Forbidden secret and claim data is absent.
- Consumers can identify the aggregate version and unique event.

### Related Requirements
- SEC-003
- REL-003
- REL-006
- AUDIT-002

### Source
- Architecture design, "Asynchronous Events" and "Security and Privacy"
- Proposal, Section 5

## EVENT-005 - Process Domain Events Idempotently

### Type
Architecture

### Description
Every Phase 1 event consumer shall detect prior processing by `eventId` or an equivalent mechanism and avoid duplicate business effects.

### Actor / Owner
Matching Service and Lost-and-Found Service event consumers

### Preconditions
An event is delivered, including possible redelivery.

### Expected Behavior
The consumer acknowledges or safely ignores already processed events without creating duplicate matches, notifications, or state transitions.

### Failure / Edge Cases
Processed-event retention, transaction boundary, and pruning are `NEEDS_DECISION`.

### Acceptance Criteria
- Replaying the same event does not duplicate a match result.
- Replaying the same `MatchFound` does not duplicate a notification.
- Idempotency handling is durable across consumer restart.

### Related Requirements
- REL-003
- MATCH-006
- NOTIFY-002

### Source
- Architecture design, "Reliability and Recovery"
- Proposal, Section 5

## SEC-001 - Expose Only the API Gateway Publicly

### Type
Security

### Description
The Web Client shall access backend capabilities only through the API Gateway; backend service endpoints shall not be directly public.

### Actor / Owner
Web Client / API Gateway and deployment environment

### Preconditions
The Phase 1 environment is running.

### Expected Behavior
Public traffic enters through the Gateway and is routed to internal services.

### Failure / Edge Cases
Network topology, TLS termination, and local-development exposure rules are `NEEDS_DECISION`.

### Acceptance Criteria
- Public clients have no supported direct route to a domain service.
- Gateway remains the only public API entry point.
- Gateway does not become the owner of domain data.

### Related Requirements
- ARCH-001
- SEC-002

### Source
- Architecture design, "API Gateway" and "Security and Privacy"
- Proposal, Section 5

## SEC-002 - Enforce Layered Authorization and Internal Credentials

### Type
Security

### Description
Gateway shall perform basic token validation, while each domain service shall independently authorize sensitive operations; service-to-service requests shall use explicit internal credentials.

### Actor / Owner
API Gateway and all backend services

### Preconditions
A public or internal request reaches a component.

### Expected Behavior
Gateway validation does not replace domain authorization, and internal callers are authenticated separately from public users.

### Failure / Edge Cases
Token standard, internal credential mechanism, key rotation, and authorization policy representation are `NEEDS_DECISION`.

### Acceptance Criteria
- A request passing Gateway validation can still be rejected by the owner service.
- Sensitive authorization decisions are not implemented solely in Gateway.
- Internal service calls require an explicit trusted identity mechanism.

### Related Requirements
- AUTH-002
- AUTH-003
- ARCH-005

### Source
- Architecture design, "API Gateway" and "Security and Privacy"

## SEC-003 - Isolate Secret Ownership and Claim Evidence

### Type
Security

### Description
Secret item characteristics, secret ownership evidence, and claim evidence shall remain inside Lost-and-Found Service and its owned storage boundary.

### Actor / Owner
Lost-and-Found Service

### Preconditions
Secret or claim evidence is submitted, read, or processed.

### Expected Behavior
The data is excluded from Matching Service, AI Inference Service, public views, and domain events.

### Failure / Edge Cases
Encryption, retention, deletion, malware scanning, and backup policy are `NEEDS_DECISION`.

### Acceptance Criteria
- No matching schema or AI request contains the protected evidence.
- Event payloads exclude the protected evidence.
- Only authorized Lost-and-Found Service workflows can access it.

### Related Requirements
- CLAIM-002
- VERIFY-001
- AI-005
- EVENT-004

### Source
- Architecture design, "Lost-and-Found Service," "AI Inference Service," and "Security and Privacy"
- Proposal, Sections 2, 3, and 5

## SEC-004 - Protect Contact, Original Media, and Exact Storage Location

### Type
Security

### Description
Private contact information, protected original images, and exact item storage location shall not be exposed in public report data; access rules and image metadata are owned by Lost-and-Found Service.

### Actor / Owner
Lost-and-Found Service

### Preconditions
A public view, media request, or internal evidence workflow is executed.

### Expected Behavior
Only masked or explicitly approved data is returned to the requester or downstream service.

### Failure / Edge Cases
Image variants, signed-reference mechanism, retention, and precise staff permissions are `NEEDS_DECISION`.

### Acceptance Criteria
- Public responses omit exact storage location and private contact information.
- Object Storage access follows metadata and access rules controlled by Lost-and-Found Service.
- Matching and AI receive approved references or attributes rather than unrestricted storage access.

### Related Requirements
- REPORT-004
- ARCH-006
- VERIFY-001

### Source
- Architecture design, "Data Ownership" and "Security and Privacy"
- Proposal, Sections 2 and 5

## SEC-005 - Rate-Limit Sensitive Public Operations

### Type
Security

### Description
API Gateway shall apply rate limits to login, claim creation, evidence attempts, and OTP verification.

### Actor / Owner
API Gateway, with policy input from the owning domain

### Preconditions
A listed operation is requested through the Gateway.

### Expected Behavior
Requests exceeding the configured policy are rejected or delayed without moving the business state incorrectly.

### Failure / Edge Cases
Limits, time windows, identity keys, distributed counters, and error format are `NEEDS_DECISION`.

### Acceptance Criteria
- Each listed sensitive operation has an explicit rate-limit policy before implementation completion.
- Rate limiting does not grant or deny claim ownership.
- Rejected OTP attempts do not complete handover.

### Related Requirements
- AUTH-001
- CLAIM-001
- HANDOVER-002

### Source
- Architecture design, "API Gateway" and "Security and Privacy"

## SEC-006 - Use Only Simulated or Consented Evaluation Data

### Type
Security

### Description
Testing and AI evaluation shall use simulated scenarios or explicitly consented data, and secret evidence shall not be used for model training.

### Actor / Owner
Project owner / Data preparation and AI evaluation scope

### Preconditions
A dataset is prepared for testing, evaluation, or future training.

### Expected Behavior
Dataset provenance and permitted use are known before processing.

### Failure / Edge Cases
Consent record format, anonymization, retention, and deletion are `NEEDS_DECISION`.

### Acceptance Criteria
- Unconsented production-like personal data is not used as test data.
- Secret ownership or claim evidence is excluded from model training.
- Evaluation data handling is documented before use.

### Related Requirements
- MATCH-008
- AI-005

### Source
- Proposal, Section 6

## REL-001 - Fall Back to Rule Score When AI Fails

### Type
Reliability

### Description
Matching Service shall continue with Rule Score when AI is disabled, times out, or returns an error.

### Actor / Owner
Matching Service

### Preconditions
A matching run reaches optional AI processing.

### Expected Behavior
The service records AI availability status and produces a Rule-based result without blocking report, claim, verification, or handover workflows.

### Failure / Edge Cases
Timeout duration, retry count, circuit-breaking policy, and user-facing indication are `NEEDS_DECISION`.

### Acceptance Criteria
- Rule-based matching completes when AI is unavailable.
- AI failure cannot roll back or invalidate an ACTIVE report.
- Claim, verification, and handover remain available without AI.

### Related Requirements
- MATCH-003
- MATCH-004
- AI-005

### Source
- Architecture design, "Reliability and Recovery"
- Proposal, Sections 3.3 and 5

## REL-002 - Isolate Matching Failure from Report Activation

### Type
Reliability

### Description
A Matching Service failure shall not roll back report creation, moderation, or ACTIVE state.

### Actor / Owner
Lost-and-Found Service and Matching Service

### Preconditions
A report has been committed as ACTIVE and matching fails.

### Expected Behavior
The report remains ACTIVE and the matching job can be retried.

### Failure / Edge Cases
Retry schedule, maximum attempts, manual recovery, and user messaging are `NEEDS_DECISION`.

### Acceptance Criteria
- Matching failure does not delete or invalidate the ACTIVE report.
- Retrying matching does not create duplicate match results.
- Report creation can succeed independently of Matching Service availability.

### Related Requirements
- EVENT-001
- REL-003
- MATCH-006

### Source
- Architecture design, "Reliability and Recovery"
- Proposal, Sections 3.1 and 5

## REL-003 - Prevent Duplicate Event Side Effects

### Type
Reliability

### Description
Event consumers shall prevent duplicate match results, notifications, and business transitions when an event is redelivered.

### Actor / Owner
All Phase 1 event consumers

### Preconditions
The broker delivers the same logical event more than once.

### Expected Behavior
The consumer uses `eventId` or an equivalent durable mechanism to make processing idempotent.

### Failure / Edge Cases
Idempotency storage retention and transaction boundaries are `NEEDS_DECISION`.

### Acceptance Criteria
- Duplicate `ReportActivated` does not create duplicate match results.
- Duplicate `MatchFound` does not create duplicate notifications.
- Duplicate `ReportResolved` does not create an invalid repeated transition.

### Related Requirements
- EVENT-005
- NOTIFY-002
- MATCH-006

### Source
- Architecture design, "Reliability and Recovery"
- Proposal, Section 5

## REL-004 - Preserve Events During Broker Outage with an Outbox Direction

### Type
Reliability

### Description
Producers shall follow an Outbox design direction so a business transaction does not require broker availability to commit.

### Actor / Owner
Event-producing stateful services

### Preconditions
A business change and related event must be committed.

### Expected Behavior
The business change and pending event are persistently associated, and publication can occur after broker recovery.

### Failure / Edge Cases
`NEEDS_DECISION`: the source establishes Outbox behavior as a reliability direction but says production-ready processing is completed in Phase 2; the minimum Phase 1 implementation and acceptance boundary are not explicit.

### Acceptance Criteria
- Planning does not require a distributed transaction with the broker.
- Broker unavailability does not force rollback of an otherwise valid business change.
- Phase 1 versus Phase 2 Outbox scope is decided before implementation of event producers is declared complete.

### Related Requirements
- EVENT-001
- EVENT-002
- EVENT-003
- OPS-003

### Source
- Architecture design, "Reliability and Recovery" and "Evolution Roadmap"
- Proposal, Sections 5 and 6

## REL-005 - Quarantine Repeated Event Failures

### Type
Reliability

### Description
Repeatedly failing messages shall have a Dead-letter Queue and controlled replay direction.

### Actor / Owner
Message-processing infrastructure and consuming service

### Preconditions
An event has exhausted its permitted processing retries.

### Expected Behavior
The event is isolated for inspection and later controlled replay rather than retried indefinitely.

### Failure / Edge Cases
`NEEDS_DECISION`: source places replay tooling completion in Phase 2; Phase 1 queue, retry, alert, and replay minimums are not explicit.

### Acceptance Criteria
- Planning distinguishes normal retry from repeated-failure quarantine.
- Controlled replay must preserve idempotency.
- Phase 1 versus Phase 2 DLQ scope is decided before operational completion is claimed.

### Related Requirements
- EVENT-005
- REL-003
- OPS-003

### Source
- Architecture design, "Reliability and Recovery" and "Evolution Roadmap"
- Proposal, Sections 5 and 6

## REL-006 - Reject Stale Event Updates

### Type
Reliability

### Description
Consumers shall compare aggregate version so an older event cannot overwrite newer read-model or workflow state.

### Actor / Owner
All consumers maintaining state from domain events

### Preconditions
An event applies to an aggregate already represented by the consumer.

### Expected Behavior
The consumer applies only a valid newer version or safely handles duplicate/equal versions.

### Failure / Edge Cases
Version numbering, gap handling, and out-of-order buffering policy are `NEEDS_DECISION`.

### Acceptance Criteria
- An event with an older aggregate version cannot replace newer state.
- Equal-version redelivery is handled idempotently.
- Version gaps are observable and not silently treated as complete synchronization.

### Related Requirements
- EVENT-004
- EVENT-005
- MATCH-001

### Source
- Architecture design, "Reliability and Recovery"
- Proposal, Section 5

## REL-007 - Bound Cross-Service Retries

### Type
Reliability

### Description
Cross-service retries shall be bounded and limited to safe operations; unsafe operations shall return a clear temporary-unavailable result rather than be blindly repeated.

### Actor / Owner
API Gateway and backend services making synchronous calls

### Preconditions
A cross-service synchronous request fails transiently.

### Expected Behavior
Safe calls may use bounded retry; non-idempotent or unsafe calls fail clearly without duplicate business effects.

### Failure / Edge Cases
Safe-operation classification, retry count, backoff, timeout, and error contract are `NEEDS_DECISION`.

### Acceptance Criteria
- No unbounded synchronous retry is permitted.
- A retry policy identifies whether the operation is safe to repeat.
- Failure does not silently duplicate claims, transitions, or handovers.

### Related Requirements
- ARCH-005
- REL-003

### Source
- Architecture design, "Reliability and Recovery"

## ARCH-001 - Use the Defined Phase 1 Component Set

### Type
Architecture

### Description
Phase 1 shall consist of Web Client, API Gateway, Identity Service, Lost-and-Found Service, Matching Service, AI Inference Service, Message Broker, PostgreSQL, Object Storage, and Audit/Observability infrastructure.

### Actor / Owner
Project architecture

### Preconditions
Phase 1 planning or implementation is performed.

### Expected Behavior
The component model preserves one Gateway and four independently deployable backend domain/inference services without inventing extra microservices.

### Failure / Edge Cases
Technology and framework choices are `NEEDS_DECISION` except where source explicitly states PostgreSQL and Docker Compose expectations.

### Acceptance Criteria
- All listed components appear in the Phase 1 architecture.
- API Gateway contains no domain data or business decision logic.
- Notification, Moderation, Handover, and Dispute are not standalone Phase 1 services.

### Related Requirements
- ARCH-002
- ARCH-007
- OPS-001

### Source
- Architecture design, "Phase 1 Architecture" and "Non-goals for Phase 1"
- Proposal, Sections 5 and 6

## ARCH-002 - Deploy Services Independently

### Type
Architecture

### Description
API Gateway, Identity Service, Lost-and-Found Service, Matching Service, and AI Inference Service shall run as separate processes with independent deployment lifecycles.

### Actor / Owner
Project architecture and operations

### Preconditions
The Phase 1 environment is assembled.

### Expected Behavior
Each service can start and be deployed without being an in-process module of another service.

### Failure / Edge Cases
Repository layout, packaging, runtime, and release versioning are `NEEDS_DECISION`.

### Acceptance Criteria
- Each service has an independent start/deploy boundary.
- A service failure does not require another service to share its process.
- Shared code does not collapse domain ownership.

### Related Requirements
- OPS-002
- ARCH-006

### Source
- Architecture design, "Goals," "Phase 1 Architecture," and "Development and Deployment"
- Proposal, Sections 5 and 6

## ARCH-003 - Give Each Stateful Service an Owned Schema and Database User

### Type
Architecture

### Description
Phase 1 shall use one PostgreSQL server with `identity_schema`, `lost_found_schema`, and `matching_schema`, each accessed by its owning service through a separate database user.

### Actor / Owner
Identity Service, Lost-and-Found Service, Matching Service

### Preconditions
Persistent storage is configured.

### Expected Behavior
Identity Service owns `identity_schema`, Lost-and-Found Service owns `lost_found_schema`, and Matching Service owns `matching_schema`.

### Failure / Edge Cases
Database name, migration tooling, credentials, and privilege DDL are `NEEDS_DECISION`.

### Acceptance Criteria
- Each stateful service can access its own schema.
- Its database user lacks direct read/write access to another service's schema.
- AI Inference Service owns no business database state in Phase 1.

### Related Requirements
- ARCH-004
- AI-004
- OPS-002

### Source
- Architecture design, "Data Ownership"
- Proposal, Sections 5 and 6

## ARCH-004 - Prohibit Cross-Schema Access

### Type
Architecture

### Description
A service shall not directly read from or write to another service's schema.

### Actor / Owner
All stateful services

### Preconditions
One service needs information owned by another.

### Expected Behavior
The information is obtained through a documented API contract or domain event.

### Failure / Edge Cases
Reporting/analytics replication and administrative cross-domain queries are `NEEDS_DECISION`.

### Acceptance Criteria
- No service credential grants direct cross-schema application access.
- Cross-domain information flow maps to an API or event contract.
- A convenience query is not accepted as justification for breaking ownership.

### Related Requirements
- ARCH-003
- ARCH-005
- SEC-002

### Source
- Architecture design, "Data Ownership"
- Proposal, Section 5

## ARCH-005 - Use REST and Domain Events for Cross-Service Communication

### Type
Architecture

### Description
Services shall communicate through documented synchronous REST contracts or asynchronous domain events according to response and workflow needs.

### Actor / Owner
API Gateway and all backend services

### Preconditions
Information or work crosses a service boundary.

### Expected Behavior
REST handles immediate-response use cases; the broker carries the three source-defined background events.

### Failure / Edge Cases
Protocol details, endpoint paths, broker technology, topic design, and delivery semantics are `NEEDS_DECISION`.

### Acceptance Criteria
- Web Client calls backend capabilities only through Gateway.
- Service-to-service data exchange uses a documented contract.
- No cross-service communication relies on direct schema access.

### Related Requirements
- EVENT-001
- EVENT-002
- EVENT-003
- ARCH-004

### Source
- Architecture design, "Communication Model"
- Proposal, Section 5

## ARCH-006 - Avoid Shared Domain Implementation

### Type
Architecture

### Description
Microservices shall not share entities, repositories, domain model implementations, or business logic; a shared package may contain only suitable versioned contracts.

### Actor / Owner
All backend services

### Preconditions
Shared project artifacts are introduced.

### Expected Behavior
Each service remains independently understandable and changeable within its boundary.

### Failure / Edge Cases
Exact shared-package contents, generation, and versioning mechanism are `NEEDS_DECISION`.

### Acceptance Criteria
- No shared package contains persistence entities or repositories.
- No shared package implements claim, report, matching, or authorization business rules.
- Any shared event contract is versioned and contains only contract definitions.

### Related Requirements
- ARCH-002
- ARCH-005

### Source
- Architecture design, "Development and Deployment"

## ARCH-007 - Resist Premature Service and Platform Expansion

### Type
Architecture

### Description
Phase 1 shall not add standalone Notification, Moderation, Handover, or Dispute services, nor Kubernetes, a general-purpose Saga framework, blockchain, payments, delivery/shipping, face recognition, real-time location tracking, or a free-form chatbot.

### Actor / Owner
Project architecture

### Preconditions
A component or feature expansion is proposed.

### Expected Behavior
Extraction or expansion is deferred unless a future source-approved business, data, workload, deployment, or operational boundary justifies it.

### Failure / Edge Cases
Complex service discovery and full production-grade distributed tracing are also Phase 1 non-goals; the exact threshold for later adoption is `NEEDS_DECISION`.

### Acceptance Criteria
- Phase 1 planning contains none of the prohibited additions as committed scope.
- Claims, verification, handover, disputes, moderation, and notification remain in Lost-and-Found Service in Phase 1.
- A new service proposal is treated as an architectural change requirement.

### Related Requirements
- ARCH-001
- NOTIFY-002
- CLAIM-005

### Source
- Architecture design, "Non-goals for Phase 1" and "Evolution Roadmap"
- Proposal, Section 6

## OPS-001 - Start the Full Local Phase 1 Environment with Docker Compose

### Type
Operational

### Description
The complete Phase 1 environment shall be startable locally with one Docker Compose command.

### Actor / Owner
Developer / Project operations

### Preconditions
Phase 1 implementation and required local configuration exist.

### Expected Behavior
The command starts the Web Client, Gateway, services, and required infrastructure dependencies for the end-to-end workflow.

### Failure / Edge Cases
Compose file organization, command spelling, secret injection, seed data, and readiness behavior are `NEEDS_DECISION`.

### Acceptance Criteria
- One documented Docker Compose command starts the full local environment.
- All required Phase 1 components are represented.
- A clean shutdown does not require undocumented manual process cleanup.

### Related Requirements
- ARCH-001
- ARCH-002
- OPS-002

### Source
- Architecture design, "Development and Deployment" and "Testing and Verification"

## OPS-002 - Provide Independent Service Operational Assets

### Type
Operational

### Description
Each backend service shall have its own process, configuration, health endpoint, migration lifecycle when stateful, and deployable image.

### Actor / Owner
Each backend service

### Preconditions
Implementation phase begins for the service.

### Expected Behavior
The service can be started, checked, configured, migrated where applicable, and packaged independently.

### Failure / Edge Cases
Health contract, configuration convention, image base, and migration tooling are `NEEDS_DECISION`.

### Acceptance Criteria
- Each service has an independently invokable health check.
- Stateful services apply only their owned migrations.
- Configuration and deployable image are not implicitly shared as one monolithic process.

### Related Requirements
- ARCH-002
- ARCH-003
- OPS-001

### Source
- Architecture design, "Development and Deployment"

## OPS-003 - Establish Phase-Appropriate Observability and Recovery Operations

### Type
Operational

### Description
Phase 1 planning shall include logs, correlation identifiers, operational metrics, and error alerts, while clearly deferring production-ready distributed tracing and complete Outbox/DLQ replay tooling to Phase 2 where the source does so.

### Actor / Owner
All services and Audit/Observability infrastructure

### Preconditions
The Phase 1 environment is operated.

### Expected Behavior
Operators can identify service and workflow failures at a baseline level without claiming Phase 2 operational maturity.

### Failure / Edge Cases
Metric set, alert thresholds, log platform, dashboards, retention, and the exact Phase 1 Outbox/DLQ minimum are `NEEDS_DECISION`.

### Acceptance Criteria
- Correlation-aware logs exist as a Phase 1 baseline expectation.
- Planning does not claim full production-grade distributed tracing in Phase 1.
- Phase 2 completion items are labeled as evolution, not silently mixed into Phase 1 acceptance.

### Related Requirements
- AUDIT-002
- REL-004
- REL-005

### Source
- Architecture design, "Non-goals for Phase 1," "Reliability and Recovery," and "Evolution Roadmap"
- Proposal, Sections 5 and 6
