'use client';

import { useState, useEffect } from 'react';
import { Save, History, Plus } from 'lucide-react';

interface OdontogramTabProps {
    patientId: string;
}

type ToothStatus = 'HIGIDO' | 'CARIE' | 'RESTAURADO' | 'AUSENTE' | 'TRATAMENTO_CANAL' | 'EXTRAÇÃO_INDICADA' | 'IMPLANTE' | 'COROA';
type ToothSurface = 'oclusal' | 'mesial' | 'distal' | 'vestibular' | 'palatina';

interface ToothData {
    status: ToothStatus;
    superficies?: ToothSurface[];
    observacoes?: string;
}

interface OdontogramaData {
    [key: number]: ToothData;
}

const STATUS_COLORS: Record<ToothStatus, string> = {
    'HIGIDO': '#4ade80',          // Verde
    'CARIE': '#f87171',            // Vermelho
    'RESTAURADO': '#60a5fa',       // Azul
    'AUSENTE': '#9ca3af',          // Cinza
    'TRATAMENTO_CANAL': '#fbbf24', // Amarelo
    'EXTRAÇÃO_INDICADA': '#ef4444', // Vermelho escuro
    'IMPLANTE': '#8b5cf6',         // Roxo
    'COROA': '#f59e0b',            // Laranja
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

export default function OdontogramTab({ patientId }: OdontogramTabProps) {
    const [odontograma, setOdontograma] = useState<OdontogramaData>({});
    const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchOdontograma();
    }, [patientId]);

    const fetchOdontograma = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/odontograma/lead/${patientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setOdontograma(data.dentes || {});
            }
        } catch (error) {
            console.error('Erro ao buscar odontograma:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/odontograma/lead/${patientId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ dentes: odontograma }),
                }
            );

            if (response.ok) {
                alert('Odontograma salvo com sucesso!');
            } else {
                alert('Erro ao salvar odontograma');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar odontograma');
        } finally {
            setSaving(false);
        }
    };

    const updateToothStatus = (toothNumber: number, status: ToothStatus) => {
        setOdontograma(prev => ({
            ...prev,
            [toothNumber]: {
                ...prev[toothNumber],
                status,
            },
        }));
    };

    const updateToothObservation = (toothNumber: number, observacoes: string) => {
        setOdontograma(prev => ({
            ...prev,
            [toothNumber]: {
                ...prev[toothNumber],
                observacoes,
            },
        }));
    };

    const getToothColor = (toothNumber: number): string => {
        const tooth = odontograma[toothNumber];
        if (!tooth) return STATUS_COLORS.HIGIDO;
        return STATUS_COLORS[tooth.status] || STATUS_COLORS.HIGIDO;
    };

    // Componente de dente SVG
    const Tooth = ({ number, quadrant }: { number: number; quadrant: 1 | 2 | 3 | 4 }) => {
        const isSelected = selectedTooth === number;
        const color = getToothColor(number);

        return (
            <div className="flex flex-col items-center">
                <svg
                    width="40"
                    height="50"
                    viewBox="0 0 40 50"
                    onClick={() => setSelectedTooth(number)}
                    className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                    {/* Corpo do dente */}
                    <rect
                        x="10"
                        y="10"
                        width="20"
                        height="30"
                        rx="8"
                        fill={color}
                        stroke="#374151"
                        strokeWidth="2"
                    />
                    {/* Raiz */}
                    <path
                        d="M 15 40 Q 20 48 25 40"
                        fill={color}
                        stroke="#374151"
                        strokeWidth="2"
                    />
                </svg>
                <span className="text-xs font-medium text-gray-700 mt-1">{number}</span>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center py-8">Carregando odontograma...</div>;
    }

    // Quadrantes: 
    // Q1 (11-18): Superior direito
    // Q2 (21-28): Superior esquerdo
    // Q3 (31-38): Inferior esquerdo
    // Q4 (41-48): Inferior direito

    const quadrant1 = [18, 17, 16, 15, 14, 13, 12, 11]; // Superior direito
    const quadrant2 = [21, 22, 23, 24, 25, 26, 27, 28]; // Superior esquerdo
    const quadrant3 = [38, 37, 36, 35, 34, 33, 32, 31]; // Inferior esquerdo
    const quadrant4 = [41, 42, 43, 44, 45, 46, 47, 48]; // Inferior direito

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Odontograma</h2>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Salvando...' : 'Salvar Odontograma'}
                </button>
            </div>

            {/* Odontograma Visual */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                {/* Arcada Superior */}
                <div className="mb-8">
                    <div className="text-center text-sm font-medium text-gray-600 mb-3">Arcada Superior</div>
                    <div className="flex justify-center gap-1">
                        {/* Quadrante 1 (direito) */}
                        <div className="flex gap-1 border-r-2 border-gray-400 pr-2">
                            {quadrant1.map(num => <Tooth key={num} number={num} quadrant={1} />)}
                        </div>
                        {/* Quadrante 2 (esquerdo) */}
                        <div className="flex gap-1 pl-2">
                            {quadrant2.map(num => <Tooth key={num} number={num} quadrant={2} />)}
                        </div>
                    </div>
                </div>

                {/* Linha divisória */}
                <div className="border-t-2 border-gray-400 my-4"></div>

                {/* Arcada Inferior */}
                <div>
                    <div className="flex justify-center gap-1">
                        {/* Quadrante 4 (direito) */}
                        <div className="flex gap-1 border-r-2 border-gray-400 pr-2">
                            {quadrant4.map(num => <Tooth key={num} number={num} quadrant={4} />)}
                        </div>
                        {/* Quadrante 3 (esquerdo) */}
                        <div className="flex gap-1 pl-2">
                            {quadrant3.map(num => <Tooth key={num} number={num} quadrant={3} />)}
                        </div>
                    </div>
                    <div className="text-center text-sm font-medium text-gray-600 mt-3">Arcada Inferior</div>
                </div>
            </div>

            {/* Legendas */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Legendas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <div key={status} className="flex items-center gap-2">
                            <div
                                className="w-4 h-4 rounded border border-gray-300"
                                style={{ backgroundColor: STATUS_COLORS[status as ToothStatus] }}
                            ></div>
                            <span className="text-sm text-gray-700">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Painel de Edição do Dente Selecionado */}
            {selectedTooth && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Dente {selectedTooth}
                        </h3>
                        <button
                            onClick={() => setSelectedTooth(null)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status do Dente
                            </label>
                            <select
                                value={odontograma[selectedTooth]?.status || 'HIGIDO'}
                                onChange={(e) => updateToothStatus(selectedTooth, e.target.value as ToothStatus)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Observações
                            </label>
                            <textarea
                                value={odontograma[selectedTooth]?.observacoes || ''}
                                onChange={(e) => updateToothObservation(selectedTooth, e.target.value)}
                                rows={3}
                                placeholder="Anotações sobre este dente..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}

            {!selectedTooth && (
                <div className="text-center py-8 text-gray-500">
                    Clique em um dente para editá-lo
                </div>
            )}
        </div>
    );
}
