import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ready, setReady] = useState(false);
  const [exchangeError, setExchangeError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");

    async function init() {
      // PKCE flow: exchange the code in the URL for a session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setExchangeError(
            "Link inválido ou expirado. Solicite uma nova recuperação de senha."
          );
          setReady(true);
          return;
        }
        setReady(true);
        return;
      }

      // Fallback: implicit flow (#access_token) or existing session
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setReady(true);
      } else {
        setExchangeError(
          "Link inválido ou expirado. Solicite uma nova recuperação de senha."
        );
        setReady(true);
      }
    }

    init();
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(async () => {
      await supabase.auth.signOut();
      navigate("/login");
    }, 2000);
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
          <div>
            <h1 className="text-xl font-semibold text-foreground">Definir nova senha</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Escolha uma nova senha para sua conta.
            </p>
          </div>

          {!ready && (
            <p className="text-sm text-muted-foreground">Validando link...</p>
          )}

          {ready && exchangeError && (
            <div className="space-y-3">
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                {exchangeError}
              </p>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Voltar para o login
              </Button>
            </div>
          )}

          {ready && !exchangeError && success && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">✅</div>
              <h2 className="text-lg font-semibold text-foreground">Senha atualizada</h2>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o login...
              </p>
            </div>
          )}

          {ready && !exchangeError && !success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nova senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirmar senha</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
                {loading ? "Salvando..." : "Salvar nova senha"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
