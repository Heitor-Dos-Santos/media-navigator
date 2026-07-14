import { AppLayout } from "@/components/layout/AppLayout";
import { OperationalChecklist } from "@/components/checklists/OperationalChecklist";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, ListChecks, Settings } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function Checklists() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Checklists Operacionais</h1><PageInfoTooltip description="Acompanhe tarefas operacionais pré, durante e pós-campanha com checklists customizáveis por tipo de ação." /></div>
          <p className="text-sm text-muted-foreground">Acompanhe tarefas pré, durante e pós-campanha</p>
        </div>
        <Tabs defaultValue="campaign" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="campaign" className="flex items-center gap-2"><CheckSquare className="w-4 h-4" />Campanha</TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2"><ListChecks className="w-4 h-4" />Templates</TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2"><Settings className="w-4 h-4" />Configurar</TabsTrigger>
          </TabsList>
          <TabsContent value="campaign" className="mt-6"><div className="max-w-2xl"><OperationalChecklist /></div></TabsContent>
          <TabsContent value="templates" className="mt-6"><div className="text-center py-12 text-muted-foreground"><ListChecks className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Templates de checklist em breve</p></div></TabsContent>
          <TabsContent value="config" className="mt-6"><div className="text-center py-12 text-muted-foreground"><Settings className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>Configurações de checklist em breve</p></div></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
