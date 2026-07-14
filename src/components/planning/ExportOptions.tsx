import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import type { PlanningLine } from "./PlanningTable";
import type { MonthlyBudget } from "./BudgetDistribution";
import { getAllSpecs } from "@/lib/customSpecsStore";
import type { CreativeSpecDefinition } from "@/data/creativeSpecs";

interface ExportOptionsProps {
  lines: PlanningLine[];
  client: string;
  campaign: string;
  logo?: string | null;
  brandColor?: string | null;
  year?: string;
  quarter?: string;
  periodStart?: string;
  periodEnd?: string;
  monthlyBudgets?: MonthlyBudget[];
  totalBudget?: number;
  observations?: string;
  taxonomy?: string;
}

// ── Color parsing utilities ──

function parseHexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean) && !/^[0-9a-fA-F]{3}$/.test(clean)) return null;
  if (clean.length === 3) {
    return [parseInt(clean[0] + clean[0], 16), parseInt(clean[1] + clean[1], 16), parseInt(clean[2] + clean[2], 16)];
  }
  return [parseInt(clean.substring(0, 2), 16), parseInt(clean.substring(2, 4), 16), parseInt(clean.substring(4, 6), 16)];
}

function parseHslToRgb(hslStr: string): [number, number, number] | null {
  if (!hslStr) return null;
  const nums = hslStr.match(/[\d.]+/g);
  if (!nums || nums.length < 3) return null;
  const h = parseFloat(nums[0]) / 360, s = parseFloat(nums[1]) / 100, l = parseFloat(nums[2]) / 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q2;
  return [Math.round(hue2rgb(p, q2, h + 1 / 3) * 255), Math.round(hue2rgb(p, q2, h) * 255), Math.round(hue2rgb(p, q2, h - 1 / 3) * 255)];
}

function parseColorToRgb(color: string): [number, number, number] | null {
  if (!color) return null;
  if (color.trim().startsWith("#") || /^[0-9a-fA-F]{3,6}$/.test(color.trim())) return parseHexToRgb(color.trim());
  return parseHslToRgb(color);
}

/** Lighter version of a color for subtle backgrounds */
function lightenRgb(rgb: [number, number, number], factor = 0.85): [number, number, number] {
  return rgb.map(c => Math.round(c + (255 - c) * factor)) as [number, number, number];
}

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[\s\-_\.]+/g, "");
}

