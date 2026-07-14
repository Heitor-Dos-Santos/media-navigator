import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Database, Megaphone, ShieldCheck,
  TrendingUp, TrendingDown, Minus, AlertTriangle,
  Lightbulb, CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricTooltip } from "@/components/intelligence/MetricTooltip";
import { imcClassificationMeta, IMC_COMPONENT_LABELS, type IMCScore } from "@/types/imc";

const COMPONENT_ICONS: Record<string, any> = {
  dataStructure: Database,
  mediaStructure: Megaphone,
  governance: ShieldCheck,
  intelligenceUsage: Brain,
};

const METRIC_KEYS: Record<string, string> = {
  dataStructure: "imc_data_structure",
  mediaStructure: "imc_media_structure",
  governance: "imc_governance",
  intelligenceUsage: "imc_intelligence_usage",
};

function getNextLevel(classification: string): string {
  const map: Record<string, string> = {
    basico: "Estruturado (55+)",
    estruturado: "Estratégico (70+)",
    estrategico: "Avançado (85+)",
    avancado: "Excelência mantida",
  };
  return map[classification] ?? "";
}

interface Props {
  imc: IMCScore;
}

export function ClientDeepFocusView({ imc }: Props) {
  const meta = imcClassificationMeta[imc.classification];
  const TrendIcon = imc.trend === "up" ? TrendingUp : imc.trend === "down" ? TrendingDown : Minus;

  const sortedComponents = (Object.entries(imc.components) as [keyof typeof imc.components, number][])
    .sort((a, b) => b[1] - a[1]);

  const strengths = sortedComponents.filter(([, v]) => v >= 70);
  const weaknesses = sortedComponents.filter(([, v]) => v < 70);

  return (
    <div className="space-y-6">
      {/* Client Header */}
      <Card className={cn("border-2", meta.border)}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Score circle */}
            <div className="flex-shrink-0">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/30">
                <div className="text-center">
                  <p className={cn("text-3xl font-bold", meta.color)}>{imc.score}</p>
                  <p className="text-[10px] text-muted-foreground">/100</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-foreground">{imc.clientName}</h2>
                <Badge className={cn("text-xs border", meta.bg, meta.color, meta.border)}>{imc.classificationLabel}</Badge>
                <TrendIcon className={cn("w-4 h-4", imc.trend === "up" ? "text-status-success" : imc.trend === "down" ? "text-status-error" : "text-muted-foreground")} />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Próximo nível: <span className="font-medium text-foreground">{getNextLevel(imc.classification)}</span>
              </div>
              {/* AI Summary */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-2">
                  <Brain className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-foreground leading-relaxed">{imc.aiSummary}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pillar Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Composição do IMC</CardTitle>
          <CardDescription>Detalhamento por pilar de maturidade</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Object.entries(imc.components) as [keyof typeof imc.components, number][]).map(([key, value]) => {
              const comp = IMC_COMPONENT_LABELS[key];
              const Icon = COMPONENT_ICONS[key];
              const status = value >= 70 ? "text-status-success" : value >= 55 ? "text-status-warning" : "text-status-error";
              const statusLabel = value >= 70 ? "Saudável" : value >= 55 ? "Atenção" : "Crítico";
              return (
                <div key={key} className="p-4 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <MetricTooltip metricKey={METRIC_KEYS[key]}>
                        <span className="text-sm font-medium text-foreground">{comp.label}</span>
                      </MetricTooltip>
                      <span className="text-xs text-muted-foreground">({comp.weight})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-lg font-bold", status)}>{value}</span>
                      <Badge variant="outline" className={cn("text-[10px]", status)}>{statusLabel}</Badge>
                    </div>
                  </div>
                  <Progress value={value} className="h-2.5" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-status-warning" />
              Gaps Prioritários
            </CardTitle>
            <CardDescription>O que está impedindo este cliente de atingir o próximo nível</CardDescription>
          </CardHeader>
          <CardContent>
            {imc.gaps.length > 0 ? (
              <ul className="space-y-3">
                {imc.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 p-3 rounded-lg bg-status-warning/5 border border-status-warning/10">
                    <AlertTriangle className="w-3.5 h-3.5 text-status-warning mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">{g}</span>
                  </li>
                ))}
                {weaknesses.map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                    <Minus className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {IMC_COMPONENT_LABELS[key].label}: <span className="font-medium text-status-warning">{value}/100</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum gap crítico identificado. Operação bem estruturada.</p>
            )}
          </CardContent>
        </Card>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              Pontos Fortes
            </CardTitle>
            <CardDescription>Pilares acima do limiar de maturidade</CardDescription>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map(([key, value]) => (
                  <li key={key} className="flex items-start gap-2 p-3 rounded-lg bg-status-success/5 border border-status-success/10">
                    <CheckCircle2 className="w-3.5 h-3.5 text-status-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground">
                      {IMC_COMPONENT_LABELS[key].label}: <span className="font-bold text-status-success">{value}/100</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum pilar acima de 70. Foque na evolução estrutural.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evolution Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            Plano de Evolução
          </CardTitle>
          <CardDescription>Ações sugeridas para elevar o nível de maturidade</CardDescription>
        </CardHeader>
        <CardContent>
          {imc.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {imc.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex-shrink-0">
                    {i + 1}
                  </div>
                  <span className="text-sm text-foreground">{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Operação madura. Mantenha a disciplina atual e monitore continuamente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
