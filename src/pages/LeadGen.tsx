import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadGenStatCard } from "@/components/leadgen/LeadGenStatCard";
import { LeadGenTable } from "@/components/leadgen/LeadGenTable";
import { LeadGenIntegrationCard } from "@/components/leadgen/LeadGenIntegrationCard";
import { MetaAdsConfigModal } from "@/components/leadgen/MetaAdsConfigModal";
import { GoogleSheetsConfigModal } from "@/components/leadgen/GoogleSheetsConfigModal";
import { EmailConfigModal } from "@/components/leadgen/EmailConfigModal";
import { EvolutionApiConfigModal } from "@/components/leadgen/EvolutionApiConfigModal";
import { WhatsAppConfigsManager } from "@/components/leadgen/WhatsAppConfigsManager";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";
import {
  Users, Zap, Send, AlertTriangle, Search, Filter, X,
  Facebook, FileSpreadsheet, Mail, MessageCircle,
  LayoutDashboard, List, Settings2, Building2, Plus
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeadStats, useMetaAdsConfig } from "@/hooks/useLeads";
import { useEvolutionApiConfig } from "@/hooks/useEvolutionApiConfig";

type ModalType = "meta_ads" | "google_sheets" | "email_resend" | "evolution_api" | null;

const mockAccounts = [
  { id: "1", name: "Imobiliária Premium", bm: "BM-123456789", campaigns: 4, leads: 1820, status: "active" },
  { id: "2", name: "EduTech Academy", bm: "BM-987654321", campaigns: 3, leads: 1245, status: "active" },
  { id: "3", name: "Loja Virtual Express", bm: "BM-456789123", campaigns: 2, leads: 892, status: "active" },
  { id: "4", name: "FinanceGroup", bm: "BM-321654987", campaigns: 2, leads: 681, status: "paused" },
];

