'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Building2, Plus, Users, TrendingUp, X, Power, AlertCircle } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  logoUrl?: string;
  primaryColor?: string;
  active: boolean;
  createdAt: string;
  _count: {
    users: number;
    leads: number;
    funnels: number;
    tasks: number;
  };
}

export default function EmpresasPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    logoUrl: '',
    primaryColor: '#8B5CF6',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await api.post('/companies', formData);
      setShowCreateModal(false);
      setFormData({
        name: '',
        cnpj: '',
        logoUrl: '',
        primaryColor: '#8B5CF6',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
      });
      loadCompanies();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao criar empresa');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (companyId: string) => {
    try {
      await api.patch(`/companies/${companyId}/toggle-active`);
      loadCompanies();
    } catch (error) {
      alert('Erro ao alterar status da empresa');
    }
  };

  // Proteção: Apenas SUPER_ADMIN
  if (!user || user.role !== 'SUPER_ADMIN') {
    return (
      <div className="p-8 text-center bg-black min-h-screen flex items-center justify-center">
        <div>
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-500">Apenas Super Administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Empresas Cadastradas</h1>
            <p className="text-gray-500">Gerencie todas as clínicas do sistema</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Empresa
          </button>
        </div>
      </div>

      {/* Tabela de Empresas */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Empresa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                CNPJ
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Usuários
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Leads
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {companies.map((company) => (
              <tr key={company.id} className={`${!company.active ? 'opacity-50' : ''} hover:bg-gray-800/50 transition-colors`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: company.primaryColor || '#8B5CF6' }}
                    >
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-medium">{company.name}</div>
                      <div className="text-gray-500 text-sm">
                        Criada em {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-300 font-mono text-sm">{company.cnpj}</div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-semibold">{company._count.users}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="inline-flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span className="text-white font-semibold">{company._count.leads}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {company.active ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-sm font-semibold">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      Ativa
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-900/30 text-red-400 text-sm font-semibold">
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                      Inativa
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleActive(company.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      company.active
                        ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                        : 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {company.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {companies.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhuma empresa cadastrada ainda.
          </div>
        )}
      </div>

      {/* Modal Criar Empresa */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Nova Empresa</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nome da Empresa *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">CNPJ *</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Cor Primária</label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full h-10 rounded-lg bg-gray-800 border border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <hr className="border-gray-800 my-6" />
              <h3 className="text-lg font-semibold text-white mb-4">Administrador Inicial</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Nome do Admin *</label>
                  <input
                    type="text"
                    value={formData.adminName}
                    onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email do Admin *</label>
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Senha do Admin *</label>
                  <input
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-600 focus:outline-none"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 border border-gray-700"
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  disabled={creating}
                >
                  {creating ? 'Criando...' : 'Criar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
