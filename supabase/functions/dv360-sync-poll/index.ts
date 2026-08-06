import { createClient } from "jsr:@supabase/supabase-js@2";
import { checkQueryStatus, deleteQuery, buildUpsertRows, refreshAccessToken } from "../_shared/dv360.ts";
import { classifySyncError, updateSyncStatus } from "../_shared/syncStatus.ts";
import { resolveUserId } from "../_shared/internalAuth.ts";

// Chamado repetidamente pelo frontend (a cada poucos segundos) até o relatório do DV360 ficar
// pronto. Cada chamada faz UMA verificação rápida, então nunca se aproxima do limite de
// execução da Edge Function.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json() as { account_id: string; query_id: string; report_id: string; _internal_user_id?: string };
    const auth = await resolveUserId(req, supabase, body);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { userId } = auth;

    const { account_id, query_id, report_id } = body;
    if (!account_id || !query_id || !report_id) return Response.json({ error: "Parâmetros inválidos" }, { status: 400 });

    const { data: conn } = await supabase
      .from("platform_connections")
      .select("account_id, account_name, access_token, refresh_token, token_expires_at")
      .eq("user_id", userId)
      .eq("platform", "dv360")
      .eq("account_id", account_id)
      .maybeSingle();

    if (!conn) return Response.json({ error: "Conexão não encontrada" }, { status: 404 });

    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET")!;

    let accessToken = conn.access_token;
    const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
    if (!accessToken || expiresAt < Date.now() + 60_000) {
      if (!conn.refresh_token) {
        const msg = "Sem refresh token — reconecte a conta.";
        await updateSyncStatus(supabase, userId, "dv360", account_id, "auth_error", msg);
        return Response.json({ done: true, error: msg });
      }
      const refreshed = await refreshAccessToken(conn.refresh_token, clientId, clientSecret);
      accessToken = refreshed.accessToken;
      await supabase
        .from("platform_connections")
        .update({ access_token: refreshed.accessToken, token_expires_at: refreshed.expiresAt })
        .eq("user_id", userId).eq("platform", "dv360").eq("account_id", account_id);
    }

    const status = await checkQueryStatus(query_id, report_id, accessToken!);

    if (status.state === "running") {
      return Response.json({ done: false }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }
    if (status.state === "error") {
      await updateSyncStatus(supabase, userId, "dv360", account_id, classifySyncError(status.message), status.message);
      return Response.json({ done: true, error: status.message }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // status.state === "ready"
    const csvRes = await fetch(status.reportUrl);
    const csvText = await csvRes.text();
    const { rows, error: parseError } = buildUpsertRows(csvText, userId, account_id, conn.account_name);

    deleteQuery(query_id, accessToken!);

    if (parseError) {
      // "sem dados" não é erro de sync — a consulta funcionou, só não tinha nada no período.
      await updateSyncStatus(supabase, userId, "dv360", account_id, "ready", null);
      return Response.json({ done: true, error: parseError }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const { error: upsertError } = await supabase
      .from("funnel_daily_records")
      .upsert(rows, { onConflict: "user_id,platform,account_id,campaign_id,date,funnel_stage" });

    if (upsertError) {
      await updateSyncStatus(supabase, userId, "dv360", account_id, "failed", upsertError.message);
      return Response.json({ done: true, error: upsertError.message }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    await updateSyncStatus(supabase, userId, "dv360", account_id, "ready", null);
    return Response.json({ done: true, days: rows.length }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
