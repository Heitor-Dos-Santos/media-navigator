import type { ClientTargets, ClientOwnership, AlertOwnership, RecommendationOwnership } from "@/types/operational";

export const CLIENT_TARGETS: ClientTargets[] = [
  { clientId: "acme", targetMBEI: 110, targetMargin: 25, targetCPA: 30, targetAlertReduction: 20, targetSavings: 50000 },
  { clientId: "globex", targetMBEI: 115, targetMargin: 30, targetCPA: 25, targetAlertReduction: 15, targetSavings: 60000 },
  { clientId: "initech", targetMBEI: 100, targetMargin: 20, targetCPA: 50, targetAlertReduction: 25, targetSavings: 30000 },
  { clientId: "umbrella", targetMBEI: 105, targetMargin: 22, targetCPA: 35, targetAlertReduction: 30, targetSavings: 40000 },
];

export const CLIENT_OWNERSHIP: ClientOwnership[] = [
  { clientId: "acme", primaryOwnerUserId: "u1", primaryOwnerName: "Ana Silva", secondaryOwnerUserId: "u2", secondaryOwnerName: "Bruno Costa" },
  { clientId: "globex", primaryOwnerUserId: "u3", primaryOwnerName: "Carlos Mendes" },
  { clientId: "initech", primaryOwnerUserId: "u2", primaryOwnerName: "Bruno Costa", secondaryOwnerUserId: "u4", secondaryOwnerName: "Diana Lopes" },
  { clientId: "umbrella", primaryOwnerUserId: "u1", primaryOwnerName: "Ana Silva", secondaryOwnerUserId: "u3", secondaryOwnerName: "Carlos Mendes" },
];

export const ALERT_OWNERSHIP: AlertOwnership[] = [
  { alertId: "alert-1", responsibleUserId: "u1", responsibleName: "Ana Silva", dueDate: "2026-02-15" },
  { alertId: "alert-3", responsibleUserId: "u2", responsibleName: "Bruno Costa", dueDate: "2026-02-16" },
];

export const RECOMMENDATION_OWNERSHIP: RecommendationOwnership[] = [
  { recommendationId: "rec-1", responsibleUserId: "u1", responsibleName: "Ana Silva", status: "in_progress" },
  { recommendationId: "rec-2", responsibleUserId: "u3", responsibleName: "Carlos Mendes", status: "pending" },
];

export const MOCK_USERS = [
  { id: "u1", name: "Ana Silva" },
  { id: "u2", name: "Bruno Costa" },
  { id: "u3", name: "Carlos Mendes" },
  { id: "u4", name: "Diana Lopes" },
];
