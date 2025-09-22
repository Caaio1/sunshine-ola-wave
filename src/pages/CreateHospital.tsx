import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import HospitalForm from '@/components/hospital/HospitalForm';

export default function CreateHospital() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Hospital</CardTitle>
        </CardHeader>
        <CardContent>
          <HospitalForm />
        </CardContent>
      </Card>
    </div>
  );
}
