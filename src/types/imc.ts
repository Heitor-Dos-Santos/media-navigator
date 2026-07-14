/**
 * ═══════════════════════════════════════════════════════════════
 * IMC — Índice de Maturidade do Cliente
 * ═══════════════════════════════════════════════════════════════
 *
 * Mede o nível de estrutura e disciplina da operação de mídia
 * para cada cliente. NÃO influencia o ISO.
 *
 * Escala: 0–100
 *
 * Componentes:
 *   - Estrutura de Dados       (30%)
 *   - Estrutura de Mídia       (25%)
 *   - Governança Operacional   (25%)
 *   - Uso de Inteligência      (20%)
 *
 * Classificação:
 *   85–100 → Avançado
 *   70–84  → Estratégico
 *   55–69  → Estruturado
 *   < 55   → Básico
 * ═══════════════════════════════════════════════════════════════
 */

export type IMCClassification = "avancado" | "estrategico" | "estruturado" | "basico";

export interface IMCScore {
  clientId: string;
  clientName: string;
  score: number;
  classification: IMCClassification;
  classificationLabel: string;
  trend: "up" | "down" | "stable";
  trendDelta: number;

  components: {
    dataStructure: number;      // Estrutura de Dados (30%)
    mediaStructure: number;     // Estrutura de Mídia (25%)
    governance: number;         // Governança Operacional (25%)
    intelligenceUsage: number;  // Uso de Inteligência (20%)
  };

  gaps: string[];
  recommendations: string[];
  aiSummary: string;
}

export interface AgencyIMCSummary {
  averageIMC: number;
  classification: IMCClassification;
  classificationLabel: string;
  clientScores: IMCScore[];
  clientsBelowThreshold: number; // below 60
  distribution: Record<IMCClassification, number>;
}

// ── Classification ──

export function classifyIMC(score: number): { classification: IMCClassification; label: string } {
  if (score >= 85) return { classification: "avancado", label: "Avançado" };
  if (score >= 70) return { classification: "estrategico", label: "Estratégico" };
  if (score >= 55) return { classification: "estruturado", label: "Estruturado" };
  return { classification: "basico", label: "Básico" };
}

// ── Visual meta ──

export const imcClassificationMeta: Record<IMCClassification, { label: string; color: string; bg: string; border: string }> = {
  avancado: { label: "Avançado", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" },
  estrategico: { label: "Estratégico", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
  estruturado: { label: "Estruturado", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" },
  basico: { label: "Básico", color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/30" },
};

export const IMC_COMPONENT_LABELS: Record<keyof IMCScore["components"], { label: string; weight: string }> = {
  dataStructure: { label: "Estrutura de Dados", weight: "30%" },
  mediaStructure: { label: "Estrutura de Mídia", weight: "25%" },
  governance: { label: "Governança Operacional", weight: "25%" },
  intelligenceUsage: { label: "Uso de Inteligência", weight: "20%" },
};
