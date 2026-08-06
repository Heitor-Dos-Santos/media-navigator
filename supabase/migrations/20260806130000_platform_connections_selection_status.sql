-- Fase 2 do modelo multi-tenant: separa "descoberto via OAuth" de "selecionado pelo usuário"
-- e persiste o status de sincronização por conta (em vez de só mostrar num modal transiente).
ALTER TABLE public.platform_connections
  ADD COLUMN IF NOT EXISTS is_selected boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'pending'
    CHECK (sync_status IN ('pending','syncing','ready_partial','ready','auth_error','failed')),
  ADD COLUMN IF NOT EXISTS sync_error text,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Backfill: contas que já têm dado sincronizado em funnel_daily_records ficam "ready";
-- o resto mantém o default "pending" (nunca sincronizado ainda).
UPDATE public.platform_connections pc
SET sync_status = 'ready',
    last_synced_at = fdr.max_synced_at
FROM (
  SELECT user_id, platform, account_id, MAX(synced_at) AS max_synced_at
  FROM public.funnel_daily_records
  GROUP BY user_id, platform, account_id
) fdr
WHERE pc.user_id = fdr.user_id
  AND pc.platform = fdr.platform
  AND pc.account_id = fdr.account_id;

-- Trigger de proteção: sync_status/sync_error/last_synced_at só podem ser escritos pelas
-- Edge Functions (service_role) — evita que um usuário se autodeclare "ready" direto pelo client,
-- já que a RLS de platform_connections permite UPDATE livre nas próprias linhas.
CREATE OR REPLACE FUNCTION public.protect_sync_status_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.sync_status := OLD.sync_status;
    NEW.sync_error := OLD.sync_error;
    NEW.last_synced_at := OLD.last_synced_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_sync_status_columns ON public.platform_connections;
CREATE TRIGGER protect_sync_status_columns
  BEFORE UPDATE ON public.platform_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_sync_status_columns();
