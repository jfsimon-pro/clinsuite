'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, Calendar, DollarSign, User, FileText, TrendingUp, Search } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  phone: string;
  statusVenda: string;
  valorOrcamento: number | null;
  dataConsulta: string | null;
  tipoProcura: string | null;
  observacoes: string | null;
  createdAt: string;
  funnel: {
    name: string;
  };
  step: {
    name: string;
  };
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Verificar se é dentista
      if (userData.role !== 'DENTIST') {
        router.push('/dashboard');
        return;
      }
    } else {
      router.push('/login');
      return;
    }

    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads/my-patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Erro ao buscar pacientes');
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'QUALIFICANDO': 'bg-blue-100 text-blue-800',
      'INTERESSE_DEMONSTRADO': 'bg-purple-100 text-purple-800',
      'CONSULTA_AGENDADA': 'bg-yellow-100 text-yellow-800',
      'CONSULTA_REALIZADA': 'bg-green-100 text-green-800',
      'ORCAMENTO_ENVIADO': 'bg-indigo-100 text-indigo-800',
      'NEGOCIACAO': 'bg-orange-100 text-orange-800',
      'GANHO': 'bg-green-500 text-white',
      'PERDIDO': 'bg-red-100 text-red-800',
      'PAUSADO': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'QUALIFICANDO': 'Qualificando',
      'INTERESSE_DEMONSTRADO': 'Interesse Demonstrado',
      'CONSULTA_AGENDADA': 'Consulta Agendada',
      'CONSULTA_REALIZADA': 'Consulta Realizada',
      'ORCAMENTO_ENVIADO': 'Orçamento Enviado',
      'NEGOCIACAO': 'Negociação',
      'GANHO': 'Ganho',
      'PERDIDO': 'Perdido',
      'PAUSADO': 'Pausado',
    };
    return labels[status] || status;
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filtrar pacientes baseado na busca
  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm) ||
    patient.tipoProcura?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header com Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Pacientes</h1>
              <p className="text-gray-600">
                Gerencie seus {patients.length} {patients.length === 1 ? 'paciente atribuído' : 'pacientes atribuídos'}
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium mb-1">Total de Pacientes</p>
                  <p className="text-3xl font-bold text-blue-900">{patients.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium mb-1">Com Consulta</p>
                  <p className="text-3xl font-bold text-green-900">
                    {patients.filter(p => p.dataConsulta).length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium mb-1">Total em Orçamentos</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {formatCurrency(patients.reduce((sum, p) => sum + (p.valorOrcamento || 0), 0))}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Lista de Pacientes */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente atribuído'}
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? 'Tente buscar com outros termos.'
                : 'Você ainda não tem pacientes atribuídos a você.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {patient.name || 'Sem nome'}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm">{patient.phone}</span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(patient.statusVenda)}`}>
                    {getStatusLabel(patient.statusVenda)}
                  </span>
                </div>

                {/* Grid de Informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                  {/* Funil e Etapa */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-600">Pipeline</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium mb-1">
                      {patient.funnel.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {patient.step.name}
                    </div>
                  </div>

                  {/* Tipo de Procura */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-gray-600">Procedimento</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {patient.tipoProcura || '-'}
                    </div>
                  </div>

                  {/* Valor do Orçamento */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600">Orçamento</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(patient.valorOrcamento)}
                    </div>
                  </div>

                  {/* Data da Consulta */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-gray-600">Consulta</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {formatDate(patient.dataConsulta)}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {patient.observacoes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-xs font-medium text-gray-600">Observações</span>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {patient.observacoes}
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Paciente desde {new Date(patient.createdAt).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <button
                    onClick={() => router.push(`/patients/${patient.id}`)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Ver mais
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
