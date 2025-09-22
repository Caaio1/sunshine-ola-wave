
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function RelatoriosEstatisticasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e Estatísticas</h1>
          <p className="text-muted-foreground">Acesse e gere relatórios do sistema.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Estatísticas por Unidade</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p>Visualização e download de PDF com ocupação e distribuição de classificações.</p>
            <Button asChild><Link to="/relatorios-estatisticas/gerais">Abrir</Link></Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Exportações</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p>Exportar hospitais, unidades, leitos e colaboradores em CSV.</p>
            <Button asChild><Link to="/relatorios-estatisticas/exportar">Abrir</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
