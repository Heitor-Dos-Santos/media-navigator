import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const { updatePassword, signOut } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // O link do email traz o token de recuperação na URL — o client do Supabase
    // processa isso automaticamente e cria uma sessão temporária ao carregar a página.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        await signOut();
        setDone(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">MediaHub</span>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          {checking && (
            <p className="text-sm text-muted-foreground text-center py-4">Verificando link...</p>
          )}

          {!checking && done && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">✅</div>
              <h2 className="text-lg font-semibold text-foreground">Senha atualizada!</h2>
              <p className="text-sm text-muted-foreground">
                Sua senha foi redefinida com sucesso. Entre com a nova senha.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-primary hover:underline mt-2"
              >
                Ir para o login
              </button>
            </div>
          )}

          {!checking && !done && !hasSession && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">⚠️</div>
              <h2 className="text-lg font-semibold text-foreground">Link inválido ou expirado</h2>
              <p className="text-sm text-muted-foreground">
                Solicite um novo link de recuperação de senha na tela de login.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-primary hover:underline mt-2"
              >
                Voltar para o login
              </button>
            </div>
          )}

          {!checking && !done && hasSession && (
            <>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Escolha uma nova senha</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Digite e confirme sua nova senha de acesso
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Nova senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Confirmar nova senha</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Aguarde..." : "Redefinir senha"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
