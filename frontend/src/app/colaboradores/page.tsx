'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'WORKER' | 'DENTIST';
  specialty: 'GENERAL' | 'CLOSER_NEGOCIACAO' | 'CLOSER_FOLLOW';
  createdAt: string;
}

export default function ColaboradoresPage() {
  const { user } = useAuth();
  const [colaboradores, setColaboradores] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingColaborador, setEditingColaborador] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'WORKER' as 'WORKER' | 'ADMIN' | 'DENTIST',
    specialty: 'GENERAL' as 'GENERAL' | 'CLOSER_NEGOCIACAO' | 'CLOSER_FOLLOW',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    role: 'WORKER' as 'WORKER' | 'ADMIN' | 'DENTIST',
    specialty: 'GENERAL' as 'GENERAL' | 'CLOSER_NEGOCIACAO' | 'CLOSER_FOLLOW',
  });

  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      const response = await api.get('/auth/users');
      setColaboradores(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      setColaboradores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Dados do usuário:', user);
    console.log('Company ID:', user?.company?.id);
    
    if (!user?.company?.id) {
      alert('Erro: ID da empresa não encontrado');
      return;
    }

    setCreating(true);

    try {
      await api.post('/auth/register', {
        ...formData,
        companyId: user.company.id,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'WORKER',
        specialty: 'GENERAL',
      });
      
      setShowCreateModal(false);
      loadColaboradores();
      
      alert('Colaborador criado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao criar colaborador:', error);
      const message = error.response?.data?.message || 'Erro ao criar colaborador. Tente novamente.';
      alert(message);
    } finally {
      setCreating(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'WORKER':
        return 'Colaborador';
      case 'DENTIST':
        return 'Dentista';
      default:
        return role;
    }
  };

  const getSpecialtyLabel = (specialty: string) => {
    switch (specialty) {
      case 'GENERAL':
        return 'Geral';
      case 'CLOSER_NEGOCIACAO':
        return 'Closer de Negociação';
      case 'CLOSER_FOLLOW':
        return 'Closer de Follow';
      default:
        return specialty;
    }
  };

  const getRoleBadge = (role: string) => {
    let colorClasses = 'bg-blue-100 text-blue-800'; // WORKER padrão

    if (role === 'ADMIN') {
      colorClasses = 'bg-purple-100 text-purple-800';
    } else if (role === 'DENTIST') {
      colorClasses = 'bg-green-100 text-green-800';
    }

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorClasses}`}>
        {getRoleLabel(role)}
      </span>
    );
  };

  const getSpecialtyBadge = (specialty: string) => {
    const colors = {
      GENERAL: 'bg-gray-100 text-gray-800',
      CLOSER_NEGOCIACAO: 'bg-green-100 text-green-800',
      CLOSER_FOLLOW: 'bg-orange-100 text-orange-800',
    };
    
    return (
      <span
        className={`text-xs px-2 py-1 rounded-full font-medium ${
          colors[specialty as keyof typeof colors] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {getSpecialtyLabel(specialty)}
      </span>
    );
  };

  const handleEditColaborador = (colaborador: User) => {
    setEditingColaborador(colaborador);
    setEditFormData({
      name: colaborador.name,
      role: colaborador.role,
      specialty: colaborador.specialty,
    });
    setShowEditModal(true);
  };

  const handleUpdateColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingColaborador) return;

    setUpdating(true);

    try {
      await api.put(`/auth/users/${editingColaborador.id}`, editFormData);

      setShowEditModal(false);
      setEditingColaborador(null);
      loadColaboradores();
      
      alert('Colaborador atualizado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      const message = error.response?.data?.message || 'Erro ao atualizar colaborador. Tente novamente.';
      alert(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteColaborador = async (colaboradorId: string, colaboradorName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o colaborador "${colaboradorName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    setDeleting(colaboradorId);

    try {
      await api.delete(`/auth/users/${colaboradorId}`);
      loadColaboradores();
      alert('Colaborador excluído com sucesso!');
    } catch (error: any) {
      console.error('Erro ao excluir colaborador:', error);
      const message = error.response?.data?.message || 'Erro ao excluir colaborador. Tente novamente.';
      alert(message);
    } finally {
      setDeleting(null);
    }
  };

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
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gerenciar Colaboradores
        </h1>
        <p className="text-gray-600">
          Adicione e gerencie os colaboradores da sua clínica odontológica.
        </p>
      </div>

      {/* Lista de Colaboradores */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Colaboradores Cadastrados
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {colaboradores.length} colaborador(es) na sua equipe
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              + Novo Colaborador
            </button>
          </div>
        </div>

        <div className="p-6">
          {colaboradores.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👥</div>
              <p className="text-gray-500 mb-4">Nenhum colaborador encontrado.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Adicionar primeiro colaborador
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {colaboradores.map((colaborador) => (
                <div
                  key={colaborador.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                          {colaborador.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {colaborador.name}
                          </h3>
                          <p className="text-gray-600 text-sm">{colaborador.email}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getRoleBadge(colaborador.role)}
                          {getSpecialtyBadge(colaborador.specialty)}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <span>Cadastrado em: {new Date(colaborador.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {colaborador.role === 'WORKER' && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Ativo
                        </span>
                      )}
                      
                      {/* Botão de Editar */}
                      <button
                        onClick={() => handleEditColaborador(colaborador)}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        Editar
                      </button>
                      
                      {/* Não permitir excluir a si mesmo */}
                      {colaborador.id !== user?.id && (
                        <button
                          onClick={() => handleDeleteColaborador(colaborador.id, colaborador.name)}
                          disabled={deleting === colaborador.id}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === colaborador.id ? 'Excluindo...' : 'Excluir'}
                        </button>
                      )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Novo Colaborador</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={creating}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateColaborador}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: João Silva"
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: joao@clinica.com"
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Senha *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Acesso
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'WORKER' | 'ADMIN' | 'DENTIST' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={creating}
                  >
                    <option value="WORKER">Colaborador</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="DENTIST">Dentista</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === 'WORKER'
                      ? 'Acesso limitado a tarefas e funcionalidades básicas'
                      : formData.role === 'ADMIN'
                      ? 'Acesso total ao sistema'
                      : 'Acesso aos atendimentos e prontuários'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialização
                  </label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value as 'GENERAL' | 'CLOSER_NEGOCIACAO' | 'CLOSER_FOLLOW' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={creating}
                  >
                    <option value="GENERAL">Geral</option>
                    <option value="CLOSER_NEGOCIACAO">Closer de Negociação</option>
                    <option value="CLOSER_FOLLOW">Closer de Follow</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.specialty === 'GENERAL' 
                      ? 'Colaborador para atividades gerais' 
                      : formData.specialty === 'CLOSER_NEGOCIACAO'
                      ? 'Especialista em fechar negociações' 
                      : 'Especialista em acompanhamento de clientes'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={creating}
                >
                  {creating ? 'Criando...' : 'Criar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && editingColaborador && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Editar Colaborador</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={updating}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateColaborador}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: João Silva"
                    required
                    disabled={updating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Acesso
                  </label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as 'WORKER' | 'ADMIN' | 'DENTIST' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    <option value="WORKER">Colaborador</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="DENTIST">Dentista</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.role === 'WORKER'
                      ? 'Acesso limitado a tarefas e funcionalidades básicas'
                      : editFormData.role === 'ADMIN'
                      ? 'Acesso total ao sistema'
                      : 'Acesso aos atendimentos e prontuários'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialização
                  </label>
                  <select
                    value={editFormData.specialty}
                    onChange={(e) => setEditFormData({ ...editFormData, specialty: e.target.value as 'GENERAL' | 'CLOSER_NEGOCIACAO' | 'CLOSER_FOLLOW' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={updating}
                  >
                    <option value="GENERAL">Geral</option>
                    <option value="CLOSER_NEGOCIACAO">Closer de Negociação</option>
                    <option value="CLOSER_FOLLOW">Closer de Follow</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.specialty === 'GENERAL' 
                      ? 'Colaborador para atividades gerais' 
                      : editFormData.specialty === 'CLOSER_NEGOCIACAO'
                      ? 'Especialista em fechar negociações' 
                      : 'Especialista em acompanhamento de clientes'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={updating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updating}
                >
                  {updating ? 'Atualizando...' : 'Atualizar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}