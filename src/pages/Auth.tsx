import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = 'login' | 'change-password';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login, user, isLoading, changePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) return;
    
    setLoading(true);
    try {
      await login(email, senha);
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !novaSenha || novaSenha !== confirmaSenha) return;
    
    setLoading(true);
    try {
      await changePassword(user.id, novaSenha);
      setMode('login');
      setNovaSenha("");
      setConfirmaSenha("");
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Entrar no Sistema';
      case 'change-password':
        return 'Alterar Senha';
      default:
        return 'Autenticação';
    }
  };

  const getDescription = () => {
    switch (mode) {
      case 'login':
        return 'Digite suas credenciais para acessar o sistema';
      case 'change-password':
        return 'Digite sua nova senha para continuar';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{getTitle()}</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email || !senha}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          )}

          {mode === 'change-password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="novaSenha">Nova Senha</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  placeholder="••••••••"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmaSenha">Confirmar Nova Senha</Label>
                <Input
                  id="confirmaSenha"
                  type="password"
                  placeholder="••••••••"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                  required
                />
              </div>
              {novaSenha && confirmaSenha && novaSenha !== confirmaSenha && (
                <p className="text-sm text-destructive">As senhas não conferem</p>
              )}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !novaSenha || !confirmaSenha || novaSenha !== confirmaSenha}
              >
                {loading ? "Alterando..." : "Alterar Senha"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setMode('login')}
              >
                Voltar ao Login
              </Button>
            </form>
          )}

          {mode === 'login' && user?.mustChangePassword && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800 mb-2">
                É necessário alterar sua senha no primeiro acesso.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMode('change-password')}
              >
                Alterar Senha
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}