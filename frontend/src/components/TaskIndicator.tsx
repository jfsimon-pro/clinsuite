'use client';

import { useState, useEffect } from 'react';
import { crmApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  assigned?: {
    id: string;
    name: string;
  };
  rule: {
    name: string;
    description?: string;
  };
}

interface TaskIndicatorProps {
  leadId: string;
  stepId: string;
}

const TaskIndicator = ({ leadId, stepId }: TaskIndicatorProps) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchLeadTasks();
  }, [leadId]);

  const fetchLeadTasks = async () => {
    try {
      const response = await crmApi.getTasksByLead(leadId);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas do lead:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      await crmApi.completeTask(taskId);
      
      // Recarregar tarefas após conclusão
      await fetchLeadTasks();
      
      // Mostrar feedback de sucesso
      // Você pode adicionar um toast ou notificação aqui se quiser
      console.log('Tarefa concluída com sucesso! A próxima tarefa da sequência foi criada automaticamente.');
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      alert('Erro ao concluir tarefa. Tente novamente.');
    } finally {
      setCompletingTaskId(null);
    }
  };

  const canCompleteTask = (task: Task) => {
    if (!user || task.status !== 'PENDING') return false;
    
    // Usuário pode concluir se é ADMIN ou se é o responsável pela tarefa
    return user.role === 'ADMIN' || task.assigned?.id === user.id;
  };

  const getTaskStatus = () => {
    if (loading) return 'loading';
    if (tasks.length === 0) return 'none';
    
    const pendingTasks = tasks.filter(task => task.status === 'PENDING');
    if (pendingTasks.length === 0) return 'completed';
    
    const now = new Date();
    const hasOverdue = pendingTasks.some(task => new Date(task.dueDate) < now);
    const hasNearDue = pendingTasks.some(task => {
      const dueDate = new Date(task.dueDate);
      const diffHours = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24; // Próximo do prazo = menos de 24h
    });
    
    if (hasOverdue) return 'overdue';
    if (hasNearDue) return 'warning';
    return 'ok';
  };

  const getIndicatorIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'none':
        return ''; // Não mostra nada se não há tarefas
      case 'completed':
        return '✅';
      case 'overdue':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'ok':
        return '🟢';
      default:
        return '';
    }
  };

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#ef4444'; // red-500
      case 'warning':
        return '#f59e0b'; // amber-500
      case 'ok':
        return '#10b981'; // emerald-500
      case 'completed':
        return '#6b7280'; // gray-500
      default:
        return '#9ca3af'; // gray-400
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < -24) {
      return `Atrasado há ${Math.abs(Math.floor(diffHours / 24))} dia(s)`;
    } else if (diffHours < 0) {
      return `Atrasado há ${Math.abs(Math.floor(diffHours))} hora(s)`;
    } else if (diffHours <= 24) {
      return `Vence em ${Math.floor(diffHours)} hora(s)`;
    } else {
      return `Vence em ${Math.floor(diffHours / 24)} dia(s)`;
    }
  };

  const status = getTaskStatus();
  const icon = getIndicatorIcon(status);
  
  if (!icon) return null; // Não renderiza nada se não há tarefas ou está carregando

  return (
    <div className="relative">
      <button
        onClick={() => setShowTooltip(!showTooltip)}
        className="text-sm hover:scale-110 transition-transform cursor-pointer"
        title="Ver tarefas"
      >
        {icon}
      </button>

      {showTooltip && (
        <>
          {/* Overlay para fechar o tooltip */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowTooltip(false)}
          />
          
          {/* Tooltip */}
          <div className="absolute right-0 top-6 z-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">
                Tarefas ({tasks.length})
              </h4>
              <button
                onClick={() => setShowTooltip(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma tarefa encontrada</p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-3 rounded-lg border ${
                      task.status === 'COMPLETED'
                        ? 'bg-green-50 border-green-200'
                        : task.status === 'OVERDUE' || new Date(task.dueDate) < new Date()
                        ? 'bg-red-50 border-red-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h5 className="text-sm font-medium text-gray-900 truncate">
                        {task.rule.name}
                      </h5>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'OVERDUE' || new Date(task.dueDate) < new Date()
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {task.status === 'COMPLETED' ? 'Concluída' : formatDate(task.dueDate)}
                      </span>
                    </div>
                    
                    {task.rule.description && (
                      <p className="text-xs text-gray-600 mb-2">
                        {task.rule.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {task.assigned && (
                        <p className="text-xs text-gray-500">
                          Responsável: {task.assigned.name}
                        </p>
                      )}
                      
                      {canCompleteTask(task) && (
                        <button
                          onClick={() => completeTask(task.id)}
                          disabled={completingTaskId === task.id}
                          className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {completingTaskId === task.id ? (
                            <>
                              <span className="inline-block animate-spin mr-1">⚪</span>
                              Concluindo...
                            </>
                          ) : (
                            <>✓ Concluir</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {tasks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {tasks.filter(t => t.status === 'COMPLETED').length} concluídas
                  </span>
                  <span>
                    {tasks.filter(t => t.status === 'PENDING').length} pendentes
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskIndicator;