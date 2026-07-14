import { cn } from "@/lib/utils";
import { Gauge, TrendingUp } from "lucide-react";

export interface MBEIInput {
  plannedCPA: number;
  realCPA: number;
  plannedBudget: number;
  realSpend: number;
  realConversions: number;
  plannedConversions: number;
}

export interface MBEIResult {
  score: number;
  cpaRatio: number;
  budgetRatio: number;
  conversionRatio: number;
}

export function calculateMBEI(input: MBEIInput): MBEIResult {
  const cpaRatio = input.realCPA > 0 ? input.plannedCPA / input.realCPA : 1;
  const budgetRatio = input.realSpend > 0 ? input.plannedBudget / input.realSpend : 1;
  const conversionRatio = input.plannedConversions > 0 ? input.realConversions / input.plannedConversions : 1;

  const weightedScore = cpaRatio * 0.5 + budgetRatio * 0.3 + conversionRatio * 0.2;
  const score = Math.max(0, Math.min(150, Math.round(weightedScore * 100)));

  return { score, cpaRatio, budgetRatio, conversionRatio };
}

function getMBEIClassification(score: number) {
  if (score >= 130) return { label: "Elite Efficiency", color: "text-status-success", bg: "bg-status-success", ring: "ring-status-success" };
  if (score >= 110) return { label: "High Efficiency", color: "text-status-success", bg: "bg-status-success", ring: "ring-status-success" };
  if (score >= 95) return { label: "Stable", color: "text-status-warning", bg: "bg-status-warning", ring: "ring-status-warning" };
  if (score >= 80) return { label: "At Risk", color: "text-[hsl(25,90%,50%)]", bg: "bg-[hsl(25,90%,50%)]", ring: "ring-[hsl(25,90%,50%)]" };
  return { label: "Critical", color: "text-status-error", bg: "bg-status-error", ring: "ring-status-error" };
}

interface MBEIScoreCardProps {
  input: MBEIInput;
}

export function MBEIScoreCard({ input }: MBEIScoreCardProps) {
  const { score, cpaRatio, budgetRatio, conversionRatio } = calculateMBEI(input);
  const classification = getMBEIClassification(score);

  const gaugePercent = Math.min((score / 150) * 100, 100);

  return (
    <div className="relative p-6 rounded-xl bg-card border border-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Gauge className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">MBEI</h3>
              <p className="text-xs text-muted-foreground">Media Buying Efficiency Index</p>
            </div>
          </div>
          <span className={cn("text-xs font-medium px-3 py-1 rounded-full text-background", classification.bg)}>
            {classification.label}
          </span>
        </div>

        {/* Score + Gauge */}
        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-5xl font-bold tabular-nums", classification.color)}>{score}</span>
            <span className="text-lg text-muted-foreground">/150</span>
          </div>
          <div className="flex-1">
            <div className="h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", classification.bg)}
                style={{ width: `${gaugePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Component Ratios */}
        <div className="grid grid-cols-3 gap-3">
          <RatioCard label="CPA Ratio" value={cpaRatio} weight="50%" />
          <RatioCard label="Budget Ratio" value={budgetRatio} weight="30%" />
          <RatioCard label="Conversion Ratio" value={conversionRatio} weight="20%" />
        </div>
      </div>
    </div>
  );
}

function RatioCard({ label, value, weight }: { label: string; value: number; weight: string }) {
  const displayValue = (value * 100).toFixed(0);
  const isGood = value >= 1;

  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">{weight}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-lg font-bold", isGood ? "text-status-success" : "text-status-error")}>
          {displayValue}%
        </span>
      </div>
    </div>
  );
}
