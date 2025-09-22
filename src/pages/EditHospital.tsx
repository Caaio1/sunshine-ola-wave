import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HospitalForm from '@/components/hospital/HospitalForm';
import { api, Hospital } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditHospital() {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchHospital(id);
    }
  }, [id]);

  const fetchHospital = async (hospitalId: string) => {
    try {
      setLoading(true);
      const data = await api.getHospital(hospitalId);
      setHospital(data);
    } catch (error) {
      console.error('Erro ao buscar hospital para edição:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do hospital para edição.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando dados do hospital...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Hospital não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Editar Hospital: {hospital.nome}</CardTitle>
        </CardHeader>
        <CardContent>
          <HospitalForm initialData={hospital} onSuccess={() => fetchHospital(hospital.id)} />
        </CardContent>
      </Card>
    </div>
  );
}
