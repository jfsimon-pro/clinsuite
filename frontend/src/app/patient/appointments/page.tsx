'use client';

import { useState, useEffect } from 'react';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { patientApi } from '@/lib/patient-api';
import { Clock, User, CheckCircle, XCircle, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import './patient-appointments.css';

export default function PatientAppointmentsPage() {
    const { token } = usePatientAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) loadAppointments();
    }, [token]);

    const loadAppointments = async () => {
        try {
            const data = await patientApi.getAppointments(token!);
            setAppointments(data);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    // Helper para extrair partes da data
    const getDateParts = (dateValue: any) => {
        if (!dateValue) return null;
        try {
            const date = new Date(dateValue);
            // Validação estrita conforme regras do sistema (instrucao-datas.md)
            if (isNaN(date.getTime())) return null;

            return {
                day: format(date, 'dd'),
                month: format(date, 'MMM', { locale: ptBR }),
                full: format(date, "dd/MM/yyyy 'às' HH:mm"),
                time: format(date, 'HH:mm')
            };
        } catch {
            return null;
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div className="patient-appointments-root">
            <header className="page-header">
                <h1 className="page-title">Minhas<br />Consultas</h1>
            </header>

            {appointments.length === 0 ? (
                <div className="appointments-list">
                    <div className="empty-state">
                        <CalendarIcon className="empty-icon" />
                        <p className="empty-text">Você ainda não tem consultas agendadas.</p>
                    </div>
                </div>
            ) : (
                <div className="appointments-list">
                    {appointments.map((apt) => {
                        const dateParts = getDateParts(apt.dataConsulta);

                        // Status Logic
                        let statusClass = '';
                        let statusLabel = '';

                        if (apt.compareceu === true) {
                            statusClass = 'concluida';
                            statusLabel = 'Concluída';
                        } else if (apt.compareceu === false) {
                            statusClass = 'faltou';
                            statusLabel = 'Não Compareceu';
                        } else if (apt.status === 'CANCELADA') {
                            statusClass = 'cancelada';
                            statusLabel = 'Cancelada';
                        } else if (apt.tipo === 'AGENDADA') {
                            statusClass = 'agendada';
                            statusLabel = 'Agendada';
                        } else {
                            statusClass = 'pendente';
                            statusLabel = 'Pendente';
                        }

                        return (
                            <div key={apt.id} className="appointment-card">
                                <div className="card-header">
                                    <div className="date-badge">
                                        <span className="date-day">{dateParts?.day || '--'}</span>
                                        <span className="date-month">{dateParts?.month || '-'}</span>
                                    </div>
                                    <div className={`status-badge ${statusClass}`}>
                                        {statusClass === 'concluida' && <CheckCircle size={12} />}
                                        {statusClass === 'faltou' && <XCircle size={12} />}
                                        {statusClass === 'cancelada' && <AlertCircle size={12} />}
                                        {statusLabel}
                                    </div>
                                </div>

                                <div className="card-details">
                                    <div className="time-section">
                                        <p className="time-label">Horário</p>
                                        <div className="time-info">
                                            <Clock className="time-icon" />
                                            <span>{dateParts?.time} ({apt.duracao} min)</span>
                                        </div>
                                    </div>

                                    <div className="dentist-info">
                                        <div className="dentist-avatar">
                                            {apt.dentista?.name?.charAt(0) || <User size={16} />}
                                        </div>
                                        <div className="dentist-name-wrap">
                                            <span className="dentist-label">Dentista</span>
                                            <span className="dentist-name">{apt.dentista?.name || 'Não atribuído'}</span>
                                        </div>
                                    </div>

                                    {apt.procedimentos && apt.procedimentos.length > 0 && (
                                        <div className="procedures-list">
                                            {apt.procedimentos.map((proc: string, idx: number) => (
                                                <span key={idx} className="proc-tag">{proc}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
