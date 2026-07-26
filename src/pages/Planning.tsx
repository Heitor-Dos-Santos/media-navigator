import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { PlanningTable, type PlanningLine } from "@/components/planning/PlanningTable";
import { ExportOptions } from "@/components/planning/ExportOptions";
import { PlanningBacklog } from "@/components/planning/PlanningBacklog";
import { MediaCalculator } from "@/components/planning/MediaCalculator";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";
import type { PlanDataV2, PlanScenario, PlanStatus } from "@/types/planningV2";
import type { Client } from "@/types/client";
import {
  Building2, Megaphone, Calculator, Table2, History, Plus, Save, FileText,
  ChevronsUpDown, Check, Copy, Pencil, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const toTitleCase = (str: string): string => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

const makeScenario = (name: string): PlanScenario => ({
  id: crypto.randomUUID(),
  name,
  totalBudget: 0,
  periodStart: "",
  periodEnd: "",
  monthlyBudgets: [],
  lines: [],
  observations: "",
});

// --- DB mapping helpers ---
function rowToPlan(row: Record<string, unknown>): PlanDataV2 {
  const scenarios = (row.scenarios as PlanScenario[]) ?? [];
  return {
    id: row.id as string,
    client: (row.client as string) ?? "",
    campaign: (row.campaign as string) ?? "",
    year: (row.year as string) ?? "",
    quarter: (row.quarter as string) ?? "",
    status: (row.status as string) ?? "rascunho",
    totalBudget: (row.total_budget as number) ?? 0,
    periodStart: (row.period_start as string) ?? "",
    periodEnd: (row.period_end as string) ?? "",
    lines: (row.lines as PlanningLine[]) ?? [],
    scenarios,
    activeScenarioId: (row.active_scenario_id as string) ?? scenarios[0]?.id ?? "",
    taxonomy: (row.taxonomy as string) ?? "",
    monthlyBudgets: [],
    observations: "",
    companyLogo: null,
  };
}

function planToRow(plan: PlanDataV2, clientId?: string | null) {
  return {
    id: plan.id,
    client: plan.client,
    client_id: clientId ?? null,
    campaign: plan.campaign,
    taxonomy: plan.taxonomy,
    year: plan.year,
    quarter: plan.quarter,
    status: plan.status ?? "rascunho",
    total_budget: plan.totalBudget ?? 0,
    period_start: plan.periodStart ?? "",
    period_end: plan.periodEnd ?? "",
    lines: JSON.stringify(plan.lines ?? []),
    scenarios: JSON.stringify(plan.scenarios ?? []),
    active_scenario_id: plan.activeScenarioId ?? null,
  };
}

export default function Planning() {
  const [activeTab, setActiveTab] = useState("table");
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false);

  const [currentPlanId, setCurrentPlanId] = useState<string>(() => crypto.randomUUID());
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [quarter, setQuarter] = useState("");
  const [client, setClient] = useState("");
  const [campaign, setCampaign] = useState("");

  const [scenarios, setScenarios] = useState<PlanScenario[]>(() => [makeScenario("Cenário A")]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("");
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(null);
  const [editingScenarioName, setEditingScenarioName] = useState("");

  useEffect(() => {
    setActiveScenarioId((prev) => prev || scenarios[0]?.id || "");
  }, []);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0];

  const updateScenario = useCallback((patch: Partial<PlanScenario>) => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === activeScenarioId ? { ...s, ...patch } : s))
    );
  }, [activeScenarioId]);

  const [savedPlans, setSavedPlans] = useState<PlanDataV2[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved plans and clients from DB
  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from("media_plans")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setSavedPlans(data.map(rowToPlan));
  }, []);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("clients").select("id, company_name, trade_name").order("company_name");
    if (data) {
      setClients(
        data.map((r) => ({
          id: r.id,
          companyName: r.company_name,
          tradeName: r.trade_name ?? "",
          cnpj: "",
          address: "", city: "", state: "", country: "Brasil",
          contactName: "", contactEmail: "", contactPhone: "",
          createdAt: "", updatedAt: "",
        }))
      );
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchClients();
  }, [fetchPlans, fetchClients]);

  const getAgencyData = () => {
    const s = localStorage.getItem("mediahub_agency");
    if (!s) return { logo: null, brandColor: null };
    try {
      const parsed = JSON.parse(s);
      return { logo: parsed.logo || null, brandColor: parsed.brandColor || null };
    } catch { return { logo: null, brandColor: null }; }
  };

  const taxonomyParts = [
    year || "Ano",
    quarter || "Quarter",
    toTitleCase(client) || "Cliente",
    (toTitleCase(campaign) || "Campanha") + " - PMD",
  ];
  const taxonomyPreview = taxonomyParts.join(" - ");

  const buildCurrentPlan = useCallback((): PlanDataV2 => {
    const s = activeScenario;
    return {
      id: currentPlanId,
      status: "rascunho",
      client,
      campaign,
      year,
      quarter,
      periodStart: s?.periodStart ?? "",
      periodEnd: s?.periodEnd ?? "",
      totalBudget: s?.totalBudget ?? 0,
      companyLogo: getAgencyData().logo,
      monthlyBudgets: s?.monthlyBudgets ?? [],
      lines: s?.lines ?? [],
      observations: s?.observations ?? "",
      taxonomy: taxonomyPreview,
      scenarios,
      activeScenarioId,
    };
  }, [currentPlanId, client, campaign, year, quarter, scenarios, activeScenarioId, taxonomyPreview, activeScenario]);

  // Resolve client_id from registered clients
  const resolveClientId = useCallback((): string | null => {
    const match = clients.find(
      (c) =>
        (c.tradeName || "").toLowerCase() === client.toLowerCase() ||
        c.companyName.toLowerCase() === client.toLowerCase()
    );
    return match?.id ?? null;
  }, [clients, client]);

  // Upsert plan to DB
  const upsertPlan = useCallback(async (plan: PlanDataV2, showToast?: string) => {
    const clientId = resolveClientId();
    const row = planToRow(plan, clientId);

    // Check if exists
    const { data: existing } = await supabase
      .from("media_plans")
      .select("id")
      .eq("id", plan.id)
      .maybeSingle();

    let error;
    if (existing) {
      const { error: e } = await supabase
        .from("media_plans")
        .update(row)
        .eq("id", plan.id);
      error = e;
    } else {
      const { error: e } = await supabase
        .from("media_plans")
        .insert(row as any);
      error = e;
    }

    if (error) {
      toast.error("Erro ao salvar planejamento");
      return false;
    }
    if (showToast) toast.success(showToast);
    setLastAutoSave(new Date().toLocaleTimeString("pt-BR"));
    await fetchPlans();
    return true;
  }, [resolveClientId, fetchPlans]);

  // Auto-save
  const performAutoSave = useCallback(() => {
    if (!client) return;
    const plan = buildCurrentPlan();
    upsertPlan(plan);
    setIsEditing(true);
  }, [buildCurrentPlan, client, upsertPlan]);

  useEffect(() => {
    if (!client) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => performAutoSave(), 3000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [client, campaign, year, quarter, scenarios, performAutoSave]);

  const handleSave = async () => {
    if (!client.trim()) { toast.error("Informe o cliente ou prospect antes de salvar"); return; }
    const plan = buildCurrentPlan();
    const ok = await upsertPlan(plan, isEditing ? "Planejamento atualizado!" : "Planejamento salvo no backlog!");
    if (ok) setIsEditing(true);
  };

  const handleNew = () => {
    const firstScenario = makeScenario("Cenário A");
    setCurrentPlanId(crypto.randomUUID());
    setYear(new Date().getFullYear().toString());
    setQuarter(""); setClient(""); setCampaign("");
    setScenarios([firstScenario]);
    setActiveScenarioId(firstScenario.id);
    setIsEditing(false); setActiveTab("table");
    toast.info("Novo planejamento iniciado");
  };

  const handleEdit = (plan: PlanDataV2) => {
    setCurrentPlanId(plan.id);
    setYear(plan.year); setQuarter(plan.quarter);
    setClient(plan.client); setCampaign(plan.campaign);

    if (plan.scenarios && plan.scenarios.length > 0) {
      const migrated = plan.scenarios.map((s) => ({
        ...s,
        totalBudget: s.totalBudget ?? plan.totalBudget ?? 0,
      }));
      setScenarios(migrated);
      setActiveScenarioId(plan.activeScenarioId ?? migrated[0].id);
    } else {
      const legacyScenario: PlanScenario = {
        id: crypto.randomUUID(),
        name: "Cenário A",
        totalBudget: plan.totalBudget,
        periodStart: plan.periodStart,
        periodEnd: plan.periodEnd,
        monthlyBudgets: plan.monthlyBudgets,
        lines: plan.lines,
        observations: plan.observations,
      };
      setScenarios([legacyScenario]);
      setActiveScenarioId(legacyScenario.id);
    }

    setIsEditing(true); setActiveTab("table");
    toast.info(`Editando: ${plan.taxonomy}`);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("media_plans").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir planejamento"); return; }
    toast.success("Planejamento excluído");
    fetchPlans();
  };

  const handleStatusChange = async (id: string, status: PlanStatus) => {
    const { error } = await supabase
      .from("media_plans")
      .update({ status })
      .eq("id", id);
    if (error) { toast.error("Erro ao atualizar status"); return; }
    toast.success(`Status atualizado para "${status}"`);
    fetchPlans();
  };

  // --- Scenario management ---
  const addScenario = () => {
    const letter = String.fromCharCode(65 + scenarios.length);
    const s = makeScenario(`Cenário ${letter}`);
    setScenarios((prev) => [...prev, s]);
    setActiveScenarioId(s.id);
  };

  const duplicateScenario = (id: string) => {
    const source = scenarios.find((s) => s.id === id);
    if (!source) return;
    const copy: PlanScenario = {
      ...source,
      id: crypto.randomUUID(),
      name: `${source.name} (cópia)`,
      lines: source.lines.map((l) => ({ ...l, id: crypto.randomUUID() })),
    };
    setScenarios((prev) => [...prev, copy]);
    setActiveScenarioId(copy.id);
    toast.success(`Cenário duplicado como "${copy.name}"`);
  };

  const removeScenario = (id: string) => {
    if (scenarios.length <= 1) { toast.error("O plano precisa ter ao menos um cenário"); return; }
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeScenarioId === id) setActiveScenarioId(next[0].id);
      return next;
    });
  };

  const startRenameScenario = (id: string, name: string) => {
    setEditingScenarioId(id);
    setEditingScenarioName(name);
  };

  const commitRenameScenario = () => {
    if (!editingScenarioId) return;
    setScenarios((prev) =>
      prev.map((s) => s.id === editingScenarioId ? { ...s, name: editingScenarioName || s.name } : s)
    );
    setEditingScenarioId(null);
  };

  const clientOptions = clients.map((c) => ({
    value: c.tradeName || c.companyName,
    label: c.tradeName || c.companyName,
  }));
  const [clientSearch, setClientSearch] = useState("");
  const filteredClientOptions = clientOptions.filter((o) =>
    o.label.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between animate-slide-up">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Planejamento de Mídia</h1>
              <PageInfoTooltip description="Calcule métricas, organize linhas de campanha e exporte." />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Calcule métricas, organize linhas de campanha e exporte</span>
              {lastAutoSave && (
                <Badge variant="outline" className="text-xs">Auto-salvo às {lastAutoSave}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
              <FileText className="w-3.5 h-3.5" />
              {isEditing ? "Editando" : "Rascunho"}
            </Badge>
            <Button variant="outline" onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />Novo
            </Button>
            <ExportOptions
              lines={activeScenario?.lines ?? []}
              client={client}
              campaign={campaign}
              logo={getAgencyData().logo}
              brandColor={getAgencyData().brandColor}
              year={year}
              quarter={quarter}
              periodStart={activeScenario?.periodStart ?? ""}
              periodEnd={activeScenario?.periodEnd ?? ""}
              monthlyBudgets={activeScenario?.monthlyBudgets ?? []}
              totalBudget={activeScenario?.totalBudget ?? 0}
              observations={activeScenario?.observations ?? ""}
              taxonomy={taxonomyPreview}
            />
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />{isEditing ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="px-6 space-y-6">
          {/* Identification */}
          <Card className="glass-card animate-slide-up delay-100">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Identificação do Planejamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">📅 Ano</Label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027, 2028].map((y) => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">📊 Quarter</Label>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger><SelectValue placeholder="Quarter" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Client combobox */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="w-3 h-3" />Cliente / Prospect
                  </Label>
                  <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={clientPopoverOpen}
                        className="w-full justify-between font-normal h-9 text-sm"
                      >
                        <span className={cn("truncate", !client && "text-muted-foreground")}>
                          {client || "Cliente ou prospect..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[240px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Buscar ou digitar nome..."
                          value={clientSearch}
                          onValueChange={setClientSearch}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {clientSearch.trim() ? (
                              <button
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent rounded"
                                onClick={() => {
                                  setClient(clientSearch.trim());
                                  setClientSearch("");
                                  setClientPopoverOpen(false);
                                }}
                              >
                                Usar "<strong>{clientSearch.trim()}</strong>" como prospect
                              </button>
                            ) : (
                              <p className="text-xs text-muted-foreground px-3 py-2">Nenhum cliente encontrado.</p>
                            )}
                          </CommandEmpty>
                          {filteredClientOptions.length > 0 && (
                            <CommandGroup heading="Clientes cadastrados">
                              {filteredClientOptions.map((opt) => (
                                <CommandItem
                                  key={opt.value}
                                  value={opt.value}
                                  onSelect={(val) => {
                                    setClient(val);
                                    setClientSearch("");
                                    setClientPopoverOpen(false);
                                  }}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", client === opt.value ? "opacity-100" : "opacity-0")} />
                                  {opt.label}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                          {clientSearch.trim() && filteredClientOptions.length > 0 && (
                            <CommandGroup heading="Prospect">
                              <CommandItem
                                value={`__prospect__${clientSearch.trim()}`}
                                onSelect={() => {
                                  setClient(clientSearch.trim());
                                  setClientSearch("");
                                  setClientPopoverOpen(false);
                                }}
                              >
                                <Plus className="mr-2 h-4 w-4" />
                                Usar "{clientSearch.trim()}" como prospect
                              </CommandItem>
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Megaphone className="w-3 h-3" />Campanha
                  </Label>
                  <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="Nome da campanha" />
                </div>
              </div>

              {/* Taxonomy Preview */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">📋 Preview Taxonomia:</Label>
                  <Badge variant="outline" className="font-mono text-sm px-3 py-1">{taxonomyPreview}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up delay-200">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table2 className="w-4 h-4" />Planejamento
              </TabsTrigger>
              <TabsTrigger value="calculator" className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />Calculadora
              </TabsTrigger>
              <TabsTrigger value="backlog" className="flex items-center gap-2">
                <History className="w-4 h-4" />Backlog
              </TabsTrigger>
            </TabsList>

            <TabsContent value="table" className="mt-6">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Linhas de Campanha</CardTitle>
                  </div>

                  {/* Scenario tabs */}
                  <div className="flex items-center gap-1 flex-wrap pt-1">
                    {scenarios.map((s) => (
                      <div key={s.id} className="relative group/stab">
                        {editingScenarioId === s.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              autoFocus
                              value={editingScenarioName}
                              onChange={(e) => setEditingScenarioName(e.target.value)}
                              onBlur={commitRenameScenario}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") commitRenameScenario();
                                if (e.key === "Escape") setEditingScenarioId(null);
                              }}
                              className="h-7 text-xs w-32 px-2"
                            />
                          </div>
                        ) : (
                          <button
                            onClick={() => setActiveScenarioId(s.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
                              s.id === activeScenarioId
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted border-transparent"
                            )}
                          >
                            {s.name}
                            <span className="hidden group-hover/stab:flex items-center gap-0.5 ml-1">
                              <span
                                role="button" tabIndex={0} title="Renomear"
                                className="p-0.5 rounded hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); startRenameScenario(s.id, s.name); }}
                              >
                                <Pencil className="w-3 h-3" />
                              </span>
                              <span
                                role="button" tabIndex={0} title="Duplicar cenário"
                                className="p-0.5 rounded hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); duplicateScenario(s.id); }}
                              >
                                <Copy className="w-3 h-3" />
                              </span>
                              {scenarios.length > 1 && (
                                <span
                                  role="button" tabIndex={0} title="Remover cenário"
                                  className="p-0.5 rounded hover:bg-destructive/20 text-destructive"
                                  onClick={(e) => { e.stopPropagation(); removeScenario(s.id); }}
                                >
                                  <X className="w-3 h-3" />
                                </span>
                              )}
                            </span>
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="ghost" size="sm"
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                      onClick={addScenario}
                      title="Adicionar novo cenário"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />Cenário
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeScenario && (
                    <PlanningTable
                      key={activeScenario.id}
                      lines={activeScenario.lines}
                      onLinesChange={(l) => updateScenario({ lines: l })}
                      totalBudget={activeScenario.totalBudget}
                      onTotalBudgetChange={(v) => updateScenario({ totalBudget: v })}
                      periodStart={activeScenario.periodStart}
                      periodEnd={activeScenario.periodEnd}
                      onPeriodStartChange={(v) => updateScenario({ periodStart: v })}
                      onPeriodEndChange={(v) => updateScenario({ periodEnd: v })}
                      monthlyBudgets={activeScenario.monthlyBudgets}
                      onMonthlyBudgetsChange={(b) => updateScenario({ monthlyBudgets: b })}
                      observations={activeScenario.observations}
                      onObservationsChange={(o) => updateScenario({ observations: o })}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="mt-6">
              <MediaCalculator />
            </TabsContent>

            <TabsContent value="backlog" className="mt-6">
              <PlanningBacklog
                plans={savedPlans}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
