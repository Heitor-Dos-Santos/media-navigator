-- Google Ads (e outras plataformas com access_token de curta duração) precisam
-- de um refresh_token para renovar o access_token sem pedir login novamente.
ALTER TABLE public.platform_connections
  ADD COLUMN IF NOT EXISTS refresh_token TEXT;
