import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, Award, Target, AlertTriangle, CheckCircle2, 
  Download, FileText, PresentationIcon, Database
} from "lucide-react";
import type { PillarScore, MaturityConfig } from "@/data/auditTypes";
import { AUDIT_PILLARS, getMaturityLevel, MATURITY_LEVELS } from "@/data/auditTypes";

interface AuditResultsDashboardProps {
  accountName: string;
  platform: string;
  pillarScores: PillarScore[];
  overallScore: number;
}

export function AuditResultsDashboard({ 
  accountName, 
  platform, 
  pillarScores, 
  overallScore 
}: AuditResultsDashboardProps) {
  const maturity = getMaturityLevel(overallScore);
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-primary";
    if (score >= 40) return "text-warning";
    return "text-destructive";
  };
  
  const getProgressColor = (score: number) => {
    if (score >= 90) return "bg-success";
    if (score >= 70) return "bg-primary";
    if (score >= 40) return "bg-warning";
    return "bg-destructive";
  };
  
  const sortedPillars = [...pillarScores].sort((a, b) => a.score - b.score);
  const weakestPillars = sortedPillars.slice(0, 3);
  const strongestPillars = sortedPillars.slice(-3).reverse();
  
  return (
    <div className="space-y-6">
      {/* Header with overall score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Score Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Score Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${(overallScore / 100) * 351.86} 351.86`}
                    className={getScoreColor(overallScore)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </span>
                  <span className="text-xs text-muted-foreground">pontos</span>
                </div>
              </div>
              <Badge 
                className="mt-4" 
                style={{ backgroundColor: maturity.color, color: "white" }}
              >
                <Award className="w-3 h-3 mr-1" />
                {maturity.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        {/* Account Info & Maturity Scale */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classificação de Maturidade
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium text-foreground">{accountName}</p>
              <p className="text-sm text-muted-foreground">{platform}</p>
            </div>
            
            {/* Maturity scale */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                {MATURITY_LEVELS.map((level) => (
                  <span key={level.level} className="text-center flex-1">
                    {level.label}
                  </span>
                ))}
              </div>
              <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 flex">
                  {MATURITY_LEVELS.map((level, i) => (
                    <div
                      key={level.level}
                      className="flex-1"
                      style={{ backgroundColor: level.color, opacity: 0.3 }}
                    />
                  ))}
                </div>
                <div
                  className="absolute h-full rounded-full transition-all"
                  style={{ 
                    width: `${overallScore}%`, 
                    backgroundColor: maturity.color 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>40</span>
                <span>70</span>
                <span>90</span>
                <span>100</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Pillar scores grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5" />
            Score por Pilar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillarScores.map((ps) => {
              const pillar = AUDIT_PILLARS.find((p) => p.id === ps.pillarId);
              if (!pillar) return null;
              
              return (
                <div key={ps.pillarId} className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">{pillar.name}</span>
                    <span className={`text-lg font-bold ${getScoreColor(ps.score)}`}>
                      {ps.score}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getProgressColor(ps.score)}`}
                      style={{ width: `${ps.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Principais Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakestPillars.map((ps) => {
                const pillar = AUDIT_PILLARS.find((p) => p.id === ps.pillarId);
                if (!pillar) return null;
                
                return (
                  <div key={ps.pillarId} className="flex items-center justify-between p-2 rounded bg-destructive/10">
                    <span className="text-sm">{pillar.name}</span>
                    <Badge variant="destructive">{ps.score}%</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Pontos Fortes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strongestPillars.map((ps) => {
                const pillar = AUDIT_PILLARS.find((p) => p.id === ps.pillarId);
                if (!pillar) return null;
                
                return (
                  <div key={ps.pillarId} className="flex items-center justify-between p-2 rounded bg-success/10">
                    <span className="text-sm">{pillar.name}</span>
                    <Badge className="bg-success">{ps.score}%</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Download className="w-5 h-5" />
            Exportar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <FileText className="w-6 h-6" />
              <span>Relatório PDF</span>
              <span className="text-xs text-muted-foreground">Executivo e Técnico</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <PresentationIcon className="w-6 h-6" />
              <span>Apresentação</span>
              <span className="text-xs text-muted-foreground">Formato Slides</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col gap-2">
              <Database className="w-6 h-6" />
              <span>Dados BI</span>
              <span className="text-xs text-muted-foreground">CSV/JSON</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
