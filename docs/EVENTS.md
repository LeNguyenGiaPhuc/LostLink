# LostLink Phase 1 Event Planning Contracts

These are conceptual contracts, not final JSON schemas. Source documents and `docs/REQUIREMENTS.md` have higher authority.

## Shared Event Envelope

### Required Metadata

- `eventId`
- event type
- aggregate identifier
- aggregate version
- timestamp
- correlation identifier when applicable

Exact property names, types, serialization format, topic names, and schema-version field are `NEEDS_DECISION`.

### Global Forbidden Data

No Phase 1 event may contain:

- secret item characteristics;
- secret ownership evidence;
- claim evidence;
- unrestricted object-storage paths or credentials;
- an AI-generated ownership conclusion.

### Global Processing Rules

- Consumers process events idempotently by `eventId` or an equivalent durable mechanism.
- Consumers use aggregate version to reject stale updates.
- Payloads contain only the minimum approved information required by the consumer.
- Controlled retry must not duplicate business effects.

## ReportActivated

### Purpose

Tell Matching Service that a moderated report is now ACTIVE and eligible for its read model and matching.

### Producer

Lost-and-Found Service.

### Consumer(s)

Matching Service.

### Trigger

After Staff approval and successful commit of the report's ACTIVE state.

### Conceptual Payload

- Aggregate/report reference.
- Report/item type needed to identify compatible candidates.
- Approved item category, color, time context, location context, public description, and approved image reference as needed by matching.
- `NEEDS_DECISION`: exact minimal field set and representation of location/time ranges.

### Required Metadata

Shared event envelope.

### Forbidden Data

Global forbidden data, private contact information, and exact item storage location.

### Idempotency Expectation

Redelivery must not create duplicate read-model records or duplicate match results.

### Versioning Expectation

Aggregate version protects the Matching read model from older activation/update data. Contract compatibility policy is `NEEDS_DECISION`.

### Failure/Retry Considerations

Matching failure leaves the report ACTIVE. Processing may retry; repeated failure follows the Phase 1/Phase 2 DLQ decision.

### Related Requirements

- EVENT-001
- EVENT-004
- EVENT-005
- REL-002

## MatchFound

### Purpose

Tell Lost-and-Found Service that Matching Service has persisted a ranked match result that may support notification or related workflow.

### Producer

Matching Service.

### Consumer(s)

Lost-and-Found Service.

### Trigger

After ranked candidates and score breakdown are stored.

### Conceptual Payload

- Match-result reference.
- Related report reference(s) sufficient for the consumer to identify the affected workflow/user.
- Summary that a ranked result is available; it must not represent ownership approval.
- `NEEDS_DECISION`: whether a non-secret score/rank summary is included or fetched through an API.

### Required Metadata

Shared event envelope.

### Forbidden Data

Global forbidden data and any claim decision.

### Idempotency Expectation

Redelivery must not create duplicate notifications or business transitions.

### Versioning Expectation

The event contract must be versionable. Aggregate/version semantics for a match-result aggregate are `NEEDS_DECISION`.

### Failure/Retry Considerations

Notification failure must not invalidate the stored match result. Safe retries remain idempotent.

### Related Requirements

- EVENT-002
- MATCH-007
- NOTIFY-001
- REL-003

## ReportResolved

### Purpose

Tell Matching Service that a report has ended so related candidates are removed or deactivated.

### Producer

Lost-and-Found Service.

### Consumer(s)

Matching Service.

### Trigger

After handover completion and report resolution, or another source-supported closure.

### Conceptual Payload

- Aggregate/report reference.
- Approved closure indication needed to deactivate matching participation.
- `NEEDS_DECISION`: which non-handover closures emit the event and whether a closure reason is included.

### Required Metadata

Shared event envelope.

### Forbidden Data

Global forbidden data, claimant identity, verification evidence, and handover confirmation material.

### Idempotency Expectation

Redelivery must not create invalid repeated transitions or corrupt the read model.

### Versioning Expectation

Aggregate version prevents an older closure/activation sequence from overwriting newer state.

### Failure/Retry Considerations

Matching may retry deactivation. The authoritative report remains resolved in Lost-and-Found Service even while Matching is unavailable.

### Related Requirements

- EVENT-003
- HANDOVER-003
- MATCH-001
- REL-006

## Event Decisions Required Before Final Contracts

- Broker technology, topic/queue layout, and delivery guarantees.
- Serialization format and contract-version representation.
- Exact event payload fields and data types.
- Partition/ordering key and aggregate-version gap policy.
- Processed-event retention and transaction boundary.
- Minimum Phase 1 Outbox and DLQ behavior versus Phase 2 tooling.
- Which non-handover report closures emit `ReportResolved`.
