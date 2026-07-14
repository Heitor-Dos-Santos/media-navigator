import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ISOScoreCard } from "@/components/dashboard/ISOScoreCard";
import { AgencyISOBar } from "@/components/dashboard/AgencyISOBar";
import { CampaignTrendCard } from "@/components/dashboard/CampaignTrendCard";
import { materializeFeatureStore } from "@/lib/featureStoreHub";
import { generateAlerts } from "@/types/alerts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Download, Filter, Sparkles, User, Layers, Activity, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlobalFilterBar, type FilterState } from "@/components/intelligence/GlobalFilterBar";
import { ALL_CAMPAIGNS, type CampaignWithClient } from "@/data/multiClientData";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";
import { isoClassificationMeta, classifyISO } from "@/types/iso";

/* ── Mock Data (replace with real data fetching) ── */

const channelEfficiency = [
  { channel: "Search", efficiency: 125, savings: 18500, status: "high" },
  { channel: "Display", efficiency: 108, savings: 8200, status: "neutral" },
  { channel: "Social", efficiency: 95, savings: -4500, status: "low" },
  { channel: "Video", efficiency: 118, savings: 12800, status: "high" },
  { channel: "Native", efficiency: 102, savings: 2100, status: "neutral" },
];

const teamRanking = [
  { name: "Maria Santos", efficiency: 128, campaigns: 8, avatar: "MS" },
  { name: "João Silva", efficiency: 119, campaigns: 12, avatar: "JS" },
  { name: "Pedro Costa", efficiency: 112, campaigns: 6, avatar: "PC" },
  { name: "Ana Lima", efficiency: 98, campaigns: 10, avatar: "AL" },
  { name: "Carlos Reis", efficiency: 92, campaigns: 5, avatar: "CR" },
];

const aiInsights = [
  { type: "success", title: "Economia identificada", description: "Campanhas de Search com público lookalike geraram 23% mais eficiência que a média." },
  { type: "warning", title: "Oportunidade de otimização", description: "Reduzir frequência em campanhas de retargeting pode economizar R$ 8.500/mês." },
  { type: "insight", title: "Padrão identificado", description: "Criativos em vídeo curto (<15s) convertem 35% melhor no TikTok." },
];

type GroupBy = "none" | "client" | "dsp" | "campaign";

