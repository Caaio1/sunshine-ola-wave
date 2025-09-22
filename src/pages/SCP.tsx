
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Hospital, UnidadeInternacao, Leito, Avaliacao, Colaborador } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DataTable, Column } from '@/components/ui/data-table';

export default function SCP() {
  const { toast } = useToast();
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState<string>('');
  const [unidades, setUnidades] = useState<UnidadeInternacao[]>([]);
  const [unidadeId, setUnidadeId] = useState<string>('');
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [scpKey, setScpKey] = useState<string>('FUGULIN');
  const [schema, setSchema] = useState<any>(null);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [colaboradorId, setColaboradorId] = useState<string>('');
  const [prontuario, setProntuario] = useState<string>('');
  const [leitoId, setLeitoId] = useState<string>('');
  const [sessoes, setSessoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.getHospitais().then((hs) => { setHospitais(hs); if (hs.length) setHospitalId(hs[0].id); }); }, []);
  useEffect(() => { if (hospitalId) api.getUnidades({ hospitalId }).then(setUnidades); else setUnidades([]); setUnidadeId(''); }, [hospitalId]);
  useEffect(() => { if (unidadeId) { api.getLeitosDisponiveis(unidadeId).then(setLeitos); api.getColaboradores({ unidadeId }).then(setColaboradores); api.getSessoesAtivas(unidadeId).then(setSessoes); } else { setLeitos([]); setColaboradores([]); setSessoes([]);} setLeitoId(''); }, [unidadeId]);
  useEffect(() => { if (scpKey) api.getScpSchema(scpKey).then(setSchema); }, [scpKey]);

  const total = useMemo(() => Object.values(respostas).reduce((a, b) => a + (Number(b) || 0), 0), [respostas]);

  const columns: Column<Avaliacao>[] = [
    { key: 'leito', title: 'Leito', render: (_v, r) => r.leito?.numero ?? '-' },
    { key: 'unidade', title: 'Unidade', render: (_v, r) => r.unidade?.nome ?? '-' },
    { key: 'autor', title: 'Colaborador', render: (_v, r) => r.autor?.nome ?? '-' },
    { key: 'classificacao', title: 'Classificação' },
    { key: 'totalPontos', title: 'Pontos' },
    { key: 'statusSessao', title: 'Status' },
  ];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!unidadeId || !leitoId || !colaboradorId) throw new Error('Preencha unidade, leito e colaborador');
      setLoading(true);
      await api.createAvaliacaoSessao({
        leitoId, unidadeId, scp: scpKey, itens: respostas, colaboradorId, prontuario: prontuario || undefined,
      });
      toast({ title: 'Sessão criada' });
      setRespostas({}); setProntuario(''); setLeitoId('');
      const [leitosAtual, sessoesAtual] = await Promise.all([api.getLeitosDisponiveis(unidadeId), api.getSessoesAtivas(unidadeId)]);
      setLeitos(leitosAtual); setSessoes(sessoesAtual);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const liberar = async (id: string) => {
    try {
      await api.liberarSessao(id);
      toast({ title: 'Sessão liberada' });
      if (unidadeId) {
        const [leitosAtual, sessoesAtual] = await Promise.all([api.getLeitosDisponiveis(unidadeId), api.getSessoesAtivas(unidadeId)]);
        setLeitos(leitosAtual); setSessoes(sessoesAtual);
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">SCP - Sessões</h1>
      </div>

      <Tabs defaultValue="nova">
        <TabsList>
          <TabsTrigger value="nova">Nova sessão</TabsTrigger>
          <TabsTrigger value="ativas">Sessões ativas</TabsTrigger>
        </TabsList>

        <TabsContent value="nova">
          <Card>
            <CardHeader><CardTitle>Nova sessão</CardTitle></CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <Select value={unidadeId} onValueChange={setUnidadeId}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Leito disponível</Label>
                    <Select value={leitoId} onValueChange={setLeitoId} disabled={!unidadeId}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {leitos.map(l => <SelectItem key={l.id} value={l.id}>{l.numero}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Método SCP</Label>
                    <Select value={scpKey} onValueChange={setScpKey}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUGULIN">FUGULIN</SelectItem>
                        <SelectItem value="PERROCA">PERROCA</SelectItem>
                        <SelectItem value="DINI">DINI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Colaborador</Label>
                    <Select value={colaboradorId} onValueChange={setColaboradorId} disabled={!unidadeId}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Prontuário (opcional)</Label>
                    <Input value={prontuario} onChange={(e) => setProntuario(e.target.value)} />
                  </div>
                </div>

                {schema && (
                  <div className="space-y-3 pt-4">
                    <h3 className="font-semibold">Itens de avaliação ({schema.type})</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {schema.questions.map((q: any) => (
                        <div key={q.key} className="p-3 rounded-lg border">
                          <Label className="block text-sm mb-1">{q.text}</Label>
                          <Select
                            value={String(respostas[q.key] ?? '')}
                            onValueChange={(v) => setRespostas((r) => ({ ...r, [q.key]: Number(v) }))}
                          >
                            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            <SelectContent>
                              {q.options.map((op: any, idx: number) => (
                                <SelectItem key={idx} value={String(op.value)}>{op.label} ({op.value})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">Total de pontos</span>
                      <span className="text-lg font-bold">{total}</span>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button type="submit" disabled={loading || !leitoId}>Salvar sessão</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ativas">
          <Card>
            <CardHeader><CardTitle>Sessões ativas</CardTitle></CardHeader>
            <CardContent>
              <DataTable
                data={sessoes}
                columns={columns}
                onDelete={(row) => liberar(row.id as string)}
                searchPlaceholder="Buscar por leito/unidade..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
