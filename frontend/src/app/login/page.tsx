'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { User, Lock, Eye, EyeOff, LayoutGrid } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Lado Esquerdo - Branding */}
      <div
        className="relative flex flex-col items-center justify-center p-8 lg:p-12 overflow-hidden min-h-[35vh] lg:min-h-screen"
        style={{
          backgroundColor: '#C7E0B8', // Base verde-claro
          backgroundImage: `
            radial-gradient(at 0% 0%, #D6C6DC 0px, transparent 50%), 
            radial-gradient(at 100% 0%, #F4F3B0 0px, transparent 50%), 
            radial-gradient(at 0% 100%, #ADD6D4 0px, transparent 50%), 
            radial-gradient(at 100% 100%, #F8D3B3 0px, transparent 50%)
          `
        }}
      >
        {/* Efeito de overlay suave para melhorar contraste se necessário */}
        <div className="relative z-10 text-center space-y-4 lg:space-y-8">
          {/* Logo Clin Suite */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-20 lg:w-80 lg:h-32 mb-2 lg:mb-4">
              <Image
                src="/logo.svg"
                alt="Clin Suite Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="space-y-1 lg:space-y-2">
            <h2 className="text-lg lg:text-3xl font-bold text-white tracking-wide">
              Centralize processos
            </h2>
            <h2 className="text-lg lg:text-3xl font-bold text-white tracking-wide opacity-90">
              & Humanize a experiência.
            </h2>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="flex flex-col items-center justify-center p-6 lg:p-8 bg-[#FFF5F5]">
        <div className="w-full max-w-md space-y-6 lg:space-y-8">
          <div className="mb-6 lg:mb-10 text-center lg:text-left">
            <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 leading-tight">
              Faça Login<br className="hidden lg:block" />
              <span className="lg:hidden"> </span>
              e comece<br className="hidden lg:block" />
              <span className="lg:hidden"> </span>
              a usar!
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Input Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 lg:py-4 bg-white border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white shadow-sm transition-all"
                placeholder="Endereço de email"
              />
            </div>

            {/* Input Senha */}
            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 lg:py-4 bg-white border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-white shadow-sm transition-all"
                  placeholder="Sua senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <div className="flex justify-end lg:justify-start">
                <a href="#" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                  Esqueceu sua senha?
                </a>
              </div>
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 lg:py-4 px-4 rounded-xl shadow-sm text-sm font-bold text-gray-900 bg-[#EEF86F] hover:bg-[#E6F05E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar na plataforma'}
            </button>

            {/* Botão Google */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 lg:py-4 px-4 rounded-xl shadow-sm bg-white border border-gray-100 text-sm font-medium text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21-1.19-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Faça login com sua conta Google
            </button>

            {/* Link para Pacientes */}
            <div className="border-t border-gray-200 pt-6 mt-6 text-center">
              <p className="text-xs text-gray-500 mb-3">Você é um paciente?</p>
              <div className="flex justify-center gap-4 text-sm font-medium">
                <a href="/patient/login" className="text-purple-600 hover:text-purple-500">
                  Login do Paciente
                </a>
                <span className="text-gray-300">|</span>
                <a href="/patient/setup" className="text-green-600 hover:text-green-500">
                  Criar Conta
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 