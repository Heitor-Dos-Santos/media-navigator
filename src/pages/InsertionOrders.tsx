import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, Plus, Database, Download, Edit, FileSpreadsheet } from "lucide-react";
import { PIForm, PIData } from "@/components/pi/PIForm";
import { PIList } from "@/components/pi/PIList";
import { PIBank, ClientPI } from "@/components/pi/PIBank";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

const mockPIs: PIData[] = [
  { id: "1", piNumber: "070126-01", status: "faturado", createdAt: "2026-01-07T10:00:00Z", clientLogo: null, clientCompany: "Cesar School", clientCNPJ: "39.920.490/0001-80", clientContact: "Ramazzine Mota", clientEmail: "ramazzine@redmedia.com.br", clientPhone: "81.99419.9505", clientAddress: "Av. Rio Branco, 139 - CXPST:046", clientCity: "Recife / PE", clientCountry: "Brasil", vehicleCompany: "Loganmedia Brasil", vehicleCNPJ: "22.359.281/0001-06", vehicleAddress: "Rua Cap. Antonio Rosa, 376 - CJ11", vehicleCity: "São Paulo / SP", vehicleCountry: "Brasil", vehicleStateRegistration: "Isento", vehicleMunicipalRegistration: "5.22.555-9", campaignName: "Vestibular Cesar School 2026", campaignDescription: "Campanha de disparo de Push Notifications para a campanha Vestibular Cesar School 2026", campaignTarget: "AS | 18 a 25", campaignLocations: "Região Metropolitana do Recife", issueDate: "2026-01-07", broadcastPeriodStart: "2026-01-10", broadcastPeriodEnd: "2026-01-31", totalMedia: 4600, negotiatedValue: 4600, agencyDiscount: 0, negotiatedDiscountPercent: 0, negotiatedDiscountValue: 0, invoicedValue: 4600, paymentCondition: "30DFM", dueDate: "2026-02-06", observations: "Enviar NF e boleto para o email: ramazzine@redmedia.com.br", responsibleName: "Eyder Borges", signatureDate: "2026-01-07" },
  { id: "2", piNumber: "150126-01", status: "aguard_fat", createdAt: "2026-01-15T14:30:00Z", clientLogo: null, clientCompany: "TechStartup LTDA", clientCNPJ: "12.345.678/0001-90", clientContact: "Maria Silva", clientEmail: "maria@techstartup.com.br", clientPhone: "11.98765.4321", clientAddress: "Rua Augusta, 1500", clientCity: "São Paulo / SP", clientCountry: "Brasil", vehicleCompany: "Meta Ads Brasil", vehicleCNPJ: "33.444.555/0001-66", vehicleAddress: "Av. Paulista, 1000", vehicleCity: "São Paulo / SP", vehicleCountry: "Brasil", vehicleStateRegistration: "123.456.789", vehicleMunicipalRegistration: "1.23.456-7", campaignName: "Lançamento Produto Tech", campaignDescription: "Campanha de awareness para lançamento de produto", campaignTarget: "Desenvolvedores | 25-45", campaignLocations: "Nacional", issueDate: "2026-01-15", broadcastPeriodStart: "2026-01-20", broadcastPeriodEnd: "2026-02-28", totalMedia: 15000, negotiatedValue: 12000, agencyDiscount: 10, negotiatedDiscountPercent: 10, negotiatedDiscountValue: 1500, invoicedValue: 12000, paymentCondition: "30DFM", dueDate: "2026-02-15", observations: "Campanha Q1 2026", responsibleName: "João Santos", signatureDate: "2026-01-15" },
];

const mockClientPIs: ClientPI[] = [
  { id: "c1", fileName: "PI_AgenciaA_Cliente1.pdf", fileData: "", agency: "Agência A", client: "Cliente Premium", piNumber: "2026-001", value: 25000, uploadDate: "2026-01-20T10:00:00Z", notes: "Campanha institucional" },
  { id: "c2", fileName: "PI_AgenciaB_Cliente2.pdf", fileData: "", agency: "Agência B", client: "Tech Corp", piNumber: "2026-002", value: 18500, uploadDate: "2026-01-22T15:30:00Z", notes: "Mídia digital Q1" },
];

