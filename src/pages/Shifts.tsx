import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Plus, Clock, Calendar } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  scaleType: string;
  sector: string;
  workHours: number;
}

interface Scale {
  id: string;
  name: string;
  type: "12x36" | "6x1" | "8x5";
  weeklyHours: number;
  sectors: string[];
  status: "ativa" | "inativa";
}

const mockShifts: Shift[] = [
  {
    id: "1",
    name: "Plantão Diurno",
    startTime: "07:00",
    endTime: "19:00",
    scaleType: "12x36",
    sector: "UTI",
    workHours: 12,
  },
  {
    id: "2",
    name: "Plantão Noturno",
    startTime: "19:00",
    endTime: "07:00",
    scaleType: "12x36",
    sector: "UTI",
    workHours: 12,
  },
  {
    id: "3",
    name: "Turno Manhã",
    startTime: "08:00",
    endTime: "14:00",
    scaleType: "6x1",
    sector: "Administrativo",
    workHours: 6,
  },
];

const mockScales: Scale[] = [
  {
    id: "1",
    name: "Escala UTI 12x36",
    type: "12x36",
    weeklyHours: 36,
    sectors: ["UTI", "Centro Cirúrgico"],
    status: "ativa",
  },
  {
    id: "2",
    name: "Escala Administrativa",
    type: "8x5",
    weeklyHours: 40,
    sectors: ["Administrativo", "RH"],
    status: "ativa",
  },
];

export default function Shifts() {
  const [shifts] = useState<Shift[]>(mockShifts);
  const [scales] = useState<Scale[]>(mockScales);
  const [selectedSector, setSelectedSector] = useState<string>("all");

  const sectors = ["UTI", "Centro Cirúrgico", "Emergência", "Clínica Médica", "Administrativo"];

  const filteredShifts = selectedSector === "all" 
    ? shifts 
    : shifts.filter(shift => shift.sector === selectedSector);

  const shiftColumns: Column<Shift>[] = [
    { key: "name", title: "Nome do Turno" },
    { key: "startTime", title: "Início" },
    { key: "endTime", title: "Fim" },
    {
      key: "scaleType",
      title: "Tipo de Escala",
      render: (type) => (
        <Badge variant="outline">{type}</Badge>
      ),
    },
    { key: "sector", title: "Setor" },
    {
      key: "workHours",
      title: "Horas",
      render: (hours) => `${hours}h`,
    },
  ];

  const scaleColumns: Column<Scale>[] = [
    { key: "name", title: "Nome da Escala" },
    {
      key: "type",
      title: "Tipo",
      render: (type) => (
        <Badge variant="default">{type}</Badge>
      ),
    },
    {
      key: "weeklyHours",
      title: "Horas/Semana",
      render: (hours) => `${hours}h`,
    },
    {
      key: "sectors",
      title: "Setores",
      render: (sectors: string[]) => (
        <div className="flex flex-wrap gap-1">
          {sectors.slice(0, 2).map((sector) => (
            <Badge key={sector} variant="secondary" className="text-xs">
              {sector}
            </Badge>
          ))}
          {sectors.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{sectors.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (status) => (
        <Badge variant={status === "ativa" ? "default" : "secondary"}>
          {status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Turnos e Escalas</h1>
          <p className="text-muted-foreground">
            Configure os turnos de trabalho e escalas dos profissionais
          </p>
        </div>
      </div>

      <Tabs defaultValue="shifts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Turnos
          </TabsTrigger>
          <TabsTrigger value="scales" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Escalas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shifts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Turnos</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Turno
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DataTable
                data={filteredShifts}
                columns={shiftColumns}
                onEdit={(shift) => console.log("Editar turno:", shift)}
                onDelete={(shift) => console.log("Excluir turno:", shift)}
                searchPlaceholder="Buscar turnos..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scales">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Escalas de Trabalho</CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Escala
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={scales}
                columns={scaleColumns}
                onEdit={(scale) => console.log("Editar escala:", scale)}
                onDelete={(scale) => console.log("Excluir escala:", scale)}
                searchPlaceholder="Buscar escalas..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}