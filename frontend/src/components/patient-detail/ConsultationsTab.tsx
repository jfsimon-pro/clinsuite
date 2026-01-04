'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, X, ChevronDown, Clock, Syringe, Box, User, CheckCircle2, XCircle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConsultationsTabProps {
    patientId: string;
    patientName: string;
}

export default function ConsultationsTab({ patientId, patientName }: ConsultationsTabProps) {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [expandedConsultation, setExpandedConsultation] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        dataConsulta: '',
        duracao: 60,
        procedimentos: '',
        dentesAtendidos: '',
        anestesiaUsada: '',
        materiaisUsados: '',
        observacoes: '',
        valorCobrado: '',
        proximaConsulta: '',
        compareceu: true,
    });

    useEffect(() => {
        fetchConsultas();
    }, [patientId]);

    // Helper para formatar datas com segurança usando date-fns
    const formatSafeDate = (dateValue: any) => {
        if (!dateValue) return null;

        // Se vier um objeto vazio ou algo que não seja string/number/Date, ignora
        if (typeof dateValue === 'object' && !(dateValue instanceof Date)) return null;

        try {
            // Tenta criar data diretamente
            let date = new Date(dateValue);

            // Se falhar e for string, tenta parseISO
            if (!isValid(date)) {
                if (typeof dateValue === 'string') {
                    date = parseISO(dateValue);
                } else {
                    return null;
                }
            }

            if (!isValid(date)) return null;

            return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        } catch (error) {
            console.error('Erro ao formatar data:', dateValue);
            return null;
        }
    };

    const fetchConsultas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/consultas/lead/${patientId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                if (response.ok) {
                    const data = await response.json();
                    setConsultas(data);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar consultas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('token');

            // Processar procedimentos e dentes
            const procedimentos = formData.procedimentos
                .split(',')
                .map(p => p.trim())
                .filter(p => p);

            const dentesAtendidos = formData.dentesAtendidos
                .split(',')
                .map(d => parseInt(d.trim()))
                .filter(d => !isNaN(d) && d >= 1 && d <= 32);

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/consultas`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        leadId: patientId,
                        dataConsulta: formData.dataConsulta,
                        duracao: formData.duracao,
                        procedimentos,
                        dentesAtendidos,
                        anestesiaUsada: formData.anestesiaUsada || null,
                        materiaisUsados: formData.materiaisUsados || null,
                        observacoes: formData.observacoes || null,
                        valorCobrado: formData.valorCobrado ? parseFloat(formData.valorCobrado) : null,
                        proximaConsulta: formData.proximaConsulta || null,
                        compareceu: formData.compareceu,
                    }),
                }
            );

            if (response.ok) {
                setShowModal(false);
                resetForm();
                fetchConsultas();
            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || 'Erro ao registrar consulta';
                alert(errorMessage);
                console.error('Erro do servidor:', errorData);
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao registrar consulta. Verifique os dados e tente novamente.');
        } finally {
            setSaving(false);
        }

    };

    const resetForm = () => {
        setFormData({
            dataConsulta: '',
            duracao: 60,
            procedimentos: '',
            dentesAtendidos: '',
            anestesiaUsada: '',
            materiaisUsados: '',
            observacoes: '',
            valorCobrado: '',
            proximaConsulta: '',
            compareceu: true,
        });
    };

    if (loading) {
        return <div className="text-center py-8">Carregando consultas...</div>;
    }

    return (
        <div id="consultations-tab-root">
            <div className="flex items-center justify-between mb-6">
                <h2 id="consultations-title" className="text-xl font-semibold text-gray-900">Histórico de Consultas</h2>
                <button
                    id="btn-new-consultation"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    Nova Consulta
                </button>
            </div>

            {consultas.length === 0 ? (
                <div id="empty-state-consultations" className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                    <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Nenhuma consulta registrada</p>
                    <p className="text-sm text-gray-500 mt-1">Clique em "Nova Consulta" para adicionar</p>
                </div>
            ) : (
                <div id="consultations-list" className="space-y-4">
                    {consultas.map((consulta: any) => {
                        const isExpanded = expandedConsultation === consulta.id;
                        return (
                            <div key={consulta.id} id={`consultation-card-${consulta.id}`} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
                                {/* Header - Sempre visível */}
                                <div
                                    id={`consultation-header-${consulta.id}`}
                                    className="p-4 cursor-pointer"
                                    onClick={() => setExpandedConsultation(isExpanded ? null : consulta.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CalendarIcon className="w-5 h-5 text-blue-600" />
                                                <p className="font-semibold text-gray-900 text-lg">
                                                    {formatSafeDate(consulta.dataConsulta) || 'Data inválida'}
                                                </p>
                                                {consulta.compareceu ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Compareceu
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                                                        <XCircle className="w-3 h-3" />
                                                        Faltou
                                                    </span>
                                                )}
                                            </div>
                                            {consulta.procedimentos.length > 0 && (
                                                <p className="text-sm text-gray-600 ml-7">
                                                    {consulta.procedimentos.join(', ')}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm font-medium">{consulta.duracao} min</span>
                                            </div>
                                            <ChevronDown
                                                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'transform rotate-180' : ''
                                                    }`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Detalhes Expandidos */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                            {/* Dentes Atendidos */}
                                            {consulta.dentesAtendidos?.length > 0 && (
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                        <span className="text-xs font-semibold text-blue-900 uppercase">Dentes Atendidos</span>
                                                    </div>
                                                    <p className="text-sm text-blue-800 font-medium">
                                                        {consulta.dentesAtendidos.join(', ')}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Anestesia */}
                                            {consulta.anestesiaUsada && (
                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Syringe className="w-4 h-4 text-purple-600" />
                                                        <span className="text-xs font-semibold text-purple-900 uppercase">Anestesia</span>
                                                    </div>
                                                    <p className="text-sm text-purple-800">
                                                        {consulta.anestesiaUsada}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Materiais */}
                                            {consulta.materiaisUsados && (
                                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Box className="w-4 h-4 text-orange-600" />
                                                        <span className="text-xs font-semibold text-orange-900 uppercase">Materiais Utilizados</span>
                                                    </div>
                                                    <p className="text-sm text-orange-800">
                                                        {consulta.materiaisUsados}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Dentista */}
                                            {consulta.dentista && (
                                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <User className="w-4 h-4 text-indigo-600" />
                                                        <span className="text-xs font-semibold text-indigo-900 uppercase">Dentista Responsável</span>
                                                    </div>
                                                    <p className="text-sm text-indigo-800 font-medium">
                                                        Dr(a). {consulta.dentista.name}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Valor Cobrado */}
                                            {consulta.valorCobrado && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                                        <span className="text-xs font-semibold text-green-900 uppercase">Valor Cobrado</span>
                                                    </div>
                                                    <p className="text-lg text-green-700 font-bold">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(consulta.valorCobrado)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Próxima Consulta */}
                                            {consulta.proximaConsulta && formatSafeDate(consulta.proximaConsulta) && (
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CalendarIcon className="w-4 h-4 text-yellow-600" />
                                                        <span className="text-xs font-semibold text-yellow-900 uppercase">Próxima Consulta</span>
                                                    </div>
                                                    <p className="text-sm text-yellow-800 font-medium">
                                                        {formatSafeDate(consulta.proximaConsulta)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Observações */}
                                        {consulta.observacoes && (
                                            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Observações</h4>
                                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                                    {consulta.observacoes}
                                                </p>
                                            </div>
                                        )}

                                        {/* Footer com data de criação */}
                                        <div className="mt-4 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">
                                                Registrado em {formatSafeDate(consulta.createdAt) || '-'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div id="modal-new-consultation" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">Registrar Nova Consulta</h3>
                            <button
                                id="btn-close-modal"
                                onClick={() => { setShowModal(false); resetForm(); }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data e Hora da Consulta *
                                    </label>
                                    <input
                                        id="input-data-consulta"
                                        type="datetime-local"
                                        required
                                        value={formData.dataConsulta}
                                        onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duração (minutos)
                                    </label>
                                    <input
                                        id="input-duracao"
                                        type="number"
                                        value={formData.duracao}
                                        onChange={(e) => setFormData({ ...formData, duracao: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        min="15"
                                        step="15"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Procedimentos Realizados
                                </label>
                                <input
                                    id="input-procedimentos"
                                    type="text"
                                    value={formData.procedimentos}
                                    onChange={(e) => setFormData({ ...formData, procedimentos: e.target.value })}
                                    placeholder="Ex: Limpeza, Restauração, Extração (separe por vírgula)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dentes Atendidos
                                </label>
                                <input
                                    id="input-dentes-atendidos"
                                    type="text"
                                    value={formData.dentesAtendidos}
                                    onChange={(e) => setFormData({ ...formData, dentesAtendidos: e.target.value })}
                                    placeholder="Ex: 11, 12, 21 (números de 1 a 32, separados por vírgula)"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Anestesia Utilizada
                                    </label>
                                    <input
                                        id="input-anestesia"
                                        type="text"
                                        value={formData.anestesiaUsada}
                                        onChange={(e) => setFormData({ ...formData, anestesiaUsada: e.target.value })}
                                        placeholder="Ex: Lidocaína 2%"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Materiais Utilizados
                                    </label>
                                    <input
                                        id="input-materiais"
                                        type="text"
                                        value={formData.materiaisUsados}
                                        onChange={(e) => setFormData({ ...formData, materiaisUsados: e.target.value })}
                                        placeholder="Ex: Resina composta"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Observações
                                </label>
                                <textarea
                                    id="input-observacoes"
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    rows={3}
                                    placeholder="Anote detalhes importantes sobre a consulta..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Valor Cobrado (R$)
                                    </label>
                                    <input
                                        id="input-valor-cobrado"
                                        type="number"
                                        step="0.01"
                                        value={formData.valorCobrado}
                                        onChange={(e) => setFormData({ ...formData, valorCobrado: e.target.value })}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Próxima Consulta
                                    </label>
                                    <input
                                        id="input-proxima-consulta"
                                        type="datetime-local"
                                        value={formData.proximaConsulta}
                                        onChange={(e) => setFormData({ ...formData, proximaConsulta: e.target.value })}
                                        max="9999-12-31T23:59"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Status de Comparecimento */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status de Comparcimento
                                        </label>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            O paciente compareceu à consulta?
                                        </p>
                                    </div>
                                    <button
                                        id="btn-toggle-compareceu"
                                        type="button"
                                        onClick={() => setFormData({ ...formData, compareceu: !formData.compareceu })}
                                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${formData.compareceu ? 'bg-green-500' : 'bg-red-500'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${formData.compareceu ? 'translate-x-9' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                                <div className="mt-2">
                                    {formData.compareceu ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Compareceu
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                                            <XCircle className="w-4 h-4" />
                                            Não Compareceu (No-Show)
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    id="btn-cancel-consultation"
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    id="btn-save-consultation"
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Salvando...' : 'Salvar Consulta'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
