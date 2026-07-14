import { useState } from "react";
import { cn } from "@/lib/utils";
import { getMetricDefinition, type MetricDefinition, METRIC_CATEGORY_LABELS } from "@/data/metricDefinitions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, Eye, Zap, BookOpen, Lightbulb, Target, AlertTriangle } from "lucide-react";
import { useRBAC } from "@/contexts/RBACContext";

interface MetricTooltipProps {
  metricKey: string;
  children: React.ReactNode;
  className?: string;
}

export function MetricTooltip({ metricKey, children, className }: MetricTooltipProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const definition = getMetricDefinition(metricKey);
  const { hasRole } = useRBAC();
  const isSuperAdmin = hasRole("super_admin");

  // Metric key not found — show warning for super_admin only
  if (!definition) {
    if (isSuperAdmin) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("cursor-help border-b border-dashed border-status-warning", className)}>
                {children}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="z-[9999] max-w-xs p-3 bg-popover border-status-warning/30">
              <div className="flex items-center gap-2 text-status-warning">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-xs font-medium">Definição não encontrada</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                metric_key: <code className="text-[10px] bg-muted px-1 rounded">{metricKey}</code>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }
    return <span className={className}>{children}</span>;
  }

  return (
    <>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("cursor-help", className)}>
              {children}
            </span>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="z-[9999] max-w-sm p-4 bg-popover border-border/60 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2.5">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{definition.metric_name}</span>
                <Badge variant="outline" className="text-[9px] px-1.5">{METRIC_CATEGORY_LABELS[definition.category]}</Badge>
              </div>

              {/* Short definition */}
              <p className="text-xs text-muted-foreground leading-relaxed">{definition.short_definition}</p>

              {/* Interpretation */}
              <div className="flex items-start gap-1.5">
                <Eye className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-medium text-foreground uppercase tracking-wide">Como interpretar</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{definition.interpretation_guide}</p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-start gap-1.5">
                <Zap className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <span className="text-[10px] font-medium text-foreground uppercase tracking-wide">Quando agir</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{definition.action_guidance}</p>
                </div>
              </div>

              {/* Expand button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs gap-1.5 mt-1 h-7"
                onClick={(e) => { e.stopPropagation(); setSheetOpen(true); }}
              >
                <BookOpen className="w-3 h-3" />
                Ver explicação completa
              </Button>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Detail Sheet */}
      <MetricDetailSheet definition={definition} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

/* ─── Detail Side Panel ─── */

function MetricDetailSheet({ definition, open, onOpenChange }: { definition: MetricDefinition; open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">{METRIC_CATEGORY_LABELS[definition.category]}</Badge>
          </div>
          <SheetTitle className="text-lg">{definition.metric_name}</SheetTitle>
          <p className="text-sm text-muted-foreground">{definition.short_definition}</p>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Extended Description */}
          <Section icon={<Info className="w-4 h-4 text-primary" />} title="Explicação Detalhada">
            <p className="text-sm text-muted-foreground leading-relaxed">{definition.extended_description}</p>
          </Section>

          {/* Interpretation */}
          <Section icon={<Eye className="w-4 h-4 text-primary" />} title="Como Interpretar">
            <p className="text-sm text-muted-foreground leading-relaxed">{definition.interpretation_guide}</p>
          </Section>

          {/* When to Act */}
          <Section icon={<Zap className="w-4 h-4 text-primary" />} title="Quando Agir">
            <p className="text-sm text-muted-foreground leading-relaxed">{definition.action_guidance}</p>
          </Section>

          {/* Practical Example */}
          <Section icon={<Lightbulb className="w-4 h-4 text-status-warning" />} title="Exemplo Prático">
            <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
              <p className="text-sm text-foreground leading-relaxed">{definition.practical_example}</p>
            </div>
          </Section>

          {/* Strategic Application */}
          <Section icon={<Target className="w-4 h-4 text-status-success" />} title="Aplicação Estratégica">
            <p className="text-sm text-muted-foreground leading-relaxed">{definition.strategic_application}</p>
          </Section>

          {/* Footer */}
          <p className="text-[10px] text-muted-foreground text-right">Atualizado em {definition.updated_at}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}
