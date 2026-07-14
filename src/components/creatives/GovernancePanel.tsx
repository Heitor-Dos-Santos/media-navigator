import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  PLATFORMS,
  CREATIVE_SPECS_DATABASE,
  deriveTypeTag,
  isSpecActive,
  type CreativeSpecDefinition,
  type CreativeTypeTag,
} from "@/data/creativeSpecs";
import { Shield, Search, Save } from "lucide-react";
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

// Governance overrides stored in localStorage
interface SpecOverride {
  mandatory?: boolean;
  multiplier?: number;
  active?: boolean;
  typeTag?: CreativeTypeTag;
  publisher?: string;
}

const OVERRIDES_KEY = "creativeSpecOverrides";

function loadOverrides(): Record<string, SpecOverride> {
  try {
    return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, SpecOverride>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function applyOverrides(spec: CreativeSpecDefinition): CreativeSpecDefinition {
  const overrides = loadOverrides();
  const o = overrides[spec.id];
  if (!o) return spec;
  return {
    ...spec,
    mandatory: o.mandatory ?? spec.mandatory,
    multiplier: o.multiplier ?? spec.multiplier,
    active: o.active ?? spec.active,
    typeTag: o.typeTag ?? spec.typeTag,
    publisher: o.publisher ?? spec.publisher,
  };
}

export function GovernancePanel() {
  const [overrides, setOverrides] = useState<Record<string, SpecOverride>>(loadOverrides);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");

  const specs = useMemo(() => {
    let list = CREATIVE_SPECS_DATABASE.map((s) => ({ ...s, ...overrides[s.id] }));
    if (filterPlatform !== "all") list = list.filter((s) => s.platform === filterPlatform);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(lower) ||
          s.platform.toLowerCase().includes(lower) ||
          s.format.toLowerCase().includes(lower)
      );
    }
    return list;
  }, [overrides, searchTerm, filterPlatform]);

  const updateOverride = (specId: string, field: keyof SpecOverride, value: any) => {
    setOverrides((prev) => {
      const updated = { ...prev, [specId]: { ...prev[specId], [field]: value } };
      return updated;
    });
  };

  const handleSave = () => {
    saveOverrides(overrides);
    toast.success("Configurações de governança salvas!");
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Governança de Formatos
          </CardTitle>
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
        <div className="flex gap-3 mt-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar formato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterPlatform} onValueChange={setFilterPlatform}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Plataformas</SelectItem>
              {PLATFORMS.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Canal</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead className="text-center">Obrigatório</TableHead>
                  <TableHead className="text-center">Multiplicador</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specs.map((spec) => {
                  const tag = spec.typeTag || deriveTypeTag(spec.category);
                  const active = spec.active !== false;
                  return (
                    <TableRow key={spec.id} className={!active ? "opacity-50" : ""}>
                      <TableCell className="text-sm">{spec.platform}</TableCell>
                      <TableCell>
                        <Input
                          value={overrides[spec.id]?.publisher ?? spec.publisher ?? ""}
                          onChange={(e) => updateOverride(spec.id, "publisher", e.target.value || undefined)}
                          placeholder="—"
                          className="h-7 text-xs w-[120px]"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="text-sm font-medium">{spec.name}</span>
                          <div className="text-xs text-muted-foreground">
                            {spec.width > 0 ? `${spec.width}x${spec.height}` : spec.duration || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={overrides[spec.id]?.typeTag ?? tag}
                          onValueChange={(v) => updateOverride(spec.id, "typeTag", v as CreativeTypeTag)}
                        >
                          <SelectTrigger className="h-7 text-xs w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(["Display", "Vídeo", "Áudio", "DOOH", "Social", "Texto", "Push"] as CreativeTypeTag[]).map(
                              (t) => (
                                <SelectItem key={t} value={t}>
                                  {t}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={overrides[spec.id]?.mandatory ?? spec.mandatory ?? false}
                          onCheckedChange={(v) => updateOverride(spec.id, "mandatory", v)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          value={overrides[spec.id]?.multiplier ?? spec.multiplier ?? ""}
                          onChange={(e) => updateOverride(spec.id, "multiplier", parseInt(e.target.value) || undefined)}
                          placeholder="1"
                          className="h-7 text-xs w-16 mx-auto text-center"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={overrides[spec.id]?.active ?? spec.active !== false}
                          onCheckedChange={(v) => updateOverride(spec.id, "active", v)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
