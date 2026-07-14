import { cn } from "@/lib/utils";
import { TrendingUp, DollarSign, Target, Percent } from "lucide-react";

interface EfficiencyScoreCardProps {
  score: number;
  savings: number;
  efficiency: number;
  estimated: {
    investment: number;
    result: number;
  };
  actual: {
    investment: number;
    result: number;
  };
}

function getEfficiencyLevel(efficiency: number) {
  if (efficiency >= 120) return { label: "Alta Eficiência", color: "text-status-success", bg: "bg-status-success" };
  if (efficiency >= 100) return { label: "Eficiência Neutra", color: "text-primary", bg: "bg-primary" };
  if (efficiency >= 80) return { label: "Baixa Eficiência", color: "text-status-warning", bg: "bg-status-warning" };
  return { label: "Ineficiência", color: "text-status-error", bg: "bg-status-error" };
}

export function EfficiencyScoreCard({ 
  score, 
  savings, 
  efficiency, 
  estimated, 
  actual 
}: EfficiencyScoreCardProps) {
  const level = getEfficiencyLevel(efficiency);

  return (
    <div className="relative p-6 rounded-xl bg-card border border-border overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">MBES</h3>
              <p className="text-xs text-muted-foreground">Media Buying Efficiency Score</p>
            </div>
          </div>
          <span className={cn("text-xs font-medium px-3 py-1 rounded-full", level.bg, "text-background")}>
            {level.label}
          </span>
        </div>

        {/* Main Score */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className={cn("text-5xl font-bold tabular-nums", level.color)}>{score}</span>
          <span className="text-lg text-muted-foreground">/100</span>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-status-success" />
              <span className="text-xs text-muted-foreground">Economia Líquida</span>
            </div>
            <span className="text-xl font-bold text-status-success">
              R$ {savings.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Eficiência</span>
            </div>
            <span className="text-xl font-bold text-primary">
              {efficiency}%
            </span>
          </div>
        </div>

        {/* Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimado</span>
            <div className="flex items-center gap-4">
              <span className="text-foreground">
                R$ {estimated.investment.toLocaleString('pt-BR')} → {estimated.result.toLocaleString('pt-BR')} conv.
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Real</span>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-medium">
                R$ {actual.investment.toLocaleString('pt-BR')} → {actual.result.toLocaleString('pt-BR')} conv.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
