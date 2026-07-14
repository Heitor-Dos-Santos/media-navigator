/**
 * ═══════════════════════════════════════════════════════════════
 * FUNNEL IMPACT ENGINE
 * Motor proprietário de diagnóstico de impacto estrutural de funil
 * ═══════════════════════════════════════════════════════════════
 *
 * PHASE 1: Multi-lag OLS regression
 * PHASE 2: Adstock decay + logarithmic saturation
 */

import type {
  FunnelDailyRecord, TPIWeights, TPIRecord, LagModelResult,
  AdstockModelResult, IncrementalImpact, SaturationPoint,
  ElasticityResult, ElasticitySensitivity, SimulationResult,
  SimulationInput, ModelConfidence, ConfidenceLevel, FunnelImpactAnalysis,
} from "@/types/funnelImpact";

// ── Helpers ──

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function normalize(arr: number[]): number[] {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min || 1;
  return arr.map(v => (v - min) / range);
}

function variance(arr: number[]): number {
  const m = mean(arr);
  return arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length;
}

function coefficientOfVariation(arr: number[]): number {
  const m = mean(arr);
  if (m === 0) return 0;
  return Math.sqrt(variance(arr)) / Math.abs(m);
}

// ── TPI — Top Pressure Index ──

export function computeTPI(
  data: FunnelDailyRecord[],
  weights: TPIWeights = { alcance: 0.4, frequencia: 0.3, investimento: 0.3 }
): TPIRecord[] {
  const alcNorm = normalize(data.map(d => d.alcanceTopo));
  const freqNorm = normalize(data.map(d => d.frequenciaTopo));
  const invNorm = normalize(data.map(d => d.investimentoTopo));

  return data.map((d, i) => ({
    date: d.date,
    tpiRaw: +(alcNorm[i] * weights.alcance + freqNorm[i] * weights.frequencia + invNorm[i] * weights.investimento).toFixed(4),
    tpiAdstock: 0, // filled later
  }));
}

// ── Adstock Transform ──

export function applyAdstock(tpiRecords: TPIRecord[], lambda: number): TPIRecord[] {
  const result = tpiRecords.map(r => ({ ...r }));
  result[0].tpiAdstock = result[0].tpiRaw;
  for (let i = 1; i < result.length; i++) {
    result[i].tpiAdstock = +(result[i].tpiRaw + lambda * result[i - 1].tpiAdstock).toFixed(4);
  }
  return result;
}

// ── OLS Regression (multiple) via Normal Equations with z-score normalization ──

interface OLSResult {
  betas: number[];
  r2: number;
  r2Adjusted: number;
  residuals: number[];
  aic: number;
  bic: number;
  seB1: number;
}

function stdDev(arr: number[]): number {
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / arr.length;
  return Math.sqrt(v) || 1;
}

