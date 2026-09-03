#!/bin/sh
set -eu

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=db_name="$POSTGRES_DB" \
  --set=identity_password="$IDENTITY_DB_PASSWORD" \
  --set=lost_found_password="$LOST_FOUND_DB_PASSWORD" \
  --set=matching_password="$MATCHING_DB_PASSWORD" <<'SQL'
SELECT format('CREATE ROLE identity_service LOGIN PASSWORD %L', :'identity_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'identity_service') \gexec
SELECT format('CREATE ROLE lost_found_service LOGIN PASSWORD %L', :'lost_found_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lost_found_service') \gexec
SELECT format('CREATE ROLE matching_service LOGIN PASSWORD %L', :'matching_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'matching_service') \gexec

SELECT format('ALTER ROLE identity_service PASSWORD %L', :'identity_password') \gexec
SELECT format('ALTER ROLE lost_found_service PASSWORD %L', :'lost_found_password') \gexec
SELECT format('ALTER ROLE matching_service PASSWORD %L', :'matching_password') \gexec

REVOKE CREATE ON DATABASE :"db_name" FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

CREATE SCHEMA IF NOT EXISTS identity_schema AUTHORIZATION identity_service;
CREATE SCHEMA IF NOT EXISTS lost_found_schema AUTHORIZATION lost_found_service;
CREATE SCHEMA IF NOT EXISTS matching_schema AUTHORIZATION matching_service;

ALTER SCHEMA identity_schema OWNER TO identity_service;
ALTER SCHEMA lost_found_schema OWNER TO lost_found_service;
ALTER SCHEMA matching_schema OWNER TO matching_service;

REVOKE ALL ON SCHEMA identity_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA lost_found_schema FROM PUBLIC;
REVOKE ALL ON SCHEMA matching_schema FROM PUBLIC;

GRANT USAGE, CREATE ON SCHEMA identity_schema TO identity_service;
GRANT USAGE, CREATE ON SCHEMA lost_found_schema TO lost_found_service;
GRANT USAGE, CREATE ON SCHEMA matching_schema TO matching_service;

ALTER ROLE identity_service SET search_path = identity_schema;
ALTER ROLE lost_found_service SET search_path = lost_found_schema;
ALTER ROLE matching_service SET search_path = matching_schema;

ALTER DEFAULT PRIVILEGES FOR ROLE identity_service IN SCHEMA identity_schema REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE identity_service IN SCHEMA identity_schema REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE identity_service IN SCHEMA identity_schema REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lost_found_service IN SCHEMA lost_found_schema REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lost_found_service IN SCHEMA lost_found_schema REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE lost_found_service IN SCHEMA lost_found_schema REVOKE ALL ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE matching_service IN SCHEMA matching_schema REVOKE ALL ON TABLES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE matching_service IN SCHEMA matching_schema REVOKE ALL ON SEQUENCES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE matching_service IN SCHEMA matching_schema REVOKE ALL ON FUNCTIONS FROM PUBLIC;
SQL
