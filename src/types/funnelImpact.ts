// ── Funnel Impact Intelligence Types ──

export interface FunnelDailyRecord {
  date: string;
  investimentoTopo: number;
  investimentoFundo: number;
  alcanceTopo: number;
  frequenciaTopo: number;
  impressoesTopo: number;
  conversoesFundo: number;
  receitaFundo: number;
  cpaFundo: number;
  roasFundo: number;
  indicadorPromocao: 0 | 1;
  trendIndex: number;
}

export type CampaignFunnelStage = "topo" | "fundo";

export interface CampaignClassification {
  campaignId: string;
  campaignName: string;
  stage: CampaignFunnelStage;
  rule: string;
}

export interface TPIWeights {
  alcance: number;
  frequencia: number;
  investimento: number;
}

export interface TPIRecord {
  date: string;
  tpiRaw: number;
  tpiAdstock: number;
}

export interface LagModelResult {
  lagDays: number;
  r2: number;
  r2Adjusted: number;
  beta0: number;
  beta1: number; // topo impact coefficient
  beta2: number; // fundo spend
  beta3: number; // trend
  beta4: number; // promo
  aic: number;
  bic: number;
  beta1Significant: boolean;
  pValue: number;
}

export interface AdstockModelResult {
  lambda: number;
  r2Adjusted: number;
  beta1: number;
  aic: number;
  selected: boolean;
}

export interface IncrementalImpact {
  incrementalConversions: number;
  incrementalRevenue: number;
  cpaReduction: number;
  cpaReductionPct: number;
  roasImpact: number;
  roasImpactPct: number;
}

export interface SaturationPoint {
  tpiAdstock: number;
  modeledConversions: number;
  marginalReturn: number;
}

export type ElasticitySensitivity = "alta" | "media" | "baixa";

export interface ElasticityResult {
  elasticity: number;
  sensitivity: ElasticitySensitivity;
  description: string;
}

export interface SimulationInput {
  increaseType: "percent" | "absolute";
  value: number;
}

export interface SimulationResult {
  incrementalConversions: number;
  incrementalRevenue: number;
  newCPA: number;
  newROAS: number;
  marginalROI: number;
}

export type ConfidenceLevel = "alta" | "media" | "baixa";

export interface ModelConfidence {
  level: ConfidenceLevel;
  r2Adjusted: number;
  beta1Significant: boolean;
  dataVariation: number;
  color: string;
  bg: string;
}

export interface FunnelImpactAnalysis {
  bestLagModel: LagModelResult;
  allLagModels: LagModelResult[];
  adstockModels: AdstockModelResult[];
  bestAdstock: AdstockModelResult;
  tpiSeries: TPIRecord[];
  incrementalImpact: IncrementalImpact;
  saturationCurve: SaturationPoint[];
  elasticity: ElasticityResult;
  confidence: ModelConfidence;
  executiveSummary: string;
}
