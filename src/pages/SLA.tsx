import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, XCircle, Timer } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockSLAMetrics = [
  { type: "Subida de Campanha", target: "24h", avgTime: "18h", compliance: 92, total: 45, onTime: 41 },
  { type: "Ajustes de Campanha", target: "4h", avgTime: "3.2h", compliance: 88, total: 120, onTime: 106 },
  { type: "Entrega de Criativos", target: "48h", avgTime: "52h", compliance: 75, total: 30, onTime: 22 },
  { type: "Relatórios", target: "72h", avgTime: "68h", compliance: 95, total: 20, onTime: 19 },
  { type: "Otimizações", target: "12h", avgTime: "10h", compliance: 90, total: 80, onTime: 72 },
];

const mockPendingTasks = [
  { id: 1, task: "Subir campanha ACME Q1", client: "ACME Corp", deadline: "2024-01-16 14:00", status: "warning", remaining: "2h" },
  { id: 2, task: "Ajustar lances TechStart", client: "TechStart", deadline: "2024-01-16 18:00", status: "ok", remaining: "6h" },
  { id: 3, task: "Relatório semanal GlobalBrand", client: "GlobalBrand", deadline: "2024-01-15 12:00", status: "overdue", remaining: "-2h" },
  { id: 4, task: "Criativos LocalShop", client: "LocalShop", deadline: "2024-01-17 10:00", status: "ok", remaining: "22h" },
];

const mockBottlenecks = [
  { area: "Criação", avgDelay: "4h", impact: "Alto", tasks: 8 },
  { area: "Aprovação Cliente", avgDelay: "12h", impact: "Médio", tasks: 5 },
  { area: "Setup Técnico", avgDelay: "2h", impact: "Baixo", tasks: 3 },
];

export default function SLA() {
  const overallCompliance = Math.round(mockSLAMetrics.reduce((sum, m) => sum + m.compliance, 0) / mockSLAMetrics.length);
  const getStatusIcon = (status: string) => { switch (status) { case 'ok': return <CheckCircle className="w-4 h-4 text-green-500" />; case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />; case 'overdue': return <XCircle className="w-4 h-4 text-red-500" />; default: return null; } };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">SLA & Operação</h1><PageInfoTooltip description="Acompanhe prazos, entregas, compliance de SLA e identifique gargalos operacionais." /></div><p className="text-sm text-muted-foreground">Acompanhamento de prazos, entregas e gargalos operacionais</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><CheckCircle className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Compliance Geral</p><p className="text-lg font-bold text-foreground">{overallCompliance}%</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><AlertTriangle className="w-5 h-5 text-yellow-500" /></div><div><p className="text-xs text-muted-foreground">Em Alerta</p><p className="text-lg font-bold text-foreground">{mockPendingTasks.filter(t => t.status === 'warning').length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/10"><XCircle className="w-5 h-5 text-red-500" /></div><div><p className="text-xs text-muted-foreground">Atrasados</p><p className="text-lg font-bold text-foreground">{mockPendingTasks.filter(t => t.status === 'overdue').length}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Timer className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Tempo Médio</p><p className="text-lg font-bold text-foreground">18h</p></div></div></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><Card><CardHeader><CardTitle className="text-lg">SLA por Tipo de Entrega</CardTitle><CardDescription>Performance de cumprimento de prazos</CardDescription></CardHeader><CardContent><div className="space-y-4">{mockSLAMetrics.map((metric, index) => (<div key={index} className="space-y-2"><div className="flex items-center justify-between"><div><span className="font-medium text-foreground">{metric.type}</span><span className="text-sm text-muted-foreground ml-2">(Meta: {metric.target} | Média: {metric.avgTime})</span></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">{metric.onTime}/{metric.total}</span><Badge variant={metric.compliance >= 90 ? "default" : metric.compliance >= 80 ? "secondary" : "destructive"}>{metric.compliance}%</Badge></div></div><Progress value={metric.compliance} className={`h-2 ${metric.compliance >= 90 ? '[&>div]:bg-green-500' : metric.compliance >= 80 ? '' : '[&>div]:bg-red-500'}`} /></div>))}</div></CardContent></Card></div>
          <div><Card><CardHeader><CardTitle className="text-lg">Gargalos Identificados</CardTitle><CardDescription>Áreas com maior atraso</CardDescription></CardHeader><CardContent><div className="space-y-3">{mockBottlenecks.map((bottleneck, index) => (<div key={index} className="p-3 rounded-lg bg-muted/30"><div className="flex items-center justify-between mb-1"><span className="font-medium text-foreground">{bottleneck.area}</span><Badge variant={bottleneck.impact === 'Alto' ? 'destructive' : bottleneck.impact === 'Médio' ? 'outline' : 'secondary'}>{bottleneck.impact}</Badge></div><div className="flex items-center justify-between text-sm text-muted-foreground"><span>Atraso médio: {bottleneck.avgDelay}</span><span>{bottleneck.tasks} tarefas</span></div></div>))}</div></CardContent></Card></div>
        </div>
        <Card><CardHeader><CardTitle className="text-lg">Tarefas Pendentes</CardTitle><CardDescription>Entregas com deadline próximo ou atrasadas</CardDescription></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Status</TableHead><TableHead>Tarefa</TableHead><TableHead>Cliente</TableHead><TableHead>Deadline</TableHead><TableHead>Tempo Restante</TableHead></TableRow></TableHeader><TableBody>{mockPendingTasks.map((task) => (<TableRow key={task.id}><TableCell>{getStatusIcon(task.status)}</TableCell><TableCell className="font-medium">{task.task}</TableCell><TableCell>{task.client}</TableCell><TableCell className="text-muted-foreground">{task.deadline}</TableCell><TableCell><span className={task.status === 'overdue' ? 'text-red-500' : task.status === 'warning' ? 'text-yellow-500' : 'text-green-500'}>{task.remaining}</span></TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      </div>
    </AppLayout>
  );
}
