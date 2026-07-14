/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED INTELLIGENCE CORE — Registro de Arquitetura
 * ═══════════════════════════════════════════════════════════════
 *
 * Este módulo documenta e reforça a arquitetura de inteligência.
 * Serve como referência única para propriedade de sinais,
 * regras de fluxo de dados e prevenção de redundância.
 *
 * ARQUITETURA:
 *   CAMADA DE DADOS → PADRONIZAÇÃO → FEATURE STORE → 
 *   NÚCLEO DE INTELIGÊNCIA UNIFICADO → COPILOTO IA → 
 *   DASHBOARDS → AÇÕES OPERACIONAIS
 *
 * Nenhuma árvore lógica paralela é permitida.
 *
 * ═══════════════════════════════════════════════════════════════
 */

// ── Taxonomia de Domínios de Sinais ──

export type SignalDomain =
  | "behavioral"
  | "financial"
  | "efficiency"
  | "risk"
  | "pattern"
  | "journey";

export interface SignalDefinition {
  id: string;
  domain: SignalDomain;
  name: string;
  description: string;
  provider: string;
  consumers: string[];
  featureStoreField: string;
}

// ── Registro de Sinais — Mapeamento Autoritativo ──

export const SIGNAL_REGISTRY: SignalDefinition[] = [
  // ── SINAIS DE EFICIÊNCIA ──
  {
    id: "agency_aggregation",
    domain: "efficiency",
    name: "Agregação da Agência",
    description: "Média de MBEI da agência, momentum, distribuição de velocidade de gasto",
    provider: "efficiencyCalculations",
    consumers: ["Dashboard", "Briefing Diário", "Revisão Semanal", "Resumo Executivo Mensal", "Painel Executivo", "Eficiência"],
    featureStoreField: "agencyAggregation",
  },
  {
    id: "momentum_category",
    domain: "efficiency",
    name: "Categoria de Momentum",
    description: "Momentum de eficiência por campanha (forte_positivo → forte_negativo)",
    provider: "efficiencyCalculations",
    consumers: ["CampaignTrendCard", "AgencyMBEIBar", "Benchmark", "todos os dashboards"],
    featureStoreField: "agencyAggregation.momentum",
  },
  {
    id: "spend_velocity",
    domain: "efficiency",
    name: "Velocidade de Gasto",
    description: "Ritmo de investimento vs planejado (detecção de sobre/subinvestimento)",
    provider: "efficiencyCalculations",
    consumers: ["CampaignTrendCard", "recommendationEngine", "aiCopilotEngine"],
    featureStoreField: "agencyAggregation",
  },

  // ── SINAIS FINANCEIROS ──
  {
    id: "client_profitability",
    domain: "financial",
    name: "Rentabilidade do Cliente",
    description: "Receita, margem, custo operacional por cliente",
    provider: "financialCalculations",
    consumers: ["Financeiro", "Painel Executivo", "Benchmark", "Briefing Diário", "Revisão Semanal"],
    featureStoreField: "clientProfitabilities",
  },
  {
    id: "agency_financials",
    domain: "financial",
    name: "Financeiro da Agência",
    description: "Receita agregada da agência, margem, contagem abaixo da meta",
    provider: "financialCalculations",
    consumers: ["Financeiro", "Painel Executivo", "Briefing Diário", "Revisão Semanal"],
    featureStoreField: "agencyFinancials",
  },

  // ── SINAIS DE PREVISÃO ──
  {
    id: "campaign_forecast",
    domain: "efficiency",
    name: "Previsão de Campanha",
    description: "CPA projetado, MBEI, entrega de conversões por campanha",
    provider: "forecastCalculations",
    consumers: ["recommendationEngine", "aiCopilotEngine", "CampaignTrendCard", "Painel Executivo", "Briefing Diário"],
    featureStoreField: "campaignForecasts",
  },
  {
    id: "client_financial_forecast",
    domain: "financial",
    name: "Previsão Financeira do Cliente",
    description: "Receita e margem projetadas por cliente",
    provider: "forecastCalculations",
    consumers: ["Painel Executivo"],
    featureStoreField: "clientFinancialForecasts",
  },

  // ── SINAIS ESTATÍSTICOS / COMPORTAMENTAIS ──
  {
    id: "budget_elasticity",
    domain: "behavioral",
    name: "Elasticidade Orçamentária",
    description: "Como as conversões respondem a mudanças de investimento (sinal de escalabilidade)",
    provider: "statisticalCalculations",
    consumers: ["Intel. Estatística", "patternLearningEngine (somente detecção)"],
    featureStoreField: "elasticityAnalyses",
  },
  {
    id: "frequency_saturation",
    domain: "behavioral",
    name: "Saturação de Frequência",
    description: "Detecção de fadiga de audiência via correlação frequência vs CVR",
    provider: "statisticalCalculations",
    consumers: ["Intel. Estatística", "patternLearningEngine (somente detecção)"],
    featureStoreField: "saturationAnalyses",
  },
  {
    id: "funnel_interaction",
    domain: "journey",
    name: "Interação de Funil",
    description: "Sinais de lift cross-funil (correlação awareness → conversão)",
    provider: "statisticalCalculations",
    consumers: ["Intel. Estatística"],
    featureStoreField: "funnelInteractions",
  },
  {
    id: "margin_sensitivity",
    domain: "financial",
    name: "Sensibilidade de Margem",
    description: "Como a margem responde a mudanças de investimento",
    provider: "statisticalCalculations",
    consumers: ["Intel. Estatística"],
    featureStoreField: "marginSensitivities",
  },
  {
    id: "client_clusters",
    domain: "behavioral",
    name: "Clusters de Performance de Clientes",
    description: "Segmentação de clientes (Alto/Estável/Volátil/Arriscado × Margem × Crescimento)",
    provider: "statisticalCalculations",
    consumers: ["Intel. Estatística"],
    featureStoreField: "clientClusters",
  },

  // ── SINAIS DE RISCO ──
  {
    id: "client_risk_score",
    domain: "risk",
    name: "Score de Risco do Cliente",
    description: "Score de risco composto a partir de MBEI, momentum, alertas, margem",
    provider: "benchmarkCalculations",
    consumers: ["Benchmark", "Painel Executivo", "Resumo Executivo Mensal"],
    featureStoreField: "clientRiskScores",
  },
  {
    id: "agency_benchmark",
    domain: "risk",
    name: "Benchmark da Agência",
    description: "Médias da agência para MBEI, CPA, taxa de conversão, margem, velocidade",
    provider: "benchmarkCalculations",
    consumers: ["Benchmark"],
    featureStoreField: "agencyBenchmark",
  },

  // ── SINAIS DE PADRÃO ──
  {
    id: "learned_patterns",
    domain: "pattern",
    name: "Padrões Aprendidos",
    description: "Padrões comportamentais detectados (frequência, elasticidade, funil, criativo, margem)",
    provider: "patternLearningEngine",
    consumers: ["Intel. de Padrões", "aiCopilotEngine (enriquecimento de contexto)"],
    featureStoreField: "learnedPatterns",
  },

  // ── SINAIS COMPORTAMENTAIS (derivados) ──
  {
    id: "recommendations",
    domain: "behavioral",
    name: "Recomendações",
    description: "Recomendações acionáveis (pausar, escalar, realocar, rotacionar)",
    provider: "recommendationEngine",
    consumers: ["Central de Otimização", "Briefing Diário", "Revisão Semanal", "Resumo Executivo Mensal"],
    featureStoreField: "recommendations",
  },
  {
    id: "ai_insights",
    domain: "behavioral",
    name: "Insights de IA",
    description: "Insights determinísticos com consciência de funil (anomalia, previsão, margem, diário, semanal)",
    provider: "aiCopilotEngine",
    consumers: ["Insights de IA", "Briefing Diário", "Revisão Semanal"],
    featureStoreField: "aiInsights",
  },

  // ── SINAIS OPERACIONAIS ──
  {
    id: "agency_health_index",
    domain: "risk",
    name: "Índice de Saúde do Cliente",
    description: "Saúde operacional composta (0-100) a partir de MBEI, margem, alertas, momentum, previsão, metas",
    provider: "operationalCalculations",
    consumers: ["Briefing Diário", "Resumo Executivo Mensal"],
    featureStoreField: "agencyHealthIndex",
  },
];

