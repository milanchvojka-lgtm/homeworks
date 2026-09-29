-- Homeworks — Row-Level Security setup for Supabase Postgres
--
-- WHY: Supabase advisor flags `rls_disabled_in_public` as a critical issue.
-- Even though this app talks to Postgres exclusively through Prisma (with the
-- service_role / pooler URL), the `anon` role still has table access by default
-- via PostgREST. Anyone with the project's anon key can read/write data.
--
-- WHAT: This script enables RLS on every table in `public` and adds a single
-- permissive policy for `service_role` (which Prisma uses). All other roles —
-- including `anon` and `authenticated` — get NO access. The app keeps working
-- because Prisma's connection assumes `service_role` (or a custom DB user with
-- BYPASSRLS, which most Supabase pooler setups have).
--
-- HOW TO RUN:
--   1. Open Supabase project → SQL Editor → New query
--   2. Paste this entire file
--   3. Run
--   4. Re-check Supabase Advisor — both `rls_disabled_in_public` and
--      `sensitive_columns_exposed` warnings should clear.
--
-- ROLLBACK (if needed): replace `ENABLE` with `DISABLE` and `DROP POLICY` for
-- each table.
--
-- RE-RUN after every `db push` that adds a table — new tables start with RLS
-- off. The default-privileges block below keeps `anon` out of them meanwhile.
--
-- IDEMPOTENCY: `IF NOT EXISTS` on policy names + `ENABLE ROW LEVEL SECURITY`
-- being a no-op on already-enabled tables means this script is safe to re-run.

DO $$
DECLARE
  tbl text;
BEGIN
  -- Every table in `public`, not a hardcoded list: a static list silently
  -- missed `Absence` (added via `db push`, found open 2026-09-29).
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);

    -- Drop & recreate the service_role-allow-all policy (idempotent)
    EXECUTE format('DROP POLICY IF EXISTS service_role_all ON public.%I;', tbl);
    EXECUTE format(
      'CREATE POLICY service_role_all ON public.%I '
      'FOR ALL TO service_role USING (true) WITH CHECK (true);',
      tbl
    );

    -- Revoke any existing grants from anon and authenticated roles.
    -- (REVOKE on non-existing grants is a no-op.)
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon;', tbl);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM authenticated;', tbl);
  END LOOP;
END$$;

-- Safety net: tables created later by `postgres` (Prisma `db push`) get no
-- grants for anon/authenticated, so they aren't exposed before this script
-- runs again. Supabase's default grants them ALL.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

-- Sanity check — list RLS state for every public table.
-- Expected: every app table shows rowsecurity = true.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
