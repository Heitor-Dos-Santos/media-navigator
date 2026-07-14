import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface ChecklistItem { id: string; label: string; checked: boolean; critical?: boolean; }
interface ChecklistSection { id: string; title: string; description: string; items: ChecklistItem[]; }

const initialChecklist: ChecklistSection[] = [
  { id: "pre", title: "Pré-Campanha", description: "Validações antes do go-live", items: [
    { id: "p1", label: "Taxonomia validada e aprovada", checked: false, critical: true },
    { id: "p2", label: "URLs de destino testadas e funcionais", checked: false, critical: true },
    { id: "p3", label: "Pixels e tags de conversão instalados", checked: false, critical: true },
    { id: "p4", label: "Criativos aprovados e em specs", checked: false },
    { id: "p5", label: "Orçamento configurado corretamente", checked: false, critical: true },
    { id: "p6", label: "Datas de flight corretas", checked: false },
    { id: "p7", label: "Audiências segmentadas e aprovadas", checked: false },
    { id: "p8", label: "Brand safety configurado", checked: false },
  ]},
  { id: "during", title: "Durante Campanha", description: "Monitoramento e otimização", items: [
    { id: "d1", label: "Verificar entrega nas primeiras 24h", checked: false, critical: true },
    { id: "d2", label: "Conferir pacing de orçamento", checked: false },
    { id: "d3", label: "Monitorar CTR e métricas de engajamento", checked: false },
    { id: "d4", label: "Verificar conversões atribuídas", checked: false, critical: true },
    { id: "d5", label: "Ajustar lances se necessário", checked: false },
    { id: "d6", label: "Pausar criativos com baixa performance", checked: false },
    { id: "d7", label: "Verificar frequência e saturação", checked: false },
    { id: "d8", label: "Documentar otimizações realizadas", checked: false },
  ]},
  { id: "post", title: "Pós-Campanha", description: "Análise e aprendizados", items: [
    { id: "o1", label: "Extrair relatórios finais das plataformas", checked: false, critical: true },
    { id: "o2", label: "Consolidar dados em planilha/BI", checked: false },
    { id: "o3", label: "Calcular eficiência de compra (MBES)", checked: false },
    { id: "o4", label: "Documentar aprendizados", checked: false },
    { id: "o5", label: "Gerar relatório executivo", checked: false, critical: true },
    { id: "o6", label: "Arquivar criativos e assets", checked: false },
    { id: "o7", label: "Registrar recomendações para próxima campanha", checked: false },
  ]},
];

export function OperationalChecklist() {
  const [sections, setSections] = useState(initialChecklist);
  const toggleItem = (sectionId: string, itemId: string) => { setSections(sections.map(section => section.id === sectionId ? { ...section, items: section.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item) } : section)); };
  const getSectionProgress = (section: ChecklistSection) => { const completed = section.items.filter(i => i.checked).length; return Math.round((completed / section.items.length) * 100); };
  const getTotalProgress = () => { const allItems = sections.flatMap(s => s.items); const completed = allItems.filter(i => i.checked).length; return Math.round((completed / allItems.length) * 100); };
  const getCriticalPending = () => sections.flatMap(s => s.items).filter(i => i.critical && !i.checked).length;
  const totalProgress = getTotalProgress();
  const criticalPending = getCriticalPending();

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-semibold text-foreground">Progresso Geral</h3><p className="text-sm text-muted-foreground">{totalProgress}% concluído</p></div>
          <div className="flex items-center gap-2">
            {criticalPending > 0 && <Badge variant="outline" className="border-status-error text-status-error"><AlertCircle className="w-3 h-3 mr-1" />{criticalPending} críticos pendentes</Badge>}
            {totalProgress === 100 && <Badge variant="outline" className="border-status-success text-status-success"><CheckCircle2 className="w-3 h-3 mr-1" />Completo</Badge>}
          </div>
        </div>
        <Progress value={totalProgress} className="h-2" />
      </div>
      <Accordion type="multiple" defaultValue={["pre"]} className="space-y-3">
        {sections.map((section) => {
          const progress = getSectionProgress(section);
          const sectionCritical = section.items.filter(i => i.critical && !i.checked).length;
          return (
            <AccordionItem key={section.id} value={section.id} className="border border-border rounded-xl overflow-hidden bg-card">
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", progress === 100 ? "bg-status-success/10" : "bg-primary/10")}>{progress === 100 ? <CheckCircle2 className="w-5 h-5 text-status-success" /> : <Circle className="w-5 h-5 text-primary" />}</div>
                    <div className="text-left"><h4 className="font-medium text-foreground">{section.title}</h4><p className="text-xs text-muted-foreground">{section.description}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sectionCritical > 0 && <Badge variant="outline" className="border-status-warning text-status-warning text-xs">{sectionCritical} críticos</Badge>}
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-2 mt-2">
                  {section.items.map((item) => (
                    <div key={item.id} className={cn("flex items-center gap-3 p-3 rounded-lg transition-colors", item.checked ? "bg-muted/30" : "bg-muted/50 hover:bg-muted/70")}>
                      <Checkbox id={item.id} checked={item.checked} onCheckedChange={() => toggleItem(section.id, item.id)} />
                      <label htmlFor={item.id} className={cn("flex-1 text-sm cursor-pointer", item.checked && "line-through text-muted-foreground")}>{item.label}</label>
                      {item.critical && !item.checked && <Badge variant="outline" className="text-xs border-status-error text-status-error">Crítico</Badge>}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <div className="flex items-center gap-3"><Button className="flex-1">Exportar Checklist</Button><Button variant="outline" className="flex-1">Resetar Progresso</Button></div>
    </div>
  );
}
