'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { unitsApi } from '@/lib/api';

interface Unit {
    id: string;
    name: string;
    code?: string;
    active: boolean;
}

interface UnitContextType {
    selectedUnit: Unit | null;
    units: Unit[];
    loading: boolean;
    setSelectedUnit: (unit: Unit | null) => void;
    refreshUnits: () => Promise<void>;
    canAccessAllUnits: boolean;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export function UnitProvider({ children }: { children: ReactNode }) {
    const [selectedUnit, setSelectedUnitState] = useState<Unit | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    // Carregar unidades e unidade selecionada do localStorage
    useEffect(() => {
        const loadUnits = async () => {
            try {
                // Verificar se tem token (usuário logado)
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Pegar role do usuário
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    setUserRole(user.role || '');
                }

                // Buscar unidades
                const response = await unitsApi.getUnits();
                setUnits(response.data);

                // Tentar carregar unidade selecionada do localStorage
                const savedUnitId = localStorage.getItem('selectedUnitId');
                if (savedUnitId) {
                    const savedUnit = response.data.find((u: Unit) => u.id === savedUnitId);
                    if (savedUnit) {
                        setSelectedUnitState(savedUnit);
                    } else {
                        // Se não encontrou, seleciona a primeira
                        if (response.data.length > 0) {
                            setSelectedUnitState(response.data[0]);
                            localStorage.setItem('selectedUnitId', response.data[0].id);
                        }
                    }
                } else {
                    // Se não tem salvo, seleciona a primeira
                    if (response.data.length > 0) {
                        setSelectedUnitState(response.data[0]);
                        localStorage.setItem('selectedUnitId', response.data[0].id);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar unidades:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUnits();
    }, []);

    const setSelectedUnit = (unit: Unit | null) => {
        setSelectedUnitState(unit);
        if (unit) {
            localStorage.setItem('selectedUnitId', unit.id);
        } else {
            localStorage.removeItem('selectedUnitId');
        }
    };

    const refreshUnits = async () => {
        try {
            const response = await unitsApi.getUnits();
            setUnits(response.data);

            // Atualizar unidade selecionada se ainda existe
            if (selectedUnit) {
                const updatedUnit = response.data.find((u: Unit) => u.id === selectedUnit.id);
                if (updatedUnit) {
                    setSelectedUnitState(updatedUnit);
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar unidades:', error);
        }
    };

    const canAccessAllUnits = userRole === 'ADMIN';

    return (
        <UnitContext.Provider
            value={{
                selectedUnit,
                units,
                loading,
                setSelectedUnit,
                refreshUnits,
                canAccessAllUnits,
            }}
        >
            {children}
        </UnitContext.Provider>
    );
}

export function useUnit() {
    const context = useContext(UnitContext);
    if (context === undefined) {
        throw new Error('useUnit must be used within a UnitProvider');
    }
    return context;
}
