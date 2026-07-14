import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface PIData {
  id: string;
  piNumber: string;
  status: "aguard_fat" | "faturado" | "cancelado";
  createdAt: string;
  clientLogo: string | null;
  clientCompany: string;
  clientCNPJ: string;
  clientContact: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientCountry: string;
  vehicleCompany: string;
  vehicleCNPJ: string;
  vehicleAddress: string;
  vehicleCity: string;
  vehicleCountry: string;
  vehicleStateRegistration: string;
  vehicleMunicipalRegistration: string;
  campaignName: string;
  campaignDescription: string;
  campaignTarget: string;
  campaignLocations: string;
  issueDate: string;
  broadcastPeriodStart: string;
  broadcastPeriodEnd: string;
  totalMedia: number;
  negotiatedValue: number;
  agencyDiscount: number;
  negotiatedDiscountPercent: number;
  negotiatedDiscountValue: number;
  invoicedValue: number;
  paymentCondition: string;
  dueDate: string;
  observations: string;
  responsibleName: string;
  signatureDate: string;
  planningRef?: string;
  monthRef?: string;
  originalPIId?: string;
  correctionVersion?: number;
  isCorrectedVersion?: boolean;
}

interface PIFormProps {
  initialData?: PIData;
  onSave: (data: PIData) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split("T")[0];
const generatePINumber = () => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}-01`;
};

export function PIForm({ initialData, onSave, onCancel }: PIFormProps) {
  const [data, setData] = useState<PIData>(
    initialData || {
      id: crypto.randomUUID(),
      piNumber: generatePINumber(),
      status: "aguard_fat",
      createdAt: new Date().toISOString(),
      clientLogo: null,
      clientCompany: "", clientCNPJ: "", clientContact: "", clientEmail: "", clientPhone: "", clientAddress: "", clientCity: "", clientCountry: "Brasil",
      vehicleCompany: "", vehicleCNPJ: "", vehicleAddress: "", vehicleCity: "", vehicleCountry: "Brasil", vehicleStateRegistration: "", vehicleMunicipalRegistration: "",
      campaignName: "", campaignDescription: "", campaignTarget: "", campaignLocations: "",
      issueDate: today, broadcastPeriodStart: "", broadcastPeriodEnd: "",
      totalMedia: 0, negotiatedValue: 0, agencyDiscount: 0, negotiatedDiscountPercent: 0, negotiatedDiscountValue: 0, invoicedValue: 0,
      paymentCondition: "30DFM", dueDate: "", observations: "", responsibleName: "", signatureDate: today,
    }
  );

  const update = (field: keyof PIData, value: any) => setData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>Nº PI</Label><Input value={data.piNumber} onChange={(e) => update("piNumber", e.target.value)} /></div>
        <div className="space-y-2"><Label>Empresa Cliente</Label><Input value={data.clientCompany} onChange={(e) => update("clientCompany", e.target.value)} /></div>
        <div className="space-y-2"><Label>CNPJ Cliente</Label><Input value={data.clientCNPJ} onChange={(e) => update("clientCNPJ", e.target.value)} /></div>
        <div className="space-y-2"><Label>Contato</Label><Input value={data.clientContact} onChange={(e) => update("clientContact", e.target.value)} /></div>
        <div className="space-y-2"><Label>Veículo</Label><Input value={data.vehicleCompany} onChange={(e) => update("vehicleCompany", e.target.value)} /></div>
        <div className="space-y-2"><Label>Campanha</Label><Input value={data.campaignName} onChange={(e) => update("campaignName", e.target.value)} /></div>
        <div className="space-y-2"><Label>Valor Total Mídia</Label><Input type="number" value={data.totalMedia || ""} onChange={(e) => update("totalMedia", parseFloat(e.target.value) || 0)} /></div>
        <div className="space-y-2"><Label>Valor Faturado</Label><Input type="number" value={data.invoicedValue || ""} onChange={(e) => update("invoicedValue", parseFloat(e.target.value) || 0)} /></div>
      </div>
      <div className="space-y-2"><Label>Observações</Label><Textarea value={data.observations} onChange={(e) => update("observations", e.target.value)} /></div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={() => onSave(data)}>Salvar</Button>
      </div>
    </div>
  );
}
