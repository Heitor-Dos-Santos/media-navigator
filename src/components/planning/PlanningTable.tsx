import { useState } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Calendar, Copy } from "lucide-react";
import { CreatableSelect } from "./CreatableSelect";
import { BudgetDistribution, type MonthlyBudget, type InputMode } from "./BudgetDistribution";

export type LineInputMode = "percentage" | "amount";

export interface PlanningLine {
  id: string;
  platform: string;
  objective: string;
  format: string;
  audience: string;
  share: number;
  amount: number;
  inputMode: LineInputMode;
  kpi: string;
  unitValue: number;
  estimatedResults: number;
}

interface PlanningTableProps {
  lines: PlanningLine[];
  onLinesChange: (lines: PlanningLine[]) => void;
  totalBudget: number;
  onTotalBudgetChange: (value: number) => void;
  periodStart: string;
  periodEnd: string;
  onPeriodStartChange: (value: string) => void;
  onPeriodEndChange: (value: string) => void;
  monthlyBudgets: MonthlyBudget[];
  onMonthlyBudgetsChange: (budgets: MonthlyBudget[]) => void;
  observations: string;
  onObservationsChange: (value: string) => void;
}

const defaultPlatforms = ["GoogleAds", "Meta", "Programática", "TikTok", "LinkedIn", "Kwai", "Spotify", "AmazonDSP"];
const defaultObjectives = ["Awareness", "Consideration", "Conversion", "Retention"];
const defaultFormats = ["Display", "Video", "Native", "Search", "Social", "Audio"];
const kpiOptions = ["CPM", "CPV", "CPA", "CPL", "CPI", "CPAu", "CPC"];

interface SortableRowProps {
  line: PlanningLine;
  children: React.ReactNode;
}

