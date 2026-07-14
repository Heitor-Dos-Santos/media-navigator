import { cn } from "@/lib/utils";
import { Activity, Target, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

interface QuickStatsBarProps {
  stats: {
    activeCampaigns: number;
    totalBudget: number;
    avgEfficiency: number;
    alertCount: number;
    healthyCount: number;
  };
}

export function QuickStatsBar({ stats }: QuickStatsBarProps) {
  const items = [
    {
      label: "Campanhas Ativas",
      value: stats.activeCampaigns,
      icon: Activity,
      color: "text-primary",
    },
    {
      label: "Orçamento Total",
      value: `R$ ${stats.totalBudget.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: "text-foreground",
    },
    {
      label: "Eficiência Média",
      value: `${stats.avgEfficiency}%`,
      icon: Target,
      color: stats.avgEfficiency >= 100 ? "text-status-success" : "text-status-warning",
    },
    {
      label: "Alertas",
      value: stats.alertCount,
      icon: AlertTriangle,
      color: stats.alertCount > 0 ? "text-status-warning" : "text-status-neutral",
    },
    {
      label: "Saudáveis",
      value: stats.healthyCount,
      icon: CheckCircle,
      color: "text-status-success",
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg",
            index === 0 && "bg-card"
          )}
        >
          <item.icon className={cn("w-4 h-4", item.color)} />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span className={cn("text-sm font-semibold tabular-nums", item.color)}>
              {item.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
