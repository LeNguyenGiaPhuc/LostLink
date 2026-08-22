# LostLink API Planning

This file identifies source-supported API/use-case needs. It is not a final API specification.

All methods and paths below are marked `PROPOSED`; they are planning aids, not source requirements. Authentication scheme, versioning, request/response fields, error envelope, pagination, idempotency keys, and concurrency controls are `NEEDS_DECISION`.

The Web Client accesses these capabilities only through API Gateway. The Gateway routes to the listed Owner Service and does not own the use case.

## Authentication

### API-AUTH-001 - Sign In

- **Use Case:** Authenticate an account and obtain a token.
- **Actor:** User, Staff, Admin.
- **Owner Service:** Identity Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/auth/sessions` (`PROPOSED`).
- **Request Concept:** Authentication credentials; credential type is `NEEDS_DECISION`.
- **Response Concept:** Authentication result, token, and identity/role summary permitted for the client.
- **Relevant Requirement IDs:** AUTH-001, AUTH-002, SEC-005.
- **Notes:** Token format, refresh, expiry, revocation, and exact errors are `NEEDS_DECISION`.

## User / Profile

### API-USER-001 - View Own Profile

- **Use Case:** Retrieve the authenticated actor's profile and contact information.
- **Actor:** User, Staff, Admin.
- **Owner Service:** Identity Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/profile` (`PROPOSED`).
- **Request Concept:** Authenticated identity context.
- **Response Concept:** Permitted profile identity, contact information, and roles.
- **Relevant Requirement IDs:** USER-001, AUTH-003, SEC-002.
- **Notes:** Field set and masking are `NEEDS_DECISION`.

### API-USER-002 - Update Own Profile

- **Use Case:** Update permitted profile/contact information.
- **Actor:** User, Staff, Admin.
- **Owner Service:** Identity Service.
- **Proposed Method:** `PATCH` (`PROPOSED`).
- **Proposed Path:** `/api/profile` (`PROPOSED`).
- **Request Concept:** Only fields that Identity Service permits the actor to change.
- **Response Concept:** Updated permitted profile representation.
- **Relevant Requirement IDs:** USER-001, SEC-002.
- **Notes:** Editable fields, validation, and concurrency behavior are `NEEDS_DECISION`.

### API-USER-003 - View Personal Workflow Summary

- **Use Case:** View the actor's report/claim status, appointments, and handover history.
- **Actor:** User.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/me/workflow` (`PROPOSED`).
- **Request Concept:** Authenticated identity and optional filters.
- **Response Concept:** User-authorized report, claim, appointment, and handover summaries.
- **Relevant Requirement IDs:** USER-002, REPORT-005, CLAIM-003, HANDOVER-001.
- **Notes:** Whether this is one aggregate API or separate resources is `NEEDS_DECISION`.

## Lost / Found Reports

### API-REPORT-001 - Create Lost Report

- **Use Case:** Submit a structured Lost Report.
- **Actor:** User.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/lost-reports` (`PROPOSED`).
- **Request Concept:** Public item attributes, private contact context, secret characteristics, approved media references.
- **Response Concept:** Created report reference and current state.
- **Relevant Requirement IDs:** REPORT-001, REPORT-003, REPORT-006.
- **Notes:** Minimum fields, media upload flow, and initial `DRAFT` versus `PENDING_REVIEW` behavior are `NEEDS_DECISION`.

### API-REPORT-002 - Register Found Report

- **Use Case:** Register an item received at the Lost-and-Found counter.
- **Actor:** Staff.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/found-reports` (`PROPOSED`).
- **Request Concept:** Structured found-item information, protected characteristics, media references, and exact internal storage location.
- **Response Concept:** Created Found Report reference and current state.
- **Relevant Requirement IDs:** REPORT-002, REPORT-003, SEC-004.
- **Notes:** Whether users may create Found Report drafts is `NEEDS_DECISION`.

### API-REPORT-003 - Browse Public Found Reports

- **Use Case:** Browse/search moderated and masked Found Reports.
- **Actor:** User; public unauthenticated access is `NEEDS_DECISION`.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/found-reports` (`PROPOSED`).
- **Request Concept:** Source-supported filters and pagination; exact filters are `NEEDS_DECISION`.
- **Response Concept:** Masked public report summaries.
- **Relevant Requirement IDs:** REPORT-004, SEC-003, SEC-004.
- **Notes:** Must not expose private contact, exact storage location, or secret evidence.

