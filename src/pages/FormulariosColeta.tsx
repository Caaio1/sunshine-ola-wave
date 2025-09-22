import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, FormularioColeta } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function FormulariosColetaPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: formularios, isLoading, error } = useQuery<FormularioColeta[]>({
    queryKey: ["formulariosColeta"],
    queryFn: api.getFormulariosColeta,
  });

  const deleteFormularioMutation = useMutation({
    mutationFn: (id: string) => api.deleteFormularioColeta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulariosColeta"] });
      toast({
        title: "Sucesso",
        description: "Formulário de Coleta excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir formulário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const columns: Column<FormularioColeta>[] = [
    { key: "nome", title: "Nome" },
    {
      key: "created_at",
      title: "Criado Em",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  const handleEdit = (formulario: FormularioColeta) => {
    navigate(`/formularios-coleta/${formulario.id}/edit`);
  };

  const handleDelete = (formulario: FormularioColeta) => {
    if (confirm(`Tem certeza que deseja excluir o formulário ${formulario.nome}?`)) {
      deleteFormularioMutation.mutate(formulario.id);
    }
  };

  if (isLoading) {
    return <div>Carregando Formulários de Coleta...</div>;
  }

  if (error) {
    return <div>Erro ao carregar formulários: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Formulários de Coleta</h1>
          <p className="text-muted-foreground">
            Gerencie os formulários utilizados para coleta de dados.
          </p>
        </div>
        <Button onClick={() => navigate("/formularios-coleta/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Formulário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Formulários</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={formularios || []}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Buscar por nome..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
