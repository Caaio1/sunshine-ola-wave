import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable, Column } from "@/components/ui/data-table";
import { useQuery } from "@tanstack/react-query";
import { api, HistoricoOcupacao } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function HistoricoOcupacaoPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [unidadeId, setUnidadeId] = useState<string>(""); // Assuming a way to select unidadeId

  const { data: historico, isLoading, error } = useQuery<HistoricoOcupacao[]>({
    queryKey: ["historicoOcupacao", startDate, endDate, unidadeId],
    queryFn: () => {
      if (startDate && endDate) {
        return api.getHistoricoOcupacaoPorPeriodo(startDate, endDate, unidadeId || undefined);
      } else if (startDate) {
        return api.getHistoricoOcupacaoPorDia(startDate, unidadeId || undefined);
      }
      return Promise.resolve([]); // Return empty array if no dates are selected
    },
    enabled: !!startDate, // Only fetch if at least a start date is provided
  });

  const columns: Column<HistoricoOcupacao>[] = [
    { key: "id", title: "ID" },
    // Add more columns based on the HistoricoOcupacao entity structure
    { key: "created_at", title: "Data", render: (date) => new Date(date).toLocaleString() },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Histórico de Ocupação</h1>
          <p className="text-muted-foreground">
            Visualize o histórico de ocupação de leitos e posições.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Label htmlFor="startDate">Data Início</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">Data Fim</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {/* Add a select for UnidadeId here if needed */}
          {/* <div>
            <Label htmlFor="unidadeId">Unidade</Label>
            <Input
              id="unidadeId"
              type="text"
              value={unidadeId}
              onChange={(e) => setUnidadeId(e.target.value)}
              placeholder="ID da Unidade"
            />
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Carregando histórico de ocupação...</div>}
          {error && <div>Erro ao carregar histórico: {error.message}</div>}
          {historico && historico.length > 0 ? (
            <DataTable data={historico} columns={columns} searchPlaceholder="Buscar..." />
          ) : (
            !isLoading && !error && <div>Nenhum histórico de ocupação encontrado para os filtros selecionados.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
