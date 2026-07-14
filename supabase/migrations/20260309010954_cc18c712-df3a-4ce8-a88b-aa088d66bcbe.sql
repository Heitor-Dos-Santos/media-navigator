
-- Tabela de configurações de WhatsApp por rota de disparo
CREATE TABLE public.whatsapp_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,                          -- Nome do cliente/conta (ex: "Imobiliária Premium")
  trigger_type TEXT NOT NULL DEFAULT 'page_id', -- 'page_id' | 'ad_account_id'
  trigger_value TEXT NOT NULL,                  -- Valor do ID correspondente
  server_url TEXT NOT NULL,                     -- URL base da Evolution API
  api_key TEXT NOT NULL,                        -- API Key global da Evolution
  instance_name TEXT NOT NULL,                  -- Nome da instância Evolution
  phone_to TEXT NOT NULL,                       -- Número destinatário (DDI+DDD+número)
  message_template TEXT NOT NULL DEFAULT '🔔 Novo lead recebido!\n\n👤 Nome: {{nome}}\n📧 Email: {{email}}\n📱 Telefone: {{telefone}}\n📢 Campanha: {{campanha}}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.whatsapp_configs ENABLE ROW LEVEL SECURITY;

-- Políticas públicas (sem auth, consistente com as outras tabelas do projeto)
CREATE POLICY "Leitura de whatsapp_configs" ON public.whatsapp_configs FOR SELECT USING (true);
CREATE POLICY "Inserção de whatsapp_configs" ON public.whatsapp_configs FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de whatsapp_configs" ON public.whatsapp_configs FOR UPDATE USING (true);
CREATE POLICY "Deleção de whatsapp_configs" ON public.whatsapp_configs FOR DELETE USING (true);

-- Trigger para updated_at automático
CREATE TRIGGER update_whatsapp_configs_updated_at
  BEFORE UPDATE ON public.whatsapp_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
