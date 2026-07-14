import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Database, HardDrive, Clock, AlertTriangle, CheckCircle2, XCircle, Zap,
  TrendingUp, Server, Layers,
} from "lucide-react";
import { MOCK_PIPELINE_OVERVIEW, MOCK_INGESTION_LOGS } from "@/data/dataArchitectureData";
import { format } from "date-fns";

const sourceTypeLabels: Record<string, string> = {
  api: "API",
  upload: "Upload",
  warehouse_sync: "Warehouse Sync",
};

const platformLabels: Record<string, string> = {
  meta_ads: "Meta Ads",
  google_ads: "Google Ads",
  dv360: "DV360",
  linkedin_ads: "LinkedIn Ads",
  tiktok_ads: "TikTok Ads",
  uploaded_file: "Arquivo",
  external_warehouse: "Warehouse Ext.",
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  success: { label: "Sucesso", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  failed: { label: "Falha", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle },
  partial: { label: "Parcial", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertTriangle },
};

export function DataPipelinePanel() {
  const p = MOCK_PIPELINE_OVERVIEW;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PipelineKPI icon={Database} label="Registros (24h)" value={p.total_records_24h.toLocaleString("pt-BR")} />
        <PipelineKPI icon={Server} label="Registros (7d)" value={p.total_records_7d.toLocaleString("pt-BR")} />
        <PipelineKPI icon={HardDrive} label="Registros (30d)" value={p.total_records_30d.toLocaleString("pt-BR")} />
        <PipelineKPI icon={TrendingUp} label="Cresc. Armazenamento" value={`${p.storage_growth_mb_30d.toLocaleString("pt-BR")} MB`} />
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthMetric label="Taxa de Falha de Sync" value={p.sync_failure_rate} max={20} unit="%" warning={p.sync_failure_rate > 5} />
        <HealthMetric label="Incompatibilidade de Schema" value={p.schema_mismatch_rate} max={5} unit="%" warning={p.schema_mismatch_rate > 2} />
        <HealthMetric label="Latência Média de Ingestão" value={p.avg_ingestion_latency_ms} max={5000} unit="ms" warning={p.avg_ingestion_latency_ms > 3000} />
        <HealthMetric label="Atualiz. Feature Store" value={p.feature_store_update_time_ms} max={10000} unit="ms" warning={p.feature_store_update_time_ms > 5000} />
      </div>

      {/* Recent Ingestion Logs (anonymized — no tenant breakdown) */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Logs Recentes de Ingestão (anonimizado)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origem</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_INGESTION_LOGS.slice(0, 8).map(log => {
                const st = statusConfig[log.status];
                const StIcon = st.icon;
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{sourceTypeLabels[log.source_type]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{platformLabels[log.platform] || log.platform}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{log.records_processed.toLocaleString("pt-BR")}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${st.color}`}>
                        <StIcon className="w-3 h-3 mr-1" />
                        {st.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.ingestion_time), "dd/MM HH:mm")}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.error_message || "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function PipelineKPI({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HealthMetric({ label, value, max, unit, warning }: { label: string; value: number; max: number; unit: string; warning: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <span className={`text-sm font-bold ${warning ? "text-orange-400" : "text-emerald-400"}`}>
            {value}{unit}
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </CardContent>
    </Card>
  );
}
