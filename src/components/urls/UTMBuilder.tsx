import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreatableSelect } from "@/components/planning/CreatableSelect";
import { Copy, Check, AlertCircle, RefreshCw, Link2, Plus, Trash2 } from "lucide-react";

interface UTMParam { id: string; key: string; value: string; required: boolean; }

const defaultUTMParams: UTMParam[] = [
  { id: "source", key: "utm_source", value: "", required: true },
  { id: "medium", key: "utm_medium", value: "", required: true },
  { id: "campaign", key: "utm_campaign", value: "", required: true },
  { id: "content", key: "utm_content", value: "", required: false },
  { id: "term", key: "utm_term", value: "", required: false },
];

const useOptions = (initialOptions: string[]) => {
  const [options, setOptions] = useState(initialOptions);
  const addOption = (newOption: string) => { if (!options.includes(newOption)) setOptions([...options, newOption]); };
  return { options, addOption };
};

export function UTMBuilder() {
  const [baseUrl, setBaseUrl] = useState("");
  const [params, setParams] = useState<UTMParam[]>(defaultUTMParams);
  const [customParams, setCustomParams] = useState<UTMParam[]>([]);
  const [copied, setCopied] = useState(false);
  const sourceOptions = useOptions(["google", "meta", "dv360", "tiktok", "linkedin", "twitter", "email", "organic"]);
  const mediumOptions = useOptions(["cpc", "cpm", "social", "email", "display", "video", "native", "affiliate"]);

  const updateParam = (id: string, value: string) => { setParams(params.map(p => p.id === id ? { ...p, value } : p)); };
  const updateCustomParam = (id: string, field: "key" | "value", newValue: string) => { setCustomParams(customParams.map(p => p.id === id ? { ...p, [field]: newValue } : p)); };
  const addCustomParam = () => { setCustomParams([...customParams, { id: `custom_${Date.now()}`, key: "", value: "", required: false }]); };
  const removeCustomParam = (id: string) => { setCustomParams(customParams.filter(p => p.id !== id)); };

  const generateURL = (): string => {
    if (!baseUrl.trim()) return "";
    const allParams = [...params, ...customParams].filter(p => p.key && p.value);
    if (allParams.length === 0) return baseUrl;
    const queryString = allParams.map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join("&");
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${queryString}`;
  };

  const getValidationStatus = () => {
    if (!baseUrl.trim()) return "error";
    try { new URL(baseUrl); } catch { return "error"; }
    const missingRequired = params.filter(p => p.required && !p.value.trim());
    if (missingRequired.length > 0) return "warning";
    const url = generateURL();
    if (url.length > 2048) return "warning";
    return "valid";
  };

  const validationStatus = getValidationStatus();
  const generatedURL = generateURL();
  const handleCopy = () => { navigator.clipboard.writeText(generatedURL); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleReset = () => { setBaseUrl(""); setParams(defaultUTMParams); setCustomParams([]); };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm flex items-center gap-2"><Link2 className="w-4 h-4" />URL Base<span className="text-status-error">*</span></Label>
        <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://exemplo.com.br/landing-page" className="font-mono text-sm" />
      </div>
      <div className="p-4 rounded-xl bg-muted/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Parâmetros UTM</h3>
          <Button variant="ghost" size="sm" onClick={handleReset}><RefreshCw className="w-4 h-4 mr-2" />Reset</Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {params.map((param) => (
            <div key={param.id} className="space-y-1.5">
              <Label className="text-xs flex items-center gap-2">{param.key}{param.required && <span className="text-status-error">*</span>}</Label>
              {param.id === "source" ? <CreatableSelect value={param.value} options={sourceOptions.options} onValueChange={(v) => updateParam(param.id, v)} onCreateOption={sourceOptions.addOption} placeholder="Selecione..." className="w-full" />
              : param.id === "medium" ? <CreatableSelect value={param.value} options={mediumOptions.options} onValueChange={(v) => updateParam(param.id, v)} onCreateOption={mediumOptions.addOption} placeholder="Selecione..." className="w-full" />
              : <Input value={param.value} onChange={(e) => updateParam(param.id, e.target.value)} placeholder={`Digite ${param.key}...`} />}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 rounded-xl bg-muted/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Parâmetros Customizados</h3>
          <Button variant="outline" size="sm" onClick={addCustomParam}><Plus className="w-4 h-4 mr-2" />Adicionar</Button>
        </div>
        {customParams.length > 0 ? (
          <div className="space-y-3">
            {customParams.map((param) => (
              <div key={param.id} className="flex items-center gap-3">
                <Input value={param.key} onChange={(e) => updateCustomParam(param.id, "key", e.target.value)} placeholder="Chave (ex: gclid)" className="flex-1" />
                <span className="text-muted-foreground">=</span>
                <Input value={param.value} onChange={(e) => updateCustomParam(param.id, "value", e.target.value)} placeholder="Valor" className="flex-1" />
                <Button variant="ghost" size="icon" onClick={() => removeCustomParam(param.id)} className="shrink-0 text-muted-foreground hover:text-status-error"><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-muted-foreground text-center py-2">Nenhum parâmetro customizado adicionado</p>}
      </div>
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-sm text-muted-foreground">URL Gerada</Label>
          <Badge variant="outline" className={cn(validationStatus === "valid" && "border-status-success text-status-success", validationStatus === "warning" && "border-status-warning text-status-warning", validationStatus === "error" && "border-status-error text-status-error")}>
            {validationStatus === "valid" && <><Check className="w-3 h-3 mr-1" />Válida</>}
            {validationStatus === "warning" && <><AlertCircle className="w-3 h-3 mr-1" />Atenção</>}
            {validationStatus === "error" && <><AlertCircle className="w-3 h-3 mr-1" />URL inválida</>}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 rounded-lg bg-muted font-mono text-xs text-foreground break-all max-h-24 overflow-y-auto">{generatedURL || "Configure os campos acima..."}</code>
          <Button size="icon" onClick={handleCopy} disabled={!generatedURL || validationStatus === "error"} className="shrink-0 bg-status-success hover:bg-status-success/90 text-white">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</Button>
        </div>
        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span>{generatedURL.length} caracteres</span>
          <span className={cn(generatedURL.length > 2048 && "text-status-error")}>Limite: 2048</span>
        </div>
      </div>
    </div>
  );
}
