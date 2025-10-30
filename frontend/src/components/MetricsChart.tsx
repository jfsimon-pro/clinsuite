'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { analyticsApi } from '@/lib/api';

interface ChartData {
  name: string;
  value: number;
  date?: string;
  leads?: number;
  conversao?: number;
}

interface MetricsChartProps {
  type: 'revenue' | 'conversion' | 'sources';
  className?: string;
  period?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function MetricsChart({ type, className = '', period = 30 }: MetricsChartProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (type === 'revenue') {
          // Buscar dados REAIS de receita diária da API
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - period);

          const response = await analyticsApi.getReceitaDiaria({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          });

          setData(response.data);

        } else if (type === 'conversion') {
          // Dados de conversão por etapa do funil (mantido pois foi removido da página)
          const mockData = [
            { name: 'Novo Contato', value: 100, leads: 100, conversao: 85 },
            { name: 'Qualificação', value: 85, leads: 85, conversao: 70 },
            { name: 'Orçamento', value: 60, leads: 60, conversao: 40 },
            { name: 'Negociação', value: 25, leads: 25, conversao: 80 },
            { name: 'Fechamento', value: 20, leads: 20, conversao: 100 }
          ];
          setData(mockData);

        } else if (type === 'sources') {
          // Buscar dados REAIS de origem dos leads da API
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - period);

          const response = await analyticsApi.getOrigemLeads({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          });

          // Transformar dados da API para formato do gráfico
          const origens = response.data;
          const totalLeads = origens.reduce((sum: number, origem: any) => sum + origem.totalLeads, 0);

          const chartData = origens.map((origem: any) => ({
            name: origem.meio === 'NAO_INFORMADO' ? 'Não Informado' :
                  origem.meio.charAt(0) + origem.meio.slice(1).toLowerCase().replace(/_/g, ' '),
            value: totalLeads > 0 ? Math.round((origem.totalLeads / totalLeads) * 100) : 0,
          }));

          setData(chartData);
        }
      } catch (error) {
        console.error(`Erro ao carregar dados do gráfico ${type}:`, error);
        // Em caso de erro, mostrar dados vazios em vez de mockar
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [type, period]);

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `R$ ${value}`} />
              <Tooltip
                formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'conversion':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === 'leads' ? `${value} leads` : `${value}%`,
                  name === 'leads' ? 'Leads' : 'Conversão'
                ]}
              />
              <Bar dataKey="leads" fill="#3B82F6" name="leads" />
              <Bar dataKey="conversao" fill="#10B981" name="conversao" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'sources':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Participação']} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'revenue':
        return `💰 Evolução da Receita (${period} dias)`;
      case 'conversion':
        return '🎯 Conversão por Etapa do Funil';
      case 'sources':
        return '📊 Origem dos Leads';
      default:
        return 'Gráfico';
    }
  };

  return (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTitle()}</h3>
      {renderChart()}

      {/* Insights adicionais */}
      {type === 'revenue' && data.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Receita média diária: R$ {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      {type === 'conversion' && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            💡 Taxa de conversão geral do funil: {data.length > 0 ? ((data[data.length - 1].leads / data[0].leads) * 100).toFixed(1) : 0}%
          </p>
        </div>
      )}
    </div>
  );
}