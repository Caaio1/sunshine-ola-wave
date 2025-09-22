import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, ScpMetodo, ClassificacaoCuidado } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MinusCircle, PlusCircle } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  key: z.string().min(1, "Chave é obrigatória"),
  description: z.string().optional(),
  questions: z.array(z.object({
    key: z.string().min(1, "Chave da pergunta é obrigatória"),
    text: z.string().min(1, "Texto da pergunta é obrigatório"),
    options: z.array(z.object({
      label: z.string().min(1, "Label da opção é obrigatório"),
      value: z.coerce.number().min(0, "Valor da opção deve ser um número positivo"),
    })).min(1, "Pelo menos uma opção é obrigatória"),
  })).min(1, "Pelo menos uma pergunta é obrigatória"),
  faixas: z.array(z.object({
    min: z.coerce.number().min(0, "Mínimo deve ser um número positivo"),
    max: z.coerce.number().min(0, "Máximo deve ser um número positivo"),
    classe: z.nativeEnum(ClassificacaoCuidado, { message: "Classe de cuidado é obrigatória" }),
  })).min(1, "Pelo menos uma faixa é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateScpMetodo() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      key: "",
      description: "",
      questions: [{ key: "", text: "", options: [{ label: "", value: 0 }] }],
      faixas: [{ min: 0, max: 0, classe: ClassificacaoCuidado.MINIMOS }],
    },
  });

  const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const { fields: faixaFields, append: appendFaixa, remove: removeFaixa } = useFieldArray({
    control: form.control,
    name: "faixas",
  });

  const createScpMetodoMutation = useMutation({
    mutationFn: (data: FormValues) => api.createScpMetodo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scpMetodos"] });
      toast({
        title: "Sucesso",
        description: "Método SCP criado com sucesso.",
      });
      navigate("/scp");
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar método SCP: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createScpMetodoMutation.mutate(values);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Método SCP</h1>
          <p className="text-muted-foreground">
            Defina um novo Sistema de Classificação de Pacientes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Método SCP</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título do Método SCP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave</FormLabel>
                    <FormControl>
                      <Input placeholder="Chave única (ex: FUGULIN)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descrição detalhada do método" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Questions Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Perguntas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questionFields.map((item, index) => (
                    <div key={item.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeQuestion(index)}>
                          <MinusCircle className="h-4 w-4 mr-2" /> Remover Pergunta
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`questions.${index}.key`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chave da Pergunta</FormLabel>
                            <FormControl>
                              <Input placeholder="Chave única da pergunta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`questions.${index}.text`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Texto da Pergunta</FormLabel>
                            <FormControl>
                              <Input placeholder="Texto da pergunta" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Options for each question */}
                      <Label>Opções da Pergunta</Label>
                      {form.watch(`questions.${index}.options`).map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-end gap-2">
                          <FormField
                            control={form.control}
                            name={`questions.${index}.options.${optionIndex}.label`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Label</FormLabel>
                                <FormControl>
                                  <Input placeholder="Label da opção" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`questions.${index}.options.${optionIndex}.value`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="Valor da opção" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentOptions = form.getValues(`questions.${index}.options`);
                              if (currentOptions.length > 1) {
                                const newOptions = currentOptions.filter((_, i) => i !== optionIndex);
                                form.setValue(`questions.${index}.options`, newOptions);
                              }
                            }}
                          >
                            <MinusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue(`questions.${index}.options`, [...form.getValues(`questions.${index}.options`), { label: "", value: 0 }])}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Opção
                      </Button>
                    </div>
                  ))}
                  <Button type="button" onClick={() => appendQuestion({ key: "", text: "", options: [{ label: "", value: 0 }] })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Pergunta
                  </Button>
                </CardContent>
              </Card>

              {/* Faixas Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Faixas de Classificação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faixaFields.map((item, index) => (
                    <div key={item.id} className="border p-4 rounded-md space-y-4">
                      <div className="flex justify-end">
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeFaixa(index)}>
                          <MinusCircle className="h-4 w-4 mr-2" /> Remover Faixa
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`faixas.${index}.min`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pontuação Mínima</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Mínimo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`faixas.${index}.max`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pontuação Máxima</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Máximo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`faixas.${index}.classe`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classe de Cuidado</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a classe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.values(ClassificacaoCuidado).map((classe) => (
                                  <SelectItem key={classe} value={classe}>
                                    {classe}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={() => appendFaixa({ min: 0, max: 0, classe: ClassificacaoCuidado.MINIMOS })}>
                    <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Faixa
                  </Button>
                </CardContent>
              </Card>

              <Button type="submit" disabled={createScpMetodoMutation.isPending}>
                {createScpMetodoMutation.isPending ? "Criando..." : "Criar Método SCP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
