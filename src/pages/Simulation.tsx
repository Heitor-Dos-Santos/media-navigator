import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, TrendingUp, TrendingDown, ArrowRight, RefreshCw } from "lucide-react";
import { useState } from "react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const baseScenario = { budget: 100000, cpa: 42, conversions: 2380, revenue: 380000, efficiency: 100 };

export default function Simulation() {
  const [budgetChange, setBudgetChange] = useState([0]);
  const [channelMix, setChannelMix] = useState({ search: 40, social: 35, display: 15, video: 10 });
  const newBudget = baseScenario.budget * (1 + budgetChange[0] / 100);
  const diminishingFactor = budgetChange[0] > 0 ? 1 - (budgetChange[0] * 0.002) : 1 + (Math.abs(budgetChange[0]) * 0.001);
  const newCPA = baseScenario.cpa * (1 / diminishingFactor);
  const newConversions = Math.round(newBudget / newCPA);
  const newRevenue = Math.round(newConversions * 160);
  const newEfficiency = Math.round((baseScenario.cpa / newCPA) * 100);

  const getChangeIndicator = (original: number, current: number) => {
    const change = ((current - original) / original) * 100;
    if (Math.abs(change) < 0.5) return null;
    return change > 0 ? (<span className="flex items-center text-green-500 text-sm"><TrendingUp className="w-4 h-4 mr-1" />+{change.toFixed(1)}%</span>) : (<span className="flex items-center text-red-500 text-sm"><TrendingDown className="w-4 h-4 mr-1" />{change.toFixed(1)}%</span>);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Simulação & Cenários</h1><PageInfoTooltip description="Simule cenários de variação de verba e mix de canais para estimar impacto em CPA, conversões e ROI." /></div><p className="text-sm text-muted-foreground">Simule impacto de mudanças de verba e canais</p></div><Button variant="outline" onClick={() => setBudgetChange([0])}><RefreshCw className="w-4 h-4 mr-2" />Resetar</Button></div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FlaskConical className="w-5 h-5 text-primary" />Simulador de Verba</CardTitle><CardDescription>Ajuste o investimento e veja o impacto estimado</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4"><div className="flex items-center justify-between"><span className="text-sm font-medium text-foreground">Variação de Verba</span><Badge variant={budgetChange[0] >= 0 ? "default" : "destructive"}>{budgetChange[0] >= 0 ? '+' : ''}{budgetChange[0]}%</Badge></div><Slider value={budgetChange} onValueChange={setBudgetChange} min={-50} max={100} step={5} className="w-full" /><div className="flex justify-between text-xs text-muted-foreground"><span>-50%</span><span>Base</span><span>+100%</span></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 space-y-3"><h4 className="font-medium text-muted-foreground text-sm">Cenário Atual</h4><div className="space-y-2"><div className="flex justify-between"><span className="text-sm text-muted-foreground">Investimento</span><span className="font-medium text-foreground">R$ {baseScenario.budget.toLocaleString('pt-BR')}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">CPA</span><span className="font-medium text-foreground">R$ {baseScenario.cpa.toFixed(2)}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Conversões</span><span className="font-medium text-foreground">{baseScenario.conversions.toLocaleString('pt-BR')}</span></div><div className="flex justify-between"><span className="text-sm text-muted-foreground">Receita Est.</span><span className="font-medium text-foreground">R$ {baseScenario.revenue.toLocaleString('pt-BR')}</span></div></div></div>
              <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2"><ArrowRight className="w-6 h-6 text-primary" /></div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-3"><h4 className="font-medium text-primary text-sm">Cenário Simulado</h4><div className="space-y-2"><div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Investimento</span><div className="flex items-center gap-2"><span className="font-medium text-foreground">R$ {newBudget.toLocaleString('pt-BR')}</span>{getChangeIndicator(baseScenario.budget, newBudget)}</div></div><div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">CPA</span><div className="flex items-center gap-2"><span className="font-medium text-foreground">R$ {newCPA.toFixed(2)}</span>{getChangeIndicator(baseScenario.cpa, newCPA)}</div></div><div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Conversões</span><div className="flex items-center gap-2"><span className="font-medium text-foreground">{newConversions.toLocaleString('pt-BR')}</span>{getChangeIndicator(baseScenario.conversions, newConversions)}</div></div><div className="flex justify-between items-center"><span className="text-sm text-muted-foreground">Receita Est.</span><div className="flex items-center gap-2"><span className="font-medium text-foreground">R$ {newRevenue.toLocaleString('pt-BR')}</span>{getChangeIndicator(baseScenario.revenue, newRevenue)}</div></div></div></div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between"><div><p className="text-sm font-medium text-foreground">Impacto na Eficiência</p><p className="text-xs text-muted-foreground">{budgetChange[0] > 0 ? "Aumentos de verba têm retornos decrescentes" : budgetChange[0] < 0 ? "Reduções podem melhorar eficiência mas reduzem escala" : "Cenário base sem alterações"}</p></div><div className="text-right"><p className={`text-2xl font-bold ${newEfficiency >= 100 ? 'text-green-500' : 'text-yellow-500'}`}>{newEfficiency}%</p><p className="text-xs text-muted-foreground">vs. base</p></div></div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