export function ExportOptions({
  lines, client, campaign, logo, brandColor,
  year, quarter, periodStart, periodEnd,
  monthlyBudgets = [], totalBudget = 0,
  observations = "", taxonomy = "",
}: ExportOptionsProps) {

  const getAccentRgb = (): [number, number, number] => parseColorToRgb(brandColor || "") || [14, 140, 120];

  const getMatchingSpecs = (): CreativeSpecDefinition[] => {
    const allSpecs = getAllSpecs();
    const matched: CreativeSpecDefinition[] = [];
    const seenIds = new Set<string>();
    for (const line of lines) {
      if (!line.platform) continue;
      const normPlatform = normalizeName(line.platform);
      const normFormat = line.format ? normalizeName(line.format) : "";
      const platformSpecs = allSpecs.filter(s => {
        const np = normalizeName(s.platform);
        return np === normPlatform || np.includes(normPlatform) || normPlatform.includes(np);
      });
      if (platformSpecs.length === 0) continue;
      if (normFormat) {
        const formatMatched = platformSpecs.filter(s => {
          const nf = normalizeName(s.format);
          const nn = normalizeName(s.name);
          const nc = normalizeName(s.category);
          return nf === normFormat || nn === normFormat || nc === normFormat
            || nf.includes(normFormat) || normFormat.includes(nf)
            || nn.includes(normFormat) || normFormat.includes(nn);
        });
        if (formatMatched.length > 0) {
          for (const s of formatMatched) { if (!seenIds.has(s.id)) { seenIds.add(s.id); matched.push(s); } }
          continue;
        }
      }
      for (const s of platformSpecs) { if (!seenIds.has(s.id)) { seenIds.add(s.id); matched.push(s); } }
    }
    return matched;
  };

  const formatDateBR = (dateStr: string): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const getLineBudget = (share: number) => totalBudget > 0 ? (share / 100) * totalBudget : 0;
  const getLineMonthValue = (share: number, mb: MonthlyBudget) => (share / 100) * mb.amount;
  const fmtCompact = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtCur = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtNum = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

  const getFilename = (ext: string) => {
    const clean = taxonomy?.replace(/^Taxonomia:\s*/i, "") || "";
    const sanitized = clean ? clean.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, "_") : `planejamento_midia_${client || "cliente"}`;
    return `${sanitized}.${ext}`;
  };

  // ── XLSX Export ──
  const handleExportXLSX = () => {
    if (lines.length === 0) { toast.error("Adicione linhas ao planejamento"); return; }
    const wb = XLSX.utils.book_new();

    const headers = ["Cliente", "Campanha", "Plataforma", "Formato", "Objetivo", "Share %", "KPI", "Valor Unitário",
      ...monthlyBudgets.map(mb => mb.shortLabel), "TOTAL", "Resultados Est."];
    const rows = lines.map(l => [
      client, campaign, l.platform, l.format, l.objective,
      `${(l.share ?? 0).toFixed(1)}%`, l.kpi, (l.unitValue ?? 0).toFixed(2),
      ...monthlyBudgets.map(mb => fmtCompact(getLineMonthValue(l.share, mb))),
      fmtCompact(getLineBudget(l.share)), Math.round(l.estimatedResults ?? 0).toString(),
    ]);
    const totalRow = ["", "", "TOTAL", "", "", `${lines.reduce((s, l) => s + (l.share || 0), 0).toFixed(1)}%`, "", "",
      ...monthlyBudgets.map(mb => fmtCompact(lines.reduce((s, l) => s + getLineMonthValue(l.share, mb), 0))),
      fmtCompact(lines.reduce((s, l) => s + getLineBudget(l.share), 0)), "-"];
    const ws1 = XLSX.utils.aoa_to_sheet([headers, ...rows, totalRow]);
    XLSX.utils.book_append_sheet(wb, ws1, "Planejamento");

    if (monthlyBudgets.length > 0) {
      const mHeaders = ["Mês", "Dias no Período", "Porcentagem", "Valor"];
      const mRows = monthlyBudgets.map(mb => [mb.label, mb.daysInPeriod, `${mb.percentage.toFixed(1)}%`, fmtCur(mb.amount)]);
      mRows.push(["TOTAL", monthlyBudgets.reduce((s, mb) => s + mb.daysInPeriod, 0),
        `${monthlyBudgets.reduce((s, mb) => s + mb.percentage, 0).toFixed(1)}%`,
        fmtCur(monthlyBudgets.reduce((s, mb) => s + mb.amount, 0))]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([mHeaders, ...mRows]), "Distribuição Mensal");
    }

    if (observations.trim()) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Observações"], [observations]]), "Observações");
    }

    const specs = getMatchingSpecs();
    if (specs.length > 0) {
      const specHeaders = ["Plataforma", "Formato", "Categoria", "Largura", "Altura", "Proporção", "Peso Máx.", "Tipos de Arquivo", "Duração", "Observações"];
      const specRows = specs.map(s => [
        s.platform, s.name || s.format, s.category,
        s.width > 0 ? `${s.width}px` : "N/A", s.height > 0 ? `${s.height}px` : "N/A",
        s.aspectRatio, s.maxFileSize, s.fileTypes, s.duration || "—", s.notes || "",
      ]);
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([specHeaders, ...specRows]), "Especificações Técnicas");
    }

    XLSX.writeFile(wb, getFilename("xlsx"));
    toast.success("Arquivo XLSX exportado com sucesso!");
  };

  // ── PDF Export (matches reference layout) ──
  const handleExportPDF = async () => {
    if (lines.length === 0) { toast.error("Adicione linhas ao planejamento"); return; }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    const mx = 14;
    const contentW = W - mx * 2;

    const accent: [number, number, number] = getAccentRgb();
    const accentLight = lightenRgb(accent, 0.92);
    const black: [number, number, number] = [30, 30, 30];
    const darkGray: [number, number, number] = [80, 80, 80];
    const gray: [number, number, number] = [130, 130, 130];
    const lightGray: [number, number, number] = [243, 243, 243];
    const white: [number, number, number] = [255, 255, 255];

    // ────────────────────────────────────────────
    // PAGE 1: Main planning
    // ────────────────────────────────────────────
    doc.setFillColor(...white);
    doc.rect(0, 0, W, H, "F");

    let y = 14;

    // ── Header row: Logo (proportional) + Agency name + Title ──
    let titleStartX = mx;

    if (logo) {
      try {
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = logo;
        });
        if (img.complete && img.naturalWidth > 0) {
          // Maintain aspect ratio: fit into max 43mm wide x 24mm tall (~20% larger)
          const maxW = 43, maxH = 24;
          const ratio = img.naturalWidth / img.naturalHeight;
          let drawW = maxW, drawH = maxW / ratio;
          if (drawH > maxH) { drawH = maxH; drawW = maxH * ratio; }
          doc.addImage(img, "PNG", mx, y, drawW, drawH);
          titleStartX = mx + drawW + 5;
        }
      } catch { /* skip logo */ }
    }

    // No logo fallback — skip agency name text

    // Status badge (top-right, accent fill)
    const badgeLabel = "PLANEJAMENTO";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const badgeW = doc.getTextWidth(badgeLabel) + 10;
    const badgeH = 7;
    const badgeX = W - mx - badgeW;
    doc.setFillColor(...accent);
    doc.roundedRect(badgeX, y + 2, badgeW, badgeH, 2, 2, "F");
    doc.setTextColor(...white);
    doc.text(badgeLabel, badgeX + 5, y + 7);

    y += 26;

    // ── Plan/campaign name (14pt, bold, dark) ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...black);
    doc.text(taxonomy || `${client} - ${campaign}`, mx, y);
    y += 9;

    // ── Meta info row (inline "Label: Value" like reference) ──
    const metaItems: { label: string; value: string }[] = [];
    if (periodStart && periodEnd) metaItems.push({ label: "Período", value: `${formatDateBR(periodStart)} a ${formatDateBR(periodEnd)}` });
    if (year) metaItems.push({ label: "Ano", value: year });
    if (quarter) metaItems.push({ label: "Quarter", value: quarter });

    if (metaItems.length > 0) {
      let bx = mx;
      doc.setFontSize(9);
      metaItems.forEach((item, idx) => {
        // Label in normal weight
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...gray);
        const labelText = item.label + ": ";
        doc.text(labelText, bx, y);
        bx += doc.getTextWidth(labelText);
        // Value in bold black
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...black);
        doc.text(item.value, bx, y);
        bx += doc.getTextWidth(item.value);
        if (idx < metaItems.length - 1) bx += 8; // spacing between items
      });
      y += 10;
    }

    // ── Main data table ──
    const cols = [
      { label: "Plataforma", flex: 1.4 },
      { label: "Formato", flex: 1.2 },
      { label: "Objetivo", flex: 1.0 },
      { label: "Share %", flex: 0.6 },
      { label: "KPI", flex: 0.7 },
      { label: "Valor Unit.", flex: 1.1 },
      ...monthlyBudgets.map(mb => ({ label: mb.shortLabel, flex: 1 })),
      { label: "TOTAL", flex: 1.2 },
      { label: "Result. Est.", flex: 0.9 },
    ];
    const totalFlex = cols.reduce((s, c) => s + c.flex, 0);
    const colWidths = cols.map(c => (c.flex / totalFlex) * contentW);
    const headerH = 9;
    const rowH = 9;

    // Table header — LIGHT GRAY background, dark text (matching reference)
    doc.setFillColor(...lightGray);
    doc.rect(mx, y, contentW, headerH, "F");
    // Bottom border for header
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(mx, y + headerH, mx + contentW, y + headerH);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...darkGray);
    let cx = mx;
    cols.forEach((col, i) => {
      doc.text(col.label, cx + 3, y + 6);
      cx += colWidths[i];
    });
    y += headerH;

    // Identify which column indices should be accent-colored (monetary/highlight columns)
    // Based on reference: "Valor Unit." and "TOTAL" (last money column) use accent color + bold
    const valorUnitIdx = 5; // "Valor Unit." is index 5
    const totalColIdx = cols.length - 2; // "TOTAL" is second to last
    const resultEstIdx = cols.length - 1; // "Result. Est." last column

    // Data rows — white background with thin separators
    doc.setFontSize(7.5);
    lines.forEach((l, idx) => {
      if (y + rowH > H - 35) { doc.addPage(); y = 14; }

      // Thin bottom separator
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.2);
      doc.line(mx, y + rowH, mx + contentW, y + rowH);

      const budget = getLineBudget(l.share);
      const vals = [
        l.platform || "—", l.format || "—", l.objective || "—",
        `${(l.share ?? 0).toFixed(1)}%`, l.kpi || "—",
        l.unitValue ? `R$ ${fmtCompact(l.unitValue)} /${l.kpi || "unit"}` : "—",
        ...monthlyBudgets.map(mb => fmtCur(getLineMonthValue(l.share, mb))),
        fmtCur(budget),
        fmtNum(l.estimatedResults ?? 0),
      ];

      cx = mx;
      vals.forEach((v, i) => {
        if (i === 0) {
          // Publisher/Platform — bold black
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...black);
        } else if (i === totalColIdx) {
          // TOTAL column — bold accent color
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...accent);
        } else if (i === valorUnitIdx) {
          // Valor Unit. — normal dark
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkGray);
        } else if (i === resultEstIdx) {
          // Result. Est. — bold accent color
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...accent);
        } else if (i === 3) {
          // Share % — bold accent
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...accent);
        } else {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkGray);
        }
        doc.text(String(v).substring(0, 24), cx + 3, y + 6);
        cx += colWidths[i];
      });
      y += rowH;
    });

    y += 6;

    // ── Total investment footer ──
    const footerH = 24;
    if (y + footerH > H - 12) { doc.addPage(); y = 14; }

    // Accent tinted background for the total box
    doc.setFillColor(...accentLight);
    doc.roundedRect(mx, y, contentW, footerH, 3, 3, "F");

    // Left side: "Investimento Total" label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    doc.text("Investimento Total", mx + 8, y + 10);

    // Right side: total value (large, bold, accent color)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(...accent);
    const totalStr = fmtCur(totalBudget);
    doc.text(totalStr, mx + contentW - doc.getTextWidth(totalStr) - 8, y + 16);

    // Bottom disclaimer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...gray);
    doc.text(`${lines.length} itens | Valores sujeitos a disponibilidade e aprovação | Válido por 30 dias`, mx + 8, y + 21);

    // ────────────────────────────────────────────
    // PAGE 2 (if observations)
    // ────────────────────────────────────────────
    if (observations.trim()) {
      doc.addPage();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...accent);
      doc.text("Observações", mx, 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...darkGray);
      doc.text(doc.splitTextToSize(observations, contentW), mx, 32);
    }

    // ────────────────────────────────────────────
    // LAST PAGE: Especificações Técnicas dos Formatos
    // ────────────────────────────────────────────
    const specs = getMatchingSpecs();
    if (specs.length > 0) {
      doc.addPage();
      let sy = 14;

      // Page title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...accent);
      doc.text("Especificações Técnicas dos Formatos", mx, sy + 6);
      sy += 10;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...gray);
      doc.text("Dados extraídos da biblioteca governada de Criativos • Vinculados ao plano de mídia atual", mx, sy + 4);
      sy += 12;

      const specCols = [
        { label: "Plataforma", flex: 1.3 },
        { label: "Formato", flex: 1.4 },
        { label: "Categoria", flex: 0.9 },
        { label: "Dimensões", flex: 1 },
        { label: "Proporção", flex: 0.7 },
        { label: "Peso Máx.", flex: 0.8 },
        { label: "Tipos Arquivo", flex: 1.1 },
        { label: "Duração", flex: 0.7 },
        { label: "Observações", flex: 2.1 },
      ];
      const specTotalFlex = specCols.reduce((s, c) => s + c.flex, 0);
      const specColW = specCols.map(c => (c.flex / specTotalFlex) * contentW);

      // Table header (accent)
      doc.setFillColor(...accent);
      doc.rect(mx, sy, contentW, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...white);
      let scx = mx;
      specCols.forEach((col, i) => {
        doc.text(col.label, scx + 2, sy + 5.5);
        scx += specColW[i];
      });
      sy += 8;

      // Spec rows
      const specRowH = 7;
      doc.setFontSize(7);
      specs.forEach((spec, idx) => {
        if (sy + specRowH > H - 14) { doc.addPage(); sy = 14; }
        if (idx % 2 === 0) {
          doc.setFillColor(...lightGray);
          doc.rect(mx, sy, contentW, specRowH, "F");
        }
        doc.setDrawColor(225, 225, 225);
        doc.setLineWidth(0.2);
        doc.line(mx, sy + specRowH, mx + contentW, sy + specRowH);

        const dims = spec.width > 0 && spec.height > 0 ? `${spec.width}×${spec.height}` : "N/A";
        const vals = [
          spec.platform, spec.name || spec.format, spec.category,
          dims, spec.aspectRatio, spec.maxFileSize,
          spec.fileTypes, spec.duration || "—",
          (spec.notes || "").substring(0, 50),
        ];
        scx = mx;
        vals.forEach((v, i) => {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(...darkGray);
          doc.text(String(v).substring(0, 28), scx + 2, sy + 5);
          scx += specColW[i];
        });
        sy += specRowH;
      });

      sy += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...gray);
      doc.text(`${specs.length} especificações técnicas vinculadas ao plano de mídia`, mx, sy);
    }

    doc.save(getFilename("pdf"));
    toast.success("PDF exportado com sucesso!");
  };

  /** Fallback agency name from localStorage */
  function agency_fallback(): string {
    try {
      const s = localStorage.getItem("mediahub_agency");
      if (s) return JSON.parse(s).agencyName || "AGÊNCIA";
    } catch { /* */ }
    return "AGÊNCIA";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={lines.length === 0}>
          <Download className="w-4 h-4 mr-2" />Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportPDF}>
          <Download className="w-4 h-4 mr-2" />Exportar PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportXLSX}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />Exportar Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
