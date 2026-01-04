'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUnit } from '@/context/UnitContext';
import { analyticsApi } from '@/lib/api';
import FunnelChart from '@/components/FunnelChart';
import TeamPerformance from '@/components/TeamPerformance';
import MetricsChart from '@/components/MetricsChart';
import {
  DollarSign,
  Target,
  Ticket,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Calendar,
  BarChart3,
  UserX
} from 'lucide-react';

// Tipos baseados no backend
interface VendasMetrics {
  receitaTotal: number;
  receitaMes: number;
  receitaMesAnterior: number;
  ticketMedio: number;
  totalLeads: number;
  leadsConvertidos: number;
  leadsEsteMes: number;
  taxaConversao: number;
  tempoMedioFechamento: number;
  crescimentoReceita: number;
}

interface Alert {
  id: string;
  type: 'LEAD_QUENTE' | 'TAXA_BAIXA' | 'OPORTUNIDADE' | 'PRAZO_PROXIMO' | 'LEAD_PARADO';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  icon: string;
  data?: any;
  createdAt: string;
}

interface AlertsSummary {
  summary: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  recentAlerts: Alert[];
}

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: number; isPositive: boolean };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div id="metric-card-container" className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Gradient background decorativo */}
      <div id="metric-card-gradient-bg" className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

      <div id="metric-card-content" className="relative p-6 flex-1 flex flex-col">
        {/* Header com ícone */}
        <div id="metric-card-header" className="flex items-center justify-between mb-4">
          <div id="metric-card-icon-box" className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div id="metric-card-trend-badge" className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${trend.isPositive
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
              {Math.abs(trend.value).toFixed(1)}%
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div id="metric-card-body" className="mt-auto">
          <p id="metric-card-title" className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</p>
          <p id="metric-card-value" className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle ? (
            <p id="metric-card-subtitle" className="text-sm text-gray-600 font-medium">{subtitle}</p>
          ) : (
            <div className="h-5"></div> /* Spacer para manter alinhamento mesmo sem subtítulo */
          )}
        </div>
      </div>

      {/* Barra inferior decorativa */}
      <div id="metric-card-bottom-bar" className={`h-1 bg-gradient-to-r ${colorClasses[color]}`} />
    </div>
  );
};

