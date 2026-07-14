-- Adiciona colunas de attribution windows (Meta Ads)
ALTER TABLE public.funnel_daily_records
  ADD COLUMN IF NOT EXISTS conv_1d_click NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conv_7d_click NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conv_1d_view  NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conv_7d_view  NUMERIC NOT NULL DEFAULT 0;
