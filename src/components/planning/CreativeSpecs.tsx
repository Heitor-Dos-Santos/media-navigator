import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Plus, Trash2, Upload, Download, Search, FileSpreadsheet, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  loadCustomSpecs,
  saveCustomSpecs,
  addCustomSpec,
  removeCustomSpec,
  updateCustomSpec,
  parseBulkSpecs,
  type CustomSpecEntry,
} from "@/lib/customSpecsStore";
import { CATEGORIES, type CreativeTypeTag } from "@/data/creativeSpecs";

export interface CreativeSpec {
  id: string;
  platform: string;
  format: string;
  width: number;
  height: number;
  maxFileSize: string;
  fileTypes: string[];
  notes: string;
}

const TYPE_TAGS: CreativeTypeTag[] = ["Display", "Vídeo", "Áudio", "DOOH", "Social", "Texto", "Push"];

function generateTemplateCSV(): string {
  const headers = ["Canal", "Publisher", "Categoria", "Formato", "Nome", "Largura", "Altura", "Proporção", "Peso Máximo", "Tipos de Arquivo", "Duração", "Tag", "Observações"];
  const example = ["Meu Canal", "Publisher X", "Display", "Banner 300x250", "Banner 300x250", "300", "250", "6:5", "150KB", "JPG, PNG", "", "Display", "Formato customizado"];
  return [headers.join(","), example.join(",")].join("\n");
}

