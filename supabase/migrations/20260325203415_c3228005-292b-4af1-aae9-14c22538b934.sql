
-- =========================================
-- TABELA: clients
-- =========================================
CREATE TABLE IF NOT EXISTS public.clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name  TEXT NOT NULL,
  trade_name    TEXT,
  cnpj          TEXT NOT NULL,
  state_registration   TEXT,
  municipal_registration TEXT,
  address       TEXT,
  city          TEXT,
  state         TEXT,
  zip_code      TEXT,
  country       TEXT DEFAULT 'Brasil',
  contact_name  TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes         TEXT,
  rebate_tiers  JSONB,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de clients" ON public.clients
  FOR SELECT USING (true);

CREATE POLICY "Inserção de clients" ON public.clients
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualização de clients" ON public.clients
  FOR UPDATE USING (true);

CREATE POLICY "Deleção de clients" ON public.clients
  FOR DELETE USING (true);

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================
-- TABELA: media_plans
-- =========================================
CREATE TABLE IF NOT EXISTS public.media_plans (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client            TEXT,
  client_id         UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  campaign          TEXT,
  taxonomy          TEXT,
  year              TEXT,
  quarter           TEXT,
  status            TEXT DEFAULT 'rascunho',
  total_budget      NUMERIC DEFAULT 0,
  period_start      TEXT,
  period_end        TEXT,
  lines             JSONB DEFAULT '[]',
  scenarios         JSONB DEFAULT '[]',
  active_scenario_id TEXT,
  created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.media_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de media_plans" ON public.media_plans
  FOR SELECT USING (true);

CREATE POLICY "Inserção de media_plans" ON public.media_plans
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Atualização de media_plans" ON public.media_plans
  FOR UPDATE USING (true);

CREATE POLICY "Deleção de media_plans" ON public.media_plans
  FOR DELETE USING (true);

CREATE TRIGGER update_media_plans_updated_at
  BEFORE UPDATE ON public.media_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
