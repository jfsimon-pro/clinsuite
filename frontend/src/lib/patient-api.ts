const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Interfaces
interface LoginResponse {
    token: string;
    patient: any;
}

interface SetupResponse {
    message: string;
    patient: any;
}

// API Client para Portal do Paciente
export const patientApi = {
    // Primeiro acesso - criar senha
    async setup(phone: string, email: string, password: string): Promise<SetupResponse> {
        const response = await fetch(`${API_URL}/patient-auth/setup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao criar senha');
        }

        return response.json();
    },

    // Login
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await fetch(`${API_URL}/patient-auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Email ou senha incorretos');
        }

        return response.json();
    },

    // Obter dados do paciente logado
    async getMe(token: string) {
        const response = await fetch(`${API_URL}/patient-auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar dados do paciente');
        }

        return response.json();
    },

    // Trocar senha
    async changePassword(token: string, currentPassword: string, newPassword: string) {
        const response = await fetch(`${API_URL}/patient-auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao trocar senha');
        }

        return response.json();
    },

    // Atualizar perfil
    async updateProfile(token: string, data: any) {
        const response = await fetch(`${API_URL}/patient-auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro ao atualizar perfil');
        }

        return response.json();
    },

    // Obter consultas
    async getAppointments(token: string) {
        const response = await fetch(`${API_URL}/patient-auth/appointments`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar consultas');
        }

        return response.json();
    },

    // Obter documentos
    async getDocuments(token: string) {
        const response = await fetch(`${API_URL}/patient-auth/documents`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar documentos');
        }

        return response.json();
    },

    // Obter pagamentos
    async getPayments(token: string) {
        const response = await fetch(`${API_URL}/patient-auth/payments`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar pagamentos');
        }

        return response.json();
    },
};
