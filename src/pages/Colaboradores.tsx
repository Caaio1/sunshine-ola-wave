import { useState, useEffect } from "react";
import { Plus, Users, Search, Edit, Trash2, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { colaboradoresApi, unidadesApi, hospitaisApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  cargo: "ENF" | "TEC" | "SUP";
  ativo: boolean;
  unidadeId: string;
  unidade?: { nome: string };
  hospitalId?: string;
  hospital?: { id: string; nome: string };
  created_at: string;
}

interface Unidade {
  id: string;
  nome: string;
  hospitalId?: string;
  hospital?: { id: string; nome: string };
}

interface Hospital {
  id: string;
  nome: string;
}

export default function Colaboradores() {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroHospital, setFiltroHospital] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const { toast } = useToast();

  const cargoOptions = [
    { value: "ENF", label: "Enfermeiro(a)" },
    { value: "TEC", label: "Técnico(a) de Enfermagem" },
    { value: "SUP", label: "Supervisor(a)" },
  ];

  useEffect(() => {
    const carregar = async () => {
      try {
        await Promise.all([
          carregarColaboradores(),
          carregarUnidades(),
          carregarHospitais(),
        ]);
      } catch (err) {
        console.error("Erro inicial:", err);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados iniciais",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const carregarColaboradores = async () => {
    try {
      const response = await colaboradoresApi.listar();
      let lista: Colaborador[] = [];

      if (Array.isArray(response)) {
        lista = response as Colaborador[];
      } else if (response && typeof response === "object") {
        const dataPart = (response as Record<string, unknown>)["data"];
        if (Array.isArray(dataPart)) lista = dataPart as Colaborador[];
      }

      setColaboradores(lista);
    } catch (error) {
      console.error("Erro ao carregar colaboradores:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar colaboradores",
        variant: "destructive",
      });
    }
  };

  const carregarUnidades = async () => {
    try {
      const response = await unidadesApi.listar();
      let lista: Unidade[] = [];

      if (Array.isArray(response)) {
        lista = response as Unidade[];
      } else if (response && typeof response === "object") {
        const dataPart = (response as Record<string, unknown>)["data"];
        if (Array.isArray(dataPart)) lista = dataPart as Unidade[];
      }

      setUnidades(lista);
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  };

  const carregarHospitais = async () => {
    try {
      const response = await hospitaisApi.listar();
      let lista: Hospital[] = [];
      if (Array.isArray(response)) lista = response as Hospital[];
      else if (response && typeof response === "object") {
        const dataPart = (response as Record<string, unknown>)["data"];
        if (Array.isArray(dataPart)) lista = dataPart as Hospital[];
      }
      setHospitais(lista);
    } catch (error) {
      console.error("Erro ao carregar hospitais:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este colaborador?")) return;

    try {
      await colaboradoresApi.excluir(id);
      toast({
        title: "Sucesso",
        description: "Colaborador excluído com sucesso",
      });
      carregarColaboradores();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Erro",
        description: message || "Erro ao excluir colaborador",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (colaborador: Colaborador) => {
    try {
      await colaboradoresApi.atualizar(colaborador.id, {
        ativo: !colaborador.ativo,
      });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso",
      });
      carregarColaboradores();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Erro",
        description: message || "Erro ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const matchesSearch = colaborador.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = 
      filtroHospital === "todos" || 
      colaborador.hospitalId === filtroHospital ||
      colaborador.hospital?.id === filtroHospital;
    const matchesStatus = 
      filtroStatus === "todos" ||
      (filtroStatus === "ativo" && colaborador.ativo) ||
      (filtroStatus === "inativo" && !colaborador.ativo);
    
    return matchesSearch && matchesHospital && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Colaboradores</h1>
            <p className="text-gray-600">Gerencie o cadastro de colaboradores</p>
          </div>
          <Button onClick={() => navigate("/colaboradores/novo")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Colaborador
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroHospital} onValueChange={setFiltroHospital}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por hospital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os hospitais</SelectItem>
                {hospitais.map((h) => (
                  <SelectItem key={h.id} value={h.id}>
                    {h.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="ativo">Apenas ativos</SelectItem>
                <SelectItem value="inativo">Apenas inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Colaboradores */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Colaboradores Encontrados ({colaboradoresFiltrados.length})
            </h2>
          </div>

          {colaboradoresFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {colaboradores.length === 0
                  ? "Nenhum colaborador cadastrado"
                  : "Nenhum colaborador encontrado"}
              </h3>
              <p className="text-gray-600 mb-4">
                {colaboradores.length === 0
                  ? "Comece criando o primeiro colaborador"
                  : "Tente ajustar os filtros de busca"}
              </p>
              <Button onClick={() => navigate("/colaboradores/novo")}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Colaborador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradoresFiltrados.map((colaborador) => {
                  const unidade = unidades.find((u) => u.id === colaborador.unidadeId);
                  const hospital = hospitais.find(
                    (h) => h.id === colaborador.hospitalId || h.id === colaborador.hospital?.id
                  );
                  
                  return (
                    <TableRow key={colaborador.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Users className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-semibold">{colaborador.nome}</div>
                            <div className="text-sm text-gray-500">{colaborador.cpf}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {cargoOptions.find((c) => c.value === colaborador.cargo)?.label || colaborador.cargo}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {unidade?.nome || colaborador.unidade?.nome || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {hospital?.nome || colaborador.hospital?.nome || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={colaborador.ativo}
                            onCheckedChange={() => toggleStatus(colaborador)}
                          />
                          <span className={`text-sm ${colaborador.ativo ? 'text-green-600' : 'text-gray-500'}`}>
                            {colaborador.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/colaboradores/${colaborador.id}/editar`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(colaborador.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}