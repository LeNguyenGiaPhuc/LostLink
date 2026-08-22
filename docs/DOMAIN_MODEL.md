# LostLink Conceptual Domain Model

This is a conceptual model only. It does not define physical tables, columns, ORM entities, or database technology beyond source-approved ownership boundaries.

## Privacy Classifications

- **Public:** approved and masked information suitable for public report views.
- **Approved for matching/AI:** a minimized subset explicitly permitted for Matching or AI processing.
- **Internal:** operational data limited to authorized system or staff use.
- **Secret:** ownership characteristics, claim evidence, and similarly protected verification material; confined to Lost-and-Found Service.

## User

- **Purpose:** Represents an authenticated project actor.
- **Owner service:** Identity Service.
- **Important conceptual attributes:** Identifier, account status if adopted, role association.
- **Relationships:** Has one profile; can create reports and claims through references to identity.
- **Lifecycle:** `NEEDS_DECISION`; source defines roles but not account states.
- **Privacy:** Internal identity data.

## Profile

- **Purpose:** Holds profile identity and contact information.
- **Owner service:** Identity Service.
- **Important conceptual attributes:** Identity information, contact information, roles.
- **Relationships:** Belongs to a User.
- **Lifecycle:** `NEEDS_DECISION`.
- **Privacy:** Private; contact information is not public report data.

## Lost Report

- **Purpose:** Represents an item a user has lost and wants matched.
- **Owner service:** Lost-and-Found Service.
- **Important conceptual attributes:** Identifier, owner reference, public item information, private/secret information, report state, relevant time and location context.
- **Relationships:** May produce match candidates and claims; may end in verification and handover.
- **Lifecycle:** `DRAFT -> PENDING_REVIEW -> ACTIVE -> RESERVED -> RESOLVED`; source also defines `REJECTED`, `HIDDEN`, and `EXPIRED`, but branch transitions are `NEEDS_DECISION`.
- **Privacy:** Mixed; public fields must be separated from private and secret fields.

## Found Report

- **Purpose:** Represents an item received/found and managed through the Lost-and-Found process.
- **Owner service:** Lost-and-Found Service.
- **Important conceptual attributes:** Identifier, staff/submitter reference as applicable, public item information, protected information, exact internal storage location, report state.
- **Relationships:** Can receive Direct Claims, appear in match results, and result in handover.
- **Lifecycle:** Same baseline report lifecycle as Lost Report; exact Found-specific transitions are `NEEDS_DECISION`.
- **Privacy:** Public view is masked; exact storage location, protected media, and evidence are internal/secret.

## Item Information

- **Purpose:** Describes the physical item for reporting, matching, and verification.
- **Owner service:** Lost-and-Found Service for authoritative report data; Matching Service owns only its approved read-model copy.
- **Important conceptual attributes:** Item/report type, category, color, time context, location context, public description, approved image reference.
- **Relationships:** Belongs to a report; an approved subset is projected into matching.
- **Lifecycle:** Follows its report.
- **Privacy:** Attribute-level classification is required; the exact field classification is `NEEDS_DECISION`.

## Secret Characteristic / Ownership Evidence

- **Purpose:** Supports human verification without revealing the answer publicly.
- **Owner service:** Lost-and-Found Service.
- **Important conceptual attributes:** Protected characteristic/evidence, claimant/report association, access/audit context.
- **Relationships:** Associated with a report or claim and used during verification.
- **Lifecycle:** Retention and deletion are `NEEDS_DECISION`.
- **Privacy:** Secret; forbidden from public views, Matching, AI, and domain events.

## Claim

- **Purpose:** Represents a user's request to receive an item.
- **Owner service:** Lost-and-Found Service.
- **Important conceptual attributes:** Identifier, claimant reference, referenced report/match result, evidence references, state, decision history.
- **Relationships:** Targets a Found Report or originates from a Lost Report match; leads to verification and possibly handover.
- **Lifecycle:** `SUBMITTED -> UNDER_REVIEW -> NEED_MORE_INFORMATION -> APPROVED -> HANDOVER_SCHEDULED -> COMPLETED`; may become `REJECTED`. Return/cancel transitions are `NEEDS_DECISION`.
- **Privacy:** Internal/secret due to claimant and evidence data.

## Match Candidate

