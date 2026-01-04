'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/context/PatientAuthContext';
import './patient-login.css';

export default function PatientLoginPage() {
    const router = useRouter();
    const { login } = usePatientAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            router.push('/patient/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-login-root">
            <div className="patient-login-left">
                <div className="patient-brand-wrap">
                    <div className="patient-brand-logo">
                        <span className="patient-logo-icon">
                            <svg className="patient-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </span>
                        <span className="patient-logo-text"><strong>Login</strong></span>
                    </div>
                </div>
            </div>

            <div className="patient-login-right">
                <form className="patient-form" onSubmit={handleSubmit}>
                    <h1 className="patient-form-title">
                        Bem-vindo<br />
                        de volta!
                    </h1>

                    {error && (
                        <div className="patient-error-msg" role="alert">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="patient-field">
                        <label htmlFor="email" className="patient-field-label">Endereço de email</label>
                        <div className="patient-input with-icon">
                            <span className="patient-icon" aria-hidden>✉️</span>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="seu@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="patient-field">
                        <label htmlFor="password" className="patient-field-label">Sua senha</label>
                        <div className="patient-input with-icon">
                            <span className="patient-icon" aria-hidden>🔒</span>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="patient-submit" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar no Portal'}
                    </button>

                    <div className="patient-divider">
                        <span>Primeira vez aqui?</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push('/patient/setup')}
                        className="patient-setup-link"
                    >
                        Criar minha senha →
                    </button>
                </form>

                <p className="patient-footer-text">
                    Precisa de ajuda? Entre em contato com a clínica
                </p>
            </div>
        </div>
    );
}
