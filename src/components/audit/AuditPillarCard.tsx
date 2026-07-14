import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Layers, Tags, Settings, Image, Users, LineChart, TrendingUp, Shield, 
  ChevronRight, CheckCircle2 
} from "lucide-react";
import type { AuditPillar, PillarScore } from "@/data/auditTypes";

interface AuditPillarCardProps {
  pillar: AuditPillar;
  score?: PillarScore;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Layers: <Layers className="w-5 h-5" />,
  Tags: <Tags className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  Image: <Image className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  LineChart: <LineChart className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
};

export function AuditPillarCard({ pillar, score, isActive, isCompleted, onClick }: AuditPillarCardProps) {
  const scoreValue = score?.score ?? 0;
  const answeredCount = score?.answers.length ?? 0;
  const totalQuestions = pillar.questions.length;
  
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all",
        isActive && "border-primary ring-2 ring-primary/20",
        isCompleted && !isActive && "border-success/50 bg-success/5"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isCompleted ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
            )}>
              {iconMap[pillar.icon]}
            </div>
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                {pillar.name}
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-success" />}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{pillar.description}</p>
            </div>
          </div>
          <ChevronRight className={cn(
            "w-4 h-4 text-muted-foreground transition-transform",
            isActive && "rotate-90"
          )} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>{answeredCount}/{totalQuestions} perguntas</span>
          {isCompleted && (
            <Badge variant={scoreValue >= 70 ? "default" : scoreValue >= 40 ? "secondary" : "destructive"} className="text-xs">
              {scoreValue}%
            </Badge>
          )}
        </div>
        <Progress value={(answeredCount / totalQuestions) * 100} className="h-1" />
      </CardContent>
    </Card>
  );
}
