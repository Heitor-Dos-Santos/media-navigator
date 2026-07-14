// Pattern Learning Engine — Confidence & Detection Logic

import type { ConfidenceFactors, LearnedPattern, PatternCampaignSnapshot, ImpactLevel } from "@/types/patternLearning";

/**
 * Confidence Score = weighted composite of sample size, repetition,
 * stability, low variance, and low drift.
 */
export function computeConfidence(f: ConfidenceFactors): number {
  const sampleW = Math.min(f.sampleSize / 50, 1) * 25;          // max 25
  const repW = Math.min(f.repetitionCount / 10, 1) * 25;         // max 25
  const stabW = f.stabilityScore * 20;                            // max 20
  const varW = (1 - Math.min(f.varianceLevel, 1)) * 15;          // max 15
  const driftW = (1 - Math.min(f.driftImpact, 1)) * 15;          // max 15
  return Math.round(Math.min(sampleW + repW + stabW + varW + driftW, 100));
}

export function impactFromConfidence(score: number): ImpactLevel {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

/* ─── Frequency Behavior Detection ─── */
export function detectFrequencyPatterns(campaigns: PatternCampaignSnapshot[]): Partial<LearnedPattern>[] {
  const hits = campaigns.filter(
    c => c.frequency > c.frequencyPrev &&
         c.conversionRate < c.conversionRatePrev &&
         c.cpa > c.cpaPrev
  );
  if (hits.length < 2) return [];

  const avgThreshold = hits.reduce((s, c) => s + c.frequency, 0) / hits.length;
  const conf = computeConfidence({
    sampleSize: hits.length,
    repetitionCount: hits.length,
    stabilityScore: hits.length >= 5 ? 0.85 : 0.6,
    varianceLevel: 0.2,
    driftImpact: 0.1,
  });

  return [{
    pattern_type: "frequency",
    pattern_description: `Efficiency drop detected after frequency threshold ~${avgThreshold.toFixed(1)}`,
    metric_threshold: avgThreshold,
    supporting_data_points: hits.length,
    statistical_strength_score: hits.length / campaigns.length,
    confidence_score: conf,
    impact_level: impactFromConfidence(conf),
    strategic_interpretation: `Campaigns show efficiency erosion when frequency exceeds ${avgThreshold.toFixed(1)}. Consider capping frequency or refreshing creatives.`,
  }];
}

/* ─── Elasticity Structural Pattern ─── */
export function detectElasticityPatterns(campaigns: PatternCampaignSnapshot[]): Partial<LearnedPattern>[] {
  const patterns: Partial<LearnedPattern>[] = [];

  const scalable = campaigns.filter(c => c.elasticityScore > 1.2 && c.margin >= c.marginPrev);
  if (scalable.length >= 2) {
    const conf = computeConfidence({
      sampleSize: scalable.length,
      repetitionCount: scalable.length,
      stabilityScore: 0.8,
      varianceLevel: 0.15,
      driftImpact: 0.05,
    });
    patterns.push({
      pattern_type: "elasticity",
      pattern_description: "High elasticity scalable profile — margin stable or growing",
      metric_threshold: 1.2,
      supporting_data_points: scalable.length,
      statistical_strength_score: scalable.length / campaigns.length,
      confidence_score: conf,
      impact_level: impactFromConfidence(conf),
      strategic_interpretation: "These campaigns respond positively to budget increases with stable margins. Scaling recommended.",
    });
  }

  const diminishing = campaigns.filter(c => c.elasticityScore < 0.5);
  if (diminishing.length >= 2) {
    const avgElast = diminishing.reduce((s, c) => s + c.elasticityScore, 0) / diminishing.length;
    const conf = computeConfidence({
      sampleSize: diminishing.length,
      repetitionCount: diminishing.length,
      stabilityScore: 0.7,
      varianceLevel: 0.3,
      driftImpact: 0.15,
    });
    patterns.push({
      pattern_type: "elasticity",
      pattern_description: `Diminishing returns zone — avg elasticity ${avgElast.toFixed(2)}`,
      metric_threshold: 0.5,
      supporting_data_points: diminishing.length,
      statistical_strength_score: diminishing.length / campaigns.length,
      confidence_score: conf,
      impact_level: impactFromConfidence(conf),
      strategic_interpretation: "Budget increases yield negligible conversion gains. Reallocate spend or restructure targeting.",
    });
  }

  return patterns;
}

/* ─── Funnel Interaction Pattern ─── */
export function detectFunnelPatterns(campaigns: PatternCampaignSnapshot[]): Partial<LearnedPattern>[] {
  const positive = campaigns.filter(
    c => c.awarenessSpend > 0 &&
         c.conversionVolume > c.conversionsPrev &&
         (c.cpaTrend === "down" || c.cpaTrend === "stable")
  );
  if (positive.length < 2) return [];

  const conf = computeConfidence({
    sampleSize: positive.length,
    repetitionCount: positive.length,
    stabilityScore: positive.length >= 4 ? 0.85 : 0.65,
    varianceLevel: 0.2,
    driftImpact: 0.1,
  });

  return [{
    pattern_type: "funnel",
    pattern_description: "Positive funnel lift structure — awareness investment correlates with lower-funnel gains",
    metric_threshold: 0.6,
    supporting_data_points: positive.length,
    statistical_strength_score: positive.length / campaigns.length,
    confidence_score: conf,
    impact_level: impactFromConfidence(conf),
    strategic_interpretation: "Sustained awareness investment creates a measurable lift in conversion volume with stable or decreasing CPA.",
  }];
}

/* ─── Creative Sustainability Pattern ─── */
export function detectCreativePatterns(campaigns: PatternCampaignSnapshot[]): Partial<LearnedPattern>[] {
  const sustainable = campaigns.filter(
    c => c.ctr > 0.02 && // 2%+ CTR
         Math.abs(c.cpa - c.cpaPrev) / Math.max(c.cpaPrev, 1) < 0.1 && // CPA stable
         Math.abs(c.ctr - c.ctrPrev) / Math.max(c.ctrPrev, 0.001) < 0.15 // Low CTR volatility
  );
  if (sustainable.length < 2) return [];

  const conf = computeConfidence({
    sampleSize: sustainable.length,
    repetitionCount: sustainable.length,
    stabilityScore: 0.8,
    varianceLevel: 0.1,
    driftImpact: 0.05,
  });

  return [{
    pattern_type: "creative",
    pattern_description: "Sustainable creative profile — high CTR, stable CPA, low volatility",
    metric_threshold: 0.02,
    supporting_data_points: sustainable.length,
    statistical_strength_score: sustainable.length / campaigns.length,
    confidence_score: conf,
    impact_level: impactFromConfidence(conf),
    strategic_interpretation: "Creative assets maintain engagement and efficiency over time. Extend their lifecycle and replicate the format.",
  }];
}

/* ─── Margin Sensitivity Pattern ─── */
export function detectMarginPatterns(campaigns: PatternCampaignSnapshot[]): Partial<LearnedPattern>[] {
  const erosion = campaigns.filter(
    c => c.spend > c.spendPrev * 1.1 && // spend increased 10%+
         c.margin < c.marginPrev * 0.9   // margin dropped 10%+
  );
  if (erosion.length < 2) return [];

  const conf = computeConfidence({
    sampleSize: erosion.length,
    repetitionCount: erosion.length,
    stabilityScore: 0.75,
    varianceLevel: 0.25,
    driftImpact: 0.15,
  });

  return [{
    pattern_type: "margin",
    pattern_description: "Margin erosion under aggressive scaling — spend increase leads to disproportionate margin loss",
    metric_threshold: 1.1,
    supporting_data_points: erosion.length,
    statistical_strength_score: erosion.length / campaigns.length,
    confidence_score: conf,
    impact_level: impactFromConfidence(conf),
    strategic_interpretation: "Scaling spend aggressively erodes margin. Implement budget caps or optimize unit economics before scaling.",
  }];
}

/* ─── Master Detection Runner ─── */
export function runPatternDetection(campaigns: PatternCampaignSnapshot[], tenantId: string): LearnedPattern[] {
  const now = new Date().toISOString();
  const detectors = [
    detectFrequencyPatterns,
    detectElasticityPatterns,
    detectFunnelPatterns,
    detectCreativePatterns,
    detectMarginPatterns,
  ];

  const results: LearnedPattern[] = [];
  for (const detector of detectors) {
    const partials = detector(campaigns);
    for (const p of partials) {
      results.push({
        pattern_id: `pat_${results.length + 1}_${Date.now()}`,
        tenant_id: tenantId,
        pattern_scope: "tenant",
        active_flag: true,
        experimental_flag: (p.confidence_score ?? 0) < 60,
        first_detected_at: now,
        last_updated_at: now,
        ...p,
      } as LearnedPattern);
    }
  }

  return results;
}
