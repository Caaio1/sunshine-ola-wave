
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, UnidadeInternacao, Leito } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Props {
  initialData?: Leito;
  onSuccess?: () => void;
}

export default function LeitoForm({ initialData, onSuccess }: Props) {
  const { toast } = useToast();
  const [unidades, setUnidades] = useState<UnidadeInternacao[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<{ numero: string; unidadeId: string }>({
    numero: initialData?.numero ?? '',
    unidadeId: initialData?.unidade?.id ?? '',
  });

  useEffect(() => { api.getUnidades().then(setUnidades).catch(() => setUnidades([])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.numero || !form.unidadeId) {
      toast({ title: 'Preencha número e unidade', variant: 'destructive' });
      return;
    }
    try {
      setLoading(true);
      if (initialData?.id) {
        await api.updateLeito(initialData.id, { numero: form.numero, unidadeId: form.unidadeId });
        toast({ title: 'Leito atualizado' });
      } else {
        await api.createLeito({ numero: form.numero, unidadeId: form.unidadeId });
        toast({ title: 'Leito criado' });
        setForm({ numero: '', unidadeId: '' });
      }
      onSuccess?.();
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Número do Leito</Label>
        <Input value={form.numero} onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Unidade</Label>
        <Select value={form.unidadeId} onValueChange={(v) => setForm((f) => ({ ...f, unidadeId: v }))}>
          <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
          <SelectContent>
            {unidades.map(u => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {initialData && (
        <div className="space-y-2">
          <Label>Status atual</Label>
          <Input value={initialData.status} disabled />
        </div>
      )}
      <Button type="submit" disabled={loading}>{initialData ? 'Salvar' : 'Criar'}</Button>
    </form>
  );
}