// ── Regras de Arquitetura ──

export const ARCHITECTURE_RULES = [
  "Todas as métricas estratégicas DEVEM originar-se do Feature Store Hub",
  "Nenhum módulo pode recalcular independentemente CPA, ROAS, elasticidade, margem ou eficiência de funil",
  "O Motor Estatístico computa sinais; o Motor de Padrões detecta comportamentos entre eles",
  "O Copiloto IA consome apenas sinais estruturados — sem recomputação",
  "O Motor de Previsão usa sinais de elasticidade/padrão mas NÃO recalcula eficiência estrutural",
  "O Embedding Operacional consome sinais de risco/padrão/previsão sem recalculá-los",
  "Cada tela de dashboard deve ter um propósito decisório único — sem redundância visual",
  "O Feature Store é a fonte autoritativa — todos os módulos downstream são consumidores somente-leitura",
] as const;

// ── Manifesto de Auditoria de Redundância ──

export interface RedundancyAuditEntry {
  signal: string;
  previousLocations: string[];
  consolidatedTo: string;
  status: "resolved" | "monitored";
}

export const REDUNDANCY_AUDIT: RedundancyAuditEntry[] = [
  {
    signal: "Média de MBEI",
    previousLocations: [
      "efficiencyCalculations.computeAgencyAggregation",
      "benchmarkCalculations.computeAgencyBenchmark",
      "operationalCalculations.computeAgencyHealthIndex",
      "statisticalCalculations.computeClientClusters",
      "aiCopilotEngine.generateAIInsights (linha 129)",
    ],
    consolidatedTo: "featureStoreHub.materializeFeatureStore → agencyAggregation",
    status: "resolved",
  },
  {
    signal: "Computação de Elasticidade",
    previousLocations: [
      "statisticalCalculations.computeBudgetElasticity",
      "patternLearningEngine.detectElasticityPatterns",
    ],
    consolidatedTo: "statisticalCalculations (autoritativo) → featureStoreHub.elasticityAnalyses",
    status: "resolved",
  },
  {
    signal: "Análise de Frequência/Saturação",
    previousLocations: [
      "statisticalCalculations.computeFrequencySaturation",
      "patternLearningEngine.detectFrequencyPatterns",
    ],
    consolidatedTo: "statisticalCalculations (autoritativo) → featureStoreHub.saturationAnalyses",
    status: "resolved",
  },
  {
    signal: "Sensibilidade de Margem",
    previousLocations: [
      "statisticalCalculations.computeMarginSensitivity",
      "patternLearningEngine.detectMarginPatterns",
      "financialCalculations.computeClientProfitability",
    ],
    consolidatedTo: "statisticalCalculations (computação) + financialCalculations (receita) → featureStoreHub",
    status: "resolved",
  },
  {
    signal: "Interação de Funil",
    previousLocations: [
      "statisticalCalculations.computeFunnelInteraction",
      "patternLearningEngine.detectFunnelPatterns",
      "aiCopilotEngine.inferFunnelStage",
    ],
    consolidatedTo: "aiCopilotEngine.inferFunnelStage (atribuição) + statisticalCalculations (análise) → featureStoreHub",
    status: "resolved",
  },
  {
    signal: "Previsão de Campanha",
    previousLocations: [
      "forecastCalculations.computeCampaignForecast (chamado em recommendationEngine)",
      "forecastCalculations.computeCampaignForecast (chamado em aiCopilotEngine)",
      "forecastCalculations.computeCampaignForecast (chamado em CampaignTrendCard)",
      "forecastCalculations.computeCampaignForecast (chamado em ExecutiveDashboard)",
      "forecastCalculations.computeCampaignForecast (chamado em DailyBrief)",
      "forecastCalculations.computeCampaignForecast (chamado em MonthlyExecutiveSummary)",
    ],
    consolidatedTo: "featureStoreHub.materializeFeatureStore → campaignForecasts (computado uma vez, em cache)",
    status: "resolved",
  },
  {
    signal: "Pontuação de Risco",
    previousLocations: [
      "benchmarkCalculations.computeRiskScore",
      "operationalCalculations.computeAgencyHealthIndex (componentes de risco sobrepostos)",
    ],
    consolidatedTo: "benchmarkCalculations (score de risco) + operationalCalculations (índice de saúde) → featureStoreHub",
    status: "resolved",
  },
  {
    signal: "Rentabilidade do Cliente",
    previousLocations: [
      "Computado independentemente em: Financeiro, Painel Executivo, Benchmark, Briefing Diário, Revisão Semanal, Resumo Executivo Mensal",
    ],
    consolidatedTo: "featureStoreHub.materializeFeatureStore → clientProfitabilities (computado uma vez)",
    status: "resolved",
  },
];

// ── Resumo de Domínios de Sinais ──

export function getSignalsByDomain(domain: SignalDomain): SignalDefinition[] {
  return SIGNAL_REGISTRY.filter(s => s.domain === domain);
}

export function getSignalProviders(): string[] {
  return [...new Set(SIGNAL_REGISTRY.map(s => s.provider))];
}

export function getSignalConsumers(signalId: string): string[] {
  return SIGNAL_REGISTRY.find(s => s.id === signalId)?.consumers ?? [];
}
