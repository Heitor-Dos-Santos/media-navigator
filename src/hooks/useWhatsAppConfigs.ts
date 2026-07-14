import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface WhatsAppConfig {
  id: string;
  label: string;
  trigger_type: "page_id" | "ad_account_id" | "form_id";
  trigger_value: string;
  server_url: string;
  api_key: string;
  instance_name: string;
  phone_to: string;
  phones_to: string[];
  message_template: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WhatsAppConfigInsert = Omit<WhatsAppConfig, "id" | "created_at" | "updated_at">;

export const TRIGGER_TYPE_LABELS: Record<WhatsAppConfig["trigger_type"], string> = {
  page_id: "Página do Facebook (Page ID)",
  ad_account_id: "Conta de Anúncios (Ad Account ID)",
  form_id: "Formulário do Meta Ads (Form ID)",
};

export function useWhatsAppConfigs() {
  return useQuery({
    queryKey: ["whatsapp_configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_configs" as never)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as WhatsAppConfig[];
    },
    refetchInterval: 30_000,
  });
}

export function useUpsertWhatsAppConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: WhatsAppConfigInsert & { id?: string }) => {
      const { id, ...rest } = config;
      // Sync phones_to[0] → phone_to for backwards compat
      const payload = {
        ...rest,
        phone_to: rest.phones_to?.[0] ?? rest.phone_to ?? "",
        phones_to: rest.phones_to?.length ? rest.phones_to : [rest.phone_to].filter(Boolean),
      };
      if (id) {
        const { error } = await supabase
          .from("whatsapp_configs" as never)
          .update(payload as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_configs" as never)
          .insert(payload as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_configs"] });
      toast({ title: "Configuração salva com sucesso!" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteWhatsAppConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whatsapp_configs" as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_configs"] });
      toast({ title: "Configuração removida." });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao remover", description: err.message, variant: "destructive" });
    },
  });
}
