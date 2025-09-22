import { useState, useEffect, createContext, useContext } from 'react';
import { api, LoginResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: LoginResponse | null;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  changePassword: (userId: string, senha: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<LoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há token armazenado
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    try {
      setIsLoading(true);
      const response = await api.login(email, senha);
      
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      setUser(response);
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a), ${response.nome}!`,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const changePassword = async (userId: string, senha: string) => {
    try {
      await api.changePassword(userId, senha);
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro ao alterar senha",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    user,
    isLoading,
    login,
    logout,
    changePassword,
  };
}

export { AuthContext };