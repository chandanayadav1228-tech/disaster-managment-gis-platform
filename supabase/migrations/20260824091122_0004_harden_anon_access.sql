/*
# SafeHabitat AI — Harden Anonymous Access

1. Purpose
   Removes the default anonymous Data API privileges from the application schema.

2. Security changes
   - Anonymous clients cannot select, insert, update, or delete application records.
   - Anonymous clients cannot execute the elevated-role helper function.
   - Authenticated users retain the access defined by the RLS policies.

3. Notes
   Authentication is required before the dashboard can read demo data. This prevents the
   synthetic operational dataset from being exposed through unauthenticated API calls and
   matches the application's required login flow.
*/

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_elevated_user() FROM anon;
