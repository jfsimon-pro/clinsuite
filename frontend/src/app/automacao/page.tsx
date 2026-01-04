'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Zap, Plus, Edit2, Trash2, Power, MessageSquare, Clock, User, Target, Lock } from 'lucide-react';

export default function AutomacaoPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div id="access-denied-container" className="p-8 text-center">
        <h1 id="access-denied-title" className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p id="access-denied-message" className="text-gray-600">Esta página é restrita para administradores.</p>
      </div>
    );
  }

  return (
    <div id="automacao-page-container" className="p-8 relative group">
      {/* Header */}
      <div id="page-header" className="mb-8">
        <div id="page-header-content" className="flex items-center justify-between">
          <div id="page-header-info">
            <h1 id="page-title" className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              Automações
            </h1>
            <p id="page-description" className="text-gray-600">
              Configure automações de WhatsApp e tarefas para otimizar seu fluxo de trabalho
            </p>
          </div>
          <button
            id="create-automation-btn"
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Nova Automação
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div id="stats-grid" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div id="stat-card-total" className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Total de Automações</p>
          <p className="text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-green-600 font-medium mt-2">8 ativas</p>
        </div>

        <div id="stat-card-executions" className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Mensagens Hoje</p>
          <p className="text-3xl font-bold text-gray-900">47</p>
          <p className="text-sm text-blue-600 font-medium mt-2">94% entregues</p>
        </div>

        <div id="stat-card-success" className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Taxa de Sucesso</p>
          <p className="text-3xl font-bold text-gray-900">94%</p>
          <p className="text-sm text-green-600 font-medium mt-2">Últimos 30 dias</p>
        </div>

        <div id="stat-card-pending" className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100 hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">Aguardando Envio</p>
          <p className="text-3xl font-bold text-gray-900">23</p>
          <p className="text-sm text-orange-600 font-medium mt-2">Nas próximas 24h</p>
        </div>
      </div>

      {/* Automation List */}
      <div id="automations-section" className="bg-white rounded-2xl shadow-sm">
        <div id="automations-header" className="px-6 py-4 border-b border-gray-200">
          <div id="automations-header-content" className="flex items-center justify-between">
            <div id="automations-header-info">
              <h2 id="automations-title" className="text-xl font-semibold text-gray-900">
                Automações Configuradas
              </h2>
              <p id="automations-subtitle" className="text-sm text-gray-600 mt-1">
                Gerencie todas as suas automações de WhatsApp e tarefas
              </p>
            </div>
            <div id="automations-filters" className="flex items-center gap-3">
              <select
                id="filter-status"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">Todas</option>
                <option value="active">Ativas</option>
                <option value="inactive">Inativas</option>
              </select>
              <select
                id="filter-type"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="task">Tarefas</option>
              </select>
            </div>
          </div>
        </div>

        <div id="automations-content" className="p-6">
          {/* Empty State */}
          <div id="automations-empty-state" className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-4">
              <Zap className="w-10 h-10 text-purple-600" />
            </div>
            <h3 id="empty-state-title" className="text-xl font-bold text-gray-900 mb-2">
              Nenhuma automação configurada
            </h3>
            <p id="empty-state-description" className="text-gray-600 mb-6 max-w-md mx-auto">
              Comece criando sua primeira automação para otimizar seu atendimento e aumentar a conversão de leads
            </p>
            <button
              id="empty-state-create-btn"
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Criar Primeira Automação
            </button>
          </div>

          {/* Example Automation Card (commented out) */}
          {/*
          <div id="automation-card-1" className="border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Boas-vindas Novo Lead</h3>
                    <p className="text-sm text-gray-500">Gatilho: Lead criado</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    ATIVA
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    📱 <strong>Ação 1:</strong> Aguardar 5 minutos → Enviar WhatsApp "Olá {'{nome}'}, seja bem-vindo(a)!"
                  </p>
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <span>🚀 47 execuções hoje</span>
                  <span>✅ 45 enviadas</span>
                  <span>📖 42 lidas</span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit2 className="w-5 h-5 text-blue-600" />
                </button>
                <button className="p-2 hover:bg-yellow-50 rounded-lg transition-colors">
                  <Power className="w-5 h-5 text-yellow-600" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
          */}
        </div>
      </div>

      {/* Info Banner */}
      <div id="info-banner" className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              💡 Como funcionam as Automações?
            </h3>
            <p className="text-blue-800 mb-3">
              As automações permitem que você configure ações automáticas baseadas em gatilhos (triggers) específicos:
            </p>
            <ul className="space-y-2 text-blue-800">
              <li>🎯 <strong>Gatilhos:</strong> Lead entra em etapa, Lead parado X dias, Tarefa criada, etc.</li>
              <li>⚡ <strong>Ações:</strong> Enviar WhatsApp, Criar tarefa, Mover lead, Notificar responsável</li>
              <li>📊 <strong>Métricas:</strong> Acompanhe taxa de entrega, leitura e resposta das mensagens</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 flex flex-col items-center justify-center cursor-not-allowed">
        <div className="bg-white p-4 rounded-full shadow-xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Disponível Junto com WhatsApp</h3>
        <p className="text-gray-600 font-medium">Esta funcionalidade será desbloqueada junto com o módulo do WhatsApp</p>
      </div>
    </div>
  );
}
