import { useState, useRef, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAgency } from "@/contexts/TenantContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Globe, Image, Upload, X, Save, FileText, Type } from "lucide-react";
import { toast } from "sonner";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const FONT_OPTIONS = [
  { value: "Sora", label: "Sora", category: "Geométrica / Moderna" },
  { value: "Inter", label: "Inter", category: "Neutra / Versátil" },
  { value: "Poppins", label: "Poppins", category: "Arredondada / Amigável" },
  { value: "Manrope", label: "Manrope", category: "Geométrica / Limpa" },
  { value: "DM Sans", label: "DM Sans", category: "Sans-serif / Elegante" },
  { value: "Space Grotesk", label: "Space Grotesk", category: "Futurista / Tech" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", category: "Moderna / Premium" },
  { value: "Outfit", label: "Outfit", category: "Geométrica / Minimalista" },
];

/** Load a Google Font dynamically */
function loadGoogleFont(fontFamily: string) {
  const id = `gfont-${fontFamily.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export default function TenantSettings() {
  const { agency, updateAgency } = useAgency();
  const [localState, setLocalState] = useState({
    agencyName: agency.agencyName,
    brandColor: agency.brandColor,
    fontFamily: agency.fontFamily || "Sora",
    customDomain: agency.customDomain || "",
    reportBrandingEnabled: agency.reportBrandingEnabled,
    logo: agency.logo,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load all font options for preview
  useEffect(() => {
    FONT_OPTIONS.forEach(f => loadGoogleFont(f.value));
  }, []);

  const update = <K extends keyof typeof localState>(key: K, value: (typeof localState)[K]) => {
    setLocalState(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateAgency({
      agencyName: localState.agencyName,
      brandColor: localState.brandColor,
      fontFamily: localState.fontFamily,
      customDomain: localState.customDomain || null,
      reportBrandingEnabled: localState.reportBrandingEnabled,
      logo: localState.logo,
    });
    setHasChanges(false);
    toast.success("Configurações da agência salvas com sucesso!");
  };

  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (event.target) event.target.value = "";
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Máximo 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        update("logo", reader.result);
        toast.success("Logo carregado!");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><h1 className="text-2xl font-bold text-foreground">Configurações da Agência</h1><PageInfoTooltip description="Personalize a identidade visual da agência com logo, cores e configurações de white-label." /></div>
            <p className="text-sm text-muted-foreground">Configurações de white-label e personalização da agência</p>
          </div>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />Salvar
          </Button>
        </div>

        {/* Agency Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Image className="w-5 h-5" />Identidade da Agência</CardTitle>
            <CardDescription>Logo e nome exibidos em relatórios e na interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Agência</Label>
              <Input value={localState.agencyName} onChange={e => update("agencyName", e.target.value)} placeholder="Nome da agência" />
            </div>
            <div>
              <Label>Logo</Label>
              {localState.logo ? (
                <div className="flex items-center gap-4 mt-2">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <img src={localState.logo} alt="Logo" className="h-16 max-w-[200px] object-contain" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Alterar</Button>
                    <Button variant="ghost" size="sm" onClick={() => update("logo", null)} className="text-destructive"><X className="w-4 h-4 mr-2" />Remover</Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mt-2" onClick={() => fileInputRef.current?.click()}>
                  <Image className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para fazer upload do logo</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou SVG (máx. 2MB)</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
            </div>
          </CardContent>
        </Card>

        {/* Brand Color */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Palette className="w-5 h-5" />Cor da Marca</CardTitle>
            <CardDescription>Cor primária aplicada na interface e relatórios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={localState.brandColor.startsWith("#") ? localState.brandColor : "#7c3aed"}
                onChange={e => update("brandColor", e.target.value)}
                className="w-12 h-12 rounded-lg border cursor-pointer p-0.5"
              />
              <Input
                value={localState.brandColor}
                onChange={e => update("brandColor", e.target.value)}
                placeholder="#7c3aed ou hsl(262, 83%, 58%)"
                className="max-w-xs font-mono"
              />
              <Badge variant="outline" className="text-xs">HEX ou HSL</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Use o seletor de cor ou insira o código hexadecimal (ex: #FF5500)</p>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Type className="w-5 h-5" />Tipografia</CardTitle>
            <CardDescription>Fonte utilizada na interface e documentos exportados (PDF/Excel)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Família tipográfica</Label>
              <Select value={localState.fontFamily} onValueChange={v => update("fontFamily", v)}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Selecione a fonte" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map(f => (
                    <SelectItem key={f.value} value={f.value}>
                      <span style={{ fontFamily: `'${f.value}', sans-serif` }}>{f.label}</span>
                      <span className="text-muted-foreground text-xs ml-2">— {f.category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Preview */}
            <div className="border rounded-lg p-6 bg-muted/30 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Preview</p>
              <p style={{ fontFamily: `'${localState.fontFamily}', sans-serif`, fontSize: "28px", fontWeight: 700, lineHeight: 1.2 }}>
                {localState.agencyName || "Nome da Agência"}
              </p>
              <p style={{ fontFamily: `'${localState.fontFamily}', sans-serif`, fontSize: "16px", fontWeight: 400, color: "var(--muted-foreground)" }}>
                Planejamento de mídia profissional com a fonte <strong>{localState.fontFamily}</strong>.
              </p>
              <p style={{ fontFamily: `'${localState.fontFamily}', sans-serif`, fontSize: "13px", fontWeight: 300 }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5" />Domínio Personalizado</CardTitle>
            <CardDescription>Configure um domínio personalizado para acesso à plataforma (placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input value={localState.customDomain} onChange={e => update("customDomain", e.target.value)} placeholder="app.suaagencia.com.br" />
              <p className="text-xs text-muted-foreground">Funcionalidade disponível em breve. Configure o CNAME do seu domínio para ativar.</p>
            </div>
          </CardContent>
        </Card>

        {/* Report Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" />Branding em Relatórios</CardTitle>
            <CardDescription>Exibir logo e cores da agência em relatórios exportados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Ativar branding nos relatórios</p>
                <p className="text-xs text-muted-foreground">Logo e cores serão aplicados em PDFs e exports</p>
              </div>
              <Switch checked={localState.reportBrandingEnabled} onCheckedChange={v => update("reportBrandingEnabled", v)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
