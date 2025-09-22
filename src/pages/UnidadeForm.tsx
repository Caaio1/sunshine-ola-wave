import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { unidadesApi, hospitaisApi, metodosScpApi } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

interface Hospital {
  id: string;
  nome: string;
}

interface MetodoScp {
  id: string;
  key: string;
  title: string;
}

export default function UnidadeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [metodos, setMetodos] = useState<MetodoScp[]>([]);
  const [formData, setFormData] = useState({
    nome: "",
    numeroLeitos: "",
    hospitalId: "",
    metodoKey: "",
  });

  const asArray = <T,>(r: unknown): T[] =>
    Array.isArray(r) ? (r as T[]) : (r as { data?: T[] })?.data ?? [];

  const carregarDados = useCallback(async () => {
    try {
      const [hospitaisResp, metodosResp] = await Promise.all([
        hospitaisApi.listar(),
        metodosScpApi.listar(),
      ]);

      setHospitais(asArray<Hospital>(hospitaisResp));
      setMetodos(asArray<MetodoScp>(metodosResp));

      if (isEdit && id) {
        const unidade = await unidadesApi.obter(id);
        const unidadeData = unidade as any;
        setFormData({
          nome: unidadeData.nome || "",
          numeroLeitos: unidadeData.numeroLeitos?.toString() || "",
          hospitalId: unidadeData.hospitalId || "",
          metodoKey: unidadeData.scpMetodoKey || unidadeData.scp || "",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    }
  }, [id, isEdit, toast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "O nome da unidade é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (!formData.numeroLeitos || parseInt(formData.numeroLeitos) < 1) {
      toast({
        title: "Número de leitos inválido",
        description: "Informe um número válido de leitos",
        variant: "destructive",
      });
      return;
    }

    if (!isEdit && !formData.hospitalId) {
      toast({
        title: "Hospital obrigatório",
        description: "Selecione um hospital",
        variant: "destructive",
      });
      return;
    }

    if (!isEdit && !formData.metodoKey) {
      toast({
        title: "Método SCP obrigatório",
        description: "Selecione um método SCP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const dataEdicao = {
          nome: formData.nome,
          numeroLeitos: parseInt(formData.numeroLeitos),
        };
        await unidadesApi.atualizar(id!, dataEdicao);
        toast({
          title: "Sucesso",
          description: "Unidade atualizada com sucesso",
        });
      } else {
        const key = formData.metodoKey.toUpperCase();
        const BUILTINS: ReadonlyArray<string> = ["FUGULIN", "PERROCA", "DINI"];
        const isBuiltin = BUILTINS.includes(key);
        
        const dataCriacao: any = {
          nome: formData.nome,
          numeroLeitos: parseInt(formData.numeroLeitos),
          hospitalId: formData.hospitalId,
          scp: isBuiltin ? key : "FUGULIN",
        };

        if (!isBuiltin) {
          const matched = metodos.find(
            (m) => m.key === key || (m.title || "").toUpperCase() === key
          );
          if (matched && matched.id) dataCriacao.scpMetodoId = matched.id;
          else dataCriacao.scpMetodoKey = key;
        }

        await unidadesApi.criar(dataCriacao);
        toast({
          title: "Sucesso",
          description: "Unidade criada com sucesso",
        });
      }

      navigate("/unidades");
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Erro ao salvar unidade";
      toast({ title: "Erro", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate("/unidades")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isEdit ? "Editar Unidade" : "Nova Unidade"}
            </h1>
            <p className="text-gray-600">
              {isEdit ? "Atualize os dados da unidade" : "Cadastre uma nova unidade hospitalar"}
            </p>
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="nome">Nome da Unidade *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                placeholder="Ex: UTI Adulto, Clínica Médica"
                required
              />
            </div>

            <div>
              <Label htmlFor="numeroLeitos">Número de Leitos *</Label>
              <Input
                id="numeroLeitos"
                type="number"
                min="1"
                value={formData.numeroLeitos}
                onChange={(e) =>
                  setFormData({ ...formData, numeroLeitos: e.target.value })
                }
                required
              />
            </div>

            {!isEdit && (
              <>
                <div>
                  <Label>Hospital *</Label>
                  <Select
                    value={formData.hospitalId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, hospitalId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um hospital" />
                    </SelectTrigger>
                    <SelectContent>
                      {hospitais.map((hospital) => (
                        <SelectItem key={hospital.id} value={hospital.id}>
                          {hospital.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Método SCP *</Label>
                  <Select
                    value={formData.metodoKey}
                    onValueChange={(value) =>
                      setFormData({ ...formData, metodoKey: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      {metodos.map((m) => (
                        <SelectItem key={m.key} value={m.key}>
                          {m.title} ({m.key})
                        </SelectItem>
                      ))}
                      <SelectItem value="FUGULIN">Fugulin (FUGULIN)</SelectItem>
                      <SelectItem value="PERROCA">Perroca (PERROCA)</SelectItem>
                      <SelectItem value="DINI">Dini (DINI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {isEdit && (
              <div className="p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
                <strong>Nota:</strong> O método SCP e o hospital não podem ser alterados após a criação da unidade.
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/unidades")}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? "Atualizar" : "Criar"} Unidade
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}