export const BID_MANAGER_API = "https://doubleclickbidmanager.googleapis.com/v2";

export function safeNum(v: unknown): number {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "0").replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}

export function parseDate(raw: string): string | null {
  const s = raw.trim();
  // Bid Manager CSV vem como AAAA/MM/DD
  const ymd = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (ymd) {
    const [, yyyy, mm, dd] = ymd;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  // Fallback pra MM/DD/AAAA, caso o formato mude
  const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdy) {
    const [, mm, dd, yyyy] = mdy;
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return null;
}

// Faz um parse simples de CSV (sem libs externas) — assume que não há vírgulas dentro de campos com aspas nas colunas que usamos.
export function parseCsv(text: string): string[][] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim()));
}

export async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json() as { access_token?: string; expires_in?: number; error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Falha ao renovar token");
  }
  return { accessToken: data.access_token, expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000).toISOString() };
}

export async function createAndRunQuery(advertiserId: string, accessToken: string): Promise<{ queryId: string; reportId: string }> {
  const createRes = await fetch(`${BID_MANAGER_API}/queries`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      metadata: {
        title: `MediaHub sync ${advertiserId} ${Date.now()}`,
        dataRange: { range: "LAST_90_DAYS" },
        format: "CSV",
      },
      params: {
        type: "STANDARD",
        // FILTER_ADVERTISER_CURRENCY é exigido pelo Bid Manager sempre que se usa uma métrica de custo/moeda.
        // FILTER_CAMPAIGN(_NAME) e FILTER_LINE_ITEM_TYPE dão o detalhamento por campanha/estágio de funil.
        groupBys: ["FILTER_DATE", "FILTER_ADVERTISER_CURRENCY", "FILTER_CAMPAIGN", "FILTER_CAMPAIGN_NAME", "FILTER_LINE_ITEM_TYPE"],
        filters: [{ type: "FILTER_ADVERTISER", value: advertiserId }],
        metrics: ["METRIC_IMPRESSIONS", "METRIC_CLICKS", "METRIC_MEDIA_COST_ADVERTISER", "METRIC_TOTAL_CONVERSIONS", "METRIC_REVENUE_ADVERTISER"],
      },
      schedule: { frequency: "ONE_TIME" },
    }),
  });
  const createData = await createRes.json() as { queryId?: string; error?: { message?: string } };
  if (!createRes.ok || !createData.queryId) {
    throw new Error(`[${createRes.status}] Falha ao criar query: ${createData.error?.message || JSON.stringify(createData)}`);
  }
  const queryId = createData.queryId;

  const runRes = await fetch(`${BID_MANAGER_API}/queries/${queryId}:run`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ dataRange: { range: "LAST_90_DAYS" } }),
  });
  const runData = await runRes.json().catch(() => ({})) as { key?: { reportId?: string } };
  if (!runRes.ok || !runData.key?.reportId) {
    throw new Error(`[${runRes.status}] Falha ao rodar query: ${JSON.stringify(runData)}`);
  }

  return { queryId, reportId: runData.key.reportId };
}

export type QueryStatus =
  | { state: "running" }
  | { state: "ready"; reportUrl: string }
  | { state: "error"; message: string };

