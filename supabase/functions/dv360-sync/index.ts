import { createClient } from "jsr:@supabase/supabase-js@2";
import { createAndRunQuery, refreshAccessToken } from "../_shared/dv360.ts";
import { classifySyncError, updateSyncStatus } from "../_shared/syncStatus.ts";
import { resolveUserId } from "../_shared/internalAuth.ts";

// Só cria e dispara os relatórios (rápido) — o resultado é buscado depois via dv360-sync-poll,
// porque a geração do relatório no DV360 é assíncrona e pode levar bem mais que o limite de
// execução de uma Edge Function (~75s neste projeto).
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json() as { account_ids: string[]; _internal_user_id?: string };
    const auth = await resolveUserId(req, supabase, body);
    if ("errorResponse" in auth) return auth.errorResponse;
    const { userId } = auth;

    const { account_ids } = body;
    if (!account_ids?.length) return Response.json({ error: "Nenhuma conta selecionada" }, { status: 400 });

    const { data: connections } = await supabase
      .from("platform_connections")
      .select("account_id, access_token, refresh_token, token_expires_at")
      .eq("user_id", userId)
      .eq("platform", "dv360")
      .eq("is_selected", true)
      .in("account_id", account_ids);

    if (!connections?.length) return Response.json({ error: "Conexões não encontradas" }, { status: 404 });

    const clientId = Deno.env.get("GOOGLE_ADS_CLIENT_ID")!;
    const clientSecret = Deno.env.get("GOOGLE_ADS_CLIENT_SECRET")!;

    const jobs: { account_id: string; query_id?: string; report_id?: string; error?: string }[] = [];

    for (const conn of connections) {
      try {
        if (!conn.refresh_token) {
          const msg = "Sem refresh token — reconecte a conta.";
          jobs.push({ account_id: conn.account_id, error: msg });
          await updateSyncStatus(supabase, userId, "dv360", conn.account_id, "auth_error", msg);
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
            .eq("user_id", userId).eq("platform", "dv360").eq("account_id", conn.account_id);
        }

        const { queryId, reportId } = await createAndRunQuery(conn.account_id, accessToken!);
        jobs.push({ account_id: conn.account_id, query_id: queryId, report_id: reportId });
        // Relatório iniciado — dv360-sync-poll é quem grava o resultado final (ready/failed)
        // quando o polling do frontend resolver.
        await supabase.from("platform_connections")
          .update({ sync_status: "syncing", sync_error: null })
          .eq("user_id", userId).eq("platform", "dv360").eq("account_id", conn.account_id);
      } catch (e) {
        const msg = String(e);
        jobs.push({ account_id: conn.account_id, error: msg });
        await updateSyncStatus(supabase, userId, "dv360", conn.account_id, classifySyncError(msg), msg);
      }
    }

    return Response.json({ ok: true, jobs }, { headers: { "Access-Control-Allow-Origin": "*" } });
  } catch (e) {
    return Response.json({ error: String(e) }, { status: 500, headers: { "Access-Control-Allow-Origin": "*" } });
  }
});
