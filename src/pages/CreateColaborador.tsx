import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ColaboradorForm from '@/components/colaborador/ColaboradorForm';

export default function CreateColaborador() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Colaborador</CardTitle>
        </CardHeader>
        <CardContent>
          <ColaboradorForm />
        </CardContent>
      </Card>
    </div>
  );
}