### API-REPORT-004 - View a Permitted Report

- **Use Case:** View public report detail, owned report detail, or staff-authorized detail.
- **Actor:** User, Staff, Admin.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/reports/{reportId}` (`PROPOSED`).
- **Request Concept:** Report reference and authenticated context when required.
- **Response Concept:** Representation selected by authorization and privacy classification.
- **Relevant Requirement IDs:** REPORT-004, REPORT-005, VERIFY-001, SEC-004.
- **Notes:** A single route with role-sensitive views versus separate public/internal APIs is `NEEDS_DECISION`.

### API-REPORT-005 - Update an Owned Report

- **Use Case:** Update report information when state and authorization permit.
- **Actor:** User; Staff/Admin actions may use moderation APIs.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `PATCH` (`PROPOSED`).
- **Proposed Path:** `/api/reports/{reportId}` (`PROPOSED`).
- **Request Concept:** Permitted changed attributes.
- **Response Concept:** Updated report and current state.
- **Relevant Requirement IDs:** REPORT-005, REPORT-006, AUDIT-001.
- **Notes:** Editable fields/states and optimistic-concurrency mechanism are `NEEDS_DECISION`.

## Moderation

### API-MOD-001 - List Reports Awaiting Review

- **Use Case:** Retrieve a moderation queue.
- **Actor:** Staff, Admin.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/moderation/reports` (`PROPOSED`).
- **Request Concept:** Queue filters and pagination.
- **Response Concept:** Staff-authorized pending-report summaries.
- **Relevant Requirement IDs:** MOD-001, VERIFY-001, SEC-002.
- **Notes:** Queue ordering, assignment, and service-level targets are `NEEDS_DECISION`.

### API-MOD-002 - Apply a Moderation Decision

- **Use Case:** Approve, reject, hide, or expire a report under supported rules.
- **Actor:** Staff, Admin.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/moderation/reports/{reportId}/decisions` (`PROPOSED`).
- **Request Concept:** Requested source-supported action and reason/context.
- **Response Concept:** Resulting report state and audit reference/summary.
- **Relevant Requirement IDs:** MOD-001, MOD-002, MOD-003, REPORT-006, EVENT-001.
- **Notes:** Allowed transitions and required reasons are `NEEDS_DECISION`; no undocumented transition is implied by this proposed API.

## Matching

### API-MATCH-001 - View Match Results for a Report

- **Use Case:** Retrieve ranked, explainable candidates for an authorized report.
- **Actor:** User for owned reports; Staff/Admin for authorized workflow.
- **Owner Service:** Matching Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/reports/{reportId}/matches` (`PROPOSED`).
- **Request Concept:** Report reference, authorization context, optional pagination.
- **Response Concept:** Ranked candidates, Rule Score breakdown, and AI-used/unavailable indication without ownership conclusion.
- **Relevant Requirement IDs:** MATCH-005, MATCH-006, AI-005, SEC-004.
- **Notes:** Visibility by role, score normalization, and exact response fields are `NEEDS_DECISION`.

### API-MATCH-002 - View a Match Result Detail

- **Use Case:** Inspect one stored match result and its explanation.
- **Actor:** Authorized User, Staff, Admin.
- **Owner Service:** Matching Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/matches/{matchResultId}` (`PROPOSED`).
- **Request Concept:** Match-result reference and authorization context.
- **Response Concept:** Approved report references, rank, total score, component scores, and AI status.
- **Relevant Requirement IDs:** MATCH-005, MATCH-006, SEC-003.
- **Notes:** Whether public report detail is embedded or separately fetched is `NEEDS_DECISION`.

## Claims

### API-CLAIM-001 - Submit a Claim

- **Use Case:** Submit a Direct Claim or match-originated claim.
- **Actor:** User.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims` (`PROPOSED`).
- **Request Concept:** Target report, optional match-result reference, secret characteristics, and ownership evidence.
- **Response Concept:** Claim reference and initial state.
- **Relevant Requirement IDs:** CLAIM-001, CLAIM-002, CLAIM-003, SEC-005.
- **Notes:** Eligibility, evidence formats, duplicate-claim policy, and idempotency key are `NEEDS_DECISION`.

