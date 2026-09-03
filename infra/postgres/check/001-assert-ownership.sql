DO $block$
BEGIN
  IF NOT has_schema_privilege('identity_service', 'identity_schema', 'USAGE') THEN
    RAISE EXCEPTION 'identity_service lacks identity_schema access';
  END IF;
  IF has_schema_privilege('identity_service', 'lost_found_schema', 'USAGE')
     OR has_schema_privilege('identity_service', 'matching_schema', 'USAGE') THEN
    RAISE EXCEPTION 'identity_service has cross-schema access';
  END IF;
  IF NOT has_schema_privilege('lost_found_service', 'lost_found_schema', 'USAGE') THEN
    RAISE EXCEPTION 'lost_found_service lacks lost_found_schema access';
  END IF;
  IF has_schema_privilege('lost_found_service', 'identity_schema', 'USAGE')
     OR has_schema_privilege('lost_found_service', 'matching_schema', 'USAGE') THEN
    RAISE EXCEPTION 'lost_found_service has cross-schema access';
  END IF;
  IF NOT has_schema_privilege('matching_service', 'matching_schema', 'USAGE') THEN
    RAISE EXCEPTION 'matching_service lacks matching_schema access';
  END IF;
  IF has_schema_privilege('matching_service', 'identity_schema', 'USAGE')
     OR has_schema_privilege('matching_service', 'lost_found_schema', 'USAGE') THEN
    RAISE EXCEPTION 'matching_service has cross-schema access';
  END IF;
END
$block$;
