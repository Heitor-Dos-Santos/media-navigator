import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Resolve o usuário da requisição de duas formas: (1) fluxo normal, um usuário logado manda seu
// próprio JWT; (2) fluxo interno, o sync-worker (rodando via pg_cron, sem sessão de usuário) manda
// a service role key como Bearer + o user_id explícito no corpo. Só quem já tem a service role key
// consegue usar o caminho (2), então não há elevação de privilégio por aí.
export async function resolveUserId(
  req: Request,
  supabase: SupabaseClient,
  body: Record<string, unknown>,
): Promise<{ userId: string } | { errorResponse: Response }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { errorResponse: Response.json({ error: "Não autorizado" }, { status: 401 }) };

  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (token === serviceRoleKey) {
    const internalUserId = body._internal_user_id;
    if (typeof internalUserId === "string" && internalUserId) {
      return { userId: internalUserId };
    }
    return { errorResponse: Response.json({ error: "_internal_user_id obrigatório" }, { status: 400 }) };
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return { errorResponse: Response.json({ error: "Token inválido" }, { status: 401 }) };
  return { userId: user.id };
}
