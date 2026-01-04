'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { PatientAuthProvider, usePatientAuth } from '@/context/PatientAuthContext';
import { Home, Calendar, FileText, CreditCard, User, LogOut, Stethoscope, Menu, X } from 'lucide-react';
import { useState } from 'react';

function PatientLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { patient, isAuthenticated, isLoading, logout } = usePatientAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Redirecionar para login se não estiver autenticado
    useEffect(() => {
        if (!isLoading && !isAuthenticated && pathname !== '/patient/login' && pathname !== '/patient/setup') {
            router.push('/patient/login');
        }
    }, [isAuthenticated, isLoading, pathname, router]);

    // Fechar menu ao mudar de página
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Mostrar loading
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // Páginas públicas (login e setup) não precisam de layout
    if (pathname === '/patient/login' || pathname === '/patient/setup') {
        return <>{children}</>;
    }

    // Se não estiver autenticado, não renderizar nada (vai redirecionar)
    if (!isAuthenticated) {
        return null;
    }

    // Menu items para bottom navigation (apenas 5 principais)
    const bottomNavItems = [
        { name: 'Início', href: '/patient/dashboard', icon: Home },
        { name: 'Consultas', href: '/patient/appointments', icon: Calendar },
        { name: 'Saúde', href: '/patient/health', icon: Stethoscope },
        { name: 'Pagamentos', href: '/patient/payments', icon: CreditCard },
        { name: 'Perfil', href: '/patient/profile', icon: User },
    ];

    // Menu completo para sidebar e overlay
    const allMenuItems = [
        { name: 'Início', href: '/patient/dashboard', icon: Home },
        { name: 'Consultas', href: '/patient/appointments', icon: Calendar },
        { name: 'Minha Saúde', href: '/patient/health', icon: Stethoscope },
        { name: 'Documentos', href: '/patient/documents', icon: FileText },
        { name: 'Pagamentos', href: '/patient/payments', icon: CreditCard },
        { name: 'Perfil', href: '/patient/profile', icon: User },
    ];

    const handleLogout = () => {
        logout();
        router.push('/patient/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - Otimizado para Mobile */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="flex items-center justify-between h-14 sm:h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            {patient?.company?.logoUrl ? (
                                <img
                                    src={patient.company.logoUrl}
                                    alt={patient.company.name}
                                    className="h-7 sm:h-8 w-auto"
                                />
                            ) : (
                                <div className="h-8 w-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm">
                                        {patient?.company?.name?.[0] || 'C'}
                                    </span>
                                </div>
                            )}
                            <div className="hidden sm:block">
                                <span className="font-semibold text-gray-900">
                                    {patient?.company?.name || 'Portal do Paciente'}
                                </span>
                            </div>
                        </div>

                        {/* Mobile: Saudação + Menu Button */}
                        <div className="flex items-center gap-3">
                            {/* Saudação mobile */}
                            <div className="sm:hidden text-right">
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                    Olá, {patient?.name?.split(' ')[0] || 'Paciente'}
                                </p>
                            </div>

                            {/* Desktop: User Info */}
                            <div className="hidden sm:flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">{patient?.name || 'Paciente'}</p>
                                    <p className="text-xs text-gray-500">{patient?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sair"
                                >
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Mobile: Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="sm:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="fixed top-14 right-0 bottom-0 w-72 bg-white z-50 sm:hidden shadow-xl overflow-y-auto">
                        {/* User Card */}
                        <div className="p-4 bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate">{patient?.name || 'Paciente'}</p>
                                    <p className="text-sm text-violet-100 truncate">{patient?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <nav className="p-2">
                            {allMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => router.push(item.href)}
                                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${isActive
                                            ? 'bg-violet-50 text-violet-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Logout */}
                        <div className="p-2 border-t border-gray-200 mt-2">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>Sair da conta</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
                <div className="flex gap-6">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <nav className="bg-white rounded-xl border border-gray-200 p-2 sticky top-24">
                            {allMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <button
                                        key={item.href}
                                        onClick={() => router.push(item.href)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-violet-50 text-violet-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* Main Area */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>

            {/* Bottom Navigation - Mobile (Fixed, com safe area) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20 safe-area-bottom">
                <div className="flex items-stretch justify-around px-1 py-1">
                    {bottomNavItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <button
                                key={item.href}
                                onClick={() => router.push(item.href)}
                                className={`flex flex-col items-center justify-center flex-1 py-2 rounded-lg transition-all ${isActive
                                    ? 'text-violet-600'
                                    : 'text-gray-500 active:bg-gray-100'
                                    }`}
                            >
                                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-violet-100' : ''}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                                </div>
                                <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : ''}`}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Style for safe area */}
            <style jsx global>{`
                .safe-area-bottom {
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                }
            `}</style>
        </div>
    );
}

// Wrapper com PatientAuthProvider
export default function PatientLayout({ children }: { children: React.ReactNode }) {
    return (
        <PatientAuthProvider>
            <PatientLayoutContent>{children}</PatientLayoutContent>
        </PatientAuthProvider>
    );
}
