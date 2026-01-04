'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Building2,
  Users,
  Calendar,
  UserCog,
  CreditCard,
  Package,
  Repeat,
  BarChart3,
  ClipboardList,
  CheckSquare,
  MessageSquare,
  MessageCircle,
  Zap,
  Mail,
  List,
  TrendingUp,
  Settings,
  HelpCircle,
  Wallet,
  Tag,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import SuperAdminLayout from './SuperAdminLayout';
import UnitSelector from './UnitSelector';
import './navigation.css';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<'clinica' | 'crm' | 'mkt'>('clinica');
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mostrar loading spinner enquanto verifica autenticação (hydration)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600 mx-auto"></div>
          <p className="text-gray-500 mt-4 font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não mostrar sidebar em páginas públicas (login) ou portal do paciente
  const isPublicPage = pathname === '/login' || pathname === '/' || pathname?.startsWith('/patient/');

  if (!user || isPublicPage) {
    return <div style={{ minHeight: '100vh', background: '#0f172a' }}>{children}</div>;
  }

  // Se for SUPER_ADMIN, usa layout especial
  if (user.role === 'SUPER_ADMIN') {
    return <SuperAdminLayout>{children}</SuperAdminLayout>;
  }

  // Layout especial para DENTISTA - apenas Meus Pacientes, Minha Agenda e Sair
  if (user.role === 'DENTIST') {
    return (
      <div className="shell">
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="brand">
              <span className="brand-logo" />
              <div className="brand-text">
                <div className="brand-name">Ianara Pinho</div>
                <div className="brand-sub">Odontologia</div>
              </div>
            </div>
            <div className="divider" />
          </div>

          <div className="nav-card open">
            <div className="nav-card-body">
              <Link href="/patients" className={`nav-item ${pathname?.startsWith('/patients') ? 'active' : ''}`}>
                <UserCog className="icon" />
                <span className="label">Meus Pacientes</span>
              </Link>
              <Link href="/appointments" className={`nav-item ${pathname?.startsWith('/appointments') ? 'active' : ''}`}>
                <Calendar className="icon" />
                <span className="label">Minha Agenda</span>
              </Link>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="mini-brand">
              <span className="brand-logo small" />
              <span className="mini-text">clin.ia</span>
            </div>
          </div>
        </aside>

        <main className="content">
          <header className="content-top">
            <div className="user">
              <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
              <div className="user-meta">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
              <button className="logout" onClick={logout} title="Sair">Sair</button>
            </div>
          </header>
          <div className="content-body">{children}</div>
        </main>
      </div>
    );
  }

  const Section = ({ id, title, children }: { id: 'clinica' | 'crm' | 'mkt'; title: string; children: React.ReactNode }) => {
    const isOpen = openSection === id;
    return (
      <div className={`nav-card ${isOpen ? 'open' : ''}`}>
        <button type="button" className="nav-card-title" onClick={() => setOpenSection(id)}>
          <span>{title}</span>
          <span className="caret" aria-hidden>▾</span>
        </button>
        <div className="nav-card-body">{children}</div>
      </div>
    );
  };

  const disabledLabels = [
    'Administração',
    'Gestão de Atendimentos',
    'Gestão de Pacientes',
    'Gestão Financeira',
    'Compras e Estoque',
    'Assinatura',
    'E-mail Marketing',
    'Listas',
    'Estatísticas',
    'WhatsApp'
  ];

  const Item = ({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) => {
    const isAdmin = disabledLabels.includes(label);

    if (isAdmin) {
      return (
        <div className={`nav-item ${pathname === href ? 'active' : ''}`} style={{ cursor: 'not-allowed', opacity: 0.5 }}>
          <Icon className="icon" />
          <span className="label">{label}</span>
        </div>
      );
    }

    return (
      <Link href={href} className={`nav-item ${pathname === href ? 'active' : ''}`}>
        <Icon className="icon" />
        <span className="label">{label}</span>
      </Link>
    );
  };

  const showUnitSelector = pathname?.startsWith('/funnels') || pathname?.startsWith('/analytics');

  return (
    <div className="shell">
      {/* Overlay para fechar ao clicar fora */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span className="brand-logo" />
            <div className="brand-text">
              <div className="brand-name">Ianara Pinho</div>
              <div className="brand-sub">Odontologia</div>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fechar menu"
          >
            <X size={24} color="white" />
          </button>
          <div className="divider" />
        </div>

        <Section id="clinica" title="Gestão da Clínica">
          <Item href="/dashboard" icon={Home} label="Dashboard" />
          <Item href="/admin" icon={Building2} label="Administração" />
          <Item href="/units" icon={Building2} label="Unidades" />
          <Item href="/colaboradores" icon={Users} label="Adicionar Colaborador" />
          <Item href="/appointments" icon={Calendar} label="Gestão de Atendimentos" />
          <Item href="/patients" icon={UserCog} label="Gestão de Pacientes" />
          <Item href="/finance" icon={CreditCard} label="Gestão Financeira" />
          <Item href="/inventory" icon={Package} label="Compras e Estoque" />
          <Item href="/assinatura" icon={Wallet} label="Assinatura" />
        </Section>

        <Section id="crm" title="CRM & Vendas">
          <Item href="/funnels" icon={Repeat} label="Funis" />
          <Item href="/analytics" icon={BarChart3} label="Analytics" />
          <Item href="/tags" icon={Tag} label="Tags" />
          <Item href="/my-tasks" icon={ClipboardList} label="Minhas Tarefas" />
          <Item href="/tasks" icon={CheckSquare} label="Tarefas" />
          <Item href="/whatsapp" icon={MessageSquare} label="WhatsApp" />

          <div className="nav-item-group">
            <button
              type="button"
              className={`nav-item w-full text-left justify-between ${pathname.startsWith('/whatsapp-official') ? 'active' : ''}`}
              onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="icon" />
                <span className="label">WhatsApp Oficial</span>
              </div>
              <span className={`caret text-xs transition-transform ${showWhatsAppMenu ? 'rotate-180' : ''}`} aria-hidden>▾</span>
            </button>
            {showWhatsAppMenu && (
              <div className="pl-4 mt-1 space-y-1">
                <Item href="/whatsapp-official" icon={MessageSquare} label="Painel" />
                <Item href="/whatsapp-official/settings" icon={Settings} label="Configurações" />
              </div>
            )}
          </div>

          <Item href="/automacao" icon={Zap} label="Automação" />
        </Section>

        <Section id="mkt" title="Marketing">
          <Item href="/email" icon={Mail} label="E-mail Marketing" />
          <Item href="/lists" icon={List} label="Listas" />
          <Item href="/statistics" icon={TrendingUp} label="Estatísticas" />
        </Section>

        <div className="sidebar-footer">
          <div className="mini-brand">
            <span className="brand-logo small" />
            <span className="mini-text">clin.ia</span>
          </div>
          <div className="footer-links">
            <span className="footer-link" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
              <Settings className="icon" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '4px' }} />
              Configurações
            </span>
            <span className="footer-link" style={{ cursor: 'not-allowed', opacity: 0.5 }}>
              <HelpCircle className="icon" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '4px' }} />
              Suporte
            </span>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="content-top" id="main-header">
          {/* Mobile Menu Controls (Visible only on mobile) */}
          <div className="mobile-header-controls">
            <button
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={24} className="text-gray-700" />
            </button>
            <div className="mobile-brand-mini">IP</div>
          </div>

          {showUnitSelector && (
            <div id="header-unit-selector">
              <UnitSelector />
            </div>
          )}
          <div
            className="user"
            id="header-user-section"
            style={!showUnitSelector ? { flex: 1, display: 'flex' } : { flexShrink: 0 }}
          >
            <div className="avatar" id="header-user-avatar">{user.name?.charAt(0) || 'U'}</div>
            <div className="user-meta" id="header-user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button
              className="logout"
              onClick={logout}
              title="Sair"
              id="header-logout-button"
              style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={18} />
              <span className="logout-text">Sair</span>
            </button>
          </div>
        </header>
        <div className="content-body">{children}</div>
      </main>
    </div>
  );
} 