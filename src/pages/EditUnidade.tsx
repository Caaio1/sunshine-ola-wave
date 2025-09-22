
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnidadeForm from '@/components/unidade/UnidadeForm';
import { api, UnidadeInternacao } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditUnidade() {
  const { id } = useParams<{ id: string }>();
  const [unidade, setUnidade] = useState<UnidadeInternacao | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchUnidade(id);
    }
  }, [id]);

  const fetchUnidade = async (unidadeId: string) => {
    try {
      setLoading(true);
      const data = await api.getUnidade(unidadeId);
      setUnidade(data);
    } catch (error) {
      console.error('Erro ao buscar unidade para edição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados da unidade para edição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Carregando...</div>;
  if (!unidade) return <div className="p-4">Unidade não encontrada.</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader><CardTitle>Editar Unidade</CardTitle></CardHeader>
        <CardContent><UnidadeForm initialData={unidade} onSuccess={() => fetchUnidade(id!)} /></CardContent>
      </Card>
    </div>
  );
}
