import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UnidadeForm from '@/components/unidade/UnidadeForm';

export default function CreateUnidade() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Nova Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <UnidadeForm />
        </CardContent>
      </Card>
    </div>
  );
}
