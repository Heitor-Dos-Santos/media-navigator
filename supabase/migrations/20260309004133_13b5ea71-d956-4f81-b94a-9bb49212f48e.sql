
-- Tabela de leads capturados via Meta Ads
CREATE TABLE public.leads (
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

CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_campaign_id ON public.leads (campaign_id);
CREATE INDEX idx_leads_page_id ON public.leads (page_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de configuração Meta Ads
CREATE TABLE public.meta_ads_config (
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

CREATE TRIGGER update_meta_ads_config_updated_at
  BEFORE UPDATE ON public.meta_ads_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
