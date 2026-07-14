import type {
  PlatformConnection,
  ApiKey,
  IntegrationLog,
  AutomationRule,
} from "@/types/integration";

export const PLATFORM_CONNECTIONS: PlatformConnection[] = [
  {
    tenantId: "tenant-001",
    platform: "meta_ads",
    displayName: "Meta Ads",
    connectionStatus: "connected",
    lastSyncAt: "2026-02-14T08:32:00Z",
    syncHealth: "healthy",
    accountId: "act_123456789",
  },
  {
    tenantId: "tenant-001",
    platform: "google_ads",
    displayName: "Google Ads",
    connectionStatus: "connected",
    lastSyncAt: "2026-02-14T07:15:00Z",
    syncHealth: "warning",
    accountId: "123-456-7890",
  },
  {
    tenantId: "tenant-001",
    platform: "dv360",
    displayName: "DV360",
    connectionStatus: "disconnected",
    lastSyncAt: null,
    syncHealth: "error",
    accountId: null,
  },
  {
    tenantId: "tenant-001",
    platform: "linkedin_ads",
    displayName: "LinkedIn Ads",
    connectionStatus: "connected",
    lastSyncAt: "2026-02-13T22:00:00Z",
    syncHealth: "healthy",
    accountId: "li_acc_456",
  },
  {
    tenantId: "tenant-001",
    platform: "tiktok_ads",
    displayName: "TikTok Ads",
    connectionStatus: "disconnected",
    lastSyncAt: null,
    syncHealth: "error",
    accountId: null,
  },
];

export const API_KEYS: ApiKey[] = [
  {
    id: "key-001",
    tenantId: "tenant-001",
    keyName: "Production API",
    apiKeyHash: "mhub_••••••••••••a3f7",
    createdAt: "2026-01-10T10:00:00Z",
    lastUsedAt: "2026-02-14T09:12:00Z",
    status: "active",
  },
  {
    id: "key-002",
    tenantId: "tenant-001",
    keyName: "Staging API",
    apiKeyHash: "mhub_••••••••••••b2c1",
    createdAt: "2026-01-15T14:00:00Z",
    lastUsedAt: "2026-02-10T16:45:00Z",
    status: "active",
  },
  {
    id: "key-003",
    tenantId: "tenant-001",
    keyName: "Legacy Key",
    apiKeyHash: "mhub_••••••••••••d4e5",
    createdAt: "2025-11-01T08:00:00Z",
    lastUsedAt: "2025-12-20T11:00:00Z",
    status: "revoked",
  },
];

export const INTEGRATION_LOGS: IntegrationLog[] = [
  { id: "log-001", tenantId: "tenant-001", platform: "meta_ads", syncType: "auto", recordsProcessed: 1247, status: "success", createdAt: "2026-02-14T08:32:00Z" },
  { id: "log-002", tenantId: "tenant-001", platform: "google_ads", syncType: "auto", recordsProcessed: 832, status: "success", createdAt: "2026-02-14T07:15:00Z" },
  { id: "log-003", tenantId: "tenant-001", platform: "google_ads", syncType: "manual", recordsProcessed: 0, status: "failed", createdAt: "2026-02-13T18:00:00Z", errorMessage: "API rate limit exceeded" },
  { id: "log-004", tenantId: "tenant-001", platform: "linkedin_ads", syncType: "auto", recordsProcessed: 456, status: "success", createdAt: "2026-02-13T22:00:00Z" },
  { id: "log-005", tenantId: "tenant-001", platform: "meta_ads", syncType: "auto", recordsProcessed: 1189, status: "success", createdAt: "2026-02-13T08:30:00Z" },
  { id: "log-006", tenantId: "tenant-001", platform: "meta_ads", syncType: "manual", recordsProcessed: 1300, status: "success", createdAt: "2026-02-12T14:00:00Z" },
];

export const AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "rule-001",
    tenantId: "tenant-001",
    ruleName: "Pause Low MBEI",
    triggerCondition: "MBEI < 60 for 3 consecutive days",
    actionType: "pause_campaign",
    severity: "high",
    status: "active",
  },
  {
    id: "rule-002",
    tenantId: "tenant-001",
    ruleName: "Scale High Performers",
    triggerCondition: "MBEI > 140 AND momentum positive",
    actionType: "increase_budget",
    severity: "medium",
    status: "active",
  },
  {
    id: "rule-003",
    tenantId: "tenant-001",
    ruleName: "Creative Fatigue Alert",
    triggerCondition: "CTR drop > 30% in 7 days",
    actionType: "notify_team",
    severity: "medium",
    status: "paused",
  },
];

// Helper to generate a fake API key
export function generateFakeApiKey(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "mhub_";
  for (let i = 0; i < 32; i++) key += chars[Math.floor(Math.random() * chars.length)];
  return key;
}

export function maskApiKey(key: string): string {
  return key.slice(0, 5) + "••••••••••••" + key.slice(-4);
}
