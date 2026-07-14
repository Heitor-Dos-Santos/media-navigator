import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAgency } from "@/contexts/TenantContext";
import { PLANS, type PlanName } from "@/types/tenant";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CreditCard, Users, Building2, Zap, Check, X,
  BarChart3, Lightbulb, DollarSign, TrendingUp,
  Activity, HardDrive, Brain, Sparkles, Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const usageMetricMeta: Record<string, { label: string; icon: React.ReactNode; unit: string }> = {
  api_calls: { label: "API Calls", icon: <Activity className="w-4 h-4" />, unit: "chamadas" },
  data_storage_mb: { label: "Armazenamento", icon: <HardDrive className="w-4 h-4" />, unit: "MB" },
  forecast_runs: { label: "Forecast Runs", icon: <Brain className="w-4 h-4" />, unit: "execuções" },
  recommendation_runs: { label: "Recommendation Runs", icon: <Sparkles className="w-4 h-4" />, unit: "execuções" },
};

export default function SubscriptionUsage() {
  const { agency, plan, usage, counts, updateAgency } = useAgency();

  const clientPercent = plan.maxClients === Infinity ? 0 : (counts.activeClients / plan.maxClients) * 100;
  const userPercent = plan.maxUsers === Infinity ? 0 : (counts.activeUsers / plan.maxUsers) * 100;
  const integrationPercent = plan.maxIntegrations === Infinity ? 0 : (counts.activeIntegrations / plan.maxIntegrations) * 100;

  const featureChecks = [
    { label: "Forecast & Projeções", enabled: plan.forecastEnabled, icon: <TrendingUp className="w-4 h-4" /> },
    { label: "Recommendation Engine", enabled: plan.recommendationEnabled, icon: <Lightbulb className="w-4 h-4" /> },
    { label: "Camada Financeira", enabled: plan.financialLayerEnabled, icon: <DollarSign className="w-4 h-4" /> },
    { label: "Benchmark & Ranking", enabled: plan.benchmarkEnabled, icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const allPlans = Object.values(PLANS);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Subscription & Usage</h1>
            <PageInfoTooltip description="Gerencie seu plano, limites de uso e consumo de recursos da plataforma." />
            <Badge className="bg-primary/10 text-primary border-primary/20">{plan.displayName}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Gerencie seu plano, limites e consumo de recursos</p>
        </div>

        {/* Current Plan Card */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano Atual</p>
                  <h2 className="text-3xl font-bold text-foreground">{plan.displayName}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {plan.price > 0 ? `R$ ${plan.price.toLocaleString("pt-BR")}/mês` : "Preço personalizado"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Agência</p>
                <p className="font-medium text-foreground">{agency.agencyName}</p>
                <p className="text-xs text-muted-foreground mt-1">ID: {agency.agencyId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">Clientes</span></div>
                <span className="text-sm text-muted-foreground">{counts.activeClients} / {plan.maxClients === Infinity ? "∞" : plan.maxClients}</span>
              </div>
              {plan.maxClients !== Infinity && <Progress value={clientPercent} className="h-2" />}
              {plan.maxClients === Infinity && <p className="text-xs text-muted-foreground">Ilimitado</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">Usuários</span></div>
                <span className="text-sm text-muted-foreground">{counts.activeUsers} / {plan.maxUsers === Infinity ? "∞" : plan.maxUsers}</span>
              </div>
              {plan.maxUsers !== Infinity && <Progress value={userPercent} className="h-2" />}
              {plan.maxUsers === Infinity && <p className="text-xs text-muted-foreground">Ilimitado</p>}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-muted-foreground" /><span className="text-sm font-medium">Integrações</span></div>
                <span className="text-sm text-muted-foreground">{counts.activeIntegrations} / {plan.maxIntegrations === Infinity ? "∞" : plan.maxIntegrations}</span>
              </div>
              {plan.maxIntegrations !== Infinity && <Progress value={integrationPercent} className="h-2" />}
              {plan.maxIntegrations === Infinity && <p className="text-xs text-muted-foreground">Ilimitado</p>}
            </CardContent>
          </Card>
        </div>

        {/* Feature Access */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acesso a Funcionalidades</CardTitle>
            <CardDescription>Módulos disponíveis no seu plano atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featureChecks.map(f => (
                <div key={f.label} className={cn("flex items-center gap-3 p-3 rounded-lg border", f.enabled ? "bg-status-success/5 border-status-success/20" : "bg-muted/30 border-border")}>
                  <span className={f.enabled ? "text-status-success" : "text-muted-foreground"}>{f.icon}</span>
                  <span className={cn("text-sm font-medium", f.enabled ? "text-foreground" : "text-muted-foreground")}>{f.label}</span>
                  <span className="ml-auto">
                    {f.enabled ? <Check className="w-4 h-4 text-status-success" /> : <X className="w-4 h-4 text-muted-foreground" />}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Uso do Período</CardTitle>
            <CardDescription>Consumo de recursos no mês atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {usage.map(u => {
                const meta = usageMetricMeta[u.metricType];
                return (
                  <div key={u.metricType} className="p-4 rounded-lg bg-muted/30 border border-border space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">{meta.icon}<span className="text-xs">{meta.label}</span></div>
                    <p className="text-2xl font-bold text-foreground">{u.value.toLocaleString("pt-BR")}</p>
                    <p className="text-xs text-muted-foreground">{meta.unit} em {u.period}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparação de Planos</CardTitle>
            <CardDescription>Escolha o plano ideal para sua agência</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium text-muted-foreground">Recurso</th>
                    {allPlans.map(p => (
                      <th key={p.name} className={cn("text-center p-3 font-medium", p.name === agency.subscriptionPlan ? "text-primary" : "text-foreground")}>
                        {p.displayName}
                        {p.name === agency.subscriptionPlan && <Badge className="ml-2 text-[10px] bg-primary/10 text-primary">Atual</Badge>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Preço</td>{allPlans.map(p => <td key={p.name} className="text-center p-3 font-medium">{p.price > 0 ? `R$ ${p.price}` : "Custom"}</td>)}</tr>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Clientes</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.maxClients === Infinity ? "∞" : p.maxClients}</td>)}</tr>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Usuários</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.maxUsers === Infinity ? "∞" : p.maxUsers}</td>)}</tr>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Integrações</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.maxIntegrations === Infinity ? "∞" : p.maxIntegrations}</td>)}</tr>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Forecast</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.forecastEnabled ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>)}</tr>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Recommendations</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.recommendationEnabled ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>)}</tr>
                  <tr className="border-b"><td className="p-3 text-muted-foreground">Financeiro</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.financialLayerEnabled ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>)}</tr>
                  <tr><td className="p-3 text-muted-foreground">Benchmark</td>{allPlans.map(p => <td key={p.name} className="text-center p-3">{p.benchmarkEnabled ? <Check className="w-4 h-4 text-status-success mx-auto" /> : <X className="w-4 h-4 text-muted-foreground mx-auto" />}</td>)}</tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="lg" disabled>
                <CreditCard className="w-4 h-4 mr-2" />Upgrade de Plano (em breve)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
