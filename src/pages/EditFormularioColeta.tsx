import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, FormularioColeta } from "@/lib/api";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  // Add other fields as per FormularioColeta entity
});

type FormValues = z.infer<typeof formSchema>;

export default function EditFormularioColeta() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  const { data: formulario, isLoading: isLoadingFormulario, error: errorFormulario } = useQuery<FormularioColeta>({
    queryKey: ["formularioColeta", id],
    queryFn: () => id ? api.getFormularioColeta(id) : Promise.reject("ID do formulário não fornecido"),
    enabled: !!id,
  });

  useEffect(() => {
    if (formulario) {
      form.reset({
        nome: formulario.nome,
      });
    }
  }, [formulario, form]);

  const updateFormularioMutation = useMutation({
    mutationFn: (data: Partial<FormularioColeta>) => id ? api.updateFormularioColeta(id, data) : Promise.reject("ID do formulário não fornecido"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulariosColeta"] });
      queryClient.invalidateQueries({ queryKey: ["formularioColeta", id] });
      toast({
        title: "Sucesso",
        description: "Formulário de Coleta atualizado com sucesso.",
      });
      navigate("/formularios-coleta");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar formulário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    updateFormularioMutation.mutate(values);
  };

  if (isLoadingFormulario) {
    return <div>Carregando Formulário de Coleta...</div>;
  }

  if (errorFormulario) {
    return <div>Erro ao carregar formulário: {errorFormulario.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Formulário de Coleta</h1>
          <p className="text-muted-foreground">
            Edite os detalhes do formulário de coleta de dados.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Formulário</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Formulário</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do Formulário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={updateFormularioMutation.isPending}>
                {updateFormularioMutation.isPending ? "Atualizando..." : "Atualizar Formulário"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