export default function InsertionOrders() {
  const [activeTab, setActiveTab] = useState("emit");
  const [pis, setPis] = useState<PIData[]>(() => { const stored = localStorage.getItem("insertion-orders"); if (stored) { try { const parsed = JSON.parse(stored) as PIData[]; if (parsed.length > 0) return parsed; } catch {} } return mockPIs; });
  const [clientPIs, setClientPIs] = useState<ClientPI[]>(mockClientPIs);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingPI, setEditingPI] = useState<PIData | undefined>();
  const [viewingPI, setViewingPI] = useState<PIData | null>(null);
  const [correctionDialogOpen, setCorrectionDialogOpen] = useState(false);
  const [piToCorrect, setPiToCorrect] = useState<PIData | null>(null);

  useEffect(() => { localStorage.setItem("insertion-orders", JSON.stringify(pis)); }, [pis]);
  useEffect(() => {
    const loadGeneratedPIs = () => { const generatedPIs = JSON.parse(localStorage.getItem("generatedPIs") || "[]") as PIData[]; if (generatedPIs.length > 0) setPis((prev) => { const existingIds = new Set(prev.map((pi) => pi.id)); const newPIs = generatedPIs.filter((pi) => !existingIds.has(pi.id)); return [...newPIs, ...prev]; }); };
    loadGeneratedPIs(); const handleStorageChange = (e: StorageEvent) => { if (e.key === "generatedPIs") loadGeneratedPIs(); }; window.addEventListener("storage", handleStorageChange); return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const getNextCSVersion = (originalPINumber: string): number => {
    const baseNumber = originalPINumber.replace(/-CS-\d+$/, ""); const csVersions = pis.filter((pi) => { const piBase = pi.piNumber.replace(/-CS-\d+$/, ""); return piBase === baseNumber && pi.piNumber.includes("-CS-"); }); if (csVersions.length === 0) return 1;
    let maxVersion = 0; csVersions.forEach((pi) => { const match = pi.piNumber.match(/-CS-(\d+)$/); if (match) { const version = parseInt(match[1], 10); if (version > maxVersion) maxVersion = version; } }); return maxVersion + 1;
  };
  const generateCorrectedPINumber = (originalPINumber: string): string => { const baseNumber = originalPINumber.replace(/-CS-\d+$/, ""); const nextVersion = getNextCSVersion(originalPINumber); return `${baseNumber}-CS-${String(nextVersion).padStart(2, "0")}`; };

  const handleSavePI = (data: PIData) => {
    if (editingPI) {
      if (data.isCorrectedVersion && data.originalPIId) { setPis((prev) => prev.map((pi) => { if (pi.id === data.originalPIId) return { ...pi, status: "cancelado" as const }; return pi; })); setPis((prev) => [data, ...prev]); toast.success(`PI corrigido criado: ${data.piNumber}`); } else setPis((prev) => prev.map((pi) => (pi.id === data.id ? data : pi)));
    } else {
      const existingNumbers = pis.map((pi) => pi.piNumber); let newNumber = data.piNumber; let counter = 1; while (existingNumbers.includes(newNumber)) { const [datePart] = data.piNumber.split("-"); newNumber = `${datePart}-${String(counter + 1).padStart(2, "0")}`; counter++; } data.piNumber = newNumber; setPis((prev) => [data, ...prev]);
    }
    setFormDialogOpen(false); setEditingPI(undefined);
  };
  const handleEditPI = (pi: PIData) => { setPiToCorrect(pi); setCorrectionDialogOpen(true); };
  const handleCreateCorrectedVersion = () => { if (!piToCorrect) return; const correctedPINumber = generateCorrectedPINumber(piToCorrect.piNumber); const correctedPI: PIData = { ...piToCorrect, id: crypto.randomUUID(), piNumber: correctedPINumber, status: "aguard_fat", createdAt: new Date().toISOString(), originalPIId: piToCorrect.id, correctionVersion: getNextCSVersion(piToCorrect.piNumber), isCorrectedVersion: true }; setEditingPI(correctedPI); setFormDialogOpen(true); setCorrectionDialogOpen(false); setPiToCorrect(null); };
  const handleViewPI = (pi: PIData) => { setViewingPI(pi); setViewDialogOpen(true); };
  const handleDeletePI = (id: string) => { setPis((prev) => prev.filter((pi) => pi.id !== id)); toast.success("PI excluído com sucesso"); };
  const handleStatusChange = (id: string, status: PIData["status"]) => { setPis((prev) => prev.map((pi) => (pi.id === id ? { ...pi, status } : pi))); toast.success("Status atualizado"); };
  const handleUploadClientPI = (pi: ClientPI) => { setClientPIs((prev) => [pi, ...prev]); };
  const handleUpdateClientPI = (updatedPI: ClientPI) => { setClientPIs((prev) => prev.map((pi) => (pi.id === updatedPI.id ? updatedPI : pi))); };
  const handleDeleteClientPI = (id: string) => { setClientPIs((prev) => prev.filter((pi) => pi.id !== id)); toast.success("PI excluído com sucesso"); };
  const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  const formatDate = (dateString: string) => { if (!dateString) return "-"; const date = new Date(dateString); return date.toLocaleDateString("pt-BR"); };

  const exportPIToPDF = async (pi: PIData) => {
    const agencyLogo = (() => { const stored = localStorage.getItem("agencySettings"); if (stored) { const settings = JSON.parse(stored); return settings.logo || null; } return null; })();
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    if (agencyLogo) {
      try { const img = new Image(); const isDataUrl = agencyLogo.startsWith("data:"); if (!isDataUrl) img.crossOrigin = "anonymous"; await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = reject; img.src = agencyLogo; }); const aspectRatio = img.width / img.height; const logoHeight = 14; const logoWidth = logoHeight * aspectRatio; doc.addImage(agencyLogo, "PNG", margin, y, Math.min(logoWidth, 50), logoHeight); } catch (e) { console.error("Could not load agency logo:", e); }
    }
    doc.setTextColor(0, 0, 0); doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.text(`PI Nº : ${pi.piNumber}`, pageWidth - margin, y + 8, { align: "right" }); y += 20;

    // Simplified PDF generation logic for brevity
    doc.setFontSize(12); doc.text("Detalhes do PI", margin, y); y += 10;
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Cliente: ${pi.clientCompany}`, margin, y); y += 6;
    doc.text(`Campanha: ${pi.campaignName}`, margin, y); y += 6;
    doc.text(`Valor: ${formatCurrency(pi.totalMedia)}`, margin, y);
    doc.save(`PI_${pi.piNumber}.pdf`); toast.success("PDF gerado com sucesso!");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold flex items-center gap-3"><FileText className="w-8 h-8 text-primary" />Controle de PI's<PageInfoTooltip description="Emita, gerencie e exporte Pedidos de Inserção com versionamento, correções e banco de PIs recebidos." /></h1><p className="text-muted-foreground mt-1">Gerencie pedidos de inserção emitidos e recebidos</p></div></div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2"><TabsTrigger value="emit" className="flex items-center gap-2"><Plus className="w-4 h-4" />Emitir PI</TabsTrigger><TabsTrigger value="bank" className="flex items-center gap-2"><Database className="w-4 h-4" />Banco de PIs</TabsTrigger></TabsList>
          <TabsContent value="emit" className="space-y-6"><div className="flex justify-end"><Button onClick={() => { setEditingPI(undefined); setFormDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" />Novo PI</Button></div><PIList pis={pis} onView={handleViewPI} onEdit={handleEditPI} onDelete={handleDeletePI} onStatusChange={handleStatusChange} onDownload={exportPIToPDF} /></TabsContent>
          <TabsContent value="bank" className="space-y-6"><PIBank clientPIs={clientPIs} onUpload={handleUploadClientPI} onDelete={handleDeleteClientPI} onUpdate={handleUpdateClientPI} /></TabsContent>
        </Tabs>
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}><DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editingPI ? `Editar PI ${editingPI.piNumber}` : "Novo Pedido de Inserção"}</DialogTitle></DialogHeader><PIForm initialData={editingPI} onSave={handleSavePI} onCancel={() => { setFormDialogOpen(false); setEditingPI(undefined); }} /></DialogContent></Dialog>
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}><DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto"><DialogHeader><div className="flex items-center justify-between"><DialogTitle className="flex items-center gap-2"><FileText className="w-5 h-5" />PI Nº: {viewingPI?.piNumber}</DialogTitle>{viewingPI && (<div className="flex flex-col gap-2"><Button variant="outline" size="sm" onClick={() => exportPIToPDF(viewingPI)}><Download className="w-4 h-4 mr-2" />Baixar PDF</Button><Button variant="outline" size="sm" onClick={() => { setViewDialogOpen(false); handleEditPI(viewingPI); }}><Edit className="w-4 h-4 mr-2" />Editar PI</Button><Button variant="outline" size="sm" onClick={() => exportPIToPDF(viewingPI)}><FileSpreadsheet className="w-4 h-4 mr-2" />Exportar</Button></div>)}</div></DialogHeader>{viewingPI && (<div className="space-y-6 mt-4"><p>Detalhes do PI...</p></div>)}</DialogContent></Dialog>
        <AlertDialog open={correctionDialogOpen} onOpenChange={setCorrectionDialogOpen}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Criar Versão Corrigida</AlertDialogTitle><AlertDialogDescription>Ao editar este PI, uma nova versão corrigida será criada com o sufixo <strong>-CS-XX</strong>.<br /><br />O PI original <strong>{piToCorrect?.piNumber}</strong> será automaticamente <strong>cancelado</strong> e a nova versão o substituirá.<br /><br />Deseja continuar?</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel onClick={() => setPiToCorrect(null)}>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleCreateCorrectedVersion}>Criar Versão Corrigida</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
      </div>
    </AppLayout>
  );
}
