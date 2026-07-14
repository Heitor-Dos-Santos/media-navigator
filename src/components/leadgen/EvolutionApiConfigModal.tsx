import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUpsertEvolutionApiConfig, EvolutionApiConfig } from "@/hooks/useEvolutionApiConfig";
import { ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentConfig?: EvolutionApiConfig | null;
}

export function EvolutionApiConfigModal({ open, onOpenChange, currentConfig }: Props) {
  const upsert = useUpsertEvolutionApiConfig();
  const { toast } = useToast();

  const [serverUrl, setServerUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testOk, setTestOk] = useState(false);

  const isEditing = !!currentConfig;

  useEffect(() => {
    if (open) {
      if (currentConfig) {
        setServerUrl(currentConfig.server_url);
        setApiKey(currentConfig.api_key);
        setIsActive(currentConfig.is_active);
      } else {
        setServerUrl("");
        setApiKey("");
        setIsActive(true);
      }
      setTestOk(false);
    }
  }, [currentConfig, open]);

  const isValid = serverUrl.trim() && apiKey.trim();

  const handleTest = async () => {
    if (!serverUrl || !apiKey) return;
    setTesting(true);
    setTestOk(false);
    try {
      const base = serverUrl.replace(/\/$/, "");
      const res = await fetch(`${base}/instance/fetchInstances`, {
        headers: { apikey: apiKey },
      });
      if (!res.ok) throw new Error("Resposta inválida do servidor");
      setTestOk(true);
      toast({
        title: "Conexão verificada!",
        description: "Evolution API respondeu com sucesso.",
      });
    } catch {
      setTestOk(false);
      toast({
        title: "Erro de conexão",
        description: "Verifique a URL do servidor e a API Key.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!isValid) return;
    await upsert.mutateAsync({
      ...(currentConfig?.id ? { id: currentConfig.id } : {}),
      server_url: serverUrl.replace(/\/$/, ""),
      api_key: apiKey,
      is_active: isActive,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Evolution API" : "Conectar Evolution API"}
          </DialogTitle>
          <DialogDescription>
            Configure as credenciais globais do servidor Evolution API. Todas as regras de roteamento WhatsApp usarão esta conexão.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Docs link */}
          <div className="rounded-lg bg-muted/40 border border-border p-3 text-xs text-muted-foreground flex items-start gap-2">
            <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <span>
              Precisa de ajuda para configurar?{" "}
              <a
                href="https://doc.evolution-api.com/v2/pt/get-started/introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Ver documentação da Evolution API
              </a>
            </span>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="evo_server">URL do Servidor</Label>
            <Input
              id="evo_server"
              placeholder="https://evolution.meuservidor.com"
              value={serverUrl}
              onChange={(e) => { setServerUrl(e.target.value); setTestOk(false); }}
            />
            <p className="text-xs text-muted-foreground">
              URL base da sua instância Evolution API (self-hosted ou cloud)
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="evo_apikey">API Key Global</Label>
            <Input
              id="evo_apikey"
              type="password"
              placeholder="••••••••••••"
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestOk(false); }}
            />
            <p className="text-xs text-muted-foreground">
              Encontrada em: Evolution API Manager → Global API Key
            </p>
          </div>

          {/* Testar conexão */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!serverUrl || !apiKey || testing}
              onClick={handleTest}
            >
              {testing
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : testOk
                ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
                : null}
              {testOk ? "Conexão OK" : "Testar conexão"}
            </Button>
            {testOk && (
              <span className="text-xs text-status-success font-medium">
                Servidor acessível ✓
              </span>
            )}
          </div>

          {/* Ativo */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <div>
              <p className="text-sm font-medium text-foreground">Integração ativa</p>
              <p className="text-xs text-muted-foreground">Desative para pausar todos os envios</p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* Ações */}
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!isValid || upsert.isPending}
              className="flex-1"
            >
              {upsert.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Conectar"}
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
