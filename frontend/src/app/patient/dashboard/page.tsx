'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { patientApi } from '@/lib/patient-api';
import { Calendar, FileText, DollarSign, Clock, User as UserIcon, Phone, ChevronRight, Stethoscope, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PatientDashboardPage() {
    const router = useRouter();
    const { patient, token } = usePatientAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [documents, setDocuments] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    const loadData = async () => {
        try {
            const [appointmentsData, documentsData, paymentsData] = await Promise.all([
                patientApi.getAppointments(token!),
                patientApi.getDocuments(token!),
                patientApi.getPayments(token!),
            ]);

            setAppointments(appointmentsData);
            setDocuments(documentsData);
            setPayments(paymentsData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper para formatar data com segurança
    const formatDate = (dateValue: any, formatStr: string = "dd/MM/yyyy") => {
        if (!dateValue) return 'Data não definida';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return 'Data inválida';
            return format(date, formatStr, { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    const nextAppointment = appointments
        .filter(apt => {
            try {
                return new Date(apt.dataConsulta) >= new Date();
            } catch {
                return false;
            }
        })
        .sort((a, b) => new Date(a.dataConsulta).getTime() - new Date(b.dataConsulta).getTime())[0];

    const pendingPayments = payments.filter(p => p.status === 'PENDENTE');
    const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.valor), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Welcome - Mobile Optimized */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-500 rounded-2xl p-4 sm:p-6 text-white">
                <h1 className="text-xl sm:text-2xl font-bold mb-1">
                    Olá, {patient?.name?.split(' ')[0] || 'Paciente'}! 👋
                </h1>
                <p className="text-violet-100 text-sm sm:text-base">Bem-vindo ao seu portal</p>
            </div>

            {/* Quick Stats - Scrollable on Mobile */}
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3">
                <div
                    onClick={() => router.push('/patient/appointments')}
                    className="flex-shrink-0 w-[140px] sm:w-auto bg-white border border-gray-200 rounded-xl p-4 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-3">
                        <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
                    <div className="text-xs text-gray-500">Consultas</div>
                </div>

                <div
                    onClick={() => router.push('/patient/documents')}
                    className="flex-shrink-0 w-[140px] sm:w-auto bg-white border border-gray-200 rounded-xl p-4 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                        <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                    <div className="text-xs text-gray-500">Documentos</div>
                </div>

                <div
                    onClick={() => router.push('/patient/payments')}
                    className="flex-shrink-0 w-[140px] sm:w-auto bg-white border border-gray-200 rounded-xl p-4 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
                    </div>
                    <div className="text-xs text-gray-500">Pendente</div>
                </div>
            </div>

            {/* Next Appointment - Mobile Card */}
            {nextAppointment ? (
                <div
                    onClick={() => router.push('/patient/appointments')}
                    className="bg-white border border-violet-200 rounded-xl overflow-hidden cursor-pointer active:bg-gray-50 transition-colors"
                >
                    <div className="bg-violet-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-violet-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Próxima Consulta
                        </span>
                        <ChevronRight className="w-4 h-4 text-violet-400" />
                    </div>
                    <div className="p-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-violet-100 rounded-xl flex flex-col items-center justify-center">
                                <span className="text-lg font-bold text-violet-700">
                                    {formatDate(nextAppointment.dataConsulta, 'dd')}
                                </span>
                                <span className="text-xs text-violet-600 uppercase">
                                    {formatDate(nextAppointment.dataConsulta, 'MMM')}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900">
                                    {formatDate(nextAppointment.dataConsulta, "EEEE, 'às' HH:mm")}
                                </p>
                                <p className="text-sm text-gray-600 truncate">
                                    Dr(a). {nextAppointment.dentista?.name || 'Não atribuído'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Nenhuma consulta agendada</p>
                </div>
            )}

            {/* Pending Payments Alert */}
            {pendingPayments.length > 0 && (
                <div
                    onClick={() => router.push('/patient/payments')}
                    className="bg-orange-50 border border-orange-200 rounded-xl p-4 cursor-pointer active:bg-orange-100 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-orange-900">
                                {pendingPayments.length} pagamento{pendingPayments.length > 1 ? 's' : ''} pendente{pendingPayments.length > 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-orange-700">
                                Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-orange-400" />
                    </div>
                </div>
            )}

            {/* Quick Actions - Mobile Grid */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => router.push('/patient/health')}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                        <Stethoscope className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Minha Saúde</p>
                    <p className="text-xs text-gray-500">Anamnese e Odontograma</p>
                </button>

                <button
                    onClick={() => router.push('/patient/profile')}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-left active:bg-gray-50 transition-colors"
                >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mb-3">
                        <UserIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="font-medium text-gray-900 text-sm">Meu Perfil</p>
                    <p className="text-xs text-gray-500">Dados pessoais</p>
                </button>
            </div>

            {/* Dentist Contact */}
            {patient?.dentist && (
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-2">Seu dentista</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Dr(a). {patient.dentist.name}</p>
                            <p className="text-sm text-gray-500">{patient.dentist.email}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
