// ── Mock daily aggregated funnel data (90 days) ──

import type { FunnelDailyRecord, CampaignClassification } from "@/types/funnelImpact";

function generateDailyData(): FunnelDailyRecord[] {
  const records: FunnelDailyRecord[] = [];
  const startDate = new Date("2025-11-22");

  // Base values with realistic trends
  let baseTopoSpend = 8500;
  let baseFundoSpend = 15000;
  let baseAlcance = 320000;
  let baseFreq = 2.4;
  let baseImpressions = 780000;
  let baseConversions = 145;
  let baseRevenue = 52000;

  for (let i = 0; i < 90; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);

    // Weekly seasonality
    const dow = d.getDay();
    const weekendDip = (dow === 0 || dow === 6) ? 0.75 : 1.0;
    const midweekBump = (dow === 2 || dow === 3) ? 1.08 : 1.0;

    // Trend + noise
    const trend = 1 + (i / 90) * 0.15; // 15% growth over period
    const noise = () => 0.9 + Math.random() * 0.2;

    // Promo weeks (weeks 4, 8, 12)
    const weekNum = Math.floor(i / 7);
    const isPromo = [4, 8, 12].includes(weekNum) ? 1 : 0;
    const promoBoost = isPromo ? 1.25 : 1.0;

    // Topo spend oscillates with strategic increases
    const topoBurst = (i > 20 && i < 35) ? 1.4 : (i > 55 && i < 70) ? 1.5 : 1.0;
    const topoSpend = Math.round(baseTopoSpend * trend * noise() * weekendDip * topoBurst);

    const alcance = Math.round(baseAlcance * trend * noise() * topoBurst);
    const freq = +(baseFreq * (1 + (i / 180)) * (0.95 + Math.random() * 0.1)).toFixed(2);
    const impr = Math.round(baseImpressions * trend * noise() * topoBurst);

    // Fundo responds to topo with lag (~7-14 days)
    const laggedTopoEffect = i > 10 ? 1 + ((topoBurst - 1) * 0.6) : 1.0;
    const fundoSpend = Math.round(baseFundoSpend * trend * noise() * midweekBump);
    const conversions = Math.round(baseConversions * trend * noise() * midweekBump * promoBoost * laggedTopoEffect);
    const revenue = Math.round(baseRevenue * trend * noise() * midweekBump * promoBoost * laggedTopoEffect);
    const cpa = +(fundoSpend / Math.max(conversions, 1)).toFixed(2);
    const roas = +(revenue / Math.max(fundoSpend, 1)).toFixed(2);

    records.push({
      date: d.toISOString().split("T")[0],
      investimentoTopo: topoSpend,
      investimentoFundo: fundoSpend,
      alcanceTopo: alcance,
      frequenciaTopo: freq,
      impressoesTopo: impr,
      conversoesFundo: conversions,
      receitaFundo: revenue,
      cpaFundo: cpa,
      roasFundo: roas,
      indicadorPromocao: isPromo as 0 | 1,
      trendIndex: i + 1,
    });
  }
  return records;
}

export const FUNNEL_DAILY_DATA: FunnelDailyRecord[] = generateDailyData();

export const DEFAULT_CAMPAIGN_CLASSIFICATIONS: CampaignClassification[] = [
  { campaignId: "2", campaignName: "ACME_Q1_Awareness_Video", stage: "topo", rule: "Awareness" },
  { campaignId: "6", campaignName: "Globex_Video_Awareness", stage: "topo", rule: "Vídeo Views" },
  { campaignId: "1", campaignName: "ACME_Q1_Conversão_Search", stage: "fundo", rule: "Search" },
  { campaignId: "3", campaignName: "ACME_Q1_Retargeting", stage: "fundo", rule: "Remarketing" },
  { campaignId: "4", campaignName: "Globex_Brand_Search", stage: "fundo", rule: "Search" },
  { campaignId: "5", campaignName: "Globex_Social_Leads", stage: "fundo", rule: "Conversão" },
  { campaignId: "7", campaignName: "Initech_Performance_Max", stage: "fundo", rule: "Performance" },
  { campaignId: "8", campaignName: "Initech_LinkedIn_B2B", stage: "topo", rule: "Programática Prospecting" },
  { campaignId: "9", campaignName: "Umbrella_Retargeting_DV", stage: "fundo", rule: "Remarketing" },
  { campaignId: "10", campaignName: "Umbrella_Search_Branded", stage: "fundo", rule: "Search" },
  { campaignId: "11", campaignName: "Umbrella_Meta_Conversão", stage: "fundo", rule: "Conversão" },
];

export const FUNNEL_STAGE_RULES = {
  topo: ["Alcance", "Vídeo Views", "Programática Prospecting", "Awareness", "Branding", "Display Prospecting"],
  fundo: ["Search", "Remarketing", "Conversão", "Performance", "Shopping", "Lead Gen"],
};