function olsMultiple(Y: number[], Xs: number[][]): OLSResult {
  const n = Y.length;
  const k = Xs.length;

  // Z-score normalize all variables for numerical stability
  const yMean = mean(Y);
  const yStd = stdDev(Y);
  const Yz = Y.map(v => (v - yMean) / yStd);

  const xMeans = Xs.map(x => mean(x));
  const xStds = Xs.map(x => stdDev(x));
  const Xz = Xs.map((x, j) => x.map(v => (v - xMeans[j]) / xStds[j]));

  // Normal equations on z-scored data: β_z = (X'X)^-1 X'Y
  // For k<=4 we can use direct Gauss elimination on the augmented matrix

  // Build X'X (k x k) and X'Y (k x 1) - no intercept needed on z-scored data
  const XtX: number[][] = Array.from({ length: k }, () => new Array(k).fill(0));
  const XtY: number[] = new Array(k).fill(0);

  for (let i = 0; i < n; i++) {
    for (let a = 0; a < k; a++) {
      XtY[a] += Xz[a][i] * Yz[i];
      for (let b = 0; b < k; b++) {
        XtX[a][b] += Xz[a][i] * Xz[b][i];
      }
    }
  }

  // Solve via Gauss elimination with partial pivoting
  const aug: number[][] = XtX.map((row, i) => [...row, XtY[i]]);
  for (let col = 0; col < k; col++) {
    // Pivot
    let maxRow = col;
    for (let row = col + 1; row < k; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
    }
    [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];

    const pivot = aug[col][col];
    if (Math.abs(pivot) < 1e-12) continue;

    for (let j = col; j <= k; j++) aug[col][j] /= pivot;
    for (let row = 0; row < k; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = col; j <= k; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  const betasZ = aug.map(row => row[k]);

  // Convert back to original scale
  // Y = yMean + yStd * Σ(βz_j * (Xj - xMean_j) / xStd_j)
  // => β_j = βz_j * yStd / xStd_j
  // => β_0 = yMean - Σ(β_j * xMean_j)

  const betas: number[] = new Array(k + 1).fill(0);
  for (let j = 0; j < k; j++) {
    betas[j + 1] = (betasZ[j] || 0) * yStd / xStds[j];
  }
  betas[0] = yMean;
  for (let j = 0; j < k; j++) {
    betas[0] -= betas[j + 1] * xMeans[j];
  }

  // Compute residuals, R², AIC, BIC
  const residuals: number[] = [];
  let ssRes = 0;
  let ssTot = 0;

  for (let i = 0; i < n; i++) {
    let pred = betas[0];
    for (let j = 0; j < k; j++) pred += betas[j + 1] * Xs[j][i];
    const r = Y[i] - pred;
    residuals.push(r);
    ssRes += r * r;
    ssTot += (Y[i] - yMean) ** 2;
  }

  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
  const r2Adjusted = 1 - ((1 - r2) * (n - 1)) / Math.max(n - k - 1, 1);
  const aic = n * Math.log(Math.max(ssRes / n, 1e-10)) + 2 * (k + 1);
  const bic = n * Math.log(Math.max(ssRes / n, 1e-10)) + Math.log(n) * (k + 1);

  // Standard error of β1
  const mse = ssRes / Math.max(n - k - 1, 1);
  const x1Var = variance(Xs[0]);
  const seB1 = Math.sqrt(mse / Math.max(x1Var * n, 0.0001));

  return { betas, r2: Math.max(r2, 0), r2Adjusted: Math.max(r2Adjusted, 0), residuals, aic, bic, seB1 };
}

// ── PHASE 1: Lag Model Selection ──

export function runLagModels(data: FunnelDailyRecord[], lags: number[] = [3, 7, 14, 21]): LagModelResult[] {
  const results: LagModelResult[] = [];
  
  for (const lag of lags) {
    if (lag >= data.length) continue;
    
    const n = data.length - lag;
    const Y = data.slice(lag).map(d => d.conversoesFundo);
    const X1 = data.slice(0, n).map(d => d.investimentoTopo); // lagged topo
    const X2 = data.slice(lag).map(d => d.investimentoFundo);
    const X3 = data.slice(lag).map(d => d.trendIndex);
    const X4 = data.slice(lag).map(d => d.indicadorPromocao);
    
    const ols = olsMultiple(Y, [X1, X2, X3, X4]);
    
    // t-statistic for β1
    const tStat = Math.abs(ols.betas[1]) / Math.max(ols.seB1, 0.0001);
    const significant = tStat > 2.0; // ~95% confidence
    const pValue = Math.max(0.001, Math.min(0.5, 2 * Math.exp(-0.5 * tStat * tStat)));
    
    results.push({
      lagDays: lag,
      r2: +ols.r2.toFixed(4),
      r2Adjusted: +ols.r2Adjusted.toFixed(4),
      beta0: +ols.betas[0].toFixed(4),
      beta1: +ols.betas[1].toFixed(6),
      beta2: +ols.betas[2].toFixed(6),
      beta3: +ols.betas[3].toFixed(6),
      beta4: +ols.betas[4].toFixed(4),
      aic: +ols.aic.toFixed(2),
      bic: +ols.bic.toFixed(2),
      beta1Significant: significant,
      pValue: +pValue.toFixed(4),
    });
  }
  
  return results;
}

export function selectBestLagModel(models: LagModelResult[]): LagModelResult {
  // Prioritize: significant β1 + highest R² adjusted + lowest AIC
  const significant = models.filter(m => m.beta1Significant);
  const pool = significant.length > 0 ? significant : models;
  return pool.sort((a, b) => b.r2Adjusted - a.r2Adjusted || a.aic - b.aic)[0];
}

// ── PHASE 2: Adstock Model Selection ──

export function runAdstockModels(
  data: FunnelDailyRecord[],
  tpiBase: TPIRecord[],
  lambdas: number[] = [0.3, 0.5, 0.7, 0.85]
): AdstockModelResult[] {
  return lambdas.map(lambda => {
    const adstocked = applyAdstock(tpiBase, lambda);
    const Y = data.map(d => d.conversoesFundo);
    const X1 = adstocked.map(r => r.tpiAdstock);
    const X2 = data.map(d => d.investimentoFundo);
    const X3 = data.map(d => d.trendIndex);
    
    const ols = olsMultiple(Y, [X1, X2, X3]);
    
    return {
      lambda,
      r2Adjusted: +ols.r2Adjusted.toFixed(4),
      beta1: +ols.betas[1].toFixed(4),
      aic: +ols.aic.toFixed(2),
      selected: false,
    };
  });
}

export function selectBestAdstock(models: AdstockModelResult[]): AdstockModelResult {
  const sorted = [...models].sort((a, b) => b.r2Adjusted - a.r2Adjusted || a.aic - b.aic);
  sorted[0].selected = true;
  return sorted[0];
}

// ── Incrementality ──

export function computeIncrementalImpact(
  data: FunnelDailyRecord[],
  beta1: number,
  tpiSeries: TPIRecord[]
): IncrementalImpact {
  const totalTPI = tpiSeries.reduce((s, r) => s + r.tpiAdstock, 0);
  const incrementalConversions = Math.round(Math.abs(beta1) * totalTPI);
  
  const avgRevPerConversion = mean(data.map(d => d.receitaFundo)) / Math.max(mean(data.map(d => d.conversoesFundo)), 1);
  const incrementalRevenue = Math.round(incrementalConversions * avgRevPerConversion);
  
  const totalFundoSpend = data.reduce((s, d) => s + d.investimentoFundo, 0);
  const totalConversions = data.reduce((s, d) => s + d.conversoesFundo, 0);
  const baseCPA = totalFundoSpend / Math.max(totalConversions, 1);
  const newCPA = totalFundoSpend / Math.max(totalConversions + incrementalConversions, 1);
  const cpaReduction = baseCPA - newCPA;
  
  const totalRevenue = data.reduce((s, d) => s + d.receitaFundo, 0);
  const baseROAS = totalRevenue / Math.max(totalFundoSpend, 1);
  const newROAS = (totalRevenue + incrementalRevenue) / Math.max(totalFundoSpend, 1);
  
  return {
    incrementalConversions,
    incrementalRevenue,
    cpaReduction: +cpaReduction.toFixed(2),
    cpaReductionPct: +((cpaReduction / Math.max(baseCPA, 1)) * 100).toFixed(1),
    roasImpact: +(newROAS - baseROAS).toFixed(2),
    roasImpactPct: +(((newROAS - baseROAS) / Math.max(baseROAS, 0.01)) * 100).toFixed(1),
  };
}

// ── Saturation Curve ──

export function computeSaturationCurve(tpiSeries: TPIRecord[], data: FunnelDailyRecord[]): SaturationPoint[] {
  const X = tpiSeries.map(r => Math.log(Math.max(r.tpiAdstock, 0.001)));
  const Y = data.map(d => d.conversoesFundo);
  
  // ln regression: Y = α + β * ln(TPI_Adstock)
  const ols = olsMultiple(Y, [X]);
  const alpha = ols.betas[0];
  const beta = ols.betas[1];
  
  // Generate curve points
  const maxTPI = Math.max(...tpiSeries.map(r => r.tpiAdstock));
  const points: SaturationPoint[] = [];
  
  for (let i = 1; i <= 50; i++) {
    const tpi = (maxTPI / 50) * i;
    const modeled = alpha + beta * Math.log(Math.max(tpi, 0.001));
    const marginal = beta / Math.max(tpi, 0.001);
    points.push({
      tpiAdstock: +tpi.toFixed(4),
      modeledConversions: Math.max(0, +modeled.toFixed(1)),
      marginalReturn: +marginal.toFixed(4),
    });
  }
  
  return points;
}

// ── Elasticity ──

export function computeElasticity(data: FunnelDailyRecord[], tpiSeries: TPIRecord[]): ElasticityResult {
  // Split into two halves and compare
  const mid = Math.floor(data.length / 2);
  const tpi1 = mean(tpiSeries.slice(0, mid).map(r => r.tpiAdstock));
  const tpi2 = mean(tpiSeries.slice(mid).map(r => r.tpiAdstock));
  const conv1 = mean(data.slice(0, mid).map(d => d.conversoesFundo));
  const conv2 = mean(data.slice(mid).map(d => d.conversoesFundo));
  
  const pctTPI = (tpi2 - tpi1) / Math.max(tpi1, 0.001);
  const pctConv = (conv2 - conv1) / Math.max(conv1, 0.001);
  
  const elasticity = pctTPI !== 0 ? +(pctConv / pctTPI).toFixed(2) : 0;
  
  let sensitivity: ElasticitySensitivity;
  let description: string;
  
  if (Math.abs(elasticity) >= 1.0) {
    sensitivity = "alta";
    description = "Conversões respondem fortemente à pressão de topo. Cada aumento no TPI gera impacto proporcional ou superior nas conversões.";
  } else if (Math.abs(elasticity) >= 0.5) {
    sensitivity = "media";
    description = "Conversões respondem moderadamente à pressão de topo. O impacto existe, mas é parcial.";
  } else {
    sensitivity = "baixa";
    description = "Conversões respondem pouco à pressão de topo. Outros fatores dominam o resultado.";
  }
  
  return { elasticity, sensitivity, description };
}

// ── Simulator ──

export function runSimulation(
  input: SimulationInput,
  data: FunnelDailyRecord[],
  beta1: number,
  tpiSeries: TPIRecord[]
): SimulationResult {
  const totalTopoSpend = data.reduce((s, d) => s + d.investimentoTopo, 0);
  const totalFundoSpend = data.reduce((s, d) => s + d.investimentoFundo, 0);
  const totalConversions = data.reduce((s, d) => s + d.conversoesFundo, 0);
  const totalRevenue = data.reduce((s, d) => s + d.receitaFundo, 0);
  
  let additionalSpend: number;
  if (input.increaseType === "percent") {
    additionalSpend = totalTopoSpend * (input.value / 100);
  } else {
    additionalSpend = input.value;
  }
  
  // Estimate TPI increase proportionally
  const avgTPI = mean(tpiSeries.map(r => r.tpiAdstock));
  const tpiIncrease = avgTPI * (additionalSpend / Math.max(totalTopoSpend, 1));
  const incrementalConversions = Math.round(Math.abs(beta1) * tpiIncrease * data.length);
  
  const avgRevPerConv = totalRevenue / Math.max(totalConversions, 1);
  const incrementalRevenue = Math.round(incrementalConversions * avgRevPerConv);
  
  const newTotalConversions = totalConversions + incrementalConversions;
  const newCPA = totalFundoSpend / Math.max(newTotalConversions, 1);
  const newROAS = (totalRevenue + incrementalRevenue) / Math.max(totalFundoSpend, 1);
  const marginalROI = additionalSpend > 0 ? +(incrementalRevenue / additionalSpend).toFixed(2) : 0;
  
  return {
    incrementalConversions,
    incrementalRevenue,
    newCPA: +newCPA.toFixed(2),
    newROAS: +newROAS.toFixed(2),
    marginalROI,
  };
}

// ── Confidence Assessment ──

export function assessConfidence(
  bestLag: LagModelResult,
  data: FunnelDailyRecord[]
): ModelConfidence {
  const cv = coefficientOfVariation(data.map(d => d.conversoesFundo));
  
  let level: ConfidenceLevel;
  if (bestLag.r2Adjusted >= 0.65 && bestLag.beta1Significant && cv < 0.3) {
    level = "alta";
  } else if (bestLag.r2Adjusted >= 0.4 && (bestLag.beta1Significant || cv < 0.4)) {
    level = "media";
  } else {
    level = "baixa";
  }
  
  const meta: Record<ConfidenceLevel, { color: string; bg: string }> = {
    alta: { color: "text-emerald-500", bg: "bg-emerald-500/10" },
    media: { color: "text-amber-500", bg: "bg-amber-500/10" },
    baixa: { color: "text-red-500", bg: "bg-red-500/10" },
  };
  
  return {
    level,
    r2Adjusted: bestLag.r2Adjusted,
    beta1Significant: bestLag.beta1Significant,
    dataVariation: +cv.toFixed(3),
    ...meta[level],
  };
}

// ── Master Analysis Runner ──

export function runFunnelImpactAnalysis(
  data: FunnelDailyRecord[],
  tpiWeights?: TPIWeights
): FunnelImpactAnalysis {
  // Phase 1: Lag models
  const allLagModels = runLagModels(data);
  const bestLagModel = selectBestLagModel(allLagModels);
  
  // Compute TPI
  const tpiBase = computeTPI(data, tpiWeights);
  
  // Phase 2: Adstock
  const adstockModels = runAdstockModels(data, tpiBase);
  const bestAdstock = selectBestAdstock(adstockModels);
  const tpiSeries = applyAdstock(tpiBase, bestAdstock.lambda);
  
  // Incrementality
  const incrementalImpact = computeIncrementalImpact(data, bestAdstock.beta1, tpiSeries);
  
  // Saturation
  const saturationCurve = computeSaturationCurve(tpiSeries, data);
  
  // Elasticity
  const elasticity = computeElasticity(data, tpiSeries);
  
  // Confidence
  const confidence = assessConfidence(bestLagModel, data);
  
  // Executive summary
  const executiveSummary = generateExecutiveSummary(bestLagModel, bestAdstock, incrementalImpact, elasticity, confidence);
  
  return {
    bestLagModel,
    allLagModels,
    adstockModels,
    bestAdstock,
    tpiSeries,
    incrementalImpact,
    saturationCurve,
    elasticity,
    confidence,
    executiveSummary,
  };
}

function generateExecutiveSummary(
  lag: LagModelResult,
  adstock: AdstockModelResult,
  impact: IncrementalImpact,
  elasticity: ElasticityResult,
  confidence: ModelConfidence
): string {
  return `O modelo identificou que a pressão de topo de funil gera impacto incremental nas conversões de fundo com uma janela ótima de ${lag.lagDays} dias (R² ajustado: ${(lag.r2Adjusted * 100).toFixed(1)}%). ` +
    `Com decaimento Adstock de λ=${adstock.lambda}, estimamos ${impact.incrementalConversions} conversões incrementais no período, ` +
    `resultando em redução de CPA de ${impact.cpaReductionPct}% e melhoria de ROAS de ${impact.roasImpactPct}%. ` +
    `A elasticidade topo→fundo é de ${elasticity.elasticity} (sensibilidade ${elasticity.sensitivity}). ` +
    `Nível de confiança: ${confidence.level}.`;
}
