import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeitoForm from '@/components/leito/LeitoForm';

export default function CreateLeito() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Leito</CardTitle>
        </CardHeader>
        <CardContent>
          <LeitoForm />
        </CardContent>
      </Card>
    </div>
  );
}
