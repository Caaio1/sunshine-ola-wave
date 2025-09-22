import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Plus, Download, DollarSign, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CostEntry {
  id: string;
  area: string;
  role: string;
  baseSalary: number;
  benefits: number;
  totalCost: number;
  headcount: number;
  monthlyTotal: number;
}

const mockCosts: CostEntry[] = [
  {
    id: "1",
    area: "UTI",
    role: "Médico",
    baseSalary: 25000,
    benefits: 7500,
    totalCost: 32500,
    headcount: 8,
    monthlyTotal: 260000,
  },
  {
    id: "2",
    area: "UTI",
    role: "Enfermeiro",
    baseSalary: 8500,
    benefits: 2550,
    totalCost: 11050,
    headcount: 15,
    monthlyTotal: 165750,
  },
  {
    id: "3",
    area: "UTI",
    role: "Técnico de Enfermagem",
    baseSalary: 4200,
    benefits: 1260,
    totalCost: 5460,
    headcount: 24,
    monthlyTotal: 131040,
  },
  {
    id: "4",
    area: "Centro Cirúrgico",
    role: "Enfermeiro",
    baseSalary: 8500,
    benefits: 2550,
    totalCost: 11050,
    headcount: 6,
    monthlyTotal: 66300,
  },
];

export default function Costs() {
  const [costs] = useState<CostEntry[]>(mockCosts);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const costColumns: Column<CostEntry>[] = [
    { key: "area", title: "Área" },
    { key: "role", title: "Função" },
    {
      key: "baseSalary",
      title: "Salário Base",
      render: (value) => formatCurrency(value),
    },
    {
      key: "benefits",
      title: "Benefícios",
      render: (value) => formatCurrency(value),
    },
    {
      key: "totalCost",
      title: "Custo Total/Profissional",
      render: (value) => (
        <Badge variant="default" className="font-medium">
          {formatCurrency(value)}
        </Badge>
      ),
    },
    {
      key: "headcount",
      title: "Quantidade",
      render: (value) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      key: "monthlyTotal",
      title: "Total Mensal",
      render: (value) => (
        <span className="font-semibold text-primary">
          {formatCurrency(value)}
        </span>
      ),
    },
  ];

  const totalMonthlyCost = costs.reduce((sum, cost) => sum + cost.monthlyTotal, 0);
  const totalHeadcount = costs.reduce((sum, cost) => sum + cost.headcount, 0);
  const averageCostPerEmployee = totalMonthlyCost / totalHeadcount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Custos de Pessoal</h1>
          <p className="text-muted-foreground">
            Gerencie os custos da folha de pagamento por área e função
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalMonthlyCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+2.1%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Profissionais</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHeadcount}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-success font-medium">+3</span> vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio/Profissional</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageCostPerEmployee)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média geral da instituição
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">% do Orçamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">78.4%</div>
            <p className="text-xs text-muted-foreground">
              Do orçamento total consumido
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add New Cost Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Adicionar Custo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="new-area">Área</Label>
              <Input id="new-area" placeholder="Ex: UTI" />
            </div>
            <div>
              <Label htmlFor="new-role">Função</Label>
              <Input id="new-role" placeholder="Ex: Enfermeiro" />
            </div>
            <div>
              <Label htmlFor="new-salary">Salário Base</Label>
              <Input id="new-salary" type="number" placeholder="0,00" />
            </div>
            <div>
              <Label htmlFor="new-benefits">Benefícios</Label>
              <Input id="new-benefits" type="number" placeholder="0,00" />
            </div>
            <div>
              <Label htmlFor="new-headcount">Quantidade</Label>
              <Input id="new-headcount" type="number" placeholder="0" />
            </div>
            <div className="flex items-end">
              <Button className="gap-2 w-full">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Costs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhamento de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={costs}
            columns={costColumns}
            onEdit={(cost) => console.log("Editar custo:", cost)}
            onDelete={(cost) => console.log("Excluir custo:", cost)}
            searchPlaceholder="Buscar por área ou função..."
          />
          
          {/* Footer with totals */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center font-semibold">
              <span>TOTAL GERAL:</span>
              <span className="text-lg text-primary">
                {formatCurrency(totalMonthlyCost)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}