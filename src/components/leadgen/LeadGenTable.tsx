import { cn } from "@/lib/utils";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { useLeads, Lead } from "@/hooks/useLeads";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  sent: { label: "Enviado", className: "bg-status-success/10 text-status-success" },
  pending: { label: "Pendente", className: "bg-status-warning/10 text-status-warning" },
  failed: { label: "Falhou", className: "bg-status-error/10 text-status-error" },
};

interface LeadGenTableProps {
  searchQuery?: string;
  filterAccount?: string;
  filterCampaign?: string;
  filterStatus?: string;
  compact?: boolean;
}

export function LeadGenTable({
  searchQuery = "",
  filterCampaign = "all",
  filterStatus = "all",
  compact = false,
}: LeadGenTableProps) {
  const { data: leads = [], isLoading, refetch, isFetching } = useLeads({
    status: filterStatus,
    campaign: filterCampaign,
  });

  const filtered = leads.filter((lead: Lead) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      lead.name.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q)
    );
  });

  const formatTime = (iso: string) => {
    try {
      return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: ptBR });
    } catch {
      return iso;
    }
  };

  const handleExport = () => {
    const csv = [
      ["Nome", "Email", "Telefone", "Campanha", "Status", "Data"],
      ...filtered.map((l) => [
        l.name, l.email, l.phone, l.campaign_name, l.status, l.created_at,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Leads Recentes</h3>
          <p className="text-xs text-muted-foreground">Capturados em tempo real via Meta Ads</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">{filtered.length} resultado(s)</span>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            {isFetching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
            Atualizar
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Contato</th>
              {!compact && <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Campanha</th>}
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Quando</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={compact ? 4 : 5} className="px-5 py-10 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={compact ? 4 : 5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  {leads.length === 0
                    ? "Nenhum lead ainda. Configure o webhook do Meta Ads para começar a receber."
                    : "Nenhum lead encontrado com os filtros aplicados."}
                </td>
              </tr>
            ) : (
              filtered.map((lead: Lead, i: number) => {
                const status = statusConfig[lead.status] ?? statusConfig.pending;
                return (
                  <tr
                    key={lead.id}
                    className="hover:bg-muted/20 transition-colors"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-medium text-foreground">{lead.name || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <p className="text-sm text-foreground">{lead.email || "—"}</p>
                        <p className="text-xs text-muted-foreground">{lead.phone || "—"}</p>
                      </div>
                    </td>
                    {!compact && (
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-foreground">{lead.campaign_name || "—"}</span>
                      </td>
                    )}
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">{formatTime(lead.created_at)}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", status.className)}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
