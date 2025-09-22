import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { api, Colaborador, Hospital, Cargo } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ColaboradorFormProps {
  initialData?: Colaborador;
  onSuccess?: () => void;
}

export default function ColaboradorForm({ initialData, onSuccess }: ColaboradorFormProps) {
  const [formData, setFormData] = useState<Partial<Colaborador>>(
    initialData || { nome: '', email: '', cpf: '', mustChangePassword: true, ativo: true, hospital: undefined, cargo: undefined }
  );
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        const fetchedHospitais = await api.getHospitais();
        setHospitais(fetchedHospitais);

        if (formData.hospital?.id) {
          const fetchedCargos = await api.getCargos(formData.hospital.id);
          setCargos(fetchedCargos);
        }
      } catch (error) {
        console.error('Erro ao buscar dados para o formulário de colaborador:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados necessários.',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, [formData.hospital?.id]); // Re-fetch cargos when hospital changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleHospitalSelect = (hospitalId: string) => {
    const selectedHospital = hospitais.find(h => h.id === hospitalId);
    setFormData((prev) => ({ ...prev, hospital: selectedHospital, cargo: undefined })); // Clear cargo when hospital changes
  };

  const handleCargoSelect = (cargoId: string) => {
    const selectedCargo = cargos.find(c => c.id === cargoId);
    setFormData((prev) => ({ ...prev, cargo: selectedCargo }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nome || !formData.email || !formData.cpf || !formData.hospital?.id || !formData.cargo?.id) {
      toast({
        title: 'Erro',
        description: 'Todos os campos obrigatórios devem ser preenchidos.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const dataToSubmit: Partial<Colaborador> = {
        ...formData,
        hospital: formData.hospital,
        cargo: formData.cargo,
      };

      if (initialData?.id) {
        // Update existing collaborator
        await api.updateColaborador(initialData.id, dataToSubmit);
        toast({
          title: 'Sucesso',
          description: 'Colaborador atualizado com sucesso.',
        });
      } else {
        // Create new collaborator
        await api.createColaborador(dataToSubmit);
        toast({
          title: 'Sucesso',
          description: 'Colaborador criado com sucesso.',
        });
        setFormData({ nome: '', email: '', cpf: '', ativo: true, hospital: undefined, cargo: undefined }); // Clear form
      }
      onSuccess?.();
      navigate('/colaboradores'); // Navigate back to list after success
    } catch (error) {
      console.error('Erro ao salvar colaborador:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o colaborador.',
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
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cpf">CPF</Label>
        <Input
          id="cpf"
          value={formData.cpf}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="hospital">Hospital</Label>
        <Select
          onValueChange={handleHospitalSelect}
          value={formData.hospital?.id || ''}
          disabled={dataLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um hospital" />
          </SelectTrigger>
          <SelectContent>
            {dataLoading ? (
              <SelectItem value="" disabled>Carregando hospitais...</SelectItem>
            ) : (
              hospitais.map((hospital) => (
                <SelectItem key={hospital.id} value={hospital.id}>
                  {hospital.nome}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cargo">Cargo</Label>
        <Select
          onValueChange={handleCargoSelect}
          value={formData.cargo?.id || ''}
          disabled={dataLoading || !formData.hospital?.id}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cargo" />
          </SelectTrigger>
          <SelectContent>
            {dataLoading ? (
              <SelectItem value="" disabled>Carregando cargos...</SelectItem>
            ) : (
              cargos.map((cargo) => (
                <SelectItem key={cargo.id} value={cargo.id}>
                  {cargo.nome}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="mustChangePassword"
          checked={formData.mustChangePassword}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, mustChangePassword: checked as boolean }))}
        />
        <Label htmlFor="mustChangePassword">Exigir troca de senha no primeiro login</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="ativo"
          checked={formData.ativo}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ativo: checked as boolean }))}
        />
        <Label htmlFor="ativo">Ativo</Label>
      </div>

      <Button type="submit" disabled={loading || dataLoading}>
        {loading ? 'Salvando...' : 'Salvar Colaborador'}
      </Button>
    </form>
  );
}