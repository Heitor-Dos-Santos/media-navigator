import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deriveTypeTag, type CreativeSpecDefinition, type CreativeTypeTag } from "@/data/creativeSpecs";
import { Trash2, FileSpreadsheet, Download, Image } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const TYPE_TAG_COLORS: Record<CreativeTypeTag, string> = {
  Display: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Vídeo: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  Áudio: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  DOOH: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Social: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  Texto: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  Push: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
};

interface SelectedSpecsTableProps { selectedSpecs: CreativeSpecDefinition[]; onRemoveSpec: (specId: string) => void; onClearAll: () => void; }

export function SelectedSpecsTable({ selectedSpecs, onRemoveSpec, onClearAll }: SelectedSpecsTableProps) {
  const groupedByPlatform = useMemo(() => { const groups: Record<string, CreativeSpecDefinition[]> = {}; selectedSpecs.forEach(spec => { if (!groups[spec.platform]) groups[spec.platform] = []; groups[spec.platform].push(spec); }); return groups; }, [selectedSpecs]);

  const handleExportXlsx = () => {
    if (selectedSpecs.length === 0) { toast.error("Selecione pelo menos um formato para exportar"); return; }
    const exportData = selectedSpecs.map(spec => ({
      Canal: spec.platform, Publisher: spec.publisher || "—", Categoria: spec.category,
      Tipo: spec.typeTag || deriveTypeTag(spec.category),
      Formato: spec.format, Nome: spec.name,
      Largura: spec.width || "N/A", Altura: spec.height || "N/A",
      "Aspect Ratio": spec.aspectRatio, "Tamanho Máx.": spec.maxFileSize,
      "Tipos de Arquivo": spec.fileTypes, Duração: spec.duration || "-", Observações: spec.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 8 }, { wch: 8 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 40 }];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Especificações Criativos");
    XLSX.writeFile(wb, `specs-criativos-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(`${selectedSpecs.length} especificações exportadas com sucesso!`);
  };

  const handleExportByPlatform = () => {
    if (selectedSpecs.length === 0) { toast.error("Selecione pelo menos um formato para exportar"); return; }
    const wb = XLSX.utils.book_new();
    Object.entries(groupedByPlatform).forEach(([platform, specs]) => {
      const exportData = specs.map(spec => ({
        Publisher: spec.publisher || "—", Categoria: spec.category,
        Tipo: spec.typeTag || deriveTypeTag(spec.category),
        Formato: spec.format, Nome: spec.name,
        Dimensões: spec.width > 0 ? `${spec.width}x${spec.height}` : "N/A",
        "Aspect Ratio": spec.aspectRatio, "Tamanho Máx.": spec.maxFileSize,
        "Tipos de Arquivo": spec.fileTypes, Duração: spec.duration || "-", Observações: spec.notes,
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 40 }];
      const sheetName = platform.replace(/[\\/*?:[\]]/g, "").substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    XLSX.writeFile(wb, `specs-por-plataforma-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast.success(`Exportado ${Object.keys(groupedByPlatform).length} abas (${selectedSpecs.length} specs)`);
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-lg flex items-center gap-2"><Image className="w-5 h-5 text-primary" />Formatos Selecionados{selectedSpecs.length > 0 && <Badge variant="secondary">{selectedSpecs.length}</Badge>}</CardTitle>
          <div className="flex items-center gap-2">
            {selectedSpecs.length > 0 && (<>
              <Button variant="outline" size="sm" onClick={handleExportByPlatform} className="text-xs"><FileSpreadsheet className="w-4 h-4 mr-1" />Por Plataforma</Button>
              <Button size="sm" onClick={handleExportXlsx} className="bg-status-success hover:bg-status-success/90 text-xs"><Download className="w-4 h-4 mr-1" />Exportar .xlsx</Button>
              <Button variant="ghost" size="sm" onClick={onClearAll} className="text-destructive text-xs"><Trash2 className="w-4 h-4 mr-1" />Limpar</Button>
            </>)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {selectedSpecs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground px-6"><Image className="w-12 h-12 mx-auto mb-4 opacity-50" /><p className="text-lg font-medium mb-2">Nenhum formato selecionado</p><p className="text-sm">Selecione os formatos desejados na lista ao lado para gerar sua planilha de especificações.</p></div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="px-6 pb-6">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Canal</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Formato</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Dimensões</TableHead>
                    <TableHead>Tamanho Máx.</TableHead>
                    <TableHead>Tipos</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSpecs.map(spec => {
                    const tag = spec.typeTag || deriveTypeTag(spec.category);
                    return (
                      <TableRow key={spec.id} className="group">
                        <TableCell><Badge variant="outline" className="font-normal">{spec.platform}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{spec.publisher || "—"}</TableCell>
                        <TableCell><div><div className="font-medium">{spec.name}</div><div className="text-xs text-muted-foreground">{spec.category}</div></div></TableCell>
                        <TableCell><Badge className={`text-[10px] px-1.5 py-0 ${TYPE_TAG_COLORS[tag]}`}>{tag}</Badge></TableCell>
                        <TableCell>{spec.width > 0 ? <code className="text-xs bg-muted px-2 py-1 rounded">{spec.width}x{spec.height}</code> : <span className="text-muted-foreground">-</span>}</TableCell>
                        <TableCell className="text-sm">{spec.maxFileSize}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{spec.fileTypes}</TableCell>
                        <TableCell className="text-sm">{spec.duration || "-"}</TableCell>
                        <TableCell><Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" onClick={() => onRemoveSpec(spec.id)}><Trash2 className="w-3 h-3" /></Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
