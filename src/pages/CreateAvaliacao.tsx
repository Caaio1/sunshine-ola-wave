import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, Avaliacao, Leito, UnidadeInternacao, Colaborador, ScpMetodo } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  leitoId: z.string().min(1, "Leito é obrigatório"),
  unidadeId: z.string().min(1, "Unidade é obrigatória"),
  scp: z.string().min(1, "SCP é obrigatório"),
  colaboradorId: z.string().min(1, "Colaborador é obrigatório"),
  prontuario: z.string().optional(),
  // For 'itens', it's more complex, might need a dynamic form or separate component
  // For simplicity, we'll omit 'itens' from this basic form for now.
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateAvaliacao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leitoId: "",
      unidadeId: "",
      scp: "",
      colaboradorId: "",
      prontuario: "",
    },
  });

  const { data: leitos, isLoading: isLoadingLeitos } = useQuery<Leito[]>({
    queryKey: ["leitos"],
    queryFn: api.getLeitos,
  });

  const { data: unidades, isLoading: isLoadingUnidades } = useQuery<UnidadeInternacao[]>({
    queryKey: ["unidades"],
    queryFn: api.getUnidades,
  });

  const { data: colaboradores, isLoading: isLoadingColaboradores } = useQuery<Colaborador[]>({
    queryKey: ["colaboradores"],
    queryFn: api.getColaboradores,
  });

  const { data: scpMetodos, isLoading: isLoadingScpMetodos } = useQuery<ScpMetodo[]>({
    queryKey: ["scpMetodos"],
    queryFn: api.getScpMetodos,
  });

  const createAvaliacaoMutation = useMutation({
    mutationFn: (data: Partial<Avaliacao>) => api.createAvaliacaoSessao(data as any), // Type assertion for simplicity, 'itens' is missing
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avaliacoes"] });
      toast({
        title: "Sucesso",
        description: "Avaliação criada com sucesso.",
      });
      navigate("/relatorios-estatisticas/avaliacoes");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar avaliação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    // For now, 'itens' is omitted. In a real scenario, this would be handled dynamically.
    createAvaliacaoMutation.mutate(values);
  };

  if (isLoadingLeitos || isLoadingUnidades || isLoadingColaboradores || isLoadingScpMetodos) {
    return <div>Carregando dados para avaliação...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Nova Avaliação</h1>
          <p className="text-muted-foreground">
            Preencha os campos para registrar uma nova avaliação de paciente.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="unidadeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unidades?.map((unidade) => (
                          <SelectItem key={unidade.id} value={unidade.id}>
                            {unidade.nome}
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
                name="leitoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leito</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o leito" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leitos?.map((leito) => (
                          <SelectItem key={leito.id} value={leito.id}>
                            {leito.numero} (Unidade: {leito.unidade.nome})
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
                name="colaboradorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Colaborador</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o colaborador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colaboradores?.map((colaborador) => (
                          <SelectItem key={colaborador.id} value={colaborador.id}>
                            {colaborador.nome}
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
                name="scp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método SCP</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método SCP" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scpMetodos?.map((scpMetodo) => (
                          <SelectItem key={scpMetodo.id} value={scpMetodo.key}>
                            {scpMetodo.title}
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
                name="prontuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prontuário (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Número do prontuário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={createAvaliacaoMutation.isPending}>
                {createAvaliacaoMutation.isPending ? "Criando..." : "Criar Avaliação"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
