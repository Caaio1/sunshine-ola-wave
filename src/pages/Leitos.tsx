import { useState, useEffect, useCallback, useMemo } from "react";
import { Bed, Search, Building, Edit, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { leitosApi, unidadesApi, avaliacoesSessaoApi } from "@/lib/api";
import { normalizeList } from "@/lib/apiUtils";
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

export interface Leito {
  id: string;
  numero: string;
  unidadeId: string;
  unidade?: { nome: string };
  status: string;
  created_at: string;
}

interface Unidade {
  id: string;
  nome: string;
  hospital?: { nome: string };
}

export default function Leitos() {
  const navigate = useNavigate();
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroUnidade, setFiltroUnidade] = useState("todas");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [sessoesAtivas, setSessoesAtivas] = useState<any[]>([]);
  const { toast } = useToast();

  const carregarLeitos = useCallback(async () => {
    try {
      const response = await leitosApi.listar(
        filtroUnidade && filtroUnidade !== "todas" ? filtroUnidade : undefined
      );
      const raw = normalizeList(response);
      setLeitos(
        raw.map((l: any) => ({
          ...l,
          ocupado: ["ATIVO", "PENDENTE"].includes(
            ((l.status || "") as string).toUpperCase()
          ),
        }))
      );
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar leitos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [filtroUnidade, toast]);

  const carregarUnidades = useCallback(async () => {
    try {
      const response = await unidadesApi.listar();
      setUnidades(normalizeList(response));
    } catch (error) {
      console.error("Erro ao carregar unidades:", error);
    }
  }, []);

  const carregarSessoes = useCallback(async () => {
    try {
      const response = await avaliacoesSessaoApi.listarAtivas();
      setSessoesAtivas(normalizeList(response));
    } catch (error) {
      console.error("Erro ao carregar sessões:", error);
    }
  }, []);

  useEffect(() => {
    Promise.all([carregarUnidades(), carregarLeitos(), carregarSessoes()]);
  }, [carregarUnidades, carregarLeitos, carregarSessoes]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este leito?")) return;

    try {
      await leitosApi.excluir(id);
      toast({
        title: "Sucesso",
        description: "Leito excluído com sucesso",
      });
      carregarLeitos();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir leito",
        variant: "destructive",
      });
    }
  };

  const getLeitoStatus = (leito: Leito) => {
    const sessaoAtiva = sessoesAtivas.find(
      (s: any) => (s?.leito?.id || s?.leitoId) === leito.id
    );

    if (sessaoAtiva) {
      return {
        label: "Ocupado",
        variant: "default" as const,
        icon: <CheckCircle className="h-3 w-3" />,
        classificacao: sessaoAtiva.classificacao,
      };
    }

    switch (leito.status?.toUpperCase()) {
      case "VAGO":
        return {
          label: "Vago",
          variant: "secondary" as const,
          icon: <Bed className="h-3 w-3" />,
        };
      case "INATIVO":
        return {
          label: "Inativo",
          variant: "destructive" as const,
          icon: <AlertCircle className="h-3 w-3" />,
        };
      default:
        return {
          label: "Pendente",
          variant: "outline" as const,
          icon: <AlertCircle className="h-3 w-3" />,
        };
    }
  };

  const leitosFiltrados = leitos.filter((leito) => {
    const matchesSearch = leito.numero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnidade = 
      filtroUnidade === "todas" || leito.unidadeId === filtroUnidade;
    const status = getLeitoStatus(leito);
    const matchesStatus = 
      filtroStatus === "todos" ||
      (filtroStatus === "ocupado" && status.label === "Ocupado") ||
      (filtroStatus === "vago" && status.label === "Vago") ||
      (filtroStatus === "pendente" && status.label === "Pendente") ||
      (filtroStatus === "inativo" && status.label === "Inativo");
    
    return matchesSearch && matchesUnidade && matchesStatus;
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
            <h1 className="text-3xl font-bold">Leitos</h1>
            <p className="text-gray-600">Visualização geral dos leitos por unidade</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroUnidade} onValueChange={setFiltroUnidade}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por unidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as unidades</SelectItem>
                {unidades.map((unidade) => (
                  <SelectItem key={unidade.id} value={unidade.id}>
                    {unidade.nome}
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
                <SelectItem value="ocupado">Ocupados</SelectItem>
                <SelectItem value="vago">Vagos</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Leitos */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Leitos Encontrados ({leitosFiltrados.length})
            </h2>
          </div>

          {leitosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {leitos.length === 0
                  ? "Nenhum leito cadastrado"
                  : "Nenhum leito encontrado"}
              </h3>
              <p className="text-gray-600 mb-4">
                {leitos.length === 0
                  ? "Os leitos são criados automaticamente ao criar unidades"
                  : "Tente ajustar os filtros de busca"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leito</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leitosFiltrados
                  .sort((a, b) =>
                    a.numero.localeCompare(b.numero, undefined, {
                      numeric: true,
                      sensitivity: "base",
                    })
                  )
                  .map((leito) => {
                    const unidade = unidades.find((u) => u.id === leito.unidadeId);
                    const status = getLeitoStatus(leito);
                    const sessaoAtiva = sessoesAtivas.find(
                      (s: any) => (s?.leito?.id || s?.leitoId) === leito.id
                    );

                    return (
                      <TableRow key={leito.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Bed className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-semibold">Leito {leito.numero}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {unidade?.nome || leito.unidade?.nome || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {unidade?.hospital?.nome || "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center space-x-1">
                            {status.icon}
                            <span>{status.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {status.classificacao ? (
                            <span className="text-sm font-medium text-primary">
                              {status.classificacao}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex space-x-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/leitos/${leito.id}/editar`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(leito.id)}
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