import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatableSelect } from "@/components/planning/CreatableSelect";
import { Copy, Check, AlertCircle, RefreshCw, Megaphone, FileText, Layers, Image } from "lucide-react";

type TaxonomyType = "campaign" | "io" | "lineitem" | "creative";

const useOptions = (initialOptions: string[]) => {
  const [options, setOptions] = useState(initialOptions);
  const addOption = (newOption: string) => { if (!options.includes(newOption)) setOptions([...options, newOption]); };
  return { options, addOption };
};

interface CampaignFields { piNumber: string; nome: string; contexto: string; periodo: string; }
interface IOFields { piNumber: string; etapaFunil: string; formato: string; periodo: string; }
interface LineItemFields { piNumber: string; data: string; etapa: string; formato: string; tipoCompra: string; segmentacao: string; contexto: string; }
interface CreativeFields { data: string; formato: string; contexto: string; }

const tabColors: Record<TaxonomyType, { bg: string; border: string; text: string }> = {
  campaign: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400" },
  io: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
  lineitem: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400" },
  creative: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600 dark:text-purple-400" },
};

export function TaxonomyBuilder() {
  const [activeTab, setActiveTab] = useState<TaxonomyType>("campaign");
  const [copied, setCopied] = useState(false);
  const [campaignFields, setCampaignFields] = useState<CampaignFields>({ piNumber: "", nome: "", contexto: "", periodo: "" });
  const [ioFields, setIOFields] = useState<IOFields>({ piNumber: "", etapaFunil: "", formato: "", periodo: "" });
  const [lineItemFields, setLineItemFields] = useState<LineItemFields>({ piNumber: "", data: "", etapa: "", formato: "", tipoCompra: "", segmentacao: "", contexto: "" });
  const [creativeFields, setCreativeFields] = useState<CreativeFields>({ data: "", formato: "", contexto: "" });

  const etapaOptions = useOptions(["TOFU", "MOFU", "BOFU"]);
  const formatoIOOptions = useOptions(["Display", "Video", "Native", "Audio", "Youtube"]);
  const formatoLineItemOptions = useOptions(["Display", "Video", "Native", "Audio", "Youtube", "CTV", "DOOH"]);
  const formatoCreativeOptions = useOptions(["Video", "Display", "Native", "Audio"]);
  const tipoCompraOptions = useOptions(["RTB", "PMP", "PG", "PA"]);
  const segmentacaoOptions = useOptions(["Contextual", "Demographics", "Geo", "In Market", "Affinity", "3rd Party"]);

  const formatValue = (value: string): string => {
    if (!value) return "";
    let formatted = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const segments = formatted.split("-").map(segment => {
      let seg = segment.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
      seg = seg.split("_").filter(w => w.length > 0).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("_");
      return seg;
    }).filter(s => s.length > 0);
    return segments.join("-");
  };

  const generateTaxonomy = (): string => {
    let parts: string[] = [];
    switch (activeTab) {
      case "campaign": parts = [campaignFields.piNumber, campaignFields.nome, campaignFields.contexto, campaignFields.periodo]; break;
      case "io": parts = [ioFields.piNumber, ioFields.etapaFunil, ioFields.formato, ioFields.periodo]; break;
      case "lineitem": parts = [lineItemFields.piNumber, lineItemFields.data, lineItemFields.etapa, lineItemFields.formato, lineItemFields.tipoCompra, lineItemFields.segmentacao, lineItemFields.contexto]; break;
      case "creative": parts = [creativeFields.data, creativeFields.formato, creativeFields.contexto]; break;
    }
    return parts.filter(p => p && p.trim()).map(p => formatValue(p)).join("-");
  };

  const getValidationStatus = () => { const taxonomy = generateTaxonomy(); if (!taxonomy) return "empty"; if (taxonomy.length > 100) return "warning"; return "valid"; };
  const taxonomy = generateTaxonomy();
  const validationStatus = getValidationStatus();
  const handleCopy = () => { navigator.clipboard.writeText(taxonomy); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleReset = () => {
    switch (activeTab) {
      case "campaign": setCampaignFields({ piNumber: "", nome: "", contexto: "", periodo: "" }); break;
      case "io": setIOFields({ piNumber: "", etapaFunil: "", formato: "", periodo: "" }); break;
      case "lineitem": setLineItemFields({ piNumber: "", data: "", etapa: "", formato: "", tipoCompra: "", segmentacao: "", contexto: "" }); break;
      case "creative": setCreativeFields({ data: "", formato: "", contexto: "" }); break;
    }
  };

  const currentColors = tabColors[activeTab];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaxonomyType)}>
        <TabsList className="grid grid-cols-4 bg-muted/30 p-1 h-auto gap-1">
          <TabsTrigger value="campaign" className={cn("gap-2 text-xs sm:text-sm py-3 data-[state=active]:shadow-sm transition-all", "data-[state=active]:bg-blue-500/15 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400")}><Megaphone className="w-4 h-4" /><span className="hidden sm:inline">Campanhas</span><span className="sm:hidden">Camp.</span></TabsTrigger>
          <TabsTrigger value="io" className={cn("gap-2 text-xs sm:text-sm py-3 data-[state=active]:shadow-sm transition-all", "data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400")}><FileText className="w-4 h-4" /><span>IOs</span></TabsTrigger>
          <TabsTrigger value="lineitem" className={cn("gap-2 text-xs sm:text-sm py-3 data-[state=active]:shadow-sm transition-all", "data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400")}><Layers className="w-4 h-4" /><span className="hidden sm:inline">Line Items</span><span className="sm:hidden">L.Items</span></TabsTrigger>
          <TabsTrigger value="creative" className={cn("gap-2 text-xs sm:text-sm py-3 data-[state=active]:shadow-sm transition-all", "data-[state=active]:bg-purple-500/15 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400")}><Image className="w-4 h-4" /><span className="hidden sm:inline">Criativos</span><span className="sm:hidden">Criat.</span></TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="mt-6">
          <div className={cn("p-5 rounded-xl border", currentColors.bg, currentColors.border)}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="space-y-2"><Label className="text-sm font-medium">Nº PI</Label><Input value={campaignFields.piNumber} onChange={(e) => setCampaignFields({ ...campaignFields, piNumber: e.target.value })} placeholder="Ex: 110226-01" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Nome da Campanha</Label><Input value={campaignFields.nome} onChange={(e) => setCampaignFields({ ...campaignFields, nome: e.target.value })} placeholder="Ex: BlackFriday2024" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Contexto</Label><Input value={campaignFields.contexto} onChange={(e) => setCampaignFields({ ...campaignFields, contexto: e.target.value })} placeholder="Informação adicional" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Período</Label><Input value={campaignFields.periodo} onChange={(e) => setCampaignFields({ ...campaignFields, periodo: e.target.value })} placeholder="Ex: NOV24" className="h-10 bg-background" /></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="io" className="mt-6">
          <div className={cn("p-5 rounded-xl border", currentColors.bg, currentColors.border)}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <div className="space-y-2"><Label className="text-sm font-medium">Nº PI</Label><Input value={ioFields.piNumber} onChange={(e) => setIOFields({ ...ioFields, piNumber: e.target.value })} placeholder="Ex: 110226-01" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Etapa do Funil</Label><CreatableSelect value={ioFields.etapaFunil} options={etapaOptions.options} onValueChange={(v) => setIOFields({ ...ioFields, etapaFunil: v })} onCreateOption={etapaOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Formato</Label><CreatableSelect value={ioFields.formato} options={formatoIOOptions.options} onValueChange={(v) => setIOFields({ ...ioFields, formato: v })} onCreateOption={formatoIOOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Período</Label><Input value={ioFields.periodo} onChange={(e) => setIOFields({ ...ioFields, periodo: e.target.value })} placeholder="Ex: NOV24" className="h-10 bg-background" /></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lineitem" className="mt-6">
          <div className={cn("p-5 rounded-xl border", currentColors.bg, currentColors.border)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2"><Label className="text-sm font-medium">Nº PI</Label><Input value={lineItemFields.piNumber} onChange={(e) => setLineItemFields({ ...lineItemFields, piNumber: e.target.value })} placeholder="Ex: 110226-01" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Data</Label><Input value={lineItemFields.data} onChange={(e) => setLineItemFields({ ...lineItemFields, data: e.target.value })} placeholder="Ex: 20241115" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Etapa</Label><CreatableSelect value={lineItemFields.etapa} options={etapaOptions.options} onValueChange={(v) => setLineItemFields({ ...lineItemFields, etapa: v })} onCreateOption={etapaOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Formato</Label><CreatableSelect value={lineItemFields.formato} options={formatoLineItemOptions.options} onValueChange={(v) => setLineItemFields({ ...lineItemFields, formato: v })} onCreateOption={formatoLineItemOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Tipo de Compra</Label><CreatableSelect value={lineItemFields.tipoCompra} options={tipoCompraOptions.options} onValueChange={(v) => setLineItemFields({ ...lineItemFields, tipoCompra: v })} onCreateOption={tipoCompraOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Segmentação</Label><CreatableSelect value={lineItemFields.segmentacao} options={segmentacaoOptions.options} onValueChange={(v) => setLineItemFields({ ...lineItemFields, segmentacao: v })} onCreateOption={segmentacaoOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Contexto</Label><Input value={lineItemFields.contexto} onChange={(e) => setLineItemFields({ ...lineItemFields, contexto: e.target.value })} placeholder="Informação adicional" className="h-10 bg-background" /></div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="creative" className="mt-6">
          <div className={cn("p-5 rounded-xl border", currentColors.bg, currentColors.border)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2"><Label className="text-sm font-medium">Data</Label><Input value={creativeFields.data} onChange={(e) => setCreativeFields({ ...creativeFields, data: e.target.value })} placeholder="Ex: 20241115" className="h-10 bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Formato</Label><CreatableSelect value={creativeFields.formato} options={formatoCreativeOptions.options} onValueChange={(v) => setCreativeFields({ ...creativeFields, formato: v })} onCreateOption={formatoCreativeOptions.addOption} placeholder="Selecionar..." className="w-full bg-background" /></div>
              <div className="space-y-2"><Label className="text-sm font-medium">Contexto</Label><Input value={creativeFields.contexto} onChange={(e) => setCreativeFields({ ...creativeFields, contexto: e.target.value })} placeholder="Informação adicional" className="h-10 bg-background" /></div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className={cn("p-5 rounded-xl border", currentColors.bg, currentColors.border)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">Preview da Taxonomia</Label>
            <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2 text-xs"><RefreshCw className="w-3 h-3 mr-1" />Limpar</Button>
          </div>
          <Badge variant="outline" className={cn("text-xs", validationStatus === "valid" && "border-status-success text-status-success", validationStatus === "warning" && "border-status-warning text-status-warning", validationStatus === "empty" && "border-muted text-muted-foreground")}>
            {validationStatus === "valid" && <><Check className="w-3 h-3 mr-1" />Válido</>}
            {validationStatus === "warning" && <><AlertCircle className="w-3 h-3 mr-1" />+100 caracteres</>}
            {validationStatus === "empty" && "Preencha os campos"}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 p-4 rounded-lg bg-background font-mono text-sm text-foreground break-all min-h-[52px] flex items-center border border-border">{taxonomy || <span className="text-muted-foreground">Configure os campos acima...</span>}</code>
          <Button variant="outline" size="icon" onClick={handleCopy} disabled={!taxonomy} className="shrink-0 h-10 w-10">{copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}</Button>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{taxonomy.length} caracteres</span>
          <span className={cn(taxonomy.length > 100 && "text-status-warning")}>Limite recomendado: 100</span>
        </div>
      </div>
    </div>
  );
}
