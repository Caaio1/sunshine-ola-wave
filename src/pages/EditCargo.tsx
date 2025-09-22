import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CargoForm from '@/components/cargo/CargoForm';
import { api, Cargo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditCargo() {
  const { hospitalId, cargoId } = useParams<{ hospitalId: string, cargoId: string }>();
  const [cargo, setCargo] = useState<Cargo | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (hospitalId && cargoId) {
      fetchCargo(hospitalId, cargoId);
    }
  }, [hospitalId, cargoId]);

  const fetchCargo = async (hospitalId: string, cargoId: string) => {
    try {
      setLoading(true);
      const data = await api.getCargo(hospitalId, cargoId);
      setCargo(data);
    } catch (error) {
      console.error('Erro ao buscar cargo para edição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do cargo para edição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando dados do cargo...</p>
      </div>
    );
  }

  if (!cargo) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Cargo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar Cargo: {cargo.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <CargoForm initialData={cargo} onSuccess={() => fetchCargo(hospitalId!, cargoId!)} />
        </CardContent>
      </Card>
    </div>
  );
}