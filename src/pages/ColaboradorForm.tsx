import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
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
import { colaboradoresApi, unidadesApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Unidade {
  id: string;
  nome: string;
  hospital?: { nome: string };
}

export default function ColaboradorForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    cargo: "",
    unidadeId: "",
    ativo: true,
  });

  const cargoOptions = [
    { value: "ENF", label: "Enfermeiro(a)" },
    { value: "TEC", label: "Técnico(a) de Enfermagem" },
    { value: "SUP", label: "Supervisor(a)" },
  ];

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Carregar unidades
        const unidadesResp = await unidadesApi.listar();
        let lista: Unidade[] = [];
        if (Array.isArray(unidadesResp)) {
          lista = unidadesResp as Unidade[];
        } else if (unidadesResp && typeof unidadesResp === "object") {
          const dataPart = (unidadesResp as Record<string, unknown>)["data"];
          if (Array.isArray(dataPart)) lista = dataPart as Unidade[];
        }
        setUnidades(lista);

        // Se for edição, carregar dados do colaborador
        if (isEdit && id) {
          const colaborador = await colaboradoresApi.obter(id);
          const colaboradorData = colaborador as any;
          setFormData({
            nome: colaboradorData.nome || "",
            cpf: colaboradorData.cpf || "",
            cargo: colaboradorData.cargo || "",
            unidadeId: colaboradorData.unidadeId || "",
            ativo: colaboradorData.ativo !== false,
          });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome do colaborador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cpf.trim()) {
      toast({
        title: "CPF obrigatório",
        description: "O CPF do colaborador é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.cargo) {
      toast({
        title: "Cargo obrigatório",
        description: "Selecione um cargo",
        variant: "destructive",
      });
      return;
    }

    if (!formData.unidadeId) {
      toast({
        title: "Unidade obrigatória",
        description: "Selecione uma unidade",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        nome: formData.nome,
        cpf: formData.cpf,
        cargo: formData.cargo as "ENF" | "TEC" | "SUP",
        unidadeId: formData.unidadeId,
        ativo: formData.ativo,
      };

      if (isEdit && id) {
        await colaboradoresApi.atualizar(id, data);
        toast({
          title: "Sucesso",
          description: "Colaborador atualizado com sucesso",
        });
      } else {
        await colaboradoresApi.criar(data);
        toast({
          title: "Sucesso",
          description: "Colaborador criado com sucesso",
        });
      }

      navigate("/colaboradores");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: "Erro",
        description: message || "Erro ao salvar colaborador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/colaboradores")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Editar Colaborador" : "Novo Colaborador"}
            </h1>
            <p className="text-gray-600">
              {isEdit ? "Atualize os dados do colaborador" : "Cadastre um novo colaborador no sistema"}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nome">Nome Completo *</Label>
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
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) =>
                  setFormData({ ...formData, cpf: e.target.value })
                }
                placeholder="Digite o CPF"
                required
              />
            </div>

            <div>
              <Label>Cargo *</Label>
              <Select
                value={formData.cargo}
                onValueChange={(value) =>
                  setFormData({ ...formData, cargo: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {cargoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Unidade *</Label>
              <Select
                value={formData.unidadeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, unidadeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {unidades.map((unidade) => (
                    <SelectItem key={unidade.id} value={unidade.id}>
                      {unidade.nome}
                      {unidade.hospital?.nome && (
                        <span className="text-gray-500 ml-2">
                          - {unidade.hospital.nome}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, ativo: checked })
                }
              />
              <Label htmlFor="ativo">Colaborador ativo</Label>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/colaboradores")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Atualizar" : "Criar"} Colaborador
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}