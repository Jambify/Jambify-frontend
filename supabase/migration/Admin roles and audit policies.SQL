-- ======================================================================================
-- ROLE-AWARE ADMIN PERMISSIONS
-- is_admin() checks membership only (admin OR moderator). This adds
-- is_super_admin() which checks role = 'admin' specifically, and re-points
-- the admin_users INSERT/DELETE policies at it — so moderators can still
-- see the roles list, but only full admins can add or remove anyone.
-- ======================================================================================

CREATE OR REPLACE FUNCTION public.is_super_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = uid AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can add admins" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can remove admins" ON public.admin_users;

CREATE POLICY "Only full admins can add admins"
ON public.admin_users FOR INSERT
WITH CHECK (public.is_super_admin(auth.uid()));

CREATE POLICY "Only full admins can remove admins"
ON public.admin_users FOR DELETE
USING (public.is_super_admin(auth.uid()));

-- "Admins can view all admins" (SELECT) is left as-is — both admins and
-- moderators can still see the roles list, they just can't act on it.

-- ======================================================================================
-- ADMIN_AUDIT_LOG ACCESS POLICIES
-- Any admin or moderator can log their own actions and view the log.
-- The WITH CHECK forces admin_email to match the actual logged-in user's
-- email, so nobody can forge a log entry attributing an action to someone else.
-- ======================================================================================

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert own audit entries" ON public.admin_audit_log;

CREATE POLICY "Admins can view audit log"
ON public.admin_audit_log FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert own audit entries"
ON public.admin_audit_log FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) AND admin_email = auth.email());