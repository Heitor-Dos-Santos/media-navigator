import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Calendar, Target, DollarSign, Clock, Download, Eye } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockProposals = [
  { id: "PROP-001", client: "ACME Corp", type: "Proposta de Mídia", status: "draft", createdAt: "2024-01-15", budget: 150000, duration: "6 meses" },
  { id: "PROP-002", client: "TechStart", type: "Plano Tático", status: "sent", createdAt: "2024-01-12", budget: 80000, duration: "3 meses" },
  { id: "PROP-003", client: "GlobalBrand", type: "Proposta de Mídia", status: "approved", createdAt: "2024-01-08", budget: 350000, duration: "12 meses" },
  { id: "PROP-004", client: "LocalShop", type: "Cronograma", status: "rejected", createdAt: "2024-01-05", budget: 25000, duration: "3 meses" },
];

const proposalTypes = [
  { type: "Proposta de Mídia", description: "Estratégia completa com canais, budget e KPIs", icon: Target },
  { type: "Plano Tático", description: "Detalhamento de ações e cronograma", icon: Calendar },
  { type: "Cronograma", description: "Timeline de entregas e marcos", icon: Clock },
  { type: "Orçamento", description: "Estimativa detalhada de investimento", icon: DollarSign },
];

export default function Proposals() {
  const getStatusBadge = (status: string) => {
    const styles = { draft: { variant: "secondary" as const, label: "Rascunho" }, sent: { variant: "outline" as const, label: "Enviada" }, approved: { variant: "default" as const, label: "Aprovada" }, rejected: { variant: "destructive" as const, label: "Rejeitada" } };
    const style = styles[status as keyof typeof styles];
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Propostas & Planos</h1><PageInfoTooltip description="Gere automaticamente propostas de mídia, planos táticos, cronogramas e orçamentos para clientes." /></div><p className="text-sm text-muted-foreground">Geração automatizada de propostas e planos de ação</p></div><Button><Plus className="w-4 h-4 mr-2" />Nova Proposta</Button></div>
        <Card><CardHeader><CardTitle className="text-lg">Gerar Documento</CardTitle><CardDescription>Selecione o tipo de documento para gerar automaticamente</CardDescription></CardHeader><CardContent><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{proposalTypes.map((item, index) => (<button key={index} className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all text-left group"><div className="flex items-center gap-3 mb-2"><div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors"><item.icon className="w-5 h-5 text-primary" /></div><span className="font-medium text-foreground">{item.type}</span></div><p className="text-sm text-muted-foreground">{item.description}</p></button>))}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Propostas Recentes</CardTitle><CardDescription>Histórico de propostas geradas</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Cliente</TableHead><TableHead>Tipo</TableHead><TableHead>Orçamento</TableHead><TableHead>Duração</TableHead><TableHead>Data</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{mockProposals.map((proposal) => (<TableRow key={proposal.id}><TableCell className="font-mono text-sm">{proposal.id}</TableCell><TableCell className="font-medium">{proposal.client}</TableCell><TableCell>{proposal.type}</TableCell><TableCell>R$ {proposal.budget.toLocaleString('pt-BR')}</TableCell><TableCell>{proposal.duration}</TableCell><TableCell className="text-muted-foreground">{proposal.createdAt}</TableCell><TableCell>{getStatusBadge(proposal.status)}</TableCell><TableCell className="text-right"><div className="flex justify-end gap-2"><Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button><Button size="sm" variant="ghost"><Download className="w-4 h-4" /></Button></div></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      </div>
    </AppLayout>
  );
}
