import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  hospitaisApi,
  unidadesApi,
  leitosApi,
  colaboradoresApi,
  avaliacoesApi,
  avaliacoesSessaoApi,
} from "@/lib/api";
import {
  Users,
  Building2,
  Layers3,
  BedDouble,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";

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
interface Colaborador {
  id: string;
  ativo?: boolean;
}
interface SessaoAtivaDash {
  id: string;
  leitoId?: string;
  leito?: { id?: string; numero?: string };
  unidade?: { nome?: string };
  classificacao?: string;
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

  const classificacaoResumo = useMemo(() => {
    const mapa: Record<string, number> = {};
    avaliacoes.forEach((a) => {
      if (a.classificacao) {
        mapa[a.classificacao] = (mapa[a.classificacao] || 0) + 1;
      }
    });
    return Object.entries(mapa)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [avaliacoes]);

  const quickActions = [
    { label: "Hospitais", icon: Building2, path: "/hospitais", count: hospitais.length },
    { label: "Unidades", icon: Layers3, path: "/unidades", count: unidades.length },
    { label: "Leitos", icon: BedDouble, path: "/leitos", count: leitos.length },
    { label: "Colaboradores", icon: Users, path: "/colaboradores", count: colaboradoresAtivos },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Métricas Principais - Grid Simples */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="group p-6 bg-white rounded-lg border border-gray-200 hover:border-primary/40 hover:shadow-lg transition-all duration-200 text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {action.count}
              </div>
              <div className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {action.label}
              </div>
            </button>
          ))}
        </div>

        {/* Ocupação e Classificações - Layout Horizontal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ocupação */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Ocupação Atual</h3>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Taxa de Ocupação</span>
                <span className="text-2xl font-bold text-primary">{ocupacao}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${ocupacao}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Leitos Ocupados</span>
                  <div className="font-semibold">
                    {new Set(
                      sessoesAtivas
                        .map((s) => s?.leito?.id || s.leitoId)
                        .filter((v): v is string => typeof v === "string")
                    ).size}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Total de Leitos</span>
                  <div className="font-semibold">{leitos.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Classificações */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Classificações Recentes</h3>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            {classificacaoResumo.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sem avaliações registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classificacaoResumo.map(([classe, qtd]) => {
                  const total = avaliacoes.length || 1;
                  const pct = Math.round((qtd / total) * 100);
                  return (
                    <div key={classe} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{classe.replace(/_/g, " ")}</span>
                          <span className="text-gray-600">{qtd} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Atividade Recente - Lista Simples */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
            <p className="text-sm text-gray-600">Últimas avaliações realizadas</p>
          </div>
          <div className="divide-y divide-gray-200">
            {avaliacoes.slice(0, 5).map((av, idx) => (
              <div key={av.id || idx} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <div className="font-medium text-sm">
                        Avaliação {av.classificacao || "SCP"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {av.totalPontos} pontos
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {av.created_at ? new Date(av.created_at).toLocaleDateString("pt-BR") : "Hoje"}
                  </div>
                </div>
              </div>
            ))}
            {avaliacoes.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}