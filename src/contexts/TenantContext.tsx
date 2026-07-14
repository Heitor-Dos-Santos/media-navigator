import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import {
  type Agency,
  type PlanName,
  type SubscriptionPlan,
  type AgencyUsage,
  PLANS,
  isModuleEnabledForPlan,
} from "@/types/tenant";
import { CURRENT_AGENCY, AGENCY_USAGE, CURRENT_COUNTS } from "@/data/tenantData";

interface AgencyContextType {
  agency: Agency;
  /** @deprecated Use agency instead */
  tenant: Agency;
  plan: SubscriptionPlan;
  usage: AgencyUsage[];
  counts: { activeClients: number; activeUsers: number; activeIntegrations: number };
  // Plan checks
  isFeatureEnabled: (moduleKey: string) => boolean;
  canAddClient: () => boolean;
  canAddUser: () => boolean;
  canAddIntegration: () => boolean;
  // Agency settings
  updateAgency: (updates: Partial<Agency>) => void;
  /** @deprecated Use updateAgency instead */
  updateTenant: (updates: Partial<Agency>) => void;
}

const AgencyContext = createContext<AgencyContextType | null>(null);

export const useAgency = () => {
  const ctx = useContext(AgencyContext);
  if (!ctx) throw new Error("useAgency must be used within AgencyProvider");
  return ctx;
};

/** @deprecated Use useAgency instead */
export const useTenant = useAgency;

export function AgencyProvider({ children }: { children: ReactNode }) {
  const [agency, setAgency] = useState<Agency>(() => {
    const stored = localStorage.getItem("mediahub_agency") || localStorage.getItem("mediahub_tenant");
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fallback */ }
    }
    return CURRENT_AGENCY;
  });

  const plan = PLANS[agency.subscriptionPlan];
  const usage = AGENCY_USAGE;
  const counts = CURRENT_COUNTS;

  const isFeatureEnabled = useCallback(
    (moduleKey: string) => isModuleEnabledForPlan(moduleKey, plan),
    [plan]
  );

  const canAddClient = useCallback(() => counts.activeClients < plan.maxClients, [counts.activeClients, plan.maxClients]);
  const canAddUser = useCallback(() => counts.activeUsers < plan.maxUsers, [counts.activeUsers, plan.maxUsers]);
  const canAddIntegration = useCallback(() => counts.activeIntegrations < plan.maxIntegrations, [counts.activeIntegrations, plan.maxIntegrations]);

  const updateAgency = useCallback((updates: Partial<Agency>) => {
    setAgency(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem("mediahub_agency", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo<AgencyContextType>(() => ({
    agency, tenant: agency, plan, usage, counts,
    isFeatureEnabled, canAddClient, canAddUser, canAddIntegration,
    updateAgency, updateTenant: updateAgency,
  }), [agency, plan, usage, counts, isFeatureEnabled, canAddClient, canAddUser, canAddIntegration, updateAgency]);

  return <AgencyContext.Provider value={value}>{children}</AgencyContext.Provider>;
}

/** @deprecated Use AgencyProvider instead */
export const TenantProvider = AgencyProvider;
