import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, UnidadeNaoInternacao, Hospital } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  hospitalId: z.string().min(1, "Hospital é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  descricao: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateUnidadeNaoInternacao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      hospitalId: "",
      status: "ATIVO", // Default status
      descricao: "",
    },
  });

  const { data: hospitais, isLoading: isLoadingHospitais } = useQuery<Hospital[]>({
    queryKey: ["hospitais"],
    queryFn: api.getHospitais,
  });

  const createUnidadeMutation = useMutation({
    mutationFn: (data: Partial<UnidadeNaoInternacao>) => api.createUnidadeNaoInternacao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unidadesNaoInternacao"] });
      toast({
        title: "Sucesso",
        description: "Unidade de Não Internação criada com sucesso.",
      });
      navigate("/unidades-nao-internacao");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar unidade: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createUnidadeMutation.mutate(values);
  };

  if (isLoadingHospitais) {
    return <div>Carregando hospitais...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Unidade de Não Internação</h1>
          <p className="text-muted-foreground">
            Preencha os campos para criar uma nova unidade que não possui leitos de internação.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Unidade</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da Unidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hospitalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um hospital" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {hospitais?.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ATIVO">ATIVO</SelectItem>
                        <SelectItem value="INATIVO">INATIVO</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição da Unidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={createUnidadeMutation.isPending}>
                {createUnidadeMutation.isPending ? "Criando..." : "Criar Unidade"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
