import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building, TrendingUp, DollarSign, Target, Heart, AlertTriangle, ArrowUp } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function AgencyIndex() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Índice da Agência</h1>
              <PageInfoTooltip description="Dashboard de transparência com indicadores de performance, cultura e saúde organizacional da agência." />
              <Badge variant="outline" className="text-xs">Cultura</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Dashboard de transparência com indicadores de performance para toda a empresa
            </p>
          </div>
        </div>

        {/* Main Index Score */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 border-4 border-primary/20">
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">—</p>
                  <p className="text-xs text-muted-foreground">de 100</p>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h2 className="text-xl font-bold text-foreground">Índice Global de Eficiência</h2>
                <p className="text-sm text-muted-foreground">
                  Score agregado de toda a operação da agência. Será calculado com base nos
                  módulos de Eficiência, Auditoria e Rentabilidade.
                </p>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <ArrowUp className="w-3 h-3" />
                    Melhoria vs. mês anterior: —
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Economia Total (Mês)</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Melhoria vs. Anterior</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Heart className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contas Saudáveis</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-red-500/10">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contas Críticas</p>
                  <p className="text-2xl font-bold text-foreground">—</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visual Progress Indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Progresso em Direção à Meta de Eficiência
            </CardTitle>
            <CardDescription>
              Indicador visual de progresso em relação ao target de eficiência da agência
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meta: 115% de eficiência</span>
                <span className="font-medium text-muted-foreground">—%</span>
              </div>
              <Progress value={0} className="h-4" />
            </div>

            <div className="flex items-center justify-center h-32 rounded-xl bg-muted/30 border-2 border-dashed border-border">
              <div className="text-center space-y-2">
                <Building className="w-10 h-10 mx-auto text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Dados serão populados na Fase 2
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phase 2 Notice */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Agency Index - Fase 2</p>
              <p className="text-sm text-muted-foreground mt-1">
                Este painel de transparência company-wide será alimentado com dados reais de
                eficiência, economia e saúde das contas. Todos os colaboradores terão visibilidade
                sobre o desempenho geral da agência.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
