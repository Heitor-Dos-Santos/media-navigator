// Audit Module Types and Data Structures

export type MaturityLevel = "basic" | "intermediate" | "advanced" | "high-performance";

export interface MaturityConfig {
  level: MaturityLevel;
  label: string;
  minScore: number;
  color: string;
}

export const MATURITY_LEVELS: MaturityConfig[] = [
  { level: "basic", label: "Básica", minScore: 0, color: "hsl(var(--destructive))" },
  { level: "intermediate", label: "Intermediária", minScore: 40, color: "hsl(var(--warning))" },
  { level: "advanced", label: "Avançada", minScore: 70, color: "hsl(var(--primary))" },
  { level: "high-performance", label: "Alta Performance", minScore: 90, color: "hsl(var(--success))" },
];

export type AuditPillarId = 
  | "account-structure"
  | "taxonomy"
  | "media-config"
  | "creatives"
  | "audiences"
  | "tracking"
  | "performance"
  | "governance"
  | "maturity";

export interface AuditQuestion {
  id: string;
  question: string;
  weight: number;
  helpText?: string;
}

export interface AuditPillar {
  id: AuditPillarId;
  name: string;
  description: string;
  icon: string;
  questions: AuditQuestion[];
}

export interface AuditAnswer {
  questionId: string;
  score: number; // 0-100
  notes?: string;
}

export interface PillarScore {
  pillarId: AuditPillarId;
  score: number;
  answers: AuditAnswer[];
}

export interface AuditResult {
  id: string;
  accountName: string;
  platform: string;
  createdAt: Date;
  pillarScores: PillarScore[];
  overallScore: number;
  maturityLevel: MaturityLevel;
}

export type AuditPlatform = "google-ads" | "meta-ads" | "programatica";

export interface AuditPlatformConfig {
  id: AuditPlatform;
  name: string;
  description: string;
}

export const AUDIT_PLATFORMS: AuditPlatformConfig[] = [
  { id: "google-ads", name: "Google Ads", description: "Search, Display, YouTube, Performance Max" },
  { id: "meta-ads", name: "Meta Ads", description: "Facebook, Instagram, Messenger, Audience Network" },
  { id: "programatica", name: "Programática", description: "DV360, Trade Desk, outras DSPs" },
];

