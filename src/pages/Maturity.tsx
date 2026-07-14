import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ALL_CAMPAIGNS } from "@/data/multiClientData";
import { materializeFeatureStore } from "@/lib/featureStoreHub";
import { ClientSelector } from "@/components/maturity/ClientSelector";
import { AgencyConsolidatedView } from "@/components/maturity/AgencyConsolidatedView";
import { ClientDeepFocusView } from "@/components/maturity/ClientDeepFocusView";

export default function Maturity() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const store = useMemo(() => materializeFeatureStore(ALL_CAMPAIGNS.filter(c => c.status === "active")), []);
  const summary = store.agencyIMCSummary;

  const selectedIMC = useMemo(
    () => selectedClientId ? summary.clientScores.find(c => c.clientId === selectedClientId) ?? null : null,
    [selectedClientId, summary.clientScores]
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-[1400px]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {selectedIMC && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedClientId(null)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <h1 className="text-2xl font-bold text-foreground">Maturidade do Cliente</h1>
              <PageInfoTooltip description="Diagnóstico de maturidade estrutural por cliente. O IMC mede disciplina e organização, não performance direta." />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedIMC
                ? `Visão detalhada — ${selectedIMC.clientName}`
                : "Panorama de maturidade da agência e ranking interno por cliente"}
            </p>
          </div>
          <ClientSelector
            clients={summary.clientScores}
            selectedClientId={selectedClientId}
            onSelect={setSelectedClientId}
          />
        </div>

        {/* Conditional view */}
        {selectedIMC ? (
          <ClientDeepFocusView imc={selectedIMC} />
        ) : (
          <AgencyConsolidatedView summary={summary} onSelectClient={setSelectedClientId} />
        )}
      </div>
    </AppLayout>
  );
}
