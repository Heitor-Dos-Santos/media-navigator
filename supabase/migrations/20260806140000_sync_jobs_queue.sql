CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE TABLE public.sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id uuid,
  platform text NOT NULL CHECK (platform IN ('meta_ads', 'google_ads', 'dv360')),
  account_id text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'done', 'error')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz
);

CREATE INDEX sync_jobs_queued_idx ON public.sync_jobs (created_at) WHERE status = 'queued';

-- Popula agency_id automaticamente a partir de platform_connections, no mesmo padrão de RLS
-- usado nas outras tabelas — evita o frontend precisar saber/enviar o agency_id.
CREATE OR REPLACE FUNCTION public.set_sync_job_agency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  SELECT agency_id INTO NEW.agency_id FROM platform_connections
    WHERE user_id = NEW.user_id AND platform = NEW.platform AND account_id = NEW.account_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_sync_job_agency
  BEFORE INSERT ON public.sync_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_sync_job_agency();

ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sync_jobs_select_agency" ON public.sync_jobs FOR SELECT
  USING (agency_id IN (SELECT user_agency_ids()) OR user_id = auth.uid());

CREATE POLICY "sync_jobs_insert_agency" ON public.sync_jobs FOR INSERT
  WITH CHECK (user_id = auth.uid());
