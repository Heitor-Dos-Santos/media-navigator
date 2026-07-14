import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useUpsertWhatsAppConfig, WhatsAppConfig, WhatsAppConfigInsert } from "@/hooks/useWhatsAppConfigs";
import { useEvolutionApiConfig } from "@/hooks/useEvolutionApiConfig";
import { AlertCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_TEMPLATE =
  "🔔 Novo lead recebido!\n\n👤 Nome: {{nome}}\n📧 Email: {{email}}\n📱 Telefone: {{telefone}}\n📢 Campanha: {{campanha}}";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData?: WhatsAppConfig | null;
  onNeedEvolution?: () => void;
}

export function WhatsAppConfigFormModal({ open, onOpenChange, initialData, onNeedEvolution }: Props) {
  const upsert = useUpsertWhatsAppConfig();
  const { toast } = useToast();
  const { data: evolutionConfig } = useEvolutionApiConfig();

  const [label, setLabel] = useState("");
  const [triggerType, setTriggerType] = useState<"page_id" | "ad_account_id" | "form_id">("page_id");
  const [triggerValue, setTriggerValue] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [phonesTo, setPhonesTo] = useState<string[]>([""]);
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [isActive, setIsActive] = useState(true);
  const [showTemplate, setShowTemplate] = useState(false);

  const isEditing = !!initialData;
  const hasEvolution = !!evolutionConfig?.is_active;

  useEffect(() => {
    if (open) {
      if (initialData) {
        setLabel(initialData.label);
        setTriggerType(initialData.trigger_type as "page_id" | "ad_account_id" | "form_id");
        setTriggerValue(initialData.trigger_value);
        setInstanceName(initialData.instance_name);
        const phones = initialData.phones_to?.length
          ? initialData.phones_to
          : initialData.phone_to
          ? [initialData.phone_to]
          : [""];
        setPhonesTo(phones);
        setMessageTemplate(initialData.message_template || DEFAULT_TEMPLATE);
        setIsActive(initialData.is_active);
      } else {
        setLabel("");
        setTriggerType("page_id");
        setTriggerValue("");
        setInstanceName("");
        setPhonesTo([""]);
        setMessageTemplate(DEFAULT_TEMPLATE);
        setIsActive(true);
        setShowTemplate(false);
      }
    }
  }, [initialData, open]);

  const addPhone = () => setPhonesTo((p) => [...p, ""]);
  const removePhone = (i: number) => setPhonesTo((p) => p.filter((_, idx) => idx !== i));
  const updatePhone = (i: number, val: string) =>
    setPhonesTo((p) => p.map((v, idx) => (idx === i ? val : v)));

  const validPhones = phonesTo.filter((p) => p.trim().length > 0);
  const isValid = label && triggerValue && instanceName && validPhones.length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    const cleaned = validPhones.map((p) => p.replace(/\D/g, ""));
    const payload: WhatsAppConfigInsert & { id?: string } = {
      ...(initialData?.id ? { id: initialData.id } : {}),
      label,
      trigger_type: triggerType,
      trigger_value: triggerValue.trim(),
      // Usa credenciais da config global
      server_url: evolutionConfig?.server_url ?? initialData?.server_url ?? "",
      api_key: evolutionConfig?.api_key ?? initialData?.api_key ?? "",
      instance_name: instanceName,
      phone_to: cleaned[0],
      phones_to: cleaned,
      message_template: messageTemplate,
      is_active: isActive,
    };
    await upsert.mutateAsync(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Regra de Roteamento" : "Nova Regra de Roteamento"}
          </DialogTitle>
          <DialogDescription>
            Defina de qual origem virão os leads e para quais números WhatsApp eles serão enviados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pb-1">

          {/* Aviso se Evolution API não está configurada */}
          {!hasEvolution && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-destructive">Evolution API não configurada</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure a integração com a Evolution API antes de criar regras de roteamento.
                </p>
                {onNeedEvolution && (
                  <button
                    onClick={() => { onOpenChange(false); onNeedEvolution(); }}
                    className="text-xs text-primary hover:underline mt-1 font-medium"
                  >
                    Configurar agora →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Evolution API em uso */}
          {hasEvolution && (
            <div className="rounded-lg bg-muted/40 border border-border p-3 flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-status-success shrink-0" />
              <p className="text-xs text-muted-foreground">
                Usando Evolution API:{" "}
                <span className="font-medium text-foreground">
                  {evolutionConfig?.server_url}
                </span>
              </p>
            </div>
          )}

          {/* Nome da regra */}
          <div className="space-y-2">
            <Label htmlFor="wc_label">Nome da regra</Label>
            <Input
              id="wc_label"
              placeholder="Ex: Cliente ABC — Produto X"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Origem */}
          <div className="space-y-2">
            <Label>Origem dos leads</Label>
            <Select value={triggerType} onValueChange={(v) => setTriggerType(v as "page_id" | "ad_account_id" | "form_id")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="page_id">Página do Facebook (Page ID)</SelectItem>
                <SelectItem value="ad_account_id">Conta de Anúncios (Ad Account ID)</SelectItem>
                <SelectItem value="form_id">Formulário do Meta Ads (Form ID)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ID do gatilho */}
          <div className="space-y-2">
            <Label htmlFor="wc_trigger_value">
              {triggerType === "page_id"
                ? "ID da Página"
                : triggerType === "ad_account_id"
                ? "ID da Conta de Anúncios"
                : "ID do Formulário"}
            </Label>
            <Input
              id="wc_trigger_value"
              placeholder={
                triggerType === "page_id"
                  ? "Ex: 123456789012345"
                  : triggerType === "ad_account_id"
                  ? "act_123456789"
                  : "Ex: 987654321012345"
              }
              value={triggerValue}
              onChange={(e) => setTriggerValue(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              {triggerType === "page_id"
                ? "Encontre o Page ID nas configurações da Página do Facebook → Sobre."
                : triggerType === "ad_account_id"
                ? "Encontrado em: Gerenciador de Anúncios → ID da conta (formato act_XXXXXXX)"
                : "Encontrado em: Meta Ads Manager → Formulários de cadastro instantâneo → ID do formulário"}
            </p>
          </div>

          {/* Nome da instância */}
          <div className="space-y-2">
            <Label htmlFor="wc_instance">Nome da Instância Evolution API</Label>
            <Input
              id="wc_instance"
              placeholder="minha-instancia"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Nome da instância WhatsApp no seu servidor Evolution API
            </p>
          </div>

          {/* Números de destino */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Números WhatsApp de destino</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Com DDI, sem + ou espaços. Ex: 5511999887766
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-primary hover:text-primary h-7 px-2 text-xs"
                onClick={addPhone}
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar número
              </Button>
            </div>
            <div className="space-y-2">
              {phonesTo.map((phone, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  </div>
                  <Input
                    placeholder="5511999999999"
                    value={phone}
                    onChange={(e) => updatePhone(i, e.target.value)}
                    className="flex-1"
                  />
                  {phonesTo.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => removePhone(i)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Template (colapsível) */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
              onClick={() => setShowTemplate((v) => !v)}
            >
              <span>Personalizar template da mensagem</span>
              <span className="text-[10px]">{showTemplate ? "▲" : "▼"}</span>
            </button>
            {showTemplate && (
              <div className="p-4 space-y-2">
                <Textarea
                  rows={5}
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="text-sm font-mono resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis:{" "}
                  {["{{nome}}", "{{email}}", "{{telefone}}", "{{campanha}}"].map((v) => (
                    <code key={v} className="bg-muted px-1 rounded mr-1">{v}</code>
                  ))}
                </p>
              </div>
            )}
          </div>

          {/* Ativo */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Rota ativa</p>
              <p className="text-xs text-muted-foreground">Desative para pausar sem excluir</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={!isValid || upsert.isPending}
              className="flex-1"
            >
              {upsert.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Criar regra"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
