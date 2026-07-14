import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface EmailConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailConfigModal({ open, onOpenChange }: EmailConfigModalProps) {
  const { toast } = useToast();
  const [toEmail, setToEmail] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!toEmail) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Email configurado!", description: "Notificações serão enviadas a cada novo lead." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Email (Resend)</DialogTitle>
          <DialogDescription>
            Receba notificações por email a cada novo lead capturado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="to_email">Email de destino</Label>
            <Input id="to_email" type="email" placeholder="seu@email.com" value={toEmail} onChange={(e) => setToEmail(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="from_email">Email de envio (opcional)</Label>
            <Input id="from_email" type="email" placeholder="noreply@seudominio.com" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
            <p className="text-xs text-muted-foreground">Domínio precisa estar verificado no Resend. Deixe vazio para usar o padrão.</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!toEmail || saving} className="flex-1">
              {saving ? "Salvando..." : "Conectar"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
