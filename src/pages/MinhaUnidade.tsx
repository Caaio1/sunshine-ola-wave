/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bed,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
} from "lucide-react";
import {
  unidadesApi,
  leitosApi,
  avaliacoesSessaoApi,
  hospitaisApi,
  metodosScpApi,
  colaboradoresApi,
  relatoriosApi,
} from "@/lib/api";
import { unwrapData, normalizeList } from "@/lib/apiUtils";
import { DimensionaLogo } from "@/components/DimensionaLogo";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast, useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSelectedDate } from "@/hooks/useSelectedDate";
import { MetodoScp } from "./MetodosScp";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface MetodoScpModel {
  id: string;
  key: string;
  title: string;
  description?: string;
  questions: any[];
  faixas?: { min: number; max: number; classe: string }[];
}

interface Unidade {
  id: string;
  nome: string;
  hospitalId?: string;
  hospital?: { id?: string; nome?: string };
  scpMetodo: MetodoScp;
  scpMetodoId: string;
}

interface Leito {
  id: string;
  numero: string;
  status?: "PENDENTE" | "ATIVO" | "VAGO" | "INATIVO";
  unidadeId: string;
  prontuario?: string;
}

interface SessaoAtiva {
  id: string;
  leitoId?: string;
  expiresAt?: string | number;
  leito?: { id: string };
  totalPontos?: number;
  classificacao?: string;
  scp?: string;
  statusSessao?: "ATIVA" | "EXPIRADA" | "LIBERADA";
  prontuario?: string | null;
  autor?: {
    id: string;
    nome: string;
  };
  colaboradorNome?: string; // fallback field
}

interface Hospital {
  id: string;
  nome: string;
  cnpj: string;
  endereco?: string;
  telefone?: string;

  created_at: string;
}

// Helper to compute badge values for a bed (leito)
function getLeitoBadge(leito: Leito) {
  let badgeVariant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "neutral"
    | undefined;
  let badgeLabel: string | undefined;
  let badgeIcon: JSX.Element | null = null;
  let badgeClassName: string | undefined;

  switch (leito.status) {
    case "VAGO":
      badgeVariant = "neutral";
      badgeLabel = "Vago";
      badgeIcon = <Bed className="h-3 w-3" />;
      break;
    case "ATIVO":
      badgeVariant = "success";
      badgeLabel = "Ativo";
      badgeIcon = <CheckCircle className="h-3 w-3" />;
      break;
    case "INATIVO":
      // Use yellow styling for inactive beds
      badgeVariant = "destructive";
      badgeLabel = "Inativo";
      badgeIcon = <AlertCircle className="h-3 w-3" />;
      // Tailwind yellow/amber classes for visual emphasis
      badgeClassName = "bg-yellow-50 text-yellow-800 border border-yellow-200";
      break;
    case "PENDENTE":
    default:
      badgeVariant = "destructive";
      badgeLabel = "Pendente";
      badgeIcon = <Bed className="h-3 w-3" />;
      break;
  }

  return { badgeVariant, badgeLabel, badgeIcon, badgeClassName };
}

