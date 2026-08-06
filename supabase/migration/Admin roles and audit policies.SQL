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







-- ======================================================================================
-- OWNER PROTECTION — extend to profiles (freeze / delete / pro grant)
-- The existing triggers on admin_users only stop someone from removing/demoting
-- the owner's ADMIN row. They say nothing about the owner's PROFILE row, which is
-- what AdminUsers.tsx actually freezes, deletes, and grants Pro on. Closing that gap.
-- ======================================================================================

-- Block freezing OR deleting a profile that belongs to the owner.
create or replace function prevent_owner_profile_tamper()
returns trigger
language plpgsql
security definer
as $$
declare
  target_is_owner boolean;
begin
  select is_owner into target_is_owner
  from public.admin_users
  where user_id = coalesce(old.id, new.id);

  if target_is_owner and TG_OP = 'DELETE' then
    raise exception 'Cannot delete the owner account.';
  end if;

  if target_is_owner and TG_OP = 'UPDATE' and new.is_frozen = true and old.is_frozen = false then
    raise exception 'Cannot freeze the owner account.';
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_prevent_owner_profile_delete on public.profiles;
create trigger trg_prevent_owner_profile_delete
  before delete on public.profiles
  for each row
  execute function prevent_owner_profile_tamper();

drop trigger if exists trg_prevent_owner_profile_freeze on public.profiles;
create trigger trg_prevent_owner_profile_freeze
  before update on public.profiles
  for each row
  execute function prevent_owner_profile_tamper();

-- Block revoking/granting Pro status changes targeting the owner via pro_users.
create or replace function prevent_owner_pro_tamper()
returns trigger
language plpgsql
security definer
as $$
declare
  target_is_owner boolean;
begin
  select is_owner into target_is_owner
  from public.admin_users
  where user_id = new.user_id;

  if target_is_owner then
    raise exception 'Cannot modify Pro status on the owner account.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_prevent_owner_pro_tamper on public.pro_users;
create trigger trg_prevent_owner_pro_tamper
  before insert or update on public.pro_users
  for each row
  execute function prevent_owner_pro_tamper();

  -- ======================================================================================
-- ADMIN READ ACCESS — exam/quiz/study history
-- These tables already have RLS policies letting users read their own rows.
-- Postgres OR's multiple SELECT policies together, so adding this doesn't
-- touch the existing user-facing policies — it just adds a second path in.
-- ======================================================================================

alter table public.mock_exam_history enable row level security;
alter table public.quiz_sessions      enable row level security;
alter table public.study_sessions     enable row level security;

drop policy if exists "Admins can view all mock exam history" on public.mock_exam_history;
create policy "Admins can view all mock exam history"
on public.mock_exam_history for select
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can view all quiz sessions" on public.quiz_sessions;
create policy "Admins can view all quiz sessions"
on public.quiz_sessions for select
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can view all study sessions" on public.study_sessions;
create policy "Admins can view all study sessions"
on public.study_sessions for select
using (public.is_admin(auth.uid()));