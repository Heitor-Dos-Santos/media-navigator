import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, Clock, User } from "lucide-react";
import { useState } from "react";

interface TaxonomyEntry { id: string; taxonomy: string; platform: string; createdAt: string; createdBy: string; status: "valid" | "warning" | "deprecated"; }

const mockHistory: TaxonomyEntry[] = [
  { id: "1", taxonomy: "ACME_Q1_META_CONVERSION_VIDEO_PROSPECTING", platform: "Meta", createdAt: "2024-01-15 14:30", createdBy: "João Silva", status: "valid" },
  { id: "2", taxonomy: "ACME_Q1_GOOGLE_AWARENESS_DISPLAY_REMARKETING", platform: "Google Ads", createdAt: "2024-01-15 10:15", createdBy: "Maria Santos", status: "valid" },
  { id: "3", taxonomy: "ACME_Q1_DV360_CONSIDERATION_NATIVE_LOOKALIKE", platform: "DV360", createdAt: "2024-01-14 16:45", createdBy: "Pedro Costa", status: "warning" },
  { id: "4", taxonomy: "ACME_OLD_TIKTOK_ENGAGEMENT", platform: "TikTok", createdAt: "2024-01-10 09:00", createdBy: "Ana Lima", status: "deprecated" },
];

export function TaxonomyHistory() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const handleCopy = (id: string, taxonomy: string) => { navigator.clipboard.writeText(taxonomy); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  return (
    <div className="space-y-3">
      {mockHistory.map((entry) => (
        <div key={entry.id} className={cn("p-4 rounded-xl bg-card border transition-all duration-200 hover:border-primary/30", entry.status === "deprecated" && "opacity-60")}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={cn("text-xs", entry.status === "valid" && "border-status-success text-status-success", entry.status === "warning" && "border-status-warning text-status-warning", entry.status === "deprecated" && "border-muted-foreground text-muted-foreground")}>{entry.platform}</Badge>
                <Badge variant="secondary" className={cn("text-xs", entry.status === "valid" && "bg-status-success/10 text-status-success", entry.status === "warning" && "bg-status-warning/10 text-status-warning", entry.status === "deprecated" && "bg-muted text-muted-foreground")}>
                  {entry.status === "valid" && "Ativo"}{entry.status === "warning" && "Revisar"}{entry.status === "deprecated" && "Descontinuado"}
                </Badge>
              </div>
              <code className="block text-sm font-mono text-foreground break-all mb-3">{entry.taxonomy}</code>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{entry.createdAt}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{entry.createdBy}</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(entry.id, entry.taxonomy)} className="shrink-0">
              {copiedId === entry.id ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