export default function MinhaUnidade() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { selectedDate, clearSelectedDate } = useSelectedDate();

  // State variables
  const [unidade, setUnidade] = useState<Unidade | null>(null);
  const [hospitalName, setHospitalName] = useState<string>("");
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [sessoesAtivas, setSessoesAtivas] = useState<SessaoAtiva[]>([]);
  const [avaliacaoStatusMap, setAvaliacaoStatusMap] = useState<
    Record<string, "nao_realizada" | "em_andamento" | "concluida">
  >({});
  const [search, setSearch] = useState("");
  const [coberturaPercent, setCoberturaPercent] = useState(0);
  const [leitosOcupadosCount, setLeitosOcupadosCount] = useState(0);
  const [metodoScp, setMetodoScp] = useState<MetodoScpModel | null>(null);

  // Debug: contexto de autenticação e navegação
  useEffect(() => {
    console.info("MinhaUnidade: mount/update", { user, id, selectedDate });
  }, [user, id, selectedDate]);

  const carregarUnidade = useCallback(async () => {
    if (!id) return;
    try {
      const resp = (await unidadesApi.obter(id)) as Unidade;
      const data = resp as any;
      setUnidade(data || null);

      const hospitalId = (data as any)?.hospitalId;
      if (!hospitalId) {
        toast({
          title: "Hospital não encontrado",
          description: "Não foi possível encontrar o hospital relacionado.",
          variant: "destructive",
        });
        return;
      }

      const hospitalResp = await hospitaisApi.obter(hospitalId);

      const hospital = hospitalResp as any;
      if (!hospital) {
        toast({
          title: "Hospital não encontrado",
          description: "Não foi possível encontrar o hospital relacionado.",
          variant: "destructive",
        });
        return;
      }

      const metodoResp = await metodosScpApi.obter(resp.scpMetodoId);

      const scp = metodoResp as MetodoScpModel;
      setMetodoScp(scp);

      // Set hospital name for the header
      setHospitalName(hospital.nome || "");
    } catch (e) {
      toast({
        title: "Erro",
        description: "Unidade não encontrada",
        variant: "destructive",
      });
      navigate("/meu-hospital");
    }
  }, [id, navigate, toast]);

  const carregarLeitos = useCallback(async () => {
    if (!id) return;
    try {
      console.log("Carregando leitos para unidade:", id);
      const resp = await leitosApi.listar(id);
      const list: Leito[] = Array.isArray(resp)
        ? (resp as Leito[])
        : (resp as { data?: Leito[] })?.data || [];
      console.log("Leitos carregados:", list);
      setLeitos(list);
    } catch (e) {
      console.error("Erro ao carregar leitos:", e);
      toast({
        title: "Erro",
        description: "Falha ao carregar leitos",
        variant: "destructive",
      });
    }
  }, [id, toast]);

  const carregarSessoes = useCallback(async () => {
    if (!id) return;
    try {
      // Data atual local simples
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const todayStr = `${yyyy}-${mm}-${dd}`;

      // Se há uma data selecionada E NÃO é hoje, mostra dados históricos
      if (selectedDate && selectedDate !== todayStr) {
        const resp = await relatoriosApi.resumoDiario(selectedDate, id);
        const d =
          unwrapData<Record<string, unknown>>(resp) ||
          (resp as Record<string, unknown>);
        const avaliacoes = Array.isArray(d?.avaliacoes)
          ? (d!.avaliacoes as unknown[])
          : [];
        const adaptedSessions: SessaoAtiva[] = avaliacoes.map((av: any) => ({
          id: av.id || `${av.leitoId}-${selectedDate}`,
          leitoId: av.leitoId,
          leito: { id: av.leitoId },
          totalPontos: av.totalPontos || 0,
          classificacao: av.classificacao,
          scp: av.scp || "SCP",
          statusSessao: "ATIVA" as const,
          prontuario: av.prontuario,
          colaborador: av.colaborador,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime(),
        }));
        setSessoesAtivas(adaptedSessions);
      } else {
        const resp = await avaliacoesSessaoApi.listarAtivas(id);
        const list = normalizeList<SessaoAtiva>(resp);
        setSessoesAtivas(list);
      }
    } catch (e) {
      console.warn("Falha ao carregar sessões", e);
      setSessoesAtivas([]);
    } finally {
      console.log("Sessões ativas:", sessoesAtivas);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    if (!id) return;
    carregarUnidade();
    carregarLeitos();
    carregarSessoes();
  }, [id, carregarUnidade, carregarLeitos, carregarSessoes]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(() => carregarSessoes(), 30000);
    return () => clearInterval(interval);
  }, [id, carregarSessoes]);

  useEffect(() => {
    if (!leitos.length) {
      setCoberturaPercent(0);
      setLeitosOcupadosCount(0);
      return;
    }
    const leitoIdsSessao = new Set(
      sessoesAtivas
        .map((s) => s?.leito?.id || s.leitoId)
        .filter((v): v is string => !!v)
    );
    setLeitosOcupadosCount(leitoIdsSessao.size);
    const avaliando = Object.entries(avaliacaoStatusMap)
      .filter(([_, status]) => status === "em_andamento")
      .map(([leitoId]) => leitoId);
    const coberturaSet = new Set<string>([...leitoIdsSessao, ...avaliando]);
    setCoberturaPercent(
      leitos.length ? Math.round((coberturaSet.size / leitos.length) * 100) : 0
    );
  }, [leitos, sessoesAtivas, avaliacaoStatusMap]);

  const handleIniciarAvaliacao = (leito: Leito) => {
    navigate(`/minha-unidade/${id}/leito/${leito.id}/avaliar`);
  };

  const handleMarcarVago = async (leito: Leito) => {
    try {
      console.log("Marcando leito como vago:", leito.id);

      const response = await leitosApi.alterarStatus(leito.id, "VAGO");
      console.log("Resposta da API ao marcar como vago:", response);
      const updated =
        unwrapData<Record<string, any>>(response) ||
        (response as Record<string, any>);
      if (updated && updated.id) {
        setLeitos((prev) =>
          prev.map((l) => (l.id === leito.id ? { ...l, ...updated } : l))
        );
      } else {
        await carregarLeitos();
      }

      toast({
        title: "Sucesso",
        description: "Leito marcado como vago",
      });

        description: "Falha ao marcar leito como vago",
        variant: "destructive",
      });
    }
  };

  const leitosFiltrados = leitos.filter((l) =>
    l.numero.toLowerCase().includes(search.toLowerCase())
  );

  const goBack = () => {
    if (selectedDate) {
      // Se está visualizando dados históricos, volta para dias gerados
      navigate(`/lista-dias/${unidade.hospitalId}/${unidade.id}`);
    } else {
      // Se está nos dados atuais, volta para meu hospital
      navigate("/meu-hospital");
    }
  };

  if (!user) {
    console.warn("MinhaUnidade: usuário não encontrado", {
      hasUser: !!user,
      idParam: id,
      selectedDate,
    });
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando autenticação...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header profissional com logo integrada */}
      <header className="sticky top-0 z-40 bg-primary text-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo e botão voltar */}
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="text-white hover:bg-white/20 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <DimensionaLogo size="lg" variant="white" />
            {hospitalName && (
              <div className="hidden md:block">
                <span className="text-lg font-semibold">{hospitalName}</span>
              </div>
            )}
          </div>

          {/* Título centralizado */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold">
              {unidade?.nome || "Minha Unidade"}
            </h1>
          </div>

          {/* Menu do usuário e data */}
          <div className="flex items-center space-x-4">
            <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
              {selectedDate
                ? (() => {
                    const [y, m, d] = selectedDate
                      .split("-")
                      .map((v) => parseInt(v, 10));
                    const dt = new Date(y, (m || 1) - 1, d || 1);
                    return dt.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                    });
                  })()
                : "Hoje"}
            </span>
            <span className="text-sm font-semibold tracking-wide bg-white/20 px-3 py-1 rounded-lg backdrop-blur">
              {user.nome?.split(" ")[0] || user.nome}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {!unidade && <div>Carregando...</div>}
        {unidade && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Unidade</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <p className="text-sm text-muted-foreground">
                    {unidade.nome}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total de Leitos</Label>
                  <p className="text-sm text-muted-foreground">
                    {leitos.length}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center mb-4">
                <Input
                  placeholder="Buscar leito..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Tabela de Leitos */}
              <div className="bg-white rounded-lg border border-gray-200">
                {leitosFiltrados.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum leito encontrado.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Leito</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Avaliação</TableHead>
                        <TableHead>Prontuário</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leitosFiltrados
                        .sort((a, b) =>
                          a.numero.localeCompare(b.numero, undefined, {
                            numeric: true,
                            sensitivity: "base",
                          })
                        )
                        .map((leito) => {
                          const sessao = sessoesAtivas.find(
                            (s) => (s?.leito?.id || s.leitoId) === leito.id
                          );
                          const { badgeVariant, badgeLabel, badgeIcon, badgeClassName } = getLeitoBadge(leito);
                          const temAvaliacaoAtiva = sessao && sessao.statusSessao === "ATIVA";

                          return (
                            <TableRow key={leito.id} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Bed className="h-5 w-5 text-primary" />
                                  <span className="font-semibold">Leito {leito.numero}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={badgeVariant}
                                  className={`flex items-center space-x-1 ${badgeClassName || ""}`}
                                >
                                  {badgeIcon}
                                  <span>{badgeLabel}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {sessao && sessao.statusSessao === "ATIVA" ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                      {sessao.classificacao || "—"}
                                    </div>
                                    {sessao.autor?.nome && (
                                      <div className="text-xs text-gray-500">
                                        por {sessao.autor.nome}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">
                                  {sessao?.prontuario || "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex space-x-2 justify-end">
                                  {leito.status !== "INATIVO" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarcarVago(leito)}
                                        disabled={leito.status === "VAGO"}
                                      >
                                        Marcar Vago
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleIniciarAvaliacao(leito)}
                                        disabled={!!temAvaliacaoAtiva}
                                      >
                                        {sessao ? "Reavaliar" : "Avaliar"}
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
