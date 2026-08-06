-- Alinha a RLS de funnel_daily_records ao mesmo padrão já usado em platform_connections
-- (agency_id via user_agency_ids(), com fallback por user_id pra não quebrar acesso existente).
DROP POLICY IF EXISTS "Usuarios acessam apenas seus proprios registros" ON public.funnel_daily_records;

CREATE POLICY "funnel_select_agency" ON public.funnel_daily_records
  FOR SELECT
  USING (agency_id IN (SELECT user_agency_ids()) OR user_id = auth.uid());

CREATE POLICY "funnel_insert_agency" ON public.funnel_daily_records
  FOR INSERT
  WITH CHECK (agency_id IN (SELECT user_agency_ids()) OR user_id = auth.uid());

CREATE POLICY "funnel_update_agency" ON public.funnel_daily_records
  FOR UPDATE
  USING (agency_id IN (SELECT user_agency_ids()) OR user_id = auth.uid());

CREATE POLICY "funnel_delete_agency" ON public.funnel_daily_records
  FOR DELETE
  USING (agency_id IN (SELECT user_agency_ids()) OR user_id = auth.uid());
