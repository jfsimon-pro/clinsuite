'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import './login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (error) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-left">
        <div className="brand-wrap">
          <div className="brand-logo" aria-hidden="true">
            <span className="logo-icon" />
            <span className="logo-text">clin.<strong>ia</strong></span>
          </div>
          <p className="brand-subtitle">A inteligência que sua<br/> clínica precisa!</p>
        </div>
      </div>

      <div className="login-right">
        <form className="form" onSubmit={handleSubmit}>
          <h1 className="form-title">Faça Login<br/>e comece<br/>a usar!</h1>

          <div className="field">
            <label htmlFor="email" className="field-label">Endereço de email</label>
            <div className="input with-icon">
              <span className="icon" aria-hidden>✉️</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Endereço de email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">Sua senha</label>
            <div className="input with-icon">
              <span className="icon" aria-hidden>🔒</span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <a className="forgot-link" href="#" onClick={(e) => e.preventDefault()}>Esqueceu sua senha?</a>
          </div>

          {error && <div className="error-msg" role="alert">{error}</div>}

          <button type="submit" className="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar na plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
} 