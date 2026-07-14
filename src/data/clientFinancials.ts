import type { ClientFinancials } from "@/types/financials";

export const CLIENT_FINANCIALS: ClientFinancials[] = [
  {
    client_id: "acme",
    fee_type: "percentage",
    fixed_fee_value: 0,
    percentage_fee: 15,
    bv_percentage: 5,
    estimated_operational_cost: 18000,
    payment_status: "paid",
    billing_cycle: "monthly",
  },
  {
    client_id: "globex",
    fee_type: "hybrid",
    fixed_fee_value: 8000,
    percentage_fee: 10,
    bv_percentage: 3,
    estimated_operational_cost: 22000,
    payment_status: "paid",
    billing_cycle: "monthly",
  },
  {
    client_id: "initech",
    fee_type: "fixed",
    fixed_fee_value: 12000,
    percentage_fee: 0,
    bv_percentage: 0,
    estimated_operational_cost: 14000,
    payment_status: "pending",
    billing_cycle: "monthly",
  },
  {
    client_id: "umbrella",
    fee_type: "percentage",
    fixed_fee_value: 0,
    percentage_fee: 12,
    bv_percentage: 4,
    estimated_operational_cost: 20000,
    payment_status: "overdue",
    billing_cycle: "quarterly",
  },
];
