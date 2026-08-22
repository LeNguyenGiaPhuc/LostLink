# LostLink Phase 1 Service Boundaries

Source documents have higher authority than this planning reference. Component-level requirements are defined in `docs/REQUIREMENTS.md`.

## Boundary Summary

| Component | Owns decisions about | Must not decide |
| --- | --- | --- |
| API Gateway | Routing and edge controls | Reports, claims, ownership, matching |
| Identity Service | Identity, authentication, tokens, roles | Lost & Found workflow or match ranking |
| Lost-and-Found Service | Reports through handover/resolution | Similarity inference implementation |
| Matching Service | Candidate filtering, scoring, ranking | Ownership, claim approval, handover |
| AI Inference Service | Inference signals | Any domain state or business decision |

## API Gateway

### Responsibilities

- Be the only public API entry point for Web Client.
- Route requests to the owner service.
- Perform basic token validation.
- Apply rate limiting at the edge.
- attach or propagate a correlation identifier.

### Owned Data

- No domain data.
- Edge configuration and transient request metadata only; the exact configuration model is `NEEDS_DECISION`.

### Data It Must Not Own

- Accounts, profiles, reports, claims, evidence, match results, handovers, notifications, or audit domain records.

### Incoming Communication

- Public requests from Web Client.

### Outgoing Communication

- Synchronous requests to Identity Service, Lost-and-Found Service, or Matching Service according to documented contracts.
- Exact routing and any AI-facing public route are `NEEDS_DECISION`; Web Client must not bypass the owner-service boundary.

### Events Published

- None defined by source.

### Events Consumed

- None defined by source.

### Allowed Dependencies

- Internal service endpoints needed for routing.
- Token-validation material and rate-limit infrastructure once selected.
- Audit/observability infrastructure.

### Forbidden Responsibilities

- Domain validation or business-state transition.
- Claim, ownership, moderation, verification, handover, or matching decisions.
- Domain persistence.
- Direct schema access.

## Identity Service

### Responsibilities

- Manage accounts and authentication.
- Issue tokens.
- Own profile identity and roles: User, Staff, Admin.
- Apply identity-domain authorization for identity operations.

### Owned Data

- Account.
- Authentication material.
- Token issuance state if the selected token design requires it.
- Profile identity.
- Roles.
- `identity_schema`.

### Data It Must Not Own

- Reports, item details, secret ownership evidence, claims, verification, handover, matching results, or notification workflow.

### Incoming Communication

- Authentication and profile/account requests routed by API Gateway.
- Concrete internal identity-validation calls are `NEEDS_DECISION`.

### Outgoing Communication

- Authentication/token and profile/account responses through API Gateway.
- Any required internal identity contract; exact topology is `NEEDS_DECISION`.

### Events Published

- None defined by source.

### Events Consumed

- None defined by source.

### Allowed Dependencies

- `identity_schema` through its own database user.
- Audit/observability infrastructure.
- Explicit internal credentials for service-to-service communication.

### Forbidden Responsibilities

- Report moderation or lifecycle decisions.
- Claim, verification, ownership, or handover decisions.
- Candidate filtering, Rule Score, or AI orchestration.
- Access to another service's schema.

## Lost-and-Found Service

### Responsibilities

- Own Lost Report and Found Report workflows.
- Validate report data and separate public/private/secret attributes.
- Own moderation and report state transitions.
- Own Direct Claim and match-originated claim workflows.
- Own secret ownership evidence and claim evidence.
- Own human verification, handover, disputes, and business audit.
- Own Phase 1 in-system/email notification behavior.
- Control object-storage metadata and image access.

### Owned Data

- Lost Report, Found Report, item information, protected evidence.
- Claim, verification, appointment, handover, dispute, and notification records.
- Related business audit.
- Object-storage metadata and access rules.
- `lost_found_schema`.

### Data It Must Not Own

- Authentication credentials and identity-role source of truth.
- Matching read model, scoring records, candidate ranking, or model metadata.
- AI model/inference implementation.

### Incoming Communication

- Report, moderation, claim, verification, handover, notification, and authorized administration requests through API Gateway.
- `MatchFound` from Message Broker.

### Outgoing Communication

- Synchronous responses through API Gateway.
- Approved object-storage operations.
- `ReportActivated` and `ReportResolved` through Message Broker.
- Notification delivery integration; provider is `NEEDS_DECISION`.

### Events Published

