# Identity schema migrations

Milestone 1 reserves the `identity_schema` boundary but does not introduce
business models or a physical migration. The first business migration belongs
to the requirement that introduces the first Identity domain model.

Database and role/schema bootstrap is an environment responsibility. Identity
Service must only read and write data owned by `identity_schema`.
