import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeitoForm from '@/components/leito/LeitoForm';
import { api, Leito } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditLeito() {
  const { id } = useParams<{ id: string }>();
  const [leito, setLeito] = useState<Leito | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchLeito(id);
    }
  }, [id]);

  const fetchLeito = async (leitoId: string) => {
    try {
      setLoading(true);
      // The backend does not have a getLeito by ID directly in api.ts, but it does in the controller.
      // I will use a generic request for now, or add a specific getLeito(id) to api.ts if needed.
      const data = await api.request<Leito>(`/leitos/${leitoId}`);
      setLeito(data);
    } catch (error) {
      console.error('Erro ao buscar leito para edição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do leito para edição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando dados do leito...</p>
      </div>
    );
  }

  if (!leito) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Leito não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar Leito: {leito.numero}</CardTitle>
        </CardHeader>
        <CardContent>
          <LeitoForm initialData={leito} onSuccess={() => fetchLeito(leito.id)} />
        </CardContent>
      </Card>
    </div>
  );
}
