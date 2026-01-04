'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { patientApi } from '@/lib/patient-api';

interface Patient {
    id: string;
    name: string | null;
    email: string | null;
    phone: string;
    dataConsulta: string | null;
    company: {
        id: string;
        name: string;
        logoUrl: string | null;
        primaryColor: string | null;
    };
    dentist: {
        id: string;
        name: string;
        email: string;
    } | null;
}

interface PatientAuthContextType {
    patient: Patient | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    setup: (phone: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshPatient: () => Promise<void>;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: ReactNode }) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar token do localStorage ao iniciar
    useEffect(() => {
        const loadAuth = async () => {
            const savedToken = localStorage.getItem('patient_token');
            if (savedToken) {
                setToken(savedToken);
                try {
                    const data = await patientApi.getMe(savedToken);
                    setPatient(data);
                } catch (error) {
                    // Token inválido, limpar
                    localStorage.removeItem('patient_token');
                    setToken(null);
                }
            }
            setIsLoading(false);
        };

        loadAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await patientApi.login(email, password);
        setToken(response.token);
        setPatient(response.patient);
        localStorage.setItem('patient_token', response.token);
    };

    const setup = async (phone: string, email: string, password: string) => {
        await patientApi.setup(phone, email, password);
        // Após criar senha, fazer login automaticamente
        await login(email, password);
    };

    const logout = () => {
        setToken(null);
        setPatient(null);
        localStorage.removeItem('patient_token');
    };

    const refreshPatient = async () => {
        if (token) {
            const data = await patientApi.getMe(token);
            setPatient(data);
        }
    };

    return (
        <PatientAuthContext.Provider
            value={{
                patient,
                token,
                isAuthenticated: !!token && !!patient,
                isLoading,
                login,
                setup,
                logout,
                refreshPatient,
            }}
        >
            {children}
        </PatientAuthContext.Provider>
    );
}

export function usePatientAuth() {
    const context = useContext(PatientAuthContext);
    if (context === undefined) {
        throw new Error('usePatientAuth deve ser usado dentro de PatientAuthProvider');
    }
    return context;
}
