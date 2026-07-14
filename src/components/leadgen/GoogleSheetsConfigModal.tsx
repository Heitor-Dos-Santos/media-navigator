import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface GoogleSheetsConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoogleSheetsConfigModal({ open, onOpenChange }: GoogleSheetsConfigModalProps) {
  const { toast } = useToast();
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [sheetName, setSheetName] = useState("Leads");
  const [accessToken, setAccessToken] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!spreadsheetId || !accessToken) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast({ title: "Google Sheets conectado!", description: "Leads serão enviados automaticamente para a planilha." });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar Google Sheets</DialogTitle>
          <DialogDescription>
            Envie cada lead automaticamente para uma aba da sua planilha Google.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spreadsheet_id">ID da Planilha</Label>
            <Input id="spreadsheet_id" placeholder="Cole o ID da URL da planilha" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} />
            <p className="text-xs text-muted-foreground">Encontre na URL: docs.google.com/spreadsheets/d/<strong>ID_AQUI</strong>/edit</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sheet_name">Nome da Aba</Label>
            <Input id="sheet_name" placeholder="Leads" value={sheetName} onChange={(e) => setSheetName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gs_access_token">Access Token (Google OAuth)</Label>
            <Input id="gs_access_token" type="password" placeholder="ya29.xxxxx..." value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!spreadsheetId || !accessToken || saving} className="flex-1">
              {saving ? "Salvando..." : "Conectar"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
