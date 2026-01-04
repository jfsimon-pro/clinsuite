'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';

interface Tag {
    id: string;
    name: string;
    color: string;
    icon?: string;
}

interface LeadTagsProps {
    leadId: string;
    initialTags?: Tag[];
    onTagsChange?: (tags: Tag[]) => void;
    readOnly?: boolean;
    size?: 'sm' | 'md';
}

export default function LeadTags({
    leadId,
    initialTags = [],
    onTagsChange,
    readOnly = false,
    size = 'md'
}: LeadTagsProps) {
    const [tags, setTags] = useState<Tag[]>(initialTags);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Carregar tags disponíveis da empresa
    useEffect(() => {
        fetchAvailableTags();
    }, []);

    // Atualizar tags quando props mudar
    useEffect(() => {
        setTags(initialTags);
    }, [initialTags]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAvailableTags = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/tags`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAvailableTags(data);
            }
        } catch (error) {
            console.error('Erro ao buscar tags:', error);
        }
    };

    const addTag = async (tag: Tag) => {
        if (tags.find(t => t.id === tag.id)) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/crm/tags/${tag.id}/leads/${leadId}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const newTags = [...tags, tag];
                setTags(newTags);
                onTagsChange?.(newTags);
                setShowDropdown(false);
            }
        } catch (error) {
            console.error('Erro ao adicionar tag:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeTag = async (tagId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/crm/tags/${tagId}/leads/${leadId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );

            if (response.ok) {
                const newTags = tags.filter(t => t.id !== tagId);
                setTags(newTags);
                onTagsChange?.(newTags);
            }
        } catch (error) {
            console.error('Erro ao remover tag:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Tags que ainda não foram adicionadas ao lead
    const availableToAdd = availableTags.filter(t => !tags.find(lt => lt.id === t.id));

    const sizeClasses = size === 'sm'
        ? 'px-1.5 py-0.5 text-[10px]'
        : 'px-2 py-1 text-xs';

    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {/* Tags atuais */}
            {tags.map(tag => (
                <span
                    key={tag.id}
                    className={`inline-flex items-center gap-1 rounded-full font-medium transition-all ${sizeClasses}`}
                    style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1px solid ${tag.color}40`
                    }}
                >
                    {tag.icon && <span>{tag.icon}</span>}
                    <span>{tag.name}</span>
                    {!readOnly && (
                        <button
                            onClick={() => removeTag(tag.id)}
                            disabled={isLoading}
                            className="ml-0.5 hover:opacity-70 transition-opacity disabled:opacity-50"
                        >
                            <X className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                        </button>
                    )}
                </span>
            ))}

            {/* Botão para adicionar tag */}
            {!readOnly && availableToAdd.length > 0 && (
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        disabled={isLoading}
                        className={`inline-flex items-center gap-1 rounded-full font-medium bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all disabled:opacity-50 ${sizeClasses}`}
                    >
                        <Plus className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                        <span>Tag</span>
                    </button>

                    {/* Dropdown de tags disponíveis */}
                    {showDropdown && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px] max-h-[200px] overflow-y-auto">
                            {availableToAdd.map(tag => (
                                <button
                                    key={tag.id}
                                    onClick={() => addTag(tag)}
                                    disabled={isLoading}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
                                >
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                    {tag.icon && <span>{tag.icon}</span>}
                                    <span className="text-gray-700">{tag.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Botão para criar tags quando não existem */}
            {!readOnly && availableTags.length === 0 && (
                <button
                    onClick={async () => {
                        setIsLoading(true);
                        try {
                            const response = await fetch(
                                `${process.env.NEXT_PUBLIC_API_URL}/crm/tags/create-defaults`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                    },
                                }
                            );

                            if (response.ok) {
                                await fetchAvailableTags();
                            }
                        } catch (error) {
                            console.error('Erro ao criar tags:', error);
                        } finally {
                            setIsLoading(false);
                        }
                    }}
                    disabled={isLoading}
                    className={`inline-flex items-center gap-1 rounded-full font-medium bg-violet-100 hover:bg-violet-200 text-violet-600 transition-all disabled:opacity-50 ${sizeClasses}`}
                >
                    <Plus className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
                    <span>{isLoading ? 'Criando...' : 'Criar Tags'}</span>
                </button>
            )}

            {/* Mensagem se não houver tags */}
            {tags.length === 0 && readOnly && (
                <span className="text-xs text-gray-400 italic flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    Sem tags
                </span>
            )}
        </div>
    );
}
