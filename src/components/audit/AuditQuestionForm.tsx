import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Info, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AuditPillar, AuditAnswer } from "@/data/auditTypes";

interface AuditQuestionFormProps {
  pillar: AuditPillar;
  existingAnswers: AuditAnswer[];
  onSave: (answers: AuditAnswer[]) => void;
  onBack: () => void;
}

const SCORE_OPTIONS = [
  { value: 0, label: "Não atende", color: "bg-destructive" },
  { value: 25, label: "Parcialmente", color: "bg-orange-500" },
  { value: 50, label: "Atende básico", color: "bg-yellow-500" },
  { value: 75, label: "Atende bem", color: "bg-primary" },
  { value: 100, label: "Excelente", color: "bg-success" },
];

export function AuditQuestionForm({ pillar, existingAnswers, onSave, onBack }: AuditQuestionFormProps) {
  const [answers, setAnswers] = useState<Record<string, { score: number; notes: string }>>(() => {
    const initial: Record<string, { score: number; notes: string }> = {};
    existingAnswers.forEach((a) => {
      initial[a.questionId] = { score: a.score, notes: a.notes || "" };
    });
    return initial;
  });
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestion = pillar.questions[currentIndex];
  const isLastQuestion = currentIndex === pillar.questions.length - 1;
  const isFirstQuestion = currentIndex === 0;
  
  const handleScoreChange = (questionId: string, score: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], score, notes: prev[questionId]?.notes || "" },
    }));
  };
  
  const handleNotesChange = (questionId: string, notes: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], notes, score: prev[questionId]?.score ?? -1 },
    }));
  };
  
  const handleSave = () => {
    const auditAnswers: AuditAnswer[] = Object.entries(answers)
      .filter(([_, val]) => val.score >= 0)
      .map(([questionId, val]) => ({
        questionId,
        score: val.score,
        notes: val.notes || undefined,
      }));
    onSave(auditAnswers);
  };
  
  const answeredCount = Object.values(answers).filter((a) => a.score >= 0).length;
  const currentAnswer = answers[currentQuestion.id];
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar aos pilares
          </Button>
          <Badge variant="outline">
            {answeredCount}/{pillar.questions.length} respondidas
          </Badge>
        </div>
        <CardTitle className="text-lg">{pillar.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{pillar.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress indicator */}
        <div className="flex gap-1">
          {pillar.questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-primary"
                  : answers[q.id]?.score >= 0
                  ? "bg-success"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        
        {/* Current question */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Pergunta {currentIndex + 1} de {pillar.questions.length}
              </p>
              <h3 className="font-medium text-foreground">{currentQuestion.question}</h3>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="shrink-0">
                  Peso: {currentQuestion.weight}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                Esta pergunta representa {currentQuestion.weight}% do score deste pilar
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Score options */}
          <RadioGroup
            value={currentAnswer?.score?.toString() ?? ""}
            onValueChange={(val) => handleScoreChange(currentQuestion.id, parseInt(val))}
            className="grid grid-cols-5 gap-2"
          >
            {SCORE_OPTIONS.map((option) => (
              <div key={option.value} className="relative">
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`score-${option.value}`}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={`score-${option.value}`}
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all text-center"
                >
                  <div className={`w-3 h-3 rounded-full ${option.color} mb-2`} />
                  <span className="text-xs font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.value}%</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm text-muted-foreground">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Adicione notas ou evidências..."
              value={currentAnswer?.notes || ""}
              onChange={(e) => handleNotesChange(currentQuestion.id, e.target.value)}
              className="mt-1 resize-none"
              rows={2}
            />
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            disabled={isFirstQuestion}
            onClick={() => setCurrentIndex((i) => i - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSave}>
              <Save className="w-4 h-4 mr-1" />
              Salvar progresso
            </Button>
            
            {isLastQuestion ? (
              <Button onClick={handleSave}>
                Concluir pilar
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((i) => i + 1)}>
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
