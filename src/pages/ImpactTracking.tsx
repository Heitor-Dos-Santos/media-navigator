import { useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Rocket, DollarSign, TrendingDown, CheckCircle2, TrendingUp,
  BarChart3, Lightbulb, Activity,
} from "lucide-react";
import { computeAdoptionImpact } from "@/lib/operationalCalculations";
import { cn } from "@/lib/utils";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function ImpactTracking() {
  const impact = useMemo(() => computeAdoptionImpact(), []);

  const metrics = [
    {
      label: "Economia Total Desde Adoção",
      value: `R$ ${impact.totalSavings.toLocaleString("pt-BR")}`,
      icon: DollarSign,
      iconColor: "text-status-success",
      iconBg: "bg-status-success/10",
    },
    {
      label: "Redução de CPA",
      value: `${impact.cpaReduction}%`,
      icon: TrendingDown,
      iconColor: "text-status-success",
      iconBg: "bg-status-success/10",
      progress: impact.cpaReduction,
      progressMax: 30,
    },
    {
      label: "Taxa de Resolução de Alertas",
      value: `${impact.alertResolutionRate}%`,
      icon: CheckCircle2,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      progress: impact.alertResolutionRate,
    },
    {
      label: "Melhoria de Margem",
      value: `+${impact.marginImprovement}pp`,
      icon: TrendingUp,
      iconColor: "text-status-success",
      iconBg: "bg-status-success/10",
      progress: impact.marginImprovement,
      progressMax: 20,
    },
    {
      label: "Recomendações Aplicadas",
      value: `${impact.recommendationsApplied}%`,
      icon: Lightbulb,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      progress: impact.recommendationsApplied,
    },
    {
      label: "Melhoria de Eficiência",
      value: `+${impact.efficiencyImprovement}%`,
      icon: BarChart3,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      progress: impact.efficiencyImprovement,
      progressMax: 40,
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Rocket className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Impacto Desde a Adoção</h1>
            <PageInfoTooltip description="Métricas de impacto operacional desde a adoção da plataforma com economia acumulada e melhorias de eficiência." />
            <Badge variant="outline" className="text-xs">{impact.monthsTracked} meses rastreados</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Impacto operacional desde a adoção da plataforma MediaHub</p>
        </div>

        {/* Hero Metric */}
        <Card className="border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Activity className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Economia Total Acumulada</span>
            </div>
            <p className="text-5xl font-bold text-status-success mb-2">
              R$ {impact.totalSavings.toLocaleString("pt-BR")}
            </p>
            <p className="text-sm text-muted-foreground">em {impact.monthsTracked} meses de operação com MediaHub</p>
          </CardContent>
        </Card>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.slice(1).map((m, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg", m.iconBg)}>
                    <m.icon className={cn("w-5 h-5", m.iconColor)} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{m.label}</span>
                </div>
                <p className="text-3xl font-bold text-foreground mb-2">{m.value}</p>
                {m.progress !== undefined && (
                  <Progress value={Math.min(100, (m.progress / (m.progressMax || 100)) * 100)} className="h-2" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: impact.monthsTracked }, (_, i) => {
                const month = new Date();
                month.setMonth(month.getMonth() - (impact.monthsTracked - 1 - i));
                const savings = Math.round(impact.totalSavings * ((i + 1) / (impact.monthsTracked * (impact.monthsTracked + 1) / 2)));
                return (
                  <div key={i} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">{month.toLocaleDateString("pt-BR", { month: "short" })}</p>
                    <p className="text-sm font-bold text-foreground mt-1">R$ {(savings / 1000).toFixed(0)}k</p>
                    <div className="mt-2 mx-auto w-3 rounded-full bg-primary/20" style={{ height: `${Math.max(12, (savings / impact.totalSavings) * 60)}px` }}>
                      <div className="w-full rounded-full bg-primary" style={{ height: "100%" }} />
                    </div>
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
