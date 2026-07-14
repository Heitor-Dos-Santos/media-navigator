import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FlaskConical, Play, Square, Users, BarChart3, Cpu, Shield,
  AlertTriangle, CheckCircle2, XCircle, TrendingUp, Zap, Clock,
  Download, Activity, Server, BrainCircuit, Layers, Gauge, FileText,
  Wifi, FileWarning, TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MOCK_SIMULATION_RUNS, MOCK_STRESS_PERFORMANCE, MOCK_ISOLATION_TEST,
  MOCK_FAILURE_RESULTS, MOCK_COST_STRESS, MOCK_READINESS, DEFAULT_SIM_CONFIG,
} from "@/data/stressSimulationData";
import {
  SIMULATION_STATUS_CONFIG, READINESS_CONFIG,
} from "@/types/stressSimulation";
import jsPDF from "jspdf";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

const FAILURE_ICONS: Record<string, React.ElementType> = {
  dsp_api_failure: Wifi,
  schema_change: FileWarning,
  volume_collapse: TrendingDown,
  ingestion_spike: Zap,
  feature_store_delay: Clock,
};

export function StressSimulationTab() {
  const [simConfig, setSimConfig] = useState(DEFAULT_SIM_CONFIG);
  const [isRunning, setIsRunning] = useState(false);

  const updateConfig = (key: keyof typeof simConfig, value: number) => {
    setSimConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const r = MOCK_READINESS;
    const p = MOCK_STRESS_PERFORMANCE;
    const iso = MOCK_ISOLATION_TEST;
    const cost = MOCK_COST_STRESS;

    doc.setFontSize(18);
    doc.text("Stress Test Summary Report", 20, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 20, 28);

    doc.setFontSize(13);
    doc.text("Parâmetros da Simulação", 20, 42);
    doc.setFontSize(10);
    const lastRun = MOCK_SIMULATION_RUNS[0];
    doc.text(`Agências: ${lastRun.simulated_agency_count} | Campanhas/Agência: ${lastRun.simulated_campaign_volume}`, 20, 50);
    doc.text(`Registros diários: ${lastRun.simulated_daily_records.toLocaleString()} | Requests IA: ${lastRun.simulated_ai_requests}`, 20, 57);
    doc.text(`Ciclos de padrão: ${lastRun.simulated_pattern_cycles} | Duração: ${lastRun.duration_minutes}min`, 20, 64);

    doc.setFontSize(13);
    doc.text("Resultados de Performance", 20, 78);
    doc.setFontSize(10);
    doc.text(`Query Latency: ${p.avg_query_latency_ms}ms | Feature Store: ${p.feature_update_latency_ms}ms`, 20, 86);
    doc.text(`Ingestão: ${p.ingestion_latency_ms}ms | IA: ${p.ai_generation_latency_ms}ms | Padrões: ${p.pattern_detection_latency_ms}ms`, 20, 93);
    doc.text(`Taxa de Erro: ${p.error_rate_pct}% | Crescimento Storage: ${p.storage_growth_rate_mb} MB`, 20, 100);

    doc.setFontSize(13);
    doc.text("Isolamento de Agências", 20, 114);
    doc.setFontSize(10);
    doc.text(`Queries concorrentes: ${iso.concurrent_agency_queries} | Violações: ${iso.cross_agency_violations}`, 20, 122);
    doc.text(`RLS validado: ${iso.rls_validation_passed ? "Sim" : "Não"} | Score: ${iso.isolation_score}/100`, 20, 129);

    doc.setFontSize(13);
    doc.text("Resiliência a Falhas", 20, 143);
    doc.setFontSize(10);
    MOCK_FAILURE_RESULTS.forEach((f, i) => {
      doc.text(`${f.label}: Score ${f.resilience_score}/100 | Recovery ${f.recovery_time_ms}ms`, 20, 151 + i * 7);
    });

    doc.setFontSize(13);
    doc.text("Stress de Custos", 20, 193);
    doc.setFontSize(10);
    doc.text(`Baseline: ${cost.baseline_cost_index}/100 → Stress: ${cost.stress_cost_index}/100 (+${cost.cost_increase_pct}%)`, 20, 201);
    doc.text(`Spike detectado: ${cost.resource_spike_detected ? "Sim" : "Não"} | Dashboard OK: ${cost.heavy_dashboard_load_ok ? "Sim" : "Não"}`, 20, 208);

    doc.setFontSize(13);
    doc.text("Enterprise Readiness Score", 20, 222);
    doc.setFontSize(10);
    doc.text(`Score Geral: ${r.overall}/100 — ${r.classification}`, 20, 230);
    doc.text(`Latência: ${r.latency_stability} | Erros: ${r.error_rate_score} | Isolamento: ${r.isolation_stability}`, 20, 237);
    doc.text(`Drift: ${r.drift_stability} | Custo: ${r.cost_stability} | Recovery: ${r.pipeline_recovery_score}`, 20, 244);

    doc.setFontSize(13);
    doc.text("Recomendações", 20, 258);
    doc.setFontSize(10);
    if (r.cost_stability < 80) doc.text("• Otimizar queries pesadas e materializar views adicionais", 20, 266);
    if (r.latency_stability < 85) doc.text("• Revisar particionamento e clustering em tabelas de alto volume", 20, 273);
    if (r.pipeline_recovery_score < 90) doc.text("• Implementar circuit breakers em pipelines de ingestão", 20, 280);

    doc.save("stress-test-report.pdf");
  };

  const readinessRadarData = [
    { subject: "Latência", value: MOCK_READINESS.latency_stability },
    { subject: "Erros", value: MOCK_READINESS.error_rate_score },
    { subject: "Isolamento", value: MOCK_READINESS.isolation_stability },
    { subject: "Drift", value: MOCK_READINESS.drift_stability },
    { subject: "Custo", value: MOCK_READINESS.cost_stability },
    { subject: "Recovery", value: MOCK_READINESS.pipeline_recovery_score },
  ];

  const failureBarData = MOCK_FAILURE_RESULTS.map(f => ({
    name: f.label,
    resilience: f.resilience_score,
    recovery: Math.round(f.recovery_time_ms / 1000),
  }));

  const rc = READINESS_CONFIG[MOCK_READINESS.classification];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <FlaskConical className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Stress Simulation Center</h2>
            <p className="text-xs text-muted-foreground">Simulação isolada de carga enterprise — sem impacto em produção</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> Exportar PDF
        </Button>
      </div>

      <Tabs defaultValue="control" className="space-y-4">
        <TabsList className="bg-muted/50 flex-wrap h-auto p-1 gap-1">
          <TabsTrigger value="control" className="text-xs gap-1.5"><Play className="w-3.5 h-3.5" />Controle</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs gap-1.5"><Activity className="w-3.5 h-3.5" />Performance</TabsTrigger>
          <TabsTrigger value="isolation" className="text-xs gap-1.5"><Shield className="w-3.5 h-3.5" />Isolamento</TabsTrigger>
          <TabsTrigger value="failures" className="text-xs gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />Falhas</TabsTrigger>
          <TabsTrigger value="cost" className="text-xs gap-1.5"><Gauge className="w-3.5 h-3.5" />Custo</TabsTrigger>
          <TabsTrigger value="readiness" className="text-xs gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Readiness</TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5"><FileText className="w-3.5 h-3.5" />Histórico</TabsTrigger>
        </TabsList>

        {/* ═══ CONTROL PANEL ═══ */}
        <TabsContent value="control">
          <Card className="border-border/50 bg-card/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base">Painel de Controle da Simulação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SliderControl label="Agências Simuladas" value={simConfig.agencyCount} min={10} max={500} step={10} unit="" onChange={v => updateConfig("agencyCount", v)} />
                <SliderControl label="Campanhas por Agência" value={simConfig.campaignVolume} min={50} max={2000} step={50} unit="" onChange={v => updateConfig("campaignVolume", v)} />
                <SliderControl label="Registros Diários por Agência" value={simConfig.dailyRecords} min={100000} max={10000000} step={100000} unit="" format={v => `${(v / 1e6).toFixed(1)}M`} onChange={v => updateConfig("dailyRecords", v)} />
                <SliderControl label="Requests IA Concorrentes" value={simConfig.aiRequests} min={100} max={20000} step={100} unit="" onChange={v => updateConfig("aiRequests", v)} />
                <SliderControl label="Ciclos de Detecção de Padrões" value={simConfig.patternCycles} min={10} max={1000} step={10} unit="" onChange={v => updateConfig("patternCycles", v)} />
                <SliderControl label="Duração da Simulação (min)" value={simConfig.durationMinutes} min={5} max={120} step={5} unit="min" onChange={v => updateConfig("durationMinutes", v)} />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                <Button
                  className={cn("gap-2", isRunning ? "bg-red-500 hover:bg-red-600" : "")}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? <><Square className="w-4 h-4" /> Parar Simulação</> : <><Play className="w-4 h-4" /> Iniciar Simulação</>}
                </Button>
                {isRunning && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                    Simulação em execução...
                  </div>
                )}
              </div>

              {/* Summary of config */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 p-4 rounded-lg bg-muted/30 border border-border/30">
                <ConfigStat label="Agências" value={simConfig.agencyCount} />
                <ConfigStat label="Campanhas/Ag." value={simConfig.campaignVolume} />
                <ConfigStat label="Registros/dia" value={`${(simConfig.dailyRecords / 1e6).toFixed(1)}M`} />
                <ConfigStat label="Req. IA" value={simConfig.aiRequests} />
                <ConfigStat label="Ciclos Padrão" value={simConfig.patternCycles} />
                <ConfigStat label="Duração" value={`${simConfig.durationMinutes}min`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ PERFORMANCE ═══ */}
        <TabsContent value="performance">
          <PerformancePanel />
        </TabsContent>

        {/* ═══ ISOLATION ═══ */}
        <TabsContent value="isolation">
          <IsolationPanel />
        </TabsContent>

        {/* ═══ FAILURES ═══ */}
        <TabsContent value="failures">
          <FailurePanel data={failureBarData} />
        </TabsContent>

        {/* ═══ COST ═══ */}
        <TabsContent value="cost">
          <CostStressPanel />
        </TabsContent>

        {/* ═══ READINESS ═══ */}
        <TabsContent value="readiness">
          <ReadinessPanel radarData={readinessRadarData} rc={rc} />
        </TabsContent>

        {/* ═══ HISTORY ═══ */}
        <TabsContent value="history">
          <HistoryPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Sub-components ──

function SliderControl({ label, value, min, max, step, unit, format: fmt, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string;
  format?: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <span className="font-mono text-sm font-bold text-primary">
          {fmt ? fmt(value) : value.toLocaleString()}{unit && ` ${unit}`}
        </span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{fmt ? fmt(min) : min.toLocaleString()}</span>
        <span>{fmt ? fmt(max) : max.toLocaleString()}</span>
      </div>
    </div>
  );
}

function ConfigStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold font-mono">{value}</p>
    </div>
  );
}

