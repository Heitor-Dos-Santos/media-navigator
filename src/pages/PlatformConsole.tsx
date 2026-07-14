import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DataMonitoringTab } from "@/components/platform/DataMonitoringTab";
import { PlatformHealthTab } from "@/components/platform/PlatformHealthTab";
import { StressSimulationTab } from "@/components/platform/StressSimulationTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Shield, Users, Activity, Settings, Flag, Eye, Brain, FileText,
  AlertTriangle, CheckCircle, XCircle, TrendingUp, Server, Database,
  BarChart3, Zap, HardDrive, FlaskConical,
} from "lucide-react";
import {
  MOCK_AGENCIES, MOCK_USAGE, MOCK_THRESHOLDS, MOCK_PATTERNS, MOCK_DRIFT,
  MOCK_FEATURE_FLAGS, MOCK_GLOBAL_METRICS, MOCK_AI_PERFORMANCE, MOCK_AUDIT_LOGS,
} from "@/data/platformGovernanceData";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const riskColor = (level: string) => {
  switch (level) {
    case "low": case "stable": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "moderate": case "minor": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const planColor = (plan: string) => {
  switch (plan) {
    case "enterprise": return "bg-primary/20 text-primary border-primary/30";
    case "pro": return "bg-violet-500/20 text-violet-400 border-violet-500/30";
    case "growth": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "starter": return "bg-muted text-muted-foreground";
    default: return "bg-muted text-muted-foreground";
  }
};

const actionColor = (type: string) => {
  switch (type) {
    case "threshold_change": return "bg-blue-500/20 text-blue-400";
    case "feature_toggle": return "bg-violet-500/20 text-violet-400";
    case "tenant_suspension": return "bg-red-500/20 text-red-400";
    case "pattern_deactivation": return "bg-orange-500/20 text-orange-400";
    case "ai_parameter_change": return "bg-cyan-500/20 text-cyan-400";
    case "plan_change": return "bg-emerald-500/20 text-emerald-400";
    default: return "bg-muted text-muted-foreground";
  }
};

export default function PlatformConsole() {
  const [thresholds, setThresholds] = useState(MOCK_THRESHOLDS);
  const [featureFlags, setFeatureFlags] = useState(MOCK_FEATURE_FLAGS);

  const saturationPieData = Object.entries(MOCK_GLOBAL_METRICS.saturation_risk_distribution).map(([name, value]) => ({ name, value }));
  const funnelLiftData = Object.entries(MOCK_GLOBAL_METRICS.funnel_lift_distribution).map(([name, value]) => ({ name, value }));
  const insightBarData = MOCK_AI_PERFORMANCE.most_common_insight_types;
  const totalApiCalls = MOCK_USAGE.reduce((s, u) => s + u.api_calls, 0);
  const totalAiExec = MOCK_USAGE.reduce((s, u) => s + u.ai_executions, 0);
  const activeAgencies = MOCK_AGENCIES.filter(t => t.active).length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10">
            <Shield className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Console da Plataforma</h1><PageInfoTooltip description="Painel de Super Admin para governança, monitoramento de agências, feature flags e saúde da plataforma." /></div>
            <p className="text-sm text-muted-foreground">Super Admin — Governança & Monitoramento</p>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard icon={Users} label="Agências Ativas" value={activeAgencies} sub={`de ${MOCK_AGENCIES.length} total`} />
          <KPICard icon={Server} label="Chamadas de API" value={totalApiCalls.toLocaleString()} sub="neste período" />
          <KPICard icon={Brain} label="Execuções de IA" value={totalAiExec.toLocaleString()} sub="entre agências" />
          <KPICard icon={Activity} label="Saúde da Plataforma" value="92%" sub="score médio do modelo" color="text-emerald-400" />
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="tenants" className="space-y-4">
          <TabsList className="bg-muted/50 flex-wrap h-auto p-1 gap-1">
            <TabsTrigger value="tenants" className="text-xs"><Users className="w-3.5 h-3.5 mr-1.5" />Agências</TabsTrigger>
            <TabsTrigger value="usage" className="text-xs"><BarChart3 className="w-3.5 h-3.5 mr-1.5" />Uso</TabsTrigger>
            <TabsTrigger value="governance" className="text-xs"><Settings className="w-3.5 h-3.5 mr-1.5" />Governança de Modelo</TabsTrigger>
            <TabsTrigger value="flags" className="text-xs"><Flag className="w-3.5 h-3.5 mr-1.5" />Feature Flags</TabsTrigger>
            <TabsTrigger value="intelligence" className="text-xs"><Eye className="w-3.5 h-3.5 mr-1.5" />Intel. Global</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs"><Brain className="w-3.5 h-3.5 mr-1.5" />Performance IA</TabsTrigger>
            <TabsTrigger value="audit" className="text-xs"><FileText className="w-3.5 h-3.5 mr-1.5" />Logs de Auditoria</TabsTrigger>
            <TabsTrigger value="data-monitoring" className="text-xs"><HardDrive className="w-3.5 h-3.5 mr-1.5" />Data Monitoring</TabsTrigger>
            <TabsTrigger value="platform-health" className="text-xs"><Zap className="w-3.5 h-3.5 mr-1.5" />Platform Health</TabsTrigger>
            <TabsTrigger value="stress-simulation" className="text-xs"><FlaskConical className="w-3.5 h-3.5 mr-1.5" />Stress Simulation</TabsTrigger>
          </TabsList>

          {/* ───────── TENANTS ───────── */}
          <TabsContent value="tenants">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Gestão de Agências</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agência</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead className="text-right">Usuários</TableHead>
                      <TableHead>IA</TableHead>
                      <TableHead>Padrões</TableHead>
                      <TableHead className="text-right">Uso de API</TableHead>
                      <TableHead>Última Atividade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_AGENCIES.map(t => (
                      <TableRow key={t.agency_id}>
                        <TableCell className="font-medium">{t.name}</TableCell>
                        <TableCell><Badge variant="outline" className={planColor(t.plan)}>{t.plan}</Badge></TableCell>
                        <TableCell>
                          {t.active
                          ? <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
                          : <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">Suspenso</Badge>}
                        </TableCell>
                        <TableCell className="text-right">{t.total_clients}</TableCell>
                        <TableCell className="text-right">{t.total_users}</TableCell>
                        <TableCell>{t.ai_enabled ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}</TableCell>
                        <TableCell>{t.pattern_engine_enabled ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{t.api_usage.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(t.last_activity).toLocaleDateString("pt-BR")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────── USAGE ───────── */}
          <TabsContent value="usage">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Monitoramento de Uso</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agência</TableHead>
                      <TableHead className="text-right">Chamadas API</TableHead>
                      <TableHead className="text-right">Exec. IA</TableHead>
                      <TableHead className="text-right">Forecasts</TableHead>
                      <TableHead className="text-right">Recomendações</TableHead>
                      <TableHead className="text-right">Armazenamento (MB)</TableHead>
                      <TableHead>Carga</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_USAGE.map(u => {
                      const loadPct = Math.min((u.api_calls / 100000) * 100, 100);
                      return (
                        <TableRow key={u.agency_id}>
                          <TableCell className="font-medium">{u.agency_name}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{u.api_calls.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{u.ai_executions.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{u.forecast_runs}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{u.recommendation_runs}</TableCell>
                          <TableCell className="text-right font-mono text-xs">{u.storage_usage_mb}</TableCell>
                          <TableCell className="w-32"><Progress value={loadPct} className="h-2" /></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────── MODEL GOVERNANCE ───────── */}
          <TabsContent value="governance" className="space-y-6">
            {/* Threshold Management */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Gestão de Limiares</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {thresholds.map(th => (
                  <div key={th.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{th.name}</p>
                        <p className="text-xs text-muted-foreground">{th.description}</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{th.current_value}{th.unit}</span>
                    </div>
                    <Slider
                      value={[th.current_value]}
                      min={th.min}
                      max={th.max}
                      step={th.step}
                      onValueChange={([v]) => setThresholds(prev => prev.map(t => t.id === th.id ? { ...t, current_value: v } : t))}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{th.min}{th.unit}</span>
                      <span>Default: {th.default_value}{th.unit}</span>
                      <span>{th.max}{th.unit}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pattern Oversight */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Supervisão de Padrões</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Padrão</TableHead>
                      <TableHead>Confiança</TableHead>
                      <TableHead>Escopo</TableHead>
                      <TableHead className="text-right">Pontos de Dados</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Drift</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_PATTERNS.map(p => (
                      <TableRow key={p.pattern_id}>
                        <TableCell className="font-medium">{p.pattern_type}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={p.confidence_score * 100} className="h-2 w-16" />
                            <span className="text-xs font-mono">{(p.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {p.agency_scope === "global" ? "Global" : p.agency_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">{p.data_points}</TableCell>
                        <TableCell>
                          {p.active
                            ? <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Ativo</Badge>
                            : <Badge variant="outline" className="bg-muted text-muted-foreground">Inativo</Badge>}
                        </TableCell>
                        <TableCell><Badge variant="outline" className={riskColor(p.drift_indicator)}>{p.drift_indicator}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Drift Monitoring */}
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Monitoramento de Drift do Modelo</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MOCK_DRIFT.map(d => (
                    <Card key={d.model_type} className="border-border/30 bg-muted/30">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{d.model_type}</p>
                          <Badge variant="outline" className={riskColor(d.risk_level)}>{d.risk_level}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Health</span>
                          <Progress value={d.health_score} className="h-2 flex-1" />
                          <span className="font-mono text-xs font-bold">{d.health_score}%</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-muted-foreground">Drift:</span> <span className="font-mono">{d.drift_score.toFixed(2)}</span></div>
                          <div><span className="text-muted-foreground">Anomaly:</span> <span className="font-mono">{(d.anomaly_rate * 100).toFixed(1)}%</span></div>
                          <div><span className="text-muted-foreground">FP Rate:</span> <span className="font-mono">{(d.false_positive_rate * 100).toFixed(1)}%</span></div>
                          <div><span className="text-muted-foreground">Decay:</span> <span className="font-mono">{(d.confidence_decay * 100).toFixed(1)}%</span></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────── FEATURE FLAGS ───────── */}
          <TabsContent value="flags">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Motor de Feature Flags</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Funcionalidade</TableHead>
                      <TableHead>Global</TableHead>
                      <TableHead>Planos</TableHead>
                      <TableHead>Agências Específicas</TableHead>
                      <TableHead>Beta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {featureFlags.map(ff => (
                      <TableRow key={ff.feature_name}>
                        <TableCell className="font-medium">{ff.display_name}</TableCell>
                        <TableCell>
                          <Switch
                            checked={ff.enabled_globally}
                            onCheckedChange={(checked) =>
                              setFeatureFlags(prev => prev.map(f => f.feature_name === ff.feature_name ? { ...f, enabled_globally: checked } : f))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {ff.enabled_for_plan.length > 0
                              ? ff.enabled_for_plan.map(p => <Badge key={p} variant="outline" className={`text-xs ${planColor(p)}`}>{p}</Badge>)
                              : <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {ff.enabled_for_specific_agencies.length > 0
                            ? ff.enabled_for_specific_agencies.map(aid => {
                                const a = MOCK_AGENCIES.find(x => x.agency_id === aid);
                                return <Badge key={aid} variant="outline" className="text-xs mr-1">{a?.name || aid}</Badge>;
                              })
                            : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          {ff.beta_flag
                            ? <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Beta</Badge>
                            : <span className="text-xs text-muted-foreground">Estável</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────── GLOBAL INTELLIGENCE ───────── */}
          <TabsContent value="intelligence" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard icon={TrendingUp} label="MBEI Médio" value={MOCK_GLOBAL_METRICS.avg_mbei.toFixed(1)} sub="global anonimizado" />
              <KPICard icon={Zap} label="Elasticidade Média" value={MOCK_GLOBAL_METRICS.avg_elasticity.toFixed(2)} sub="entre tenants" />
              <KPICard icon={Database} label="Margem Média" value={`${MOCK_GLOBAL_METRICS.avg_margin_pct}%`} sub="anonimizado" />
              <KPICard icon={AlertTriangle} label="Densidade de Alertas" value={MOCK_GLOBAL_METRICS.alert_density_avg.toFixed(1)} sub="média por cliente" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader><CardTitle className="text-sm">Distribuição de Risco de Saturação</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={saturationPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {saturationPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-border/50 bg-card/80 backdrop-blur">
                <CardHeader><CardTitle className="text-sm">Distribuição de Lift de Funil</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={funnelLiftData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ───────── AI PERFORMANCE ───────── */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KPICard icon={Brain} label="Insights Gerados" value={MOCK_AI_PERFORMANCE.total_insights_generated.toLocaleString()} sub="total" />
              <KPICard icon={CheckCircle} label="Confiança Média" value={`${(MOCK_AI_PERFORMANCE.avg_confidence_score * 100).toFixed(0)}%`} sub="qualidade do insight" />
              <KPICard icon={AlertTriangle} label="Precisão de Anomalia" value={`${MOCK_AI_PERFORMANCE.anomaly_detection_accuracy}%`} sub="taxa de detecção" />
              <KPICard icon={TrendingUp} label="Precisão de Forecast" value={`${MOCK_AI_PERFORMANCE.forecast_accuracy_pct}%`} sub="qualidade preditiva" />
            </div>
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-sm">Tipos de Insights Mais Comuns</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={insightBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="type" type="category" width={140} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────── AUDIT LOGS ───────── */}
          <TabsContent value="audit">
            <Card className="border-border/50 bg-card/80 backdrop-blur">
              <CardHeader><CardTitle className="text-lg">Log de Auditoria da Plataforma</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Entidade</TableHead>
                      <TableHead>Valor Anterior</TableHead>
                      <TableHead>Novo Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_AUDIT_LOGS.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="text-sm">{log.user_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs ${actionColor(log.action_type)}`}>
                            {log.action_type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{log.entity_affected}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{log.old_value}</TableCell>
                        <TableCell className="text-xs font-mono">{log.new_value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ───────── DATA MONITORING ───────── */}
          <TabsContent value="data-monitoring">
            <DataMonitoringTab />
          </TabsContent>

          {/* ───────── PLATFORM HEALTH ───────── */}
          <TabsContent value="platform-health">
            <PlatformHealthTab />
          </TabsContent>

          {/* ───────── STRESS SIMULATION ───────── */}
          <TabsContent value="stress-simulation">
            <StressSimulationTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

function KPICard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub: string; color?: string }) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted/50">
            <Icon className={`w-4 h-4 ${color || "text-primary"}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
