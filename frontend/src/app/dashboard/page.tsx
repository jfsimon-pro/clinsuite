'use client';

import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { crmApi } from '@/lib/api';
import Link from 'next/link';
import {
  Building2,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Settings,
  Clock,
  Inbox,
  Rocket,
  Repeat,
  MessageSquare
} from 'lucide-react';

interface DashboardStats {
  tasks: {
    pending: number;
    overdue: number;
    completed: number;
    upcoming: number;
  };
  leads?: {
    total: number;
    byStage: Array<{
      stepName: string;
      count: number;
    }>;
  };
  taskRules?: {
    total: number;
    active: number;
  };
}

interface RecentTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  lead: {
    name?: string;
    phone: string;
  };
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoadingData(true);

      const [tasksRes, myTasksRes] = await Promise.all([
        crmApi.getTaskStats(),
        crmApi.getMyTasks()
      ]);

      const dashboardStats: DashboardStats = {
        tasks: {
          pending: 0,
          overdue: 0,
          completed: 0,
          upcoming: 0,
        }
      };

      if (tasksRes.data) {
        dashboardStats.tasks = tasksRes.data;
      }

      if (user?.role === 'ADMIN') {
        const [taskRulesStatsRes] = await Promise.all([
          crmApi.getTaskRuleStats()
        ]);

        if (taskRulesStatsRes.data) {
          dashboardStats.taskRules = {
            total: taskRulesStatsRes.data.totalRules || 0,
            active: taskRulesStatsRes.data.activeRules || 0,
          };
        }
      }

      setStats(dashboardStats);
      setRecentTasks(myTasksRes.data?.slice(0, 5) || []);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const getTaskStatusColor = (status: string, dueDate: string) => {
    if (status === 'COMPLETED') return 'text-green-600';

    const now = new Date();
    const due = new Date(dueDate);

    if (due < now) return 'text-red-600';

    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 24) return 'text-yellow-600';

    return 'text-blue-600';
  };

  const formatDueDate = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60));

    if (diffHours < 0) {
      const diffDays = Math.floor(Math.abs(diffHours) / 24);
      return `Atrasada há ${diffDays} dia(s)`;
    } else if (diffHours <= 24) {
      return `Vence em ${diffHours}h`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `Vence em ${diffDays} dia(s)`;
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-500 mx-auto"></div>
          <p className="text-gray-600 mt-4 font-medium">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Flat */}
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200">
          <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex flex-col md:flex-row items-start md:items-center gap-3">
            {user.role === 'ADMIN' ? (
              <>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <span>Dashboard Administrativo</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <span>Dashboard de Trabalho</span>
              </>
            )}
          </h1>
          <p className="text-gray-600 mt-3 md:ml-1 text-sm md:text-lg">
            Bem-vindo, <span className="font-semibold text-gray-800">{user.name}</span> - {user.company.name}
          </p>
        </div>

        {/* Stats Cards Flat */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Tarefas Pendentes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Tarefas Pendentes</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.tasks.pending || 0}
            </p>
            <Link href="/my-tasks" className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center group-hover:underline">
              Ver tarefas →
            </Link>
          </div>

          {/* Tarefas Atrasadas */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Tarefas Atrasadas</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.tasks.overdue || 0}
            </p>
            {(stats?.tasks?.overdue ?? 0) > 0 && (
              <p className="text-sm text-red-600 font-semibold">⚠️ Atenção necessária!</p>
            )}
          </div>

          {/* Tarefas Concluídas */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Concluídas Hoje</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {stats?.tasks.completed || 0}
            </p>
            <p className="text-sm text-green-600 font-medium">✨ Ótimo trabalho!</p>
          </div>

          {/* Próximas ou Admin Stats */}
          {user.role === 'ADMIN' ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Regras de Tarefas</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.taskRules?.active || 0}/{stats?.taskRules?.total || 0}
              </p>
              <Link href="/tasks" className="text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center group-hover:underline">
                Gerenciar →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-yellow-300 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">Próximas 24h</p>
              <p className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.tasks.upcoming || 0}
              </p>
              <p className="text-sm text-yellow-600 font-medium">⏰ Fique atento</p>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tarefas Recentes */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-3">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Minhas Tarefas Recentes</h3>
            </div>

            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Inbox className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">Nenhuma tarefa pendente</p>
                  <p className="text-sm text-gray-400 mt-1">Você está em dia!</p>
                </div>
              ) : (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{task.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Lead: {task.lead.name || task.lead.phone}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 mt-2 italic">{task.description}</p>
                        )}
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white border ${getTaskStatusColor(task.status, task.dueDate)}`}>
                        {formatDueDate(task.dueDate)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Link
                href="/my-tasks"
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center w-full py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
              >
                Ver todas as tarefas →
              </Link>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mr-3">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Ações Rápidas</h3>
            </div>

            <div className="space-y-3">
              <Link
                href="/my-tasks"
                className="block w-full p-4 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mr-4">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">Minhas Tarefas</p>
                    <p className="text-sm text-gray-600">Gerenciar tarefas pendentes</p>
                  </div>
                </div>
              </Link>

              <Link
                href="/funnels"
                className="block w-full p-4 bg-gray-50 hover:bg-green-50 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mr-4">
                    <Repeat className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-green-600 transition-colors">Funis de Venda</p>
                    <p className="text-sm text-gray-600">Acompanhar leads no pipeline</p>
                  </div>
                </div>
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  href="/tasks"
                  className="block w-full p-4 bg-gray-50 hover:bg-purple-50 rounded-xl border border-gray-200 hover:border-purple-300 transition-all duration-200 group"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mr-4">
                      <Settings className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">Configurar Tarefas</p>
                      <p className="text-sm text-gray-600">Gerenciar automações</p>
                    </div>
                  </div>
                </Link>
              )}

              <Link
                href="/whatsapp"
                className="block w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mr-4">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 group-hover:text-gray-700 transition-colors">WhatsApp</p>
                    <p className="text-sm text-gray-600">Integração de mensagens</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
