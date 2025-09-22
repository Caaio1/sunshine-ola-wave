import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Rede } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function RedesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: redes, isLoading, error } = useQuery<Rede[]>({
    queryKey: ["redes"],
    queryFn: api.getRedes,
  });

  const deleteRedeMutation = useMutation({
    mutationFn: (id: string) => api.deleteRede(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["redes"] });
      toast({
        title: "Sucesso",
        description: "Rede excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir rede: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const columns: Column<Rede>[] = [
    { key: "nome", title: "Nome" },
    {
      key: "created_at",
      title: "Criado Em",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  const handleEdit = (rede: Rede) => {
    navigate(`/redes/${rede.id}/edit`);
  };

  const handleDelete = (rede: Rede) => {
    if (confirm(`Tem certeza que deseja excluir a rede ${rede.nome}?`)) {
      deleteRedeMutation.mutate(rede.id);
    }
  };

  if (isLoading) {
    return <div>Carregando Redes...</div>;
  }

  if (error) {
    return <div>Erro ao carregar redes: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Redes</h1>
          <p className="text-muted-foreground">
            Gerencie as redes de hospitais.
          </p>
        </div>
        <Button onClick={() => navigate("/redes/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Rede
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Redes</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={redes || []}
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
