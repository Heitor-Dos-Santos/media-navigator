import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, Search, Edit, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { Supplier, createEmptySupplier, supplierCategories } from "@/types/supplier";
import { formatCNPJ, formatPhone, formatStateRegistration, formatMunicipalRegistration, formatCEP } from "@/lib/inputMasks";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState<Supplier>(createEmptySupplier());

  useEffect(() => { const stored = localStorage.getItem("suppliers"); if (stored) setSuppliers(JSON.parse(stored)); }, []);
  useEffect(() => { localStorage.setItem("suppliers", JSON.stringify(suppliers)); }, [suppliers]);

  const filteredSuppliers = suppliers.filter(s => (s.tradeName || s.companyName).toLowerCase().includes(search.toLowerCase()) || s.cnpj.includes(search) || s.contactName.toLowerCase().includes(search.toLowerCase()));
  const handleOpenDialog = (supplier?: Supplier) => { if (supplier) { setEditingSupplier(supplier); setFormData(supplier); } else { setEditingSupplier(null); setFormData(createEmptySupplier()); } setDialogOpen(true); };
  const handleSave = () => {
    if (!formData.companyName || !formData.cnpj) { toast.error("Preencha os campos obrigatórios"); return; }
    const updated = { ...formData, updatedAt: new Date().toISOString() };
    if (editingSupplier) { setSuppliers(prev => prev.map(s => (s.id === editingSupplier.id ? updated : s))); toast.success("Fornecedor atualizado com sucesso!"); } else { setSuppliers(prev => [updated, ...prev]); toast.success("Fornecedor cadastrado com sucesso!"); }
    setDialogOpen(false); setEditingSupplier(null); setFormData(createEmptySupplier());
  };
  const handleDelete = (id: string) => { if (confirm("Tem certeza que deseja excluir este fornecedor?")) { setSuppliers(prev => prev.filter(s => s.id !== id)); toast.success("Fornecedor excluído com sucesso!"); } };
  const updateField = <K extends keyof Supplier>(field: K, value: Supplier[K]) => { setFormData(prev => ({ ...prev, [field]: value })); };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold flex items-center gap-3"><Truck className="w-7 h-7 text-primary" />Cadastro de Fornecedores<PageInfoTooltip description="Cadastre e gerencie fornecedores e veículos de mídia com dados fiscais e categorização." /></h1><p className="text-muted-foreground">Gerencie seus fornecedores e veículos de mídia</p></div><Button onClick={() => handleOpenDialog()}><Plus className="w-4 h-4 mr-2" />Novo Fornecedor</Button></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Total de Fornecedores</div><div className="text-2xl font-bold">{suppliers.length}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Cadastrados este mês</div><div className="text-2xl font-bold text-primary">{suppliers.filter(s => { const d = new Date(s.createdAt); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length}</div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Categorias</div><div className="text-2xl font-bold">{new Set(suppliers.map(s => s.category).filter(Boolean)).size}</div></CardContent></Card>
        </div>
        <Card>
          <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-lg">Fornecedores Cadastrados</CardTitle><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Buscar fornecedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" /></div></div></CardHeader>
          <CardContent><div className="rounded-md border"><Table><TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>CNPJ</TableHead><TableHead>Categoria</TableHead><TableHead>Contato</TableHead><TableHead>Cidade</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader><TableBody>{filteredSuppliers.length === 0 ? (<TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">{search ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado"}</TableCell></TableRow>) : (filteredSuppliers.map((supplier) => (<TableRow key={supplier.id}><TableCell className="font-medium">{supplier.tradeName || supplier.companyName}</TableCell><TableCell>{supplier.cnpj}</TableCell><TableCell>{supplier.category || "-"}</TableCell><TableCell>{supplier.contactName || "-"}</TableCell><TableCell>{supplier.city ? `${supplier.city}/${supplier.state}` : "-"}</TableCell><TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => handleOpenDialog(supplier)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button></div></TableCell></TableRow>)))}</TableBody></Table></div></CardContent>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" />{editingSupplier ? "Editar Fornecedor" : "Novo Fornecedor"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Label>Razão Social *</Label><Input value={formData.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="Razão social da empresa" /></div>
                <div><Label>Nome Fantasia</Label><Input value={formData.tradeName} onChange={(e) => updateField("tradeName", e.target.value)} placeholder="Nome fantasia" /></div>
                <div><Label>CNPJ *</Label><Input value={formData.cnpj} onChange={(e) => updateField("cnpj", formatCNPJ(e.target.value))} placeholder="00.000.000/0000-00" /></div>
                <div><Label>Inscrição Estadual</Label><Input value={formData.stateRegistration} onChange={(e) => updateField("stateRegistration", formatStateRegistration(e.target.value))} placeholder="Isento" /></div>
                <div><Label>Inscrição Municipal</Label><Input value={formData.municipalRegistration} onChange={(e) => updateField("municipalRegistration", formatMunicipalRegistration(e.target.value))} placeholder="0.000.000-0" /></div>
                <div className="col-span-2"><Label>Categoria</Label><Select value={formData.category || ""} onValueChange={(v) => updateField("category", v)}><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger><SelectContent>{supplierCategories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="border-t pt-4"><h4 className="font-medium mb-3">Endereço</h4><div className="grid grid-cols-2 gap-4"><div className="col-span-2"><Label>Endereço</Label><Input value={formData.address} onChange={(e) => updateField("address", e.target.value)} placeholder="Rua, número, complemento" /></div><div><Label>Cidade</Label><Input value={formData.city} onChange={(e) => updateField("city", e.target.value)} placeholder="Cidade" /></div><div><Label>Estado</Label><Input value={formData.state} onChange={(e) => updateField("state", e.target.value)} placeholder="UF" /></div><div><Label>CEP</Label><Input value={formData.zipCode} onChange={(e) => updateField("zipCode", formatCEP(e.target.value))} placeholder="00.000-000" /></div><div><Label>País</Label><Input value={formData.country} onChange={(e) => updateField("country", e.target.value)} placeholder="Brasil" /></div></div></div>
              <div className="border-t pt-4"><h4 className="font-medium mb-3">Contato</h4><div className="grid grid-cols-2 gap-4"><div><Label>Nome do Contato</Label><Input value={formData.contactName} onChange={(e) => updateField("contactName", e.target.value)} placeholder="Nome do responsável" /></div><div><Label>Telefone</Label><Input value={formData.contactPhone} onChange={(e) => updateField("contactPhone", formatPhone(e.target.value))} placeholder="(00) 0.0000-0000" /></div><div className="col-span-2"><Label>Email</Label><Input type="email" value={formData.contactEmail} onChange={(e) => updateField("contactEmail", e.target.value)} placeholder="email@empresa.com" /></div></div></div>
              <div className="border-t pt-4"><Label>Observações</Label><Textarea value={formData.notes} onChange={(e) => updateField("notes", e.target.value)} placeholder="Anotações sobre o fornecedor..." rows={3} /></div>
              <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button><Button onClick={handleSave}>{editingSupplier ? "Salvar Alterações" : "Cadastrar Fornecedor"}</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
