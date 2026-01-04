'use client';

import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, FileText, X, Plus, DollarSign, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentsTabProps {
    patientId: string;
}

export default function PaymentsTab({ patientId }: PaymentsTabProps) {
    const [pagamentos, setPagamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        valor: '',
        formaPagamento: 'DINHEIRO',
        dataVencimento: '',
        numeroParcela: '',
        totalParcelas: '',
        observacoes: '',
    });

    useEffect(() => {
        fetchPagamentos();
    }, [patientId]);

    const fetchPagamentos = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/pagamentos/lead/${patientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPagamentos(data);
            }
        } catch (error) {
            console.error('Erro ao buscar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/pagamentos`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        leadId: patientId,
                        valor: parseFloat(formData.valor),
                        formaPagamento: formData.formaPagamento,
                        dataVencimento: formData.dataVencimento,
                        numeroParcela: formData.numeroParcela ? parseInt(formData.numeroParcela) : null,
                        totalParcelas: formData.totalParcelas ? parseInt(formData.totalParcelas) : null,
                        observacoes: formData.observacoes || null,
                    }),
                }
            );

            if (response.ok) {
                setShowModal(false);
                resetForm();
                fetchPagamentos();
            } else {
                alert('Erro ao registrar pagamento');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao registrar pagamento');
        } finally {
            setSaving(false);
        }
    };

    const marcarComoPago = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/pagamentos/${id}/marcar-pago`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchPagamentos();
            }
        } catch (error) {
            console.error('Erro ao marcar como pago:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            valor: '',
            formaPagamento: 'DINHEIRO',
            dataVencimento: '',
            numeroParcela: '',
            totalParcelas: '',
            observacoes: '',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAGO': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'PENDENTE': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'ATRASADO': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAGO': return 'bg-green-100 text-green-800';
            case 'PENDENTE': return 'bg-yellow-100 text-yellow-800';
            case 'ATRASADO': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="text-center py-8">Carregando pagamentos...</div>;
    }

    const totalPago = pagamentos
        .filter((p: any) => p.status === 'PAGO')
        .reduce((sum: number, p: any) => sum + Number(p.valor), 0);

    const totalPendente = pagamentos
        .filter((p: any) => p.status !== 'PAGO')
        .reduce((sum: number, p: any) => sum + Number(p.valor), 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Controle de Pagamentos</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Novo Pagamento
                </button>
            </div>

            {/* Resumo */}
            {pagamentos.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-700 mb-1">Total Pago</p>
                        <p className="text-2xl font-bold text-green-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
                        </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-700 mb-1">Total Pendente</p>
                        <p className="text-2xl font-bold text-yellow-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
                        </p>
                    </div>
                </div>
            )}

            {/* Lista de Pagamentos */}
            {pagamentos.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhum pagamento registrado</p>
                    <p className="text-sm text-gray-500 mt-1">Adicione pagamentos ou parcelas</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {pagamentos.map((pagamento: any) => (
                        <div
                            key={pagamento.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {getStatusIcon(pagamento.status)}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pagamento.valor)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Vencimento: {new Date(pagamento.dataVencimento).toLocaleDateString('pt-BR')}
                                        {pagamento.numeroParcela && ` • Parcela ${pagamento.numeroParcela}/${pagamento.totalParcelas}`}
                                    </p>
                                    {pagamento.formaPagamento && (
                                        <p className="text-xs text-gray-500">{pagamento.formaPagamento.replace('_', ' ')}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pagamento.status)}`}>
                                    {pagamento.status}
                                </span>
                                {pagamento.status === 'PENDENTE' && (
                                    <button
                                        onClick={() => marcarComoPago(pagamento.id)}
                                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                                    >
                                        Marcar Pago
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Novo Pagamento</h3>
                            <button
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valor (R$) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.valor}
                                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Forma de Pagamento
                                </label>
                                <select
                                    value={formData.formaPagamento}
                                    onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="DINHEIRO">Dinheiro</option>
                                    <option value="CARTAO_DEBITO">Cartão de Débito</option>
                                    <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                                    <option value="PIX">PIX</option>
                                    <option value="TRANSFERENCIA">Transferência</option>
                                    <option value="PARCELADO">Parcelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Data de Vencimento *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dataVencimento}
                                    onChange={(e) => setFormData({ ...formData, dataVencimento: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {formData.formaPagamento === 'PARCELADO' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Parcela Nº
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.numeroParcela}
                                            onChange={(e) => setFormData({ ...formData, numeroParcela: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            min="1"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total de Parcelas
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.totalParcelas}
                                            onChange={(e) => setFormData({ ...formData, totalParcelas: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    rows={2}
                                    placeholder="Informações adicionais..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : 'Salvar Pagamento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
