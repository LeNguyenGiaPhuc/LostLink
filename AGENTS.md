# LostLink Repository Instructions

## Current Project Phase

LostLink is currently in **PLANNING PHASE**. Until the user explicitly authorizes implementation, do not scaffold application code, create services, add databases/migrations, create Docker Compose, add tests, configure CI/CD, or choose unresolved technologies.

## Authority Order

Use this order when interpreting the project:

1. Original source documents in `docs/source/`.
2. `docs/REQUIREMENTS.md`.
3. `docs/ARCHITECTURE.md`.
4. `docs/SERVICE_BOUNDARIES.md`.
5. `docs/DECISIONS.md`.
6. Remaining planning documents.

Source documents describe what LostLink is intended to be. Planning documents are structured interpretations and must not silently change source meaning.

If two sources or planning documents conflict:

- do not choose one silently;
- report `SOURCE_CONFLICT` with both locations and implications;
- stop the affected implementation until the user resolves it.

If the sources do not decide an issue:

- do not invent the answer;
- use `NEEDS_DECISION`;
- check `docs/OPEN_QUESTIONS.md`;
- ask the user before the decision becomes implementation-blocking.

## Before Implementing Any Feature

1. Identify at least one applicable Requirement ID.
2. Read the complete requirement and its acceptance criteria.
3. Identify the owner service.
4. Read that service's boundary in `docs/SERVICE_BOUNDARIES.md`.
5. Search the current implementation.
6. Search related tests.
7. Check `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`, and relevant open decisions for constraints.
8. Only then modify code.

## Architecture Rules

Codex must not:

- put domain business logic or domain data in API Gateway;
- allow a service to read or write another service's schema directly;
- share entities, repositories, domain implementations, or business logic between microservices;
- send secret item characteristics, secret ownership evidence, or claim evidence to Matching Service;
- send secret item characteristics, secret ownership evidence, or claim evidence to AI Inference Service;
- let Matching Service or AI approve claims, determine ownership, or complete handover;
- make AI a mandatory dependency of matching or the core workflow;
- create a new microservice without an explicitly approved architecture change;
- change an accepted architecture decision silently;
- split Notification, Moderation, Handover, or Dispute into standalone Phase 1 services;
- add Phase 1 non-goals such as Kubernetes, general-purpose Saga, blockchain, payments, delivery/shipping, face recognition, real-time location tracking, or a free-form chatbot.

## Required Phase 1 Ownership

- **API Gateway:** public routing and edge controls only.
- **Identity Service:** account, authentication, token issuance, profile identity, roles, `identity_schema`.
- **Lost-and-Found Service:** reports, moderation, claims, secret evidence, verification, handover, disputes, Phase 1 notifications, related audit, `lost_found_schema`.
- **Matching Service:** ACTIVE-report read model, filtering, Rule Score, ranking, match history, score breakdown, AI integration, `matching_schema`.
- **AI Inference Service:** stateless optional inference only; no business state.

Cross-service information must use a documented API or domain event.

## AI Rules

- Rule-based matching is the reliable core.
- AI is an optional enhancement for source-supported similarity/ranking or draft assistance.
- AI never approves a claim or determines ownership.
- AI never receives protected ownership or claim evidence.
- AI failure must fall back to Rule Score and must not block reports, claims, verification, or handover.
- Matching evaluation must compare Rule-only and Rule-plus-AI using Recall@1, Recall@5, and Mean Reciprocal Rank.

## Requirement Rule

Every future feature implementation must map to at least one existing Requirement ID.

If a requested feature cannot be mapped:

- do not silently edit `docs/REQUIREMENTS.md`;
- report that it may be a new or changed requirement;
- identify affected source, architecture, service ownership, security/privacy, event/API, and roadmap areas;
- request explicit confirmation before implementation.

## Definition of Done

After implementation begins, a requirement is not complete merely because code exists. Completion requires:

- a clear Requirement ID and acceptance criteria;
- implementation in the correct owner service;
- relevant automated tests;
- all relevant tests passing;
- no violation of architecture, privacy, AI, or phase constraints;
- traceable evidence for each acceptance criterion.

## Review Rule

When reviewing a requirement:

1. Read the requirement.
2. Read architecture and service-boundary constraints.
3. Locate relevant implementation.
4. Locate relevant tests.
5. Inspect only the relevant code first.
6. Run relevant tests.
7. Compare each acceptance criterion with implementation and evidence.
8. Report each criterion as `PASS`, `FAIL`, or `UNCERTAIN`.
9. Do not full-scan the repository unless the focused review shows it is necessary.

Do not infer implementation quality from README text or directory names alone.

## Git-Aware Rule

When implementation exists and the user asks to review recent changes, prefer:

`git diff -> affected files -> affected requirements -> relevant implementation -> relevant tests`

Do not default to rereading the entire repository. Preserve user changes and do not commit, push, create a pull request, or rewrite history unless explicitly authorized.

## Planning Document Maintenance

- Do not modify files in `docs/source/` unless the user explicitly requests a source revision.
- Keep accepted decisions in `docs/DECISIONS.md` and unresolved matters in `docs/OPEN_QUESTIONS.md`.
- A proposed API method/path in `docs/API_CONTRACTS.md` is not a source requirement.
- Keep Phase 1 baseline separate from Phase 2/3 evolution.
- When a planning document conflicts with source, fix the planning document; do not rewrite source to match it.
