import { useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  eachMonthOfInterval,
  format,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  max,
  min,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Equal, PieChart, Percent, DollarSign } from "lucide-react";

export type InputMode = "percentage" | "amount";

export interface MonthlyBudget {
  month: number;
  year: number;
  daysInPeriod: number;
  percentage: number;
  amount: number;
  label: string;
  shortLabel: string;
}

interface BudgetDistributionProps {
  totalBudget: number;
  periodStart: string;
  periodEnd: string;
  monthlyBudgets: MonthlyBudget[];
  onBudgetsChange: (budgets: MonthlyBudget[]) => void;
  inputMode?: InputMode;
  onInputModeChange?: (mode: InputMode) => void;
}

export function BudgetDistribution({
  totalBudget,
  periodStart,
  periodEnd,
  monthlyBudgets,
  onBudgetsChange,
  inputMode = "percentage",
  onInputModeChange,
}: BudgetDistributionProps) {
  const monthsData = useMemo(() => {
    if (!periodStart || !periodEnd) return [];
    const start = parseISO(periodStart);
    const end = parseISO(periodEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

    const months = eachMonthOfInterval({ start, end });
    return months.map((monthDate) => {
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const effectiveStart = max([monthStart, start]);
      const effectiveEnd = min([monthEnd, end]);
      const daysInPeriod = differenceInDays(effectiveEnd, effectiveStart) + 1;

      return {
        month: monthDate.getMonth(),
        year: monthDate.getFullYear(),
        daysInPeriod,
        label: format(monthDate, "MMMM yyyy", { locale: ptBR }),
        shortLabel: format(monthDate, "MMM", { locale: ptBR }).toUpperCase(),
      };
    });
  }, [periodStart, periodEnd]);

  const totalDays = useMemo(() => {
    return monthsData.reduce((sum, m) => sum + m.daysInPeriod, 0);
  }, [monthsData]);

  useEffect(() => {
    if (monthsData.length > 0 && (monthlyBudgets.length === 0 || monthlyBudgets.length !== monthsData.length)) {
      distributeProportional();
    }
  }, [monthsData, totalBudget]);

  const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;

  const distributeLinear = () => {
    if (monthsData.length === 0) return;
    const basePercentage = Math.floor(100 / monthsData.length);
    const remainder = 100 - basePercentage * monthsData.length;

    const newBudgets = monthsData.map((m, index) => {
      const percentage = index < remainder ? basePercentage + 1 : basePercentage;
      return {
        month: m.month, year: m.year, daysInPeriod: m.daysInPeriod,
        percentage, amount: (percentage / 100) * totalBudget,
        label: m.label, shortLabel: m.shortLabel,
      };
    });
    onBudgetsChange(newBudgets);
  };

  const distributeProportional = () => {
    if (monthsData.length === 0 || totalDays === 0) return;
    const rawPercentages = monthsData.map((m) => (m.daysInPeriod / totalDays) * 100);
    const roundedPercentages = rawPercentages.map(roundToOneDecimal);
    const sum = roundedPercentages.reduce((a, b) => a + b, 0);
    const diff = roundToOneDecimal(100 - sum);
    if (roundedPercentages.length > 0) {
      roundedPercentages[roundedPercentages.length - 1] = roundToOneDecimal(
        roundedPercentages[roundedPercentages.length - 1] + diff
      );
    }

    const newBudgets = monthsData.map((m, index) => ({
      month: m.month, year: m.year, daysInPeriod: m.daysInPeriod,
      percentage: roundedPercentages[index],
      amount: (roundedPercentages[index] / 100) * totalBudget,
      label: m.label, shortLabel: m.shortLabel,
    }));
    onBudgetsChange(newBudgets);
  };

  const updatePercentage = (index: number, newPercentage: number) => {
    const rounded = roundToOneDecimal(newPercentage);
    const updated = [...monthlyBudgets];
    updated[index] = { ...updated[index], percentage: rounded, amount: (rounded / 100) * totalBudget };
    onBudgetsChange(updated);
  };

  const updateAmount = (index: number, newAmount: number) => {
    const percentage = totalBudget > 0 ? roundToOneDecimal((newAmount / totalBudget) * 100) : 0;
    const updated = [...monthlyBudgets];
    updated[index] = { ...updated[index], amount: newAmount, percentage };
    onBudgetsChange(updated);
  };

  const totalAllocated = useMemo(() => {
    return roundToOneDecimal(monthlyBudgets.reduce((sum, b) => sum + b.percentage, 0));
  }, [monthlyBudgets]);

  const totalAmount = useMemo(() => {
    return monthlyBudgets.reduce((sum, b) => sum + b.amount, 0);
  }, [monthlyBudgets]);

  const isValid = Math.abs(totalAllocated - 100) < 0.1;

  const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (!periodStart || !periodEnd || totalBudget <= 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Defina o período da campanha e a verba total para distribuir o orçamento mensal.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Distribution buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Label className="text-sm text-muted-foreground whitespace-nowrap">Distribuir:</Label>
        <Button variant="outline" size="sm" onClick={distributeLinear}>
          <Equal className="w-4 h-4 mr-1" />Linear
        </Button>
        <Button variant="outline" size="sm" onClick={distributeProportional}>
          <PieChart className="w-4 h-4 mr-1" />Proporcional
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Label className="text-sm text-muted-foreground whitespace-nowrap">Entrada:</Label>
        <div className="flex items-center border rounded-lg p-0.5 bg-muted/30">
          <Button
            variant={inputMode === "percentage" ? "default" : "ghost"}
            size="sm" className="h-7 px-2"
            onClick={() => onInputModeChange?.("percentage")}
          >
            <Percent className="w-3 h-3 mr-1" />%
          </Button>
          <Button
            variant={inputMode === "amount" ? "default" : "ghost"}
            size="sm" className="h-7 px-2"
            onClick={() => onInputModeChange?.("amount")}
          >
            <DollarSign className="w-3 h-3 mr-1" />R$
          </Button>
        </div>
        <div className="flex-1" />
        <Badge variant={isValid ? "default" : "destructive"} className="text-xs">
          {totalAllocated}% alocado
        </Badge>
      </div>

      {/* Monthly breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {monthsData.map((monthData, index) => {
          const budget = monthlyBudgets[index];
          if (!budget) return null;

          return (
            <div
              key={`${monthData.year}-${monthData.month}`}
              className="p-3 rounded-lg border bg-card space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-xs capitalize truncate">
                  {monthData.shortLabel}/{monthData.year.toString().slice(-2)}
                </span>
                <Badge variant="secondary" className="text-xs px-1">
                  {monthData.daysInPeriod}d
                </Badge>
              </div>

              {inputMode === "percentage" ? (
                <>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number" min={0} max={100} step={0.1}
                      value={budget.percentage}
                      onChange={(e) => updatePercentage(index, parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs text-center"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                  <div className="text-xs text-primary font-medium text-center truncate">
                    {formatCurrency(budget.amount)}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number" min={0} step={100}
                      value={Math.round(budget.amount)}
                      onChange={(e) => updateAmount(index, parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs text-center"
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-center truncate">
                    {budget.percentage.toFixed(1)}%
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Total bar */}
      <div className={`p-3 rounded-lg border flex items-center justify-between ${
        isValid
          ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
      }`}>
        <div className="flex items-center gap-2">
          <Progress
            value={Math.min(totalAllocated, 100)}
            className={`w-24 h-2 ${!isValid && "bg-amber-200 dark:bg-amber-800"}`}
          />
          {!isValid && (
            <span className="text-xs text-amber-600 dark:text-amber-400">Deve somar 100%</span>
          )}
        </div>
        <span className="font-semibold text-sm">{formatCurrency(totalAmount)}</span>
      </div>
    </div>
  );
}