export function CreativeSpecs(_props: any) {
  const [specs, setSpecs] = useState<CustomSpecEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [form, setForm] = useState({
    platform: "", publisher: "", category: "Display", format: "", name: "",
    width: 0, height: 0, aspectRatio: "N/A", maxFileSize: "", fileTypes: "",
    duration: "", notes: "", typeTag: "" as string,
  });

  useEffect(() => {
    setSpecs(loadCustomSpecs());
  }, []);

  const resetForm = () => {
    setForm({ platform: "", publisher: "", category: "Display", format: "", name: "", width: 0, height: 0, aspectRatio: "N/A", maxFileSize: "", fileTypes: "", duration: "", notes: "", typeTag: "" });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!form.platform || !form.name) {
      toast.error("Canal e Nome são obrigatórios");
      return;
    }

    if (editingId) {
      updateCustomSpec(editingId, {
        platform: form.platform,
        publisher: form.publisher || undefined,
        category: form.category,
        format: form.format || form.name,
        name: form.name,
        width: form.width,
        height: form.height,
        aspectRatio: form.aspectRatio,
        maxFileSize: form.maxFileSize,
        fileTypes: form.fileTypes,
        duration: form.duration || undefined,
        notes: form.notes,
        typeTag: (form.typeTag as CreativeTypeTag) || undefined,
      });
      toast.success("Spec atualizada!");
    } else {
      addCustomSpec({
        platform: form.platform,
        publisher: form.publisher || undefined,
        category: form.category,
        format: form.format || form.name,
        name: form.name,
        width: form.width,
        height: form.height,
        aspectRatio: form.aspectRatio,
        maxFileSize: form.maxFileSize,
        fileTypes: form.fileTypes,
        duration: form.duration || undefined,
        notes: form.notes,
        typeTag: (form.typeTag as CreativeTypeTag) || undefined,
        active: true,
      });
      toast.success("Spec criada!");
    }

    setSpecs(loadCustomSpecs());
    resetForm();
  };

  const handleEdit = (spec: CustomSpecEntry) => {
    setForm({
      platform: spec.platform,
      publisher: spec.publisher || "",
      category: spec.category,
      format: spec.format,
      name: spec.name,
      width: spec.width,
      height: spec.height,
      aspectRatio: spec.aspectRatio,
      maxFileSize: spec.maxFileSize,
      fileTypes: spec.fileTypes,
      duration: spec.duration || "",
      notes: spec.notes,
      typeTag: spec.typeTag || "",
    });
    setEditingId(spec.id);
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    removeCustomSpec(id);
    setSpecs(loadCustomSpecs());
    toast.success("Spec removida!");
  };

  const handleBulkUpload = () => {
    if (!bulkText.trim()) {
      toast.error("Cole os dados da planilha");
      return;
    }
    const parsed = parseBulkSpecs(bulkText);
    if (parsed.length === 0) {
      toast.error("Nenhum dado válido encontrado. Verifique se o cabeçalho contém 'Canal'.");
      return;
    }
    parsed.forEach((spec) => addCustomSpec(spec));
    setSpecs(loadCustomSpecs());
    setBulkText("");
    toast.success(`${parsed.length} specs importadas com sucesso!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const parsed = parseBulkSpecs(text);
        if (parsed.length === 0) {
          toast.error("Nenhum dado válido encontrado no arquivo.");
          return;
        }
        parsed.forEach((spec) => addCustomSpec(spec));
        setSpecs(loadCustomSpecs());
        toast.success(`${parsed.length} specs importadas do arquivo!`);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDownloadTemplate = () => {
    const csv = generateTemplateCSV();
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_specs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSpecs = specs.filter((s) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.platform.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.publisher && s.publisher.toLowerCase().includes(q)) ||
      s.category.toLowerCase().includes(q) ||
      `${s.width}x${s.height}`.includes(q)
    );
  });

  // Unique platforms from custom specs for the form
  const existingPlatforms = [...new Set(specs.map((s) => s.platform))].sort();

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => { resetForm(); setShowAddForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Spec
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar em Massa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importação em Massa de Specs</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Cole abaixo os dados da sua planilha (CSV, separado por vírgula, ponto-e-vírgula ou tab). 
                O cabeçalho deve conter pelo menos <strong>"Canal"</strong>.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 mr-1" />
                  Baixar Template CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Carregar Arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <Textarea
                rows={10}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={"Canal,Publisher,Categoria,Formato,Nome,Largura,Altura,Proporção,Peso Máximo,Tipos de Arquivo,Duração,Tag,Observações\nGoogle Ads,,Display,Banner,Banner 300x250,300,250,6:5,150KB,JPG PNG,,Display,Exemplo"}
                className="font-mono text-xs"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleBulkUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar specs customizadas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{editingId ? "Editar Spec" : "Nova Spec Customizada"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Canal *</Label>
                <Input
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  placeholder="Ex: Google Ads"
                  list="platform-suggestions"
                />
                <datalist id="platform-suggestions">
                  {existingPlatforms.map((p) => <option key={p} value={p} />)}
                </datalist>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Publisher</Label>
                <Input
                  value={form.publisher}
                  onChange={(e) => setForm({ ...form, publisher: e.target.value })}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Categoria</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tag</Label>
                <Select value={form.typeTag || "none"} onValueChange={(v) => setForm({ ...form, typeTag: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Auto</SelectItem>
                    {TYPE_TAGS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Nome *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Banner 300x250" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Formato</Label>
                <Input value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })} placeholder="Ex: Medium Rectangle" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Largura (px)</Label>
                <Input type="number" value={form.width || ""} onChange={(e) => setForm({ ...form, width: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Altura (px)</Label>
                <Input type="number" value={form.height || ""} onChange={(e) => setForm({ ...form, height: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Proporção</Label>
                <Input value={form.aspectRatio} onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })} placeholder="Ex: 6:5" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Peso Máximo</Label>
                <Input value={form.maxFileSize} onChange={(e) => setForm({ ...form, maxFileSize: e.target.value })} placeholder="Ex: 150KB" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tipos de Arquivo</Label>
                <Input value={form.fileTypes} onChange={(e) => setForm({ ...form, fileTypes: e.target.value })} placeholder="Ex: JPG, PNG, GIF" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duração</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Ex: 15s, 30s" />
              </div>
              <div className="col-span-2 md:col-span-4 space-y-1">
                <Label className="text-xs">Observações</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionais..." />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Atualizar" : "Salvar"}
              </Button>
              <Button variant="ghost" onClick={resetForm}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Specs Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[450px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Canal</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dimensão</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Tipos</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpecs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma spec customizada cadastrada. Clique em "Nova Spec" ou "Importar em Massa".
                    </TableCell>
                  </TableRow>
                )}
                {filteredSpecs.map((spec) => (
                  <TableRow key={spec.id}>
                    <TableCell className="font-medium text-sm">{spec.platform}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{spec.publisher || "—"}</TableCell>
                    <TableCell className="text-sm">{spec.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{spec.category}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {spec.width > 0 ? `${spec.width}x${spec.height}` : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">{spec.maxFileSize || "—"}</TableCell>
                    <TableCell className="text-sm">{spec.fileTypes || "—"}</TableCell>
                    <TableCell className="text-sm">{spec.duration || "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(spec)}>
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(spec.id)}>
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {specs.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          {specs.length} spec{specs.length !== 1 ? "s" : ""} customizada{specs.length !== 1 ? "s" : ""} cadastrada{specs.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
