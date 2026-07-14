import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Network, Shield, AlertTriangle, CheckCircle, Database, ArrowRight,
  Layers, Brain, Activity, TrendingUp, DollarSign, Zap,
} from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";
import { cn } from "@/lib/utils";
import {
  SIGNAL_REGISTRY,
  ARCHITECTURE_RULES,
  REDUNDANCY_AUDIT,
  getSignalsByDomain,
  getSignalProviders,
  type SignalDomain,
} from "@/lib/unifiedIntelligenceCore";

const domainMeta: Record<SignalDomain, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  behavioral: { label: "Comportamental", color: "text-purple-400", bg: "bg-purple-500/10", icon: <Brain className="w-4 h-4" /> },
  financial: { label: "Financeiro", color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <DollarSign className="w-4 h-4" /> },
  efficiency: { label: "Eficiência", color: "text-blue-400", bg: "bg-blue-500/10", icon: <TrendingUp className="w-4 h-4" /> },
  risk: { label: "Risco", color: "text-red-400", bg: "bg-red-500/10", icon: <Shield className="w-4 h-4" /> },
  pattern: { label: "Padrão", color: "text-amber-400", bg: "bg-amber-500/10", icon: <Zap className="w-4 h-4" /> },
  journey: { label: "Jornada", color: "text-cyan-400", bg: "bg-cyan-500/10", icon: <Layers className="w-4 h-4" /> },
};

const domains: SignalDomain[] = ["efficiency", "financial", "behavioral", "risk", "pattern", "journey"];

const flowSteps = ["Camada de Dados", "Padronização", "Feature Store", "Núcleo de Inteligência Unificado", "Copiloto IA", "Dashboards", "Ações Operacionais"];

export default function ArchitectureViewer() {
  const providers = getSignalProviders();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Network className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Visualizador de Arquitetura</h1>
              <PageInfoTooltip description="Visualização da arquitetura de inteligência unificada, registro de sinais e auditoria de redundância do Feature Store Hub." />
            </div>
            <p className="text-sm text-muted-foreground">Núcleo de Inteligência Unificado — Registro de Sinais & Auditoria de Redundância</p>
          </div>
        </div>

        {/* Fluxo da Arquitetura */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Fluxo da Arquitetura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 flex-wrap py-4">
              {flowSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={cn(
                    "px-4 py-2 rounded-lg text-xs font-medium border",
                    i === 2 ? "bg-primary/10 text-primary border-primary/30 font-bold" : "bg-muted text-foreground border-border"
                  )}>
                    {step}
                  </div>
                  {i < 6 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regras de Arquitetura */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-status-warning" />
              Regras da Arquitetura ({ARCHITECTURE_RULES.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ARCHITECTURE_RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="w-4 h-4 text-status-success mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground">{rule}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Registro de Sinais por Domínio */}
        <Tabs defaultValue="efficiency" className="space-y-4">
          <TabsList className="flex-wrap h-auto p-1 gap-1">
            {domains.map(d => {
              const meta = domainMeta[d];
              const count = getSignalsByDomain(d).length;
              return (
                <TabsTrigger key={d} value={d} className="text-xs gap-1.5">
                  {meta.icon}
                  {meta.label}
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{count}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {domains.map(d => {
            const signals = getSignalsByDomain(d);
            const meta = domainMeta[d];
            return (
              <TabsContent key={d} value={d}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {signals.map(signal => (
                    <Card key={signal.id} className="border-border/50">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-lg", meta.bg)}>
                              {meta.icon}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{signal.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{signal.id}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">{meta.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{signal.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Database className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Provedor:</span>
                            <Badge variant="secondary" className="text-xs">{signal.provider}</Badge>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Consumidores:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {signal.consumers.map(c => (
                                <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Campo no Feature Store:</span>
                            <code className="text-xs font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded">{signal.featureStoreField}</code>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Auditoria de Redundância */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning" />
              Auditoria de Redundância ({REDUNDANCY_AUDIT.length} sinais consolidados)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {REDUNDANCY_AUDIT.map((entry, i) => (
                <div key={i} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">{entry.signal}</p>
                    <Badge className={cn(
                      "text-xs",
                      entry.status === "resolved"
                        ? "bg-status-success/10 text-status-success border-status-success/30"
                        : "bg-status-warning/10 text-status-warning border-status-warning/30"
                    )}>
                      {entry.status === "resolved" ? "✓ Resolvido" : "⚠ Monitorado"}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Locais anteriores:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entry.previousLocations.map((loc, j) => (
                          <Badge key={j} variant="outline" className="text-[10px] line-through opacity-60">{loc}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-3 h-3 text-status-success" />
                      <code className="text-xs font-mono text-status-success bg-status-success/5 px-2 py-1 rounded">{entry.consolidatedTo}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo de Provedores de Sinais */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              Provedores de Sinais ({providers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {providers.map(p => {
                const count = SIGNAL_REGISTRY.filter(s => s.provider === p).length;
                return (
                  <div key={p} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm font-medium text-foreground">{p}</span>
                    <Badge variant="secondary" className="text-xs">{count} sinais</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
