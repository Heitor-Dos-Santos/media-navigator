import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft, DollarSign, FileText, TrendingUp, TrendingDown, Calendar,
  BarChart3, Target, AlertTriangle, CheckCircle2, Clock, Layers,
  ExternalLink, ChevronRight,
} from "lucide-react";
import { Client, DEFAULT_REBATE_TIERS, RebateTier, getClientRebateTier, AgencySettings } from "@/types/client";
import { PIData } from "@/components/pi/PIForm";
import type { PlanDataV2 } from "@/types/planningV2";
import { supabase } from "@/integrations/supabase/client";
import type { PlanningLine } from "@/components/planning/PlanningTable";

interface TimelineEvent {
  id: string;
  date: string;
  type: "plan_created" | "plan_approved" | "pi_emitted" | "pi_invoiced" | "pi_cancelled" | "client_created";
  title: string;
  description?: string;
}

type PlanStatus = "rascunho" | "pendente" | "aprovado" | "reprovado" | "cancelado";

const PIPELINE_COLUMNS: { status: PlanStatus; label: string; color: string; bg: string; dot: string }[] = [
  { status: "rascunho",  label: "Rascunho",  color: "text-muted-foreground", bg: "bg-muted/40",        dot: "bg-muted-foreground" },
  { status: "pendente",  label: "Pendente",  color: "text-yellow-600",       bg: "bg-yellow-50/60 dark:bg-yellow-950/30",  dot: "bg-yellow-500" },
  { status: "aprovado",  label: "Aprovado",  color: "text-green-600",        bg: "bg-green-50/60 dark:bg-green-950/30",   dot: "bg-green-500" },
  { status: "reprovado", label: "Reprovado", color: "text-destructive",      bg: "bg-destructive/5",    dot: "bg-destructive" },
  { status: "cancelado", label: "Cancelado", color: "text-muted-foreground", bg: "bg-muted/20",         dot: "bg-muted-foreground/40" },
];

function rowToPlan(row: Record<string, unknown>): PlanDataV2 {
  const scenarios = (row.scenarios as PlanDataV2["scenarios"]) ?? [];
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
    activeScenarioId: (row.active_scenario_id as string) ?? scenarios?.[0]?.id ?? "",
    taxonomy: (row.taxonomy as string) ?? "",
    monthlyBudgets: [],
    observations: "",
    companyLogo: null,
  };
}

function getPlanBudget(plan: PlanDataV2): number {
  if (plan.scenarios && plan.scenarios.length > 0) {
    const active = plan.scenarios.find((s) => s.id === plan.activeScenarioId) ?? plan.scenarios[0];
    return active?.totalBudget ?? plan.totalBudget ?? 0;
  }
  return plan.totalBudget ?? 0;
}

function getPlanScenarioCount(plan: PlanDataV2): number {
  return plan.scenarios?.length ?? 1;
}

function getPlanPeriod(plan: PlanDataV2): string {
  const s = plan.scenarios?.find((sc) => sc.id === plan.activeScenarioId) ?? plan.scenarios?.[0];
  const start = s?.periodStart || plan.periodStart;
  const end   = s?.periodEnd   || plan.periodEnd;
  if (!start && !end) return "—";
  const fmt = (d: string) => d ? new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { month: "short", year: "numeric" }) : "";
  return [fmt(start), fmt(end)].filter(Boolean).join(" → ");
}