export async function checkQueryStatus(queryId: string, reportId: string, accessToken: string): Promise<QueryStatus> {
  // O status de execução fica no sub-recurso "reports", não no objeto da query em si.
  const statusRes = await fetch(`${BID_MANAGER_API}/queries/${queryId}/reports/${reportId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!statusRes.ok) {
    const err = await statusRes.json().catch(() => ({}));
    return { state: "error", message: `[${statusRes.status}] ${JSON.stringify(err)}` };
  }
  const statusData = await statusRes.json() as {
    metadata?: { status?: { state?: string }; googleCloudStoragePath?: string };
  };
  const state = statusData.metadata?.status?.state;
  if (state === "DONE" && statusData.metadata?.googleCloudStoragePath) {
    return { state: "ready", reportUrl: statusData.metadata.googleCloudStoragePath };
  }
  if (state === "FAILED") {
    return { state: "error", message: "O DV360 falhou ao gerar o relatório." };
  }
  return { state: "running" };
}

export async function deleteQuery(queryId: string, accessToken: string): Promise<void> {
  await fetch(`${BID_MANAGER_API}/queries/${queryId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => {});
}

type Agg = { investimento: number; alcance: number; impressoes: number; conversoes: number; receita: number; clicks: number; count: number };
const newAgg = (): Agg => ({ investimento: 0, alcance: 0, impressoes: 0, conversoes: 0, receita: 0, clicks: 0, count: 0 });

// Converte o CSV do relatório em linhas de funnel_daily_records — nível de conta (agregado)
// e nível de campanha (a unidade que o Bid Manager chama de "Insertion Order" no CSV — é o
// equivalente prático a "campanha" no DV360). Sem um sinal confiável de formato/intenção por
// campanha (o "Line Item Type" retornado é o método de compra, tipo "Real-time bidding", não
// Display/Vídeo/etc.), aplicamos o mesmo critério do nível de conta: topo todo dia com
// investimento, fundo nos dias em que aquela campanha teve conversão ou receita.
export function buildUpsertRows(csvText: string, userId: string, accountId: string, accountName: string | null): { rows: Record<string, unknown>[]; error?: string } {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return { rows: [], error: "Relatório vazio nos últimos 90 dias." };

  const header = rows[0].map((h) => h.toLowerCase());
  const dateIdx = header.findIndex((h) => h.includes("date"));
  const impIdx = header.findIndex((h) => h.includes("impression"));
  const clickIdx = header.findIndex((h) => h.includes("click"));
  const costIdx = header.findIndex((h) => h.includes("cost"));
  const convIdx = header.findIndex((h) => h.includes("conversion"));
  const revIdx = header.findIndex((h) => h.includes("revenue"));
  // O Bid Manager rotula essa dimensão como "Insertion Order" no CSV, mesmo pedindo FILTER_CAMPAIGN na query.
  const campIdIdx = header.findIndex((h) => (h.includes("insertion order") || h.includes("campaign")) && h.includes("id"));
  const campNameIdx = header.findIndex((h) => (h.includes("insertion order") || h.includes("campaign")) && !h.includes("id"));
  const lineTypeIdx = header.findIndex((h) => h.includes("line item type"));

  if (dateIdx === -1 || impIdx === -1) {
    return { rows: [], error: `Formato de relatório inesperado. Cabeçalho: ${rows[0].join(" | ")}` };
  }

  type ParsedRow = {
    date: string; impressions: number; clicks: number; cost: number; conversions: number; revenue: number;
    campaignId: string; campaignName: string; lineItemType: string;
  };
  const dataRows: ParsedRow[] = [];
  for (const row of rows.slice(1)) {
    const date = parseDate(row[dateIdx] ?? "");
    if (!date) continue; // fim dos dados / linhas de rodapé do relatório
    dataRows.push({
      date,
      impressions: safeNum(row[impIdx]),
      clicks: clickIdx >= 0 ? safeNum(row[clickIdx]) : 0,
      cost: costIdx >= 0 ? safeNum(row[costIdx]) : 0,
      conversions: convIdx >= 0 ? safeNum(row[convIdx]) : 0,
      revenue: revIdx >= 0 ? safeNum(row[revIdx]) : 0,
      campaignId: campIdIdx >= 0 ? (row[campIdIdx] ?? "") : "",
      campaignName: campNameIdx >= 0 ? (row[campNameIdx] ?? "") : "",
      lineItemType: lineTypeIdx >= 0 ? (row[lineTypeIdx] ?? "") : "",
    });
  }
  if (dataRows.length === 0) return { rows: [], error: "Sem dados nos últimos 90 dias." };

  // ── Nível de conta (agrega tudo por dia) ──
  const byDateStage: Record<string, Agg> = {};
  // ── Nível de campanha (por campanha + dia — topo com investimento, fundo nos dias com conversão/receita) ──
  type CampAgg = Agg & { campaign_id: string; campaign_name: string; lineItemType: string };
  const byCampDateStage: Record<string, CampAgg> = {};

  for (const d of dataRows) {
    const tk = `${d.date}__topo`;
    if (!byDateStage[tk]) byDateStage[tk] = newAgg();
    const t = byDateStage[tk];
    t.investimento += d.cost; t.alcance += d.impressions; t.impressoes += d.impressions; t.clicks += d.clicks; t.count++;

    if (d.conversions > 0 || d.revenue > 0) {
      const fk = `${d.date}__fundo`;
      if (!byDateStage[fk]) byDateStage[fk] = newAgg();
      const f = byDateStage[fk];
      f.conversoes += d.conversions; f.receita += d.revenue; f.count++;
    }

    if (d.campaignId) {
      const cTopoKey = `${d.campaignId}__${d.date}__topo`;
      if (!byCampDateStage[cTopoKey]) byCampDateStage[cTopoKey] = { campaign_id: d.campaignId, campaign_name: d.campaignName, lineItemType: d.lineItemType, ...newAgg() };
      const cTopo = byCampDateStage[cTopoKey];
      cTopo.investimento += d.cost; cTopo.alcance += d.impressions; cTopo.impressoes += d.impressions; cTopo.clicks += d.clicks; cTopo.count++;

      if (d.conversions > 0 || d.revenue > 0) {
        const cFundoKey = `${d.campaignId}__${d.date}__fundo`;
        if (!byCampDateStage[cFundoKey]) byCampDateStage[cFundoKey] = { campaign_id: d.campaignId, campaign_name: d.campaignName, lineItemType: d.lineItemType, ...newAgg() };
        const cFundo = byCampDateStage[cFundoKey];
        cFundo.conversoes += d.conversions; cFundo.receita += d.revenue; cFundo.count++;
      }
    }
  }

  const upsertRows: Record<string, unknown>[] = [];

  for (const [key, g] of Object.entries(byDateStage)) {
    const [date, stage] = key.split("__");
    upsertRows.push({
      user_id: userId, platform: "dv360", account_id: accountId, account_name: accountName,
      campaign_id: "", campaign_name: null, objective: null,
      date, funnel_stage: stage,
      investimento: g.investimento,
      // DV360 não expõe "alcance" (reach) diário — usamos impressões como proxy, igual fizemos no Google Ads.
      alcance: g.alcance, frequencia: 0, impressoes: g.impressoes,
      conversoes: g.conversoes, receita: g.receita,
      conv_1d_click: 0, conv_7d_click: 0, conv_1d_view: 0, conv_7d_view: 0,
      ctr: g.alcance > 0 ? (g.clicks / g.alcance) * 100 : 0,
      cpm: g.alcance > 0 ? (g.investimento / g.alcance) * 1000 : 0,
      cpc: g.clicks > 0 ? g.investimento / g.clicks : 0,
      unique_clicks: g.clicks, unique_ctr: g.alcance > 0 ? (g.clicks / g.alcance) * 100 : 0,
      synced_at: new Date().toISOString(),
    });
  }

  for (const [key, g] of Object.entries(byCampDateStage)) {
    const [, date, stage] = key.split("__");
    upsertRows.push({
      user_id: userId, platform: "dv360", account_id: accountId, account_name: accountName,
      campaign_id: g.campaign_id, campaign_name: g.campaign_name || g.campaign_id, objective: g.lineItemType,
      date, funnel_stage: stage,
      investimento: g.investimento,
      alcance: g.alcance, frequencia: 0, impressoes: g.impressoes,
      conversoes: g.conversoes, receita: g.receita,
      conv_1d_click: 0, conv_7d_click: 0, conv_1d_view: 0, conv_7d_view: 0,
      ctr: g.alcance > 0 ? (g.clicks / g.alcance) * 100 : 0,
      cpm: g.alcance > 0 ? (g.investimento / g.alcance) * 1000 : 0,
      cpc: g.clicks > 0 ? g.investimento / g.clicks : 0,
      unique_clicks: g.clicks, unique_ctr: g.alcance > 0 ? (g.clicks / g.alcance) * 100 : 0,
      synced_at: new Date().toISOString(),
    });
  }

  return { rows: upsertRows };
}
