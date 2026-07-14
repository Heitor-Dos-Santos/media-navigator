import type { PlanningLine } from "@/components/planning/PlanningTable";
import type { MonthlyBudget } from "@/components/planning/BudgetDistribution";

export type PlanStatus = 'rascunho' | 'pendente' | 'aprovado' | 'reprovado' | 'cancelado';

export interface PlanScenario {
  id: string;
  name: string;
  totalBudget: number;
  periodStart: string;
  periodEnd: string;
  monthlyBudgets: MonthlyBudget[];
  lines: PlanningLine[];
  observations: string;
}

export interface PlanDataV2 {
  id: string;
  status: string;
  client: string;
  campaign: string;
  year: string;
  quarter: string;
  // Legacy fields (kept for backward compat with existing backlog items)
  periodStart: string;
  periodEnd: string;
  totalBudget: number;
  companyLogo: string | null;
  monthlyBudgets: MonthlyBudget[];
  lines: PlanningLine[];
  observations: string;
  taxonomy: string;
  // Multi-scenario support
  scenarios?: PlanScenario[];
  activeScenarioId?: string;
}
