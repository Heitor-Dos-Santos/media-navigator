-- Adiciona suporte a dados por campanha em funnel_daily_records
ALTER TABLE public.funnel_daily_records
  ADD COLUMN IF NOT EXISTS campaign_id   TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS campaign_name TEXT,
  ADD COLUMN IF NOT EXISTS objective     TEXT;

-- Atualiza o CHECK de funnel_stage para incluir 'meio'
ALTER TABLE public.funnel_daily_records
  DROP CONSTRAINT IF EXISTS funnel_daily_records_funnel_stage_check;
ALTER TABLE public.funnel_daily_records
  ADD CONSTRAINT funnel_daily_records_funnel_stage_check
  CHECK (funnel_stage IN ('topo', 'meio', 'fundo'));

-- Recria a constraint UNIQUE incluindo campaign_id
-- ('' = nível de conta, id real = nível de campanha)
ALTER TABLE public.funnel_daily_records
  DROP CONSTRAINT IF EXISTS funnel_daily_records_user_id_account_id_date_funnel_stage_key;
ALTER TABLE public.funnel_daily_records
  ADD CONSTRAINT funnel_daily_records_unique
  UNIQUE (user_id, account_id, campaign_id, date, funnel_stage);
