import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, DollarSign, Clock, Target, ArrowRight } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockPipeline = [
  { stage: "Lead", count: 45, value: 450000, color: "bg-blue-500" },
  { stage: "Qualificado", count: 28, value: 320000, color: "bg-cyan-500" },
  { stage: "Proposta", count: 15, value: 280000, color: "bg-yellow-500" },
  { stage: "Negociação", count: 8, value: 180000, color: "bg-orange-500" },
  { stage: "Fechado", count: 5, value: 120000, color: "bg-green-500" },
];

const mockMetrics = { conversionRate: 11.1, avgTicket: 24000, cac: 3500, avgCycleTime: 45, pipelineValue: 1350000, monthlyTarget: 150000, currentRevenue: 120000 };
const mockDeals = [
  { name: "Enterprise Corp", stage: "Negociação", value: 85000, probability: 75, daysInPipeline: 32 },
  { name: "StartupX", stage: "Proposta", value: 35000, probability: 50, daysInPipeline: 18 },
  { name: "MegaRetail", stage: "Qualificado", value: 120000, probability: 25, daysInPipeline: 8 },
  { name: "TechCo", stage: "Negociação", value: 55000, probability: 80, daysInPipeline: 45 },
];

export default function Sales() {
  const targetProgress = (mockMetrics.currentRevenue / mockMetrics.monthlyTarget) * 100;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Performance Comercial</h1><PageInfoTooltip description="Pipeline comercial, métricas de conversão, ticket médio e acompanhamento de deals da agência." /></div><p className="text-sm text-muted-foreground">Pipeline, conversão e métricas comerciais da agência</p></div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><TrendingUp className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Conversão</p><p className="text-lg font-bold text-foreground">{mockMetrics.conversionRate}%</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><DollarSign className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Ticket Médio</p><p className="text-lg font-bold text-foreground">R$ {mockMetrics.avgTicket.toLocaleString('pt-BR')}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/10"><Users className="w-5 h-5 text-purple-500" /></div><div><p className="text-xs text-muted-foreground">CAC</p><p className="text-lg font-bold text-foreground">R$ {mockMetrics.cac.toLocaleString('pt-BR')}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="w-5 h-5 text-yellow-500" /></div><div><p className="text-xs text-muted-foreground">Ciclo Médio</p><p className="text-lg font-bold text-foreground">{mockMetrics.avgCycleTime} dias</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><Target className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Pipeline</p><p className="text-lg font-bold text-foreground">R$ {(mockMetrics.pipelineValue / 1000).toFixed(0)}k</p></div></div></CardContent></Card>
        </div>
        <Card><CardHeader className="pb-2"><CardTitle className="text-lg">Meta Mensal</CardTitle></CardHeader><CardContent><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-muted-foreground">R$ {mockMetrics.currentRevenue.toLocaleString('pt-BR')} / R$ {mockMetrics.monthlyTarget.toLocaleString('pt-BR')}</span><span className="font-medium text-foreground">{targetProgress.toFixed(0)}%</span></div><Progress value={targetProgress} className="h-3" /></div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Pipeline Comercial</CardTitle><CardDescription>Funil de vendas por etapa</CardDescription></CardHeader><CardContent><div className="flex items-end gap-2 h-48">{mockPipeline.map((stage, index) => { const maxCount = Math.max(...mockPipeline.map(s => s.count)); const height = (stage.count / maxCount) * 100; return (<div key={index} className="flex-1 flex flex-col items-center gap-2"><div className="w-full flex flex-col items-center"><span className="text-sm font-bold text-foreground">{stage.count}</span><span className="text-xs text-muted-foreground">R$ {(stage.value / 1000).toFixed(0)}k</span></div><div className={`w-full rounded-t-lg ${stage.color} transition-all`} style={{ height: `${height}%`, minHeight: '20px' }} /><span className="text-xs font-medium text-foreground">{stage.stage}</span>{index < mockPipeline.length - 1 && <ArrowRight className="absolute -right-3 text-muted-foreground w-4 h-4 hidden md:block" />}</div>); })}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Principais Oportunidades</CardTitle><CardDescription>Negócios com maior potencial</CardDescription></CardHeader><CardContent><div className="space-y-3">{mockDeals.map((deal, index) => (<div key={index} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30"><div className="flex-1"><p className="font-medium text-foreground">{deal.name}</p><p className="text-sm text-muted-foreground">{deal.daysInPipeline} dias no pipeline</p></div><Badge variant="outline">{deal.stage}</Badge><div className="text-right"><p className="font-bold text-foreground">R$ {deal.value.toLocaleString('pt-BR')}</p><p className="text-sm text-muted-foreground">{deal.probability}% prob.</p></div></div>))}</div></CardContent></Card>
      </div>
    </AppLayout>
  );
}
