import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    // Tentar pegar token do localStorage (se estiver no cliente)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se token expirou (401), redirecionar para login
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Funções auxiliares para endpoints específicos
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),

  register: (userData: { email: string; password: string; name: string }) =>
    api.post('/auth/register', userData),

  refresh: () => api.post('/auth/refresh'),

  getUsers: () => api.get('/auth/users'),
};

export const crmApi = {
  // Funis
  getFunnels: (unitId?: string) => api.get('/crm/funnels', { params: unitId ? { unitId } : {} }),
  createFunnel: (data: { name: string }) => api.post('/crm/funnels', data),
  updateFunnel: (id: string, data: { name: string }) => api.put(`/crm/funnels/${id}`, data),
  deleteFunnel: (id: string) => api.delete(`/crm/funnels/${id}`),

  // Etapas
  createStep: (funnelId: string, data: { name: string }) =>
    api.post(`/crm/funnels/${funnelId}/steps`, data),
  updateStep: (id: string, data: { name: string }) => api.put(`/crm/steps/${id}`, data),
  deleteStep: (id: string) => api.delete(`/crm/steps/${id}`),

  // Leads
  getLeads: (filters?: any) => api.get('/crm/leads', { params: filters }),
  createLead: (data: any) => api.post('/crm/leads', data),
  updateLead: (id: string, data: any) => api.put(`/crm/leads/${id}`, data),
  deleteLead: (id: string) => api.delete(`/crm/leads/${id}`),
  moveLead: (id: string, stepId: string) => api.put(`/crm/leads/${id}/move`, { stepId }),

  // Regras de Tarefas
  getTaskRules: (stepId?: string) =>
    stepId ? api.get(`/crm/task-rules/step/${stepId}`) : api.get('/crm/task-rules'),
  createTaskRule: (data: any) => api.post('/crm/task-rules', data),
  updateTaskRule: (id: string, data: any) => api.put(`/crm/task-rules/${id}`, data),
  deleteTaskRule: (id: string) => api.delete(`/crm/task-rules/${id}`),
  toggleTaskRule: (id: string, active: boolean) =>
    api.put(`/crm/task-rules/${id}/toggle?active=${active}`),
  reorderTaskRules: (stepId: string, ruleIds: string[]) =>
    api.put(`/crm/task-rules/step/${stepId}/reorder`, { ruleIds }),
  duplicateTaskRules: (fromStepId: string, toStepId: string) =>
    api.post(`/crm/task-rules/step/${fromStepId}/duplicate`, { toStepId }),
  getTaskRuleStats: () => api.get('/crm/task-rules/stats'),

  // Tarefas
  getTasks: (filters?: any) => api.get('/crm/tasks', { params: filters }),
  getMyTasks: (status?: string) =>
    api.get('/crm/tasks/my-tasks', status ? { params: { status } } : undefined),
  getUpcomingTasks: (days?: number) =>
    api.get('/crm/tasks/my-tasks/upcoming', days ? { params: { days } } : undefined),
  getOverdueTasks: () => api.get('/crm/tasks/my-tasks/overdue'),
  getTasksByLead: (leadId: string) => api.get(`/crm/tasks/lead/${leadId}`),
  getTask: (id: string) => api.get(`/crm/tasks/${id}`),
  createTask: (data: any) => api.post('/crm/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/crm/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/crm/tasks/${id}`),
  completeTask: (id: string, notes?: string) =>
    api.post(`/crm/tasks/${id}/complete`, notes ? { notes } : {}),
  generateTasks: (leadId: string, stepId: string) =>
    api.post('/crm/tasks/generate', { leadId, stepId }),
  processExpiredTasks: () => api.post('/crm/tasks/process-expired'),
  cancelLeadTasks: (leadId: string, reason?: string) =>
    api.post(`/crm/tasks/lead/${leadId}/cancel-tasks`, reason ? { reason } : {}),
  reactivateLeadTasks: (leadId: string) =>
    api.post(`/crm/tasks/lead/${leadId}/reactivate-tasks`),
  getTaskStats: (startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return api.get('/crm/tasks/stats', { params });
  },
  getAutomationStats: () => api.get('/crm/tasks/automation/stats'),
};

export const analyticsApi = {
  // Métricas principais
  getDashboard: (filtros?: any) => api.get('/analytics/dashboard', { params: filtros }),
  getVendasMetrics: (filtros?: any) => api.get('/analytics/vendas', { params: filtros }),
  getPipelineValue: (filtros?: any) => api.get('/analytics/pipeline', { params: filtros }),

  // Funil e conversão
  getFunnelConversao: (funnelId: string, filtros?: any) =>
    api.get(`/analytics/funil/${funnelId}/conversao`, { params: filtros }),

  // Performance da equipe
  getPerformanceEquipe: (filtros?: any) =>
    api.get('/analytics/performance-equipe', { params: filtros }),

  // Origem dos leads
  getOrigemLeads: (filtros?: any) =>
    api.get('/analytics/origem-leads', { params: filtros }),

  // Receita diária (gráfico temporal)
  getReceitaDiaria: (filtros?: any) =>
    api.get('/analytics/receita-diaria', { params: filtros }),

  // Análise de procedimentos
  getAnalyseProcedimentos: (filtros?: any) =>
    api.get('/analytics/procedimentos', { params: filtros }),

  // Estatísticas gerais
  getGeneralStats: () => api.get('/analytics/stats'),
  getTopPerformers: () => api.get('/analytics/top-performers'),
  getRecentActivity: () => api.get('/analytics/recent-activity'),

  // Alertas inteligentes
  getAlerts: () => api.get('/analytics/alerts'),
  getAlertsSummary: (filtros?: any) => api.get('/analytics/alerts/summary', { params: filtros }),

  // Métricas de No-Show
  getNoShow: (filtros?: any) => api.get('/analytics/no-show', { params: filtros }),

  // Templates de funil
  getFunnelTemplates: () => api.get('/funnel-templates'), // Endpoint público
  installFunnelTemplates: () => api.post('/crm/templates/install'),
};

export const unitsApi = {
  getUnits: () => api.get('/units'),
  getUnit: (id: string) => api.get(`/units/${id}`),
  createUnit: (data: any) => api.post('/units', data),
  updateUnit: (id: string, data: any) => api.patch(`/units/${id}`, data),
  deleteUnit: (id: string) => api.delete(`/units/${id}`),
};

export const whatsappApi = {
  getConnections: () => api.get('/whatsapp/connections'),
  createConnection: (data: { name: string }) => api.post('/whatsapp/connections', data),
  getConnection: (id: string) => api.get(`/whatsapp/connections/${id}`),
  connectWhatsApp: (id: string) => api.post(`/whatsapp/connections/${id}/connect`),
  disconnectWhatsApp: (id: string) => api.delete(`/whatsapp/connections/${id}/connect`),
  getConnectionChats: (id: string) => api.get(`/whatsapp/connections/${id}/chats`),
  getChatMessages: (chatId: string) => api.get(`/whatsapp/chats/${chatId}/messages`),
  sendMessage: (chatId: string, content: string) =>
    api.post(`/whatsapp/chats/${chatId}/messages`, { content }),
  getConnectionStatus: (id: string) => api.get(`/whatsapp/connections/${id}/status`),
  getQRCode: (id: string) => api.get(`/whatsapp/connections/${id}/qr`),
  getPairingCode: (id: string) => api.get(`/whatsapp/connections/${id}/pairing-code`),
  resetConnection: (id: string) => api.delete(`/whatsapp/connections/${id}/reset`),
  syncConnection: (id: string) => api.post(`/whatsapp/connections/${id}/sync`),
};

export default api;