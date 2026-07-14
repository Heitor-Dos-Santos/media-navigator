import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Users, Gift, Medal, Star, Calculator } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockTeamGoals = [
  { name: "Maria Silva", role: "Media Buyer", efficiency: 118, target: 110, bonus: 2500 },
  { name: "João Santos", role: "Account Manager", efficiency: 105, target: 100, bonus: 1800 },
  { name: "Ana Costa", role: "Creative Lead", efficiency: 95, target: 100, bonus: 0 },
  { name: "Pedro Lima", role: "BI Analyst", efficiency: 122, target: 105, bonus: 3200 },
];

const mockIncentiveCategories = [
  { name: "Eficiência de Mídia", weight: 40, icon: TrendingUp, color: "text-green-500" },
  { name: "Margem por Cliente", weight: 30, icon: Target, color: "text-blue-500" },
  { name: "Resultado de Campanha", weight: 20, icon: Trophy, color: "text-yellow-500" },
  { name: "NPS do Cliente", weight: 10, icon: Star, color: "text-purple-500" },
];

export default function Incentives() {
  const totalBonusPool = 45000;
  const distributedBonus = 7500;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Bônus, PL & Incentivos</h1><PageInfoTooltip description="Metas de equipe, cálculo de bônus e incentivos baseados em performance real de mídia." /></div><p className="text-sm text-muted-foreground">Metas, cálculo de bônus e incentivos baseados em performance real</p></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><Gift className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Pool de Bônus</p><p className="text-lg font-bold text-foreground">R$ {totalBonusPool.toLocaleString('pt-BR')}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Calculator className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Distribuído</p><p className="text-lg font-bold text-foreground">R$ {distributedBonus.toLocaleString('pt-BR')}</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-yellow-500/10"><Medal className="w-5 h-5 text-yellow-500" /></div><div><p className="text-xs text-muted-foreground">Elegíveis</p><p className="text-lg font-bold text-foreground">3 de 4</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-purple-500/10"><Users className="w-5 h-5 text-purple-500" /></div><div><p className="text-xs text-muted-foreground">Eficiência Média</p><p className="text-lg font-bold text-foreground">110%</p></div></div></CardContent></Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card><CardHeader><CardTitle className="text-lg">Performance do Time</CardTitle><CardDescription>Metas e bônus calculados automaticamente</CardDescription></CardHeader><CardContent><div className="space-y-4">{mockTeamGoals.map((member, index) => { const progress = (member.efficiency / member.target) * 100; const achieved = member.efficiency >= member.target; return (<div key={index} className="p-4 rounded-lg bg-muted/30 space-y-3"><div className="flex items-center justify-between"><div><p className="font-medium text-foreground">{member.name}</p><p className="text-xs text-muted-foreground">{member.role}</p></div><div className="text-right"><p className={`text-lg font-bold ${achieved ? 'text-green-500' : 'text-muted-foreground'}`}>{member.efficiency}%</p><p className="text-xs text-muted-foreground">Meta: {member.target}%</p></div></div><Progress value={Math.min(progress, 100)} className="h-2" /><div className="flex items-center justify-between text-sm"><span className={achieved ? 'text-green-500' : 'text-muted-foreground'}>{achieved ? '✓ Meta atingida' : '○ Em progresso'}</span><span className="font-medium text-foreground">Bônus: R$ {member.bonus.toLocaleString('pt-BR')}</span></div></div>); })}</div></CardContent></Card>
          </div>
          <div>
            <Card><CardHeader><CardTitle className="text-lg">Critérios de Avaliação</CardTitle><CardDescription>Peso de cada métrica no cálculo</CardDescription></CardHeader><CardContent><div className="space-y-4">{mockIncentiveCategories.map((category, index) => (<div key={index} className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-muted/50`}><category.icon className={`w-4 h-4 ${category.color}`} /></div><div className="flex-1"><p className="text-sm font-medium text-foreground">{category.name}</p><Progress value={category.weight} className="h-1.5 mt-1" /></div><span className="text-sm font-bold text-foreground">{category.weight}%</span></div>))}</div></CardContent></Card>
            <Card className="mt-4"><CardHeader><CardTitle className="text-lg">Próximo Ciclo</CardTitle><CardDescription>Período de avaliação</CardDescription></CardHeader><CardContent><div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20"><p className="text-2xl font-bold text-primary">15 dias</p><p className="text-sm text-muted-foreground">até fechamento</p></div></CardContent></Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
