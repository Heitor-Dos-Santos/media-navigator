import type { CampaignTrendData } from "./efficiency";

export type AlertSeverity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "active" | "resolved";
export type AlertType = "efficiency" | "cpa" | "pacing" | "conversion";

export interface AlertLog {
  id: string;
  campaign_id: string;
  campaignName: string;
  platform: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  trigger_value: number;
  trigger_reason: string;
  suggested_action: string;
  status: AlertStatus;
  created_at: string;
  resolved_at: string | null;
}

export function getSeverityMeta(severity: AlertSeverity) {
  const map: Record<AlertSeverity, { label: string; color: string; bg: string; border: string }> = {
    low: { label: "Low", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    medium: { label: "Medium", color: "text-status-warning", bg: "bg-status-warning/10", border: "border-status-warning/20" },
    high: { label: "High", color: "text-[hsl(25,90%,50%)]", bg: "bg-[hsl(25,90%,50%)]/10", border: "border-[hsl(25,90%,50%)]/20" },
    critical: { label: "Critical", color: "text-status-error", bg: "bg-status-error/10", border: "border-status-error/20" },
  };
  return map[severity];
}

export function getAlertTypeLabel(type: AlertType): string {
  const map: Record<AlertType, string> = {
    efficiency: "MBEI Drop",
    cpa: "CPA Overrun",
    pacing: "Spend Pacing",
    conversion: "Conversion Drop",
  };
  return map[type];
}

/** Generate alerts from campaign trend data */
export function generateAlerts(campaigns: CampaignTrendData[]): AlertLog[] {
  const alerts: AlertLog[] = [];
  let idCounter = 1;

  for (const c of campaigns) {
    const mbeiDelta = c.avgMBEI7d > 0 ? ((c.currentMBEI - c.avgMBEI7d) / c.avgMBEI7d) * 100 : 0;

    // MBEI drop alerts
    if (mbeiDelta <= -20) {
      alerts.push(makeAlert(idCounter++, c, "efficiency", "critical", mbeiDelta, `MBEI dropped ${Math.abs(mbeiDelta).toFixed(0)}% in 7 days`, "Pausar segmentações de baixo desempenho e realocar budget"));
    } else if (mbeiDelta <= -10) {
      alerts.push(makeAlert(idCounter++, c, "efficiency", "medium", mbeiDelta, `MBEI dropped ${Math.abs(mbeiDelta).toFixed(0)}% in 7 days`, "Revisar segmentação e criativos com baixa performance"));
    }

    // Spend velocity alerts
    if (c.spendVelocity > 1.2) {
      alerts.push(makeAlert(idCounter++, c, "pacing", "high", c.spendVelocity, `Spend velocity at ${c.spendVelocity.toFixed(2)}x (overpacing)`, "Reduzir lances ou pausar horários de pico"));
    } else if (c.spendVelocity < 0.8) {
      alerts.push(makeAlert(idCounter++, c, "pacing", "medium", c.spendVelocity, `Spend velocity at ${c.spendVelocity.toFixed(2)}x (underpacing)`, "Aumentar lances ou expandir segmentação"));
    }

    // CPA alerts (using rollingCPA as proxy for real CPA, plannedCPA ~30)
    const plannedCPA = 30;
    const cpaExcess = ((c.rollingCPA - plannedCPA) / plannedCPA) * 100;
    if (cpaExcess >= 25) {
      alerts.push(makeAlert(idCounter++, c, "cpa", "critical", cpaExcess, `CPA ${cpaExcess.toFixed(0)}% above planned`, "Pausar keywords/públicos com CPA > 2x meta"));
    } else if (cpaExcess >= 15) {
      alerts.push(makeAlert(idCounter++, c, "cpa", "high", cpaExcess, `CPA ${cpaExcess.toFixed(0)}% above planned`, "Otimizar lances e negativar termos de baixa conversão"));
    }

    // Conversion drop (use sparkline last vs avg)
    if (c.sparklineData.length >= 7) {
      const avg = c.sparklineData.slice(0, 6).reduce((s, v) => s + v, 0) / 6;
      const latest = c.sparklineData[6];
      const convDrop = avg > 0 ? ((latest - avg) / avg) * 100 : 0;
      if (convDrop <= -20) {
        alerts.push(makeAlert(idCounter++, c, "conversion", "high", convDrop, `Conversions dropped ${Math.abs(convDrop).toFixed(0)}% vs 7-day avg`, "Verificar landing page, tags de conversão e status do pixel"));
      }
    }
  }

  return alerts.sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity));
}

function severityOrder(s: AlertSeverity): number {
  return { low: 0, medium: 1, high: 2, critical: 3 }[s];
}

function makeAlert(id: number, c: CampaignTrendData, type: AlertType, severity: AlertSeverity, triggerValue: number, reason: string, action: string): AlertLog {
  return {
    id: `alert-${id}`,
    campaign_id: c.campaignId,
    campaignName: c.campaignName,
    platform: c.platform,
    alert_type: type,
    severity,
    trigger_value: triggerValue,
    trigger_reason: reason,
    suggested_action: action,
    status: "active",
    created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(),
    resolved_at: null,
  };
}
