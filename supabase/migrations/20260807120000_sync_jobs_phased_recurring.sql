-- Fase 4: sync faseado (7d rápido + 90d backfill na seleção) e crons de negócio recorrentes
-- (diário + reatribuição semanal), reaproveitando a mesma fila/worker da Fase 3.

ALTER TABLE public.sync_jobs
  ADD COLUMN IF NOT EXISTS range_days integer NOT NULL DEFAULT 90;

-- Enfileira um job de resync para cada conta já pronta (ready/ready_partial) — usado pelos
-- crons diário e semanal. Evita duplicar um job se já existe um pendente/rodando pra mesma conta.
CREATE OR REPLACE FUNCTION public.enqueue_recurring_sync_jobs(p_range_days integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
BEGIN
  INSERT INTO sync_jobs (user_id, platform, account_id, range_days)
  SELECT pc.user_id, pc.platform, pc.account_id, p_range_days
  FROM platform_connections pc
  WHERE pc.is_selected = true
    AND pc.sync_status IN ('ready', 'ready_partial')
    AND NOT EXISTS (
      SELECT 1 FROM sync_jobs sj
      WHERE sj.user_id = pc.user_id AND sj.platform = pc.platform AND sj.account_id = pc.account_id
        AND sj.status IN ('queued', 'running')
    );
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

-- Diário: reprocessa os últimos 7 dias de cada conta pronta (corrige atrasos de atribuição de
-- D-1/D-2 sem re-puxar o histórico todo). 06:00 UTC = 03:00 em Brasília, fora do horário de pico.
SELECT cron.schedule('sync-daily-resync', '0 6 * * *', $$ SELECT enqueue_recurring_sync_jobs(7); $$);

-- Semanal: reatribuição de janela mais larga (30 dias), pra capturar conversões que as janelas de
-- atribuição dos DSPs (click/view) só reportam dias depois. Segunda-feira 08:00 UTC.
SELECT cron.schedule('sync-weekly-reattribution', '0 8 * * 1', $$ SELECT enqueue_recurring_sync_jobs(30); $$);
