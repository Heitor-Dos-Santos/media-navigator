import { createClient } from "jsr:@supabase/supabase-js@2";
import { checkQueryStatus, deleteQuery, buildUpsertRows, refreshAccessToken } from "../_shared/dv360.ts";

// Chamado repetidamente pelo frontend (a cada poucos segundos) até o relatório do DV360 ficar
// pronto. Cada chamada faz UMA verificação rápida, então nunca se aproxima do limite de
// execução da Edge Function.
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return Response.json({ error: "Não autorizado" }, { status: 401 });

    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authErr || !user) return Response.json({ error: "Token inválido" }, { status: 401 });

    const { account_id, query_id, report_id } = await req.json() as { account_id: string; query_id: string; report_id: string };
    if (!account_id || !query_id || !report_id) return Response.json({ error: "Parâmetros inválidos" }, { status: 400 });

    const { data: conn } = await supabase
      .from("platform_connections")
      .select("account_id, account_name, access_token, refresh_token, token_expires_at")
      .eq("user_id", user.id)
      .eq("platform", "dv360")
      .eq("account_id", account_id)
      .maybeSingle();

    if (!conn) return Response.json({ error: "Conexão não encontrada" }, { status: 404 });

    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET")!;

    let accessToken = conn.access_token;
    const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
    if (!accessToken || expiresAt < Date.now() + 60_000) {
      if (!conn.refresh_token) return Response.json({ done: true, error: "Sem refresh token — reconecte a conta." });
      const refreshed = await refreshAccessToken(conn.refresh_token, clientId, clientSecret);
      accessToken = refreshed.accessToken;
      await supabase
        .from("platform_connections")
        .update({ access_token: refreshed.accessToken, token_expires_at: refreshed.expiresAt })
        .eq("user_id", user.id).eq("platform", "dv360").eq("account_id", account_id);
    }

    const status = await checkQueryStatus(query_id, report_id, accessToken!);

    if (status.state === "running") {
      return Response.json({ done: false }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }
    if (status.state === "error") {
      return Response.json({ done: true, error: status.message }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    // status.state === "ready"
    const csvRes = await fetch(status.reportUrl);
    const csvText = await csvRes.text();
    const { rows, error: parseError } = buildUpsertRows(csvText, user.id, account_id, conn.account_name);

    deleteQuery(query_id, accessToken!);

    if (parseError) {
      return Response.json({ done: true, error: parseError }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    const { error: upsertError } = await supabase
      .from("funnel_daily_records")
      .upsert(rows, { onConflict: "user_id,platform,account_id,campaign_id,date,funnel_stage" });

    if (upsertError) {
      return Response.json({ done: true, error: upsertError.message }, { headers: { "Access-Control-Allow-Origin": "*" } });
    }

    return Response.json({ done: true, days: rows.length }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
