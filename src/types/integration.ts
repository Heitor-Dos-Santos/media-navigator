// ── Integration & API Architecture Types ──

export type PlatformName = "meta_ads" | "google_ads" | "dv360" | "linkedin_ads" | "tiktok_ads";

export type ConnectionStatus = "connected" | "disconnected";
export type SyncHealth = "healthy" | "warning" | "error";
export type SyncType = "manual" | "auto";
export type SyncStatus = "success" | "failed";
export type ApiKeyStatus = "active" | "revoked";
export type AutomationRuleStatus = "active" | "paused";

// ── Platform Connection ──

export interface PlatformConnection {
  tenantId: string;
  platform: PlatformName;
  displayName: string;
  connectionStatus: ConnectionStatus;
  lastSyncAt: string | null;
  syncHealth: SyncHealth;
  accountId: string | null;
}

// ── API Key Management ──

export interface ApiKey {
  id: string;
  tenantId: string;
  keyName: string;
  apiKeyHash: string; // masked key
  createdAt: string;
  lastUsedAt: string | null;
  status: ApiKeyStatus;
}

// ── Integration Sync Logs ──

export interface IntegrationLog {
  id: string;
  tenantId: string;
  platform: PlatformName;
  syncType: SyncType;
  recordsProcessed: number;
  status: SyncStatus;
  createdAt: string;
  errorMessage?: string;
}

// ── Automation Rules ──

export interface AutomationRule {
  id: string;
  tenantId: string;
  ruleName: string;
  triggerCondition: string;
  actionType: string;
  severity: "low" | "medium" | "high";
  status: AutomationRuleStatus;
}

// ── Internal API Endpoint Abstraction ──

export interface ApiEndpoint {
  path: string;
  method: "GET";
  description: string;
  requiresAuth: boolean;
  tenantScoped: boolean;
  rbacModules: string[]; // which RBAC module keys grant access
  planGated: boolean;
}

export const INTERNAL_API_ENDPOINTS: ApiEndpoint[] = [
  {
    path: "/api/efficiency-summary",
    method: "GET",
    description: "Returns efficiency metrics aggregated by client/campaign",
    requiresAuth: true,
    tenantScoped: true,
    rbacModules: ["efficiency"],
    planGated: false,
  },
  {
    path: "/api/client-performance",
    method: "GET",
    description: "Returns per-client performance KPIs",
    requiresAuth: true,
    tenantScoped: true,
    rbacModules: ["clients", "efficiency"],
    planGated: false,
  },
  {
    path: "/api/alerts",
    method: "GET",
    description: "Returns active alerts for tenant campaigns",
    requiresAuth: true,
    tenantScoped: true,
    rbacModules: ["alerts"],
    planGated: false,
  },
  {
    path: "/api/financial-overview",
    method: "GET",
    description: "Returns financial summary including margin and profitability",
    requiresAuth: true,
    tenantScoped: true,
    rbacModules: ["financial-overview", "profitability"],
    planGated: true,
  },
  {
    path: "/api/recommendations",
    method: "GET",
    description: "Returns optimization recommendations for tenant campaigns",
    requiresAuth: true,
    tenantScoped: true,
    rbacModules: ["optimization-center"],
    planGated: true,
  },
  {
    path: "/api/forecast",
    method: "GET",
    description: "Returns forecast projections for campaigns",
    requiresAuth: true,
    tenantScoped: true,
    rbacModules: ["efficiency", "simulation"],
    planGated: true,
  },
];

// ── Platform Display Metadata ──

export const PLATFORM_META: Record<PlatformName, { displayName: string; color: string; icon: string }> = {
  meta_ads: { displayName: "Meta Ads", color: "text-blue-500", icon: "facebook" },
  google_ads: { displayName: "Google Ads", color: "text-green-500", icon: "google" },
  dv360: { displayName: "DV360", color: "text-yellow-500", icon: "monitor" },
  linkedin_ads: { displayName: "LinkedIn Ads", color: "text-sky-600", icon: "linkedin" },
  tiktok_ads: { displayName: "TikTok Ads", color: "text-pink-500", icon: "music" },
};
