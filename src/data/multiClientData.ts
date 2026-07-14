import type { CampaignTrendData } from "@/types/efficiency";

export interface ClientData {
  id: string;
  name: string;
}

export interface CampaignWithClient extends CampaignTrendData {
  clientId: string;
  clientName: string;
  accountId?: string;
  status: "active" | "paused";
}

export interface CreativeWithClient {
  id: string;
  clientId: string;
  clientName: string;
  platform: string;
  campaignName: string;
  name: string;
  format: string;
  angle: string;
  emotion: string;
  offer: string;
  cta: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cvr: number;
  cpa: number;
  mbei: number;
  momentum: string;
  status: "scaling" | "stable" | "saturating" | "testing";
}

export const CLIENTS: ClientData[] = [
  { id: "acme", name: "ACME Corp" },
  { id: "globex", name: "Globex Industries" },
  { id: "initech", name: "Initech Solutions" },
  { id: "umbrella", name: "Umbrella Digital" },
];

export const PLATFORMS = ["Google Ads", "Meta Ads", "DV360", "LinkedIn", "TikTok Ads"];

export const ALL_CAMPAIGNS: CampaignWithClient[] = [
  // ACME
  { clientId: "acme", clientName: "ACME Corp", campaignId: "1", campaignName: "ACME_Q1_Conversão_Search", platform: "Google Ads", currentMBEI: 118, avgMBEI7d: 112, momentum: "strong_positive", momentumDelta: 5.4, rollingCPA: 24.5, rollingConversionRate: 0.032, spendVelocity: 0.98, sparklineData: [105, 108, 110, 112, 115, 114, 118], status: "active" },
  { clientId: "acme", clientName: "ACME Corp", campaignId: "2", campaignName: "ACME_Q1_Awareness_Video", platform: "Meta Ads", currentMBEI: 102, avgMBEI7d: 104, momentum: "negative", momentumDelta: -1.9, rollingCPA: 38.2, rollingConversionRate: 0.018, spendVelocity: 1.12, sparklineData: [108, 107, 106, 104, 103, 101, 102], status: "active" },
  { clientId: "acme", clientName: "ACME Corp", campaignId: "3", campaignName: "ACME_Q1_Retargeting", platform: "DV360", currentMBEI: 78, avgMBEI7d: 82, momentum: "strong_negative", momentumDelta: -5.8, rollingCPA: 52.1, rollingConversionRate: 0.012, spendVelocity: 1.22, sparklineData: [90, 88, 85, 84, 82, 80, 78], status: "active" },
  // Globex
  { clientId: "globex", clientName: "Globex Industries", campaignId: "4", campaignName: "Globex_Brand_Search", platform: "Google Ads", currentMBEI: 125, avgMBEI7d: 122, momentum: "positive", momentumDelta: 2.5, rollingCPA: 19.8, rollingConversionRate: 0.045, spendVelocity: 0.94, sparklineData: [118, 119, 120, 121, 122, 124, 125], status: "active" },
  { clientId: "globex", clientName: "Globex Industries", campaignId: "5", campaignName: "Globex_Social_Leads", platform: "Meta Ads", currentMBEI: 96, avgMBEI7d: 96, momentum: "neutral", momentumDelta: 0.0, rollingCPA: 42.0, rollingConversionRate: 0.021, spendVelocity: 1.01, sparklineData: [95, 97, 96, 95, 96, 97, 96], status: "active" },
  { clientId: "globex", clientName: "Globex Industries", campaignId: "6", campaignName: "Globex_Video_Awareness", platform: "TikTok Ads", currentMBEI: 110, avgMBEI7d: 105, momentum: "positive", momentumDelta: 4.8, rollingCPA: 28.0, rollingConversionRate: 0.028, spendVelocity: 1.05, sparklineData: [100, 102, 104, 105, 107, 108, 110], status: "active" },
  // Initech
  { clientId: "initech", clientName: "Initech Solutions", campaignId: "7", campaignName: "Initech_Performance_Max", platform: "Google Ads", currentMBEI: 88, avgMBEI7d: 95, momentum: "negative", momentumDelta: -7.4, rollingCPA: 48.5, rollingConversionRate: 0.015, spendVelocity: 1.18, sparklineData: [100, 98, 96, 95, 93, 90, 88], status: "active" },
  { clientId: "initech", clientName: "Initech Solutions", campaignId: "8", campaignName: "Initech_LinkedIn_B2B", platform: "LinkedIn", currentMBEI: 105, avgMBEI7d: 103, momentum: "positive", momentumDelta: 1.9, rollingCPA: 65.0, rollingConversionRate: 0.008, spendVelocity: 0.92, sparklineData: [100, 101, 102, 103, 103, 104, 105], status: "active" },
  // Umbrella
  { clientId: "umbrella", clientName: "Umbrella Digital", campaignId: "9", campaignName: "Umbrella_Retargeting_DV", platform: "DV360", currentMBEI: 72, avgMBEI7d: 80, momentum: "strong_negative", momentumDelta: -10.0, rollingCPA: 58.0, rollingConversionRate: 0.010, spendVelocity: 1.30, sparklineData: [88, 85, 82, 80, 78, 75, 72], status: "active" },
  { clientId: "umbrella", clientName: "Umbrella Digital", campaignId: "10", campaignName: "Umbrella_Search_Branded", platform: "Google Ads", currentMBEI: 132, avgMBEI7d: 128, momentum: "strong_positive", momentumDelta: 3.1, rollingCPA: 15.0, rollingConversionRate: 0.055, spendVelocity: 0.96, sparklineData: [125, 126, 127, 128, 129, 131, 132], status: "paused" },
  { clientId: "umbrella", clientName: "Umbrella Digital", campaignId: "11", campaignName: "Umbrella_Meta_Conversão", platform: "Meta Ads", currentMBEI: 94, avgMBEI7d: 98, momentum: "negative", momentumDelta: -4.1, rollingCPA: 44.0, rollingConversionRate: 0.019, spendVelocity: 1.08, sparklineData: [102, 100, 99, 98, 97, 95, 94], status: "active" },
];

