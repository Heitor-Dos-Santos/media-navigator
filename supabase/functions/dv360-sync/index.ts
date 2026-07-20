import { createClient } from "jsr:@supabase/supabase-js@2";
import { createAndRunQuery, refreshAccessToken } from "../_shared/dv360.ts";

// Só cria e dispara os relatórios (rápido) — o resultado é buscado depois via dv360-sync-poll,
// porque a geração do relatório no DV360 é assíncrona e pode levar bem mais que o limite de
// execução de uma Edge Function (~75s neste projeto).
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

    const { account_ids } = await req.json() as { account_ids: string[] };
    if (!account_ids?.length) return Response.json({ error: "Nenhuma conta selecionada" }, { status: 400 });

    const { data: connections } = await supabase
      .from("platform_connections")
      .select("account_id, access_token, refresh_token, token_expires_at")
      .eq("user_id", user.id)
      .eq("platform", "dv360")
      .in("account_id", account_ids);

    if (!connections?.length) return Response.json({ error: "Conexões não encontradas" }, { status: 404 });

    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET")!;

    const jobs: { account_id: string; query_id?: string; report_id?: string; error?: string }[] = [];

    for (const conn of connections) {
      try {
        if (!conn.refresh_token) {
          jobs.push({ account_id: conn.account_id, error: "Sem refresh token — reconecte a conta." });
          continue;
        }

        let accessToken = conn.access_token;
        const expiresAt = conn.token_expires_at ? new Date(conn.token_expires_at).getTime() : 0;
        if (!accessToken || expiresAt < Date.now() + 60_000) {
          const refreshed = await refreshAccessToken(conn.refresh_token, clientId, clientSecret);
          accessToken = refreshed.accessToken;
          await supabase
            .from("platform_connections")
            .update({ access_token: refreshed.accessToken, token_expires_at: refreshed.expiresAt })
            .eq("user_id", user.id).eq("platform", "dv360").eq("account_id", conn.account_id);
        }

        const { queryId, reportId } = await createAndRunQuery(conn.account_id, accessToken!);
        jobs.push({ account_id: conn.account_id, query_id: queryId, report_id: reportId });
      } catch (e) {
        jobs.push({ account_id: conn.account_id, error: String(e) });
      }
    }

    return Response.json({ ok: true, jobs }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
