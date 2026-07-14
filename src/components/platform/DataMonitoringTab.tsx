import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Database, HardDrive, Clock, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Server, Layers, Activity, Shield, Bell, Zap,
  Info, RefreshCw, Eye, BarChart3, Gauge,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { MOCK_PIPELINE_OVERVIEW } from "@/data/dataArchitectureData";
import {
  MOCK_INGESTION_TREND, MOCK_LATENCY_TREND, MOCK_STORAGE_TREND,
  MOCK_AGENCY_DATA_HEALTH_TABLE, MOCK_SCHEMA_EVENTS,
  MOCK_VOLUME_ANOMALIES, MOCK_FEATURE_STORE_HEALTH,
  MOCK_WAREHOUSE_RESOURCES, MOCK_GLOBAL_RISK, MOCK_SUPPLIER_ALERTS,
} from "@/data/dataMonitoringData";
import {
  RISK_LEVEL_CONFIG, PLATFORM_HEALTH_CONFIG, SUPPLIER_ALERT_LABELS, LAG_CONFIG,
} from "@/types/dataMonitoring";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

// ═════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════

export function DataMonitoringTab() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-muted/50 flex-wrap h-auto p-1 gap-1">
        <TabsTrigger value="overview" className="text-xs gap-1.5"><BarChart3 className="w-3.5 h-3.5" />Visão Geral</TabsTrigger>
        <TabsTrigger value="tenant-health" className="text-xs gap-1.5"><Activity className="w-3.5 h-3.5" />Saúde por Agência</TabsTrigger>
        <TabsTrigger value="schema" className="text-xs gap-1.5"><Database className="w-3.5 h-3.5" />Schema</TabsTrigger>
        <TabsTrigger value="volume" className="text-xs gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Anomalias de Volume</TabsTrigger>
        <TabsTrigger value="feature-store" className="text-xs gap-1.5"><Layers className="w-3.5 h-3.5" />Feature Store</TabsTrigger>
        <TabsTrigger value="resources" className="text-xs gap-1.5"><Server className="w-3.5 h-3.5" />Recursos</TabsTrigger>
        <TabsTrigger value="alerts" className="text-xs gap-1.5"><Bell className="w-3.5 h-3.5" />Alertas</TabsTrigger>
      </TabsList>

      <TabsContent value="overview"><OverviewSection /></TabsContent>
      <TabsContent value="tenant-health"><TenantHealthSection /></TabsContent>
      <TabsContent value="schema"><SchemaSection /></TabsContent>
      <TabsContent value="volume"><VolumeAnomalySection /></TabsContent>
      <TabsContent value="feature-store"><FeatureStoreSection /></TabsContent>
      <TabsContent value="resources"><ResourceSection /></TabsContent>
      <TabsContent value="alerts"><AlertsSection /></TabsContent>
    </Tabs>
  );
}

// ═════════════════════════════════════════════════════════
// 1. OVERVIEW DASHBOARD
// ═════════════════════════════════════════════════════════

