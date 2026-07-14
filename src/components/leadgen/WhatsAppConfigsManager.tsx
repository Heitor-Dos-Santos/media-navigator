import { useState } from "react";
import { useWhatsAppConfigs, useDeleteWhatsAppConfig, WhatsAppConfig } from "@/hooks/useWhatsAppConfigs";
import { WhatsAppConfigFormModal } from "./WhatsAppConfigFormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, MessageCircle, CheckCircle2, XCircle, Smartphone, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

export function WhatsAppConfigsManager({ onNeedEvolution }: { onNeedEvolution?: () => void }) {
  const { data: configs = [], isLoading } = useWhatsAppConfigs();
  const deleteMutation = useDeleteWhatsAppConfig();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WhatsAppConfig | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (cfg: WhatsAppConfig) => {
    setEditing(cfg);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(deletingId);
      setDeletingId(null);
    }
  };

  const getPhones = (cfg: WhatsAppConfig) =>
    cfg.phones_to?.length ? cfg.phones_to : cfg.phone_to ? [cfg.phone_to] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Regras de Roteamento WhatsApp</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mapeie cada Página ou Conta de Anúncios para os números de destino via Evolution API
          </p>
        </div>
        <Button size="sm" onClick={handleNew} className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nova Regra
        </Button>
      </div>

      {/* Info box */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Como funciona o roteamento?</p>
        <p>
          Quando um lead chega via webhook do Meta Ads, o sistema identifica a{" "}
          <strong>Página</strong> ou <strong>Conta de Anúncios</strong> de origem e envia a notificação
          para <strong>todos os números</strong> configurados naquela regra.
        </p>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : configs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/40 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Nenhuma regra configurada</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clique em "Nova Regra" para vincular uma origem a números de WhatsApp.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleNew} className="gap-1.5 mt-1">
            <Plus className="w-4 h-4" />
            Criar primeira regra
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {configs.map((cfg) => {
            const phones = getPhones(cfg);
            return (
              <div
                key={cfg.id}
                className={cn(
                  "rounded-xl border bg-card p-4 transition-all hover:border-primary/30",
                  cfg.is_active ? "border-border" : "border-border opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{cfg.label}</span>
                        <Badge variant={cfg.is_active ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                          {cfg.is_active ? (
                            <><CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />Ativo</>
                          ) : (
                            <><XCircle className="w-2.5 h-2.5 mr-0.5" />Inativo</>
                          )}
                        </Badge>
                      </div>

                      {/* Origem */}
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Hash className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/70">
                            {cfg.trigger_type === "page_id" ? "Page ID" : "Ad Account"}:
                          </span>{" "}
                          <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">
                            {cfg.trigger_value}
                          </code>
                        </span>
                      </div>

                      {/* Números */}
                      <div className="flex items-start gap-1.5 mt-1.5 flex-wrap">
                        <Smartphone className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex flex-wrap gap-1">
                          {phones.map((p, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 text-[11px] bg-muted rounded px-1.5 py-0.5 font-mono"
                            >
                              <span className="text-[9px] font-bold text-muted-foreground">#{i + 1}</span>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(cfg)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingId(cfg.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WhatsAppConfigFormModal
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditing(null);
        }}
        initialData={editing}
        onNeedEvolution={onNeedEvolution}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover regra?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta regra de roteamento será removida permanentemente. Leads dessa origem não serão mais notificados via WhatsApp.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