export default function LeadGen() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterCampaign, setFilterCampaign] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openModal, setOpenModal] = useState<ModalType>(null);

  const { data: stats } = useLeadStats();
  const { data: metaConfig } = useMetaAdsConfig();
  const { data: evolutionConfig } = useEvolutionApiConfig();
  const isMetaConnected = metaConfig?.is_active === true;
  const isEvolutionConnected = evolutionConfig?.is_active === true;

  const integrationStatusMap = {
    meta_ads: isMetaConnected ? "connected" : "disconnected",
    google_sheets: "disconnected",
    email_resend: "disconnected",
    evolution_api: isEvolutionConnected ? "connected" : "disconnected",
  } as Record<string, "connected" | "disconnected" | "pending">;

  const hasActiveFilters = filterAccount !== "all" || filterCampaign !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setFilterAccount("all");
    setFilterCampaign("all");
    setFilterStatus("all");
  };


  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">LeadSync</h1>
              <PageInfoTooltip description="Central de captura e gestão de leads das campanhas de Lead Generation no Meta Ads. Integre, visualize e distribua leads automaticamente." />
            </div>
            <p className="text-sm text-muted-foreground">Captura e gestão de leads de campanhas Meta Ads</p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5 text-xs">
              <LayoutDashboard className="w-3.5 h-3.5" />Dashboard
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-1.5 text-xs">
              <List className="w-3.5 h-3.5" />Leads
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-1.5 text-xs">
              <Settings2 className="w-3.5 h-3.5" />Integrações
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5" />Contas
            </TabsTrigger>
          </TabsList>

          {/* Como funciona o fluxo */}
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Como funciona o fluxo?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Conecte o Meta Ads", desc: "Configure o webhook para receber leads em tempo real direto das campanhas de Lead Gen" },
                { step: "2", title: "Configure os destinos", desc: "Escolha para onde enviar cada lead: Google Sheets, Email (Resend) ou WhatsApp (Evolution API)" },
                { step: "3", title: "Automatize", desc: "Cada lead capturado é enviado automaticamente para todos os destinos configurados em segundos" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── DASHBOARD ── */}
          <TabsContent value="dashboard" className="mt-6 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <LeadGenStatCard title="Total de Leads" value={stats ? stats.total.toLocaleString("pt-BR") : "—"} icon={Users} change="Leads capturados" changeType="positive" delay={0} />
              <LeadGenStatCard title="Leads Hoje" value={stats ? stats.today.toString() : "—"} icon={Zap} change="Capturados hoje" changeType="positive" delay={80} />
              <LeadGenStatCard title="Enviados" value={stats ? stats.sent.toLocaleString("pt-BR") : "—"} icon={Send} change={stats && stats.total > 0 ? `${Math.round((stats.sent / stats.total) * 100)}% de taxa` : "—"} changeType="positive" delay={160} />
              <LeadGenStatCard title="Falhas" value={stats ? stats.failed.toString() : "—"} icon={AlertTriangle} change={stats ? `${stats.pending} pendentes de reenvio` : "—"} changeType="negative" delay={240} />
            </div>

            {/* Mini status de integrações */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Status das Integrações</h3>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    const tab = document.querySelector('[value="integrations"]') as HTMLElement;
                    tab?.click();
                  }}
                >
                  Configurar →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {[
                   { name: "Meta Ads", status: integrationStatusMap.meta_ads },
                   { name: "Google Sheets", status: integrationStatusMap.google_sheets },
                   { name: "Email (Resend)", status: integrationStatusMap.email_resend },
                   { name: "Evolution API", status: integrationStatusMap.evolution_api },
                ].map((int, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
                    <p className="text-xs font-medium text-foreground">{int.name}</p>
                    <span className={`inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      int.status === "connected" ? "bg-status-success/10 text-status-success" : "bg-muted text-muted-foreground"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${int.status === "connected" ? "bg-status-success" : "bg-muted-foreground/50"}`} />
                      {int.status === "connected" ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <LeadGenTable compact />
          </TabsContent>

          {/* ── LEADS ── */}
          <TabsContent value="leads" className="mt-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring w-64"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtrar
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-accent" />}
              </button>
            </div>

            {showFilters && (
              <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Filtros</p>
                  {hasActiveFilters && (
                    <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <X className="w-3 h-3" /> Limpar filtros
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Select value={filterAccount} onValueChange={setFilterAccount}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Conta" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as contas</SelectItem>
                      <SelectItem value="Imobiliária Premium">Imobiliária Premium</SelectItem>
                      <SelectItem value="EduTech Academy">EduTech Academy</SelectItem>
                      <SelectItem value="Loja Virtual Express">Loja Virtual Express</SelectItem>
                      <SelectItem value="FinanceGroup">FinanceGroup</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCampaign} onValueChange={setFilterCampaign}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Campanha" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as campanhas</SelectItem>
                      <SelectItem value="Imóveis SP – Lançamento">Imóveis SP – Lançamento</SelectItem>
                      <SelectItem value="Curso Marketing Digital">Curso Marketing Digital</SelectItem>
                      <SelectItem value="Black Friday 2024">Black Friday 2024</SelectItem>
                      <SelectItem value="Consultoria Financeira">Consultoria Financeira</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os status</SelectItem>
                      <SelectItem value="sent">Enviado</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <LeadGenTable
              searchQuery={search}
              filterAccount={filterAccount}
              filterCampaign={filterCampaign}
              filterStatus={filterStatus}
            />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6 space-y-6">
            {/* Grid 4 colunas — todos os cards na mesma linha */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <LeadGenIntegrationCard
                name="Meta Ads"
                description="Receba leads automaticamente via webhooks do Facebook Lead Ads"
                icon={Facebook}
                status={integrationStatusMap.meta_ads}
                delay={0}
                onAction={() => setOpenModal("meta_ads")}
                helpSteps={[
                  "Acesse o Facebook Business Manager e vá até 'Configurações do Negócio'.",
                  "Em 'Integrações' → 'Lead Access', copie o Page Access Token.",
                  "Cole o token no campo da configuração abaixo.",
                  "O sistema gerará uma URL de webhook. Copie-a.",
                  "No Facebook, vá em 'Webhooks' e adicione a URL gerada.",
                  "Selecione o evento 'leadgen' e confirme a inscrição.",
                ]}
              />
              <LeadGenIntegrationCard
                name="Google Sheets"
                description="Envie cada lead para uma planilha Google automaticamente"
                icon={FileSpreadsheet}
                status={integrationStatusMap.google_sheets}
                delay={80}
                onAction={() => setOpenModal("google_sheets")}
                helpSteps={[
                  "Crie uma planilha no Google Sheets (ou use uma existente).",
                  "Copie o ID da planilha (parte da URL entre /d/ e /edit).",
                  "Crie uma Service Account no Google Cloud Console.",
                  "Compartilhe a planilha com o email da Service Account.",
                  "Cole o ID da planilha e o nome da aba no formulário.",
                ]}
              />
              <LeadGenIntegrationCard
                name="Email (Resend)"
                description="Envie notificações por email a cada novo lead capturado"
                icon={Mail}
                status={integrationStatusMap.email_resend}
                delay={160}
                onAction={() => setOpenModal("email_resend")}
                helpSteps={[
                  "Crie uma conta gratuita em resend.com.",
                  "Vá em 'API Keys' e gere uma nova chave.",
                  "A chave de API é configurada nos secrets do projeto.",
                  "No formulário, informe o email remetente e destinatário.",
                  "Cada novo lead enviará um email automático com os dados.",
                ]}
              />
              <LeadGenIntegrationCard
                name="Evolution API"
                description="Gateway WhatsApp para disparo automático de leads via Evolution API"
                icon={MessageCircle}
                status={integrationStatusMap.evolution_api}
                delay={240}
                onAction={() => setOpenModal("evolution_api")}
                helpSteps={[
                  "Tenha um servidor Evolution API (self-hosted ou cloud) disponível.",
                  "Acesse o painel do servidor e copie a URL base (ex: https://evolution.meuservidor.com).",
                  "Gere ou copie a Global API Key nas configurações do servidor.",
                  "Cole as credenciais no formulário ao clicar em Conectar.",
                  "Após conectar, crie as regras de roteamento abaixo vinculando Page IDs / Form IDs a números de destino.",
                ]}
              />
            </div>

            {/* WhatsApp multi-rota manager */}
            <div className="rounded-xl border border-border bg-card p-6">
              <WhatsAppConfigsManager onNeedEvolution={() => setOpenModal("evolution_api")} />
            </div>
          </TabsContent>

          {/* ── CONTAS ── */}
          <TabsContent value="accounts" className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Contas de Anúncios Vinculadas</p>
                <p className="text-xs text-muted-foreground">{mockAccounts.length} contas configuradas</p>
              </div>
              <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Nova Conta
              </button>
            </div>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conta</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Manager</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Campanhas</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Leads</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockAccounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-foreground">{acc.name}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-muted-foreground font-mono">{acc.bm}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-foreground">{acc.campaigns}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-semibold text-foreground">{acc.leads.toLocaleString("pt-BR")}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          acc.status === "active"
                            ? "bg-status-success/10 text-status-success"
                            : "bg-status-warning/10 text-status-warning"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${acc.status === "active" ? "bg-status-success" : "bg-status-warning"}`} />
                          {acc.status === "active" ? "Ativo" : "Pausado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <MetaAdsConfigModal open={openModal === "meta_ads"} onOpenChange={(v) => !v && setOpenModal(null)} />
      <GoogleSheetsConfigModal open={openModal === "google_sheets"} onOpenChange={(v) => !v && setOpenModal(null)} />
      <EmailConfigModal open={openModal === "email_resend"} onOpenChange={(v) => !v && setOpenModal(null)} />
      <EvolutionApiConfigModal
        open={openModal === "evolution_api"}
        onOpenChange={(v) => !v && setOpenModal(null)}
        currentConfig={evolutionConfig}
      />
    </AppLayout>
  );
}
