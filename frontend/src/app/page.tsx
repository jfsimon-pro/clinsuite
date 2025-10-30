'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');

    if (token) {
      // Se logado, vai para dashboard
      router.replace('/dashboard');
    } else {
      // Se não logado, vai para login
      router.replace('/login');
    }
  }, [router]);

  // Mostra apenas um loader simples durante o redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Carregando...</p>
      </div>
    </div>
  );
}
