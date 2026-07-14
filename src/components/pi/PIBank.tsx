import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export interface ClientPI {
  id: string;
  fileName: string;
  fileData: string;
  agency: string;
  client: string;
  piNumber: string;
  value: number;
  uploadDate: string;
  notes: string;
}

interface PIBankProps {
  clientPIs: ClientPI[];
  onUpload: (pi: ClientPI) => void;
  onDelete: (id: string) => void;
  onUpdate: (updatedPI: ClientPI) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function PIBank({ clientPIs, onUpload, onDelete, onUpdate }: PIBankProps) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [agency, setAgency] = useState("");
  const [client, setClient] = useState("");
  const [piNumber, setPiNumber] = useState("");
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState("");

  const handleUpload = () => {
    if (!agency || !client || !piNumber) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    onUpload({
      id: crypto.randomUUID(),
      fileName: `PI_${agency}_${client}.pdf`,
      fileData: "",
      agency, client, piNumber, value, notes,
      uploadDate: new Date().toISOString(),
    });
    setUploadOpen(false);
    setAgency(""); setClient(""); setPiNumber(""); setValue(0); setNotes("");
    toast.success("PI cadastrado com sucesso");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setUploadOpen(true)}><Upload className="w-4 h-4 mr-2" />Cadastrar PI</Button>
      </div>
      {clientPIs.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">Nenhum PI no banco.</p>
      ) : (
        <div className="space-y-3">
          {clientPIs.map((pi) => (
            <Card key={pi.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{pi.piNumber}</p>
                    <p className="text-sm text-muted-foreground">{pi.agency} → {pi.client}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(pi.value)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onDelete(pi.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cadastrar PI Recebido</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Agência *</Label><Input value={agency} onChange={(e) => setAgency(e.target.value)} /></div>
            <div className="space-y-2"><Label>Cliente *</Label><Input value={client} onChange={(e) => setClient(e.target.value)} /></div>
            <div className="space-y-2"><Label>Nº PI *</Label><Input value={piNumber} onChange={(e) => setPiNumber(e.target.value)} /></div>
            <div className="space-y-2"><Label>Valor</Label><Input type="number" value={value || ""} onChange={(e) => setValue(parseFloat(e.target.value) || 0)} /></div>
            <div className="space-y-2"><Label>Observações</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
            <Button onClick={handleUpload} className="w-full">Cadastrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
