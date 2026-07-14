// ── Operational Embedding Layer Types ──

// ── Target & Goal Engine ──

export interface ClientTargets {
  clientId: string;
  targetMBEI: number;
  targetMargin: number;
  targetCPA: number;
  targetAlertReduction: number; // %
  targetSavings: number;
}

export interface TargetDeviation {
  clientId: string;
  clientName: string;
  metric: string;
  target: number;
  actual: number;
  deviation: number; // %
  flagged: boolean;
}

// ── Accountability ──

export interface ClientOwnership {
  clientId: string;
  primaryOwnerUserId: string;
  primaryOwnerName: string;
  secondaryOwnerUserId?: string;
  secondaryOwnerName?: string;
}

export interface AlertOwnership {
  alertId: string;
  responsibleUserId: string;
  responsibleName: string;
  dueDate: string;
}

export interface RecommendationOwnership {
  recommendationId: string;
  responsibleUserId: string;
  responsibleName: string;
  status: "pending" | "in_progress" | "done";
}

// ── Agency Health Index ──

export type HealthLevel = "excellent" | "strong" | "stable" | "at_risk" | "critical";

export interface AgencyHealthIndex {
  score: number;
  level: HealthLevel;
  components: {
    avgMBEI: number;
    marginPercent: number;
    alertDensity: number;
    momentum: number;
    forecastStability: number;
    targetAchievement: number;
  };
}

export const healthLevelMeta: Record<HealthLevel, { label: string; color: string; bg: string; border: string }> = {
  excellent: { label: "Excelente", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" },
  strong: { label: "Forte", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  stable: { label: "Estável", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" },
  at_risk: { label: "Em Risco", color: "text-[hsl(25,90%,50%)]", bg: "bg-[hsl(25,90%,50%)]/10", border: "border-[hsl(25,90%,50%)]/30" },
  critical: { label: "Crítico", color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/30" },
};

// ── Impact Tracking ──

export interface AdoptionImpact {
  totalSavings: number;
  cpaReduction: number;
  alertResolutionRate: number;
  marginImprovement: number;
  recommendationsApplied: number;
  efficiencyImprovement: number;
  monthsTracked: number;
}
