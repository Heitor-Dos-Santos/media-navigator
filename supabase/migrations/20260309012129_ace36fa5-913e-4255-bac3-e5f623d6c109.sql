
-- Adiciona coluna phones_to (array) e migra os dados existentes
ALTER TABLE public.whatsapp_configs 
  ADD COLUMN IF NOT EXISTS phones_to text[] NOT NULL DEFAULT '{}';

-- Migra dados existentes: converte phone_to para o array phones_to
UPDATE public.whatsapp_configs
  SET phones_to = ARRAY[phone_to]
  WHERE phone_to IS NOT NULL AND phone_to <> '';
