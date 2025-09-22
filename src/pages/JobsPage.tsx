import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function JobsPage() {
  const [date, setDate] = useState<string>("");
  const { toast } = useToast();

  const runSessionExpiryMutation = useMutation({
    mutationFn: (date: string) => api.runSessionExpiry(date),
    onSuccess: (data) => {
      toast({
        title: "Sucesso",
        description: `Job de expiração de sessão para ${data.date} executado com sucesso.`, 
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Erro ao executar job: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data.",
        variant: "destructive",
      });
      return;
    }
    runSessionExpiryMutation.mutate(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Jobs</h1>
          <p className="text-muted-foreground">
            Execute tarefas administrativas no backend.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executar Expiração de Sessão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="session-expiry-date">Data para expirar sessões</Label>
            <Input
              id="session-expiry-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} disabled={runSessionExpiryMutation.isPending}>
            {runSessionExpiryMutation.isPending ? "Executando..." : "Executar Job"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
