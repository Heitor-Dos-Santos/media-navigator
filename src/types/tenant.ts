// ── Agency & SaaS Plan Types ──

export interface Agency {
  agencyId: string;
  agencyName: string;
  subscriptionPlan: PlanName;
  activeStatus: boolean;
  createdAt: string;
  // White-label
  logo: string | null;
  brandColor: string;
  fontFamily: string;
  customDomain: string | null;
  reportBrandingEnabled: boolean;
}

/** @deprecated Use Agency instead */
export type Tenant = Agency;

export type PlanName = "starter" | "growth" | "pro" | "enterprise";

export interface SubscriptionPlan {
  name: PlanName;
  displayName: string;
  maxClients: number;
  maxUsers: number;
  maxIntegrations: number;
  forecastEnabled: boolean;
  recommendationEnabled: boolean;
  financialLayerEnabled: boolean;
  benchmarkEnabled: boolean;
  price: number; // monthly, BRL — 0 = custom
}

export const PLANS: Record<PlanName, SubscriptionPlan> = {
  starter: {
    name: "starter",
    displayName: "Starter",
    maxClients: 3,
    maxUsers: 5,
    maxIntegrations: 2,
    forecastEnabled: false,
    recommendationEnabled: false,
    financialLayerEnabled: false,
    benchmarkEnabled: false,
    price: 499,
  },
  growth: {
    name: "growth",
    displayName: "Growth",
    maxClients: 10,
    maxUsers: 15,
    maxIntegrations: 5,
    forecastEnabled: true,
    recommendationEnabled: false,
    financialLayerEnabled: false,
    benchmarkEnabled: true,
    price: 1499,
  },
  pro: {
    name: "pro",
    displayName: "Pro",
    maxClients: 30,
    maxUsers: 50,
    maxIntegrations: 15,
    forecastEnabled: true,
    recommendationEnabled: true,
    financialLayerEnabled: true,
    benchmarkEnabled: true,
    price: 3999,
  },
  enterprise: {
    name: "enterprise",
    displayName: "Enterprise",
    maxClients: Infinity,
    maxUsers: Infinity,
    maxIntegrations: Infinity,
    forecastEnabled: true,
    recommendationEnabled: true,
    financialLayerEnabled: true,
    benchmarkEnabled: true,
    price: 0, // custom
  },
};

// ── Usage Tracking ──

export type UsageMetricType =
  | "api_calls"
  | "data_storage_mb"
  | "forecast_runs"
  | "recommendation_runs";

export interface AgencyUsage {
  agencyId: string;
  metricType: UsageMetricType;
  value: number;
  period: string; // YYYY-MM
}

/** @deprecated Use AgencyUsage instead */
export type TenantUsage = AgencyUsage;

// ── Feature → Module mapping for plan gating ──

export const PLAN_FEATURE_MODULES: Record<string, keyof SubscriptionPlan> = {
  "efficiency": "forecastEnabled",
  "benchmark": "benchmarkEnabled",
  "optimization-center": "recommendationEnabled",
  "profitability": "financialLayerEnabled",
  "financial-overview": "financialLayerEnabled",
  "insertion-orders": "financialLayerEnabled",
  "clients": "financialLayerEnabled",
  "suppliers": "financialLayerEnabled",
};

/**
 * Check if a module is enabled for a given plan.
 * Modules not in PLAN_FEATURE_MODULES are always enabled.
 */
export function isModuleEnabledForPlan(moduleKey: string, plan: SubscriptionPlan): boolean {
  const featureKey = PLAN_FEATURE_MODULES[moduleKey];
  if (!featureKey) return true; // not gated
  return plan[featureKey] as boolean;
}
