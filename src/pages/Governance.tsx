import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Clock, User, CheckCircle, AlertTriangle, History, Lock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockAuditLog = [
  { id: 1, action: "Alteração de orçamento", entity: "Campanha ACME Q1", user: "Maria Silva", timestamp: "2024-01-16 14:32", details: "Budget alterado de R$ 50.000 para R$ 75.000", status: "approved", approver: "João Santos" },
  { id: 2, action: "Pausa de campanha", entity: "Campanha TechStart Retargeting", user: "Ana Costa", timestamp: "2024-01-16 11:15", details: "Campanha pausada para análise de performance", status: "logged", approver: null },
  { id: 3, action: "Criação de público", entity: "Lookalike GlobalBrand 1%", user: "Pedro Lima", timestamp: "2024-01-15 16:45", details: "Novo público lookalike criado a partir de compradores", status: "logged", approver: null },
];

const mockPendingApprovals = [
  { id: 1, type: "Alteração de verba", description: "Aumento de 50% no budget da campanha LocalShop", requester: "Maria Silva", requestedAt: "2024-01-16 09:00", urgency: "high" },
  { id: 2, type: "Nova integração", description: "Conexão com conta TikTok Ads", requester: "Pedro Lima", requestedAt: "2024-01-15 14:30", urgency: "medium" },
];

const mockComplianceStatus = { lastAudit: "2024-01-10", score: 94, openIssues: 2, resolvedThisMonth: 8 };

export default function Governance() {
  const getStatusBadge = (status: string) => { switch (status) { case 'approved': return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Aprovado</Badge>; case 'pending': return <Badge variant="outline" className="flex items-center gap-1"><Clock className="w-3 h-3" />Pendente</Badge>; case 'logged': return <Badge variant="secondary">Registrado</Badge>; default: return <Badge>{status}</Badge>; } };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Governança & Compliance</h1><PageInfoTooltip description="Logs de alterações, aprovações pendentes e trilhas de auditoria para compliance operacional." /></div><p className="text-sm text-muted-foreground">Logs de alterações, aprovações e trilhas de auditoria</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><Shield className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Score Compliance</p><p className="text-lg font-bold text-foreground">{mockComplianceStatus.score}%</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><AlertTriangle className="w-5 h-5 text-yellow-500" /></div><div><p className="text-xs text-muted-foreground">Issues Abertos</p><p className="text-lg font-bold text-foreground">{mockComplianceStatus.openIssues}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><History className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Última Auditoria</p><p className="text-lg font-bold text-foreground">{mockComplianceStatus.lastAudit}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><CheckCircle className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Resolvidos (mês)</p><p className="text-lg font-bold text-foreground">{mockComplianceStatus.resolvedThisMonth}</p></div></div></CardContent></Card>
        </div>
        {mockPendingApprovals.length > 0 && (
          <Card className="border-yellow-500/30"><CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lock className="w-5 h-5 text-yellow-500" />Aprovações Pendentes</CardTitle><CardDescription>Ações aguardando aprovação</CardDescription></CardHeader><CardContent><div className="space-y-3">{mockPendingApprovals.map((approval) => (<div key={approval.id} className="flex items-center justify-between p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20"><div className="space-y-1"><div className="flex items-center gap-2"><Badge variant="outline">{approval.type}</Badge><Badge variant={approval.urgency === 'high' ? 'destructive' : 'secondary'}>{approval.urgency === 'high' ? 'Urgente' : 'Normal'}</Badge></div><p className="text-sm text-foreground">{approval.description}</p><p className="text-xs text-muted-foreground">Por {approval.requester} em {approval.requestedAt}</p></div><div className="flex gap-2"><Button size="sm" variant="outline">Rejeitar</Button><Button size="sm">Aprovar</Button></div></div>))}</div></CardContent></Card>
        )}
        <Card><CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" />Log de Alterações</CardTitle><CardDescription>Histórico completo de ações na plataforma</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Ação</TableHead><TableHead>Entidade</TableHead><TableHead>Usuário</TableHead><TableHead>Data/Hora</TableHead><TableHead>Status</TableHead><TableHead>Aprovador</TableHead></TableRow></TableHeader><TableBody>{mockAuditLog.map((log) => (<TableRow key={log.id}><TableCell><div><p className="font-medium text-foreground">{log.action}</p><p className="text-xs text-muted-foreground">{log.details}</p></div></TableCell><TableCell>{log.entity}</TableCell><TableCell><div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground" />{log.user}</div></TableCell><TableCell className="text-muted-foreground">{log.timestamp}</TableCell><TableCell>{getStatusBadge(log.status)}</TableCell><TableCell>{log.approver || '-'}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      </div>
    </AppLayout>
  );
}
