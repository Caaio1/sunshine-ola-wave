import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/ui/data-table";
import { Plus } from "lucide-react";
import { api, Hospital } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Hospitals() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: hospitals, isLoading, isError, error } = useQuery<Hospital[], Error>({
    queryKey: ['hospitals'],
    queryFn: api.getHospitais,
  });

  const deleteHospitalMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => api.deleteHospital(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hospitals'] });
      toast({
        title: "Sucesso",
        description: "Hospital excluído com sucesso.",
      });
    },
    onError: (err) => {
      toast({
        title: "Erro",
        description: err.message || "Erro ao excluir hospital.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (hospital: Hospital) => {
    console.log("Editar hospital:", hospital);
    // navigate(`/hospitals/edit/${hospital.id}`); // Future implementation
  };

  const handleDelete = async (hospital: Hospital) => {
    if (!confirm(`Tem certeza que deseja excluir o hospital ${hospital.nome}?`)) {
      return;
    }
    try {
      await api.deleteHospital(hospital.id);
      setHospitals(hospitals.filter((h) => h.id !== hospital.id));
      toast({
        title: "Sucesso",
        description: "Hospital excluído com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir hospital:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir hospital.",
        variant: "destructive",
      });
    }
  };

  const columns: Column<Hospital>[] = [
    { key: "nome", title: "Nome" },
    { key: "cnpj", title: "CNPJ" },
    { key: "endereco", title: "Endereço" },
    { key: "telefone", title: "Telefone" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hospitais</h1>
          <p className="text-muted-foreground">
            Gerencie os hospitais cadastrados no sistema.
          </p>
        </div>
        <Button onClick={() => navigate("/hospitals/create")} className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Hospital
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Hospitais</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando hospitais...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && (
            <DataTable
              data={hospitals}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar hospitais..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}