export const AUDIT_PILLARS: AuditPillar[] = [
  {
    id: "account-structure",
    name: "Estrutura de Conta",
    description: "Organização de campanhas, conjuntos e anúncios",
    icon: "Layers",
    questions: [
      { id: "as-1", question: "A estrutura de campanhas está alinhada com os objetivos de negócio?", weight: 15 },
      { id: "as-2", question: "As campanhas estão organizadas por fase de funil (TOFU/MOFU/BOFU)?", weight: 15 },
      { id: "as-3", question: "A estrutura reflete a estratégia de mídia definida?", weight: 15 },
      { id: "as-4", question: "O nível de fragmentação/consolidação está adequado?", weight: 15 },
      { id: "as-5", question: "Há uso correto da hierarquia campanha > conjunto > anúncio?", weight: 20 },
      { id: "as-6", question: "A estrutura permite análise granular de performance?", weight: 20 },
    ],
  },
  {
    id: "taxonomy",
    name: "Taxonomia e Padronização",
    description: "Consistência de nomenclatura e organização",
    icon: "Tags",
    questions: [
      { id: "tx-1", question: "Existe um padrão de nomenclatura definido e documentado?", weight: 15 },
      { id: "tx-2", question: "A nomenclatura é consistente entre campanhas, IOs e criativos?", weight: 20 },
      { id: "tx-3", question: "As informações-chave estão presentes (canal, objetivo, público, formato)?", weight: 20 },
      { id: "tx-4", question: "Há aderência aos templates definidos na plataforma?", weight: 15 },
      { id: "tx-5", question: "A taxonomia facilita a leitura e análise em BI?", weight: 15 },
      { id: "tx-6", question: "Os períodos estão identificados corretamente?", weight: 15 },
    ],
  },
  {
    id: "media-config",
    name: "Configurações de Mídia",
    description: "Tipo de compra, lances e orçamentos",
    icon: "Settings",
    questions: [
      { id: "mc-1", question: "O tipo de compra está adequado ao objetivo (leilão, alcance, conversão)?", weight: 20 },
      { id: "mc-2", question: "A estratégia de lance está otimizada para o objetivo?", weight: 20 },
      { id: "mc-3", question: "A distribuição de orçamento está alinhada com prioridades?", weight: 15 },
      { id: "mc-4", question: "As otimizações automáticas estão configuradas corretamente?", weight: 15 },
      { id: "mc-5", question: "Há coerência entre objetivo de campanha e tipo de otimização?", weight: 15 },
      { id: "mc-6", question: "Os limites de frequência estão configurados?", weight: 15 },
    ],
  },
  {
    id: "creatives",
    name: "Criativos",
    description: "Quantidade, diversidade e performance criativa",
    icon: "Image",
    questions: [
      { id: "cr-1", question: "Há quantidade mínima recomendada de criativos por grupo?", weight: 15 },
      { id: "cr-2", question: "Existe diversidade de formatos (imagem, vídeo, carrossel)?", weight: 15 },
      { id: "cr-3", question: "Há sinais de saturação criativa sendo monitorados?", weight: 15 },
      { id: "cr-4", question: "A relação frequência x performance está saudável?", weight: 15 },
      { id: "cr-5", question: "A taxa de reprovação está dentro do aceitável?", weight: 20 },
      { id: "cr-6", question: "Os criativos seguem as boas práticas da plataforma?", weight: 20 },
    ],
  },
  {
    id: "audiences",
    name: "Públicos e Segmentação",
    description: "Estrutura de audiências e estratégias de targeting",
    icon: "Users",
    questions: [
      { id: "au-1", question: "A estrutura de públicos está bem organizada?", weight: 15 },
      { id: "au-2", question: "Há uso estratégico de públicos amplos vs específicos?", weight: 15 },
      { id: "au-3", question: "Os públicos próprios (1st party) estão sendo utilizados?", weight: 15 },
      { id: "au-4", question: "As estratégias de remarketing estão implementadas?", weight: 15 },
      { id: "au-5", question: "Há análise de sobreposição de públicos?", weight: 10 },
      { id: "au-6", question: "As exclusões de público estão configuradas corretamente?", weight: 15 },
      { id: "au-7", question: "Há coerência entre público e mensagem criativa?", weight: 15 },
    ],
  },
  {
    id: "tracking",
    name: "Tracking e Mensuração",
    description: "UTMs, eventos e integrações de dados",
    icon: "LineChart",
    questions: [
      { id: "tr-1", question: "Os UTMs estão presentes em todas as URLs?", weight: 20 },
      { id: "tr-2", question: "Os parâmetros UTM seguem um padrão consistente?", weight: 15 },
      { id: "tr-3", question: "Há integração correta com GA4 ou ferramenta de BI?", weight: 15 },
      { id: "tr-4", question: "O tracking é consistente entre plataformas?", weight: 15 },
      { id: "tr-5", question: "Os eventos de conversão estão configurados corretamente?", weight: 20 },
      { id: "tr-6", question: "O pixel/tag está instalado e funcionando?", weight: 15 },
    ],
  },
  {
    id: "performance",
    name: "Performance e Eficiência",
    description: "Resultados, benchmarks e eficiência de compra",
    icon: "TrendingUp",
    questions: [
      { id: "pf-1", question: "Os resultados reais estão próximos das estimativas?", weight: 20 },
      { id: "pf-2", question: "O CPA/CPL está dentro do benchmark de mercado?", weight: 15 },
      { id: "pf-3", question: "O CPM está competitivo para o segmento?", weight: 15 },
      { id: "pf-4", question: "Há eficiência na compra de mídia (economia vs desperdício)?", weight: 20 },
      { id: "pf-5", question: "Os resultados são consistentes ao longo do tempo?", weight: 15 },
      { id: "pf-6", question: "Há análise de incrementalidade/atribuição?", weight: 15 },
    ],
  },
  {
    id: "governance",
    name: "Governança e Boas Práticas",
    description: "Controle de acesso, processos e compliance",
    icon: "Shield",
    questions: [
      { id: "gv-1", question: "O controle de acesso está configurado corretamente?", weight: 15 },
      { id: "gv-2", question: "Há histórico documentado de alterações?", weight: 15 },
      { id: "gv-3", question: "Existe processo de aprovação para mudanças?", weight: 15 },
      { id: "gv-4", question: "A frequência de otimizações está adequada?", weight: 20 },
      { id: "gv-5", question: "Os processos operacionais estão documentados?", weight: 20 },
      { id: "gv-6", question: "Há compliance com políticas de privacidade?", weight: 15 },
    ],
  },
];

export function calculatePillarScore(answers: AuditAnswer[], pillar: AuditPillar): number {
  if (answers.length === 0) return 0;
  
  let totalWeight = 0;
  let weightedScore = 0;
  
  for (const question of pillar.questions) {
    const answer = answers.find(a => a.questionId === question.id);
    if (answer) {
      weightedScore += answer.score * question.weight;
      totalWeight += question.weight;
    }
  }
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

export function calculateOverallScore(pillarScores: PillarScore[]): number {
  if (pillarScores.length === 0) return 0;
  const sum = pillarScores.reduce((acc, ps) => acc + ps.score, 0);
  return Math.round(sum / pillarScores.length);
}

export function getMaturityLevel(score: number): MaturityConfig {
  for (let i = MATURITY_LEVELS.length - 1; i >= 0; i--) {
    if (score >= MATURITY_LEVELS[i].minScore) {
      return MATURITY_LEVELS[i];
    }
  }
  return MATURITY_LEVELS[0];
}
