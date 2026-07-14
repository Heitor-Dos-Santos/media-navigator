-- Dados diários de funil sincronizados do Meta Ads por usuário/conta
CREATE TABLE IF NOT EXISTS public.funnel_daily_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  account_name TEXT,
  date DATE NOT NULL,
  funnel_stage TEXT NOT NULL CHECK (funnel_stage IN ('topo', 'fundo')),
  investimento NUMERIC NOT NULL DEFAULT 0,
  alcance BIGINT NOT NULL DEFAULT 0,
  frequencia NUMERIC NOT NULL DEFAULT 0,
  impressoes BIGINT NOT NULL DEFAULT 0,
  conversoes NUMERIC NOT NULL DEFAULT 0,
  receita NUMERIC NOT NULL DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, account_id, date, funnel_stage)
);

ALTER TABLE public.funnel_daily_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios acessam apenas seus proprios registros"
  ON public.funnel_daily_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_funnel_daily_user_account ON public.funnel_daily_records (user_id, account_id, date);
