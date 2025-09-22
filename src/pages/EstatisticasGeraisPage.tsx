
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api, Hospital, UnidadeInternacao, UnidadeStats } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Button } from '@/components/ui/button';

export default function EstatisticasGeraisPage() {
  const [hospitalId, setHospitalId] = useState<string>('');
  const [unidadeId, setUnidadeId] = useState<string>('');

  const { data: hospitais = [] } = useQuery<Hospital[]>({ queryKey: ['hospitais'], queryFn: api.getHospitais });
  const { data: unidades = [] } = useQuery<UnidadeInternacao[]>({
    queryKey: ['unidades', hospitalId],
    queryFn: () => hospitalId ? api.getUnidades({ hospitalId }) : Promise.resolve([]),
    enabled: !!hospitalId,
  });
  const { data: stats } = useQuery<UnidadeStats | null>({
    queryKey: ['stats', unidadeId],
    queryFn: () => unidadeId ? api.getUnidadeStats(unidadeId) : Promise.resolve(null),
    enabled: !!unidadeId,
  });

  const statusData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.statusCounts).map(([name, value]) => ({ name, value }));
  }, [stats]);

  const distData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.distribuicao).map(([name, value]) => ({ name, value }));
  }, [stats]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estatísticas Gerais</h1>
          <p className="text-muted-foreground">Visualize estatísticas por unidade</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Seleção</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Hospital</Label>
            <Select value={hospitalId} onValueChange={setHospitalId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {hospitais.map(h => <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Unidade</Label>
            <Select value={unidadeId} onValueChange={setUnidadeId} disabled={!hospitalId}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {stats && (
            <div className="flex items-end">
              <Button onClick={async () => {
                const blob = await api.downloadUnidadeStatsPdf(stats.unidade.id, stats.periodo.dataIni, stats.periodo.dataFim);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `estatisticas_unidade_${stats.unidade.nome}.pdf`; a.click();
                URL.revokeObjectURL(url);
              }}>Baixar PDF</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>Ocupação diária</CardTitle></CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.ocupacao.dias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="ocupados" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Distribuição por classificação</CardTitle></CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Status dos leitos</CardTitle></CardHeader>
            <CardContent style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} nameKey="name" dataKey="value" label />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
