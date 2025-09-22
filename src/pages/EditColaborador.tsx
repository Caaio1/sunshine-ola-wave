import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ColaboradorForm from '@/components/colaborador/ColaboradorForm';
import { api, Colaborador } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditColaborador() {
  const { id } = useParams<{ id: string }>();
  const [colaborador, setColaborador] = useState<Colaborador | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchColaborador(id);
    }
  }, [id]);

  const fetchColaborador = async (colaboradorId: string) => {
    try {
      setLoading(true);
      const data = await api.getColaborador(colaboradorId);
      setColaborador(data);
    } catch (error) {
      console.error('Erro ao buscar colaborador para edição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do colaborador para edição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando dados do colaborador...</p>
      </div>
    );
  }

  if (!colaborador) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Colaborador não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar Colaborador: {colaborador.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <ColaboradorForm initialData={colaborador} onSuccess={() => fetchColaborador(colaborador.id)} />
        </CardContent>
      </Card>
    </div>
  );
}
