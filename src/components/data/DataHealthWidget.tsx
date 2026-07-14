import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Database, RefreshCw, AlertTriangle, CheckCircle2, Clock, FileWarning,
} from "lucide-react";
import { MOCK_DATA_HEALTH } from "@/data/dataArchitectureData";
import { HEALTH_STATUS_CONFIG } from "@/types/dataArchitecture";
import { format } from "date-fns";

export function DataHealthWidget() {
  const h = MOCK_DATA_HEALTH;
  const status = HEALTH_STATUS_CONFIG[h.overall_status];
  const freshness = HEALTH_STATUS_CONFIG[h.freshness_status];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Saúde dos Dados
          </CardTitle>
          <Badge variant="outline" className={`text-xs ${status.bg} ${status.color}`}>
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <MetricItem
            icon={Clock}
            label="Último Sync"
            value={format(new Date(h.last_sync), "dd/MM HH:mm")}
            color="text-primary"
          />
          <MetricItem
            icon={RefreshCw}
            label="Registros (24h)"
            value={h.records_processed_24h.toLocaleString("pt-BR")}
            color="text-emerald-400"
          />
          <MetricItem
            icon={AlertTriangle}
            label="Erros de Validação"
            value={String(h.validation_errors)}
            color={h.validation_errors > 0 ? "text-orange-400" : "text-emerald-400"}
          />
          <MetricItem
            icon={FileWarning}
            label="Dados Ausentes"
            value={String(h.missing_data_alerts)}
            color={h.missing_data_alerts > 0 ? "text-yellow-400" : "text-emerald-400"}
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">Frescor dos Dados</span>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${freshness.bg}`} />
            <span className={`text-xs font-medium ${freshness.color}`}>{freshness.label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricItem({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
      <Icon className={`w-3.5 h-3.5 ${color} flex-shrink-0`} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
