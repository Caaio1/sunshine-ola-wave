import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CargoForm from '@/components/cargo/CargoForm';

export default function CreateCargo() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Cargo</CardTitle>
        </CardHeader>
        <CardContent>
          <CargoForm />
        </CardContent>
      </Card>
    </div>
  );
}