export default function ClientDetail() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [pis, setPis] = useState<PIData[]>([]);
  const [plans, setPlans] = useState<PlanDataV2[]>([]);
  const [rebateTiers, setRebateTiers] = useState<RebateTier[]>(DEFAULT_REBATE_TIERS);

  useEffect(() => {
    if (!clientId) return;

    // Load agency rebate tiers
    const agencyRaw = localStorage.getItem("agencySettings");
    if (agencyRaw) {
      try {
        const agency: AgencySettings = JSON.parse(agencyRaw);
        if (agency.rebateTiers?.length) setRebateTiers(agency.rebateTiers);
      } catch {}
    }

    // Load PIs from localStorage (not yet migrated)
    const storedPIs: PIData[] = JSON.parse(localStorage.getItem("insertion-orders") || "[]");

    // Fetch client from DB
    supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          setClient(null);
          return;
        }
        const c: Client = {
          id: data.id,
          companyName: data.company_name,
          tradeName: data.trade_name ?? "",
          cnpj: data.cnpj,
          stateRegistration: data.state_registration ?? "",
          municipalRegistration: data.municipal_registration ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zipCode: data.zip_code ?? "",
          country: data.country ?? "Brasil",
          contactName: data.contact_name ?? "",
          contactEmail: data.contact_email ?? "",
          contactPhone: data.contact_phone ?? "",
          notes: data.notes ?? "",
          rebateTiers: data.rebate_tiers ? (data.rebate_tiers as unknown as Client["rebateTiers"]) : undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        setClient(c);

        // Filter PIs by client name/cnpj
        const names = [c.companyName, c.tradeName].filter(Boolean).map((n) => n!.toLowerCase());
        const clientPIs = storedPIs.filter(
          (pi) =>
            names.includes((pi.clientCompany || "").toLowerCase()) ||
            (c.cnpj && pi.clientCNPJ === c.cnpj)
        );
        setPis(clientPIs);

        // Fetch plans from DB — by client_id (registered) or by name (prospect match)
        supabase
          .from("media_plans")
          .select("*")
          .or(`client_id.eq.${clientId},client.ilike.${c.companyName},client.ilike.${c.tradeName ?? ""}`)
          .order("created_at", { ascending: false })
          .then(({ data: planRows }) => {
            if (planRows) setPlans(planRows.map(rowToPlan));
          });
      });
  }, [clientId]);

  const metrics = useMemo(() => {
    const totalInvoiced    = pis.reduce((s, pi) => s + (pi.invoicedValue || 0), 0);
    const totalMedia       = pis.reduce((s, pi) => s + (pi.totalMedia || 0), 0);
    const totalCommission  = pis.reduce((s, pi) => s + (pi.negotiatedDiscountValue || 0), 0);
    const activePIs        = pis.filter((pi) => pi.status !== "cancelado").length;
    const cancelledPIs     = pis.filter((pi) => pi.status === "cancelado").length;
    const invoicedPIs      = pis.filter((pi) => pi.status === "faturado").length;
    const avgTicket        = activePIs > 0 ? totalInvoiced / activePIs : 0;
    const profitabilityIdx = totalMedia > 0 ? (totalCommission / totalMedia) * 100 : 0;
    const cancelRate       = pis.length > 0 ? (cancelledPIs / pis.length) * 100 : 0;
    const approvedPlans    = plans.filter((p) => p.status === "aprovado").length;
    const planApprovalRate = plans.length > 0 ? (approvedPlans / plans.length) * 100 : 0;
    const effectiveTiers   = client?.rebateTiers?.length ? client.rebateTiers : rebateTiers;
    const rebateResult     = getClientRebateTier(totalInvoiced, effectiveTiers);
    return {
      totalInvoiced, totalMedia, totalCommission, activePIs, cancelledPIs,
      invoicedPIs, avgTicket, profitabilityIndex: profitabilityIdx, cancelRate,
      totalPlans: plans.length, approvedPlans, planApprovalRate,
      rebateCommission: rebateResult?.commission || 0,
      rebateTierLabel: rebateResult?.tier.label || "-",
      rebatePercentage: rebateResult?.tier.percentage || 0,
    };
  }, [pis, plans, rebateTiers, client]);

  const timeline = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    if (client)
      events.push({
        id: `client-created-${client.id}`,
        date: client.createdAt,
        type: "client_created",
        title: "Cliente cadastrado",
        description: client.tradeName || client.companyName,
      });
    plans.forEach((plan) => {
      events.push({
        id: `plan-${plan.id}`,
        date: plan.scenarios?.[0]?.periodStart || new Date().toISOString(),
        type: plan.status === "aprovado" ? "plan_approved" : "plan_created",
        title: `Plano: ${plan.campaign}`,
        description: `Status: ${plan.status} · R$ ${getPlanBudget(plan).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`,
      });
    });
    pis.forEach((pi) => {
      let type: TimelineEvent["type"] = "pi_emitted";
      if (pi.status === "faturado") type = "pi_invoiced";
      if (pi.status === "cancelado") type = "pi_cancelled";
      events.push({
        id: `pi-${pi.id}`,
        date: pi.createdAt,
        type,
        title: `PI ${pi.piNumber}`,
        description: `${pi.campaignName} · R$ ${(pi.invoicedValue || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      });
    });
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [client, pis, plans]);

  const plansByStatus = useMemo(() => {
    const map: Record<PlanStatus, PlanDataV2[]> = {
      rascunho: [], pendente: [], aprovado: [], reprovado: [], cancelado: [],
    };
    plans.forEach((p) => {
      const s = (p.status as PlanStatus) ?? "rascunho";
      if (map[s]) map[s].push(p);
    });
    return map;
  }, [plans]);

  const formatCurrency = (v: number) =>
    `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      aguard_fat: { label: "Aguard. Faturamento", variant: "outline" },
      faturado:   { label: "Faturado",             variant: "default" },
      cancelado:  { label: "Cancelado",            variant: "destructive" },
    };
    const s = map[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getTimelineIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "client_created": return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case "plan_created":   return <FileText className="w-4 h-4 text-muted-foreground" />;
      case "plan_approved":  return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pi_emitted":     return <Clock className="w-4 h-4 text-yellow-500" />;
      case "pi_invoiced":    return <DollarSign className="w-4 h-4 text-green-500" />;
      case "pi_cancelled":   return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  if (!client)
    return (
      <AppLayout>
        <div className="p-6">
          <Button variant="ghost" onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <p className="mt-4 text-muted-foreground">Cliente não encontrado.</p>
        </div>
      </AppLayout>
    );

  const profitColor =
    metrics.profitabilityIndex >= 15
      ? "text-green-500"
      : metrics.profitabilityIndex >= 8
      ? "text-yellow-500"
      : "text-destructive";

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.tradeName || client.companyName}</h1>
            <p className="text-muted-foreground text-sm">{client.companyName} · CNPJ: {client.cnpj}</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><DollarSign className="w-4 h-4" /> Total Faturado</div><div className="text-xl font-bold mt-1">{formatCurrency(metrics.totalInvoiced)}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><BarChart3 className="w-4 h-4" /> Total Mídia</div><div className="text-xl font-bold mt-1">{formatCurrency(metrics.totalMedia)}</div></CardContent></Card>
          <Card className="border-primary/30 bg-primary/5"><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="w-4 h-4" /> Comissão (Rebate)</div><div className="text-xl font-bold mt-1 text-primary">{formatCurrency(metrics.rebateCommission)}</div><div className="text-xs text-muted-foreground mt-1">{metrics.rebateTierLabel} · {metrics.rebatePercentage}%</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><Target className="w-4 h-4" /> Ticket Médio</div><div className="text-xl font-bold mt-1">{formatCurrency(metrics.avgTicket)}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingUp className="w-4 h-4" /> Rentabilidade</div><div className={`text-xl font-bold mt-1 ${profitColor}`}>{metrics.profitabilityIndex.toFixed(1)}%</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-2 text-sm text-muted-foreground"><TrendingDown className="w-4 h-4" /> Tx. Cancelamento</div><div className={`text-xl font-bold mt-1 ${metrics.cancelRate > 20 ? "text-destructive" : ""}`}>{metrics.cancelRate.toFixed(1)}%</div></CardContent></Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">PIs Emitidos</div><div className="text-2xl font-bold">{pis.length}</div><div className="text-xs text-muted-foreground mt-1">{metrics.invoicedPIs} faturados · {metrics.cancelledPIs} cancelados</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Planos de Mídia</div><div className="text-2xl font-bold">{metrics.totalPlans}</div><div className="text-xs text-muted-foreground mt-1">{metrics.approvedPlans} aprovados</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Taxa de Aprovação</div><div className="text-2xl font-bold">{metrics.planApprovalRate.toFixed(0)}%</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Relacionamento</div><div className="text-2xl font-bold">{Math.max(1, Math.ceil((Date.now() - new Date(client.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))} meses</div></CardContent></Card>
        </div>

        {/* ── Pipeline de Planos ── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="w-5 h-5" /> Pipeline de Planejamentos
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate("/planning")}>
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Ir para Planejamento
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {plans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Layers className="w-10 h-10 opacity-30" />
                <p className="text-sm">Nenhum plano vinculado a este cliente ainda.</p>
                <Button variant="outline" size="sm" onClick={() => navigate("/planning")}>
                  Criar primeiro plano
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {PIPELINE_COLUMNS.map((col) => {
                  const colPlans = plansByStatus[col.status];
                  return (
                    <div key={col.status} className="flex flex-col gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${col.bg}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wide ${col.color}`}>
                          {col.label}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground font-medium">
                          {colPlans.length}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 min-h-[60px]">
                        {colPlans.length === 0 ? (
                          <div className="border border-dashed rounded-md px-3 py-4 text-center text-xs text-muted-foreground/50">
                            vazio
                          </div>
                        ) : (
                          colPlans.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => navigate("/planning")}
                              className="text-left rounded-md border bg-card hover:bg-accent/50 transition-colors p-3 group w-full"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <p className="text-xs font-semibold line-clamp-2 leading-snug flex-1">
                                  {plan.campaign || "Sem nome"}
                                </p>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground flex-shrink-0 mt-0.5" />
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                                {formatCurrency(getPlanBudget(plan))}
                              </p>
                              {getPlanScenarioCount(plan) > 1 && (
                                <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5 font-medium">
                                  <Layers className="w-2.5 h-2.5" />
                                  {getPlanScenarioCount(plan)} cenários
                                </span>
                              )}
                              <p className="text-[10px] text-muted-foreground/70 mt-1.5">
                                {getPlanPeriod(plan)}
                              </p>
                              <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                {plan.year}{plan.quarter ? ` · ${plan.quarter}` : ""}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* PIs + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5" /> Histórico de PIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PI</TableHead>
                        <TableHead>Campanha</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Faturado</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pis.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            Nenhum PI emitido para este cliente.
                          </TableCell>
                        </TableRow>
                      ) : (
                        pis.map((pi) => (
                          <TableRow key={pi.id}>
                            <TableCell className="font-mono text-sm">{pi.piNumber}</TableCell>
                            <TableCell>{pi.campaignName}</TableCell>
                            <TableCell>{getStatusBadge(pi.status)}</TableCell>
                            <TableCell>{formatCurrency(pi.invoicedValue || 0)}</TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                              {new Date(pi.createdAt).toLocaleDateString("pt-BR")}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {timeline.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Sem eventos registrados.</p>
                ) : (
                  timeline.map((event) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="mt-0.5 flex-shrink-0">{getTimelineIcon(event.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{event.description}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                          {new Date(event.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
