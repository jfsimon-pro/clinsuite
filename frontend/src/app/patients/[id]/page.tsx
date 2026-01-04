'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    User,
    FileText,
    Calendar,
    Image as ImageIcon,
    DollarSign,
    Stethoscope,
} from 'lucide-react';

// Importar componentes de cada aba
import PersonalDataTab from '@/components/patient-detail/PersonalDataTab';
import AnamnesisTab from '@/components/patient-detail/AnamnesisTab';
import OdontogramTab from '@/components/patient-detail/OdontogramTab';
import ConsultationsTab from '@/components/patient-detail/ConsultationsTab';
import DocumentsTab from '@/components/patient-detail/DocumentsTab';
import PaymentsTab from '@/components/patient-detail/PaymentsTab';

interface PatientDetail {
    id: string;
    name: string;
    phone: string;
    email?: string;
    cpf?: string;
    dataNascimento?: string;
    endereco?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    contatoEmergencia?: string;
    nomeContatoEmergencia?: string;
    anamnese?: any;
    statusVenda: string;
    createdAt: string;
    funnel: {
        name: string;
    };
    step: {
        name: string;
    };
    dentistUser: {
        name: string;
        email: string;
    } | null;
}

type TabType = 'personal' | 'anamnesis' | 'odontogram' | 'consultations' | 'documents' | 'payments';

export default function PatientDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [patient, setPatient] = useState<PatientDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('personal');

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== 'DENTIST') {
            router.push('/dashboard');
            return;
        }

        fetchPatientDetail();
    }, [params.id]);

    const fetchPatientDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${params.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setPatient(data);
            } else {
                console.error('Erro ao buscar detalhes do paciente');
                router.push('/patients');
            }
        } catch (error) {
            console.error('Erro ao buscar detalhes do paciente:', error);
            router.push('/patients');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'personal' as TabType, name: 'Dados Pessoais', icon: User },
        { id: 'anamnesis' as TabType, name: 'Anamnese', icon: Stethoscope },
        { id: 'odontogram' as TabType, name: 'Odontograma', icon: FileText },
        { id: 'consultations' as TabType, name: 'Consultas', icon: Calendar },
        { id: 'documents' as TabType, name: 'Documentos', icon: ImageIcon },
        { id: 'payments' as TabType, name: 'Pagamentos', icon: DollarSign },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando prontuário...</p>
                </div>
            </div>
        );
    }

    if (!patient) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/patients')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Voltar para Pacientes</span>
                    </button>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {patient.name || 'Sem nome'}
                                </h1>
                                <div className="flex items-center gap-4 text-gray-600">
                                    <span>{patient.phone}</span>
                                    {patient.email && <span>• {patient.email}</span>}
                                    {patient.dentistUser && (
                                        <span>• Dr(a). {patient.dentistUser.name}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">Pipeline</div>
                                <div className="font-medium text-gray-900">{patient.funnel.name}</div>
                                <div className="text-sm text-gray-500">{patient.step.name}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px overflow-x-auto">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                      flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap
                      ${isActive
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'personal' && (
                            <PersonalDataTab patient={patient} onUpdate={fetchPatientDetail} />
                        )}
                        {activeTab === 'anamnesis' && (
                            <AnamnesisTab patient={patient} onUpdate={fetchPatientDetail} />
                        )}
                        {activeTab === 'odontogram' && (
                            <OdontogramTab patientId={patient.id} />
                        )}
                        {activeTab === 'consultations' && (
                            <ConsultationsTab patientId={patient.id} patientName={patient.name || 'Paciente'} />
                        )}
                        {activeTab === 'documents' && (
                            <DocumentsTab patientId={patient.id} />
                        )}
                        {activeTab === 'payments' && (
                            <PaymentsTab patientId={patient.id} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
