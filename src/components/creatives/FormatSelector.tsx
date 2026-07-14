import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  PLATFORMS,
  CREATIVE_SPECS_DATABASE,
  getCategoriesByPlatform,
  getSpecsByPlatformAndCategory,
  isSpecActive,
  deriveTypeTag,
  type CreativeSpecDefinition,
  type CreativeTypeTag,
} from "@/data/creativeSpecs";
import { getAllSpecs } from "@/lib/customSpecsStore";
import { Search, Check, X, Filter, Eye, EyeOff } from "lucide-react";

const TYPE_TAG_COLORS: Record<CreativeTypeTag, string> = {
  Display: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Vídeo: "bg-purple-500/15 text-purple-700 dark:text-purple-400",
  Áudio: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  DOOH: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Social: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
  Texto: "bg-slate-500/15 text-slate-700 dark:text-slate-400",
  Push: "bg-orange-500/15 text-orange-700 dark:text-orange-400",
};

interface FormatSelectorProps {
  selectedSpecs: CreativeSpecDefinition[];
  onSelectionChange: (specs: CreativeSpecDefinition[]) => void;
  showInactive?: boolean;
}

export function FormatSelector({ selectedSpecs, onSelectionChange, showInactive = false }: FormatSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPlatforms, setExpandedPlatforms] = useState<string[]>([]);
  const selectedIds = useMemo(() => new Set(selectedSpecs.map((s) => s.id)), [selectedSpecs]);

  // Use merged specs (built-in + custom)
  const allSpecsDB = useMemo(() => getAllSpecs(), []);

  // Derive dynamic platforms list
  const dynamicPlatforms = useMemo(() => {
    const platformNames = [...new Set(allSpecsDB.map((s) => s.platform))];
    return platformNames.map((name) => {
      const existing = PLATFORMS.find((p) => p.name === name);
      return existing || { id: name.toLowerCase().replace(/\s+/g, "-"), name };
    });
  }, [allSpecsDB]);

  // Filter specs by search and active state
  const filteredSpecs = useMemo(() => {
    let specs = allSpecsDB;
    if (!showInactive) specs = specs.filter(isSpecActive);
    if (!searchTerm) return specs;
    const lower = searchTerm.toLowerCase();
    return specs.filter(
      (spec) =>
        spec.name.toLowerCase().includes(lower) ||
        spec.platform.toLowerCase().includes(lower) ||
        spec.format.toLowerCase().includes(lower) ||
        spec.category.toLowerCase().includes(lower) ||
        (spec.publisher && spec.publisher.toLowerCase().includes(lower)) ||
        `${spec.width}x${spec.height}`.includes(lower) ||
        (spec.typeTag || deriveTypeTag(spec.category)).toLowerCase().includes(lower)
    );
  }, [searchTerm, showInactive, allSpecsDB]);

  // Auto-open matching accordions when searching
  useEffect(() => {
    if (searchTerm) {
      const matchingPlatformIds = new Set<string>();
      filteredSpecs.forEach((spec) => {
        const platform = dynamicPlatforms.find((p) => p.name === spec.platform);
        if (platform) matchingPlatformIds.add(platform.id);
      });
      setExpandedPlatforms(Array.from(matchingPlatformIds));
    }
  }, [searchTerm, filteredSpecs]);

  const handleToggleSpec = (spec: CreativeSpecDefinition) => {
    if (selectedIds.has(spec.id)) onSelectionChange(selectedSpecs.filter((s) => s.id !== spec.id));
    else onSelectionChange([...selectedSpecs, spec]);
  };

  const handleSelectAllPlatform = (platform: string) => {
    const platformSpecs = filteredSpecs.filter((s) => s.platform === platform && isSpecActive(s));
    const allSelected = platformSpecs.every((s) => selectedIds.has(s.id));
    if (allSelected) onSelectionChange(selectedSpecs.filter((s) => s.platform !== platform));
    else {
      const newSpecs = platformSpecs.filter((s) => !selectedIds.has(s.id));
      onSelectionChange([...selectedSpecs, ...newSpecs]);
    }
  };

  const handleSelectAllCategory = (platform: string, category: string, publisher?: string) => {
    const categorySpecs = getSpecsByPlatformAndCategory(platform, category).filter(
      (s) => isSpecActive(s) && (publisher ? s.publisher === publisher : !s.publisher)
    );
    const allSelected = categorySpecs.every((s) => selectedIds.has(s.id));
    if (allSelected) {
      const idsToRemove = new Set(categorySpecs.map((s) => s.id));
      onSelectionChange(selectedSpecs.filter((s) => !idsToRemove.has(s.id)));
    } else {
      const newSpecs = categorySpecs.filter((s) => !selectedIds.has(s.id));
      onSelectionChange([...selectedSpecs, ...newSpecs]);
    }
  };

  const clearSelection = () => onSelectionChange([]);
  const getPlatformSelectionCount = (platform: string) => selectedSpecs.filter((s) => s.platform === platform).length;

  // Group specs by platform → publisher → category
  const getPublishersForPlatform = (platform: string) => {
    const specs = filteredSpecs.filter((s) => s.platform === platform);
    const publishers = new Set<string>();
    let hasDirectSpecs = false;
    specs.forEach((s) => {
      if (s.publisher) publishers.add(s.publisher);
      else hasDirectSpecs = true;
    });
    return { publishers: Array.from(publishers).sort(), hasDirectSpecs };
  };

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Selecionar Formatos
          </CardTitle>
          {selectedSpecs.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              <X className="w-4 h-4 mr-1" />
              Limpar ({selectedSpecs.length})
            </Button>
          )}
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar formato, canal, publisher, dimensão ou tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6 pb-6">
          <Accordion type="multiple" value={expandedPlatforms} onValueChange={setExpandedPlatforms} className="w-full">
            {dynamicPlatforms.map((platform) => {
              const platformSpecs = filteredSpecs.filter((s) => s.platform === platform.name);
              if (platformSpecs.length === 0) return null;
              const selectionCount = getPlatformSelectionCount(platform.name);
              const totalCount = platformSpecs.filter(isSpecActive).length;
              const allSelected = selectionCount === totalCount && totalCount > 0;
              const { publishers, hasDirectSpecs } = getPublishersForPlatform(platform.name);

              return (
                <AccordionItem key={platform.id} value={platform.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-medium">{platform.name}</span>
                      {publishers.length > 0 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {publishers.length} publisher{publishers.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {selectionCount > 0 && (
                        <Badge variant="default" className="ml-auto mr-4 bg-primary/20 text-primary">
                          {selectionCount}/{totalCount}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pl-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-border">
                        <Checkbox
                          id={`select-all-${platform.id}`}
                          checked={allSelected}
                          onCheckedChange={() => handleSelectAllPlatform(platform.name)}
                        />
                        <label htmlFor={`select-all-${platform.id}`} className="text-sm font-medium cursor-pointer">
                          Selecionar todos ({totalCount})
                        </label>
                      </div>

                      {/* Direct specs (no publisher) */}
                      {hasDirectSpecs && (
                        <SpecCategoryList
                          platform={platform}
                          specs={platformSpecs.filter((s) => !s.publisher)}
                          selectedIds={selectedIds}
                          selectedSpecs={selectedSpecs}
                          onToggleSpec={handleToggleSpec}
                          onSelectAllCategory={handleSelectAllCategory}
                          showInactive={showInactive}
                        />
                      )}

                      {/* Publisher groups */}
                      {publishers.map((pub) => (
                        <div key={pub} className="border-l-2 border-primary/20 pl-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">{pub}</span>
                            <Badge variant="outline" className="text-[10px]">Publisher</Badge>
                          </div>
                          <SpecCategoryList
                            platform={platform}
                            specs={platformSpecs.filter((s) => s.publisher === pub)}
                            selectedIds={selectedIds}
                            selectedSpecs={selectedSpecs}
                            publisher={pub}
                            onToggleSpec={handleToggleSpec}
                            onSelectAllCategory={handleSelectAllCategory}
                            showInactive={showInactive}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Sub-component for category/spec list
function SpecCategoryList({
  platform,
  specs,
  selectedIds,
  selectedSpecs,
  publisher,
  onToggleSpec,
  onSelectAllCategory,
  showInactive,
}: {
  platform: { id: string; name: string };
  specs: CreativeSpecDefinition[];
  selectedIds: Set<string>;
  selectedSpecs: CreativeSpecDefinition[];
  publisher?: string;
  onToggleSpec: (spec: CreativeSpecDefinition) => void;
  onSelectAllCategory: (platform: string, category: string, publisher?: string) => void;
  showInactive: boolean;
}) {
  const categories = [...new Set(specs.map((s) => s.category))];

  return (
    <div className="space-y-3">
      {categories.map((category) => {
        const categorySpecs = specs.filter((s) => s.category === category);
        if (categorySpecs.length === 0) return null;
        const activeSpecs = categorySpecs.filter(isSpecActive);
        const catSelectionCount = activeSpecs.filter((s) => selectedIds.has(s.id)).length;
        const catAllSelected = catSelectionCount === activeSpecs.length && activeSpecs.length > 0;

        return (
          <div key={`${publisher || "direct"}-${category}`} className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`cat-${platform.id}-${publisher || "d"}-${category}`}
                checked={catAllSelected}
                onCheckedChange={() => onSelectAllCategory(platform.name, category, publisher)}
              />
              <label
                htmlFor={`cat-${platform.id}-${publisher || "d"}-${category}`}
                className="text-sm font-medium cursor-pointer text-muted-foreground"
              >
                {category} ({activeSpecs.length})
              </label>
            </div>
            <div className="grid grid-cols-1 gap-1 pl-6">
              {categorySpecs.map((spec) => {
                const inactive = !isSpecActive(spec);
                if (inactive && !showInactive) return null;
                const tag = spec.typeTag || deriveTypeTag(spec.category);
                return (
                  <div
                    key={spec.id}
                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                      inactive
                        ? "opacity-40"
                        : selectedIds.has(spec.id)
                        ? "bg-primary/10"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => !inactive && onToggleSpec(spec)}
                  >
                    <Checkbox
                      checked={selectedIds.has(spec.id)}
                      disabled={inactive}
                      onCheckedChange={() => !inactive && onToggleSpec(spec)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{spec.name}</span>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {spec.width > 0 ? `${spec.width}x${spec.height}` : spec.duration || "N/A"}
                        </code>
                        <Badge className={`text-[10px] px-1.5 py-0 ${TYPE_TAG_COLORS[tag]}`}>{tag}</Badge>
                        {spec.mandatory && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            Obrigatório
                          </Badge>
                        )}
                        {inactive && <EyeOff className="w-3 h-3 text-muted-foreground" />}
                      </div>
                    </div>
                    {selectedIds.has(spec.id) && <Check className="w-4 h-4 text-primary shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
