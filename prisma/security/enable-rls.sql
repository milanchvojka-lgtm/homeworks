-- Homeworks — Row-Level Security setup for Supabase Postgres
--
-- WHY: Supabase advisor flags `rls_disabled_in_public` as a critical issue.
-- Even though this app talks to Postgres exclusively through Prisma (with the
-- service_role / pooler URL), the `anon` role still has table access by default
-- via PostgREST. Anyone with the project's anon key can read/write data.
--
-- WHAT: This script enables RLS on every application table and adds a single
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
-- IDEMPOTENCY: `IF NOT EXISTS` on policy names + `ENABLE ROW LEVEL SECURITY`
-- being a no-op on already-enabled tables means this script is safe to re-run.

DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'User',
      'Session',
      'Competency',
      'DailyCheck',
      'CompetencyAssignment',
      'DailyCheckInstance',
      'Task',
      'TaskInstance',
      'TaskRotationLog',
      'NotificationQueue',
      'NotificationLog',
      'CreditTransaction',
      'ScreenTimeRequest',
      'WeeklyPayout',
      'TrophyEarned',
      'StreakMilestone',
      'AppSettings'
    ])
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

-- Sanity check — list RLS state for every public table.
-- Expected: every app table shows rowsecurity = true.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
