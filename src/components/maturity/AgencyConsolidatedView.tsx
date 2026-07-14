import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, AlertTriangle, TrendingUp, TrendingDown, Minus, Target,
  ChevronLeft, ChevronRight, Database, Megaphone, ShieldCheck, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MetricTooltip } from "@/components/intelligence/MetricTooltip";
import { imcClassificationMeta, IMC_COMPONENT_LABELS, type IMCScore, type AgencyIMCSummary } from "@/types/imc";

const PAGE_SIZE = 10;

const COMPONENT_ICONS: Record<string, any> = {
  dataStructure: Database,
  mediaStructure: Megaphone,
  governance: ShieldCheck,
  intelligenceUsage: Brain,
};

function getWeakestPillar(imc: IMCScore): string {
  const entries = Object.entries(imc.components) as [keyof typeof imc.components, number][];
  const weakest = entries.sort((a, b) => a[1] - b[1])[0];
  return IMC_COMPONENT_LABELS[weakest[0]].label;
}

interface Props {
  summary: AgencyIMCSummary;
  onSelectClient: (id: string) => void;
}

export function AgencyConsolidatedView({ summary, onSelectClient }: Props) {
  const [page, setPage] = useState(0);
  const agencyMeta = imcClassificationMeta[summary.classification];
  const totalPages = Math.ceil(summary.clientScores.length / PAGE_SIZE);
  const pagedClients = useMemo(
    () => summary.clientScores.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [summary.clientScores, page]
  );

  return (
    <div className="space-y-6">
      {/* Top cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Agency IMC */}
        <Card className={cn("border-2", agencyMeta.border)}>
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <MetricTooltip metricKey="imc_score">
                <p className="text-xs text-muted-foreground font-medium">IMC Médio da Agência</p>
              </MetricTooltip>
              <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-muted/30">
                <div className="text-center">
                  <p className={cn("text-4xl font-bold", agencyMeta.color)}>{summary.averageIMC}</p>
                  <p className="text-xs text-muted-foreground">/100</p>
                </div>
              </div>
              <Badge className={cn("text-xs border", agencyMeta.bg, agencyMeta.color, agencyMeta.border)}>
                {summary.classificationLabel}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <Users className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{summary.clientScores.length}</p>
                <p className="text-xs text-muted-foreground">Clientes Avaliados</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <AlertTriangle className="w-5 h-5 text-status-error mx-auto mb-2" />
                <p className="text-2xl font-bold text-status-error">{summary.clientsBelowThreshold}</p>
                <p className="text-xs text-muted-foreground">Abaixo de 60</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <TrendingUp className="w-5 h-5 text-status-success mx-auto mb-2" />
                <p className="text-2xl font-bold text-status-success">{summary.distribution.avancado + summary.distribution.estrategico}</p>
                <p className="text-xs text-muted-foreground">Estratégico+</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 text-center">
                <Target className="w-5 h-5 text-status-warning mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{summary.distribution.estruturado + summary.distribution.basico}</p>
                <p className="text-xs text-muted-foreground">Precisam Evoluir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Classificação</CardTitle>
          <CardDescription>Visão geral da maturidade dos clientes da agência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {(["avancado", "estrategico", "estruturado", "basico"] as const).map(cls => {
              const meta = imcClassificationMeta[cls];
              const count = summary.distribution[cls];
              const pct = summary.clientScores.length > 0 ? Math.round((count / summary.clientScores.length) * 100) : 0;
              return (
                <div key={cls} className={cn("p-4 rounded-lg border text-center", meta.border, meta.bg)}>
                  <p className={cn("text-2xl font-bold", meta.color)}>{count}</p>
                  <p className={cn("text-xs font-medium", meta.color)}>{meta.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pillar Averages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Média por Pilar de Maturidade</CardTitle>
          <CardDescription>Onde a agência como um todo precisa evoluir</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(IMC_COMPONENT_LABELS) as (keyof typeof IMC_COMPONENT_LABELS)[]).map(key => {
              const comp = IMC_COMPONENT_LABELS[key];
              const Icon = COMPONENT_ICONS[key];
              const avg = summary.clientScores.length > 0
                ? Math.round(summary.clientScores.reduce((s, c) => s + c.components[key], 0) / summary.clientScores.length)
                : 0;
              const metricKeys: Record<string, string> = {
                dataStructure: "imc_data_structure",
                mediaStructure: "imc_media_structure",
                governance: "imc_governance",
                intelligenceUsage: "imc_intelligence_usage",
              };
              return (
                <div key={key} className="p-4 rounded-lg bg-muted/30 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <MetricTooltip metricKey={metricKeys[key]}>
                      <span className="text-sm font-medium text-foreground">{comp.label}</span>
                    </MetricTooltip>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{comp.weight}</span>
                      <span className={cn("font-bold", avg >= 70 ? "text-status-success" : avg >= 55 ? "text-status-warning" : "text-status-error")}>{avg}</span>
                    </div>
                    <Progress value={avg} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Paginated Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ranking de Maturidade por Cliente</CardTitle>
          <CardDescription>Clique no cliente para ver detalhes — Página {page + 1} de {totalPages}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-center">IMC</TableHead>
                <TableHead className="text-center">Classificação</TableHead>
                <TableHead className="hidden md:table-cell">Pilar mais fraco</TableHead>
                <TableHead className="text-center">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedClients.map((imc, idx) => {
                const meta = imcClassificationMeta[imc.classification];
                const TrendIcon = imc.trend === "up" ? TrendingUp : imc.trend === "down" ? TrendingDown : Minus;
                return (
                  <TableRow
                    key={imc.clientId}
                    className="cursor-pointer"
                    onClick={() => onSelectClient(imc.clientId)}
                  >
                    <TableCell className="font-medium text-muted-foreground">{page * PAGE_SIZE + idx + 1}</TableCell>
                    <TableCell className="font-medium">{imc.clientName}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn("text-lg font-bold", meta.color)}>{imc.score}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-[10px] border", meta.bg, meta.color, meta.border)}>{imc.classificationLabel}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {getWeakestPillar(imc)}
                    </TableCell>
                    <TableCell className="text-center">
                      <TrendIcon className={cn("w-4 h-4 mx-auto", imc.trend === "up" ? "text-status-success" : imc.trend === "down" ? "text-status-error" : "text-muted-foreground")} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                {summary.clientScores.length} clientes no total
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
