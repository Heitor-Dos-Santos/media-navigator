import { useState, useEffect, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Building2, Upload, X, Save, Image, Percent } from "lucide-react";
import { toast } from "sonner";
import { AgencySettings, createDefaultAgencySettings, DEFAULT_REBATE_TIERS } from "@/types/client";
import { formatCNPJ, formatPhone, formatStateRegistration, formatMunicipalRegistration, formatCEP } from "@/lib/inputMasks";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function Settings() {
  const [settings, setSettings] = useState<AgencySettings>(createDefaultAgencySettings());
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const stored = localStorage.getItem("agencySettings"); if (stored) setSettings(JSON.parse(stored)); }, []);

  const updateField = <K extends keyof AgencySettings>(field: K, value: AgencySettings[K]) => { setSettings(prev => ({ ...prev, [field]: value })); setHasChanges(true); };
  const handleSave = () => { if (!settings.companyName) { toast.error("Preencha o nome da empresa"); return; } const updatedSettings = { ...settings, updatedAt: new Date().toISOString() }; localStorage.setItem("agencySettings", JSON.stringify(updatedSettings)); setSettings(updatedSettings); setHasChanges(false); toast.success("Configurações salvas com sucesso!"); };
  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (event.target) event.target.value = ""; if (!file) return;
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) { toast.error("Por favor, selecione um arquivo de imagem válido (PNG, JPG ou SVG)"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("A imagem deve ter no máximo 2MB"); return; }
    const reader = new FileReader(); reader.onloadend = () => { const result = reader.result; if (typeof result === "string" && result.startsWith("data:")) { setSettings(prev => ({ ...prev, logo: result })); setHasChanges(true); toast.success("Logo carregado com sucesso!"); } else toast.error("Erro ao processar a imagem."); }; reader.onerror = () => toast.error("Erro ao ler o arquivo."); reader.readAsDataURL(file);
  }, []);
  const handleRemoveLogo = () => { updateField("logo", null); toast.success("Logo removido"); };

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold flex items-center gap-3"><SettingsIcon className="w-7 h-7 text-primary" />Configurações da Agência<PageInfoTooltip description="Configure dados da agência para preenchimento automático em PIs, planejamentos e relatórios." /></h1><p className="text-muted-foreground">Configure os dados da sua agência para preenchimento automático em PIs e planejamentos</p></div><Button onClick={handleSave} disabled={!hasChanges}><Save className="w-4 h-4 mr-2" />Salvar Configurações</Button></div>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Image className="w-5 h-5" />Logo da Agência</CardTitle><CardDescription>O logo será exibido automaticamente em todos os PIs e planejamentos exportados</CardDescription></CardHeader>
          <CardContent>{settings.logo ? (<div className="flex items-center gap-4"><div className="p-4 border rounded-lg bg-muted/50"><img src={settings.logo} alt="Logo da agência" className="h-16 max-w-[200px] object-contain" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div><div className="space-y-2"><Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Alterar Logo</Button><Button variant="ghost" size="sm" onClick={handleRemoveLogo} className="text-destructive"><X className="w-4 h-4 mr-2" />Remover</Button></div></div>) : (<div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}><Image className="w-12 h-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground mb-3">Arraste uma imagem ou clique para fazer upload</p><Button variant="outline" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}><Upload className="w-4 h-4 mr-2" />Carregar Logo</Button><p className="text-xs text-muted-foreground mt-2">PNG, JPG ou SVG (máx. 2MB)</p></div>)}<input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" onChange={handleLogoUpload} className="sr-only" /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-5 h-5" />Dados da Empresa</CardTitle><CardDescription>Informações fiscais e de cadastro da agência</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1"><Label>Razão Social *</Label><Input value={settings.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="Razão social da empresa" /></div>
              <div><Label>Nome Fantasia</Label><Input value={settings.tradeName || ""} onChange={(e) => updateField("tradeName", e.target.value)} placeholder="Nome fantasia" /></div>
              <div><Label>CNPJ</Label><Input value={settings.cnpj} onChange={(e) => updateField("cnpj", formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" /></div>
              <div><Label>Inscrição Estadual</Label><Input value={settings.stateRegistration || ""} onChange={(e) => updateField("stateRegistration", formatStateRegistration(e.target.value))} placeholder="Isento" /></div>
              <div><Label>Inscrição Municipal</Label><Input value={settings.municipalRegistration || ""} onChange={(e) => updateField("municipalRegistration", formatMunicipalRegistration(e.target.value))} placeholder="0.000.000-0" /></div>
            </div>
            <div className="border-t pt-4"><h4 className="font-medium mb-3">Endereço</h4><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><Label>Endereço</Label><Input value={settings.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Rua, número, complemento" /></div><div><Label>Cidade</Label><Input value={settings.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Cidade" /></div><div><Label>Estado</Label><Input value={settings.state} onChange={(e) => updateField("state", e.target.value)} placeholder="UF" /></div><div><Label>CEP</Label><Input value={settings.zipCode || ""} onChange={(e) => updateField("zipCode", formatCEP(e.target.value))} placeholder="00.000-000" /></div><div><Label>País</Label><Input value={settings.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Brasil" /></div></div></div>
            <div className="border-t pt-4"><h4 className="font-medium mb-3">Contato</h4><div className="grid grid-cols-2 gap-4"><div><Label>Nome do Responsável</Label><Input value={settings.responsibleName} onChange={(e) => updateField("responsibleName", e.target.value)} placeholder="Nome do responsável (para assinatura)" /></div><div><Label>Telefone</Label><Input value={settings.contactPhone} onChange={(e) => updateField("contactPhone", formatPhone(e.target.value))} placeholder="(00) 0.0000-0000" /></div><div><Label>Nome do Contato</Label><Input value={settings.contactName} onChange={(e) => updateField("contactName", e.target.value)} placeholder="Nome do contato" /></div><div><Label>Email</Label><Input type="email" value={settings.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} placeholder="email@agencia.com" /></div></div></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Percent className="w-5 h-5" />Faixas de Comissionamento (Rebate)</CardTitle><CardDescription>Configure o percentual de comissão por faixa de investimento.</CardDescription></CardHeader>
          <CardContent><div className="rounded-md border"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium">Faixa</th><th className="text-left p-3 font-medium">Investimento Mín.</th><th className="text-left p-3 font-medium">Investimento Máx.</th><th className="text-left p-3 font-medium">Comissão (%)</th></tr></thead><tbody>{(settings.rebateTiers || DEFAULT_REBATE_TIERS).map((tier, index) => (<tr key={index} className="border-b last:border-b-0"><td className="p-3 font-medium">{tier.label}</td><td className="p-3 text-muted-foreground">R$ {tier.minValue.toLocaleString("pt-BR")}</td><td className="p-3 text-muted-foreground">{tier.maxValue ? `R$ ${tier.maxValue.toLocaleString("pt-BR")}` : "Sem limite"}</td><td className="p-3"><div className="flex items-center gap-1 max-w-[100px]"><Input type="number" min={0} max={100} step={0.5} value={tier.percentage} onChange={(e) => { const tiers = [...(settings.rebateTiers || DEFAULT_REBATE_TIERS)]; tiers[index] = { ...tiers[index], percentage: parseFloat(e.target.value) || 0 }; updateField("rebateTiers", tiers); }} className="h-8 text-center" /><span className="text-muted-foreground">%</span></div></td></tr>))}</tbody></table></div></CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
