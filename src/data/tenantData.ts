import type { Agency, AgencyUsage } from "@/types/tenant";

export const CURRENT_AGENCY: Agency = {
  agencyId: "agency-001",
  agencyName: "MediaHub Agency",
  subscriptionPlan: "enterprise",
  activeStatus: true,
  createdAt: "2024-01-15T00:00:00Z",
  logo: null,
  brandColor: "hsl(262, 83%, 58%)",
  fontFamily: "Sora",
  customDomain: null,
  reportBrandingEnabled: true,
};

/** @deprecated Use CURRENT_AGENCY */
export const CURRENT_TENANT = CURRENT_AGENCY;

export const AGENCY_USAGE: AgencyUsage[] = [
  { agencyId: "agency-001", metricType: "api_calls", value: 12450, period: "2026-02" },
  { agencyId: "agency-001", metricType: "data_storage_mb", value: 248, period: "2026-02" },
  { agencyId: "agency-001", metricType: "forecast_runs", value: 87, period: "2026-02" },
  { agencyId: "agency-001", metricType: "recommendation_runs", value: 34, period: "2026-02" },
];

/** @deprecated Use AGENCY_USAGE */
export const TENANT_USAGE = AGENCY_USAGE;

export const CURRENT_COUNTS = {
  activeClients: 4,
  activeUsers: 8,
  activeIntegrations: 3,
};
