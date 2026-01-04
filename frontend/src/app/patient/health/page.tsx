'use client';

import { useState, useEffect } from 'react';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { patientApi } from '@/lib/patient-api';
import { Stethoscope, FileText, AlertTriangle, Heart, Pill, Activity } from 'lucide-react';

// Tipos para Odontograma
type ToothStatus = 'HIGIDO' | 'CARIE' | 'RESTAURADO' | 'AUSENTE' | 'TRATAMENTO_CANAL' | 'EXTRAÇÃO_INDICADA' | 'IMPLANTE' | 'COROA';

interface ToothData {
    status: ToothStatus;
    observacoes?: string;
}

const STATUS_COLORS: Record<ToothStatus, string> = {
    'HIGIDO': '#4ade80',          // Verde
    'CARIE': '#f87171',            // Vermelho
    'RESTAURADO': '#60a5fa',       // Azul
    'AUSENTE': '#9ca3af',          // Cinza
    'TRATAMENTO_CANAL': '#fbbf24', // Amarelo
    'EXTRAÇÃO_INDICADA': '#f97316', // Laranja
    'IMPLANTE': '#a78bfa',         // Roxo
    'COROA': '#2dd4bf',            // Teal
};

const STATUS_LABELS: Record<ToothStatus, string> = {
    'HIGIDO': 'Hígido (Saudável)',
    'CARIE': 'Cárie',
    'RESTAURADO': 'Restaurado',
    'AUSENTE': 'Ausente',
    'TRATAMENTO_CANAL': 'Tratamento de Canal',
    'EXTRAÇÃO_INDICADA': 'Extração Indicada',
    'IMPLANTE': 'Implante',
    'COROA': 'Coroa/Prótese',
};

