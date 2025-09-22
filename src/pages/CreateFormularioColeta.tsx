import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, FormularioColeta } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  // Add other fields as per FormularioColeta entity
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFormularioColeta() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
    },
  });

  const createFormularioMutation = useMutation({
    mutationFn: (data: Partial<FormularioColeta>) => api.createFormularioColeta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formulariosColeta"] });
      toast({
        title: "Sucesso",
        description: "Formulário de Coleta criado com sucesso.",
      });
      navigate("/formularios-coleta");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar formulário: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createFormularioMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Formulário de Coleta</h1>
          <p className="text-muted-foreground">
            Preencha os campos para criar um novo formulário de coleta de dados.
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

              <Button type="submit" disabled={createFormularioMutation.isPending}>
                {createFormularioMutation.isPending ? "Criando..." : "Criar Formulário"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
