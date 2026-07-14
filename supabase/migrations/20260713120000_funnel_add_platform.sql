-- Adiciona suporte multi-plataforma em funnel_daily_records (antes só Meta Ads)
ALTER TABLE public.funnel_daily_records
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'meta_ads';

ALTER TABLE public.funnel_daily_records
  DROP CONSTRAINT IF EXISTS funnel_daily_records_unique;
ALTER TABLE public.funnel_daily_records
  ADD CONSTRAINT funnel_daily_records_unique
  UNIQUE (user_id, platform, account_id, campaign_id, date, funnel_stage);

CREATE INDEX IF NOT EXISTS idx_funnel_daily_platform ON public.funnel_daily_records (user_id, platform, account_id, date);
