# Matching schema migrations

Milestone 1 reserves the `matching_schema` boundary but does not introduce
business models or a physical migration. The first business migration belongs
to the requirement that introduces the first Matching domain model.

Database and role/schema bootstrap is an environment responsibility. Matching
Service must only read and write data owned by `matching_schema`; protected
ownership data remains outside this service.
