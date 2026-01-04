'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tag as TagIcon, Plus, Pencil, Trash2, X, Check, Palette } from 'lucide-react';

interface Tag {
    id: string;
    name: string;
    color: string;
    icon?: string;
    description?: string;
    isSystem: boolean;
    _count?: {
        leads: number;
    };
}

const PRESET_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308',
    '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
];

const PRESET_ICONS = ['🔥', '❄️', '⭐', '💰', '⚡', '🎯', '🦷', '💎', '🔄', '✅', '❌', '⏰', '📌', '🏆', '💡', '🎉'];

export default function TagsPage() {
    const { user } = useAuth();
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        color: '#6366F1',
        icon: '',
        description: ''
    });

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/tags`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setTags(data);
            }
        } catch (error) {
            console.error('Erro ao buscar tags:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            alert('Nome da tag é obrigatório');
            return;
        }

        try {
            const url = editingTag
                ? `${process.env.NEXT_PUBLIC_API_URL}/crm/tags/${editingTag.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/crm/tags`;

            const response = await fetch(url, {
                method: editingTag ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchTags();
                closeModal();
            } else {
                const error = await response.text();
                alert(`Erro: ${error}`);
            }
        } catch (error) {
            console.error('Erro ao salvar tag:', error);
            alert('Erro ao salvar tag');
        }
    };

    const handleDelete = async (tag: Tag) => {
        if (tag.isSystem) {
            alert('Tags do sistema não podem ser deletadas');
            return;
        }

        const leadsCount = tag._count?.leads || 0;
        const message = leadsCount > 0
            ? `Esta tag está sendo usada em ${leadsCount} lead(s). Deseja realmente excluí-la?`
            : 'Deseja realmente excluir esta tag?';

        if (!confirm(message)) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/tags/${tag.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                await fetchTags();
            } else {
                alert('Erro ao deletar tag');
            }
        } catch (error) {
            console.error('Erro ao deletar tag:', error);
        }
    };

    const openModal = (tag?: Tag) => {
        if (tag) {
            setEditingTag(tag);
            setFormData({
                name: tag.name,
                color: tag.color,
                icon: tag.icon || '',
                description: tag.description || ''
            });
        } else {
            setEditingTag(null);
            setFormData({
                name: '',
                color: '#6366F1',
                icon: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingTag(null);
        setFormData({ name: '', color: '#6366F1', icon: '', description: '' });
    };

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Acesso Restrito</h2>
                    <p className="text-gray-500 mt-2">Apenas administradores podem gerenciar tags.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                            <TagIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Tags</h1>
                            <p className="text-gray-500">Crie e gerencie tags para classificar seus leads</p>
                        </div>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Nova Tag
                    </button>
                </div>

                {/* Lista de Tags */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-16 bg-gray-200 rounded-xl" />
                            ))}
                        </div>
                    </div>
                ) : tags.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhuma tag criada</h3>
                        <p className="text-gray-500 mb-6">Crie sua primeira tag para classificar leads</p>
                        <button
                            onClick={() => openModal()}
                            className="px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
                        >
                            Criar Primeira Tag
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {tags.map(tag => (
                                <div key={tag.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        {/* Cor e Ícone */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                                            style={{ backgroundColor: `${tag.color}20` }}
                                        >
                                            {tag.icon || <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-gray-900 truncate">{tag.name}</span>
                                                {tag.isSystem && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full shrink-0">
                                                        Sistema
                                                    </span>
                                                )}
                                            </div>
                                            {tag.description && (
                                                <p className="text-sm text-gray-500 truncate">{tag.description}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {tag._count?.leads || 0} lead(s)
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex items-center justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                                        <button
                                            onClick={() => openModal(tag)}
                                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tag)}
                                            disabled={tag.isSystem}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                            title={tag.isSystem ? 'Tags do sistema não podem ser deletadas' : 'Deletar'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Modal de Criar/Editar */}
                {showModal && (
                    <>
                        <div className="fixed inset-0 bg-black/50 z-40" onClick={closeModal} />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl w-[95%] md:w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {editingTag ? 'Editar Tag' : 'Nova Tag'}
                                    </h2>
                                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Nome */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nome da Tag *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ex: VIP, Urgente, Implante..."
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Descrição */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descrição (opcional)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Descrição da tag..."
                                            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Cor */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                            <Palette className="w-4 h-4" />
                                            Cor
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {PRESET_COLORS.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color })}
                                                    className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'hover:scale-105'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Ícone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ícone (opcional)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon: '' })}
                                                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${formData.icon === '' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <X className="w-4 h-4 text-gray-400" />
                                            </button>
                                            {PRESET_ICONS.map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon })}
                                                    className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${formData.icon === icon ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Preview */}
                                    <div className="pt-4 border-t">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Preview
                                        </label>
                                        <span
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                                            style={{
                                                backgroundColor: `${formData.color}20`,
                                                color: formData.color,
                                                border: `1px solid ${formData.color}40`
                                            }}
                                        >
                                            {formData.icon && <span>{formData.icon}</span>}
                                            <span>{formData.name || 'Nome da tag'}</span>
                                        </span>
                                    </div>

                                    {/* Botões */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check className="w-4 h-4" />
                                            {editingTag ? 'Salvar' : 'Criar Tag'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
