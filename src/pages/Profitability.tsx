import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockClients = [
  { name: "ACME Corp", revenue: 45000, mediaBudget: 150000, estimatedHours: 80, actualHours: 95, operationalCost: 28500, grossMargin: 16500, netMargin: 12000, marginPercent: 36.7, status: "healthy", recommendation: null },
  { name: "TechStart", revenue: 25000, mediaBudget: 80000, estimatedHours: 50, actualHours: 72, operationalCost: 21600, grossMargin: 3400, netMargin: 1200, marginPercent: 13.6, status: "warning", recommendation: "reprecificar" },
  { name: "GlobalBrand", revenue: 85000, mediaBudget: 350000, estimatedHours: 120, actualHours: 110, operationalCost: 33000, grossMargin: 52000, netMargin: 45000, marginPercent: 61.2, status: "excellent", recommendation: "upsell" },
  { name: "LocalShop", revenue: 8000, mediaBudget: 25000, estimatedHours: 30, actualHours: 55, operationalCost: 16500, grossMargin: -8500, netMargin: -12000, marginPercent: -106.2, status: "critical", recommendation: "encerrar" },
];

const mockServiceBreakdown = [
  { service: "Mídia", revenue: 98000, cost: 45000, margin: 53000, marginPercent: 54.1 },
  { service: "Criação", revenue: 35000, cost: 28000, margin: 7000, marginPercent: 20.0 },
  { service: "BI & Dados", revenue: 25000, cost: 15000, margin: 10000, marginPercent: 40.0 },
  { service: "Consultoria", revenue: 15000, cost: 12000, margin: 3000, marginPercent: 20.0 },
];

export default function Profitability() {
  const totalRevenue = mockClients.reduce((sum, c) => sum + c.revenue, 0);
  const totalMargin = mockClients.reduce((sum, c) => sum + c.netMargin, 0);
  const avgMarginPercent = (totalMargin / totalRevenue) * 100;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Rentabilidade & Margem</h1><PageInfoTooltip description="Análise de rentabilidade e margem por cliente e serviço com indicadores de risco financeiro." /></div><p className="text-sm text-muted-foreground">Análise de rentabilidade por cliente e serviço</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><DollarSign className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Receita Total</p><p className="text-lg font-bold text-foreground">R$ {totalRevenue.toLocaleString('pt-BR')}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Margem Líquida</p><p className="text-lg font-bold text-foreground">R$ {totalMargin.toLocaleString('pt-BR')}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Margem Média</p><p className="text-lg font-bold text-foreground">{avgMarginPercent.toFixed(1)}%</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><AlertTriangle className="w-5 h-5 text-yellow-500" /></div><div><p className="text-xs text-muted-foreground">Clientes em Alerta</p><p className="text-lg font-bold text-foreground">{mockClients.filter(c => c.status === 'warning' || c.status === 'critical').length}</p></div></div></CardContent></Card>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-lg">Rentabilidade por Cliente</CardTitle><CardDescription>Análise detalhada de margem e recomendações</CardDescription></CardHeader>
          <CardContent><Table><TableHeader><TableRow><TableHead>Cliente</TableHead><TableHead className="text-right">Receita</TableHead><TableHead className="text-right">Horas Est./Real</TableHead><TableHead className="text-right">Custo Op.</TableHead><TableHead className="text-right">Margem</TableHead><TableHead>Status</TableHead><TableHead>Ação</TableHead></TableRow></TableHeader><TableBody>{mockClients.map((client, index) => (<TableRow key={index}><TableCell className="font-medium">{client.name}</TableCell><TableCell className="text-right">R$ {client.revenue.toLocaleString('pt-BR')}</TableCell><TableCell className="text-right"><span className={client.actualHours > client.estimatedHours ? 'text-red-500' : 'text-green-500'}>{client.estimatedHours}h / {client.actualHours}h</span></TableCell><TableCell className="text-right">R$ {client.operationalCost.toLocaleString('pt-BR')}</TableCell><TableCell className="text-right"><div className="flex items-center justify-end gap-1">{client.marginPercent >= 0 ? <ArrowUpRight className="w-4 h-4 text-green-500" /> : <ArrowDownRight className="w-4 h-4 text-red-500" />}<span className={client.marginPercent >= 0 ? 'text-green-500' : 'text-red-500'}>{client.marginPercent.toFixed(1)}%</span></div></TableCell><TableCell><Badge variant={client.status === 'excellent' ? 'default' : client.status === 'healthy' ? 'secondary' : client.status === 'warning' ? 'outline' : 'destructive'}>{client.status === 'excellent' ? 'Excelente' : client.status === 'healthy' ? 'Saudável' : client.status === 'warning' ? 'Atenção' : 'Crítico'}</Badge></TableCell><TableCell>{client.recommendation && <Badge variant="outline" className="capitalize">{client.recommendation}</Badge>}</TableCell></TableRow>))}</TableBody></Table></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Rentabilidade por Serviço</CardTitle><CardDescription>Margem por tipo de serviço prestado</CardDescription></CardHeader>
          <CardContent><div className="space-y-4">{mockServiceBreakdown.map((service, index) => (<div key={index} className="space-y-2"><div className="flex items-center justify-between"><span className="font-medium text-foreground">{service.service}</span><div className="flex items-center gap-4 text-sm"><span className="text-muted-foreground">Receita: R$ {service.revenue.toLocaleString('pt-BR')}</span><span className={service.marginPercent >= 30 ? 'text-green-500' : 'text-yellow-500'}>Margem: {service.marginPercent}%</span></div></div><Progress value={service.marginPercent} className="h-2" /></div>))}</div></CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