const AlertCard = ({ alert }: { alert: Alert }) => {
  const priorityConfig = {
    HIGH: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100/50',
      border: 'border-red-300',
      text: 'text-red-900',
      badge: 'bg-red-500 text-white',
      icon: '🔥'
    },
    MEDIUM: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50',
      border: 'border-yellow-300',
      text: 'text-yellow-900',
      badge: 'bg-yellow-500 text-white',
      icon: '⚠️'
    },
    LOW: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100/50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      badge: 'bg-blue-500 text-white',
      icon: 'ℹ️'
    }
  };

  const config = priorityConfig[alert.priority];

  // Remove emojis do título (já mostrado no ícone)
  const titleWithoutEmoji = alert.title.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();

  return (
    <div id="alert-card-container" className={`group relative ${config.bg} border-2 ${config.border} rounded-xl p-5 hover:shadow-lg transition-all duration-300`}>
      <div id="alert-card-content" className="flex items-start justify-between">
        <div id="alert-card-left" className="flex items-start space-x-4 flex-1">
          <div id="alert-card-icon" className="text-3xl">{alert.icon}</div>
          <div id="alert-card-text" className="flex-1">
            <h4 id="alert-card-title" className={`font-bold text-base ${config.text} mb-1`}>{titleWithoutEmoji}</h4>
            <p id="alert-card-description" className={`text-sm ${config.text} opacity-80`}>{alert.description}</p>
          </div>
        </div>
        <span id="alert-card-badge" className={`${config.badge} px-3 py-1 rounded-lg text-xs font-bold shadow-sm`}>
          {alert.priority}
        </span>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<VendasMetrics | null>(null);
  const [alerts, setAlerts] = useState<AlertsSummary | null>(null);
  const [noShowMetrics, setNoShowMetrics] = useState<{ taxaNoShow: number; totalConsultasAgendadas: number; consultasNaoComparecidas: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [isCustomPeriod, setIsCustomPeriod] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showDatePicker && !target.closest('#date-picker-dropdown') && !target.closest('#date-picker-button')) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker]);

  const { selectedUnit } = useUnit();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'ADMIN') return;

    const loadData = async () => {
      try {
        setLoading(true);

        let startDate: Date;
        let endDate: Date;

        if (isCustomPeriod && customStartDate && customEndDate) {
          // Usar datas customizadas
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          // Calcular datas baseado no período selecionado
          endDate = new Date();
          startDate = new Date();
          startDate.setDate(endDate.getDate() - parseInt(selectedPeriod));
        }

        // Parâmetros com filtro de unidade
        const params: any = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };

        if (selectedUnit?.id) {
          params.unitId = selectedUnit.id;
        }

        const [metricsRes, alertsRes] = await Promise.all([
          analyticsApi.getVendasMetrics(params),
          analyticsApi.getAlertsSummary(selectedUnit?.id ? { unitId: selectedUnit.id } : {})
        ]);

        console.log(`📊 Analytics carregados (Unidade: ${selectedUnit?.name || 'Todas'}):`, metricsRes.data);
        setMetrics(metricsRes.data);
        setAlerts(alertsRes.data);

        // Carregar métricas de No-Show
        try {
          const noShowRes = await analyticsApi.getNoShow(params);
          setNoShowMetrics(noShowRes.data);
        } catch (noShowErr) {
          console.warn('Erro ao carregar métricas de no-show:', noShowErr);
        }
      } catch (err) {
        console.error('Erro ao carregar analytics:', err);
        setError('Erro ao carregar dados de analytics');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedPeriod, customStartDate, customEndDate, isCustomPeriod, selectedUnit, user]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p className="text-gray-600">Esta página é restrita para administradores.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div id="loading-container" className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-8">
        <div id="loading-wrapper" className="max-w-7xl mx-auto">
          <div id="loading-skeleton" className="animate-pulse space-y-8">
            <div id="loading-header-skeleton" className="h-12 bg-gray-200 rounded-2xl w-96"></div>
            <div id="loading-cards-skeleton" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} id={`loading-card-skeleton-${i}`} className="h-40 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
            <div id="loading-chart-skeleton" className="h-96 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div id="error-container" className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-8">
        <div id="error-wrapper" className="max-w-7xl mx-auto">
          <div id="error-card" className="bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-300 rounded-2xl p-6 shadow-lg">
            <div id="error-content" className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p id="error-message" className="text-red-900 font-semibold">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="page-container" className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-8">
      <div id="page-wrapper" className="max-w-7xl mx-auto space-y-8">
        {/* Header Moderno */}
        <div id="page-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div id="header-left" className="space-y-2">
            <div id="header-title-wrapper" className="flex items-center space-x-3">
              <div id="header-icon-box" className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div id="header-text">
                <h1 id="page-title" className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Analytics
                </h1>
                <p id="page-subtitle" className="text-gray-600 font-medium">Visão completa de performance e métricas</p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div id="header-filters" className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />

            {/* Select de período pré-definido */}
            <select
              id="period-select"
              value={isCustomPeriod ? 'custom' : selectedPeriod}
              onChange={(e) => {
                if (e.target.value === 'custom') {
                  setIsCustomPeriod(true);
                  setShowDatePicker(true);
                } else {
                  setIsCustomPeriod(false);
                  setSelectedPeriod(e.target.value);
                  setShowDatePicker(false);
                }
              }}
              className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer shadow-sm"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
              <option value="365">Último ano</option>
              <option value="custom">📅 Período Customizado</option>
            </select>

            {/* Date Picker Customizado */}
            {showDatePicker && (
              <div className="relative">
                <button
                  id="date-picker-button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
                >
                  {customStartDate && customEndDate
                    ? `${new Date(customStartDate).toLocaleDateString('pt-BR')} - ${new Date(customEndDate).toLocaleDateString('pt-BR')}`
                    : 'Selecionar Datas'
                  }
                </button>

                {/* Dropdown com inputs de data */}
                <div id="date-picker-dropdown" className="absolute right-0 top-full mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-xl p-6 z-50 min-w-[400px]">
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      Selecionar Período Customizado
                    </h4>

                    {/* Data Inicial */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        max={customEndDate || new Date().toISOString().split('T')[0]}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Data Final */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        min={customStartDate}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowDatePicker(false);
                          if (customStartDate && customEndDate) {
                            setIsCustomPeriod(true);
                          }
                        }}
                        disabled={!customStartDate || !customEndDate}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                      >
                        Aplicar
                      </button>
                      <button
                        onClick={() => {
                          setShowDatePicker(false);
                          setIsCustomPeriod(false);
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="px-4 py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>

                    {/* Preview do período */}
                    {customStartDate && customEndDate && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">Período selecionado:</span>
                          <br />
                          {new Date(customStartDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          {' até '}
                          {new Date(customEndDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          <br />
                          <span className="text-xs opacity-75">
                            ({Math.ceil((new Date(customEndDate).getTime() - new Date(customStartDate).getTime()) / (1000 * 60 * 60 * 24))} dias)
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-2">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'funnel', label: 'Funil de Vendas', icon: Target },
            { id: 'team', label: 'Performance da Equipe', icon: UserX },
            { id: 'alerts', label: 'Alertas', icon: AlertCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das Abas */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Métricas Principais */}
              {metrics && (
                <div id="metrics-section" className="space-y-4">
                  <h2 id="metrics-section-title" className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span>Métricas Principais</span>
                  </h2>
                  {/* 1. Destaque: Receita Total */}
                  <div className="mb-6">
                    <MetricCard
                      title="Receita Total"
                      value={`R$ ${metrics.receitaTotal.toLocaleString('pt-BR')}`}
                      icon={DollarSign}
                      color="green"
                      trend={{
                        value: metrics.crescimentoReceita,
                        isPositive: metrics.crescimentoReceita > 0
                      }}
                    />
                  </div>

                  {/* 2. Grid com os outros 4 cards */}
                  <div id="metrics-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                      title="Taxa de Conversão"
                      value={`${metrics.taxaConversao.toFixed(1)}%`}
                      subtitle={`${metrics.leadsConvertidos} de ${metrics.totalLeads} leads`}
                      icon={Target}
                      color="blue"
                    />
                    <MetricCard
                      title="Ticket Médio"
                      value={`R$ ${metrics.ticketMedio.toLocaleString('pt-BR')}`}
                      icon={Ticket}
                      color="purple"
                    />
                    <MetricCard
                      title="Tempo Médio"
                      value={`${Math.round(metrics.tempoMedioFechamento)} dias`}
                      subtitle="Até o fechamento"
                      icon={Clock}
                      color="orange"
                    />
                    {noShowMetrics && (
                      <MetricCard
                        title="Taxa de No-Show"
                        value={`${noShowMetrics.taxaNoShow.toFixed(1)}%`}
                        subtitle={`${noShowMetrics.consultasNaoComparecidas} de ${noShowMetrics.totalConsultasAgendadas} consultas`}
                        icon={UserX}
                        color="orange"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Gráficos e Análises */}
              <div id="charts-section" className="space-y-6">
                <h2 id="charts-section-title" className="text-xl font-bold text-gray-800">Análises Detalhadas</h2>
                <div id="charts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div id="chart-revenue-card" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
                    <MetricsChart type="revenue" period={parseInt(selectedPeriod)} />
                  </div>
                  <div id="chart-sources-card" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
                    <MetricsChart type="sources" period={parseInt(selectedPeriod)} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'alerts' && (
            <>
              {/* Alertas Inteligentes */}
              {alerts && (
                <div id="alerts-section" className="space-y-4">
                  <div id="alerts-header" className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h2 id="alerts-section-title" className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>Alertas Inteligentes</span>
                    </h2>
                    <div id="alerts-summary-badges" className="flex flex-wrap gap-3 w-full md:w-auto">
                      <div id="alerts-high-badge" className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg min-w-[80px]">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-red-700">{alerts.summary.high}</span>
                      </div>
                      <div id="alerts-medium-badge" className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg min-w-[80px]">
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-yellow-700">{alerts.summary.medium}</span>
                      </div>
                      <div id="alerts-low-badge" className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg min-w-[80px]">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-blue-700">{alerts.summary.low}</span>
                      </div>
                    </div>
                  </div>
                  {alerts.summary.total > 0 ? (
                    <div id="alerts-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {alerts.recentAlerts.map((alert) => (
                        <AlertCard key={alert.id} alert={alert} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">Tudo certo por aqui!</h3>
                      <p className="text-gray-500">Nenhum alerta pendente no momento.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'funnel' && (
            <>
              {/* Funil de Conversão */}
              <div id="funnel-section" className="space-y-6">
                <h2 id="funnel-section-title" className="text-xl font-bold text-gray-800">Funil de Conversão</h2>
                <div id="funnel-chart-card" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
                  <FunnelChart />
                </div>
              </div>
            </>
          )}

          {activeTab === 'team' && (
            <>
              {/* Performance da Equipe */}
              <div id="team-section" className="space-y-6">
                <h2 id="team-section-title" className="text-xl font-bold text-gray-800">Performance da Equipe</h2>
                <div id="team-performance-card" className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300">
                  <TeamPerformance period={selectedPeriod} unitId={selectedUnit?.id} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
