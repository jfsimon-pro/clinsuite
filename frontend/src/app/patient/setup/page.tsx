'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { Mail, Lock, Phone, AlertCircle, CheckCircle } from 'lucide-react';
import './patient-setup.css';

export default function PatientSetupPage() {
    const router = useRouter();
    const { setup } = usePatientAuth();
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validações
        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('As senhas não conferem');
            return;
        }

        setLoading(true);

        try {
            await setup(phone, email, password);
            router.push('/patient/dashboard');
        } catch (err: any) {
            setError(err.message || 'Erro ao criar senha');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="patient-setup-root">
            <div className="patient-setup-left">
                <div className="patient-setup-brand-wrap">
                    <div className="patient-setup-brand-logo">
                        <span className="patient-setup-logo-icon">
                            <svg className="patient-setup-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </span>
                        <span className="patient-setup-logo-text">Primeiro<br /><strong>Acesso</strong></span>
                    </div>

                </div>
            </div>

            <div className="patient-setup-right">
                <form className="patient-setup-form" onSubmit={handleSubmit}>
                    <h1 className="patient-setup-form-title">
                        Crie sua<br />
                        senha
                    </h1>

                    <div className="patient-setup-info-box">
                        <div className="info-box-header">
                            <AlertCircle className="w-4 h-4" />
                            <h3>Informações importantes:</h3>
                        </div>
                        <ul>
                            <li>Use o telefone e email cadastrados na clínica</li>
                            <li>A senha deve ter no mínimo 6 caracteres</li>
                            <li>Você será redirecionado após criar sua senha</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="patient-setup-error-msg" role="alert">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="patient-setup-field">
                        <label htmlFor="phone" className="patient-setup-field-label">Telefone</label>
                        <div className="patient-setup-input with-icon">
                            <Phone className="patient-setup-icon" />
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                placeholder="(00) 00000-0000"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <p className="patient-setup-field-hint">Use o telefone cadastrado na clínica</p>
                    </div>

                    <div className="patient-setup-field">
                        <label htmlFor="email" className="patient-setup-field-label">Email</label>
                        <div className="patient-setup-input with-icon">
                            <Mail className="patient-setup-icon" />
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
                        <p className="patient-setup-field-hint">Use o email cadastrado na clínica</p>
                    </div>

                    <div className="patient-setup-field">
                        <label htmlFor="password" className="patient-setup-field-label">Nova Senha</label>
                        <div className="patient-setup-input with-icon">
                            <Lock className="patient-setup-icon" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Mínimo 6 caracteres"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="patient-setup-field">
                        <label htmlFor="confirmPassword" className="patient-setup-field-label">Confirmar Senha</label>
                        <div className="patient-setup-input with-icon">
                            <Lock className="patient-setup-icon" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Digite a senha novamente"
                                required
                                minLength={6}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="patient-setup-submit" disabled={loading}>
                        {loading ? 'Criando senha...' : 'Criar Senha e Entrar'}
                    </button>

                    <div className="patient-setup-divider">
                        <span>Já possui uma senha?</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push('/patient/login')}
                        className="patient-setup-login-link"
                    >
                        Fazer login →
                    </button>
                </form>

                <p className="patient-setup-footer-text">
                    Problemas para acessar? Entre em contato com a clínica
                </p>
            </div>
        </div>
    );
}
