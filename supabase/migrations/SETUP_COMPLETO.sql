-- =====================================================================
-- SETUP COMPLETO — MediaHub Access Control
-- Rodar no SQL Editor: https://supabase.com/dashboard/project/skcmfxxkxcavyifrxajz/sql/new
-- =====================================================================

-- =====================================================================
-- Função base: atualização automática de updated_at
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- =====================================================================
-- TABELA: leads
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  campaign_name TEXT NOT NULL DEFAULT '',
  campaign_id TEXT,
  ad_id TEXT,
  form_id TEXT,
  page_id TEXT,
  ad_account_id TEXT,
  source TEXT NOT NULL DEFAULT 'meta_ads',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  raw_payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de leads" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Inserção de leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de leads" ON public.leads FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads (campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_page_id ON public.leads (page_id);

DROP TRIGGER IF EXISTS update_leads_updated_at ON public.leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: meta_ads_config
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.meta_ads_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id TEXT,
  verify_token TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meta_ads_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de config Meta" ON public.meta_ads_config FOR SELECT USING (true);
CREATE POLICY "Inserção de config Meta" ON public.meta_ads_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de config Meta" ON public.meta_ads_config FOR UPDATE USING (true);

DROP TRIGGER IF EXISTS update_meta_ads_config_updated_at ON public.meta_ads_config;
CREATE TRIGGER update_meta_ads_config_updated_at
  BEFORE UPDATE ON public.meta_ads_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: whatsapp_configs
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.whatsapp_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'page_id',
  trigger_value TEXT NOT NULL,
  server_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  instance_name TEXT NOT NULL,
  phone_to TEXT NOT NULL,
  phones_to TEXT[] NOT NULL DEFAULT '{}',
  message_template TEXT NOT NULL DEFAULT '🔔 Novo lead recebido!\n\n👤 Nome: {{nome}}\n📧 Email: {{email}}\n📱 Telefone: {{telefone}}\n📢 Campanha: {{campanha}}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de whatsapp_configs" ON public.whatsapp_configs FOR SELECT USING (true);
CREATE POLICY "Inserção de whatsapp_configs" ON public.whatsapp_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de whatsapp_configs" ON public.whatsapp_configs FOR UPDATE USING (true);
CREATE POLICY "Deleção de whatsapp_configs" ON public.whatsapp_configs FOR DELETE USING (true);

DROP TRIGGER IF EXISTS update_whatsapp_configs_updated_at ON public.whatsapp_configs;
CREATE TRIGGER update_whatsapp_configs_updated_at
  BEFORE UPDATE ON public.whatsapp_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: evolution_api_config
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.evolution_api_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.evolution_api_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de evolution_api_config" ON public.evolution_api_config FOR SELECT USING (true);
CREATE POLICY "Inserção de evolution_api_config" ON public.evolution_api_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de evolution_api_config" ON public.evolution_api_config FOR UPDATE USING (true);
CREATE POLICY "Deleção de evolution_api_config" ON public.evolution_api_config FOR DELETE USING (true);

DROP TRIGGER IF EXISTS update_evolution_api_config_updated_at ON public.evolution_api_config;
CREATE TRIGGER update_evolution_api_config_updated_at
  BEFORE UPDATE ON public.evolution_api_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: clients
-- =====================================================================
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

CREATE POLICY "Leitura pública de clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Inserção de clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Deleção de clients" ON public.clients FOR DELETE USING (true);

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: media_plans
-- =====================================================================
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

CREATE POLICY "Leitura pública de media_plans" ON public.media_plans FOR SELECT USING (true);
CREATE POLICY "Inserção de media_plans" ON public.media_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de media_plans" ON public.media_plans FOR UPDATE USING (true);
CREATE POLICY "Deleção de media_plans" ON public.media_plans FOR DELETE USING (true);

DROP TRIGGER IF EXISTS update_media_plans_updated_at ON public.media_plans;
CREATE TRIGGER update_media_plans_updated_at
  BEFORE UPDATE ON public.media_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: platform_connections (OAuth de tráfego pago por usuário)
-- =====================================================================
DROP TABLE IF EXISTS public.platform_connections CASCADE;

CREATE TABLE public.platform_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL DEFAULT 'pending',
  account_name TEXT,
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform, account_id)
);

ALTER TABLE public.platform_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios gerenciam suas proprias conexoes"
  ON public.platform_connections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_platform_connections_updated_at ON public.platform_connections;
CREATE TRIGGER update_platform_connections_updated_at
  BEFORE UPDATE ON public.platform_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- =====================================================================
-- TABELA: oauth_states (estados temporários do fluxo OAuth)
-- =====================================================================
DROP TABLE IF EXISTS public.oauth_states CASCADE;

CREATE TABLE public.oauth_states (
  state TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  redirect_origin TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.oauth_states ENABLE ROW LEVEL SECURITY;
-- Acesso apenas via service_role (Edge Functions)
