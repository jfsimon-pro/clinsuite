'use client';

import { useUnit } from '@/context/UnitContext';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function UnitSelector() {
    const { selectedUnit, units, loading, setSelectedUnit, canAccessAllUnits } = useUnit();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading || units.length === 0) {
        return null;
    }

    // Se só tem uma unidade e usuário não é admin, não mostrar selector
    if (units.length === 1 && !canAccessAllUnits) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Building2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{selectedUnit?.name}</span>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                id="unit-selector-button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                    {selectedUnit?.name || 'Selecione uma unidade'}
                </span>
                {selectedUnit?.code && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {selectedUnit.code}
                    </span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Selecione a Unidade
                        </div>

                        {canAccessAllUnits && (
                            <>
                                <button
                                    onClick={() => {
                                        setSelectedUnit(null);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedUnit === null ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm font-medium text-gray-700">Todas as Unidades</span>
                                    </div>
                                    {selectedUnit === null && <Check className="w-4 h-4 text-blue-600" />}
                                </button>
                                <div className="h-px bg-gray-200 my-2" />
                            </>
                        )}

                        {units.map((unit) => (
                            <button
                                key={unit.id}
                                onClick={() => {
                                    setSelectedUnit(unit);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${selectedUnit?.id === unit.id ? 'bg-blue-50' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="text-sm font-medium text-gray-700 truncate">{unit.name}</div>
                                        {unit.code && (
                                            <div className="text-xs text-gray-500">{unit.code}</div>
                                        )}
                                    </div>
                                </div>
                                {selectedUnit?.id === unit.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
