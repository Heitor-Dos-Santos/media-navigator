export interface RebateTier {
  label: string;
  minValue: number;
  maxValue: number | null;
  percentage: number;
}

export const DEFAULT_REBATE_TIERS: RebateTier[] = [
  { label: "Tier 1", minValue: 0, maxValue: 100000, percentage: 0 },
  { label: "Tier 2", minValue: 100001, maxValue: 500000, percentage: 0 },
  { label: "Tier 3", minValue: 500001, maxValue: 1000000, percentage: 0 },
  { label: "Tier 4", minValue: 1000001, maxValue: 5000000, percentage: 0 },
  { label: "Tier 5", minValue: 5000001, maxValue: 10000000, percentage: 0 },
  { label: "Tier 6", minValue: 10000001, maxValue: null, percentage: 0 },
];

export function getClientRebateTier(totalInvoiced: number, tiers: RebateTier[]): { tier: RebateTier; commission: number } | null {
  const sorted = [...tiers].sort((a, b) => a.minValue - b.minValue);
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (totalInvoiced >= sorted[i].minValue) {
      return { tier: sorted[i], commission: totalInvoiced * (sorted[i].percentage / 100) };
    }
  }
  return sorted.length > 0 ? { tier: sorted[0], commission: totalInvoiced * (sorted[0].percentage / 100) } : null;
}

export interface Client {
  id: string;
  companyName: string;
  tradeName?: string;
  cnpj: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes?: string;
  rebateTiers?: RebateTier[];
  createdAt: string;
  updatedAt: string;
}

export interface AgencySettings {
  id: string;
  companyName: string;
  tradeName?: string;
  cnpj: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  address: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  logo: string | null;
  responsibleName: string;
  rebateTiers?: RebateTier[];
  updatedAt: string;
}

export const createEmptyClient = (): Client => ({
  id: crypto.randomUUID(),
  companyName: "",
  tradeName: "",
  cnpj: "",
  stateRegistration: "",
  municipalRegistration: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brasil",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
  rebateTiers: undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const createDefaultAgencySettings = (): AgencySettings => ({
  id: "agency-settings",
  companyName: "",
  tradeName: "",
  cnpj: "",
  stateRegistration: "",
  municipalRegistration: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "Brasil",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  logo: null,
  responsibleName: "",
  updatedAt: new Date().toISOString(),
});
