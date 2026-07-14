import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Database, HardDrive, Clock, AlertTriangle, CheckCircle2, XCircle,
  TrendingUp, Shield, Lock, Key, Cpu, Layers, Gauge, FlaskConical,
  GitBranch, RefreshCw, Workflow, Server, BrainCircuit, Activity,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  MOCK_PARTITION_CONFIGS, MOCK_FS_VERSIONS, MOCK_MATERIALIZED_VIEWS,
  MOCK_PIPELINE_JOBS, MOCK_PERFORMANCE, MOCK_SECURITY_CONFIG,
  MOCK_SECURITY_EVENTS, MOCK_COST_TREND, MOCK_SCALABILITY, MOCK_ML_SNAPSHOTS,
} from "@/data/infrastructureData";
import {
  JOB_STATUS_CONFIG, SECURITY_SEVERITY_CONFIG, MV_STATUS_CONFIG, ML_SNAPSHOT_STATUS_CONFIG,
} from "@/types/infrastructure";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

export function PlatformHealthTab() {
  return (
    <Tabs defaultValue="performance" className="space-y-4">
      <TabsList className="bg-muted/50 flex-wrap h-auto p-1 gap-1">
        <TabsTrigger value="performance" className="text-xs gap-1.5"><Activity className="w-3.5 h-3.5" />Performance</TabsTrigger>
        <TabsTrigger value="pipelines" className="text-xs gap-1.5"><Workflow className="w-3.5 h-3.5" />Pipelines</TabsTrigger>
        <TabsTrigger value="partitioning" className="text-xs gap-1.5"><Database className="w-3.5 h-3.5" />Particionamento</TabsTrigger>
        <TabsTrigger value="views" className="text-xs gap-1.5"><Layers className="w-3.5 h-3.5" />Views Materializadas</TabsTrigger>
        <TabsTrigger value="versioning" className="text-xs gap-1.5"><GitBranch className="w-3.5 h-3.5" />Versionamento FS</TabsTrigger>
        <TabsTrigger value="security" className="text-xs gap-1.5"><Shield className="w-3.5 h-3.5" />Segurança</TabsTrigger>
        <TabsTrigger value="cost" className="text-xs gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Custos</TabsTrigger>
        <TabsTrigger value="scalability" className="text-xs gap-1.5"><Server className="w-3.5 h-3.5" />Escalabilidade & ML</TabsTrigger>
      </TabsList>

      <TabsContent value="performance"><PerformanceSection /></TabsContent>
      <TabsContent value="pipelines"><PipelineSection /></TabsContent>
      <TabsContent value="partitioning"><PartitioningSection /></TabsContent>
      <TabsContent value="views"><MaterializedViewsSection /></TabsContent>
      <TabsContent value="versioning"><FeatureStoreVersioningSection /></TabsContent>
      <TabsContent value="security"><SecuritySection /></TabsContent>
      <TabsContent value="cost"><CostSection /></TabsContent>
      <TabsContent value="scalability"><ScalabilitySection /></TabsContent>
    </Tabs>
  );
}

