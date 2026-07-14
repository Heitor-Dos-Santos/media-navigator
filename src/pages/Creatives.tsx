import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormatSelector } from "@/components/creatives/FormatSelector";
import { SelectedSpecsTable } from "@/components/creatives/SelectedSpecsTable";
import { GovernancePanel } from "@/components/creatives/GovernancePanel";
import { CreativeSpecs, type CreativeSpec } from "@/components/planning/CreativeSpecs";
import { type CreativeSpecDefinition } from "@/data/creativeSpecs";
import { Image, Database, Upload, Shield } from "lucide-react";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function Creatives() {
  const [activeTab, setActiveTab] = useState("library");
  const [selectedSpecs, setSelectedSpecs] = useState<CreativeSpecDefinition[]>([]);
  const [customSpecs, setCustomSpecs] = useState<CreativeSpec[]>([]);

  const handleRemoveSpec = (specId: string) => { setSelectedSpecs((prev) => prev.filter((s) => s.id !== specId)); };
  const handleClearAll = () => { setSelectedSpecs([]); };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="animate-slide-up">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Image className="w-7 h-7 text-primary" />
            Criativos & Formatos
            <PageInfoTooltip description="Biblioteca técnica governada de especificações criativas. Base relacional inteligente integrada ao planejamento." />
          </h1>
          <p className="text-muted-foreground mt-1">Biblioteca técnica governada · Base relacional · Integrada ao planejamento</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-slide-up delay-100">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="library" className="flex items-center gap-2"><Database className="w-4 h-4" />Biblioteca de Specs</TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2"><Upload className="w-4 h-4" />Specs Customizadas</TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-2"><Shield className="w-4 h-4" />Governança</TabsTrigger>
          </TabsList>
          <TabsContent value="library" className="mt-6">
            <div className="flex flex-col gap-6">
              <FormatSelector selectedSpecs={selectedSpecs} onSelectionChange={setSelectedSpecs} />
              <SelectedSpecsTable selectedSpecs={selectedSpecs} onRemoveSpec={handleRemoveSpec} onClearAll={handleClearAll} />
            </div>
          </TabsContent>
          <TabsContent value="custom" className="mt-6"><CreativeSpecs specs={customSpecs} onSpecsChange={setCustomSpecs} /></TabsContent>
          <TabsContent value="governance" className="mt-6"><GovernancePanel /></TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