export const ALL_CREATIVES: CreativeWithClient[] = [
  // ACME
  { id: "CRV-001", clientId: "acme", clientName: "ACME Corp", platform: "Google Ads", campaignName: "ACME_Q1_Conversão_Search", name: "Video_Promo_Q1", format: "Video 15s", angle: "Prova Social", emotion: "Confiança", offer: "Desconto 30%", cta: "Compre Agora", impressions: 450000, clicks: 12500, conversions: 380, ctr: 2.78, cvr: 3.04, cpa: 24, mbei: 118, momentum: "strong_positive", status: "scaling" },
  { id: "CRV-002", clientId: "acme", clientName: "ACME Corp", platform: "Meta Ads", campaignName: "ACME_Q1_Awareness_Video", name: "Static_Benefits", format: "Imagem 1080x1080", angle: "Benefícios", emotion: "Aspiração", offer: "Frete Grátis", cta: "Saiba Mais", impressions: 280000, clicks: 5600, conversions: 120, ctr: 2.0, cvr: 2.14, cpa: 38, mbei: 102, momentum: "neutral", status: "stable" },
  { id: "CRV-003", clientId: "acme", clientName: "ACME Corp", platform: "DV360", campaignName: "ACME_Q1_Retargeting", name: "Carousel_Products", format: "Carrossel", angle: "Variedade", emotion: "Curiosidade", offer: "Lançamento", cta: "Ver Mais", impressions: 180000, clicks: 2700, conversions: 45, ctr: 1.5, cvr: 1.67, cpa: 52, mbei: 78, momentum: "strong_negative", status: "saturating" },
  // Globex
  { id: "CRV-004", clientId: "globex", clientName: "Globex Industries", platform: "Google Ads", campaignName: "Globex_Brand_Search", name: "Video_UGC_Test", format: "Video 30s", angle: "UGC", emotion: "Autenticidade", offer: "Teste Grátis", cta: "Experimente", impressions: 95000, clicks: 3800, conversions: 95, ctr: 4.0, cvr: 2.5, cpa: 20, mbei: 125, momentum: "positive", status: "testing" },
  { id: "CRV-005", clientId: "globex", clientName: "Globex Industries", platform: "TikTok Ads", campaignName: "Globex_Video_Awareness", name: "TikTok_Dance_Ad", format: "Video 15s", angle: "Entretenimento", emotion: "Diversão", offer: "Branding", cta: "Siga", impressions: 620000, clicks: 18600, conversions: 210, ctr: 3.0, cvr: 1.13, cpa: 28, mbei: 110, momentum: "positive", status: "scaling" },
  // Initech
  { id: "CRV-006", clientId: "initech", clientName: "Initech Solutions", platform: "LinkedIn", campaignName: "Initech_LinkedIn_B2B", name: "Whitepaper_Lead", format: "Imagem 1200x627", angle: "Autoridade", emotion: "Confiança", offer: "Download Grátis", cta: "Baixar Agora", impressions: 45000, clicks: 900, conversions: 35, ctr: 2.0, cvr: 3.89, cpa: 65, mbei: 105, momentum: "positive", status: "stable" },
  { id: "CRV-007", clientId: "initech", clientName: "Initech Solutions", platform: "Google Ads", campaignName: "Initech_Performance_Max", name: "PMax_Auto_Creative", format: "Responsive", angle: "Performance", emotion: "Urgência", offer: "Demo Grátis", cta: "Agendar Demo", impressions: 150000, clicks: 3000, conversions: 42, ctr: 2.0, cvr: 1.4, cpa: 49, mbei: 88, momentum: "negative", status: "saturating" },
  // Umbrella
  { id: "CRV-008", clientId: "umbrella", clientName: "Umbrella Digital", platform: "Meta Ads", campaignName: "Umbrella_Meta_Conversão", name: "Stories_Promo", format: "Video 15s", angle: "Prova Social", emotion: "FOMO", offer: "50% Off", cta: "Compre Agora", impressions: 320000, clicks: 9600, conversions: 192, ctr: 3.0, cvr: 2.0, cpa: 44, mbei: 94, momentum: "negative", status: "stable" },
  { id: "CRV-009", clientId: "umbrella", clientName: "Umbrella Digital", platform: "DV360", campaignName: "Umbrella_Retargeting_DV", name: "Banner_Retargeting", format: "Imagem 728x90", angle: "Retargeting", emotion: "Lembrança", offer: "Volte e Ganhe", cta: "Aproveitar", impressions: 500000, clicks: 5000, conversions: 60, ctr: 1.0, cvr: 1.2, cpa: 58, mbei: 72, momentum: "strong_negative", status: "saturating" },
];

export function getClientsFromCampaigns(campaigns: CampaignWithClient[]): ClientData[] {
  const map = new Map<string, ClientData>();
  campaigns.forEach(c => map.set(c.clientId, { id: c.clientId, name: c.clientName }));
  return Array.from(map.values());
}

export function getPlatformsFromCampaigns(campaigns: CampaignWithClient[]): string[] {
  return [...new Set(campaigns.map(c => c.platform))];
}
