import { createContext, useContext, useState, ReactNode } from "react";
import { AppRole, AccessLevel, mergePermissions, canAccessModule, getModuleAccess } from "@/types/rbac";
import { useTenant } from "@/contexts/TenantContext";

interface RBACContextType {
  roles: AppRole[];
  setRoles: (roles: AppRole[]) => void;
  permissions: Record<string, AccessLevel>;
  canAccess: (moduleKey: string) => boolean;
  getAccess: (moduleKey: string) => AccessLevel;
  hasRole: (role: AppRole) => boolean;
}

const RBACContext = createContext<RBACContextType>({
  roles: ["super_admin"],
  setRoles: () => {},
  permissions: {},
  canAccess: () => true,
  getAccess: () => "full",
  hasRole: () => true,
});

export const useRBAC = () => useContext(RBACContext);

export function RBACProvider({ children }: { children: ReactNode }) {
  const { isFeatureEnabled } = useTenant();

  // Default to super_admin for full access
  const [roles, setRoles] = useState<AppRole[]>(() => {
    const stored = localStorage.getItem("mediahub_roles");
    if (stored) {
      try { return JSON.parse(stored) as AppRole[]; } catch { return ["super_admin"]; }
    }
    return ["super_admin"];
  });

  const handleSetRoles = (newRoles: AppRole[]) => {
    setRoles(newRoles);
    localStorage.setItem("mediahub_roles", JSON.stringify(newRoles));
  };

  const permissions = mergePermissions(roles);

  const value: RBACContextType = {
    roles,
    setRoles: handleSetRoles,
    permissions,
    canAccess: (moduleKey: string) => {
      // RBAC check first
      if (!canAccessModule(roles, moduleKey)) return false;
      // Plan feature gating second
      if (!isFeatureEnabled(moduleKey)) return false;
      return true;
    },
    getAccess: (moduleKey: string) => {
      if (!isFeatureEnabled(moduleKey)) return "none";
      return getModuleAccess(roles, moduleKey);
    },
    hasRole: (role: AppRole) => roles.includes(role),
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
}
