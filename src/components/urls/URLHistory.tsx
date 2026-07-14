import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Clock, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface URLRecord { id: string; url: string; campaign: string; platform: string; createdAt: string; status: "active" | "expired" | "draft"; }

const mockHistory: URLRecord[] = [
  { id: "1", url: "https://exemplo.com.br/promo?utm_source=google&utm_medium=cpc&utm_campaign=BLACKFRIDAY2024", campaign: "Black Friday 2024", platform: "Google Ads", createdAt: "2024-01-15T10:30:00", status: "active" },
  { id: "2", url: "https://exemplo.com.br/leads?utm_source=meta&utm_medium=social&utm_campaign=LEADS_Q1", campaign: "Leads Q1", platform: "Meta Ads", createdAt: "2024-01-14T14:20:00", status: "active" },
  { id: "3", url: "https://exemplo.com.br/awareness?utm_source=dv360&utm_medium=display&utm_campaign=AWARENESS_BRAND", campaign: "Awareness Brand", platform: "DV360", createdAt: "2024-01-10T09:00:00", status: "expired" },
];

export function URLHistory() {
  const handleCopy = (url: string) => { navigator.clipboard.writeText(url); };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const handleExportXlsx = () => {
    const data = mockHistory.map(record => ({ Campanha: record.campaign, Plataforma: record.platform, URL: record.url, Status: record.status === "active" ? "Ativa" : record.status === "expired" ? "Expirada" : "Rascunho", "Data de Criação": new Date(record.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Histórico URLs");
    ws["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 80 }, { wch: 10 }, { wch: 20 }];
    XLSX.writeFile(wb, `historico-urls-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button variant="outline" size="sm" onClick={handleExportXlsx}><Download className="w-4 h-4 mr-2" />Exportar .xlsx</Button></div>
      <div className="space-y-3">
        {mockHistory.map((record) => (
          <div key={record.id} className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">{record.campaign}</span>
                  <Badge variant="outline" className="text-xs">{record.platform}</Badge>
                  <Badge variant="outline" className={cn("text-xs", record.status === "active" && "border-status-success text-status-success", record.status === "expired" && "border-status-error text-status-error", record.status === "draft" && "border-muted-foreground text-muted-foreground")}>
                    {record.status === "active" && "Ativa"}{record.status === "expired" && "Expirada"}{record.status === "draft" && "Rascunho"}
                  </Badge>
                </div>
                <code className="text-xs text-muted-foreground font-mono break-all line-clamp-2">{record.url}</code>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{formatDate(record.createdAt)}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleCopy(record.url)} className="h-8 w-8"><Copy className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" asChild className="h-8 w-8"><a href={record.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
