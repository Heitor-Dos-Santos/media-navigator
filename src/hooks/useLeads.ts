import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  campaign_name: string;
  campaign_id: string | null;
  ad_id: string | null;
  form_id: string | null;
  page_id: string | null;
  ad_account_id: string | null;
  source: string;
  status: "pending" | "sent" | "failed";
  created_at: string;
}

export interface LeadStats {
  total: number;
  today: number;
  sent: number;
  failed: number;
  pending: number;
}

export function useLeads(filters?: {
  search?: string;
  status?: string;
  campaign?: string;
}) {
  return useQuery({
    queryKey: ["leads", filters],
    queryFn: async () => {
      let query = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.campaign && filters.campaign !== "all") {
        query = query.ilike("campaign_name", `%${filters.campaign}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Lead[];
    },
    refetchInterval: 30_000, // atualiza a cada 30s
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ["lead-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("status, created_at");

      if (error) throw error;

      const leads = data ?? [];
      const today = new Date().toDateString();

      const stats: LeadStats = {
        total: leads.length,
        today: leads.filter((l) => new Date(l.created_at).toDateString() === today).length,
        sent: leads.filter((l) => l.status === "sent").length,
        failed: leads.filter((l) => l.status === "failed").length,
        pending: leads.filter((l) => l.status === "pending").length,
      };

      return stats;
    },
    refetchInterval: 30_000,
  });
}

export function useMetaAdsConfig() {
  return useQuery({
    queryKey: ["meta-ads-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meta_ads_config")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

export function useRetryLead() {
  const qc = useQueryClient();
  return async (leadId: string) => {
    await supabase.from("leads").update({ status: "pending" }).eq("id", leadId);
    qc.invalidateQueries({ queryKey: ["leads"] });
    qc.invalidateQueries({ queryKey: ["lead-stats"] });
  };
}
