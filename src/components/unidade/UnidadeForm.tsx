
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, Hospital, UnidadeInternacao, Cargo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UnidadeFormProps {
  initialData?: UnidadeInternacao;
  onSuccess?: () => void;
}

type CargoQtd = { cargoId: string; quantidade_funcionarios: number };

export default function UnidadeForm({ initialData, onSuccess }: UnidadeFormProps) {
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [scpMetodos, setScpMetodos] = useState<{ id: string; key: string; name: string }[]>([]);
  const [cargosHospital, setCargosHospital] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    hospitalId: string;
    nome: string;
    numeroLeitos: number;
    scpMetodoId?: string;
    horas_extra_reais?: string;
    horas_extra_projetadas?: string;
    cargos_unidade: CargoQtd[];
  }>({
    hospitalId: '',
    nome: '',
    numeroLeitos: 0,
    scpMetodoId: undefined,
    horas_extra_reais: '',
    horas_extra_projetadas: '',
    cargos_unidade: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const [hs, methods] = await Promise.all([api.getHospitais(), api.getScpMetodos()]);
        setHospitais(hs);
        setScpMetodos(methods);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (form.hospitalId) {
      api.getCargos(form.hospitalId).then(setCargosHospital).catch(() => setCargosHospital([]));
    } else {
      setCargosHospital([]);
    }
  }, [form.hospitalId]);

  useEffect(() => {
    if (initialData) {
      setForm({
        hospitalId: initialData.hospital?.id ?? '',
        nome: initialData.nome ?? '',
        numeroLeitos: (initialData as any).numeroLeitos ?? 0,
        scpMetodoId: initialData.scpMetodo?.id,
        horas_extra_reais: (initialData as any).horas_extra_reais ?? '',
        horas_extra_projetadas: (initialData as any).horas_extra_projetadas ?? '',
        cargos_unidade: ((initialData as any).cargos_unidade ?? []).map((cu: any) => ({
          cargoId: cu.cargoId ?? cu.cargo?.id,
          quantidade_funcionarios: cu.quantidade_funcionarios ?? 0,
        })),
      });
    }
  }, [initialData]);

  const handleCargoQtdChange = (idx: number, patch: Partial<CargoQtd>) => {
    setForm((f) => {
      const list = [...f.cargos_unidade];
      list[idx] = { ...list[idx], ...patch };
      return { ...f, cargos_unidade: list };
    });
  };

  const addCargoRow = () => setForm((f) => ({ ...f, cargos_unidade: [...f.cargos_unidade, { cargoId: '', quantidade_funcionarios: 0 }] }));
  const removeCargoRow = (idx: number) => setForm((f) => ({ ...f, cargos_unidade: f.cargos_unidade.filter((_, i) => i !== idx) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (!form.hospitalId) throw new Error('Selecione um hospital');
      if (!form.nome) throw new Error('Informe o nome da unidade');
      if (!form.numeroLeitos || form.numeroLeitos <= 0) throw new Error('Informe o número de leitos');

      const payload = {
        hospitalId: form.hospitalId,
        nome: form.nome,
        numeroLeitos: Number(form.numeroLeitos),
        scpMetodoId: form.scpMetodoId || undefined,
        horas_extra_reais: form.horas_extra_reais || undefined,
        horas_extra_projetadas: form.horas_extra_projetadas || undefined,
        cargos_unidade: form.cargos_unidade.filter((c) => c.cargoId && c.quantidade_funcionarios > 0),
      };

      if (initialData?.id) {
        await api.updateUnidade(initialData.id, payload as any);
        toast({ title: 'Unidade atualizada' });
      } else {
        await api.createUnidade(payload);
        toast({ title: 'Unidade criada' });
        setForm({ hospitalId: '', nome: '', numeroLeitos: 0, scpMetodoId: undefined, horas_extra_reais: '', horas_extra_projetadas: '', cargos_unidade: [] });
      }
      onSuccess?.();
      navigate('/unidades');
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Hospital</Label>
          <Select value={form.hospitalId} onValueChange={(v) => setForm((f) => ({ ...f, hospitalId: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione o hospital" /></SelectTrigger>
            <SelectContent>
              {hospitais.map((h) => <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Nome da unidade</Label>
          <Input value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
        </div>
        <div>
          <Label>Número de leitos</Label>
          <Input type="number" min={1} value={form.numeroLeitos} onChange={(e) => setForm((f) => ({ ...f, numeroLeitos: Number(e.target.value) }))} />
        </div>
        <div>
          <Label>Método SCP</Label>
          <Select value={form.scpMetodoId ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, scpMetodoId: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione o método (opcional)" /></SelectTrigger>
            <SelectContent>
              {scpMetodos.map((m) => <SelectItem key={m.id} value={m.id}>{m.name} ({m.key})</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Horas extra (reais)</Label>
          <Input value={form.horas_extra_reais ?? ''} onChange={(e) => setForm((f) => ({ ...f, horas_extra_reais: e.target.value }))} />
        </div>
        <div>
          <Label>Horas extra (projetadas)</Label>
          <Input value={form.horas_extra_projetadas ?? ''} onChange={(e) => setForm((f) => ({ ...f, horas_extra_projetadas: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Cargos da unidade</Label>
          <Button type="button" variant="secondary" onClick={addCargoRow}>Adicionar cargo</Button>
        </div>
        {form.cargos_unidade.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cargo adicionado.</p>}
        <div className="space-y-2">
          {form.cargos_unidade.map((row, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
              <div className="md:col-span-4">
                <Select value={row.cargoId} onValueChange={(v) => handleCargoQtdChange(idx, { cargoId: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
                  <SelectContent>
                    {cargosHospital.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Input type="number" min={0} value={row.quantidade_funcionarios} onChange={(e) => handleCargoQtdChange(idx, { quantidade_funcionarios: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-1">
                <Button type="button" variant="ghost" onClick={() => removeCargoRow(idx)}>Remover</Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{initialData ? 'Salvar' : 'Criar'}</Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
      </div>
    </form>
  );
}
