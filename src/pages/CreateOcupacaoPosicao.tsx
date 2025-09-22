import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, OcupacaoPosicao, Posicao } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  posicaoId: z.string().min(1, "Posição é obrigatória"),
  // Add other fields as per OcupacaoPosicao entity, e.g., dataInicio, dataFim
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateOcupacaoPosicao() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      posicaoId: "",
    },
  });

  const { data: posicoes, isLoading: isLoadingPosicoes } = useQuery<Posicao[]>({
    queryKey: ["posicoes"],
    queryFn: () => api.getSitiosFuncionais().then(sitios => sitios.flatMap(sitio => sitio.posicoes || [])), // Assuming Posicoes are nested under SitiosFuncionais
  });

  const createOcupacaoMutation = useMutation({
    mutationFn: (data: Partial<OcupacaoPosicao>) => api.createOcupacaoPosicao(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ocupacoesPosicoes"] });
      toast({
        title: "Sucesso",
        description: "Ocupação de Posição criada com sucesso.",
      });
      navigate("/relatorios-estatisticas/ocupacoes-posicoes");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar ocupação: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createOcupacaoMutation.mutate(values);
  };

  if (isLoadingPosicoes) {
    return <div>Carregando posições...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Ocupação de Posição</h1>
          <p className="text-muted-foreground">
            Preencha os campos para criar uma nova ocupação de posição.
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <Button type="submit" disabled={createOcupacaoMutation.isPending}>
                {createOcupacaoMutation.isPending ? "Criando..." : "Criar Ocupação"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
