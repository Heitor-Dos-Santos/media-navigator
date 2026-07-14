import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users } from "lucide-react";
import type { IMCScore } from "@/types/imc";

interface ClientSelectorProps {
  clients: IMCScore[];
  selectedClientId: string | null;
  onSelect: (clientId: string | null) => void;
}

export function ClientSelector({ clients, selectedClientId, onSelect }: ClientSelectorProps) {
  return (
    <Select
      value={selectedClientId ?? "__all__"}
      onValueChange={(v) => onSelect(v === "__all__" ? null : v)}
    >
      <SelectTrigger className="w-[280px]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <SelectValue placeholder="Todos os Clientes" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">Todos os Clientes</SelectItem>
        {clients.map((c) => (
          <SelectItem key={c.clientId} value={c.clientId}>
            {c.clientName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