### API-CLAIM-002 - View an Authorized Claim

- **Use Case:** View an owned claim or staff-authorized review detail.
- **Actor:** User, Staff, Admin.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}` (`PROPOSED`).
- **Request Concept:** Claim reference and authenticated context.
- **Response Concept:** Role-appropriate claim state and permitted evidence/workflow information.
- **Relevant Requirement IDs:** USER-002, CLAIM-002, CLAIM-003, VERIFY-001.
- **Notes:** Separate claimant/staff views are `NEEDS_DECISION`.

### API-CLAIM-003 - List Claims for Staff Review

- **Use Case:** List and compare claims for a report.
- **Actor:** Staff, Admin.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/review/claims` (`PROPOSED`).
- **Request Concept:** Report/state filters and pagination.
- **Response Concept:** Authorized claim summaries with references to protected evidence access.
- **Relevant Requirement IDs:** CLAIM-004, CLAIM-005, VERIFY-001.
- **Notes:** Ordering and whether matching score is displayed are `NEEDS_DECISION`.

### API-CLAIM-004 - Request Additional Claim Information

- **Use Case:** Move a claim to `NEED_MORE_INFORMATION` and request evidence/details.
- **Actor:** Staff.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/information-requests` (`PROPOSED`).
- **Request Concept:** Request message and required information categories.
- **Response Concept:** Updated claim state and request record.
- **Relevant Requirement IDs:** CLAIM-003, CLAIM-004, NOTIFY-001.
- **Notes:** Return transition, response deadline, and expiration are `NEEDS_DECISION`.

### API-CLAIM-005 - Submit Additional Claim Evidence

- **Use Case:** Respond to an information request with protected evidence.
- **Actor:** Claimant.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/evidence` (`PROPOSED`).
- **Request Concept:** Additional secret characteristics or evidence references.
- **Response Concept:** Receipt and current claim state.
- **Relevant Requirement IDs:** CLAIM-002, CLAIM-003, SEC-003.
- **Notes:** Evidence types, malware scanning, replacement, and state return are `NEEDS_DECISION`.

### API-CLAIM-006 - Decide a Claim

- **Use Case:** Preliminarily approve or reject a claim.
- **Actor:** Staff.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/decisions` (`PROPOSED`).
- **Request Concept:** Decision and source-supported evidence/reason context.
- **Response Concept:** Updated claim state and audit summary.
- **Relevant Requirement IDs:** CLAIM-004, VERIFY-003, AUDIT-001.
- **Notes:** Decision criteria, reason codes, and effect on competing claims/report reservation are `NEEDS_DECISION`.

## Verification

### API-VERIFY-001 - Record Direct Verification Outcome

- **Use Case:** Record staff verification of identity and ownership evidence.
- **Actor:** Staff.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/verifications` (`PROPOSED`).
- **Request Concept:** Verification outcome and permitted staff notes/evidence references.
- **Response Concept:** Recorded outcome and handover eligibility.
- **Relevant Requirement IDs:** VERIFY-001, VERIFY-002, VERIFY-003, AUDIT-001.
- **Notes:** Accepted identity evidence, failure attempts, and detailed verification states are `NEEDS_DECISION`.

## Handover

### API-HANDOVER-001 - Schedule Handover

