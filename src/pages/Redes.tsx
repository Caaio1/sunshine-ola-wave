import React, { useEffect, useState } from 'react';
import { api, Rede } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function Redes() {
  const [redes, setRedes] = useState<Rede[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRedes();
  }, []);

  const fetchRedes = async () => {
    try {
      setLoading(true);
      const data = await api.getRedes();
      setRedes(data);
    } catch (error) {
      console.error('Erro ao buscar redes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de redes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta rede?')) {
      return;
    }
    try {
      await api.deleteRede(id);
      toast({
        title: 'Sucesso',
        description: 'Rede deletada com sucesso.',
      });
      fetchRedes(); // Refresh the list
    } catch (error) {
      console.error('Erro ao deletar rede:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a rede.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando redes...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Redes</CardTitle>
          <Button onClick={() => navigate('/redes/create')}>Adicionar Rede</Button>
        </CardHeader>
        <CardContent>
          {redes.length === 0 ? (
            <p>Nenhuma rede encontrada.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {redes.map((rede) => (
                  <TableRow key={rede.id}>
                    <TableCell>{rede.nome}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => navigate(`/redes/${rede.id}/edit`)}>
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(rede.id)}>
                        Deletar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
