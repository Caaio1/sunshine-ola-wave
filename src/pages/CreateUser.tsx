import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Cargo {
  id: string;
  nome: string;
}

export default function CreateUser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [cargoId, setCargoId] = useState<string | undefined>(undefined);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCargos, setLoadingCargos] = useState(true);
  const [errorCargos, setErrorCargos] = useState<string | null>(null);

  useEffect(() => {
    const fetchCargos = async () => {
      if (user && user.hospital && user.hospital.id) {
        try {
          setLoadingCargos(true);
          // Assuming there's an API call to get cargos for a hospital
          // If not, we might need to adjust the backend or fetch all cargos
          const fetchedCargos = await api.getCargosByHospital(user.hospital.id); // This method doesn't exist yet, will need to add to api.ts
          setCargos(fetchedCargos);
        } catch (error) {
          console.error("Erro ao buscar cargos:", error);
          setErrorCargos("Não foi possível carregar os cargos.");
        } finally {
          setLoadingCargos(false);
        }
      } else {
        setLoadingCargos(false);
        setErrorCargos("Hospital ID não disponível para buscar cargos.");
      }
    };
    fetchCargos();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.hospital?.id) {
      toast({
        title: "Erro",
        description: "Hospital ID não disponível.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await api.createColaborador({
        hospitalId: user.hospital.id,
        nome,
        email,
        cpf,
        cargo: cargoId,
      });
      toast({
        title: "Sucesso",
        description: "Colaborador criado com sucesso.",
      });
      navigate("/users"); // Navigate back to the users list
    } catch (error) {
      console.error("Erro ao criar colaborador:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar colaborador.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Adicionar Colaborador</h1>
        <p className="text-muted-foreground">
          Preencha os dados para cadastrar um novo colaborador.
        </p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Dados do Colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Select value={cargoId} onValueChange={setCargoId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCargos && <SelectItem value="loading" disabled>Carregando cargos...</SelectItem>}
                  {errorCargos && <SelectItem value="error" disabled>{errorCargos}</SelectItem>}
                  {!loadingCargos && !errorCargos && cargos.map((cargo) => (
                    <SelectItem key={cargo.id} value={cargo.id}>
                      {cargo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Colaborador"}
            </Button>
            <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/users")}>
              Cancelar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}