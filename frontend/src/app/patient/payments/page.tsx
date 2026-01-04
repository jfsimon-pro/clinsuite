'use client';

import { useState, useEffect } from 'react';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { patientApi } from '@/lib/patient-api';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientPaymentsPage() {
    const { token } = usePatientAuth();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadPayments();
        }
    }, [token]);

    const loadPayments = async () => {
        try {
            const data = await patientApi.getPayments(token!);
            setPayments(data);
        } catch (error) {
            console.error('Erro ao carregar pagamentos:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: any = {
            PAGO: { icon: CheckCircle, bg: 'bg-green-50', text: 'text-green-700', label: 'Pago' },
            PENDENTE: { icon: Clock, bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Pendente' },
            VENCIDO: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', label: 'Vencido' },
        };
        const config = statusMap[status] || statusMap.PENDENTE;
        const Icon = config.icon;
        return (
            <span className={`flex items-center gap-1 px-3 py-1 ${config.bg} ${config.text} font-medium rounded-full text-sm`}>
                <Icon className="w-4 h-4" />
                {config.label}
            </span>
        );
    };

    // Helper para formatar data com segurança
    const formatDate = (dateValue: any) => {
        if (!dateValue) return 'Data não definida';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'Data inválida';
            return format(date, 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    const totalPago = payments.filter(p => p.status === 'PAGO').reduce((sum, p) => sum + Number(p.valor), 0);
    const totalPendente = payments.filter(p => p.status !== 'PAGO').reduce((sum, p) => sum + Number(p.valor), 0);

    if (loading) {
        return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <h1 className="text-3xl font-bold text-gray-900">Meus Pagamentos</h1>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
                    <p className="text-sm text-green-700 mb-2">Total Pago</p>
                    <p className="text-2xl font-bold text-green-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPago)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
                    <p className="text-sm text-orange-700 mb-2">Total Pendente</p>
                    <p className="text-2xl font-bold text-orange-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPendente)}
                    </p>
                </div>
            </div>

            {/* Payments List */}
            {payments.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pagamento registrado</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {payments.map((payment) => (
                        <div key={payment.id} className="bg-white border border-gray-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <CreditCard className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(payment.valor))}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Vencimento: {formatDate(payment.dataVencimento)}
                                        </p>
                                    </div>
                                </div>
                                {getStatusBadge(payment.status)}
                            </div>
                            {payment.formaPagamento && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Forma:</span> {payment.formaPagamento}
                                </p>
                            )}
                            {payment.dataPagamento && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Pago em:</span> {formatDate(payment.dataPagamento)}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