// ═══ PERFORMANCE ═══
function PerformanceSection() {
  const p = MOCK_PERFORMANCE;
  const metrics = [
    { icon: Database, label: "Query Média", value: `${p.avg_query_time_ms}ms`, warn: p.avg_query_time_ms > 500 },
    { icon: Layers, label: "Feature Store Update", value: `${(p.feature_update_time_ms / 1000).toFixed(1)}s`, warn: p.feature_update_time_ms > 5000 },
    { icon: Cpu, label: "Detecção de Padrões", value: `${(p.pattern_detection_time_ms / 1000).toFixed(1)}s`, warn: p.pattern_detection_time_ms > 10000 },
    { icon: BrainCircuit, label: "Geração IA", value: `${(p.ai_generation_time_ms / 1000).toFixed(1)}s`, warn: p.ai_generation_time_ms > 3000 },
    { icon: Activity, label: "Avaliação de Drift", value: `${(p.drift_evaluation_time_ms / 1000).toFixed(1)}s`, warn: p.drift_evaluation_time_ms > 5000 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="border-border/50 bg-card/80 backdrop-blur">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <m.icon className={cn("w-4 h-4", m.warn ? "text-orange-400" : "text-primary")} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className={cn("text-lg font-bold", m.warn ? "text-orange-400" : "text-foreground")}>{m.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground mb-1">Última atualização</p>
          <p className="text-sm font-mono">{format(new Date(p.last_updated), "dd/MM/yyyy HH:mm")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══ PIPELINES ═══
function PipelineSection() {
  const failedCount = MOCK_PIPELINE_JOBS.filter(j => j.status === "failed").length;
  const runningCount = MOCK_PIPELINE_JOBS.filter(j => j.status === "running").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><Workflow className="w-4 h-4 text-primary" /></div>
            <div><p className="text-xs text-muted-foreground">Total Jobs</p><p className="text-lg font-bold">{MOCK_PIPELINE_JOBS.length}</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><RefreshCw className={cn("w-4 h-4", runningCount > 0 ? "text-blue-400" : "text-muted-foreground")} /></div>
            <div><p className="text-xs text-muted-foreground">Executando</p><p className="text-lg font-bold">{runningCount}</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><XCircle className={cn("w-4 h-4", failedCount > 0 ? "text-red-400" : "text-emerald-400")} /></div>
            <div><p className="text-xs text-muted-foreground">Falhas</p><p className={cn("text-lg font-bold", failedCount > 0 && "text-red-400")}>{failedCount}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Orquestração de Pipelines</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Última Execução</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Duração Média</TableHead>
                <TableHead className="text-right">Taxa Sucesso</TableHead>
                <TableHead className="text-right">Falhas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_PIPELINE_JOBS.map(j => {
                const st = JOB_STATUS_CONFIG[j.status];
                return (
                  <TableRow key={j.job_id}>
                    <TableCell className="font-medium text-sm">{j.display_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs capitalize">{j.job_type.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{j.schedule_frequency}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{format(new Date(j.last_run), "dd/MM HH:mm")}</TableCell>
                    <TableCell><Badge variant="outline" className={cn("text-xs", st.bg, st.color)}>{st.label}</Badge></TableCell>
                    <TableCell className="text-right font-mono text-xs">{(j.average_duration_ms / 1000).toFixed(0)}s</TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-mono text-xs font-bold", j.success_rate_pct >= 95 ? "text-emerald-400" : j.success_rate_pct >= 90 ? "text-yellow-400" : "text-red-400")}>
                        {j.success_rate_pct}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{j.failure_count}</TableCell>
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

// ═══ PARTITIONING ═══
function PartitioningSection() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader><CardTitle className="text-base">Estratégia de Particionamento & Clustering</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tabela</TableHead>
              <TableHead>Partição</TableHead>
              <TableHead>Clustering</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Última Otimização</TableHead>
              <TableHead className="text-right">Redução de Custo Est.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_PARTITION_CONFIGS.map(pc => (
              <TableRow key={pc.table_name}>
                <TableCell className="font-mono text-sm font-medium">{pc.table_name}</TableCell>
                <TableCell><Badge variant="outline" className="text-xs">{pc.partition_by}</Badge></TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {pc.cluster_by.map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  {pc.enabled
                    ? <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
                    : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">Inativo</Badge>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{format(new Date(pc.last_optimized), "dd/MM/yyyy")}</TableCell>
                <TableCell className="text-right">
                  <span className="font-mono text-sm font-bold text-emerald-400">-{pc.estimated_cost_reduction_pct}%</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ═══ MATERIALIZED VIEWS ═══
function MaterializedViewsSection() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_MATERIALIZED_VIEWS.map(v => {
          const speedup = Math.round(v.avg_query_time_without_mv_ms / v.avg_query_time_ms);
          return (
            <Card key={v.view_name} className="border-border/50 bg-card/80 backdrop-blur">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs font-medium truncate">{v.display_name}</p>
                <p className="text-2xl font-bold text-primary">{speedup}x</p>
                <p className="text-[10px] text-muted-foreground">mais rápido com MV</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Views Materializadas</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>View</TableHead>
                <TableHead>Tabelas Fonte</TableHead>
                <TableHead>Refresh</TableHead>
                <TableHead>Último Refresh</TableHead>
                <TableHead className="text-right">Query c/ MV</TableHead>
                <TableHead className="text-right">Query s/ MV</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MATERIALIZED_VIEWS.map(v => {
                const st = MV_STATUS_CONFIG[v.status];
                return (
                  <TableRow key={v.view_name}>
                    <TableCell className="font-mono text-xs font-medium">{v.view_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">{v.source_tables.map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}</div>
                    </TableCell>
                    <TableCell className="text-xs">{v.refresh_frequency}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{format(new Date(v.last_refreshed), "dd/MM HH:mm")}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-400">{v.avg_query_time_ms}ms</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{v.avg_query_time_without_mv_ms}ms</TableCell>
                    <TableCell className="text-right font-mono text-xs">{v.row_count.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={cn("text-xs", st.bg, st.color)}>{st.label}</Badge></TableCell>
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

// ═══ FEATURE STORE VERSIONING ═══
function FeatureStoreVersioningSection() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader><CardTitle className="text-base">Versionamento do Feature Store</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {MOCK_FS_VERSIONS.map(v => (
          <div key={v.version_id} className={cn("p-4 rounded-lg border", v.activated_flag ? "border-primary/30 bg-primary/5" : "border-border/30 bg-muted/20")}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GitBranch className={cn("w-4 h-4", v.activated_flag ? "text-primary" : "text-muted-foreground")} />
                <span className="font-mono text-sm font-bold">{v.version_id}</span>
                <Badge variant="outline" className="text-xs">{v.computation_version}</Badge>
                {v.activated_flag && <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativa</Badge>}
              </div>
              <span className="text-xs text-muted-foreground">{format(new Date(v.created_at), "dd/MM/yyyy")}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{v.change_description}</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground">Dependência: <span className="font-mono">{v.model_dependency_reference}</span></span>
            </div>
            {v.fields_added.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {v.fields_added.map(f => <Badge key={f} variant="secondary" className="text-[10px]">+ {f}</Badge>)}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ═══ SECURITY ═══
function SecuritySection() {
  const cfg = MOCK_SECURITY_CONFIG;
  const criticalCount = MOCK_SECURITY_EVENTS.filter(e => e.severity === "critical" || e.severity === "high").length;

  return (
    <div className="space-y-4">
      {/* Security Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Lock className="w-4 h-4 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Criptografia em Repouso</p>
              <p className="text-sm font-bold text-emerald-400">{cfg.encryption_at_rest ? "Ativo" : "Inativo"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Shield className="w-4 h-4 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Criptografia em Trânsito</p>
              <p className="text-sm font-bold text-emerald-400">{cfg.encryption_in_transit ? "Ativo" : "Inativo"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10"><Key className="w-4 h-4 text-emerald-400" /></div>
            <div>
              <p className="text-xs text-muted-foreground">RLS Strict Mode</p>
              <p className="text-sm font-bold text-emerald-400">{cfg.rls_strict_mode ? "Ativo" : "Inativo"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><AlertTriangle className={cn("w-4 h-4", criticalCount > 0 ? "text-orange-400" : "text-emerald-400")} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Eventos Críticos</p>
              <p className={cn("text-lg font-bold", criticalCount > 0 ? "text-orange-400" : "text-emerald-400")}>{criticalCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Roles */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Isolamento de Service Roles</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Uso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cfg.service_roles.map(r => (
                <TableRow key={r.role_name}>
                  <TableCell className="font-mono text-sm font-medium">{r.role_name}</TableCell>
                  <TableCell className="text-sm">{r.scope}</TableCell>
                  <TableCell>
                    {r.active
                      ? <Badge variant="outline" className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
                      : <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">Inativo</Badge>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{format(new Date(r.last_used), "dd/MM HH:mm")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Eventos de Auditoria de Segurança</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidade</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Escopo</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_SECURITY_EVENTS.map(e => {
                const sev = SECURITY_SEVERITY_CONFIG[e.severity];
                return (
                  <TableRow key={e.id}>
                    <TableCell><Badge variant="outline" className="text-[10px] capitalize">{e.event_type.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={cn("text-xs", sev.bg, sev.color)}>{sev.label}</Badge></TableCell>
                    <TableCell className="text-xs max-w-[300px]">{e.description}</TableCell>
                    <TableCell className="text-xs font-mono">{e.tenant_scope || "Plataforma"}</TableCell>
                    <TableCell className="text-xs">{e.triggered_by}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{format(new Date(e.timestamp), "dd/MM HH:mm")}</TableCell>
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

// ═══ COST ═══
function CostSection() {
  const anomalyDays = MOCK_COST_TREND.filter(c => c.anomaly_flag).length;
  const latestCost = MOCK_COST_TREND[MOCK_COST_TREND.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><Gauge className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Índice de Custo Atual</p>
              <p className={cn("text-lg font-bold", latestCost.estimated_compute_cost_index > 60 ? "text-orange-400" : "text-emerald-400")}>{latestCost.estimated_compute_cost_index}/100</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><Database className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Volume de Queries</p>
              <p className="text-lg font-bold">{latestCost.query_volume.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><HardDrive className="w-4 h-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Cresc. Armazenamento</p>
              <p className="text-lg font-bold">{latestCost.storage_growth_rate_mb} MB/dia</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted/50"><AlertTriangle className={cn("w-4 h-4", anomalyDays > 0 ? "text-orange-400" : "text-emerald-400")} /></div>
            <div>
              <p className="text-xs text-muted-foreground">Dias c/ Anomalia</p>
              <p className={cn("text-lg font-bold", anomalyDays > 0 && "text-orange-400")}>{anomalyDays}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Índice de Custo (7d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_COST_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                <RTooltip />
                <Area type="monotone" dataKey="estimated_compute_cost_index" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} name="Índice de Custo" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Volume de Queries (7d)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={MOCK_COST_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
                <RTooltip />
                <Bar dataKey="query_volume" fill={CHART_COLORS.chart2} radius={[4, 4, 0, 0]} name="Queries" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ═══ SCALABILITY & ML ═══
function ScalabilitySection() {
  const s = MOCK_SCALABILITY;

  return (
    <div className="space-y-4">
      {/* Scalability */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Stress Test & Escalabilidade</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Tenants Simulados</p>
              <p className="text-xl font-bold">{s.simulated_tenant_count}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Volume Simulado</p>
              <p className="text-xl font-bold">{(s.simulated_data_volume / 1e6).toFixed(1)}M</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Score de Performance</p>
              <p className={cn("text-xl font-bold", s.performance_score >= 80 ? "text-emerald-400" : s.performance_score >= 60 ? "text-yellow-400" : "text-red-400")}>{s.performance_score}/100</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground">Degradação</p>
              <p className={cn("text-xl font-bold", s.degradation_flag ? "text-red-400" : "text-emerald-400")}>{s.degradation_flag ? "Sim" : "Não"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={s.performance_score} className="h-3 flex-1" />
            <span className="text-xs text-muted-foreground">Último teste: {format(new Date(s.last_tested_at), "dd/MM/yyyy")}</span>
          </div>
          {s.bottleneck_area && (
            <div className="mt-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <p className="text-sm text-orange-400"><AlertTriangle className="w-4 h-4 inline mr-1" />Gargalo: {s.bottleneck_area}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Snapshots */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">ML Training Dataset Snapshots</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Snapshot ID</TableHead>
                <TableHead>Feature Version</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ML_SNAPSHOTS.map(snap => {
                const st = ML_SNAPSHOT_STATUS_CONFIG[snap.status];
                return (
                  <TableRow key={snap.snapshot_id}>
                    <TableCell className="font-mono text-sm font-medium">{snap.snapshot_id}</TableCell>
                    <TableCell className="font-mono text-xs">{snap.feature_version}</TableCell>
                    <TableCell className="text-xs">{snap.date_range_start} → {snap.date_range_end}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{snap.record_count.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="outline" className={cn("text-xs", st.bg, st.color)}>{st.label}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(snap.created_at), "dd/MM/yyyy")}</TableCell>
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
