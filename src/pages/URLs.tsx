import { AppLayout } from "@/components/layout/AppLayout";
import { UTMBuilder } from "@/components/urls/UTMBuilder";
import { URLHistory } from "@/components/urls/URLHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, History } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function URLs() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">URLs & UTMs</h1><PageInfoTooltip description="Gere URLs com parâmetros UTM padronizados para tracking de campanhas. Valide e exporte em massa." /></div>
          <p className="text-sm text-muted-foreground">Gere e valide URLs com parâmetros de tracking</p>
        </div>
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="builder" className="flex items-center gap-2"><Link2 className="w-4 h-4" />Builder</TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2"><History className="w-4 h-4" />Histórico</TabsTrigger>
          </TabsList>
          <TabsContent value="builder" className="mt-6"><div className="max-w-2xl"><UTMBuilder /></div></TabsContent>
          <TabsContent value="history" className="mt-6"><div className="max-w-3xl"><URLHistory /></div></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
