import { AppLayout } from "@/components/layout/AppLayout";
import { QuickStatsBar } from "@/components/dashboard/QuickStatsBar";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary" />
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Visão geral das operações</p>
        </div>
        <QuickStatsBar stats={{ activeCampaigns: 0, totalBudget: 0, avgEfficiency: 0, alertCount: 0, healthyCount: 0 }} />
      </div>
    </AppLayout>
  );
}