function OverviewSection() {
  const p = MOCK_PIPELINE_OVERVIEW;
  const risk = MOCK_GLOBAL_RISK;
  const riskCfg = PLATFORM_HEALTH_CONFIG[risk.status];
  const activeTenants = MOCK_AGENCY_DATA_HEALTH_TABLE.filter(t => t.status === "active").length;
  const totalDSP = MOCK_AGENCY_DATA_HEALTH_TABLE.reduce((s, t) => s + (t.status === "active" ? 1 : 0), 0) * 3; // approx

  const radarData = [
    { metric: "Falhas", value: risk.components.failure_rate_score },
    { metric: "Schema", value: risk.components.schema_change_score },
    { metric: "Volume", value: risk.components.volume_anomaly_score },
    { metric: "Feature Store", value: risk.components.feature_store_lag_score },
    { metric: "Validação", value: risk.components.validation_error_score },
  ];

  return (
    <div className="space-y-6">
      {/* Global Risk Score + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Risk Score Card */}
        <Card className="border-border/50 bg-card/80 backdrop-blur lg:row-span-2">
          <CardContent className="p-5 space-y-4 flex flex-col items-center justify-center h-full">
            <Shield className={cn("w-8 h-8", riskCfg.color)} />
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Risco Global de Dados</p>
              <p className={cn("text-4xl font-bold", riskCfg.color)}>{risk.score}</p>
              <p className="text-xs text-muted-foreground mt-1">de 100</p>
            </div>
            <Badge variant="outline" className={cn("text-xs", RISK_LEVEL_CONFIG[risk.score <= 25 ? "low" : risk.score <= 50 ? "medium" : risk.score <= 75 ? "high" : "critical"].bg, RISK_LEVEL_CONFIG[risk.score <= 25 ? "low" : risk.score <= 50 ? "medium" : risk.score <= 75 ? "high" : "critical"].color)}>
              {riskCfg.label}
            </Badge>
            <div className="w-full mt-2">
              <ResponsiveContainer width="100%" height={160}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={CHART_COLORS.border} />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: CHART_COLORS.muted }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <MonitorKPI icon={Database} label="Registros (24h)" value={p.total_records_24h.toLocaleString("pt-BR")} />
        <MonitorKPI icon={Server} label="Registros (7d)" value={p.total_records_7d.toLocaleString("pt-BR")} />
        <MonitorKPI icon={HardDrive} label="Registros (30d)" value={p.total_records_30d.toLocaleString("pt-BR")} />
        <MonitorKPI icon={Activity} label="Agências Ativas" value={String(activeTenants)} />
        <MonitorKPI icon={Zap} label="Conexões DSP" value={String(totalDSP)} sub="estimativa" />
        <MonitorKPI icon={CheckCircle2} label="Taxa de Sucesso" value={`${(100 - p.sync_failure_rate).toFixed(1)}%`} color={p.sync_failure_rate > 5 ? "text-orange-400" : "text-emerald-400"} />
      </div>

      {/* Health Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthBar label="Taxa de Falha Sync" value={p.sync_failure_rate} max={20} unit="%" warn={p.sync_failure_rate > 5} />
        <HealthBar label="Schema Mismatch" value={p.schema_mismatch_rate} max={5} unit="%" warn={p.schema_mismatch_rate > 2} />
        <HealthBar label="Latência Ingestão" value={p.avg_ingestion_latency_ms} max={5000} unit="ms" warn={p.avg_ingestion_latency_ms > 3000} />
        <HealthBar label="Atualiz. Feature Store" value={p.feature_store_update_time_ms} max={10000} unit="ms" warn={p.feature_store_update_time_ms > 5000} />
      </div>

      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Volume de Ingestão (7d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_INGESTION_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                <YAxis tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                <RTooltip />
                <Area type="monotone" dataKey="records" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} name="Registros" />
                <Area type="monotone" dataKey="failures" stroke={CHART_COLORS.chart3} fill={CHART_COLORS.chart3} fillOpacity={0.15} name="Falhas" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Latência (7d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={MOCK_LATENCY_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                <YAxis tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} unit="ms" />
                <RTooltip />
                <Line type="monotone" dataKey="ingestion" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} name="Ingestão" />
                <Line type="monotone" dataKey="featureStore" stroke={CHART_COLORS.chart2} strokeWidth={2} dot={false} name="Feature Store" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Storage Trend */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-sm">Crescimento de Armazenamento (30d)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MOCK_STORAGE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
              <YAxis tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} unit=" MB" />
              <RTooltip />
              <Bar dataKey="storage_mb" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Armazenamento" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// 2. TENANT DATA HEALTH TABLE
// ═════════════════════════════════════════════════════════

function TenantHealthSection() {
  const [planFilter, setPlanFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const filtered = MOCK_AGENCY_DATA_HEALTH_TABLE.filter(t => {
    if (planFilter !== "all" && t.plan !== planFilter) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (riskFilter !== "all" && t.data_risk_level !== riskFilter) return false;
    return true;
  });

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base">Saúde de Dados por Agência</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Plano" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Planos</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="starter">Starter</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="suspended">Suspenso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue placeholder="Risco" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">Baixo</SelectItem>
                <SelectItem value="medium">Médio</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agência</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Último Sync</TableHead>
              <TableHead className="text-right">Frescor</TableHead>
              <TableHead className="text-right">Erros (%)</TableHead>
              <TableHead className="text-right">Schema</TableHead>
              <TableHead className="text-right">Falhas (7d)</TableHead>
              <TableHead className="text-right">Latência FS</TableHead>
              <TableHead>Risco</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => {
              const risk = RISK_LEVEL_CONFIG[t.data_risk_level];
              return (
                <TableRow key={t.agency_id}>
                  <TableCell className="font-medium">{t.agency_name}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs capitalize">{t.plan}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {t.last_sync ? format(new Date(t.last_sync), "dd/MM HH:mm") : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-mono text-sm font-bold", t.freshness_score >= 80 ? "text-emerald-400" : t.freshness_score >= 50 ? "text-yellow-400" : "text-red-400")}>
                      {t.freshness_score}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-mono text-xs", t.validation_error_rate > 5 ? "text-red-400" : t.validation_error_rate > 2 ? "text-yellow-400" : "text-muted-foreground")}>
                      {t.validation_error_rate}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{t.schema_mismatch_incidents}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-mono text-xs", t.failed_syncs_7d > 5 ? "text-red-400" : t.failed_syncs_7d > 2 ? "text-yellow-400" : "text-muted-foreground")}>
                      {t.failed_syncs_7d}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {t.feature_store_latency_ms > 0 ? `${(t.feature_store_latency_ms / 1000).toFixed(1)}s` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", risk.bg, risk.color)}>{risk.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">Nenhum tenant encontrado.</div>
        )}
      </CardContent>
    </Card>
  );
}