function SortableRow({ line, children }: SortableRowProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: line.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="group">
      <TableCell className="w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}

export function PlanningTable({
  lines, onLinesChange, totalBudget, onTotalBudgetChange,
  periodStart, periodEnd, onPeriodStartChange, onPeriodEndChange,
  monthlyBudgets, onMonthlyBudgetsChange,
  observations, onObservationsChange,
}: PlanningTableProps) {
  const [customPlatforms, setCustomPlatforms] = useState<string[]>([]);
  const [customObjectives, setCustomObjectives] = useState<string[]>([]);
  const [customFormats, setCustomFormats] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<InputMode>("percentage");

  const platforms = [...defaultPlatforms, ...customPlatforms];
  const objectives = [...defaultObjectives, ...customObjectives];
  const formats = [...defaultFormats, ...customFormats];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const calculateEstimatedResults = (lineBudget: number, kpi: string, unitValue: number): number => {
    if (!lineBudget || !unitValue || unitValue === 0) return 0;
    if (kpi === "CPM") return (lineBudget / unitValue) * 1000;
    return lineBudget / unitValue;
  };

  // Resolve the effective budget for a line (from share % or fixed amount)
  const getEffectiveLineBudget = (line: PlanningLine): number => {
    if (line.inputMode === "amount") return line.amount || 0;
    return totalBudget > 0 ? (line.share / 100) * totalBudget : 0;
  };

  // Share % derived from amount, for display in total row
  const getLineShare = (line: PlanningLine): number => {
    if (line.inputMode === "percentage") return line.share || 0;
    return totalBudget > 0 ? ((line.amount || 0) / totalBudget) * 100 : 0;
  };

  const getLineMonthValue = (line: PlanningLine, monthBudget: MonthlyBudget): number => {
    const share = getLineShare(line);
    return (share / 100) * monthBudget.amount;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = lines.findIndex((l) => l.id === active.id);
      const newIndex = lines.findIndex((l) => l.id === over.id);
      onLinesChange(arrayMove(lines, oldIndex, newIndex));
    }
  };

  const addLine = () => {
    onLinesChange([...lines, {
      id: Date.now().toString(), platform: "", objective: "", format: "",
      audience: "", share: 0, amount: 0, inputMode: "percentage",
      kpi: "", unitValue: 0, estimatedResults: 0,
    }]);
  };

  const updateLine = (id: string, field: keyof PlanningLine, value: string | number) => {
    onLinesChange(lines.map((line) => {
      if (line.id !== id) return line;
      const updated = { ...line, [field]: value };
      const budget = getEffectiveLineBudget(updated);
      updated.estimatedResults = calculateEstimatedResults(budget, updated.kpi, updated.unitValue);
      return updated;
    }));
  };

  const updateShareOrAmount = (id: string, rawValue: number) => {
    onLinesChange(lines.map((line) => {
      if (line.id !== id) return line;
      const updated = { ...line };
      if (line.inputMode === "percentage") {
        updated.share = Math.round(rawValue * 10) / 10;
        updated.amount = totalBudget > 0 ? (updated.share / 100) * totalBudget : 0;
      } else {
        updated.amount = rawValue;
        updated.share = totalBudget > 0 ? (rawValue / totalBudget) * 100 : 0;
      }
      updated.estimatedResults = calculateEstimatedResults(
        getEffectiveLineBudget(updated), updated.kpi, updated.unitValue
      );
      return updated;
    }));
  };

  const toggleLineInputMode = (id: string) => {
    onLinesChange(lines.map((line) => {
      if (line.id !== id) return line;
      const newMode: LineInputMode = line.inputMode === "percentage" ? "amount" : "percentage";
      return { ...line, inputMode: newMode };
    }));
  };

  const removeLine = (id: string) => onLinesChange(lines.filter((l) => l.id !== id));

  const duplicateLine = (id: string) => {
    const src = lines.find((l) => l.id === id);
    if (!src) return;
    const copy: PlanningLine = { ...src, id: crypto.randomUUID() };
    const idx = lines.findIndex((l) => l.id === id);
    const next = [...lines];
    next.splice(idx + 1, 0, copy);
    onLinesChange(next);
  };

  const handleCreatePlatform = (v: string) => { if (!platforms.includes(v)) setCustomPlatforms([...customPlatforms, v]); };
  const handleCreateObjective = (v: string) => { if (!objectives.includes(v)) setCustomObjectives([...customObjectives, v]); };
  const handleCreateFormat = (v: string) => { if (!formats.includes(v)) setCustomFormats([...customFormats, v]); };

  const formatCurrency = (num: number): string => {
    if (num >= 1000000) return `R$ ${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `R$ ${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  };

  const totalShare = lines.reduce((sum, l) => sum + getLineShare(l), 0);
  const totalLineBudget = lines.reduce((sum, l) => sum + getEffectiveLineBudget(l), 0);
  const totalResults = lines.reduce((sum, l) => sum + (l.estimatedResults || 0), 0);

  const getMonthTotal = (mb: MonthlyBudget): number =>
    lines.reduce((sum, l) => sum + getLineMonthValue(l, mb), 0);

  return (
    <div className="space-y-6">
      {/* Period and Distribution */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {/* Total Budget per scenario */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">💰 Verba Total</Label>
            <Input
              type="number"
              value={totalBudget || ""}
              onChange={(e) => onTotalBudgetChange(parseFloat(e.target.value) || 0)}
              placeholder="R$ 0,00"
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4" />Período da Campanha
            </Label>
            <div className="flex items-center gap-2">
              <Input type="date" value={periodStart} onChange={(e) => onPeriodStartChange(e.target.value)} className="w-36" />
              <span className="text-muted-foreground text-sm">até</span>
              <Input type="date" value={periodEnd} onChange={(e) => onPeriodEndChange(e.target.value)} className="w-36" />
            </div>
          </div>
        </div>
        <BudgetDistribution
          totalBudget={totalBudget}
          periodStart={periodStart}
          periodEnd={periodEnd}
          monthlyBudgets={monthlyBudgets}
          onBudgetsChange={onMonthlyBudgetsChange}
          inputMode={inputMode}
          onInputModeChange={setInputMode}
        />
      </div>

      {/* Table Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm animate-fade-in">
            {lines.length} linha(s)
          </Badge>
          <Badge variant={Math.abs(totalShare - 100) < 0.1 ? "default" : "secondary"} className="text-sm">
            Share: {totalShare.toFixed(1)}%
          </Badge>
        </div>
        <Button onClick={addLine} size="sm" className="hover-scale">
          <Plus className="w-4 h-4 mr-2" />Adicionar Linha
        </Button>
      </div>

      {/* Main Table */}
      <div className="border rounded-lg overflow-hidden glass-card">
        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-[130px]">Plataforma</TableHead>
                  <TableHead className="w-[110px]">Formato</TableHead>
                  <TableHead className="w-[100px]">Objetivo</TableHead>
                  <TableHead className="w-[110px]">% / R$</TableHead>
                  <TableHead className="w-[80px]">KPI</TableHead>
                  <TableHead className="w-[90px]">Val. Unit.</TableHead>
                  {monthlyBudgets.map((mb) => (
                    <TableHead key={`${mb.year}-${mb.month}`} className="w-[80px] text-center">
                      {mb.shortLabel}
                    </TableHead>
                  ))}
                  <TableHead className="w-[90px]">TOTAL</TableHead>
                  <TableHead className="w-[90px]">Result. Est.</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10 + monthlyBudgets.length} className="text-center py-8 text-muted-foreground">
                      Nenhuma linha adicionada. Clique em "Adicionar Linha" para começar.
                    </TableCell>
                  </TableRow>
                ) : (
                  <SortableContext items={lines.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                    {lines.map((line) => (
                      <SortableRow key={line.id} line={line}>
                        <TableCell>
                          <CreatableSelect value={line.platform} options={platforms}
                            onValueChange={(v) => updateLine(line.id, "platform", v)}
                            onCreateOption={handleCreatePlatform} placeholder="..." className="w-[120px]" />
                        </TableCell>
                        <TableCell>
                          <CreatableSelect value={line.format} options={formats}
                            onValueChange={(v) => updateLine(line.id, "format", v)}
                            onCreateOption={handleCreateFormat} placeholder="..." className="w-[100px]" />
                        </TableCell>
                        <TableCell>
                          <CreatableSelect value={line.objective} options={objectives}
                            onValueChange={(v) => updateLine(line.id, "objective", v)}
                            onCreateOption={handleCreateObjective} placeholder="..." className="w-[90px]" />
                        </TableCell>
                        {/* % / R$ toggle cell */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-8 p-0 text-xs font-semibold shrink-0"
                              title={line.inputMode === "percentage" ? "Alternar para R$" : "Alternar para %"}
                              onClick={() => toggleLineInputMode(line.id)}
                            >
                              {line.inputMode === "percentage" ? "%" : "R$"}
                            </Button>
                            <Input
                              type="number"
                              step={line.inputMode === "percentage" ? "0.1" : "100"}
                              value={
                                line.inputMode === "percentage"
                                  ? (line.share || "")
                                  : (line.amount || "")
                              }
                              onChange={(e) => updateShareOrAmount(line.id, parseFloat(e.target.value) || 0)}
                              placeholder={line.inputMode === "percentage" ? "0" : "0,00"}
                              className="h-7 text-sm w-16"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select value={line.kpi} onValueChange={(v) => updateLine(line.id, "kpi", v)}>
                            <SelectTrigger className="h-8 text-sm w-[70px]"><SelectValue placeholder="..." /></SelectTrigger>
                            <SelectContent>
                              {kpiOptions.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" value={line.unitValue || ""}
                            onChange={(e) => updateLine(line.id, "unitValue", parseFloat(e.target.value) || 0)}
                            placeholder="0,00" className="h-8 text-sm w-[80px]" />
                        </TableCell>
                        {monthlyBudgets.map((mb) => (
                          <TableCell key={`${line.id}-${mb.year}-${mb.month}`} className="text-center">
                            <span className="text-sm text-muted-foreground">
                              {formatCurrency(getLineMonthValue(line, mb))}
                            </span>
                          </TableCell>
                        ))}
                        <TableCell>
                          <span className="text-sm font-medium">{formatCurrency(getEffectiveLineBudget(line))}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium text-primary">{formatNumber(line.estimatedResults ?? 0)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-foreground"
                              title="Duplicar linha"
                              onClick={() => duplicateLine(line.id)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => removeLine(line.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </SortableRow>
                    ))}
                  </SortableContext>
                )}
                {lines.length > 0 && (
                  <TableRow className="bg-muted/30 font-semibold border-t-2">
                    <TableCell></TableCell>
                    <TableCell colSpan={3} className="text-right pr-4">
                      <span className="text-foreground">TOTAL</span>
                    </TableCell>
                    <TableCell><span className="text-foreground">{totalShare.toFixed(1)}%</span></TableCell>
                    <TableCell colSpan={2}></TableCell>
                    {monthlyBudgets.map((mb) => (
                      <TableCell key={`total-${mb.year}-${mb.month}`} className="text-center">
                        <span className="text-sm font-medium">{formatCurrency(getMonthTotal(mb))}</span>
                      </TableCell>
                    ))}
                    <TableCell>
                      <span className="text-primary font-bold">{formatCurrency(totalLineBudget)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-primary font-medium">{formatNumber(totalResults)}</span>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </div>

      {/* Observations */}
      <div className="space-y-2">
        <Label htmlFor="observations" className="text-sm text-muted-foreground">
          📝 Observações (opcional)
        </Label>
        <Textarea
          id="observations" value={observations}
          onChange={(e) => onObservationsChange(e.target.value)}
          placeholder="Informações complementares sobre o planejamento..."
          className="min-h-[80px] resize-y"
        />
      </div>
    </div>
  );
}
