import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, Column } from "@/components/ui/data-table";
import { Plus, Building2, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuantitativeSite {
  id: string;
  name: string;
  type: "assistencial" | "não-assistencial";
  beds: number;
  patients: number;
  occupancy: number;
}

interface QualitativeQuestion {
  id: string;
  area: string;
  question: string;
  answer: string;
  score: number;
}

const mockQuantitativeSites: QuantitativeSite[] = [
  {
    id: "1",
    name: "UTI Adulto",
    type: "assistencial",
    beds: 20,
    patients: 18,
    occupancy: 90,
  },
  {
    id: "2",
    name: "Centro Cirúrgico",
    type: "assistencial", 
    beds: 8,
    patients: 6,
    occupancy: 75,
  },
  {
    id: "3",
    name: "Administrativo",
    type: "não-assistencial",
    beds: 0,
    patients: 0,
    occupancy: 0,
  },
];

const mockQualitativeQuestions: QualitativeQuestion[] = [
  {
    id: "1",
    area: "UTI",
    question: "Qual o perfil de complexidade dos pacientes?",
    answer: "Alta complexidade",
    score: 4,
  },
  {
    id: "2",
    area: "UTI",
    question: "Há necessidade de isolamento de contato?",
    answer: "Frequentemente",
    score: 3,
  },
  {
    id: "3",
    area: "Centro Cirúrgico",
    question: "Qual o tempo médio das cirurgias?",
    answer: "3-4 horas",
    score: 3,
  },
];

export default function FunctionalSites() {
  const [quantitativeSites] = useState<QuantitativeSite[]>(mockQuantitativeSites);
  const [qualitativeQuestions] = useState<QualitativeQuestion[]>(mockQualitativeQuestions);

  const quantitativeColumns: Column<QuantitativeSite>[] = [
    { key: "name", title: "Nome do Sítio" },
    {
      key: "type",
      title: "Tipo",
      render: (type) => (
        <Badge variant={type === "assistencial" ? "default" : "secondary"}>
          {type}
        </Badge>
      ),
    },
    {
      key: "beds",
      title: "Nº de Leitos",
      render: (beds) => beds > 0 ? beds : "N/A",
    },
    {
      key: "patients",
      title: "Nº de Pacientes",
      render: (patients) => patients > 0 ? patients : "N/A",
    },
    {
      key: "occupancy",
      title: "Taxa de Ocupação",
      render: (occupancy) => occupancy > 0 ? (
        <Badge 
          variant={occupancy >= 85 ? "destructive" : occupancy >= 70 ? "default" : "secondary"}
        >
          {occupancy}%
        </Badge>
      ) : "N/A",
    },
  ];

  const qualitativeColumns: Column<QualitativeQuestion>[] = [
    { key: "area", title: "Área" },
    { key: "question", title: "Pergunta Orientadora" },
    { key: "answer", title: "Resposta" },
    {
      key: "score",
      title: "Score",
      render: (score) => (
        <Badge variant="outline">{score}/5</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sítios Funcionais</h1>
          <p className="text-muted-foreground">
            Análise quantitativa e qualitativa das áreas assistenciais
          </p>
        </div>
      </div>

      <Tabs defaultValue="quantitative" className="space-y-6">
        <TabsList>
          <TabsTrigger value="quantitative" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Quantitativo
          </TabsTrigger>
          <TabsTrigger value="qualitative" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Qualitativo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quantitative">
          <div className="space-y-6">
            {/* Add New Site Form */}
            <Card>
              <CardHeader>
                <CardTitle>Cadastrar Sítio Funcional</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="site-name">Nome do Sítio</Label>
                    <Input id="site-name" placeholder="Ex: UTI Pediátrica" />
                  </div>
                  <div>
                    <Label htmlFor="site-type">Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assistencial">Assistencial</SelectItem>
                        <SelectItem value="não-assistencial">Não Assistencial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="site-beds">Nº de Leitos</Label>
                    <Input id="site-beds" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="site-patients">Nº de Pacientes</Label>
                    <Input id="site-patients" type="number" placeholder="0" />
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

            {/* Sites Table */}
            <Card>
              <CardHeader>
                <CardTitle>Sítios Funcionais Cadastrados</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={quantitativeSites}
                  columns={quantitativeColumns}
                  onEdit={(site) => console.log("Editar sítio:", site)}
                  onDelete={(site) => console.log("Excluir sítio:", site)}
                  searchPlaceholder="Buscar sítios..."
                />
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total de Leitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {quantitativeSites.reduce((sum, site) => sum + site.beds, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Em todas as unidades</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pacientes Internados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">
                    {quantitativeSites.reduce((sum, site) => sum + site.patients, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Atualmente ocupados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Taxa Média de Ocupação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">
                    {Math.round(
                      quantitativeSites
                        .filter(site => site.occupancy > 0)
                        .reduce((sum, site) => sum + site.occupancy, 0) /
                      quantitativeSites.filter(site => site.occupancy > 0).length
                    )}%
                  </div>
                  <p className="text-sm text-muted-foreground">Média geral</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qualitative">
          <div className="space-y-6">
            {/* Add New Question Form */}
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Pergunta Orientadora</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="question-area">Área</Label>
                      <Input id="question-area" placeholder="Ex: UTI" />
                    </div>
                    <div>
                      <Label htmlFor="question-score">Score (1-5)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o score" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 - Muito Baixo</SelectItem>
                          <SelectItem value="2">2 - Baixo</SelectItem>
                          <SelectItem value="3">3 - Médio</SelectItem>
                          <SelectItem value="4">4 - Alto</SelectItem>
                          <SelectItem value="5">5 - Muito Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="question-text">Pergunta</Label>
                    <Textarea 
                      id="question-text" 
                      placeholder="Ex: Qual o perfil de complexidade dos pacientes desta área?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="question-answer">Resposta</Label>
                    <Textarea 
                      id="question-answer" 
                      placeholder="Descreva a resposta detalhadamente..."
                    />
                  </div>
                  <Button className="gap-2 w-fit">
                    <Plus className="h-4 w-4" />
                    Adicionar Pergunta
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Questions Table */}
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Orientadoras</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={qualitativeQuestions}
                  columns={qualitativeColumns}
                  onEdit={(question) => console.log("Editar pergunta:", question)}
                  onDelete={(question) => console.log("Excluir pergunta:", question)}
                  searchPlaceholder="Buscar perguntas..."
                />
              </CardContent>
            </Card>

            {/* Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Diretrizes para Análise Qualitativa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong>Score 1-2:</strong> Baixa complexidade - Cuidados básicos, pacientes estáveis
                  </p>
                  <p>
                    <strong>Score 3:</strong> Complexidade média - Cuidados intermediários, monitorização
                  </p>
                  <p>
                    <strong>Score 4-5:</strong> Alta complexidade - Cuidados intensivos, múltiplas comorbidades
                  </p>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="font-medium">Perguntas Orientadoras Sugeridas:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Qual o perfil de complexidade dos pacientes?</li>
                      <li>Há necessidade de isolamento ou precauções especiais?</li>
                      <li>Qual a rotatividade média de pacientes?</li>
                      <li>Existem procedimentos específicos desta área?</li>
                      <li>Qual o tempo médio de permanência?</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}