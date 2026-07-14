export type FeeType = "fixed" | "percentage" | "hybrid";

export interface ClientFinancials {
  client_id: string;
  fee_type: FeeType;
  fixed_fee_value: number;
  percentage_fee: number;
  bv_percentage: number;
  estimated_operational_cost: number;
  payment_status: "paid" | "pending" | "overdue";
  billing_cycle: "monthly" | "quarterly";
}

export interface ClientProfitability {
  clientId: string;
  clientName: string;
  mediaSpend: number;
  managementRevenue: number;
  bvRevenue: number;
  grossRevenue: number;
  operationalCost: number;
  grossMargin: number;
  marginPercent: number;
  avgMBEI: number;
  alertsCount: number;
  financialRisk: boolean;
}

export const MARGIN_THRESHOLD = 20; // percent
