import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Presentation, Copy, Sparkles, TrendingUp, Target, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockNarratives = {
  executive: `**Resumo Executivo - Q1 2024**\n\nA operação de mídia entregou resultados 12% acima das metas estabelecidas, com destaque para a eficiência na alocação de verba que gerou uma economia de R$ 45.000 mantendo o volume de conversões.\n\n**Principais conquistas:**\n• CPA médio 18% menor que o benchmark do setor\n• ROI de 3.2x sobre o investimento em mídia\n• Taxa de conversão aumentou de 2.1% para 2.8%\n\n**Próximos passos:**\nRecomendamos aumento de 20% na verba de canais de performance para capitalizar a eficiência demonstrada.`,
  report: `**Relatório de Performance - Janeiro 2024**\n\n**Investimento:** R$ 150.000\n**Conversões:** 4.200\n**CPA Realizado:** R$ 35,71\n**CPA Meta:** R$ 42,00\n\nA campanha de conversão superou as expectativas com um CPA 15% abaixo da meta. Os canais de melhor performance foram Google Search (CPA R$ 28) e Meta Retargeting (CPA R$ 32).\n\n**Insights:**\n1. Criativos com prova social tiveram 2x mais conversão\n2. Horário das 18h-22h concentrou 45% das conversões\n3. Mobile representou 72% do tráfego qualificado`,
  qbr: `**Quarterly Business Review - Q4 2023**\n\n**Tema:** Eficiência operacional e crescimento sustentável\n\n**Contexto de Negócio:**\nO mercado apresentou aumento de 25% no custo de aquisição médio do setor. Nossa operação conseguiu manter o CPA estável através de otimizações contínuas e testes de criativos.\n\n**Valor Gerado:**\n• Economia de R$ 120.000 vs. benchmark de mercado\n• 15.000 novos leads qualificados\n• NPS de campanha: 72 (acima da média do setor)\n\n**Recomendações Estratégicas:**\n1. Expandir investimento em canais de alto ROI\n2. Implementar estratégia de first-party data\n3. Testar novos formatos de vídeo curto`,
};

const mockMetricTranslations = [
  { technical: "CPA de R$ 35,71 com ROAS de 3.2x", business: "Cada cliente novo custou R$ 35,71 e gerou R$ 114 em receita", icon: Target },
  { technical: "CTR de 2.8% com CVR de 4.2%", business: "De cada 100 pessoas que viram o anúncio, 2.8 clicaram e 4.2% compraram", icon: TrendingUp },
  { technical: "Frequency cap de 3x com reach de 1.2M", business: "1.2 milhão de pessoas viram nossos anúncios até 3 vezes cada", icon: Users },
];

export default function Narrative() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Posicionamento & Narrativa</h1><PageInfoTooltip description="Traduza métricas técnicas para linguagem de negócio com templates de narrativas automáticas." /></div><p className="text-sm text-muted-foreground">Tradução técnica para linguagem de negócio</p></div><Button><Sparkles className="w-4 h-4 mr-2" />Gerar Narrativa</Button></div>
        <Card><CardHeader><CardTitle className="text-lg">Tradutor de Métricas</CardTitle><CardDescription>Transforme dados técnicos em linguagem executiva</CardDescription></CardHeader><CardContent><div className="space-y-4">{mockMetricTranslations.map((item, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30"><div className="space-y-2"><div className="flex items-center gap-2"><item.icon className="w-4 h-4 text-muted-foreground" /><span className="text-xs font-medium text-muted-foreground uppercase">Técnico</span></div><p className="text-sm font-mono text-foreground">{item.technical}</p></div><div className="space-y-2"><div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /><span className="text-xs font-medium text-primary uppercase">Negócio</span></div><p className="text-sm text-foreground">{item.business}</p></div></div>))}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Narrativas Automáticas</CardTitle><CardDescription>Templates prontos para diferentes contextos</CardDescription></CardHeader><CardContent><Tabs defaultValue="executive"><TabsList className="grid w-full max-w-md grid-cols-3"><TabsTrigger value="executive" className="flex items-center gap-2"><FileText className="w-4 h-4" />Executivo</TabsTrigger><TabsTrigger value="report" className="flex items-center gap-2"><FileText className="w-4 h-4" />Relatório</TabsTrigger><TabsTrigger value="qbr" className="flex items-center gap-2"><Presentation className="w-4 h-4" />QBR</TabsTrigger></TabsList>{Object.entries(mockNarratives).map(([key, content]) => (<TabsContent key={key} value={key} className="mt-4"><div className="relative"><div className="p-4 rounded-lg bg-muted/30 prose prose-sm dark:prose-invert max-w-none"><pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{content}</pre></div><Button size="sm" variant="outline" className="absolute top-2 right-2" onClick={() => navigator.clipboard.writeText(content)}><Copy className="w-4 h-4 mr-2" />Copiar</Button></div></TabsContent>))}</Tabs></CardContent></Card>
      </div>
    </AppLayout>
  );
}
