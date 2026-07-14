import { type CreativeSpecDefinition, type CreativeTypeTag, CREATIVE_SPECS_DATABASE, CATEGORIES } from "@/data/creativeSpecs";

const CUSTOM_SPECS_KEY = "customCreativeSpecs";

export interface CustomSpecEntry extends CreativeSpecDefinition {
  isCustom: true;
}

export function loadCustomSpecs(): CustomSpecEntry[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_SPECS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCustomSpecs(specs: CustomSpecEntry[]) {
  localStorage.setItem(CUSTOM_SPECS_KEY, JSON.stringify(specs));
}

export function addCustomSpec(spec: Omit<CustomSpecEntry, "id" | "isCustom">): CustomSpecEntry {
  const specs = loadCustomSpecs();
  const entry: CustomSpecEntry = {
    ...spec,
    id: `custom-${crypto.randomUUID()}`,
    isCustom: true,
    active: true,
  };
  specs.push(entry);
  saveCustomSpecs(specs);
  return entry;
}

export function updateCustomSpec(id: string, updates: Partial<CreativeSpecDefinition>) {
  const specs = loadCustomSpecs();
  const idx = specs.findIndex((s) => s.id === id);
  if (idx >= 0) {
    specs[idx] = { ...specs[idx], ...updates };
    saveCustomSpecs(specs);
  }
}

export function removeCustomSpec(id: string) {
  const specs = loadCustomSpecs().filter((s) => s.id !== id);
  saveCustomSpecs(specs);
}

/** Merges built-in DB + custom specs */
export function getAllSpecs(): CreativeSpecDefinition[] {
  return [...CREATIVE_SPECS_DATABASE, ...loadCustomSpecs()];
}

/** Get all unique platforms (built-in + custom) */
export function getAllPlatforms(): string[] {
  const all = getAllSpecs();
  return [...new Set(all.map((s) => s.platform))].sort();
}

/** Get all unique publishers for a platform */
export function getAllPublishersForPlatform(platform: string): string[] {
  const all = getAllSpecs().filter((s) => s.platform === platform);
  const pubs = all.map((s) => s.publisher).filter(Boolean) as string[];
  return [...new Set(pubs)].sort();
}

/** Get unique format categories across all specs */
export function getAllFormatTypes(): string[] {
  const all = getAllSpecs();
  const cats = all.map((s) => s.category);
  return [...new Set([...CATEGORIES, ...cats])].sort();
}

/** Parse a bulk CSV/TSV string into custom spec entries */
export function parseBulkSpecs(text: string): Omit<CustomSpecEntry, "id" | "isCustom">[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Detect separator
  const sep = lines[0].includes("\t") ? "\t" : lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());

  const colMap: Record<string, number> = {};
  headers.forEach((h, i) => {
    if (h.includes("canal") || h.includes("platform")) colMap.platform = i;
    if (h.includes("publisher")) colMap.publisher = i;
    if (h.includes("categor") || h.includes("category")) colMap.category = i;
    if (h.includes("formato") || h.includes("format")) colMap.format = i;
    if (h.includes("nome") || h.includes("name")) colMap.name = i;
    if (h.includes("largura") || h.includes("width")) colMap.width = i;
    if (h.includes("altura") || h.includes("height")) colMap.height = i;
    if (h.includes("proporção") || h.includes("aspect") || h.includes("ratio")) colMap.aspectRatio = i;
    if (h.includes("peso") || h.includes("file size") || h.includes("filesize") || h.includes("max")) colMap.maxFileSize = i;
    if (h.includes("tipo") || h.includes("file type") || h.includes("filetype")) colMap.fileTypes = i;
    if (h.includes("duração") || h.includes("duration")) colMap.duration = i;
    if (h.includes("obs") || h.includes("note") || h.includes("notas")) colMap.notes = i;
    if (h.includes("tag") || h.includes("type tag")) colMap.typeTag = i;
  });

  if (colMap.platform === undefined) return [];

  const results: Omit<CustomSpecEntry, "id" | "isCustom">[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map((c) => c.trim());
    if (!cols[colMap.platform]) continue;

    const name = cols[colMap.name] || cols[colMap.format] || "Sem nome";
    results.push({
      platform: cols[colMap.platform],
      publisher: cols[colMap.publisher] || undefined,
      category: cols[colMap.category] || "Display",
      format: cols[colMap.format] || name,
      name,
      width: parseInt(cols[colMap.width]) || 0,
      height: parseInt(cols[colMap.height]) || 0,
      aspectRatio: cols[colMap.aspectRatio] || "N/A",
      maxFileSize: cols[colMap.maxFileSize] || "N/A",
      fileTypes: cols[colMap.fileTypes] || "N/A",
      duration: cols[colMap.duration] || undefined,
      notes: cols[colMap.notes] || "",
      typeTag: (cols[colMap.typeTag] as CreativeTypeTag) || undefined,
      active: true,
    });
  }
  return results;
}
