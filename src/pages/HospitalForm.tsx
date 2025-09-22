import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  hospitaisApi,
  redesApi,
  gruposApi,
  regioesApi,
} from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Rede {
  id: string;
  nome: string;
}

interface Grupo {
  id: string;
  nome: string;
  redeId: string;
}

interface Regiao {
  id: string;
  nome: string;
  grupoId: string;
}

export default function HospitalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    cnpj: "",
  });

  const [selectedRede, setSelectedRede] = useState<string>("");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("");
  const [selectedRegiao, setSelectedRegiao] = useState<string>("");

  const [redes, setRedes] = useState<Rede[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [redesResp, gruposResp, regioesResp] = await Promise.all([
          redesApi.listar(),
          gruposApi.listar(),
          regioesApi.listar(),
        ]);

        setRedes(Array.isArray(redesResp) ? redesResp : (redesResp as any).data || []);
        setGrupos(Array.isArray(gruposResp) ? gruposResp : (gruposResp as any).data || []);
        setRegioes(Array.isArray(regioesResp) ? regioesResp : (regioesResp as any).data || []);

        if (isEdit && id) {
          const hospital = await hospitaisApi.obter(id);
          const hospitalData = hospital as any;
          setFormData({
            nome: hospitalData.nome || "",
            endereco: hospitalData.endereco || "",
            telefone: hospitalData.telefone || "",
            cnpj: hospitalData.cnpj || "",
          });

          // Configurar hierarquia
          const regiao = hospitalData.regiao;
          const grupo = regiao?.grupo;
          const rede = grupo?.rede;

          if (rede) setSelectedRede(rede.id);
          if (grupo) setSelectedGrupo(grupo.id);
          if (regiao) setSelectedRegiao(regiao.id);
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar dados",
          variant: "destructive",
        });
      }
    };

    carregarDados();
  }, [id, isEdit, toast]);

  const validarCNPJ = (cnpj: string) => {
    const regexCNPJ = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return regexCNPJ.test(cnpj);
  };

  const formatarCNPJ = (valor: string) =>
    valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);

  const formatarTelefone = (valor: string) =>
    valor
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do hospital é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cnpj.trim()) {
      toast({
        title: "CNPJ obrigatório",
        description: "O CNPJ do hospital é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!validarCNPJ(formData.cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Digite um CNPJ válido. Ex: 12.345.678/0001-90",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        nome: formData.nome,
        endereco: formData.endereco || undefined,
        telefone: formData.telefone || undefined,
        cnpj: formData.cnpj || undefined,
        regiaoId: selectedRegiao || undefined,
      };

      if (isEdit && id) {
        await hospitaisApi.atualizar(id, payload);
        toast({
          title: "Sucesso",
          description: "Hospital atualizado com sucesso",
        });
      } else {
        await hospitaisApi.criar(payload);
        toast({ title: "Sucesso", description: "Hospital criado com sucesso" });
      }

      navigate("/hospitais");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar hospital",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGruposFiltrados = () => {
    if (!selectedRede) return [];
    return grupos.filter(
      (grupo) => grupo.redeId === selectedRede
    );
  };

  const getRegioesFiltradas = () => {
    if (!selectedGrupo) return [];
    return regioes.filter(
      (regiao) => regiao.grupoId === selectedGrupo
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/hospitais")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Editar Hospital" : "Novo Hospital"}
            </h1>
            <p className="text-gray-600">
              {isEdit ? "Atualize os dados do hospital" : "Cadastre um novo hospital no sistema"}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome">Nome do Hospital *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="cnpj">CNPJ *</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      cnpj: formatarCNPJ(e.target.value),
                    })
                  }
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    telefone: formatarTelefone(e.target.value),
                  })
                }
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) =>
                  setFormData({ ...formData, endereco: e.target.value })
                }
                rows={3}
              />
            </div>

            {/* Hierarquia */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Hierarquia Organizacional</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Rede</Label>
                  <Select
                    value={selectedRede}
                    onValueChange={(v) => {
                      setSelectedRede(v);
                      setSelectedGrupo("");
                      setSelectedRegiao("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a rede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {redes.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grupo</Label>
                  <Select
                    value={selectedGrupo}
                    onValueChange={(v) => {
                      setSelectedGrupo(v);
                      setSelectedRegiao("");
                    }}
                    disabled={!selectedRede}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {getGruposFiltrados().map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Região</Label>
                  <Select
                    value={selectedRegiao}
                    onValueChange={setSelectedRegiao}
                    disabled={!selectedGrupo}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a região" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhuma</SelectItem>
                      {getRegioesFiltradas().map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/hospitais")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Atualizar" : "Criar"} Hospital
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}