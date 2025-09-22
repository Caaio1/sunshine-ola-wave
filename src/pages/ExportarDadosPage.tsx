
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const endpoints = [
  { key: 'hospitais', label: 'Hospitais' },
  { key: 'unidades', label: 'Unidades' },
  { key: 'leitos', label: 'Leitos' },
  { key: 'colaboradores', label: 'Colaboradores' },
];

export default function ExportarDadosPage() {
  const download = async (key: string) => {
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3110';
    const url = `${base.replace(/\/$/,'')}/export/csv/${key}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` }});
    if (!res.ok) { alert('Falha ao exportar'); return; }
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${key}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exportar dados</h1>
          <p className="text-muted-foreground">Baixe os dados principais em CSV.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {endpoints.map((e) => (
          <Card key={e.key}>
            <CardHeader><CardTitle>{e.label}</CardTitle></CardHeader>
            <CardContent><Button onClick={() => download(e.key)}>Baixar CSV</Button></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
