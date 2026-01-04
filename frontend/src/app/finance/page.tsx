'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnit } from '@/context/UnitContext';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertCircle,
    Calendar,
    Search,
    Filter,
    Download,
    Eye,
    MoreHorizontal,
    CreditCard,
    Banknote,
    Smartphone,
    Building2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Pagamento {
    id: string;
    leadId: string;
    valor: number;
    formaPagamento: string;
    dataVencimento: string;
    dataPagamento: string | null;
    status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
    numeroParcela: number | null;
    totalParcelas: number | null;
    observacoes: string | null;
    createdAt: string;
    lead: {
        id: string;
        name: string;
        phone: string;
        email: string;
    };
}

const statusConfig = {
    PENDENTE: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    PAGO: { label: 'Pago', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
    ATRASADO: { label: 'Atrasado', color: 'bg-red-100 text-red-800', icon: AlertCircle },
    CANCELADO: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
};

const formaPagamentoConfig: Record<string, { label: string; icon: React.ComponentType<any> }> = {
    DINHEIRO: { label: 'Dinheiro', icon: Banknote },
    CARTAO_DEBITO: { label: 'Débito', icon: CreditCard },
    CARTAO_CREDITO: { label: 'Crédito', icon: CreditCard },
    PIX: { label: 'Pix', icon: Smartphone },
    TRANSFERENCIA: { label: 'Transferência', icon: Building2 },
    PARCELADO: { label: 'Parcelado', icon: CreditCard },
};

export default function FinancePage() {
    const router = useRouter();
    const { selectedUnit } = useUnit();
    const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [periodoFilter, setPeriodoFilter] = useState<string>('30');

    useEffect(() => {
        loadPagamentos();
    }, [selectedUnit]); // Recarregar quando mudar a unidade

    const loadPagamentos = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Adicionar unitId como query param se uma unidade estiver selecionada
            const unitParam = selectedUnit ? `?unitId=${selectedUnit.id}` : '';

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagamentos${unitParam}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setPagamentos(data);
            }
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const marcarComoPago = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pagamentos/${id}/marcar-pago`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                loadPagamentos();
            }
        } catch (error) {
            console.error('Erro ao marcar como pago:', error);
        }
    };

    // Helpers para tratamento de datas (conforme regra de datas)
    const isValidDate = (dateValue: any): boolean => {
        if (!dateValue) return false;
        const date = new Date(dateValue);
        return !isNaN(date.getTime());
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const formatDate = (dateValue: any, formatStr: string = 'dd/MM/yyyy') => {
        if (!dateValue) return 'Data não definida';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'Data inválida';
            return format(date, formatStr, { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    // Cálculos de resumo
    const hoje = new Date();

    const totalRecebido = pagamentos
        .filter(p => p.status === 'PAGO')
        .reduce((sum, p) => sum + Number(p.valor), 0);

    const totalPendente = pagamentos
        .filter(p => p.status === 'PENDENTE')
        .reduce((sum, p) => sum + Number(p.valor), 0);

    const totalAtrasado = pagamentos
        .filter(p => {
            if (p.status === 'ATRASADO') return true;
            if (p.status === 'PENDENTE' && isValidDate(p.dataVencimento)) {
                return new Date(p.dataVencimento) < hoje;
            }
            return false;
        })
        .reduce((sum, p) => sum + Number(p.valor), 0);

    const aReceberHoje = pagamentos
        .filter(p => {
            if (p.status !== 'PENDENTE') return false;
            if (!isValidDate(p.dataVencimento)) return false;
            const venc = new Date(p.dataVencimento);
            return venc.toDateString() === hoje.toDateString();
        })
        .reduce((sum, p) => sum + Number(p.valor), 0);

    // Helper para verificar se está atrasado
    const checkAtrasado = (pagamento: Pagamento): boolean => {
        if (pagamento.status !== 'PENDENTE') return false;
        if (!isValidDate(pagamento.dataVencimento)) return false;
        return new Date(pagamento.dataVencimento) < hoje;
    };

    // Filtros
    const filteredPagamentos = pagamentos.filter(p => {
        const matchSearch = !searchTerm ||
            p.lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.lead.phone?.includes(searchTerm);
        const matchStatus = !statusFilter || p.status === statusFilter;

        return matchSearch && matchStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
                    <p className="text-gray-600">Controle de pagamentos e receitas</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Exportar
                </button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Total Recebido</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRecebido)}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">A Receber</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Em Atraso</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAtrasado)}</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-violet-600" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">A Receber Hoje</p>
                    <p className="text-2xl font-bold text-violet-600">{formatCurrency(aReceberHoje)}</p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                        <option value="">Todos os status</option>
                        <option value="PENDENTE">Pendente</option>
                        <option value="PAGO">Pago</option>
                        <option value="ATRASADO">Atrasado</option>
                        <option value="CANCELADO">Cancelado</option>
                    </select>
                </div>
            </div>

            {/* Tabela de Pagamentos */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Paciente
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Valor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Forma Pgto
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Vencimento
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Ações
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPagamentos.length > 0 ? (
                                filteredPagamentos.map((pagamento) => {
                                    const StatusIcon = statusConfig[pagamento.status]?.icon || Clock;
                                    const FormaIcon = formaPagamentoConfig[pagamento.formaPagamento]?.icon || CreditCard;
                                    const isAtrasado = checkAtrasado(pagamento);

                                    return (
                                        <tr key={pagamento.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{pagamento.lead.name || 'Sem nome'}</p>
                                                    <p className="text-sm text-gray-500">{pagamento.lead.phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">{formatCurrency(Number(pagamento.valor))}</p>
                                                {pagamento.numeroParcela && pagamento.totalParcelas && (
                                                    <p className="text-xs text-gray-500">
                                                        Parcela {pagamento.numeroParcela}/{pagamento.totalParcelas}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <FormaIcon className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm text-gray-700">
                                                        {formaPagamentoConfig[pagamento.formaPagamento]?.label || pagamento.formaPagamento}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className={`text-sm ${isAtrasado ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                                                    {formatDate(pagamento.dataVencimento)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${isAtrasado ? 'bg-red-100 text-red-800' : statusConfig[pagamento.status]?.color
                                                    }`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {isAtrasado ? 'Atrasado' : statusConfig[pagamento.status]?.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {pagamento.status === 'PENDENTE' && (
                                                        <button
                                                            onClick={() => marcarComoPago(pagamento.id)}
                                                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Marcar Pago
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => router.push(`/patients/${pagamento.leadId}`)}
                                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Ver paciente"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Nenhum pagamento encontrado</p>
                                        <p className="text-sm text-gray-400">Os pagamentos aparecerão aqui quando forem criados</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Resumo por forma de pagamento */}
            {pagamentos.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Forma de Pagamento</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {Object.entries(formaPagamentoConfig).map(([key, config]) => {
                            const total = pagamentos
                                .filter(p => p.formaPagamento === key && p.status === 'PAGO')
                                .reduce((sum, p) => sum + Number(p.valor), 0);
                            const Icon = config.icon;

                            return (
                                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                                    <Icon className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                                    <p className="text-xs text-gray-500 mb-1">{config.label}</p>
                                    <p className="font-semibold text-gray-900">{formatCurrency(total)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
