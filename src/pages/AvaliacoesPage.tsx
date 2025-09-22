import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Avaliacao } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AvaliacoesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: avaliacoes, isLoading, error } = useQuery<Avaliacao[]>({
    queryKey: ["avaliacoes"],
    queryFn: api.getAvaliacoes,
  });

  // Assuming there will be a deleteAvaliacao API call
  const deleteAvaliacaoMutation = useMutation({
    mutationFn: (id: string) => Promise.resolve(), // Placeholder, replace with actual API call
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      toast({
        title: "Sucesso",
        description: "Avaliação excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir avaliação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const columns: Column<Avaliacao>[] = [
    { key: "id", title: "ID" },
    { key: "dataAplicacao", title: "Data Aplicação", render: (date) => new Date(date).toLocaleString() },
    { key: "unidade.nome", title: "Unidade" },
    { key: "leito.numero", title: "Leito" },
    { key: "autor.nome", title: "Autor" },
    { key: "classificacao", title: "Classificação" },
    { key: "totalPontos", title: "Total Pontos" },
  ];

  const handleEdit = (avaliacao: Avaliacao) => {
    // Assuming an edit route for avaliacoes
    navigate(`/relatorios-estatisticas/avaliacoes/${avaliacao.id}/edit`);
  };

  const handleDelete = (avaliacao: Avaliacao) => {
    if (confirm(`Tem certeza que deseja excluir a avaliação ${avaliacao.id}?`)) {
      deleteAvaliacaoMutation.mutate(avaliacao.id);
    }
  };

  if (isLoading) {
    return <div>Carregando Avaliações...</div>;
  }

  if (error) {
    return <div>Erro ao carregar avaliações: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Avaliações</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize as avaliações de pacientes.
          </p>
        </div>
        <Button onClick={() => navigate("/relatorios-estatisticas/avaliacoes/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Avaliação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={avaliacoes || []}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Buscar por ID..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
