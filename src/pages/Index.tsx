import { AppLayout } from "@/components/layout/AppLayout";
import { QuickStatsBar } from "@/components/dashboard/QuickStatsBar";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { PingScoreCard } from "@/components/dashboard/PingScoreCard";
import { MBEIScoreCard } from "@/components/dashboard/MBEIScoreCard";
import { generateAlerts, getSeverityMeta } from "@/types/alerts";
import type { CampaignTrendData } from "@/types/efficiency";
import {
  Tags,
  Link2,
  CheckSquare,
  Calculator,
  Image,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockStats = {
  activeCampaigns: 24,
  totalBudget: 450000,
  avgEfficiency: 112,
  alertCount: 3,
  healthyCount: 18,
};

const mockCampaigns = [
  {
    score: 87,
    campaignName: "ACME_Q1_Conversão_Search",
    platform: "Google Ads",
    trend: "up" as const,
    metrics: { delivery: 92, performance: 85, optimization: 78 },
  },
  {
    score: 72,
    campaignName: "ACME_Q1_Awareness_Video",
    platform: "Meta Ads",
    trend: "stable" as const,
    metrics: { delivery: 88, performance: 70, optimization: 65 },
  },
  {
    score: 45,
    campaignName: "ACME_Q1_Retargeting",
    platform: "DV360",
    trend: "down" as const,
    metrics: { delivery: 60, performance: 40, optimization: 35 },
  },
  {
    score: 91,
    campaignName: "ACME_Q1_Leads_Form",
    platform: "LinkedIn",
    trend: "up" as const,
    metrics: { delivery: 95, performance: 90, optimization: 88 },
  },
];

const modules = [
  {
    title: "Taxonomia",
    description: "Padronize naming conventions para campanhas, IOs e criativos",
    href: "/taxonomy",
    icon: Tags,
    stats: { label: "Templates ativos", value: 12 },
    status: "active" as const,
  },
  {
    title: "URLs & UTMs",
    description: "Gere e valide URLs com parâmetros de tracking",
    href: "/urls",
    icon: Link2,
    stats: { label: "URLs geradas", value: "1.2k" },
    status: "active" as const,
  },
  {
    title: "Checklists",
    description: "Acompanhe tarefas pré, durante e pós-campanha",
    href: "/checklists",
    icon: CheckSquare,
    stats: { label: "Pendentes", value: 8 },
    status: "attention" as const,
  },
  {
    title: "Planejamento",
    description: "Calcule orçamentos, CPM, CPA e métricas estimadas",
    href: "/planning",
    icon: Calculator,
    stats: { label: "Planos ativos", value: 5 },
    status: "active" as const,
  },
  {
    title: "Criativos",
    description: "Biblioteca de formatos e validação de specs",
    href: "/creatives",
    icon: Image,
    stats: { label: "Formatos", value: 48 },
    status: "pending" as const,
  },
  {
    title: "Auditoria",
    description: "Avalie a maturidade e governança das contas",
    href: "/audit",
    icon: ShieldCheck,
    stats: { label: "Score médio", value: "78/100" },
    status: "active" as const,
  },
];

export default function Dashboard() {
  const dashboardCampaignTrends: CampaignTrendData[] = [
    { campaignId: "1", campaignName: "ACME_Q1_Conversão_Search", platform: "Google Ads", currentMBEI: 118, avgMBEI7d: 112, momentum: "strong_positive", momentumDelta: 5.4, rollingCPA: 24.5, rollingConversionRate: 0.032, spendVelocity: 0.98, sparklineData: [105, 108, 110, 112, 115, 114, 118] },
    { campaignId: "2", campaignName: "ACME_Q1_Awareness_Video", platform: "Meta Ads", currentMBEI: 102, avgMBEI7d: 104, momentum: "negative", momentumDelta: -1.9, rollingCPA: 38.2, rollingConversionRate: 0.018, spendVelocity: 1.12, sparklineData: [108, 107, 106, 104, 103, 101, 102] },
    { campaignId: "3", campaignName: "ACME_Q1_Retargeting", platform: "DV360", currentMBEI: 78, avgMBEI7d: 82, momentum: "strong_negative", momentumDelta: -5.8, rollingCPA: 52.1, rollingConversionRate: 0.012, spendVelocity: 1.22, sparklineData: [90, 88, 85, 84, 82, 80, 78] },
    { campaignId: "4", campaignName: "ACME_Q1_Leads_Form", platform: "LinkedIn", currentMBEI: 125, avgMBEI7d: 122, momentum: "positive", momentumDelta: 2.5, rollingCPA: 19.8, rollingConversionRate: 0.045, spendVelocity: 0.94, sparklineData: [118, 119, 120, 121, 122, 124, 125] },
    { campaignId: "5", campaignName: "ACME_Q1_Brand_Display", platform: "Google Ads", currentMBEI: 96, avgMBEI7d: 96, momentum: "neutral", momentumDelta: 0.0, rollingCPA: 42.0, rollingConversionRate: 0.021, spendVelocity: 1.01, sparklineData: [95, 97, 96, 95, 96, 97, 96] },
  ];
  const allAlerts = generateAlerts(dashboardCampaignTrends);
  const activeAlerts = allAlerts.filter(a => a.status === "active");
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const riskCampaigns = [...new Set(activeAlerts.filter(a => a.severity === "critical" || a.severity === "high").map(a => a.campaignName))].slice(0, 3);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Dashboard</h1><PageInfoTooltip description="Painel central com visão geral das operações de mídia, KPIs principais, alertas ativos e acesso rápido aos módulos." /></div>
            <p className="text-sm text-muted-foreground">
              Visão geral da operação de mídia
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Insights IA
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStatsBar stats={mockStats} />

        {/* Alert Widgets */}
        {activeAlerts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/alerts" className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-warning/10">
                  <Bell className="w-5 h-5 text-status-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alertas Ativos</p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">{activeAlerts.length}</p>
                </div>
              </div>
            </Link>
            <Link to="/alerts?severity=critical" className="p-4 rounded-xl bg-card border border-border hover:border-status-error/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-status-error/10">
                  <AlertTriangle className="w-5 h-5 text-status-error" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alertas Críticos</p>
                  <p className="text-2xl font-bold text-status-error tabular-nums">{criticalAlerts.length}</p>
                </div>
              </div>
            </Link>
            <div className="p-4 rounded-xl bg-card border border-border">
              <p className="text-xs text-muted-foreground mb-2">Top 3 Campanhas em Risco</p>
              <div className="space-y-1.5">
                {riskCampaigns.map((name, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-error" />
                    <span className="text-sm text-foreground truncate">{name}</span>
                  </div>
                ))}
                {riskCampaigns.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma campanha em risco</p>}
              </div>
            </div>
          </div>
        )}

        {/* Efficiency Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Ping das Campanhas
              </h2>
              <Button variant="ghost" size="sm">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCampaigns.map((campaign, index) => (
                <PingScoreCard key={index} {...campaign} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Eficiência Geral
            </h2>
            <MBEIScoreCard
              input={{ plannedCPA: 30, realCPA: 26.8, plannedBudget: 450000, realSpend: 405000, realConversions: 16800, plannedConversions: 15000 }}
            />
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Módulos Operacionais
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {modules.map((module) => (
              <ModuleCard key={module.title} {...module} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
