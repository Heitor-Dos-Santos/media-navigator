import { AppLayout } from "@/components/layout/AppLayout";
import { TaxonomyBuilder } from "@/components/taxonomy/TaxonomyBuilder";
import { TaxonomyHistory } from "@/components/taxonomy/TaxonomyHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, History, Download, Upload } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function Taxonomy() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Taxonomia</h1>
              <PageInfoTooltip description="Crie e gerencie naming conventions padronizadas para campanhas, IOs e criativos. Use templates para acelerar a criação." />
              <Badge variant="secondary" className="text-xs">Core Module</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Crie e gerencie naming conventions padronizadas para campanhas, IOs, line items e criativos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"><Upload className="w-4 h-4 mr-2" />Importar</Button>
            <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar</Button>
          </div>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="builder" className="gap-2"><FileText className="w-4 h-4" />Gerador</TabsTrigger>
            <TabsTrigger value="history" className="gap-2"><History className="w-4 h-4" />Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="p-6 rounded-xl bg-card border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">Gerador de Taxonomia</h2>
              <TaxonomyBuilder />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-medium text-foreground mb-3">Limites por Plataforma</h3>
                <div className="space-y-2 text-sm">
                  {[["Google Ads","120"],["Meta Ads","100"],["DV360","150"],["TikTok","80"],["LinkedIn","128"]].map(([p,c])=>(
                    <div key={p} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{p}</span>
                      <span className="font-mono text-foreground">{c} chars</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border">
                <h3 className="font-medium text-foreground mb-3">Padrão Utilizado</h3>
                <div className="space-y-3">
                  {[["-","Separador entre campos"],["_","Substitui espaços"],["Aa","Title Case"]].map(([s,d])=>(
                    <div key={s} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-mono">{s}</Badge>
                      <span className="text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <h3 className="font-medium text-primary mb-2">💡 Dica de Eficiência</h3>
                <p className="text-sm text-muted-foreground">
                  Salve templates por cliente para acelerar a criação de novas campanhas e garantir consistência.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Histórico de Taxonomias</h2>
                <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-2" />Exportar Histórico</Button>
              </div>
              <TaxonomyHistory />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
