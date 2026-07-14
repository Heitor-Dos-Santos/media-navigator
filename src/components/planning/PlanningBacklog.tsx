import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Trash2, Edit2, FileText, Layers } from "lucide-react";
import type { PlanDataV2, PlanStatus } from "@/types/planningV2";

interface PlanningBacklogProps {
  plans: PlanDataV2[];
  onEdit: (plan: PlanDataV2) => void;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: PlanStatus) => void;
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const STATUS_OPTIONS: { value: PlanStatus; label: string }[] = [
  { value: "rascunho",  label: "Rascunho"  },
  { value: "pendente",  label: "Pendente"  },
  { value: "aprovado",  label: "Aprovado"  },
  { value: "reprovado", label: "Reprovado" },
  { value: "cancelado", label: "Cancelado" },
];

const statusColors: Record<PlanStatus, string> = {
  rascunho:  "bg-muted text-muted-foreground",
  pendente:  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  aprovado:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  reprovado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelado: "bg-muted text-muted-foreground line-through",
};

function getPlanBudget(plan: PlanDataV2): number {
  if (plan.scenarios?.length) {
    const active = plan.scenarios.find((s) => s.id === plan.activeScenarioId) ?? plan.scenarios[0];
    return active?.totalBudget ?? plan.totalBudget ?? 0;
  }
  return plan.totalBudget ?? 0;
}

function getPlanPeriod(plan: PlanDataV2): string {
  const s = plan.scenarios?.find((sc) => sc.id === plan.activeScenarioId) ?? plan.scenarios?.[0];
  const start = s?.periodStart || plan.periodStart;
  const end   = s?.periodEnd   || plan.periodEnd;
  if (!start && !end) return "—";
  return `${start} → ${end}`;
}

export function PlanningBacklog({ plans, onEdit, onDelete, onStatusChange }: PlanningBacklogProps) {
  if (plans.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="py-16 text-center text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Nenhum plano salvo ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-base">Planos Salvos ({plans.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Taxonomia</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Campanha</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cenários</TableHead>
                <TableHead>Linhas</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-mono text-xs max-w-[200px] truncate">{plan.taxonomy}</TableCell>
                  <TableCell className="font-medium">{plan.client}</TableCell>
                  <TableCell>{plan.campaign}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{getPlanPeriod(plan)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(getPlanBudget(plan))}</TableCell>
                  <TableCell>
                    {onStatusChange ? (
                      <Select
                        value={(plan.status as PlanStatus) ?? "rascunho"}
                        onValueChange={(v) => onStatusChange(plan.id, v as PlanStatus)}
                      >
                        <SelectTrigger className="h-7 text-xs w-[110px] px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`text-xs ${statusColors[(plan.status as PlanStatus)] || statusColors.rascunho}`}>
                        {plan.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {(plan.scenarios?.length ?? 1) > 1 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Layers className="w-3 h-3" />{plan.scenarios!.length}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">1</span>
                    )}
                  </TableCell>
                  <TableCell>{plan.lines.length}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(plan)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onDelete(plan.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