function PerformancePanel() {
  const p = MOCK_STRESS_PERFORMANCE;
  const metrics = [
    { icon: Cpu, label: "Query Latency", value: `${p.avg_query_latency_ms}ms`, warn: p.avg_query_latency_ms > 500 },
    { icon: Layers, label: "Feature Store", value: `${(p.feature_update_latency_ms / 1000).toFixed(1)}s`, warn: p.feature_update_latency_ms > 5000 },
    { icon: Server, label: "Ingestão", value: `${(p.ingestion_latency_ms / 1000).toFixed(1)}s`, warn: p.ingestion_latency_ms > 2000 },
    { icon: BrainCircuit, label: "Geração IA", value: `${(p.ai_generation_latency_ms / 1000).toFixed(1)}s`, warn: p.ai_generation_latency_ms > 3000 },
    { icon: Activity, label: "Detecção Padrões", value: `${(p.pattern_detection_latency_ms / 1000).toFixed(1)}s`, warn: p.pattern_detection_latency_ms > 10000 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Taxa de Erro</p>
            <p className={cn("text-lg font-bold", p.error_rate_pct > 2 ? "text-red-400" : p.error_rate_pct > 1 ? "text-yellow-400" : "text-emerald-400")}>{p.error_rate_pct}%</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Drift Aumentou</p>
            <p className={cn("text-lg font-bold", p.drift_increase_flag ? "text-red-400" : "text-emerald-400")}>{p.drift_increase_flag ? "Sim" : "Não"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Spike de Custo</p>
            <p className={cn("text-lg font-bold", p.cost_spike_flag ? "text-orange-400" : "text-emerald-400")}>{p.cost_spike_flag ? "Sim" : "Não"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Cresc. Storage</p>
            <p className="text-lg font-bold">{p.storage_growth_rate_mb} MB</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function IsolationPanel() {
  const iso = MOCK_ISOLATION_TEST;
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader><CardTitle className="text-base">Teste de Isolamento de Agências</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Queries Concorrentes</p>
            <p className="text-2xl font-bold">{iso.concurrent_agency_queries}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Violações Cross-Agency</p>
            <p className={cn("text-2xl font-bold", iso.cross_agency_violations > 0 ? "text-red-400" : "text-emerald-400")}>{iso.cross_agency_violations}</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">RLS Validado</p>
            <div className="flex justify-center mt-1">
              {iso.rls_validation_passed
                ? <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                : <XCircle className="w-8 h-8 text-red-400" />}
            </div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Score de Isolamento</p>
            <p className={cn("text-2xl font-bold", iso.isolation_score >= 95 ? "text-emerald-400" : iso.isolation_score >= 80 ? "text-yellow-400" : "text-red-400")}>{iso.isolation_score}/100</p>
          </div>
        </div>
        <Progress value={iso.isolation_score} className="h-3" />
        {iso.cross_agency_violations > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Isolation Breach Alert — {iso.cross_agency_violations} violação(ões) detectada(s)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FailurePanel({ data }: { data: { name: string; resilience: number; recovery: number }[] }) {
  return (
    <div className="space-y-4">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-base">Simulação de Falhas & Resiliência</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_FAILURE_RESULTS.map(f => {
              const Icon = FAILURE_ICONS[f.scenario] || AlertTriangle;
              return (
                <div key={f.scenario} className="p-4 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{f.label}</span>
                      {f.detected
                        ? <Badge variant="outline" className="text-[10px] bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Detectado</Badge>
                        : <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">Não Detectado</Badge>}
                    </div>
                    <span className={cn("font-mono text-sm font-bold",
                      f.resilience_score >= 90 ? "text-emerald-400" :
                      f.resilience_score >= 75 ? "text-yellow-400" : "text-orange-400"
                    )}>{f.resilience_score}/100</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{f.description}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">Recovery: <span className="font-mono font-bold text-foreground">{(f.recovery_time_ms / 1000).toFixed(1)}s</span></span>
                    <Progress value={f.resilience_score} className="h-1.5 flex-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="text-sm">Resiliência por Cenário</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke={CHART_COLORS.muted} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} stroke={CHART_COLORS.muted} />
              <RTooltip />
              <Bar dataKey="resilience" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="Resiliência" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function CostStressPanel() {
  const c = MOCK_COST_STRESS;
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader><CardTitle className="text-base">Stress Test de Custos</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Índice Baseline</p>
            <p className="text-2xl font-bold text-emerald-400">{c.baseline_cost_index}/100</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Índice Sob Stress</p>
            <p className={cn("text-2xl font-bold", c.stress_cost_index > 60 ? "text-orange-400" : "text-yellow-400")}>{c.stress_cost_index}/100</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Aumento de Custo</p>
            <p className={cn("text-2xl font-bold", c.cost_increase_pct > 100 ? "text-red-400" : "text-orange-400")}>+{c.cost_increase_pct}%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="border-border/30 bg-muted/20">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className={cn("w-5 h-5", c.resource_spike_detected ? "text-orange-400" : "text-emerald-400")} />
              <div>
                <p className="text-xs text-muted-foreground">Spike de Recurso</p>
                <p className={cn("text-sm font-bold", c.resource_spike_detected ? "text-orange-400" : "text-emerald-400")}>{c.resource_spike_detected ? "Detectado" : "Não"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/30 bg-muted/20">
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className={cn("w-5 h-5", c.heavy_dashboard_load_ok ? "text-emerald-400" : "text-red-400")} />
              <div>
                <p className="text-xs text-muted-foreground">Dashboard Pesado</p>
                <p className={cn("text-sm font-bold", c.heavy_dashboard_load_ok ? "text-emerald-400" : "text-red-400")}>{c.heavy_dashboard_load_ok ? "OK" : "Degradado"}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/30 bg-muted/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Layers className={cn("w-5 h-5", c.feature_recalculation_ok ? "text-emerald-400" : "text-red-400")} />
              <div>
                <p className="text-xs text-muted-foreground">Recálculo Features</p>
                <p className={cn("text-sm font-bold", c.feature_recalculation_ok ? "text-emerald-400" : "text-red-400")}>{c.feature_recalculation_ok ? "OK" : "Degradado"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function ReadinessPanel({ radarData, rc }: { radarData: { subject: string; value: number }[]; rc: { color: string; bg: string } }) {
  const r = MOCK_READINESS;
  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Enterprise Readiness Score</p>
              <p className={cn("text-4xl font-bold mt-1", rc.color)}>{r.overall}/100</p>
            </div>
            <Badge variant="outline" className={cn("text-sm px-3 py-1", rc.bg, rc.color)}>{r.classification}</Badge>
          </div>
          <Progress value={r.overall} className="h-3" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Breakdown por Dimensão</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Score" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Details */}
        <Card className="border-border/50 bg-card/80 backdrop-blur">
          <CardHeader><CardTitle className="text-sm">Detalhamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Estabilidade de Latência", value: r.latency_stability },
              { label: "Taxa de Erro", value: r.error_rate_score },
              { label: "Estabilidade de Isolamento", value: r.isolation_stability },
              { label: "Estabilidade de Drift", value: r.drift_stability },
              { label: "Estabilidade de Custo", value: r.cost_stability },
              { label: "Recovery de Pipeline", value: r.pipeline_recovery_score },
            ].map(d => (
              <div key={d.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm">{d.label}</p>
                  <span className={cn("font-mono text-sm font-bold",
                    d.value >= 90 ? "text-emerald-400" : d.value >= 75 ? "text-yellow-400" : "text-orange-400"
                  )}>{d.value}</span>
                </div>
                <Progress value={d.value} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HistoryPanel() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur">
      <CardHeader><CardTitle className="text-base">Histórico de Simulações</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Agências</TableHead>
              <TableHead>Campanhas</TableHead>
              <TableHead>Registros/dia</TableHead>
              <TableHead>Req. IA</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Classificação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_SIMULATION_RUNS.map(run => {
              const st = SIMULATION_STATUS_CONFIG[run.status];
              const rc = READINESS_CONFIG[run.readiness_classification];
              return (
                <TableRow key={run.simulation_id}>
                  <TableCell className="font-mono text-xs font-medium">{run.simulation_id}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{run.simulated_agency_count}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{run.simulated_campaign_volume}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{(run.simulated_daily_records / 1e6).toFixed(1)}M</TableCell>
                  <TableCell className="text-right font-mono text-xs">{run.simulated_ai_requests.toLocaleString()}</TableCell>
                  <TableCell className="text-xs">{run.duration_minutes}min</TableCell>
                  <TableCell>
                    <span className={cn("font-mono text-sm font-bold",
                      run.overall_performance_score >= 80 ? "text-emerald-400" :
                      run.overall_performance_score >= 60 ? "text-yellow-400" : "text-orange-400"
                    )}>{run.overall_performance_score}</span>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={cn("text-[10px]", rc.bg, rc.color)}>{run.readiness_classification}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className={cn("text-xs", st.bg, st.color)}>{st.label}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{format(new Date(run.start_time), "dd/MM/yyyy HH:mm")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
