'use client';

import { useEffect, useState } from 'react';
import { analyticsApi, crmApi } from '@/lib/api';
import { BarChart3, TrendingDown } from 'lucide-react';

interface ConversaoEtapa {
  etapaId: string;
  nome: string;
  ordem: number;
  totalLeads: number;
  valorTotal: number;
  valorMedio: number;
  taxaConversao: number;
  tempoMedio: number;
  cor?: string;
  icone?: string;
}

interface ConversaoFunil {
  funnelId: string;
  funnelNome: string;
  etapas: ConversaoEtapa[];
  taxaConversaoGeral: number;
  valorTotalPipeline: number;
  tempoMedioTotal: number;
}

interface Funnel {
  id: string;
  name: string;
}

interface FunnelChartProps {
  className?: string;
}

const FunnelStep = ({ etapa, maxLeads, isLast, nextEtapa }: {
  etapa: ConversaoEtapa;
  maxLeads: number;
  isLast: boolean;
  nextEtapa?: ConversaoEtapa;
}) => {
  const widthPercentage = maxLeads > 0 ? (etapa.totalLeads / maxLeads) * 100 : 0;
  const backgroundColor = etapa.cor || '#3B82F6';

  // Calcular taxa de conversão REAL para a próxima etapa
  const realConversionRate = nextEtapa && etapa.totalLeads > 0
    ? (nextEtapa.totalLeads / etapa.totalLeads) * 100
    : 0;

  return (
    <div className="relative group">
      {/* Card da etapa com design moderno */}
      <div className="relative">
        <div
          className="funnel-step transition-all duration-300 hover:scale-105"
          style={{
            width: `${Math.max(widthPercentage, 30)}%`,
            background: `linear-gradient(135deg, ${backgroundColor}ee, ${backgroundColor})`,
            minWidth: '200px',
            margin: '0 auto',
            borderRadius: '16px',
            position: 'relative',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          {/* Brilho superior */}
          <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-white/20 to-transparent h-1/2" />

          <div className="relative p-6 text-white">
            {/* Header da etapa */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {etapa.icone && (
                  <div className="text-3xl bg-white/20 backdrop-blur-sm rounded-xl p-2">
                    {etapa.icone}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-lg leading-tight">{etapa.nome}</h4>
                  <p className="text-xs opacity-80 mt-0.5">Etapa {etapa.ordem}</p>
                </div>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs opacity-80 mb-1">Leads</p>
                <p className="text-2xl font-bold">{etapa.totalLeads}</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs opacity-80 mb-1">Valor Total</p>
                <p className="text-lg font-bold">R$ {(etapa.valorTotal / 1000).toFixed(1)}k</p>
              </div>
            </div>

            {/* Info adicional */}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="bg-white/20 px-3 py-1 rounded-full">
                Ticket: R$ {etapa.valorMedio.toLocaleString('pt-BR')}
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                {Math.round(etapa.tempoMedio)} dias
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Seta de conversão moderna - CORRIGIDA */}
      {!isLast && nextEtapa && (
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center">
            <div className={`rounded-2xl px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-lg border-2 border-white ${
              realConversionRate >= 70 ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-800' :
              realConversionRate >= 50 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-800' :
              'bg-gradient-to-br from-red-100 to-red-200 text-red-800'
            }`}>
              <TrendingDown className={`w-4 h-4 ${
                realConversionRate >= 70 ? 'text-green-600' :
                realConversionRate >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <span className="text-lg">{realConversionRate.toFixed(1)}%</span>
              <span className="text-xs opacity-70">conversão</span>
            </div>
            <div className="text-center mt-2 text-xs text-gray-600 font-medium">
              {etapa.totalLeads} → {nextEtapa.totalLeads} leads
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function FunnelChart({ className = '' }: FunnelChartProps) {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [funnelData, setFunnelData] = useState<ConversaoFunil | null>(null);
  const [loading, setLoading] = useState(false);

  // Carregar funis disponíveis
  useEffect(() => {
    const loadFunnels = async () => {
      try {
        const response = await crmApi.getFunnels();
        setFunnels(response.data);
        if (response.data.length > 0 && !selectedFunnel) {
          setSelectedFunnel(response.data[0].id);
        }
      } catch (error) {
        console.error('Erro ao carregar funis:', error);
      }
    };

    loadFunnels();
  }, []);

  // Carregar dados do funil selecionado
  useEffect(() => {
    if (!selectedFunnel) return;

    const loadFunnelData = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getFunnelConversao(selectedFunnel);
        setFunnelData(response.data);
      } catch (error) {
        console.error('Erro ao carregar dados do funil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFunnelData();
  }, [selectedFunnel]);

  if (loading) {
    return (
      <div className={className}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded-xl w-64"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-2xl mx-auto" style={{ width: `${100 - i * 15}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const maxLeads = funnelData?.etapas.length > 0
    ? Math.max(...funnelData.etapas.map(e => e.totalLeads))
    : 0;

  return (
    <div className={className}>
      {/* Header com seletor de funil */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          Funil de Conversão
        </h3>
        <select
          value={selectedFunnel}
          onChange={(e) => setSelectedFunnel(e.target.value)}
          className="bg-white border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer shadow-sm"
        >
          {funnels.map((funnel) => (
            <option key={funnel.id} value={funnel.id}>
              {funnel.name}
            </option>
          ))}
        </select>
      </div>

      {funnelData ? (
        <div className="space-y-8">
          {/* Estatísticas do funil com design melhorado */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border-2 border-blue-200">
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-2">Taxa Geral</p>
              <p className="text-3xl font-bold text-blue-700">
                {funnelData.taxaConversaoGeral.toFixed(1)}%
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-5 border-2 border-green-200">
              <p className="text-sm font-medium text-green-600 uppercase tracking-wide mb-2">Pipeline Total</p>
              <p className="text-3xl font-bold text-green-700">
                R$ {(funnelData.valorTotalPipeline / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border-2 border-orange-200">
              <p className="text-sm font-medium text-orange-600 uppercase tracking-wide mb-2">Tempo Médio</p>
              <p className="text-3xl font-bold text-orange-700">
                {Math.round(funnelData.tempoMedioTotal)} dias
              </p>
            </div>
          </div>

          {/* Funil visual */}
          <div className="space-y-2">
            {funnelData.etapas.map((etapa, index) => (
              <FunnelStep
                key={etapa.etapaId}
                etapa={etapa}
                maxLeads={maxLeads}
                isLast={index === funnelData.etapas.length - 1}
                nextEtapa={funnelData.etapas[index + 1]}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <BarChart3 className="w-16 h-16 mx-auto opacity-30" />
          </div>
          <p className="text-gray-500 text-lg">Selecione um funil para ver as métricas de conversão</p>
        </div>
      )}
    </div>
  );
}