import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Plus, ThumbsUp, ThumbsDown, Tag, Calendar, User } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockLearnings = [
  { id: 1, title: "Criativos UGC performam 2x melhor em E-commerce", description: "Testamos 15 variações de criativos e UGC teve CPA 45% menor que branded content.", outcome: "success", vertical: "E-commerce", channel: "Meta Ads", objective: "Conversão", date: "2024-01-10", author: "Maria Silva", tags: ["UGC", "Criativos", "CPA"] },
  { id: 2, title: "Broad targeting supera lookalike em campanhas maduras", description: "Após 6 meses de campanha, broad targeting passou a ter CPA 20% menor que lookalike 1%.", outcome: "success", vertical: "SaaS", channel: "Meta Ads", objective: "Leads", date: "2024-01-08", author: "João Santos", tags: ["Targeting", "Lookalike", "Otimização"] },
  { id: 3, title: "Campanhas de vídeo no YouTube têm baixo ROI para awareness", description: "CPM alto e baixa retenção. Realocamos verba para Meta com melhores resultados.", outcome: "failure", vertical: "Varejo", channel: "YouTube", objective: "Awareness", date: "2024-01-05", author: "Ana Costa", tags: ["YouTube", "Video", "ROI"] },
  { id: 4, title: "Horário 18h-22h concentra 60% das conversões mobile", description: "Ajustamos bid adjustments para +30% nesse horário e reduzimos CPA em 15%.", outcome: "success", vertical: "Apps", channel: "Google Ads", objective: "Instalações", date: "2024-01-02", author: "Pedro Lima", tags: ["Scheduling", "Mobile", "Otimização"] },
];

export default function Knowledge() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Base de Conhecimento</h1><PageInfoTooltip description="Registre e consulte aprendizados estruturados e reutilizáveis da operação de mídia." /></div><p className="text-sm text-muted-foreground">Aprendizados estruturados e reutilizáveis</p></div><Button><Plus className="w-4 h-4 mr-2" />Novo Aprendizado</Button></div>
        <Card><CardContent className="p-4"><div className="flex flex-col md:flex-row gap-4"><div className="flex-1 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar aprendizados..." className="pl-10" /></div><div className="flex gap-2 flex-wrap"><Button variant="outline" size="sm">Vertical</Button><Button variant="outline" size="sm">Canal</Button><Button variant="outline" size="sm">Objetivo</Button></div></div></CardContent></Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10"><BookOpen className="w-5 h-5 text-primary" /></div><div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-foreground">127</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/10"><ThumbsUp className="w-5 h-5 text-green-500" /></div><div><p className="text-xs text-muted-foreground">Sucessos</p><p className="text-lg font-bold text-foreground">98</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/10"><ThumbsDown className="w-5 h-5 text-red-500" /></div><div><p className="text-xs text-muted-foreground">Fracassos</p><p className="text-lg font-bold text-foreground">29</p></div></div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/10"><Tag className="w-5 h-5 text-blue-500" /></div><div><p className="text-xs text-muted-foreground">Tags</p><p className="text-lg font-bold text-foreground">45</p></div></div></CardContent></Card>
        </div>
        <div className="space-y-4">
          {mockLearnings.map((learning) => (
            <Card key={learning.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${learning.outcome === 'success' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>{learning.outcome === 'success' ? <ThumbsUp className="w-5 h-5 text-green-500" /> : <ThumbsDown className="w-5 h-5 text-red-500" />}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between"><h3 className="font-semibold text-foreground">{learning.title}</h3><Badge variant={learning.outcome === 'success' ? 'default' : 'destructive'}>{learning.outcome === 'success' ? 'Funcionou' : 'Não funcionou'}</Badge></div>
                    <p className="text-sm text-muted-foreground">{learning.description}</p>
                    <div className="flex flex-wrap gap-2"><Badge variant="outline">{learning.vertical}</Badge><Badge variant="outline">{learning.channel}</Badge><Badge variant="outline">{learning.objective}</Badge></div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2"><span className="flex items-center gap-1"><User className="w-3 h-3" />{learning.author}</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{learning.date}</span><div className="flex gap-1">{learning.tags.map((tag, i) => (<span key={i} className="text-primary">#{tag}</span>))}</div></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