- **Use Case:** Create or change a pickup appointment for an approved claim.
- **Actor:** Staff.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/handover-appointments` (`PROPOSED`).
- **Request Concept:** Appointment context at the Lost-and-Found counter.
- **Response Concept:** Appointment summary and `HANDOVER_SCHEDULED` claim state.
- **Relevant Requirement IDs:** HANDOVER-001, CLAIM-003, NOTIFY-001.
- **Notes:** Rescheduling, cancellation, availability, and no-show rules are `NEEDS_DECISION`.

### API-HANDOVER-002 - Issue Handover Confirmation

- **Use Case:** Create a time-limited QR or OTP confirmation mechanism.
- **Actor:** Staff.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/handover-confirmations` (`PROPOSED`).
- **Request Concept:** Requested QR/OTP mode if both are supported at runtime.
- **Response Concept:** Time-limited confirmation challenge appropriate to the authorized actor.
- **Relevant Requirement IDs:** HANDOVER-002, SEC-005.
- **Notes:** Mode selection, expiry, delivery channel, renewal, and attempt policy are `NEEDS_DECISION`.

### API-HANDOVER-003 - Confirm and Complete Handover

- **Use Case:** Validate QR/OTP and complete the physical handover.
- **Actor:** Staff with claimant participation.
- **Owner Service:** Lost-and-Found Service.
- **Proposed Method:** `POST` (`PROPOSED`).
- **Proposed Path:** `/api/claims/{claimId}/handover-completions` (`PROPOSED`).
- **Request Concept:** Confirmation response and direct-verification context.
- **Response Concept:** Completed claim, resolved report, and handover record.
- **Relevant Requirement IDs:** HANDOVER-002, HANDOVER-003, EVENT-003, AUDIT-001.
- **Notes:** Transaction boundary and physical-transfer rollback handling are `NEEDS_DECISION`.

## Notifications

### API-NOTIFY-001 - List User Notifications

- **Use Case:** View in-system notifications.
- **Actor:** User, Staff, Admin for their own inbox.
- **Owner Service:** Lost-and-Found Service in Phase 1.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/notifications` (`PROPOSED`).
- **Request Concept:** Authenticated identity and pagination/filter context.
- **Response Concept:** Recipient-authorized notification summaries with no secret evidence.
- **Relevant Requirement IDs:** NOTIFY-001, NOTIFY-002, SEC-003.
- **Notes:** Read/unread state and acknowledgement API are `NEEDS_DECISION`.

## Admin

### API-ADMIN-001 - Manage an Account's Role or Status

- **Use Case:** Perform source-supported account administration.
- **Actor:** Admin.
- **Owner Service:** Identity Service.
- **Proposed Method:** `PATCH` (`PROPOSED`).
- **Proposed Path:** `/api/admin/accounts/{accountId}` (`PROPOSED`).
- **Request Concept:** Permitted account/role change.
- **Response Concept:** Updated administrative account summary.
- **Relevant Requirement IDs:** ADMIN-001, AUTH-003, AUDIT-001.
- **Notes:** Account states, role assignment rules, and allowed changes are `NEEDS_DECISION`.

### API-ADMIN-002 - View Operational Statistics

- **Use Case:** View source-supported operational statistics.
- **Actor:** Admin.
- **Owner Service:** `NEEDS_DECISION`; data remains owned by its domain services and observability infrastructure.
- **Proposed Method:** `GET` (`PROPOSED`).
- **Proposed Path:** `/api/admin/statistics` (`PROPOSED`).
- **Request Concept:** Time/filter context.
- **Response Concept:** Authorized operational aggregates without secret evidence.
- **Relevant Requirement IDs:** ADMIN-002, OPS-003, SEC-004.
- **Notes:** Metrics, aggregation architecture, freshness, and owner endpoint are `NEEDS_DECISION`.

## Contract Decisions Required Before Implementation

- Authentication/token and service-to-service credential mechanism.
- API versioning, error envelope, pagination, filtering, and concurrency convention.
- Idempotency-key use for public commands.
- Exact request/response fields and privacy classification.
- Media upload/reference flow.
- Internal API topology versus event-only flows.
- Route split for public, owner, staff, and admin representations.
- Whether draft-description AI is included in Phase 1 and how it is invoked without weakening service ownership.
