import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  Layers3,
  BedDouble,
  Activity,
  CalendarDays,
  Gauge,
  FileBarChart2,
} from "lucide-react";
import {
  hospitaisApi,
  unidadesApi,
  leitosApi,
  colaboradoresApi,
  avaliacoesApi,
  avaliacoesSessaoApi,
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";

// Tipagens simples (parciais) para evitar uso de any
interface Hospital {
  id: string;
}
interface Unidade {
  id: string;
  nome?: string;
}
interface Leito {
  id: string;
  numero?: string;
}
interface Internacao {
  id: string;
  leitoId?: string;
  leito?: Leito;
  paciente?: { nome?: string };
  pacienteNome?: string;
  leitoNumero?: string;
  unidade?: { nome?: string };
  unidadeNome?: string;
}
interface Colaborador {
  id: string;
  ativo?: boolean;
}
interface SessaoAtivaDash {
  id: string;
  leitoId?: string;
  leito?: { id?: string; numero?: string };
  unidade?: { nome?: string };
  unidadeNome?: string;
  leitoNumero?: string;
  classificacao?: string;
  classe?: string;
  expiresAt?: string;
}

interface AvaliacaoResumo {
  id?: string;
  classificacao?: string;
  totalPontos?: number;
  created_at?: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [hospitais, setHospitais] = useState<Hospital[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [leitos, setLeitos] = useState<Leito[]>([]);
  const [internacoesAtivas, setInternacoesAtivas] = useState<Internacao[]>([]);
  const [sessoesAtivas, setSessoesAtivas] = useState<SessaoAtivaDash[]>([]);
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoResumo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [hRes, uRes, lRes, cRes, aRes, sRes] = await Promise.all([
          hospitaisApi.listar().catch(() => []),
          unidadesApi.listar().catch(() => []),
          leitosApi.listar().catch(() => []),
          colaboradoresApi.listar().catch(() => []),
          avaliacoesApi.listarTodas().catch(() => []),
          avaliacoesSessaoApi.listarAtivas().catch(() => []),
        ]);
        const norm = <T,>(r: unknown): T[] => {
          if (Array.isArray(r)) return r as T[];
          if (
            r &&
            typeof r === "object" &&
            "data" in r &&
            Array.isArray((r as { data?: unknown }).data)
          ) {
            return ((r as { data?: unknown[] }).data || []) as T[];
          }
          return [] as T[];
        };
        setHospitais(norm(hRes));
        setUnidades(norm(uRes));
        setLeitos(norm(lRes));
        setInternacoesAtivas([]);
        setColaboradores(norm(cRes));
        setAvaliacoes(norm(aRes).slice(-10).reverse());
        setSessoesAtivas(norm(sRes));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const ocupacao = useMemo(() => {
    if (leitos.length === 0) return 0;
    const usados = new Set(
      sessoesAtivas
        .map((s) => s?.leito?.id || s.leitoId)
        .filter((v): v is string => typeof v === "string")
    );
    return Math.round((usados.size / leitos.length) * 100);
  }, [leitos.length, sessoesAtivas]);

  const colaboradoresAtivos = useMemo(
    () => colaboradores.filter((c) => c.ativo !== false).length,
    [colaboradores]
  );

  const quickActions: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    description: string;
  }[] = [
    { label: "Cadastrar Usuário", icon: Users, path: "/colaboradores", description: "Adicionar novo profissional" },
    { label: "Nova Escala", icon: CalendarDays, path: "/escalas", description: "Criar escala de trabalho" },
    { label: "Relatório de Custos", icon: FileBarChart2, path: "/reports", description: "Visualizar custos detalhados" },
    { label: "Análise SCP", icon: Activity, path: "/avaliacoes", description: "Classificação de pacientes" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="pb-4">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de dimensionamento de equipes</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Profissionais</p>
                <p className="text-2xl font-bold">{loading ? "—" : "1,247"}</p>
                <p className="text-xs text-success">+12.5% em relação ao mês anterior</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border border-border/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Turnos Ativos</p>
                <p className="text-2xl font-bold">{loading ? "—" : "24"}</p>
                <p className="text-xs text-success">+2 em relação ao mês anterior</p>
              </div>
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border border-border/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Mensal da Folha</p>
                <p className="text-2xl font-bold">{loading ? "—" : "R$ 2.847.320"}</p>
                <p className="text-xs text-destructive">+5.2% em relação ao mês anterior</p>
              </div>
              <FileBarChart2 className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="bg-card border border-border/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Ocupação</p>
                <p className="text-2xl font-bold">{loading ? "—" : `${ocupacao}%`}</p>
                <p className="text-xs text-success">+3.1% em relação ao mês anterior</p>
              </div>
              <Gauge className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-card border border-border/20 rounded-lg">
            <div className="p-4 border-b border-border/20">
              <h2 className="text-lg font-semibold">Ações Rápidas</h2>
            </div>
            <div className="p-4 space-y-3">
              {quickActions.map((action) => (
                <div
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts and Notifications */}
          <div className="bg-card border border-border/20 rounded-lg">
            <div className="p-4 border-b border-border/20">
              <h2 className="text-lg font-semibold">Alertas e Notificações</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Déficit de Enfermeiros - UTI</p>
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded">
                      Urgente
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 vagas em aberto no turno noturno
                  </p>
                  <p className="text-xs text-muted-foreground">2h atrás</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Nova Escala Aprovada</p>
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Info
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Escala de dezembro do Centro Cirúrgico
                  </p>
                  <p className="text-xs text-muted-foreground">4h atrás</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-success/5 border border-success/20">
                <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">Metas de Produtividade</p>
                    <span className="bg-success text-success-foreground text-xs px-2 py-1 rounded">
                      Sucesso
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    97% das metas atingidas este mês
                  </p>
                  <p className="text-xs text-muted-foreground">1 dia atrás</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
