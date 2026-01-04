'use client';

import { useState } from 'react';
import { Save, Edit2, X, AlertTriangle } from 'lucide-react';

interface AnamnesisTabProps {
    patient: any;
    onUpdate: () => void;
}

export default function AnamnesisTab({ patient, onUpdate }: AnamnesisTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const currentAnamnese = patient.anamnese || {};

    const [formData, setFormData] = useState({
        alergias: currentAnamnese.alergias || [],
        medicamentosUso: currentAnamnese.medicamentosUso || [],
        doencasPreexistentes: currentAnamnese.doencasPreexistentes || [],
        fumante: currentAnamnese.fumante || false,
        quantosCigarros: currentAnamnese.quantosCigarros || '',
        gestante: currentAnamnese.gestante || false,
        amamentando: currentAnamnese.amamentando || false,
        cirurgiasAnteriores: currentAnamnese.cirurgiasAnteriores || '',
        reacaoAnestesia: currentAnamnese.reacaoAnestesia || false,
        problemaCoagulacao: currentAnamnese.problemaCoagulacao || false,
        observacoes: currentAnamnese.observacoes || '',
    });

    // Estados temporários para adicionar itens às listas
    const [novaAlergia, setNovaAlergia] = useState('');
    const [novoMedicamento, setNovoMedicamento] = useState('');
    const [novaDoenca, setNovaDoenca] = useState('');

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${patient.id}/anamnesis`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                }
            );

            if (response.ok) {
                setIsEditing(false);
                onUpdate();
            } else {
                alert('Erro ao salvar anamnese');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar anamnese');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            alergias: currentAnamnese.alergias || [],
            medicamentosUso: currentAnamnese.medicamentosUso || [],
            doencasPreexistentes: currentAnamnese.doencasPreexistentes || [],
            fumante: currentAnamnese.fumante || false,
            quantosCigarros: currentAnamnese.quantosCigarros || '',
            gestante: currentAnamnese.gestante || false,
            amamentando: currentAnamnese.amamentando || false,
            cirurgiasAnteriores: currentAnamnese.cirurgiasAnteriores || '',
            reacaoAnestesia: currentAnamnese.reacaoAnestesia || false,
            problemaCoagulacao: currentAnamnese.problemaCoagulacao || false,
            observacoes: currentAnamnese.observacoes || '',
        });
        setIsEditing(false);
    };

    const addItem = (field: 'alergias' | 'medicamentosUso' | 'doencasPreexistentes', value: string) => {
        if (value.trim()) {
            setFormData({
                ...formData,
                [field]: [...formData[field], value.trim()],
            });
            if (field === 'alergias') setNovaAlergia('');
            if (field === 'medicamentosUso') setNovoMedicamento('');
            if (field === 'doencasPreexistentes') setNovaDoenca('');
        }
    };

    const removeItem = (field: 'alergias' | 'medicamentosUso' | 'doencasPreexistentes', index: number) => {
        setFormData({
            ...formData,
            [field]: formData[field].filter((_, i) => i !== index),
        });
    };

    const hasAlerts = formData.alergias.length > 0 ||
        formData.problemaCoagulacao ||
        formData.reacaoAnestesia ||
        formData.doencasPreexistentes.length > 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-semibold text-gray-900">Anamnese (História Médica)</h2>
                    {hasAlerts && !isEditing && (
                        <span className="flex items-center gap-1 text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            <AlertTriangle className="w-4 h-4" />
                            Atenção: Alertas médicos
                        </span>
                    )}
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Editar
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            <X className="w-4 h-4" />
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Alergias */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Alergias Medicamentosas
                    </h3>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={novaAlergia}
                                    onChange={(e) => setNovaAlergia(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addItem('alergias', novaAlergia)}
                                    placeholder="Digite o nome da alergia e pressione Enter"
                                    className="flex-1 px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => addItem('alergias', novaAlergia)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Adicionar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.alergias.map((alergia, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full"
                                    >
                                        {alergia}
                                        <button
                                            onClick={() => removeItem('alergias', index)}
                                            className="hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {formData.alergias.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.alergias.map((alergia, index) => (
                                        <span
                                            key={index}
                                            className="bg-red-100 text-red-800 px-3 py-1 rounded-full"
                                        >
                                            {alergia}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-red-700">Nenhuma alergia registrada</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Medicamentos em Uso */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Medicamentos em Uso Regular
                    </h3>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={novoMedicamento}
                                    onChange={(e) => setNovoMedicamento(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addItem('medicamentosUso', novoMedicamento)}
                                    placeholder="Digite o medicamento e pressione Enter"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => addItem('medicamentosUso', novoMedicamento)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Adicionar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.medicamentosUso.map((med, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                    >
                                        {med}
                                        <button
                                            onClick={() => removeItem('medicamentosUso', index)}
                                            className="hover:text-blue-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {formData.medicamentosUso.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.medicamentosUso.map((med, index) => (
                                        <span
                                            key={index}
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                        >
                                            {med}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Nenhum medicamento registrado</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Doenças Pré-existentes */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Doenças Pré-existentes
                    </h3>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={novaDoenca}
                                    onChange={(e) => setNovaDoenca(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addItem('doencasPreexistentes', novaDoenca)}
                                    placeholder="Ex: Diabetes, Hipertensão..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    onClick={() => addItem('doencasPreexistentes', novaDoenca)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Adicionar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.doencasPreexistentes.map((doenca, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                                    >
                                        {doenca}
                                        <button
                                            onClick={() => removeItem('doencasPreexistentes', index)}
                                            className="hover:text-purple-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div>
                            {formData.doencasPreexistentes.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {formData.doencasPreexistentes.map((doenca, index) => (
                                        <span
                                            key={index}
                                            className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                                        >
                                            {doenca}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">Nenhuma doença registrada</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.fumante}
                            onChange={(e) => setFormData({ ...formData, fumante: e.target.checked })}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-900">Fumante</span>
                    </label>

                    {formData.fumante && (
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">
                                Quantos cigarros por dia?
                            </label>
                            {isEditing ? (
                                <input
                                    type="number"
                                    value={formData.quantosCigarros}
                                    onChange={(e) => setFormData({ ...formData, quantosCigarros: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            ) : (
                                <p className="text-gray-900">{formData.quantosCigarros || '-'}</p>
                            )}
                        </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.gestante}
                            onChange={(e) => setFormData({ ...formData, gestante: e.target.checked })}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-900">Gestante</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.amamentando}
                            onChange={(e) => setFormData({ ...formData, amamentando: e.target.checked })}
                            disabled={!isEditing}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-900">Amamentando</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.reacaoAnestesia}
                            onChange={(e) => setFormData({ ...formData, reacaoAnestesia: e.target.checked })}
                            disabled={!isEditing}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="text-gray-900">Teve reação a anestesia</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.problemaCoagulacao}
                            onChange={(e) => setFormData({ ...formData, problemaCoagulacao: e.target.checked })}
                            disabled={!isEditing}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                        />
                        <span className="text-gray-900">Problema de coagulação</span>
                    </label>
                </div>

                {/* Cirurgias Anteriores */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cirurgias Anteriores
                    </label>
                    {isEditing ? (
                        <textarea
                            value={formData.cirurgiasAnteriores}
                            onChange={(e) => setFormData({ ...formData, cirurgiasAnteriores: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descreva cirurgias realizadas..."
                        />
                    ) : (
                        <p className="text-gray-900 whitespace-pre-wrap">{formData.cirurgiasAnteriores || 'Nenhuma cirurgia registrada'}</p>
                    )}
                </div>

                {/* Observações Gerais */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observações Gerais
                    </label>
                    {isEditing ? (
                        <textarea
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Outras informações relevantes..."
                        />
                    ) : (
                        <p className="text-gray-900 whitespace-pre-wrap">{formData.observacoes || 'Nenhuma observação'}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
