'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { Award, Crown, Medal, TrendingUp, Lightbulb } from 'lucide-react';

interface PerformanceUsuario {
  userId: string;
  userName: string;
  leadsAtribuidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  receitaGerada: number;
  ticketMedio: number;
  tempoMedioResposta: number;
  tarefasConcluidas: number;
  tarefasVencidas: number;
}

interface PerformanceEquipe {
  periodo: {
    startDate: string;
    endDate: string;
  };
  usuarios: PerformanceUsuario[];
  totalReceita: number;
  totalLeads: number;
  taxaConversaoMedia: number;
  melhorPerformer: {
    userId: string;
    userName: string;
    metrica: string;
  };
}

interface TeamPerformanceProps {
  className?: string;
  period?: string; // Período em dias (opcional, vem da página pai)
  unitId?: string; // ID da unidade para filtrar (opcional)
}

const PerformanceCard = ({ user, rank }: { user: PerformanceUsuario; rank: number }) => {
  const getRankIcon = (position: number) => {
    const iconClass = "w-8 h-8";
    switch (position) {
      case 1: return <div className="text-4xl">🥇</div>;
      case 2: return <div className="text-4xl">🥈</div>;
      case 3: return <div className="text-4xl">🥉</div>;
      default: return <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-lg font-bold text-gray-600">#{position}</span>
      </div>;
    }
  };

  const getPerformanceColor = (taxa: number) => {
    if (taxa >= 30) return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
    if (taxa >= 15) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
  };

  const getBorderColor = (position: number) => {
    if (position === 1) return 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-50';
    if (position === 2) return 'border-gray-400 bg-gradient-to-br from-gray-50 to-slate-50';
    if (position === 3) return 'border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50';
    return 'border-gray-200 bg-white';
  };

  return (
    <div className={`group relative rounded-2xl border-2 p-5 hover:shadow-xl transition-all duration-300 ${getBorderColor(rank)}`}>
      {/* Badge de posição */}
      <div className="absolute -top-4 -right-4 z-10">
        {getRankIcon(rank)}
      </div>

      {/* Header do card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-lg text-gray-900 mb-1">{user.userName}</h4>
          <p className="text-sm text-gray-500 font-medium">Posição #{rank}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg ${getPerformanceColor(user.taxaConversao)}`}>
          {user.taxaConversao.toFixed(1)}%
        </div>
      </div>

      {/* Métricas em grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
          <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Leads</p>
          <p className="font-bold text-xl text-blue-700">
            {user.leadsConvertidos}<span className="text-sm text-blue-500">/{user.leadsAtribuidos}</span>
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
          <p className="text-xs text-green-600 font-semibold uppercase mb-1">Receita</p>
          <p className="font-bold text-lg text-green-700">
            R$ {(user.receitaGerada / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
          <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Ticket</p>
          <p className="font-bold text-lg text-purple-700">
            R$ {(user.ticketMedio / 1000).toFixed(1)}k
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
          <p className="text-xs text-orange-600 font-semibold uppercase mb-1">Tarefas</p>
          <p className="font-bold text-xl text-orange-700">
            {user.tarefasConcluidas}
            {user.tarefasVencidas > 0 && (
              <span className="text-xs text-red-600 ml-1 font-normal">({user.tarefasVencidas}⚠️)</span>
            )}
          </p>
        </div>
      </div>

      {/* Barra de progresso moderna */}
      <div className="mt-4">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>Taxa de Conversão</span>
          <span>{user.taxaConversao.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${user.taxaConversao >= 30 ? 'bg-gradient-to-r from-green-400 to-green-600' :
              user.taxaConversao >= 15 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                'bg-gradient-to-r from-red-400 to-red-600'
              }`}
            style={{ width: `${Math.min(user.taxaConversao, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default function TeamPerformance({ className = '', period: externalPeriod, unitId }: TeamPerformanceProps) {
  const [data, setData] = useState<PerformanceEquipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalPeriod, setInternalPeriod] = useState('30');

  // Usa período externo se fornecido, senão usa interno
  const activePeriod = externalPeriod || internalPeriod;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(activePeriod));

        const params: any = {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        };

        // Incluir unitId se fornecido
        if (unitId) {
          params.unitId = unitId;
        }

        console.log('📊 TeamPerformance - Carregando com params:', params);

        const response = await analyticsApi.getPerformanceEquipe(params);

        setData(response.data);
      } catch (error) {
        console.error('Erro ao carregar performance da equipe:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activePeriod, unitId]);

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-2xl w-64"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.usuarios.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <TrendingUp className="w-16 h-16 mx-auto opacity-30" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum Dado Encontrado</h3>
          <p className="text-gray-500">Não há dados de performance para o período selecionado</p>
        </div>
      </div>
    );
  }

  // Ordenar usuários por receita gerada (melhor métrica)
  const sortedUsers = [...data.usuarios].sort((a, b) => b.receitaGerada - a.receitaGerada);

  return (
    <div className={className}>
      {/* Header com filtro próprio (apenas se não vier período externo) */}
      {/* Header com filtro próprio (apenas se não vier período externo) */}
      {!externalPeriod && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            Performance da Equipe
          </h3>
          <select
            value={internalPeriod}
            onChange={(e) => setInternalPeriod(e.target.value)}
            className="w-full md:w-auto bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-purple-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all cursor-pointer shadow-sm"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
      )}

      <div className="space-y-6">
        {/* Estatísticas gerais modernizadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border-2 border-green-200">
            <p className="text-sm font-medium text-green-600 uppercase tracking-wide mb-2">Receita Total</p>
            <p className="text-3xl font-bold text-green-700">
              R$ {(data.totalReceita / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border-2 border-blue-200">
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Leads Totais</p>
            <p className="text-3xl font-bold text-blue-700">{data.totalLeads}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border-2 border-purple-200">
            <p className="text-sm font-medium text-purple-600 uppercase tracking-wide mb-2">Conversão Média</p>
            <p className="text-3xl font-bold text-purple-700">
              {data.taxaConversaoMedia.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Destaque do melhor performer modernizado */}
        {/* Destaque do melhor performer modernizado */}
        {/* Destaque do melhor performer modernizado */}
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-3xl shadow-xl p-6 md:p-10 text-white transition-all duration-300 hover:shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20 transform rotate-12"></div>
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="relative z-10 w-full md:w-auto flex-1">
              <h4 className="font-bold text-lg md:text-xl flex items-center gap-2 mb-4 bg-white/20 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
                <Crown className="w-5 h-5" />
                <span>Melhor Performer</span>
              </h4>
              <p className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-3 text-shadow-sm">
                {data.melhorPerformer.userName}
              </p>
              <p className="text-lg md:text-xl opacity-95 font-medium flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Liderando em {data.melhorPerformer.metrica}
              </p>
            </div>

            {/* Troféu em destaque */}
            <div className="hidden md:block relative animate-float">
              <div className="text-[6rem] md:text-9xl drop-shadow-2xl filter transform hover:scale-110 transition-transform duration-500 cursor-pointer">🏆</div>
            </div>
          </div>
        </div>

        {/* Ranking da equipe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedUsers.map((user, index) => (
            <PerformanceCard
              key={user.userId}
              user={user}
              rank={index + 1}
            />
          ))}
        </div>

        {/* Insights modernizados */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
          <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Insights da Equipe
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-semibold mb-1">Alta Performance</p>
              <p className="text-2xl font-bold text-blue-800">
                {sortedUsers.filter(u => u.taxaConversao >= 30).length} colaboradores
              </p>
              <p className="text-xs text-blue-600 mt-1">Com conversão ≥30%</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-600 font-semibold mb-1">Atenção Necessária</p>
              <p className="text-2xl font-bold text-red-800">
                {sortedUsers.filter(u => u.tarefasVencidas > 0).length} colaboradores
              </p>
              <p className="text-xs text-red-600 mt-1">Com tarefas vencidas</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-600 font-semibold mb-1">Ticket Médio Geral</p>
              <p className="text-2xl font-bold text-green-800">
                R$ {(data.totalReceita / Math.max(data.usuarios.reduce((sum, u) => sum + u.leadsConvertidos, 0), 1) / 1000).toFixed(1)}k
              </p>
              <p className="text-xs text-green-600 mt-1">Por lead convertido</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}