import { type MonthlyBudget } from "@/components/planning/BudgetDistribution";
import { type PlanningLine } from "@/components/planning/PlanningTable";
import { type PIData } from "@/components/pi/PIForm";

export type PlanStatus = 'pendente' | 'aprovado' | 'reprovado' | 'cancelado';

export interface EmittedPIRef {
  piNumber: string;
  monthRef: string;
  emittedAt: string;
}

export interface PlanData {
  id: string;
  status: PlanStatus;
  client: string;
  campaign: string;
  year: string;
  quarter: string;
  periodStart: string;
  periodEnd: string;
  totalBudget: number;
  companyLogo: string | null;
  monthlyBudgets: MonthlyBudget[];
  lines: PlanningLine[];
  observations: string;
  taxonomy: string;
  emittedPIs: EmittedPIRef[];
}

export interface MonthOption {
  monthRef: string;
  label: string;
  fullLabel: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  alreadyEmitted: boolean;
  emittedPINumber?: string;
}

export interface VehicleData {
  vehicleCompany: string;
  vehicleCNPJ: string;
  vehicleAddress: string;
  vehicleCity: string;
  vehicleCountry: string;
  vehicleStateRegistration: string;
  vehicleMunicipalRegistration: string;
  responsibleName: string;
}

export interface PIEmissionConfig {
  selectedMonths: string[];
  vehicle: VehicleData;
}

export function generatePIFromPlan(
  plan: PlanData,
  monthOption: MonthOption,
  vehicle: VehicleData,
  piNumber: string
): PIData {
  return {
    id: crypto.randomUUID(),
    piNumber,
    status: "aguard_fat",
    createdAt: new Date().toISOString(),
    clientLogo: null,
    clientCompany: plan.client,
    clientCNPJ: "",
    clientContact: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientCity: "",
    clientCountry: "Brasil",
    vehicleCompany: vehicle.vehicleCompany,
    vehicleCNPJ: vehicle.vehicleCNPJ,
    vehicleAddress: vehicle.vehicleAddress,
    vehicleCity: vehicle.vehicleCity,
    vehicleCountry: vehicle.vehicleCountry,
    vehicleStateRegistration: vehicle.vehicleStateRegistration,
    vehicleMunicipalRegistration: vehicle.vehicleMunicipalRegistration,
    campaignName: plan.campaign,
    campaignDescription: plan.observations,
    campaignTarget: "",
    campaignLocations: "",
    issueDate: new Date().toISOString().split("T")[0],
    broadcastPeriodStart: monthOption.periodStart,
    broadcastPeriodEnd: monthOption.periodEnd,
    totalMedia: monthOption.amount,
    negotiatedValue: monthOption.amount,
    agencyDiscount: 0,
    negotiatedDiscountPercent: 0,
    negotiatedDiscountValue: 0,
    invoicedValue: monthOption.amount,
    paymentCondition: "30DFM",
    dueDate: "",
    observations: `Ref. Planejamento: ${plan.taxonomy} | Mês: ${monthOption.fullLabel}`,
    responsibleName: vehicle.responsibleName,
    signatureDate: new Date().toISOString().split("T")[0],
    planningRef: plan.id,
    monthRef: monthOption.monthRef,
  };
}
