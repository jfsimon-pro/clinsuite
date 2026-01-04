'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { unitsApi } from '@/lib/api';
import { Building2, Plus, MapPin, Phone, Mail, Users, Briefcase, Target, Edit, Trash2, CheckCircle } from 'lucide-react';

interface Unit {
    id: string;
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    active: boolean;
    manager?: {
        id: string;
        name: string;
    };
    _count?: {
        funnels: number;
        leads: number;
        users: number;
    };
}

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        address: '',
        phone: '',
        email: '',
    });

    const { user } = useAuth();

    useEffect(() => {
        if (user && user.role === 'ADMIN') {
            fetchUnits();
        } else if (user) {
            setLoading(false);
        }
    }, [user]);

    const fetchUnits = async () => {
        try {
            const response = await unitsApi.getUnits();
            const data = response.data || response; // Fallback se data nao existir diretamente
            if (Array.isArray(data)) {
                setUnits(data);
            } else {
                setUnits([]);
            }
        } catch (error) {
            console.error('Erro ao carregar unidades:', error);
            setUnits([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingUnit) {
                await unitsApi.updateUnit(editingUnit.id, formData);
            } else {
                await unitsApi.createUnit(formData);
            }

            setShowModal(false);
            setFormData({ name: '', code: '', address: '', phone: '', email: '' });
            setEditingUnit(null);
            fetchUnits();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao salvar unidade');
        }
    };

    const handleEdit = (unit: Unit) => {
        setEditingUnit(unit);
        setFormData({
            name: unit.name,
            code: unit.code || '',
            address: unit.address || '',
            phone: unit.phone || '',
            email: unit.email || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja desativar esta unidade?')) return;

        try {
            await unitsApi.deleteUnit(id);
            fetchUnits();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Erro ao desativar unidade');
        }
    };

    if (!user || user.role !== 'ADMIN') {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
                <p className="text-gray-600">Esta página é restrita para administradores.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-64"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4 md:gap-0">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
                            <Building2 className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                            Unidades
                        </h1>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Gerencie as unidades da sua clínica</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingUnit(null);
                            setFormData({ name: '', code: '', address: '', phone: '', email: '' });
                            setShowModal(true);
                        }}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Unidade
                    </button>
                </div>

                {/* Grid de Unidades */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {units.map(unit => (
                        <div key={unit.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col h-full">
                            <div className="p-6 flex flex-col h-full">
                                {/* Header do Card */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <h3 className="text-xl font-bold text-gray-900 truncate" title={unit.name}>{unit.name}</h3>
                                        <div className="mt-1">
                                            {unit.code && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                                    {unit.code}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {unit.active && (
                                        <div className="flex-shrink-0">
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Informações */}
                                <div className="space-y-3 mb-6 flex-grow">
                                    <div className="flex items-start gap-3 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                        <span className="line-clamp-2">{unit.address || 'Endereço não informado'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                        <span>{unit.phone || 'Telefone não informado'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                        <span className="truncate">{unit.email || 'Email não informado'}</span>
                                    </div>
                                </div>

                                {/* Estatísticas e Ações (Sticky Bottom) */}
                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    {unit._count && (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                                <span className="text-lg font-bold text-gray-900">{unit._count.leads}</span>
                                                <span className="text-[10px] items-center gap-1 text-gray-500 uppercase font-semibold flex">
                                                    <Users className="w-3 h-3" /> Leads
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                                <span className="text-lg font-bold text-gray-900">{unit._count.funnels}</span>
                                                <span className="text-[10px] items-center gap-1 text-gray-500 uppercase font-semibold flex">
                                                    <Target className="w-3 h-3" /> Funis
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                                                <span className="text-lg font-bold text-gray-900">{unit._count.users}</span>
                                                <span className="text-[10px] items-center gap-1 text-gray-500 uppercase font-semibold flex">
                                                    <Briefcase className="w-3 h-3" /> Criados
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleEdit(unit)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Editar
                                        </button>
                                        {unit.code !== 'SEDE' && (
                                            <button
                                                onClick={() => handleDelete(unit.id)}
                                                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white text-red-600 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
                                                title="Desativar unidade"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {units.length === 0 && (
                    <div className="text-center py-12">
                        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma unidade cadastrada</p>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
                                </h2>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome da Unidade *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: Unidade Centro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Código
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Ex: CTR"
                                        maxLength={10}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Endereço
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Rua, Número, Bairro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="contato@unidade.com"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingUnit(null);
                                            setFormData({ name: '', code: '', address: '', phone: '', email: '' });
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingUnit ? 'Salvar' : 'Criar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
