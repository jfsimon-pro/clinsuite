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
  Wallet
} from 'lucide-react';
import SuperAdminLayout from './SuperAdminLayout';
import './navigation.css';

export default function Navigation({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const [openSection, setOpenSection] = useState<'clinica' | 'crm' | 'mkt'>('clinica');

  // Não mostrar sidebar em páginas públicas (login) ou enquanto carrega
  const isPublicPage = pathname === '/login' || pathname === '/';

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
              <Link href="/patients" className={`nav-item ${pathname === '/patients' ? 'active' : ''}`}>
                <UserCog className="icon" />
                <span className="label">Meus Pacientes</span>
              </Link>
              <Link href="/appointments" className={`nav-item ${pathname === '/appointments' ? 'active' : ''}`}>
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

  const Item = ({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) => (
    <Link href={href} className={`nav-item ${pathname === href ? 'active' : ''}`}>
      <Icon className="icon" />
      <span className="label">{label}</span>
    </Link>
  );

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

        <Section id="clinica" title="Gestão da Clínica">
          <Item href="/dashboard" icon={Home} label="Dashboard" />
          <Item href="/admin" icon={Building2} label="Administração" />
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
          <Item href="/my-tasks" icon={ClipboardList} label="Minhas Tarefas" />
          <Item href="/tasks" icon={CheckSquare} label="Tarefas" />
          <Item href="/whatsapp" icon={MessageSquare} label="WhatsApp" />
          <Item href="/whatsapp-official" icon={MessageCircle} label="Whatsapp Oficial" />
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
            <a href="/settings" className="footer-link">
              <Settings className="icon" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '4px' }} />
              Configurações
            </a>
            <a href="/help" className="footer-link">
              <HelpCircle className="icon" style={{ width: '16px', height: '16px', display: 'inline-block', marginRight: '4px' }} />
              Suporte
            </a>
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