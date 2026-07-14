import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const META_OAUTH_VERSION = "v21.0";

interface MetaTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: { message?: string };
}

interface MetaAdAccount {
  id: string;
  name: string;
}

function redirectOrFallback(base: string, path: string): Response {
  try {
    return Response.redirect(new URL(path, base).toString(), 302);
  } catch {
    return new Response(
      "Sessão de conexão inválida ou expirada. Feche esta aba e clique em \"Conectar\" novamente a partir do MediaHub.",
      { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const oauthError = url.searchParams.get("error");
  const oauthErrorDescription = url.searchParams.get("error_description");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let redirectOrigin = "";
  let userId: string | null = null;

  if (state) {
    const { data: stateRow } = await supabase
      .from("oauth_states")
      .select("user_id, redirect_origin")
      .eq("state", state)
      .maybeSingle();

    if (stateRow) {
      userId = stateRow.user_id as string;
      redirectOrigin = stateRow.redirect_origin as string;
      await supabase.from("oauth_states").delete().eq("state", state);
    }
  }

  const base = redirectOrigin;

  if (oauthError || !code || !userId) {
    return redirectOrFallback(base, `/data-integrations?meta_error=${encodeURIComponent(
      oauthErrorDescription || oauthError || "invalid_state"
    )}`);
  }

  try {
    const appId = Deno.env.get("META_APP_ID")!;
    const appSecret = Deno.env.get("META_APP_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/meta-oauth-callback`;

    // Troca o code por um access token de curta duração
    const tokenUrl = new URL(`https://graph.facebook.com/${META_OAUTH_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", redirectUri);
    tokenUrl.searchParams.set("code", code);

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = (await tokenRes.json()) as MetaTokenResponse;

    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("Erro ao trocar code por token:", tokenData);
      return redirectOrFallback(base, "/data-integrations?meta_error=token_exchange_failed");
    }

    // Troca pelo token de longa duração (~60 dias)
    const longLivedUrl = new URL(`https://graph.facebook.com/${META_OAUTH_VERSION}/oauth/access_token`);
    longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
    longLivedUrl.searchParams.set("client_id", appId);
    longLivedUrl.searchParams.set("client_secret", appSecret);
    longLivedUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

    const longLivedRes = await fetch(longLivedUrl.toString());
    const longLivedData = (await longLivedRes.json()) as MetaTokenResponse;

    const accessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in ?? tokenData.expires_in;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    // Busca as contas de anuncio que esse usuario pode acessar
    const adAccountsRes = await fetch(
      `https://graph.facebook.com/${META_OAUTH_VERSION}/me/adaccounts?fields=id,name&access_token=${accessToken}`
    );
    const adAccountsData = (await adAccountsRes.json()) as { data?: MetaAdAccount[] };
    const adAccounts = adAccountsData.data ?? [];

    const rows = adAccounts.length > 0
      ? adAccounts.map((acc) => ({
          user_id: userId,
          platform: "meta_ads",
          account_id: acc.id,
          account_name: acc.name,
          access_token: accessToken,
          token_expires_at: expiresAt,
          scopes: tokenData.scope ?? null,
          status: "active",
        }))
      : [{
          user_id: userId,
          platform: "meta_ads",
          account_id: "pending",
          account_name: null,
          access_token: accessToken,
          token_expires_at: expiresAt,
          scopes: tokenData.scope ?? null,
          status: "active",
        }];

    const { error: upsertError } = await supabase
      .from("platform_connections")
      .upsert(rows, { onConflict: "user_id,platform,account_id" });

    if (upsertError) {
      console.error("Erro ao salvar platform_connections:", upsertError);
      return redirectOrFallback(base, "/data-integrations?meta_error=save_failed");
    }

    return redirectOrFallback(base, "/data-integrations?connected=meta_ads");
  } catch (e) {
    console.error("Erro em meta-oauth-callback:", e);
    return redirectOrFallback(base, "/data-integrations?meta_error=internal_error");
  }
});
