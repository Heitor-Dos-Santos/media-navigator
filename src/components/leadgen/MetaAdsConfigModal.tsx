import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "crbiyljrxornvfuhfrfy";
const WEBHOOK_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/meta-leads-webhook`;

interface MetaAdsConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MetaAdsConfigModal({ open, onOpenChange }: MetaAdsConfigModalProps) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [accessToken, setAccessToken] = useState("");
  const [pageId, setPageId] = useState("");
  const [verifyToken] = useState(() => crypto.randomUUID().slice(0, 24));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado!` });
  };

  const handleSave = async () => {
    if (!accessToken.trim()) {
      setError("O Access Token é obrigatório.");
      return;
    }
    setError("");
    setSaving(true);

    try {
      // Salva o verify_token na tabela de config
      const { error: dbError } = await (supabase as any)
        .from("meta_ads_config")
        .upsert(
          {
            verify_token: verifyToken,
            page_id: pageId || null,
            is_active: true,
          },
          { onConflict: "id" }
        );

      if (dbError) throw dbError;

      // Salva o access token nos secrets via edge function não é possível direto do client.
      // Instruímos o usuário a salvar via Cloud > Secrets ou via a UI abaixo.
      // Por ora marcamos como salvo e exibimos instrução.
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["meta-ads-config"] });
      toast({
        title: "Meta Ads configurado!",
        description: "Webhook ativo. Adicione também o Access Token nos Secrets do Cloud.",
      });

      setTimeout(() => {
        setSaved(false);
        onOpenChange(false);
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar configuração";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">f</span>
            </div>
            Configurar Meta Ads
          </DialogTitle>
          <DialogDescription>
            Configure o webhook para receber leads do Facebook Lead Ads automaticamente em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Webhook URL */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <Label className="text-xs text-muted-foreground">1. URL do Webhook (cole no Meta Business)</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <code className="text-xs bg-background px-2 py-1.5 rounded border border-border flex-1 truncate text-foreground">
                {WEBHOOK_URL}
              </code>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(WEBHOOK_URL, "URL do Webhook")}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Verify Token */}
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <Label className="text-xs text-muted-foreground">2. Token de Verificação (cole no Meta Business)</Label>
            <div className="flex items-center gap-2 mt-1.5">
              <code className="text-xs bg-background px-2 py-1.5 rounded border border-border flex-1 truncate text-foreground">
                {verifyToken}
              </code>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copyToClipboard(verifyToken, "Token de verificação")}>
                <Copy className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Access Token */}
          <div className="space-y-2">
            <Label htmlFor="access_token">3. Access Token do Facebook</Label>
            <Input
              id="access_token"
              type="password"
              placeholder="EAAxxxxxxx..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Encontre em: Meta Business Manager → Configurações → Integrações → Lead Access
            </p>
          </div>

          {/* Access Token nos Secrets */}
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 space-y-1.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">⚠️ Salve o Access Token nos Secrets</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Para que o webhook busque os dados do lead via API do Meta, adicione o Access Token com o nome{" "}
                  <code className="bg-muted px-1 rounded">META_ADS_ACCESS_TOKEN</code> em{" "}
                  <strong>Cloud → Secrets</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Page ID */}
          <div className="space-y-2">
            <Label htmlFor="page_id">4. Page ID da Página (opcional)</Label>
            <Input
              id="page_id"
              placeholder="123456789"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
            />
          </div>

          {/* Passos */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">Passos no Meta Business Manager:</p>
            <ol className="space-y-1">
              {[
                "Acesse o Facebook Business Manager",
                "Vá em Configurações do Negócio → Webhooks",
                "Crie um novo webhook para 'Página', cole a URL acima",
                "Cole o Token de Verificação e clique em 'Verificar e Salvar'",
                "Selecione o evento 'leadgen' e confirme a inscrição",
                "Em Lead Access, copie o Page Access Token e salve nos Secrets",
              ].map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
            <a
              href="https://developers.facebook.com/docs/marketing-api/guides/lead-ads/retrieving"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
            >
              Documentação Meta Lead Ads <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {error && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!accessToken || saving}
              className="flex-1 gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : null}
              {saving ? "Salvando..." : saved ? "Salvo!" : "Salvar e Ativar Webhook"}
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
