import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, OcupacaoPosicao, Posicao } from "@/lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const formSchema = z.object({
  posicaoId: z.string().min(1, "Posição é obrigatória"),
  // Add other fields as per OcupacaoPosicao entity, e.g., dataInicio, dataFim
});

type FormValues = z.infer<typeof formSchema>;

export default function EditOcupacaoPosicao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posicaoId: "",
    },
  });

  const { data: ocupacao, isLoading: isLoadingOcupacao, error: errorOcupacao } = useQuery<OcupacaoPosicao>({
    queryKey: ["ocupacaoPosicao", id],
    queryFn: () => id ? api.getOcupacaoPosicao(id) : Promise.reject("ID da ocupação não fornecido"),
    enabled: !!id,
  });

  const { data: posicoes, isLoading: isLoadingPosicoes } = useQuery<Posicao[]>({
    queryKey: ["posicoes"],
    queryFn: () => api.getSitiosFuncionais().then(sitios => sitios.flatMap(sitio => sitio.posicoes || [])), // Assuming Posicoes are nested under SitiosFuncionais
  });

  useEffect(() => {
    if (ocupacao) {
      form.reset({
        posicaoId: ocupacao.posicao.id, // Assuming ocupacao.posicao is available and has an id
      });
    }
  }, [ocupacao, form]);

  const updateOcupacaoMutation = useMutation({
    mutationFn: (data: Partial<OcupacaoPosicao>) => id ? api.updateOcupacaoPosicao(id, data) : Promise.reject("ID da ocupação não fornecido"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocupacoesPosicoes"] });
      queryClient.invalidateQueries({ queryKey: ["ocupacaoPosicao", id] });
      toast({
        title: "Sucesso",
        description: "Ocupação de Posição atualizada com sucesso.",
      });
      navigate("/relatorios-estatisticas/ocupacoes-posicoes");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar ocupação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    updateOcupacaoMutation.mutate(values);
  };

  if (isLoadingOcupacao || isLoadingPosicoes) {
    return <div>Carregando Ocupação de Posição...</div>;
  }

  if (errorOcupacao) {
    return <div>Erro ao carregar ocupação: {errorOcupacao.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Ocupação de Posição</h1>
          <p className="text-muted-foreground">
            Edite os detalhes da ocupação de posição.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Ocupação</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="posicaoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Posição</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma posição" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {posicoes?.map((posicao) => (
                          <SelectItem key={posicao.id} value={posicao.id}>
                            {posicao.nome} (ID: {posicao.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateOcupacaoMutation.isPending}>
                {updateOcupacaoMutation.isPending ? "Atualizando..." : "Atualizar Ocupação"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
