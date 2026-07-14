-- Guarda a MCC (conta gerenciadora) através da qual uma conta-cliente do Google Ads foi acessada.
-- Necessário no header "login-customer-id" ao consultar métricas de um cliente via hierarquia MCC.
ALTER TABLE public.platform_connections
  ADD COLUMN IF NOT EXISTS manager_customer_id TEXT;
