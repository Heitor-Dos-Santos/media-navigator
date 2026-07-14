import { PIData } from "./PIForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PIListProps {
  pis: PIData[];
  onView: (pi: PIData) => void;
  onEdit: (pi: PIData) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: PIData["status"]) => void;
  onDownload: (pi: PIData) => Promise<void>;
}

const statusLabels: Record<PIData["status"], string> = {
  aguard_fat: "Aguardando Faturamento",
  faturado: "Faturado",
  cancelado: "Cancelado",
};

const statusColors: Record<PIData["status"], string> = {
  aguard_fat: "bg-yellow-500/10 text-yellow-500",
  faturado: "bg-green-500/10 text-green-500",
  cancelado: "bg-red-500/10 text-red-500",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function PIList({ pis, onView, onEdit, onDelete, onStatusChange, onDownload }: PIListProps) {
  if (pis.length === 0) {
    return <p className="text-muted-foreground text-center py-8">Nenhum PI emitido ainda.</p>;
  }

  return (
    <div className="space-y-3">
      {pis.map((pi) => (
        <Card key={pi.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div>
                <p className="font-semibold">{pi.piNumber}</p>
                <p className="text-sm text-muted-foreground">{pi.clientCompany}</p>
              </div>
              <p className="text-sm">{pi.campaignName}</p>
              <p className="font-medium">{formatCurrency(pi.totalMedia)}</p>
              <Badge className={statusColors[pi.status]}>{statusLabels[pi.status]}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select value={pi.status} onValueChange={(v) => onStatusChange(pi.id, v as PIData["status"])}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aguard_fat">Aguard. Faturamento</SelectItem>
                  <SelectItem value="faturado">Faturado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => onView(pi)}><Eye className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onEdit(pi)}><Edit className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDownload(pi)}><Download className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(pi.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
