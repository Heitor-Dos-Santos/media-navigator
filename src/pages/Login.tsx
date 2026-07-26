import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Email not confirmed"))
            setError("Confirme seu email antes de entrar. Verifique sua caixa de entrada.");
          else if (error.message.includes("Invalid login credentials"))
            setError("Email ou senha incorretos.");
          else
            setError(error.message);
        } else {
          navigate("/");
        }
      } else if (mode === "signup") {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setEmailSent(true);
        }
      } else {
        // forgot password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          setError(error.message);
        } else {
          setInfo(
            "Se este email estiver cadastrado, você receberá um link para redefinir sua senha em instantes."
          );
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">MediaHub</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
          {emailSent && (
            <div className="text-center space-y-3 py-4">
              <div className="text-4xl">📧</div>
              <h2 className="text-lg font-semibold text-foreground">Verifique seu email</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação para <span className="text-foreground font-medium">{email}</span>.
                <br />Clique no link para ativar sua conta e entrar.
              </p>
              <button
                onClick={() => { setEmailSent(false); setMode("login"); }}
                className="text-sm text-primary hover:underline mt-2"
              >
                Voltar para o login
              </button>
            </div>
          )}
          {!emailSent && (
            <>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {mode === "login"
                    ? "Entrar na plataforma"
                    : mode === "signup"
                    ? "Criar conta"
                    : "Recuperar senha"}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {mode === "login"
                    ? "Acesse com seu email e senha"
                    : mode === "signup"
                    ? "Preencha os dados para começar"
                    : "Informe seu email para receber o link de redefinição"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Nome</label>
                    <Input
                      placeholder="Seu nome"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground">Senha</label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => { setMode("forgot"); setError(""); setInfo(""); }}
                          className="text-xs text-primary hover:underline"
                        >
                          Esqueci minha senha
                        </button>
                      )}
                    </div>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                )}
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
                {info && (
                  <p className="text-sm text-foreground bg-primary/10 px-3 py-2 rounded-lg">
                    {info}
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading
                    ? "Aguarde..."
                    : mode === "login"
                    ? "Entrar"
                    : mode === "signup"
                    ? "Criar conta"
                    : "Enviar link de recuperação"}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                {mode === "login" && (
                  <>
                    Não tem conta?{" "}
                    <button
                      onClick={() => { setMode("signup"); setError(""); setInfo(""); }}
                      className="text-primary hover:underline font-medium"
                    >
                      Criar conta
                    </button>
                  </>
                )}
                {mode === "signup" && (
                  <>
                    Já tem conta?{" "}
                    <button
                      onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                      className="text-primary hover:underline font-medium"
                    >
                      Entrar
                    </button>
                  </>
                )}
                {mode === "forgot" && (
                  <button
                    onClick={() => { setMode("login"); setError(""); setInfo(""); }}
                    className="text-primary hover:underline font-medium"
                  >
                    Voltar para o login
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
