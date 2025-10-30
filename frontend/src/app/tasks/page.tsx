'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

// Tipos
interface StageTaskRule {
  id: string;
  stepId: string;
  name: string;
  description?: string;
  order: number;
  delayDays: number;
  delayType: 'ABSOLUTE' | 'AFTER_PREVIOUS';
  assignType: 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN';
  assignedUserId?: string;
  isActive: boolean;
  step: {
    id: string;
    name: string;
    order: number;
    funnel: {
      id: string;
      name: string;
    };
  };
  assignedUser?: {
    id: string;
    name: string;
  };
  tasks: Array<{
    id: string;
    status: string;
    createdAt: string;
  }>;
}

interface Funnel {
  id: string;
  name: string;
  steps: Array<{
    id: string;
    name: string;
    order: number;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function TasksPage() {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>('');
  const [selectedStep, setSelectedStep] = useState<string>('');
  const [taskRules, setTaskRules] = useState<StageTaskRule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<StageTaskRule | null>(null);

  // Formulário para nova regra de tarefa
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    delayDays: 1,
    delayType: 'ABSOLUTE' as 'ABSOLUTE' | 'AFTER_PREVIOUS',
    assignType: 'LEAD_OWNER' as 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN',
    assignedUserId: '',
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar regras quando etapa é selecionada
  useEffect(() => {
    if (selectedStep) {
      loadTaskRules();
    }
  }, [selectedStep]);

  const loadInitialData = async () => {
    try {
      const [funnelsRes, usersRes] = await Promise.all([
        api.get('/crm/funnels'),
        api.get('/auth/users')
      ]);
      
      setFunnels(funnelsRes.data);
      setUsers(usersRes.data || []);
      
      if (funnelsRes.data.length > 0) {
        setSelectedFunnel(funnelsRes.data[0].id);
        if (funnelsRes.data[0].steps.length > 0) {
          setSelectedStep(funnelsRes.data[0].steps[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskRules = async () => {
    if (!selectedStep) return;
    
    try {
      const response = await api.get(`/crm/task-rules/step/${selectedStep}`);
      setTaskRules(response.data);
    } catch (error) {
      console.error('Erro ao carregar regras de tarefas:', error);
    }
  };

  const handleCreateTaskRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStep) return;

    try {
      const nextOrder = Math.max(0, ...taskRules.map(rule => rule.order)) + 1;
      
      await api.post('/crm/task-rules', {
        ...formData,
        stepId: selectedStep,
        order: nextOrder,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        delayDays: 1,
        delayType: 'ABSOLUTE',
        assignType: 'LEAD_OWNER',
        assignedUserId: '',
      });

      setShowCreateModal(false);
      loadTaskRules();
    } catch (error) {
      console.error('Erro ao criar regra de tarefa:', error);
    }
  };

  const toggleRuleActive = async (ruleId: string, isActive: boolean) => {
    try {
      await api.put(`/crm/task-rules/${ruleId}/toggle?active=${!isActive}`);
      loadTaskRules();
    } catch (error) {
      console.error('Erro ao alterar status da regra:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta regra?')) return;

    try {
      await api.delete(`/crm/task-rules/${ruleId}`);
      loadTaskRules();
    } catch (error) {
      console.error('Erro ao deletar regra:', error);
    }
  };

  const openEditModal = (rule: StageTaskRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || '',
      delayDays: rule.delayDays,
      delayType: rule.delayType,
      assignType: rule.assignType,
      assignedUserId: rule.assignedUserId || '',
    });
    setShowEditModal(true);
  };

  const handleUpdateTaskRule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRule) return;

    try {
      await api.put(`/crm/task-rules/${editingRule.id}`, {
        ...formData,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        delayDays: 1,
        delayType: 'ABSOLUTE',
        assignType: 'LEAD_OWNER',
        assignedUserId: '',
      });

      setShowEditModal(false);
      setEditingRule(null);
      loadTaskRules();
    } catch (error) {
      console.error('Erro ao atualizar regra de tarefa:', error);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div id="access-denied-container" className="p-8 text-center">
        <h1 id="access-denied-title" className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
        <p id="access-denied-message" className="text-gray-600">Esta página é restrita para administradores.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div id="loading-container" className="p-8">
        <div id="loading-skeleton" className="animate-pulse space-y-4">
          <div id="loading-skeleton-title" className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div id="loading-skeleton-subtitle" className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div id="loading-skeleton-content" className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const selectedFunnelData = funnels.find(f => f.id === selectedFunnel);

  return (
    <div id="tasks-page-container" className="p-8">
      <div id="page-header" className="mb-8">
        <h1 id="page-title" className="text-3xl font-bold text-gray-900 mb-2">
          Configurar Tarefas Automáticas
        </h1>
        <p id="page-description" className="text-gray-600">
          Configure tarefas que serão criadas automaticamente quando leads entrarem em etapas específicas.
        </p>
      </div>

      {/* Seletores */}
      <div id="selectors-card" className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 id="selectors-title" className="text-xl font-semibold mb-4">Selecione o funil e etapa</h2>

        <div id="selectors-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div id="funnel-selector-wrapper">
            <label id="funnel-selector-label" className="block text-sm font-medium text-gray-700 mb-2">
              Funil de vendas
            </label>
            <select
              id="funnel-selector"
              value={selectedFunnel}
              onChange={(e) => {
                setSelectedFunnel(e.target.value);
                const funnel = funnels.find(f => f.id === e.target.value);
                if (funnel && funnel.steps.length > 0) {
                  setSelectedStep(funnel.steps[0].id);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {funnels.map(funnel => (
                <option key={funnel.id} value={funnel.id}>
                  {funnel.name}
                </option>
              ))}
            </select>
          </div>

          <div id="step-selector-wrapper">
            <label id="step-selector-label" className="block text-sm font-medium text-gray-700 mb-2">
              Etapa do funil
            </label>
            <select
              id="step-selector"
              value={selectedStep}
              onChange={(e) => setSelectedStep(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedFunnelData?.steps.map(step => (
                <option key={step.id} value={step.id}>
                  {step.order}. {step.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Regras */}
      <div id="task-rules-card" className="bg-white rounded-lg shadow">
        <div id="task-rules-header" className="px-6 py-4 border-b border-gray-200">
          <div id="task-rules-header-content" className="flex items-center justify-between">
            <div id="task-rules-header-info">
              <h2 id="task-rules-title" className="text-xl font-semibold text-gray-900">
                Tarefas Configuradas
              </h2>
              <p id="task-rules-step-name" className="text-sm text-gray-600 mt-1">
                {selectedFunnelData?.steps.find(s => s.id === selectedStep)?.name}
              </p>
            </div>
            <button
              id="create-task-btn"
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Nova Tarefa
            </button>
          </div>
        </div>

        <div id="task-rules-content" className="p-6">
          {taskRules.length === 0 ? (
            <div id="task-rules-empty-state" className="text-center py-8">
              <p id="empty-state-message" className="text-gray-500 mb-4">Nenhuma tarefa configurada para esta etapa.</p>
              <button
                id="create-first-task-btn"
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Criar primeira tarefa
              </button>
            </div>
          ) : (
            <div id="task-rules-list" className="space-y-4">
              {taskRules.map((rule) => (
                <div
                  key={rule.id}
                  id={`task-rule-${rule.id}`}
                  className={`border rounded-lg p-4 ${
                    rule.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div id={`task-rule-content-${rule.id}`} className="flex items-start justify-between">
                    <div id={`task-rule-info-${rule.id}`} className="flex-1">
                      <div id={`task-rule-header-${rule.id}`} className="flex items-center space-x-2 mb-2">
                        <span id={`task-rule-order-${rule.id}`} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          #{rule.order}
                        </span>
                        <h3 id={`task-rule-name-${rule.id}`} className="text-lg font-medium text-gray-900">
                          {rule.name}
                        </h3>
                        <span
                          id={`task-rule-status-${rule.id}`}
                          className={`text-xs px-2 py-1 rounded-full ${
                            rule.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>

                      {rule.description && (
                        <p id={`task-rule-description-${rule.id}`} className="text-gray-600 mb-2">{rule.description}</p>
                      )}

                      <div id={`task-rule-metadata-${rule.id}`} className="text-sm text-gray-500 space-x-4">
                        <span id={`task-rule-delay-${rule.id}`}>Prazo: {rule.delayDays} dia(s)</span>
                        <span id={`task-rule-type-${rule.id}`}>
                          Tipo: {rule.delayType === 'ABSOLUTE' ? 'Após entrada na etapa' : 'Após tarefa anterior'}
                        </span>
                        <span id={`task-rule-assign-${rule.id}`}>
                          Atribuição: {
                            rule.assignType === 'LEAD_OWNER' ? 'Responsável do lead' :
                            rule.assignType === 'FIXED_USER' ? rule.assignedUser?.name || 'Usuário fixo' :
                            'Distribuição automática'
                          }
                        </span>
                        <span id={`task-rule-executions-${rule.id}`}>Execuções: {rule.tasks.length}</span>
                      </div>
                    </div>

                    <div id={`task-rule-actions-${rule.id}`} className="flex items-center space-x-2">
                      <button
                        id={`task-rule-edit-${rule.id}`}
                        onClick={() => openEditModal(rule)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                      >
                        Editar
                      </button>
                      <button
                        id={`task-rule-toggle-${rule.id}`}
                        onClick={() => toggleRuleActive(rule.id, rule.isActive)}
                        className={`px-3 py-1 rounded text-sm ${
                          rule.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {rule.isActive ? 'Pausar' : 'Ativar'}
                      </button>
                      <button
                        id={`task-rule-delete-${rule.id}`}
                        onClick={() => deleteRule(rule.id)}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div id="create-modal-overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div id="create-modal-container" className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div id="create-modal-header" className="flex items-center justify-between mb-4">
              <h3 id="create-modal-title" className="text-lg font-semibold">Nova Tarefa Automática</h3>
              <button
                id="create-modal-close-btn"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form id="create-task-form" onSubmit={handleCreateTaskRule}>
              <div id="create-task-form-fields" className="space-y-4">
                <div id="form-field-name">
                  <label id="form-label-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Tarefa *
                  </label>
                  <input
                    id="form-input-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Ligar para o lead"
                    required
                  />
                </div>

                <div id="form-field-description">
                  <label id="form-label-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="form-input-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descreva o que deve ser feito nesta tarefa..."
                  />
                </div>

                <div id="form-field-delay">
                  <label id="form-label-delay" className="block text-sm font-medium text-gray-700 mb-1">
                    Prazo (dias)
                  </label>
                  <input
                    id="form-input-delay"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.delayDays}
                    onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div id="form-field-delay-type">
                  <label id="form-label-delay-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Prazo
                  </label>
                  <select
                    id="form-select-delay-type"
                    value={formData.delayType}
                    onChange={(e) => setFormData({ ...formData, delayType: e.target.value as 'ABSOLUTE' | 'AFTER_PREVIOUS' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ABSOLUTE">Após entrada na etapa</option>
                    <option value="AFTER_PREVIOUS">Após tarefa anterior</option>
                  </select>
                </div>

                <div id="form-field-assign-type">
                  <label id="form-label-assign-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Atribuição
                  </label>
                  <select
                    id="form-select-assign-type"
                    value={formData.assignType}
                    onChange={(e) => setFormData({ ...formData, assignType: e.target.value as 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LEAD_OWNER">Responsável do lead</option>
                    <option value="FIXED_USER">Usuário específico</option>
                    <option value="ROUND_ROBIN">Distribuição automática</option>
                  </select>
                </div>

                {formData.assignType === 'FIXED_USER' && (
                  <div id="form-field-assigned-user">
                    <label id="form-label-assigned-user" className="block text-sm font-medium text-gray-700 mb-1">
                      Usuário Responsável
                    </label>
                    <select
                      id="form-select-assigned-user"
                      value={formData.assignedUserId}
                      onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecionar usuário...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div id="create-modal-footer" className="flex justify-end space-x-3 mt-6">
                <button
                  id="create-modal-cancel-btn"
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  id="create-modal-submit-btn"
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editingRule && (
        <div id="edit-modal-overlay" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div id="edit-modal-container" className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div id="edit-modal-header" className="flex items-center justify-between mb-4">
              <h3 id="edit-modal-title" className="text-lg font-semibold">Editar Tarefa Automática</h3>
              <button
                id="edit-modal-close-btn"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRule(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form id="edit-task-form" onSubmit={handleUpdateTaskRule}>
              <div id="edit-task-form-fields" className="space-y-4">
                <div id="edit-form-field-name">
                  <label id="edit-form-label-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Tarefa *
                  </label>
                  <input
                    id="edit-form-input-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Ligar para o lead"
                    required
                  />
                </div>

                <div id="edit-form-field-description">
                  <label id="edit-form-label-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="edit-form-input-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Descreva o que deve ser feito nesta tarefa..."
                  />
                </div>

                <div id="edit-form-field-delay">
                  <label id="edit-form-label-delay" className="block text-sm font-medium text-gray-700 mb-1">
                    Prazo (dias)
                  </label>
                  <input
                    id="edit-form-input-delay"
                    type="number"
                    min="1"
                    max="365"
                    value={formData.delayDays}
                    onChange={(e) => setFormData({ ...formData, delayDays: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div id="edit-form-field-delay-type">
                  <label id="edit-form-label-delay-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Prazo
                  </label>
                  <select
                    id="edit-form-select-delay-type"
                    value={formData.delayType}
                    onChange={(e) => setFormData({ ...formData, delayType: e.target.value as 'ABSOLUTE' | 'AFTER_PREVIOUS' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ABSOLUTE">Após entrada na etapa</option>
                    <option value="AFTER_PREVIOUS">Após tarefa anterior</option>
                  </select>
                </div>

                <div id="edit-form-field-assign-type">
                  <label id="edit-form-label-assign-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Atribuição
                  </label>
                  <select
                    id="edit-form-select-assign-type"
                    value={formData.assignType}
                    onChange={(e) => setFormData({ ...formData, assignType: e.target.value as 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LEAD_OWNER">Responsável do lead</option>
                    <option value="FIXED_USER">Usuário específico</option>
                    <option value="ROUND_ROBIN">Distribuição automática</option>
                  </select>
                </div>

                {formData.assignType === 'FIXED_USER' && (
                  <div id="edit-form-field-assigned-user">
                    <label id="edit-form-label-assigned-user" className="block text-sm font-medium text-gray-700 mb-1">
                      Usuário Responsável
                    </label>
                    <select
                      id="edit-form-select-assigned-user"
                      value={formData.assignedUserId}
                      onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecionar usuário...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div id="edit-modal-footer" className="flex justify-end space-x-3 mt-6">
                <button
                  id="edit-modal-cancel-btn"
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingRule(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  id="edit-modal-submit-btn"
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}