export default function PatientHealthPage() {
    const { token, patient } = usePatientAuth();
    const [healthData, setHealthData] = useState<any>(null);
    const [odontograma, setOdontograma] = useState<Record<number, ToothData>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'anamnesis' | 'odontogram'>('anamnesis');

    useEffect(() => {
        if (token) {
            loadHealthData();
        }
    }, [token]);

    const loadHealthData = async () => {
        try {
            // Carregar dados do paciente (inclui anamnese)
            const patientData = await patientApi.getMe(token!);
            setHealthData(patientData);

            // Carregar odontograma via patient-auth
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient-auth/odontogram`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data?.dados) {
                    setOdontograma(data.dados);
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados de saúde:', error);
        } finally {
            setLoading(false);
        }
    };

    // Componente de dente SVG para visualização
    const Tooth = ({ number }: { number: number }) => {
        const toothData = odontograma[number];
        const color = toothData ? STATUS_COLORS[toothData.status] : STATUS_COLORS['HIGIDO'];
        const status = toothData?.status ? STATUS_LABELS[toothData.status] : 'Hígido (Saudável)';

        return (
            <div className="flex flex-col items-center group relative">
                <svg
                    width="36"
                    height="48"
                    viewBox="0 0 40 55"
                    className="cursor-pointer transition-all hover:scale-110"
                >
                    {/* Sombra/Contorno */}
                    <ellipse
                        cx="20"
                        cy="15"
                        rx="14"
                        ry="12"
                        fill={color}
                        stroke="#374151"
                        strokeWidth="2"
                    />
                    {/* Corpo do dente */}
                    <path
                        d="M 8 15 Q 8 28 12 38 Q 14 45 16 48 Q 18 52 20 48 Q 22 52 24 48 Q 26 45 28 38 Q 32 28 32 15"
                        fill={color}
                        stroke="#374151"
                        strokeWidth="2"
                    />
                    {/* Linha central do dente (divisão das raízes) */}
                    <path
                        d="M 20 25 L 20 45"
                        stroke="#374151"
                        strokeWidth="1"
                        opacity="0.3"
                    />
                    {/* Superfície oclusal */}
                    <ellipse
                        cx="20"
                        cy="12"
                        rx="8"
                        ry="5"
                        fill="white"
                        opacity="0.3"
                    />
                </svg>
                <span className="text-xs font-medium text-gray-700 mt-1">{number}</span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {status}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const anamnese = healthData?.anamnese || {};

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <h1 className="text-3xl font-bold text-gray-900">Minha Saúde</h1>

            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('anamnesis')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${activeTab === 'anamnesis'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Stethoscope className="w-5 h-5" />
                            Anamnese
                        </button>
                        <button
                            onClick={() => setActiveTab('odontogram')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${activeTab === 'odontogram'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FileText className="w-5 h-5" />
                            Odontograma
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* Anamnese Tab */}
                    {activeTab === 'anamnesis' && (
                        <div className="space-y-6">
                            {/* Alertas */}
                            {(anamnese.alergias?.length > 0 || anamnese.doencasPreexistentes?.length > 0) && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                        <span className="font-semibold text-red-800">Alertas Importantes</span>
                                    </div>
                                    <div className="text-sm text-red-700 space-y-1">
                                        {anamnese.alergias?.length > 0 && (
                                            <p><strong>Alergias:</strong> {anamnese.alergias.join(', ')}</p>
                                        )}
                                        {anamnese.doencasPreexistentes?.length > 0 && (
                                            <p><strong>Doenças:</strong> {anamnese.doencasPreexistentes.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Histórico Médico */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Alergias */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                                        <h3 className="font-semibold text-orange-900">Alergias</h3>
                                    </div>
                                    {anamnese.alergias?.length > 0 ? (
                                        <ul className="space-y-1">
                                            {anamnese.alergias.map((item: string, idx: number) => (
                                                <li key={idx} className="text-sm text-orange-800 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-orange-700">Nenhuma alergia registrada</p>
                                    )}
                                </div>

                                {/* Medicamentos */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Pill className="w-5 h-5 text-blue-600" />
                                        <h3 className="font-semibold text-blue-900">Medicamentos em Uso</h3>
                                    </div>
                                    {anamnese.medicamentosUso?.length > 0 ? (
                                        <ul className="space-y-1">
                                            {anamnese.medicamentosUso.map((item: string, idx: number) => (
                                                <li key={idx} className="text-sm text-blue-800 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-blue-700">Nenhum medicamento registrado</p>
                                    )}
                                </div>

                                {/* Doenças */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Heart className="w-5 h-5 text-purple-600" />
                                        <h3 className="font-semibold text-purple-900">Doenças Preexistentes</h3>
                                    </div>
                                    {anamnese.doencasPreexistentes?.length > 0 ? (
                                        <ul className="space-y-1">
                                            {anamnese.doencasPreexistentes.map((item: string, idx: number) => (
                                                <li key={idx} className="text-sm text-purple-800 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-purple-700">Nenhuma doença registrada</p>
                                    )}
                                </div>

                                {/* Sinais Vitais */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Activity className="w-5 h-5 text-green-600" />
                                        <h3 className="font-semibold text-green-900">Informações de Saúde</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-green-700">Tipo Sanguíneo:</span>
                                            <p className="font-medium text-green-900">{anamnese.tipoSanguineo || 'Não informado'}</p>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Fumante:</span>
                                            <p className="font-medium text-green-900">{anamnese.fumante ? 'Sim' : 'Não'}</p>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Gestante:</span>
                                            <p className="font-medium text-green-900">{anamnese.gestante ? 'Sim' : 'Não'}</p>
                                        </div>
                                        <div>
                                            <span className="text-green-700">Diabético:</span>
                                            <p className="font-medium text-green-900">{anamnese.diabetico ? 'Sim' : 'Não'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Observações */}
                            {anamnese.observacoesGerais && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Observações Gerais</h3>
                                    <p className="text-sm text-gray-700">{anamnese.observacoesGerais}</p>
                                </div>
                            )}

                            {/* Mensagem se não houver anamnese */}
                            {Object.keys(anamnese).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Stethoscope className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>Sua anamnese ainda não foi preenchida.</p>
                                    <p className="text-sm">Ela será preenchida pelo dentista na sua próxima consulta.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Odontograma Tab */}
                    {activeTab === 'odontogram' && (
                        <div className="space-y-6">
                            {/* Legenda */}
                            <div className="flex flex-wrap gap-3 mb-4">
                                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                                    <div key={status} className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded border border-gray-300"
                                            style={{ backgroundColor: STATUS_COLORS[status as ToothStatus] }}
                                        />
                                        <span className="text-xs text-gray-600">{label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Arcada Superior */}
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <h3 className="text-center font-medium text-gray-700 mb-3 sm:mb-4">Arcada Superior</h3>
                                <div className="text-center text-xs text-gray-400 mb-2 sm:hidden">
                                    ← Deslize para ver todos →
                                </div>
                                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                    <div className="flex justify-start sm:justify-center gap-0.5 sm:gap-1 min-w-max">
                                        {/* Quadrante 1 (18-11) */}
                                        {[18, 17, 16, 15, 14, 13, 12, 11].map((num) => (
                                            <Tooth key={num} number={num} />
                                        ))}
                                        <div className="w-2 sm:w-4" /> {/* Espaço central */}
                                        {/* Quadrante 2 (21-28) */}
                                        {[21, 22, 23, 24, 25, 26, 27, 28].map((num) => (
                                            <Tooth key={num} number={num} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Arcada Inferior */}
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                                <h3 className="text-center font-medium text-gray-700 mb-3 sm:mb-4">Arcada Inferior</h3>
                                <div className="overflow-x-auto pb-2 -mx-1 px-1">
                                    <div className="flex justify-start sm:justify-center gap-0.5 sm:gap-1 min-w-max">
                                        {/* Quadrante 4 (48-41) */}
                                        {[48, 47, 46, 45, 44, 43, 42, 41].map((num) => (
                                            <Tooth key={num} number={num} />
                                        ))}
                                        <div className="w-2 sm:w-4" /> {/* Espaço central */}
                                        {/* Quadrante 3 (31-38) */}
                                        {[31, 32, 33, 34, 35, 36, 37, 38].map((num) => (
                                            <Tooth key={num} number={num} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Dentes com observações */}
                            {Object.entries(odontograma).filter(([_, data]) => data.observacoes).length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-3">Observações dos Dentes</h4>
                                    <div className="space-y-2">
                                        {Object.entries(odontograma)
                                            .filter(([_, data]) => data.observacoes)
                                            .map(([tooth, data]) => (
                                                <div key={tooth} className="flex items-start gap-3 text-sm">
                                                    <span className="font-medium text-gray-700">Dente {tooth}:</span>
                                                    <span className="text-gray-600">{data.observacoes}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Mensagem se odontograma vazio */}
                            {Object.keys(odontograma).length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p>Seu odontograma ainda não foi preenchido.</p>
                                    <p className="text-sm">Ele será atualizado pelo dentista durante suas consultas.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
