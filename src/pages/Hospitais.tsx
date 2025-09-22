import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, MapPin, Phone, Edit, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  hospitaisApi,
  redesApi,
  gruposApi,
  regioesApi,
} from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Hospital {
  id: string;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;
  regiao?: Regiao;
  created_at: string;
}

interface Rede {
  id: string;
  nome: string;
}

interface Grupo {
  id: string;
  nome: string;
  redeId: string;
  rede?: Rede;
}

interface Regiao {
  id: string;
  nome: string;
  grupoId: string;
  grupo?: Grupo;
}

export default function Hospitais() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRede, setSelectedRede] = useState<string>("all");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("all");
  const [selectedRegiao, setSelectedRegiao] = useState<string>("all");

  const [redes, setRedes] = useState<Rede[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);

  const carregarHospitais = useCallback(async () => {
    try {
      const response = await hospitaisApi.listar();
      const list = Array.isArray(response)
        ? response
        : response && typeof response === "object" && (response as any).data
        ? (response as any).data
        : [];

      setHospitais(list as Hospital[]);
    } catch (error) {
      console.error("❌ Erro ao carregar hospitais:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar hospitais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const carregarRedes = async () => {
    try {
      const r: any = await redesApi.listar();
      const processedRedes = Array.isArray(r) ? r : (r && r.data) || [];
      setRedes(processedRedes);
    } catch (err) {
      console.error("❌ Erro ao carregar redes:", err);
    }
  };

  const carregarGrupos = async () => {
    try {
      const g: any = await gruposApi.listar();
      const processedGrupos = Array.isArray(g) ? g : (g && g.data) || [];
      setGrupos(processedGrupos);
    } catch (err) {
      console.error("❌ Erro ao carregar grupos:", err);
    }
  };

  const carregarRegioes = async () => {
    try {
      const rg: any = await regioesApi.listar();
      const processedRegioes = Array.isArray(rg) ? rg : (rg && rg.data) || [];
      setRegioes(processedRegioes);
    } catch (err) {
      console.error("❌ Erro ao carregar regiões:", err);
    }
  };

  useEffect(() => {
    carregarHospitais();
    carregarRedes();
    carregarGrupos();
    carregarRegioes();
  }, [carregarHospitais]);

  const getGruposFiltrados = () => {
    if (selectedRede === "all") return [];
    return grupos.filter(
      (grupo) =>
        grupo.redeId === selectedRede ||
        (grupo.rede && grupo.rede.id === selectedRede)
    );
  };

  const getRegioesFiltradas = () => {
    if (selectedGrupo === "all") return [];
    return regioes.filter(
      (regiao) =>
        regiao.grupoId === selectedGrupo ||
        (regiao.grupo && regiao.grupo.id === selectedGrupo)
    );
  };

  const getHospitaisFiltrados = () => {
    let filtered = hospitais;

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter((hospital) =>
        hospital.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.cnpj.includes(searchTerm) ||
        hospital.endereco?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtros hierárquicos
    if (
      selectedRede === "all" &&
      selectedGrupo === "all" &&
      selectedRegiao === "all"
    ) {
      return filtered;
    }

    return filtered.filter((hospital) => {
      const regiaoObj = hospital.regiao;
      const grupoObj = regiaoObj?.grupo;
      const redeObj = grupoObj?.rede;

      const matchesRegiao =
        selectedRegiao === "all" || regiaoObj?.id === selectedRegiao;
      const matchesGrupo =
        selectedGrupo === "all" || grupoObj?.id === selectedGrupo;
      const matchesRede =
        selectedRede === "all" || redeObj?.id === selectedRede;

      return matchesRegiao && matchesGrupo && matchesRede;
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este hospital?")) return;
    try {
      await hospitaisApi.excluir(id);
      toast({ title: "Sucesso", description: "Hospital excluído com sucesso" });
      carregarHospitais();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir hospital",
        variant: "destructive",
      });
    }
  };

  const hospitaisFiltrados = getHospitaisFiltrados();

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
            <h1 className="text-3xl font-bold">Hospitais</h1>
            <p className="text-gray-600">Gerencie os hospitais do sistema</p>
          </div>
          <Button onClick={() => navigate("/hospitais/novo")}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Hospital
          </Button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar hospitais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRede} onValueChange={setSelectedRede}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as Redes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Redes</SelectItem>
                {redes.map((rede) => (
                  <SelectItem key={rede.id} value={rede.id}>
                    {rede.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedGrupo}
              onValueChange={setSelectedGrupo}
              disabled={selectedRede === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os Grupos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Grupos</SelectItem>
                {getGruposFiltrados().map((grupo) => (
                  <SelectItem key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedRegiao}
              onValueChange={setSelectedRegiao}
              disabled={selectedGrupo === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as Regiões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Regiões</SelectItem>
                {getRegioesFiltradas().map((regiao) => (
                  <SelectItem key={regiao.id} value={regiao.id}>
                    {regiao.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela de Hospitais */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Hospitais Encontrados ({hospitaisFiltrados.length})
            </h2>
          </div>
          
          {hospitaisFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {hospitais.length === 0
                  ? "Nenhum hospital cadastrado"
                  : "Nenhum hospital encontrado"}
              </h3>
              <p className="text-gray-600 mb-4">
                {hospitais.length === 0
                  ? "Comece criando seu primeiro hospital"
                  : "Tente ajustar os filtros de busca"}
              </p>
              <Button onClick={() => navigate("/hospitais/novo")}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Hospital
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Hierarquia</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hospitaisFiltrados.map((hospital) => (
                  <TableRow
                    key={hospital.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/hospitais/${hospital.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-semibold">{hospital.nome}</div>
                          <div className="text-sm text-gray-500">{hospital.cnpj}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{hospital.endereco || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{hospital.telefone || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500 space-y-1">
                        {(() => {
                          const regiao = hospital.regiao;
                          const grupo = regiao?.grupo;
                          const rede = grupo?.rede;
                          return (
                            <>
                              {rede && <div>Rede: {rede.nome}</div>}
                              {grupo && <div>Grupo: {grupo.nome}</div>}
                              {regiao && <div>Região: {regiao.nome}</div>}
                              {!rede && !grupo && !regiao && <div>—</div>}
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex space-x-1 justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/hospitais/${hospital.id}/editar`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(hospital.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}