export default function Efficiency() {
  const [filters, setFilters] = useState<FilterState>({ clientId: "all", platform: "all", campaignId: "all", status: "all" });
  const [groupBy, setGroupBy] = useState<GroupBy>("none");
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const filteredCampaigns = useMemo(() => {
    let result: CampaignWithClient[] = ALL_CAMPAIGNS;
    if (filters.clientId !== "all") result = result.filter(c => c.clientId === filters.clientId);
    if (filters.platform !== "all") result = result.filter(c => c.platform === filters.platform);
    if (filters.campaignId !== "all") result = result.filter(c => c.campaignId === filters.campaignId);
    if (filters.status !== "all") result = result.filter(c => c.status === filters.status);
    return result;
  }, [filters]);

  const store = useMemo(() => materializeFeatureStore(filteredCampaigns), [filteredCampaigns]);
  const allAlerts = useMemo(() => generateAlerts(filteredCampaigns), [filteredCampaigns]);
  const agencyData = store.agencyAggregation;
  const iso = store.iso;

  const grouped = useMemo(() => {
    if (groupBy === "none") return { "Todas as Campanhas": filteredCampaigns };
    const map: Record<string, CampaignWithClient[]> = {};
    filteredCampaigns.forEach(c => {
      const key = groupBy === "client" ? c.clientName : groupBy === "dsp" ? c.platform : c.campaignName;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return map;
  }, [filteredCampaigns, groupBy]);

  const toggleGroup = (key: string) => setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Eficiência de Mídia</h1>
              <PageInfoTooltip description="Análise avançada de eficiência de compra de mídia com ISO, momentum e economia real por campanha." />
              <Badge className="bg-primary/10 text-primary border-primary/20">Dashboard Avançado</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Análise de eficiência da compra de mídia e economia real</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
          </div>
        </div>

        {/* Global Filters */}
        <GlobalFilterBar filters={filters} onFiltersChange={setFilters} campaigns={ALL_CAMPAIGNS} />

        {/* Agency-Level ISO Bar */}
        <AgencyISOBar data={agencyData} iso={iso} />

        <div>
          <ISOScoreCard iso={iso} />
        </div>

        {/* Grouping Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Agrupar por:</span>
          <Select value={groupBy} onValueChange={v => setGroupBy(v as GroupBy)}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem agrupamento</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
              <SelectItem value="dsp">DSP / Plataforma</SelectItem>
              <SelectItem value="campaign">Campanha</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs">{filteredCampaigns.length} campanhas</Badge>
        </div>

        {/* Campaign Trends by Group */}
        {Object.entries(grouped).map(([groupLabel, campaigns]) => {
          const isCollapsed = collapsedGroups[groupLabel];
          const groupAvgEff = Math.round(campaigns.reduce((s, c) => s + c.currentMBEI, 0) / campaigns.length);
          const groupClassification = classifyISO(Math.round(groupAvgEff * 100 / 150));

          return (
            <div key={groupLabel} className="space-y-3">
              {groupBy !== "none" && (
                <Collapsible open={!isCollapsed} onOpenChange={() => toggleGroup(groupLabel)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isCollapsed ? <ChevronRight className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      <span className="font-semibold text-foreground">{groupLabel}</span>
                      <Badge variant="outline" className="text-xs">{campaigns.length} campanhas</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Eficiência: <strong className={cn(groupAvgEff >= 100 ? "text-status-success" : groupAvgEff >= 90 ? "text-status-warning" : "text-status-error")}>{groupAvgEff}</strong></span>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-3">
                      {campaigns.map(c => (
                        <CampaignTrendCard key={c.campaignId} campaign={c} alerts={allAlerts.filter(a => a.campaign_id === c.campaignId)} />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {groupBy === "none" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />Trend por Campanha (7 dias)
                    </h2>
                    <Badge variant="outline" className="text-xs">Métricas Contínuas</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {campaigns.map(c => (
                      <CampaignTrendCard key={c.campaignId} campaign={c} alerts={allAlerts.filter(a => a.campaign_id === c.campaignId)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Channel Efficiency */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Eficiência por Canal</h2>
              <Button variant="ghost" size="sm"><Layers className="w-4 h-4 mr-2" />Ver detalhes</Button>
            </div>
            <div className="space-y-4">
              {channelEfficiency.map((channel) => (
                <div key={channel.channel} className="flex items-center gap-4">
                  <span className="w-20 text-sm text-muted-foreground">{channel.channel}</span>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                    <div className={cn("h-full rounded-lg flex items-center justify-end px-3 transition-all", channel.status === "high" && "bg-status-success/20", channel.status === "neutral" && "bg-primary/20", channel.status === "low" && "bg-status-warning/20")} style={{ width: `${Math.min(channel.efficiency, 130)}%` }}>
                      <span className={cn("text-sm font-semibold", channel.status === "high" && "text-status-success", channel.status === "neutral" && "text-primary", channel.status === "low" && "text-status-warning")}>{channel.efficiency}%</span>
                    </div>
                  </div>
                  <span className={cn("w-24 text-sm font-medium text-right", channel.savings >= 0 ? "text-status-success" : "text-status-error")}>{channel.savings >= 0 ? "+" : ""}R$ {Math.abs(channel.savings).toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team & AI */}
        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><User className="w-4 h-4" />Ranking de Eficiência</h2>
              <Badge variant="outline" className="text-xs">Por profissional</Badge>
            </div>
            <div className="space-y-3">
              {teamRanking.map((member, index) => (
                <div key={member.name} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <span className={cn("w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold", index === 0 && "bg-status-success text-background", index === 1 && "bg-primary text-background", index === 2 && "bg-status-warning text-background", index > 2 && "bg-muted text-muted-foreground")}>{index + 1}</span>
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-xs font-medium">{member.avatar}</div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.campaigns} campanhas</p>
                  </div>
                  <span className={cn("text-lg font-bold", member.efficiency >= 110 ? "text-status-success" : member.efficiency >= 100 ? "text-primary" : "text-status-warning")}>{member.efficiency}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Insights da IA</h2>
              <Button variant="ghost" size="sm">Gerar mais</Button>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, index) => (
                <div key={index} className={cn("p-4 rounded-lg border", insight.type === "success" && "bg-status-success/5 border-status-success/20", insight.type === "warning" && "bg-status-warning/5 border-status-warning/20", insight.type === "insight" && "bg-primary/5 border-primary/20")}>
                  <h4 className={cn("font-medium mb-1", insight.type === "success" && "text-status-success", insight.type === "warning" && "text-status-warning", insight.type === "insight" && "text-primary")}>{insight.title}</h4>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
