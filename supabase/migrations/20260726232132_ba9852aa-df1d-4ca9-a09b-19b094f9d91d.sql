
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO postgres, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','super_admin'))
$$;

CREATE OR REPLACE FUNCTION private.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'super_admin')
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION private.is_super_admin(uuid) FROM PUBLIC, anon, authenticated;

-- clients
DROP POLICY IF EXISTS "Users can delete own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can update own clients" ON public.clients;
DROP POLICY IF EXISTS "Users can view own clients" ON public.clients;
CREATE POLICY "Users can delete own clients" ON public.clients FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE POLICY "Users can update own clients" ON public.clients FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE POLICY "Users can view own clients" ON public.clients FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

-- efficiency_scores
DROP POLICY IF EXISTS "Usuários veem seus próprios scores" ON public.efficiency_scores;
DROP POLICY IF EXISTS "Usuários atualizam seus próprios scores" ON public.efficiency_scores;
CREATE POLICY "Usuários veem seus próprios scores" ON public.efficiency_scores FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE POLICY "Usuários atualizam seus próprios scores" ON public.efficiency_scores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

-- media_plans
DROP POLICY IF EXISTS "Users can delete own plans" ON public.media_plans;
DROP POLICY IF EXISTS "Users can update own plans" ON public.media_plans;
DROP POLICY IF EXISTS "Users can view own plans" ON public.media_plans;
CREATE POLICY "Users can delete own plans" ON public.media_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE POLICY "Users can update own plans" ON public.media_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE POLICY "Users can view own plans" ON public.media_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

-- user_module_permissions
DROP POLICY IF EXISTS "Admins can delete permissions" ON public.user_module_permissions;
DROP POLICY IF EXISTS "Admins can insert permissions" ON public.user_module_permissions;
DROP POLICY IF EXISTS "Admins can update permissions" ON public.user_module_permissions;
DROP POLICY IF EXISTS "Users can view own permissions" ON public.user_module_permissions;
CREATE POLICY "Admins can delete permissions" ON public.user_module_permissions FOR DELETE TO authenticated
  USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins can insert permissions" ON public.user_module_permissions FOR INSERT TO authenticated
  WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admins can update permissions" ON public.user_module_permissions FOR UPDATE TO authenticated
  USING (private.is_admin(auth.uid()));
CREATE POLICY "Users can view own permissions" ON public.user_module_permissions FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated
  USING (private.is_admin(auth.uid()));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (private.is_admin(auth.uid()));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated
  USING (private.is_admin(auth.uid()));
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.enforce_user_roles_admin_only()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE has_any_admin boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin','super_admin')) INTO has_any_admin;
  IF TG_OP = 'INSERT' AND NOT has_any_admin AND NEW.role IN ('admin','super_admin') THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS NULL OR NOT private.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can modify user_roles';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);
