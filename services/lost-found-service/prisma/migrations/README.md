# Lost-and-Found schema migrations

Milestone 1 reserves the `lost_found_schema` boundary but does not introduce
business models or a physical migration. The first business migration belongs
to the requirement that introduces the first Lost-and-Found domain model.

Database and role/schema bootstrap is an environment responsibility. The
Lost-and-Found Service must only read and write data owned by
`lost_found_schema`, including private report and claim evidence.
