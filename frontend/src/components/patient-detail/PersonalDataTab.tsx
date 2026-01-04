'use client';

import { useState } from 'react';
import { Save, Edit2, X } from 'lucide-react';

interface PersonalDataTabProps {
    patient: any;
    onUpdate: () => void;
}

export default function PersonalDataTab({ patient, onUpdate }: PersonalDataTabProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Helper para converter data de forma segura
    const formatDateForInput = (date: any): string => {
        if (!date) return '';
        try {
            if (typeof date === 'string') {
                return date.split('T')[0];
            }
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '';
            return dateObj.toISOString().split('T')[0];
        } catch {
            return '';
        }
    };

    const [formData, setFormData] = useState({
        email: patient.email || '',
        cpf: patient.cpf || '',
        dataNascimento: formatDateForInput(patient.dataNascimento),
        endereco: patient.endereco || '',
        cidade: patient.cidade || '',
        estado: patient.estado || '',
        cep: patient.cep || '',
        contatoEmergencia: patient.contatoEmergencia || '',
        nomeContatoEmergencia: patient.nomeContatoEmergencia || '',
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${patient.id}/personal-data`,
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
                alert('Erro ao salvar dados pessoais');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar dados pessoais');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            email: patient.email || '',
            cpf: patient.cpf || '',
            dataNascimento: formatDateForInput(patient.dataNascimento),
            endereco: patient.endereco || '',
            cidade: patient.cidade || '',
            estado: patient.estado || '',
            cep: patient.cep || '',
            contatoEmergencia: patient.contatoEmergencia || '',
            nomeContatoEmergencia: patient.nomeContatoEmergencia || '',
        });
        setIsEditing(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                    </label>
                    {isEditing ? (
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900">{patient.email || '-'}</p>
                    )}
                </div>

                {/* CPF */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.cpf}
                            onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="000.000.000-00"
                        />
                    ) : (
                        <p className="text-gray-900">{patient.cpf || '-'}</p>
                    )}
                </div>

                {/* Data de Nascimento */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Nascimento
                    </label>
                    {isEditing ? (
                        <input
                            type="date"
                            value={formData.dataNascimento}
                            onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900">
                            {patient.dataNascimento
                                ? new Date(patient.dataNascimento).toLocaleDateString('pt-BR')
                                : '-'}
                        </p>
                    )}
                </div>

                {/* CEP */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.cep}
                            onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="00000-000"
                        />
                    ) : (
                        <p className="text-gray-900">{patient.cep || '-'}</p>
                    )}
                </div>

                {/* Endereço - span 2 colunas */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Endereço
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.endereco}
                            onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Rua, número, complemento"
                        />
                    ) : (
                        <p className="text-gray-900">{patient.endereco || '-'}</p>
                    )}
                </div>

                {/* Cidade */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.cidade}
                            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    ) : (
                        <p className="text-gray-900">{patient.cidade || '-'}</p>
                    )}
                </div>

                {/* Estado */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                    </label>
                    {isEditing ? (
                        <input
                            type="text"
                            value={formData.estado}
                            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: DF, SP, RJ"
                            maxLength={2}
                        />
                    ) : (
                        <p className="text-gray-900">{patient.estado || '-'}</p>
                    )}
                </div>

                {/* Contato de Emergência */}
                <div className="md:col-span-2 border-t border-gray-200 pt-6 mt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contato de Emergência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={formData.nomeContatoEmergencia}
                                    onChange={(e) => setFormData({ ...formData, nomeContatoEmergencia: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900">{patient.nomeContatoEmergencia || '-'}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Telefone
                            </label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    value={formData.contatoEmergencia}
                                    onChange={(e) => setFormData({ ...formData, contatoEmergencia: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            ) : (
                                <p className="text-gray-900">{patient.contatoEmergencia || '-'}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
