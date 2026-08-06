// Compartilhado entre as funções de sync (Meta, Google Ads, DV360) pra persistir o resultado
// por conta em platform_connections, em vez de só mostrar num modal transiente no frontend.

const AUTH_ERROR_PATTERNS = [
  "OAuthException", "401", "403", "invalid_grant", "invalid_client",
  "PERMISSION_DENIED", "AUTHENTICATION_ERROR", "AUTHORIZATION_ERROR", "UNAUTHENTICATED",
];

export function classifySyncError(message: string): "auth_error" | "failed" {
  const upper = (message ?? "").toUpperCase();
  return AUTH_ERROR_PATTERNS.some((p) => upper.includes(p.toUpperCase())) ? "auth_error" : "failed";
}

export async function updateSyncStatus(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string,
  platform: string,
  accountId: string,
  status: "ready" | "auth_error" | "failed",
  errorMessage: string | null,
): Promise<void> {
  const update: Record<string, unknown> = { sync_status: status, sync_error: errorMessage };
  // "no data"/erro não avançam last_synced_at — só um sync com dado real conta como "sincronizado".
  if (status === "ready" && !errorMessage) update.last_synced_at = new Date().toISOString();
  await supabase
    .from("platform_connections")
    .update(update)
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("account_id", accountId);
}
