
-- 1. Fix clients: remove `user_id IS NULL` exposure
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can view own clients"
ON public.clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 2. Efficiency scores: add admin override for consistency
DROP POLICY IF EXISTS "Usuários veem seus próprios scores" ON public.efficiency_scores;
CREATE POLICY "Usuários veem seus próprios scores"
ON public.efficiency_scores FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Usuários atualizam seus próprios scores" ON public.efficiency_scores;
CREATE POLICY "Usuários atualizam seus próprios scores"
ON public.efficiency_scores FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 3. Lock down SECURITY DEFINER functions: revoke from public/anon, keep authenticated where needed for RLS
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated;

-- handle_new_user is a trigger-only helper; nobody should call it directly
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 4. Defense-in-depth trigger on user_roles: enforce admin-only role assignment
-- even if RLS is bypassed by future code paths. Allows the very first admin
-- to bootstrap (when no admin exists yet).
CREATE OR REPLACE FUNCTION public.enforce_user_roles_admin_only()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_any_admin boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'super_admin')
  ) INTO has_any_admin;

  -- Bootstrap: allow initial admin/super_admin insert when no admin exists.
  IF TG_OP = 'INSERT' AND NOT has_any_admin AND NEW.role IN ('admin', 'super_admin') THEN
    RETURN NEW;
  END IF;

  -- Otherwise require the caller to be an existing admin.
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can modify user_roles';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.enforce_user_roles_admin_only() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_user_roles_admin_only_trg ON public.user_roles;
CREATE TRIGGER enforce_user_roles_admin_only_trg
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.enforce_user_roles_admin_only();
