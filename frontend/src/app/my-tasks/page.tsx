'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { crmApi } from '@/lib/api';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  lead: {
    id: string;
    name?: string;
    phone: string;
  };
  rule: {
    id: string;
    name: string;
    description?: string;
  };
  assignedUser: {
    id: string;
    name: string;
  };
  completedAt?: string;
  createdAt: string;
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyTasks();
  }, [filter]);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter.toUpperCase();
      const response = await crmApi.getMyTasks(status);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar minhas tarefas:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string) => {
    if (!confirm('Tem certeza que deseja marcar esta tarefa como concluída?')) return;

    try {
      await crmApi.completeTask(taskId);
      alert('Tarefa concluída! A próxima tarefa da sequência será criada automaticamente.');
      fetchMyTasks(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao concluir tarefa:', error);
      alert('Erro ao concluir tarefa. Tente novamente.');
    }
  };

  const getStatusColor = (status: string, dueDate: string) => {
    if (status === 'COMPLETED') return 'text-green-600 bg-green-50 border-green-200';
    if (status === 'CANCELLED') return 'text-gray-600 bg-gray-50 border-gray-200';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) return 'text-red-600 bg-red-50 border-red-200'; // Atrasada
    
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) return 'text-yellow-600 bg-yellow-50 border-yellow-200'; // Próximo do prazo
    
    return 'text-blue-600 bg-blue-50 border-blue-200'; // Normal
  };

  const getStatusText = (status: string, dueDate: string) => {
    if (status === 'COMPLETED') return 'Concluída';
    if (status === 'CANCELLED') return 'Cancelada';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now) {
      const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      return `Atrasada há ${diffDays} dia(s)`;
    }
    
    const diffHours = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60));
    if (diffHours <= 24) return `Vence em ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Vence em ${diffDays} dia(s)`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (!user) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📋 Minhas Tarefas
        </h1>
        <p className="text-gray-600">
          Gerencie suas tarefas automáticas do CRM
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Concluídas
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Lista de Tarefas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {filter === 'pending' && 'Tarefas Pendentes'}
            {filter === 'completed' && 'Tarefas Concluídas'}
            {filter === 'all' && 'Todas as Tarefas'}
            <span className="ml-2 text-sm text-gray-500">({tasks.length})</span>
          </h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Carregando tarefas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma tarefa encontrada
              </h3>
              <p className="text-gray-600">
                {filter === 'pending' && 'Você não tem tarefas pendentes no momento.'}
                {filter === 'completed' && 'Você ainda não concluiu nenhuma tarefa.'}
                {filter === 'all' && 'Não há tarefas para mostrar.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 ${getStatusColor(task.status, task.dueDate)}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Lead: <strong>{task.lead.name || task.lead.phone}</strong>
                      </p>
                      {task.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 bg-current text-white">
                        {getStatusText(task.status, task.dueDate)}
                      </span>
                      {task.status === 'PENDING' && (
                        <div>
                          <button
                            onClick={() => completeTask(task.id)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            ✓ Concluir Tarefa
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Prazo:</span>
                      <br />
                      {formatDate(task.dueDate)}
                    </div>
                    <div>
                      <span className="font-medium">Criada em:</span>
                      <br />
                      {formatDate(task.createdAt)}
                    </div>
                    {task.completedAt && (
                      <div>
                        <span className="font-medium">Concluída em:</span>
                        <br />
                        {formatDate(task.completedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}