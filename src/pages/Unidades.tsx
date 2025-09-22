import { useState, useEffect, useCallback } from "react";
import { Plus, Building, Bed, Edit, Trash2, Search } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { unidadesApi, hospitaisApi, metodosScpApi } from "@/lib/api";
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

interface Unidade {
  id: string;
  nome: string;
  numeroLeitos: number;
  scp: string;
  scpMetodoKey?: string | null;
  hospitalId?: string;
  hospital?: { id?: string; nome: string };
}

interface Hospital {
  id: string;
  nome: string;
  scpMetodo?: { id?: string; key: string; title?: string };
}

interface MetodoScp {
  id: string;
  key: string;
  title: string;
}

export default function Unidades() {
  const navigate = useNavigate();
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroHospital, setFiltroHospital] = useState("todos");
  const { toast } = useToast();

  const asArray = <T,>(r: unknown): T[] =>
    Array.isArray(r) ? (r as T[]) : (r as { data?: T[] })?.data ?? [];

  const carregarUnidades = useCallback(async () => {
    try {
      const response = await unidadesApi.listar();
      const lista = asArray<Unidade>(response).map((u) => {
        const anyU = u as unknown as Record<string, unknown>;
        const rawLeitos = anyU["leitos"] as unknown;
        const leitosArr = Array.isArray(rawLeitos) ? rawLeitos : [];
        return {
          ...(u as object),
          numeroLeitos:
            (anyU.numeroLeitos as number | undefined) ??
            (anyU.numero_leitos as number | undefined) ??
            (anyU.leitosCount as number | undefined) ??
            leitosArr.length ??
            0,
        } as Unidade;
      });
      setUnidades(lista);
    } catch (_error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar unidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const carregarHospitais = useCallback(async () => {
    try {
      const response = await hospitaisApi.listar();
      setHospitais(asArray<Hospital>(response));
    } catch (error) {
      console.error("Erro ao carregar hospitais:", error);
    }
  }, []);

  useEffect(() => {
    Promise.all([carregarUnidades(), carregarHospitais()]);
  }, [carregarUnidades, carregarHospitais]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta unidade?")) return;

    try {
      await unidadesApi.excluir(id);
      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso",
      });
      await carregarUnidades();
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erro ao excluir unidade";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    }
  };

  const unidadesFiltradas = unidades.filter((unidade) => {
    const matchesSearch = unidade.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesHospital = 
      filtroHospital === "todos" || 
      unidade.hospitalId === filtroHospital ||
      unidade.hospital?.id === filtroHospital;
    return matchesSearch && matchesHospital;
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
            <h1 className="text-3xl font-bold">Unidades</h1>
            <p className="text-gray-600">Gerencie as unidades hospitalares</p>
          </div>
          <Button onClick={() => navigate("/unidades/nova")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Unidade
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar unidades..."
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
                {hospitais.map((hospital) => (
                  <SelectItem key={hospital.id} value={hospital.id}>
                    {hospital.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Unidades */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Unidades Encontradas ({unidadesFiltradas.length})
            </h2>
          </div>

          {unidadesFiltradas.length === 0 ? (
            <div className="p-12 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {unidades.length === 0
                  ? "Nenhuma unidade cadastrada"
                  : "Nenhuma unidade encontrada"}
              </h3>
              <p className="text-gray-600 mb-4">
                {unidades.length === 0
                  ? "Comece criando sua primeira unidade"
                  : "Tente ajustar os filtros de busca"}
              </p>
              <Button onClick={() => navigate("/unidades/nova")}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Unidade
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Leitos</TableHead>
                  <TableHead>Método SCP</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unidadesFiltradas.map((unidade) => {
                  const hospital = hospitais.find(
                    (h) => h.id === unidade.hospitalId || h.id === unidade.hospital?.id
                  );
                  return (
                    <TableRow
                      key={unidade.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/unidades/${unidade.id}/leitos`)}
                    >
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-semibold">{unidade.nome}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {hospital?.nome || unidade.hospital?.nome || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Bed className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{unidade.numeroLeitos}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {unidade.scpMetodoKey || unidade.scp || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div
                          className="flex space-x-1 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/unidades/${unidade.id}/editar`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(unidade.id)}
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