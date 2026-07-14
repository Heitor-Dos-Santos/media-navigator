
CREATE TABLE IF NOT EXISTS public.evolution_api_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  server_url text NOT NULL,
  api_key text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.evolution_api_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura de evolution_api_config" ON public.evolution_api_config FOR SELECT USING (true);
CREATE POLICY "Inserção de evolution_api_config" ON public.evolution_api_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Atualização de evolution_api_config" ON public.evolution_api_config FOR UPDATE USING (true);
CREATE POLICY "Deleção de evolution_api_config" ON public.evolution_api_config FOR DELETE USING (true);

CREATE TRIGGER update_evolution_api_config_updated_at
  BEFORE UPDATE ON public.evolution_api_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