- `ReportActivated` after ACTIVE state is committed.
- `ReportResolved` after handover completion or another source-supported closure.

### Events Consumed

- `MatchFound` for notification or related Lost-and-Found workflow behavior.

### Allowed Dependencies

- `lost_found_schema` through its own database user.
- Object Storage.
- Message Broker.
- Explicit internal credentials and Audit/Observability infrastructure.

### Forbidden Responsibilities

- Implementing Rule Score or owning ranked match history.
- Acting as the AI inference engine.
- Sending secret characteristics, secret ownership evidence, or claim evidence to Matching or AI.
- Reading `identity_schema` or `matching_schema` directly.
- Extracting moderation, notification, handover, or dispute into a Phase 1 standalone service.

## Matching Service

### Responsibilities

- Maintain the minimal read model of ACTIVE public reports.
- Hard-filter candidates by source-supported attributes.
- Calculate the fixed baseline Rule Score.
- Request optional AI similarity for a reduced candidate set.
- Rerank candidates and store total/component scores.
- Own match results/history and potential-duplicate signals.
- Remove/deactivate candidates after report resolution.

### Owned Data

- ACTIVE-report read model containing only public/approved matching attributes.
- Candidate and match-result history.
- Rule and AI score breakdown.
- Model metadata and stored embeddings if used.
- Processed-event records needed for idempotency.
- `matching_schema`.

### Data It Must Not Own

- Master reports and report state machine.
- Claim, secret evidence, verification, ownership decision, handover, dispute, or notification records.
- Identity credentials or profile source of truth.

### Incoming Communication

- `ReportActivated` and `ReportResolved` from Message Broker.
- Match-result queries routed by API Gateway.
- Approved internal matching commands, if any; exact need is `NEEDS_DECISION`.

### Outgoing Communication

- Optional synchronous similarity requests to AI Inference Service.
- Match-result responses through API Gateway.
- `MatchFound` through Message Broker.

### Events Published

- `MatchFound` after ranked results are stored.

### Events Consumed

- `ReportActivated` to update read model and run matching.
- `ReportResolved` to deactivate affected candidates.

### Allowed Dependencies

- `matching_schema` through its own database user.
- Message Broker.
- AI Inference Service.
- Audit/Observability infrastructure.

### Forbidden Responsibilities

- Approving or rejecting claims.
- Determining ownership or concluding that two reports are certainly the same item.
- Storing or requesting secret ownership evidence or claim evidence.
- Direct access to `lost_found_schema` or `identity_schema`.
- Making AI mandatory for matching.

## AI Inference Service

### Responsibilities

- Compute optional image similarity.
- Compute optional semantic text similarity.
- Return optional candidate-reranking signals.
- Optionally produce an editable draft description from an approved image if that source-supported capability is selected.
- Remain stateless and replaceable in Phase 1.

### Owned Data

- No business workflow data.
- Transient inference inputs/outputs only.
- Runtime model artifacts are implementation concerns; ownership and lifecycle details are `NEEDS_DECISION`.

### Data It Must Not Own

- Reports, claims, evidence, match history, score records, embeddings, model metadata, verification, handover, or identity records.

### Incoming Communication

- Optional inference requests from Matching Service.
- A draft-description invocation path, if selected, is `NEEDS_DECISION` and must preserve Lost-and-Found ownership of report content.

### Outgoing Communication

- Inference signals or draft suggestions to the authorized caller.

### Events Published

- None defined by source.

### Events Consumed

- None defined by source.

### Allowed Dependencies

- Model runtime and approved media/text access needed for stateless inference.
- Audit/observability infrastructure.

### Forbidden Responsibilities

- Approving/rejecting claims or changing report/claim state.
- Determining ownership.
- Declaring reports to represent the same item conclusively.
- Receiving secret characteristics, secret ownership evidence, or claim evidence.
- Becoming a required dependency of core workflow.
- Persisting business state in Phase 1.

## Critical Three-Service Boundary

`Lost-and-Found Service -> Matching Service -> AI Inference Service` is a one-way reduction of authority and data sensitivity:

1. Lost-and-Found Service owns complete report/claim workflow data and publishes only approved matching data.
2. Matching Service owns derived read models and explainable scoring, but no ownership decision.
3. AI Inference Service sees only the minimum approved candidate inputs and returns an advisory signal.

No response from Matching or AI may directly perform a Lost-and-Found business transition.

