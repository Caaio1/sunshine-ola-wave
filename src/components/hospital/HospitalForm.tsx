import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api, Hospital } from '@/lib/api';
import { maskCNPJ, isValidCNPJ, maskPhone, isValidPhone } from '@/lib/masks';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface HospitalFormProps {
  initialData?: Hospital;
  onSuccess?: () => void;
}

export default function HospitalForm({ initialData, onSuccess }: HospitalFormProps) {
  const [formData, setFormData] = useState<Partial<Hospital>>(
    initialData || { nome: '', cnpj: '', endereco: '', telefone: '' }
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.cnpj && !isValidCNPJ(String(formData.cnpj))) {
        throw new Error('CNPJ inválido');
      }
      if (formData.telefone && !isValidPhone(String(formData.telefone))) {
        throw new Error('Telefone inválido');
      }
      if (initialData?.id) {
        // Update existing hospital
        await api.updateHospital(initialData.id, formData);
        toast({
          title: 'Sucesso',
          description: 'Hospital atualizado com sucesso.',
        });
      } else {
        // Create new hospital
        await api.createHospital(formData);
        toast({
          title: 'Sucesso',
          description: 'Hospital criado com sucesso.',
        });
        setFormData({ nome: '', cnpj: '', endereco: '', telefone: '' }); // Clear form
      }
      onSuccess?.();
      navigate('/hospitals'); // Navigate back to list after success
    } catch (error) {
      console.error('Erro ao salvar hospital:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o hospital.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Input
          id="endereco"
          value={formData.endereco}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="telefone">Telefone</Label>
        <Input
          id="telefone"
          value={formData.telefone}
          onChange={handleChange}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Hospital'}
      </Button>
    </form>
  );
}
