import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface EvolutionApiConfig {
  id: string;
  server_url: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEvolutionApiConfig() {
  return useQuery({
    queryKey: ["evolution_api_config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("evolution_api_config" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as EvolutionApiConfig | null;
    },
    refetchInterval: 30_000,
  });
}

export function useUpsertEvolutionApiConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: { id?: string; server_url: string; api_key: string; is_active: boolean }) => {
      const { id, ...rest } = config;
      if (id) {
        const { error } = await supabase
          .from("evolution_api_config" as never)
          .update(rest as never)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("evolution_api_config" as never)
          .insert(rest as never);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evolution_api_config"] });
      toast({ title: "Evolution API configurada com sucesso!" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    },
  });
}
