import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, Play, RotateCcw, ArrowRight, CheckCircle2 } from "lucide-react";
import { AuditPlatformSelector } from "@/components/audit/AuditPlatformSelector";
import { AuditPillarCard } from "@/components/audit/AuditPillarCard";
import { AuditQuestionForm } from "@/components/audit/AuditQuestionForm";
import { AuditResultsDashboard } from "@/components/audit/AuditResultsDashboard";
import { AUDIT_PILLARS, AUDIT_PLATFORMS, calculatePillarScore, calculateOverallScore, type AuditPlatform, type AuditPillarId, type PillarScore, type AuditAnswer } from "@/data/auditTypes";
import { PageInfoTooltip } from "@/components/ui/page-info-tooltip";

type AuditStep = "platform" | "info" | "audit" | "results";

export default function Audit() {
  const [currentStep, setCurrentStep] = useState<AuditStep>("platform");
  const [selectedPlatform, setSelectedPlatform] = useState<AuditPlatform | null>(null);
  const [accountName, setAccountName] = useState("");
  const [activePillar, setActivePillar] = useState<AuditPillarId | null>(null);
  const [pillarScores, setPillarScores] = useState<PillarScore[]>([]);

  const handlePlatformSelect = (platform: AuditPlatform) => { setSelectedPlatform(platform); };
  const handleStartAudit = () => { if (selectedPlatform && accountName) setCurrentStep("audit"); };
  const handleSavePillarAnswers = (pillarId: AuditPillarId, answers: AuditAnswer[]) => {
    const pillar = AUDIT_PILLARS.find(p => p.id === pillarId);
    if (!pillar) return;
    const score = calculatePillarScore(answers, pillar);
    setPillarScores(prev => { const existing = prev.filter(ps => ps.pillarId !== pillarId); return [...existing, { pillarId, score, answers }]; });
    setActivePillar(null);
  };
  const getCompletedPillars = () => pillarScores.filter(ps => { const pillar = AUDIT_PILLARS.find(p => p.id === ps.pillarId); return pillar && ps.answers.length === pillar.questions.length; });
  const handleFinishAudit = () => { setCurrentStep("results"); };
  const handleResetAudit = () => { setCurrentStep("platform"); setSelectedPlatform(null); setAccountName(""); setActivePillar(null); setPillarScores([]); };

  const completedPillars = getCompletedPillars();
  const overallScore = calculateOverallScore(pillarScores);
  const platformName = AUDIT_PLATFORMS.find(p => p.id === selectedPlatform)?.name || "";

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><ClipboardCheck className="w-6 h-6" />Auditoria de Contas<PageInfoTooltip description="Avalie a maturidade, eficiência e governança das contas de mídia com questionário estruturado por pilares." /></h1>
            <p className="text-sm text-muted-foreground">Avalie a maturidade, eficiência e governança das suas contas de mídia</p>
          </div>
          {currentStep !== "platform" && (<Button variant="outline" onClick={handleResetAudit}><RotateCcw className="w-4 h-4 mr-2" />Nova Auditoria</Button>)}
        </div>

        {currentStep !== "results" && (
          <div className="flex items-center gap-2">
            {["platform", "info", "audit"].map((step, i) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === step ? "bg-primary text-primary-foreground" : ["platform", "info", "audit"].indexOf(currentStep) > i ? "bg-status-success text-background" : "bg-muted text-muted-foreground"}`}>
                  {["platform", "info", "audit"].indexOf(currentStep) > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className={`w-12 h-0.5 mx-2 ${["platform", "info", "audit"].indexOf(currentStep) > i ? "bg-status-success" : "bg-muted"}`} />}
              </div>
            ))}
            <span className="text-sm text-muted-foreground ml-2">
              {currentStep === "platform" && "Selecionar Plataforma"}
              {currentStep === "info" && "Informações da Conta"}
              {currentStep === "audit" && "Avaliação dos Pilares"}
            </span>
          </div>
        )}

        {currentStep === "platform" && (
          <div className="space-y-6">
            <AuditPlatformSelector selectedPlatform={selectedPlatform} onSelect={handlePlatformSelect} />
            {selectedPlatform && (<div className="flex justify-end"><Button onClick={() => setCurrentStep("info")}>Continuar<ArrowRight className="w-4 h-4 ml-2" /></Button></div>)}
          </div>
        )}

        {currentStep === "info" && (
          <Card><CardHeader><CardTitle>Informações da Conta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="account-name">Nome da Conta / Cliente</Label><Input id="account-name" placeholder="Ex: Cliente XYZ - Conta Principal" value={accountName} onChange={(e) => setAccountName(e.target.value)} /></div>
              <div className="p-4 rounded-lg bg-muted/50"><p className="text-sm text-muted-foreground"><strong>Plataforma selecionada:</strong> {platformName}</p></div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("platform")}>Voltar</Button>
                <Button onClick={handleStartAudit} disabled={!accountName}><Play className="w-4 h-4 mr-2" />Iniciar Auditoria</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "audit" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <div><p className="font-medium text-foreground">{accountName}</p><p className="text-sm text-muted-foreground">{platformName}</p></div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{completedPillars.length}/{AUDIT_PILLARS.length} pilares completos</Badge>
                {completedPillars.length === AUDIT_PILLARS.length && (<Button onClick={handleFinishAudit}>Ver Resultados<ArrowRight className="w-4 h-4 ml-2" /></Button>)}
              </div>
            </div>
            {activePillar ? (
              <AuditQuestionForm pillar={AUDIT_PILLARS.find(p => p.id === activePillar)!} existingAnswers={pillarScores.find(ps => ps.pillarId === activePillar)?.answers || []} onSave={(answers) => handleSavePillarAnswers(activePillar, answers)} onBack={() => setActivePillar(null)} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {AUDIT_PILLARS.map((pillar) => {
                  const score = pillarScores.find(ps => ps.pillarId === pillar.id);
                  const isCompleted = score && score.answers.length === pillar.questions.length;
                  return <AuditPillarCard key={pillar.id} pillar={pillar} score={score} isActive={activePillar === pillar.id} isCompleted={!!isCompleted} onClick={() => setActivePillar(pillar.id)} />;
                })}
              </div>
            )}
          </div>
        )}

        {currentStep === "results" && (<AuditResultsDashboard accountName={accountName} platform={platformName} pillarScores={pillarScores} overallScore={overallScore} />)}
      </div>
    </AppLayout>
  );
}
