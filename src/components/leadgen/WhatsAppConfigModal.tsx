import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

interface WhatsAppConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppConfigModal({ open, onOpenChange }: WhatsAppConfigModalProps) {
  const { toast } = useToast();
  const [serverUrl, setServerUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instanceName, setInstanceName] = useState("");
  const [phoneTo, setPhoneTo] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!serverUrl || !apiKey || !instanceName || !phoneTo) return;
    setSaving(true);

    // Validate connection by calling Evolution API info endpoint
    try {
      const base = serverUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/instance/fetchInstances`, {
        headers: { apikey: apiKey },
      });
      if (!res.ok) throw new Error("Falha ao conectar com a Evolution API");
      toast({
        title: "Evolution API conectada!",
        description: `Instância "${instanceName}" configurada. Leads serão enviados via WhatsApp automaticamente.`,
      });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro de conexão",
        description: "Verifique a URL do servidor e a API Key e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            WhatsApp via Evolution API
          </DialogTitle>
          <DialogDescription>
            Envie os dados de cada lead automaticamente via WhatsApp usando a Evolution API.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info box */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">O que é a Evolution API?</p>
            <p>Plataforma open-source para envio de mensagens WhatsApp. Pode ser self-hosted ou usada em serviços de cloud.</p>
            <a
              href="https://doc.evolution-api.com/v2/pt/get-started/introduction"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium mt-1"
            >
              Ver documentação <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evo_server_url">URL do Servidor</Label>
            <Input
              id="evo_server_url"
              placeholder="https://sua-evolution.exemplo.com"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">URL base da sua instância Evolution API</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evo_api_key">API Key Global</Label>
            <Input
              id="evo_api_key"
              type="password"
              placeholder="Sua API Key da Evolution API"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Encontrada nas configurações do servidor Evolution</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evo_instance">Nome da Instância</Label>
            <Input
              id="evo_instance"
              placeholder="minha-instancia"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Nome exato da instância criada no painel Evolution</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evo_phone_to">Número de destino</Label>
            <Input
              id="evo_phone_to"
              placeholder="5511999999999"
              value={phoneTo}
              onChange={(e) => setPhoneTo(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Formato: DDI + DDD + número (ex: 5511999999999)</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!serverUrl || !apiKey || !instanceName || !phoneTo || saving}
              className="flex-1"
            >
              {saving ? "Conectando..." : "Conectar"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
