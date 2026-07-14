import type { CampaignWithClient } from "@/data/multiClientData";
import type { ClientProfitability } from "@/types/financials";
import { MARGIN_THRESHOLD } from "@/types/financials";

// ── Forecast Status Types ──

export type ForecastStatus = "on_track" | "slight_risk" | "high_risk" | "likely_exceed";
export type DeliveryForecast = "likely_exceed" | "on_track" | "at_risk" | "high_risk_missing";

export interface CampaignForecast {
  campaignId: string;
  // CPA
  currentCPA: number;
  projectedCPA: number;
  plannedCPA: number;
  cpaVariance: number; // %
  cpaStatus: ForecastStatus;
  // MBEI
  currentMBEI: number;
  forecastedMBEI: number;
  mbeiDirection: "up" | "down" | "stable";
  // Conversions
  projectedConversions: number;
  plannedConversions: number;
  goalProbability: number; // 0-100
  deliveryForecast: DeliveryForecast;
  // Overall
  overallStatus: ForecastStatus;
}

export interface ClientFinancialForecast {
  clientId: string;
  clientName: string;
  projectedRevenue: number;
  projectedMarginPercent: number;
  projectedRisk: boolean;
}

// ── Constants ──

const CAMPAIGN_DURATION_DAYS = 30;
const ELAPSED_DAYS = 21; // 70% through period
const REMAINING_DAYS = CAMPAIGN_DURATION_DAYS - ELAPSED_DAYS;

// ── CPA Forecast ──

export function forecastCPA(campaign: CampaignWithClient): { projectedCPA: number; plannedCPA: number; variance: number; status: ForecastStatus } {
  const momentumFactor = getMomentumMultiplier(campaign.momentumDelta);
  const projectedCPA = campaign.rollingCPA * momentumFactor;
  const plannedCPA = campaign.rollingCPA * 1.1; // planned baseline
  const variance = ((projectedCPA - plannedCPA) / plannedCPA) * 100;

  let status: ForecastStatus;
  if (variance <= -5) status = "likely_exceed";
  else if (variance <= 10) status = "on_track";
  else if (variance <= 20) status = "slight_risk";
  else status = "high_risk";

  return { projectedCPA: Math.round(projectedCPA * 100) / 100, plannedCPA: Math.round(plannedCPA * 100) / 100, variance: Math.round(variance * 10) / 10, status };
}

// ── MBEI Forecast ──

export function forecastMBEI(campaign: CampaignWithClient): { forecasted: number; direction: "up" | "down" | "stable" } {
  const momentumFactor = 1 + (campaign.momentumDelta / 100);
  const forecasted = Math.round(campaign.avgMBEI7d * momentumFactor);
  const clamped = Math.max(0, Math.min(150, forecasted));

  let direction: "up" | "down" | "stable";
  if (clamped > campaign.currentMBEI + 2) direction = "up";
  else if (clamped < campaign.currentMBEI - 2) direction = "down";
  else direction = "stable";

  return { forecasted: clamped, direction };
}

// ── Conversion Delivery Forecast ──

export function forecastConversions(campaign: CampaignWithClient): { projected: number; planned: number; probability: number; status: DeliveryForecast } {
  const dailyConversions = campaign.rollingConversionRate * 50000 / 7; // daily avg from 7d rolling
  const currentConversions = dailyConversions * ELAPSED_DAYS;
  const projected = Math.round(currentConversions + dailyConversions * REMAINING_DAYS);
  const planned = Math.round(campaign.rollingConversionRate * 50000 * (CAMPAIGN_DURATION_DAYS / 7));
  const probability = planned > 0 ? Math.min(100, Math.round((projected / planned) * 100)) : 100;

  let status: DeliveryForecast;
  if (probability >= 110) status = "likely_exceed";
  else if (probability >= 95) status = "on_track";
  else if (probability >= 80) status = "at_risk";
  else status = "high_risk_missing";

  return { projected, planned, probability, status };
}

// ── Full Campaign Forecast ──

export function computeCampaignForecast(campaign: CampaignWithClient): CampaignForecast {
  const cpa = forecastCPA(campaign);
  const mbei = forecastMBEI(campaign);
  const conv = forecastConversions(campaign);

  // Overall status: worst of all forecasts
  const statuses: ForecastStatus[] = [cpa.status];
  if (mbei.forecasted < 85) statuses.push("high_risk");
  else if (mbei.forecasted < 95) statuses.push("slight_risk");
  else statuses.push("on_track");
  if (conv.status === "high_risk_missing") statuses.push("high_risk");
  else if (conv.status === "at_risk") statuses.push("slight_risk");
  else statuses.push("on_track");

  const statusOrder: Record<ForecastStatus, number> = { likely_exceed: 0, on_track: 1, slight_risk: 2, high_risk: 3 };
  const overallStatus = statuses.reduce((worst, s) => statusOrder[s] > statusOrder[worst] ? s : worst);

  return {
    campaignId: campaign.campaignId,
    currentCPA: campaign.rollingCPA,
    projectedCPA: cpa.projectedCPA,
    plannedCPA: cpa.plannedCPA,
    cpaVariance: cpa.variance,
    cpaStatus: cpa.status,
    currentMBEI: campaign.currentMBEI,
    forecastedMBEI: mbei.forecasted,
    mbeiDirection: mbei.direction,
    projectedConversions: conv.projected,
    plannedConversions: conv.planned,
    goalProbability: conv.probability,
    deliveryForecast: conv.status,
    overallStatus,
  };
}

// ── Client Financial Forecast ──

export function computeClientFinancialForecast(
  clientId: string,
  clientName: string,
  campaigns: CampaignWithClient[],
  currentProfitability: ClientProfitability
): ClientFinancialForecast {
  // Project revenue based on campaign momentum
  const avgMomentumDelta = campaigns.length > 0
    ? campaigns.reduce((s, c) => s + c.momentumDelta, 0) / campaigns.length
    : 0;
  const revenueFactor = 1 + (avgMomentumDelta / 200); // dampened
  const projectedRevenue = currentProfitability.grossRevenue * revenueFactor;
  const projectedMargin = projectedRevenue - currentProfitability.operationalCost;
  const projectedMarginPercent = projectedRevenue > 0 ? (projectedMargin / projectedRevenue) * 100 : 0;

  return {
    clientId,
    clientName,
    projectedRevenue,
    projectedMarginPercent: Math.round(projectedMarginPercent * 10) / 10,
    projectedRisk: projectedMarginPercent < MARGIN_THRESHOLD,
  };
}

// ── Helpers ──

function getMomentumMultiplier(momentumDelta: number): number {
  // Positive momentum = CPA improving (lower), negative = worsening (higher)
  // Invert: positive delta means efficiency improving → CPA should decrease
  return 1 - (momentumDelta / 200); // dampened effect
}

// ── Status Meta ──

export const forecastStatusMeta: Record<ForecastStatus, { label: string; color: string; bg: string; border: string }> = {
  likely_exceed: { label: "Excederá", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" },
  on_track: { label: "No Caminho", color: "text-status-success", bg: "bg-status-success/10", border: "border-status-success/30" },
  slight_risk: { label: "Risco Leve", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/30" },
  high_risk: { label: "Alto Risco", color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/30" },
};

export const deliveryForecastMeta: Record<DeliveryForecast, { label: string; color: string }> = {
  likely_exceed: { label: "Vai Exceder", color: "text-status-success" },
  on_track: { label: "No Caminho", color: "text-status-success" },
  at_risk: { label: "Em Risco", color: "text-status-warning" },
  high_risk_missing: { label: "Alto Risco", color: "text-status-error" },
};
