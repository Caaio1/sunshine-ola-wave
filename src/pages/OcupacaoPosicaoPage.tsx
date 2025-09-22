import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, OcupacaoPosicao } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OcupacaoPosicaoPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ocupacoes, isLoading, error } = useQuery<OcupacaoPosicao[]>({
    queryKey: ["ocupacoesPosicoes"],
    queryFn: api.getOcupacoesPosicao,
  });

  const finalizarOcupacaoMutation = useMutation({
    mutationFn: (id: string) => api.finalizarOcupacaoPosicao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocupacoesPosicoes"] });
      toast({
        title: "Sucesso",
        description: "Ocupação de posição finalizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao finalizar ocupação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteOcupacaoMutation = useMutation({
    mutationFn: (id: string) => api.deleteOcupacaoPosicao(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocupacoesPosicoes"] });
      toast({
        title: "Sucesso",
        description: "Ocupação de posição excluída com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir ocupação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const columns: Column<OcupacaoPosicao>[] = [
    { key: "id", title: "ID" },
    // Add more columns based on the OcupacaoPosicao entity structure
    { key: "created_at", title: "Início", render: (date) => new Date(date).toLocaleString() },
    // Assuming there's an 'ended_at' or similar field for when it was finalized
    // { key: "ended_at", title: "Fim", render: (date) => date ? new Date(date).toLocaleString() : "Em andamento" },
  ];

  const handleEdit = (ocupacao: OcupacaoPosicao) => {
    navigate(`/relatorios-estatisticas/ocupacoes-posicoes/${ocupacao.id}/edit`);
  };

  const handleDelete = (ocupacao: OcupacaoPosicao) => {
    if (confirm(`Tem certeza que deseja excluir a ocupação ${ocupacao.id}?`)) {
      deleteOcupacaoMutation.mutate(ocupacao.id);
    }
  };

  const handleFinalize = (ocupacao: OcupacaoPosicao) => {
    if (confirm(`Tem certeza que deseja finalizar a ocupação ${ocupacao.id}?`)) {
      finalizarOcupacaoMutation.mutate(ocupacao.id);
    }
  };

  if (isLoading) {
    return <div>Carregando Ocupações de Posições...</div>;
  }

  if (error) {
    return <div>Erro ao carregar ocupações: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ocupação de Posições</h1>
          <p className="text-muted-foreground">
            Gerencie e visualize a ocupação atual e histórica das posições.
          </p>
        </div>
        <Button onClick={() => navigate("/relatorios-estatisticas/ocupacoes-posicoes/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Ocupação
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ocupações</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={ocupacoes || []}
            columns={columns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            // Add a custom action for finalizing if needed
            // actions={[{ label: "Finalizar", onClick: handleFinalize }]} 
            searchPlaceholder="Buscar por ID..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
