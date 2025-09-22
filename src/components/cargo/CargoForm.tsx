
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api, Cargo, Hospital } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

interface Props {
  initialData?: Cargo & { hospitalId?: string };
  hospitalId?: string; // pode vir do contexto da página
  onSuccess?: () => void;
}

export default function CargoForm({ initialData, hospitalId, onSuccess }: Props) {
  const [form, setForm] = useState<Partial<Cargo> & { hospitalId?: string }>({
    nome: '',
    salario: '',
    carga_horaria: '',
    descricao: '',
    adicionais_tributos: '',
    hospitalId: hospitalId,
  });
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => { api.getHospitais().then(setHospitais).catch(() => setHospitais([])); }, []);

  useEffect(() => {
    if (initialData) {
      setForm((f) => ({ ...f, ...initialData, hospitalId: hospitalId || (initialData as any).hospitalId }));
    }
  }, [initialData, hospitalId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hospitalId) { toast({ title: 'Selecione o hospital', variant: 'destructive' }); return; }
    try {
      setLoading(true);
      if (initialData?.id) {
        await api.updateCargo(form.hospitalId as string, initialData.id, form);
        toast({ title: 'Cargo atualizado' });
      } else {
        await api.createCargo(form.hospitalId as string, form);
        toast({ title: 'Cargo criado' });
      }
      onSuccess?.();
      navigate(`/hospitais/${form.hospitalId}/cargos`);
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>Hospital</Label>
        <Select value={form.hospitalId ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, hospitalId: v }))}>
          <SelectTrigger><SelectValue placeholder="Selecione o hospital" /></SelectTrigger>
          <SelectContent>
            {hospitais.map(h => <SelectItem key={h.id} value={h.id}>{h.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nome</Label>
          <Input value={form.nome ?? ''} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} />
        </div>
        <div>
          <Label>Salário (R$)</Label>
          <Input value={form.salario ?? ''} onChange={(e) => setForm((f) => ({ ...f, salario: e.target.value }))} />
        </div>
        <div>
          <Label>Carga horária</Label>
          <Input value={form.carga_horaria ?? ''} onChange={(e) => setForm((f) => ({ ...f, carga_horaria: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <Label>Descrição</Label>
          <Input value={form.descricao ?? ''} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <Label>Adicionais/Tributos</Label>
          <Input value={form.adicionais_tributos ?? ''} onChange={(e) => setForm((f) => ({ ...f, adicionais_tributos: e.target.value }))} />
        </div>
      </div>
      <Button type="submit" disabled={loading}>{initialData ? 'Salvar' : 'Criar'}</Button>
    </form>
  );
}