- **Purpose:** Represents a possible report pairing after hard filtering.
- **Owner service:** Matching Service.
- **Important conceptual attributes:** References to the participating reports, component scores, eligibility within a matching run.
- **Relationships:** May become part of a Match Result.
- **Lifecycle:** Created/recomputed by matching; deactivated after report resolution. Retention is `NEEDS_DECISION`.
- **Privacy:** Approved matching data only; no secret evidence.

## Match Result

- **Purpose:** Stores ranked candidates and the explanation used to produce the ranking.
- **Owner service:** Matching Service.
- **Important conceptual attributes:** Result identifier, report references, rank, total score, Rule Score breakdown, AI-used/unavailable indication, model metadata reference if used.
- **Relationships:** Can cause `MatchFound`; can be referenced when a user creates a claim.
- **Lifecycle:** Stored after matching and deactivated/retained after report resolution according to `NEEDS_DECISION` retention rules.
- **Privacy:** Internal/user-authorized view; no secret ownership decision.

## Verification

- **Purpose:** Records the authorized human review of identity and ownership evidence.
- **Owner service:** Lost-and-Found Service.
- **Important conceptual attributes:** Claim reference, reviewer reference, outcome, time, audit reference.
- **Relationships:** Evaluates a Claim and gates Handover.
- **Lifecycle:** Detailed states are `NEEDS_DECISION`; it occurs after claim review and before completed handover.
- **Privacy:** Secret/internal.

## Handover

- **Purpose:** Coordinates and records physical item return.
- **Owner service:** Lost-and-Found Service.
- **Important conceptual attributes:** Claim/report reference, appointment context, confirmation mechanism, verification outcome, completion record.
- **Relationships:** Follows an approved Claim; completion resolves the report and emits `ReportResolved`.
- **Lifecycle:** Scheduled then completed; cancellation/no-show branches are `NEEDS_DECISION`.
- **Privacy:** Internal/private; exact storage and appointment information are not public.

## Notification

- **Purpose:** Informs a user about match results or relevant workflow changes.
- **Owner service:** Lost-and-Found Service in Phase 1.
- **Important conceptual attributes:** Recipient reference, trigger/context reference, channel, delivery status if tracked.
- **Relationships:** May derive from `MatchFound` or a Lost-and-Found state change.
- **Lifecycle:** Delivery/retry states are `NEEDS_DECISION`.
- **Privacy:** Private to recipient; must not carry secret evidence.

## Dispute

- **Purpose:** Supports staff/admin handling of competing ownership claims or challenged outcomes.
- **Owner service:** Lost-and-Found Service in Phase 1.
- **Important conceptual attributes:** Related report/claims, participants, review history, outcome.
- **Relationships:** Connects claims, verification, handover, and audit records.
- **Lifecycle:** `NEEDS_DECISION`; source identifies the capability but not states or resolution rules.
- **Privacy:** Secret/internal.

## Audit Record

- **Purpose:** Provides traceability for sensitive actions and workflow decisions.
- **Owner service:** The service owning the affected domain; Lost-and-Found Service owns its business audit.
- **Important conceptual attributes:** Actor reference, affected concept/reference, action, outcome, time, correlation context.
- **Relationships:** Links to reports, claims, verification, handover, evidence access, or administrative changes.
- **Lifecycle:** Retention/immutability are `NEEDS_DECISION`.
- **Privacy:** Internal/security-sensitive.

## Conceptual Relationships

```text
User -- Profile
User -- creates --> Lost Report
Staff -- registers --> Found Report
Lost Report / Found Report -- projects approved data --> Match Candidate
Match Candidate -- ranked into --> Match Result
User -- submits --> Claim -- targets --> Found Report or matching context
Claim -- uses --> Secret Evidence -- reviewed by --> Verification
Approved Claim -- schedules --> Handover
Completed Handover -- resolves --> Report
Report / Claim / Verification / Handover -- produces --> Audit Record
Match Result / workflow change -- may produce --> Notification
Competing Claim or challenged outcome -- may create --> Dispute
```

## State-Machine Decisions Still Required

- Exact transitions involving report states `REJECTED`, `HIDDEN`, and `EXPIRED`.
- Whether reports can be reopened or restored.
- Claim return path after `NEED_MORE_INFORMATION`.
- Claim cancellation/withdrawal and rejected-claim appeal.
- Handover rescheduling, cancellation, and no-show behavior.
- Dispute lifecycle and resolution effects.