// ═════════════════════════════════════════════════════════
// 3. SCHEMA MONITORING
// ═════════════════════════════════════════════════════════

function SchemaSection() {
  const unresolvedCount = MOCK_SCHEMA_EVENTS.filter(e => !e.resolved_flag && e.schema_change_flag).length;

  return (
    <div className="space-y-4">
      {unresolvedCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <p className="text-sm text-orange-400 font-medium">{unresolvedCount} alteração(ões) de schema não resolvida(s)</p>
        </div>
      )}

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Monitoramento de Schema</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agência</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Versão Detectada</TableHead>
                <TableHead>Mudança</TableHead>
                <TableHead>Campos Afetados</TableHead>
                <TableHead>Detectado</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SCHEMA_EVENTS.map(e => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-sm">{e.agency_name}</TableCell>
                  <TableCell className="text-sm">{e.platform}</TableCell>
                  <TableCell className="font-mono text-xs">{e.schema_version_detected}</TableCell>
                  <TableCell>
                    {e.schema_change_flag
                      ? <Badge variant="outline" className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">Alterado</Badge>
                      : <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Estável</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {e.affected_fields.length > 0
                        ? e.affected_fields.map(f => <Badge key={f} variant="secondary" className="text-[10px]">{f}</Badge>)
                        : <span className="text-xs text-muted-foreground">—</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(e.detected_at), "dd/MM HH:mm")}</TableCell>
                  <TableCell>
                    {e.resolved_flag
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <XCircle className="w-4 h-4 text-red-400" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// 4. VOLUME ANOMALY
// ═════════════════════════════════════════════════════════

function VolumeAnomalySection() {
  const anomalyTypeLabels: Record<string, { label: string; color: string }> = {
    drop: { label: "Queda", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    spike: { label: "Pico", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    zero_data: { label: "Zero Dados", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader><CardTitle className="text-base">Anomalias de Volume</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agência</TableHead>
              <TableHead>Plataforma</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Volume Esperado</TableHead>
              <TableHead className="text-right">Volume Real</TableHead>
              <TableHead className="text-right">Anomaly Score</TableHead>
              <TableHead>Detectado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_VOLUME_ANOMALIES.map(a => {
              const at = anomalyTypeLabels[a.anomaly_type];
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-medium text-sm">{a.agency_name}</TableCell>
                  <TableCell className="text-sm">{a.platform}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("text-xs", at.color)}>{at.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{a.expected_volume_min.toLocaleString()}–{a.expected_volume_max.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn("font-mono text-sm font-bold", a.anomaly_score > 80 ? "text-red-400" : "text-yellow-400")}>
                      {a.actual_volume.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Progress value={a.anomaly_score} className="h-1.5 w-12" />
                      <span className="font-mono text-xs font-bold">{a.anomaly_score}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(a.detected_at), "dd/MM HH:mm")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ═════════════════════════════════════════════════════════
// 5. FEATURE STORE
// ═════════════════════════════════════════════════════════

function FeatureStoreSection() {
  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(() => {
          const avg = MOCK_FEATURE_STORE_HEALTH.reduce((s, h) => s + h.update_duration_ms, 0) / MOCK_FEATURE_STORE_HEALTH.length;
          const driftCount = MOCK_FEATURE_STORE_HEALTH.filter(h => h.drift_warning_flag).length;
          const criticalCount = MOCK_FEATURE_STORE_HEALTH.filter(h => h.lag_indicator === "critical").length;
          return (
            <>
              <MonitorKPI icon={Clock} label="Duração Média de Atualização" value={`${(avg / 1000).toFixed(1)}s`} />
              <MonitorKPI icon={AlertTriangle} label="Avisos de Drift" value={String(driftCount)} color={driftCount > 0 ? "text-orange-400" : "text-emerald-400"} />
              <MonitorKPI icon={XCircle} label="Lag Crítico" value={String(criticalCount)} color={criticalCount > 0 ? "text-red-400" : "text-emerald-400"} />
            </>
          );
        })()}
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Performance do Feature Store</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agência</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead className="text-right">Duração</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead>Lag</TableHead>
                <TableHead>Drift</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_FEATURE_STORE_HEALTH.map(h => {
                const lag = LAG_CONFIG[h.lag_indicator];
                return (
                  <TableRow key={h.agency_id}>
                    <TableCell className="font-medium">{h.agency_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(h.last_update_time), "dd/MM HH:mm")}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{(h.update_duration_ms / 1000).toFixed(1)}s</TableCell>
                    <TableCell className="text-right font-mono text-xs">{h.record_count.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", lag.bg, lag.color)}>{lag.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {h.drift_warning_flag
                        ? <AlertTriangle className="w-4 h-4 text-orange-400" />
                        : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
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

// ═════════════════════════════════════════════════════════
// 6. COST & RESOURCE MONITORING
// ═════════════════════════════════════════════════════════

function ResourceSection() {
  const r = MOCK_WAREHOUSE_RESOURCES;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <MonitorKPI icon={Database} label="Volume de Queries" value={r.total_query_volume.toLocaleString()} />
        <MonitorKPI icon={Clock} label="Duração Média Query" value={`${r.avg_query_duration_ms}ms`} />
        <MonitorKPI icon={HardDrive} label="Cresc. Armazenamento" value={`${r.storage_growth_rate_mb_day} MB/dia`} />
        <MonitorKPI icon={Zap} label="Pico de Compute" value={r.compute_spike_flag ? "Sim" : "Não"} color={r.compute_spike_flag ? "text-red-400" : "text-emerald-400"} />
        <MonitorKPI icon={Gauge} label="Índice de Custo" value={`${r.estimated_cost_index}/100`} color={r.estimated_cost_index > 60 ? "text-orange-400" : "text-emerald-400"} />
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Índice Estimado de Custo do Warehouse</p>
              <span className={cn("text-2xl font-bold", r.estimated_cost_index > 60 ? "text-orange-400" : r.estimated_cost_index > 40 ? "text-yellow-400" : "text-emerald-400")}>
                {r.estimated_cost_index}
              </span>
            </div>
            <Progress value={r.estimated_cost_index} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 — Otimizado</span>
              <span>50 — Normal</span>
              <span>100 — Elevado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">Sobre o Índice de Custo</p>
          <p className="text-xs text-muted-foreground">
            Este índice é uma estimativa baseada em volume de queries, duração média, crescimento de armazenamento e picos de compute.
            Não reflete custos reais de billing — é um indicador de tendência para decisões de governança.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// 7. SUPPLIER ALERTS
// ═════════════════════════════════════════════════════════

function AlertsSection() {
  const [alerts, setAlerts] = useState(MOCK_SUPPLIER_ALERTS);
  const unack = alerts.filter(a => !a.acknowledged).length;

  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="space-y-4">
      {unack > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <Bell className="w-4 h-4 text-red-400" />
          <p className="text-sm text-red-400 font-medium">{unack} alerta(s) não reconhecido(s)</p>
        </div>
      )}

      <div className="space-y-3">
        {alerts.map(a => {
          const risk = RISK_LEVEL_CONFIG[a.severity];
          const alertMeta = SUPPLIER_ALERT_LABELS[a.type];
          return (
            <Card key={a.id} className={cn("border-border/50 bg-card/80 backdrop-blur", !a.acknowledged && "border-l-2 border-l-red-500")}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg">{alertMeta.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <Badge variant="outline" className={cn("text-xs", risk.bg, risk.color)}>{risk.label}</Badge>
                        <Badge variant="outline" className="text-xs">{alertMeta.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {a.agency_name && <span>Agência: <span className="font-medium text-foreground">{a.agency_name}</span></span>}
                        <span>{format(new Date(a.detected_at), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                  {!a.acknowledged && (
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 flex-shrink-0" onClick={() => handleAcknowledge(a.id)}>
                      <Eye className="w-3.5 h-3.5" />Reconhecer
                    </Button>
                  )}
                  {a.acknowledged && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />Reconhecido
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═════════════════════════════════════════════════════════

function MonitorKPI({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color?: string }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className={cn("w-4 h-4", color || "text-primary")} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn("text-lg font-bold", color)}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthBar({ label, value, max, unit, warn }: { label: string; value: number; max: number; unit: string; warn: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <span className={cn("text-sm font-bold", warn ? "text-orange-400" : "text-emerald-400")}>
            {value}{unit}
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </CardContent>
    </Card>
  );
}
