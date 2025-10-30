'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import TaskIndicator from '@/components/TaskIndicator';
import LeadDetailPanel from '@/components/LeadDetailPanel';
import styles from './page.module.css';
import { ScrollMenu, VisibilityContext } from 'react-horizontal-scrolling-menu';
import 'react-horizontal-scrolling-menu/dist/styles.css';
import { Trash2, MoreVertical, Target, Search, Briefcase, DollarSign, Handshake, CheckCircle, Lightbulb, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const DEFAULT_FUNNEL_NAME = 'Novos Contatos';
const DEFAULT_STEP_NAME = 'Novas Entradas';

interface Funnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  _count: {
    leads: number;
  };
}

interface FunnelStep {
  id: string;
  name: string;
  order: number;
  tipoConceitual: string;
  leads?: Lead[];
}

interface Lead {
  id: string;
  phone: string;
  name?: string;
  valorVenda?: number;
  valorOrcamento?: number;
  dataConsulta?: string;
  tipoProcura?: string;
  meioCaptacao?: string;
  closerNegociacao?: string;
  closerFollow?: string;
  dentista?: string;
  motivoPerda?: string;
  dentistaParticipou?: string;
  previsaoFechamento?: string;
  objecao?: string;
  observacoes?: string;
  statusVenda?: string;
  dataFechamento?: string;
  createdAt: string;
  updatedAt: string;
  funnelId: string;
  stepId: string;
  responsibleId?: string;
  companyId: string;
}

// Componente para cada etapa do kanban
function KanbanStep({ step, funnelLeads, user, selectedFunnel, setSelectedStep, setShowLeadModal, deleteStep, getTipoConceitual, setEditingLead, setLeadData, funnels, setAvailableSteps, setShowEditLeadModal, styles }: any) {
  const stepLeads = funnelLeads.filter((lead: any) => lead.stepId === step.id);
  const tipoConceitual = getTipoConceitual(step.tipoConceitual || 'CAPTACAO');

  return (
    <div
      id={`kanban-step-${step.id}`}
      className={`rounded-lg p-4 bg-transparent`}
      style={{
        minWidth: '320px',
        width: '320px',
        flexShrink: 0,
        flexGrow: 0,
        flexBasis: '320px'
      }}
    >
      <div id={`step-header-${step.id}`} className={`flex items-center justify-between mb-3`}>
        <div id={`step-title-${step.id}`} className={`flex items-center gap-2`}>
          <h3 className={`font-semibold text-[#6F63D2]`}>{step.name}</h3>
          <span className={`text-xs text-gray-400`}>{stepLeads.length}</span>
        </div>
        <div id={`step-actions-${step.id}`} className={`flex items-center gap-2`}>
          <span className={`text-xs text-gray-400`}>#{step.order}</span>
          {user?.role === 'ADMIN' && !(selectedFunnel?.name.toLowerCase() === 'novos contatos' && step.order === 1) && (
            <button
              onClick={() => deleteStep(step.id)}
              className={`text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 ${styles.deletarfunil}`}
              title="Deletar etapa"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rótulo Conceitual */}
      <div id={`step-type-label-${step.id}`} className={`mb-3`}>
        <div
          id={`step-type-badge-${step.id}`}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium`}
          style={{
            backgroundColor: tipoConceitual.color + '15',
            color: tipoConceitual.color,
            border: `1px solid ${tipoConceitual.color}30`
          }}
          title={tipoConceitual.description}
        >
          <span>{tipoConceitual.label.split(' ')[0]}</span>
          <span className={`font-normal opacity-75`}>
            {tipoConceitual.label.split(' ').slice(1).join(' ')}
          </span>
        </div>
      </div>

      {/* Ação: Adicionar lead */}
      <div id={`add-lead-section-${step.id}`} className={`mb-3 ${styles.adicionarlead}`}>
        <button
          onClick={() => {
            setSelectedStep(step);
            setShowLeadModal(true);
          }}
          className={`px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 ${styles.adicionarleadbuttonfilho}`}
          type="button"
        >
          + Adicionar Lead
        </button>
      </div>

      {/* Lista de leads */}
      <div id={`leads-list-${step.id}`} className={`space-y-3`}>
        {stepLeads.length > 0 ? (
          stepLeads.map((lead: any) => (
            <div
              key={lead.id}
              id={`lead-card-${lead.id}`}
              className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow transition-shadow ${styles.kanbanboardsinglepai}`}
            >
              <div id={`lead-content-${lead.id}`} className={`flex justify-between items-start ${styles.kanbanboardsinglefilho}`}>
                <div id={`lead-info-${lead.id}`} className={`flex-1`}>
                  <div id={`lead-phone-${lead.id}`} className={`inline-flex items-center mb-2 ${styles.telefoneleadalinha}`}>
                    <span className={`inline-flex items-center rounded-full border border-violet-300 text-violet-700 text-[11px] px-2 py-0.5 ${styles.telefonelead}`}>
                      {lead.phone}
                    </span>
                  </div>
                  <div className={`font-medium text-gray-900 ${styles.nomelead}`}>{lead.name || 'Lead sem nome'}</div>
                  <div id={`lead-task-indicator-${lead.id}`} className={`mt-2 flex items-center gap-2`}>
                    <span className={`inline-block h-4 w-4 rounded-full bg-violet-500`} />
                    <TaskIndicator leadId={lead.id} stepId={lead.stepId} />
                  </div>
                  <div id={`lead-date-${lead.id}`} className={`mt-3 text-xs text-gray-500`}>
                    <span className={`${styles.datacalendariolead}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div id={`lead-actions-${lead.id}`} className={`flex flex-col items-end space-y-1`}>
                  <button
                    onClick={() => {
                      setEditingLead(lead);
                      setLeadData({
                        phone: lead.phone || '',
                        name: lead.name || '',
                        valorVenda: lead.valorVenda ? lead.valorVenda.toString() : '',
                        valorOrcamento: lead.valorOrcamento ? lead.valorOrcamento.toString() : '',
                        dataConsulta: lead.dataConsulta || '',
                        tipoProcura: lead.tipoProcura || '',
                        meioCaptacao: lead.meioCaptacao || '',
                        closerNegociacao: lead.closerNegociacao || '',
                        closerFollow: lead.closerFollow || '',
                        dentista: lead.dentista || '',
                        dentistaId: lead.dentistaId || '',
                        motivoPerda: lead.motivoPerda || '',
                        dentistaParticipou: lead.dentistaParticipou || '',
                        previsaoFechamento: lead.previsaoFechamento || '',
                        objecao: lead.objecao || '',
                        observacoes: lead.observacoes || '',
                        responsibleId: lead.responsibleId || '',
                        funnelId: lead.funnelId || '',
                        stepId: lead.stepId || '',
                        statusVenda: lead.statusVenda || '',
                        dataFechamento: lead.dataFechamento || ''
                      });
                      const currentFunnel = funnels.find((f: any) => f.id === lead.funnelId);
                      setAvailableSteps(currentFunnel?.steps || []);
                      setShowEditLeadModal(true);
                    }}
                    className={`text-xs text-violet-700 hover:text-violet-800 px-2 py-1 bg-violet-50 rounded border border-violet-200 hover:bg-violet-100 transition-colors ${styles.editarlead}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div id={`no-leads-message-${step.id}`} className={`text-center py-8`}>
            <div className={`text-sm text-gray-500`}>Sem leads</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FunnelsPage() {
  const { user } = useAuth();
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [funnelLeads, setFunnelLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [newFunnelName, setNewFunnelName] = useState('');
  const [newStepName, setNewStepName] = useState('');
  const [newStepTipoConceitual, setNewStepTipoConceitual] = useState('CAPTACAO');
  const [showFunnelDropdown, setShowFunnelDropdown] = useState(false);
  
  // Estados para leads
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showEditLeadModal, setShowEditLeadModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<FunnelStep | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [leadData, setLeadData] = useState({
    phone: '',
    name: '',
    valorVenda: '',
    valorOrcamento: '',
    dataConsulta: '',
    tipoProcura: '',
    duracaoConsulta: '60',
    meioCaptacao: '',
    closerNegociacao: '',
    closerFollow: '',
    dentista: '',
    dentistaId: '',
    motivoPerda: '',
    dentistaParticipou: '',
    previsaoFechamento: '',
    objecao: '',
    observacoes: '',
    responsibleId: '',
    funnelId: '',
    stepId: '',
    statusVenda: '',
    dataFechamento: ''
  });
  const [availableSteps, setAvailableSteps] = useState<FunnelStep[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchFunnels();
    fetchColaboradores();
  }, []);

  // Função para fazer scroll horizontal
  const scrollKanban = (direction: 'left' | 'right') => {
    const container = document.getElementById('kanban-board-container');
    if (!container) return;

    const scrollAmount = 300; // pixels para rolar
    const newPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  // Verificar se pode rolar para cada direção
  const checkScrollButtons = () => {
    const container = document.getElementById('kanban-board-container');
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < (container.scrollWidth - container.clientWidth - 10)
    );
  };


  // Listener de scroll para atualizar botões
  useEffect(() => {
    const container = document.getElementById('kanban-board-container');
    if (!container) return;

    checkScrollButtons();
    container.addEventListener('scroll', checkScrollButtons);

    return () => container.removeEventListener('scroll', checkScrollButtons);
  }, [selectedFunnel]);

  useEffect(() => {
    if (selectedFunnel) {
      fetchLeadsForFunnel(selectedFunnel.id);
    }
  }, [selectedFunnel]);

  useEffect(() => {
    console.log('Selected funnel changed:', selectedFunnel?.name, selectedFunnel?.id);
  }, [selectedFunnel]);

  // Opções para dropdowns
  const tipoProcuraOptions = [
    'ORTODONTIA', 'IMPLANTE', 'ESTETICA', 'LIMPEZA', 'CANAL', 
    'EXTRACAO', 'PROTESE', 'CLAREAMENTO', 'OUTROS'
  ];
  
  const meioCaptacaoOptions = [
    'WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_ADS', 'INDICACAO',
    'SITE', 'TELEFONE', 'PRESENCIAL', 'OUTROS'
  ];

  // Função para obter dentistas reais da empresa
  const getDentistas = () => {
    return colaboradores.filter(colab => colab.role === 'DENTIST');
  };
  
  const motivoPerdaOptions = [
    'PRECO', 'TEMPO', 'LOCALIZACAO', 'CONFIANCA', 'CONCORRENCIA',
    'NAO_INTERESSADO', 'NAO_RESPONDEU', 'OUTROS'
  ];

  const objecaoOptions = [
    'PRECO_ALTO', 'TEMPO_TRATAMENTO', 'DOR_MEDO', 'SEGUNDA_OPINIAO',
    'PENSANDO', 'CONVERSAR_FAMILIA', 'CONDICOES_PAGAMENTO', 'OUTROS'
  ];

  const statusVendaOptions = [
    { value: 'QUALIFICANDO', label: 'Qualificando' },
    { value: 'INTERESSE_DEMONSTRADO', label: 'Interesse Demonstrado' },
    { value: 'CONSULTA_AGENDADA', label: 'Consulta Agendada' },
    { value: 'CONSULTA_REALIZADA', label: 'Consulta Realizada' },
    { value: 'ORCAMENTO_ENVIADO', label: 'Orçamento Enviado' },
    { value: 'NEGOCIACAO', label: 'Negociação' },
    { value: 'GANHO', label: 'Ganho' },
    { value: 'PERDIDO', label: 'Perdido' },
    { value: 'PAUSADO', label: 'Pausado' }
  ];

  // Opções de tipos conceituais para etapas
  const tiposConceituais = [
    { value: 'CAPTACAO', label: 'Captação', description: 'Geração inicial de leads', color: '#3B82F6', icon: Target },
    { value: 'QUALIFICACAO', label: 'Qualificação', description: 'Validação de interesse', color: '#10B981', icon: Search },
    { value: 'APRESENTACAO', label: 'Apresentação', description: 'Consultas e avaliações', color: '#F59E0B', icon: Briefcase },
    { value: 'PROPOSTA', label: 'Proposta', description: 'Orçamentos e planos', color: '#F97316', icon: DollarSign },
    { value: 'NEGOCIACAO', label: 'Negociação', description: 'Discussão de valores', color: '#EF4444', icon: Handshake },
    { value: 'FECHAMENTO', label: 'Fechamento', description: 'Decisão final', color: '#22C55E', icon: CheckCircle }
  ];

  // Função para obter dados do tipo conceitual
  const getTipoConceitual = (tipoConceitual: string) => {
    return tiposConceituais.find(tipo => tipo.value === tipoConceitual) || tiposConceituais[0];
  };

  // Funções para filtrar colaboradores por especialização
  const getClosersNegociacao = () => {
    return colaboradores.filter(colab => colab.specialty === 'CLOSER_NEGOCIACAO');
  };

  const getClosersFollow = () => {
    return colaboradores.filter(colab => colab.specialty === 'CLOSER_FOLLOW');
  };

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Só fechar se não clicar no dropdown ou seus filhos
      if (showFunnelDropdown && !target.closest('[data-dropdown]')) {
        setShowFunnelDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFunnelDropdown]);

  const fetchFunnels = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/funnels`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setFunnels(data);
        // Sempre selecionar o primeiro funil se não houver nenhum selecionado
        if (data.length > 0 && !selectedFunnel) {
          console.log('Selecionando automaticamente o primeiro funil:', data[0].name);
          setSelectedFunnel(data[0]);
        }
        return data; // Retornar os dados para uso posterior
      }
    } catch (error) {
      console.error('Erro ao buscar funis:', error);
    } finally {
      setIsLoading(false);
    }
    return []; // Retornar array vazio em caso de erro
  };

  const fetchColaboradores = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setColaboradores(data);
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error);
    }
  };

  const fetchLeadsForFunnel = async (funnelId: string) => {
    try {
      console.log('🔍 Buscando leads para funil:', funnelId);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads?funnelId=${funnelId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const leads = await response.json();
        console.log('✅ Leads encontrados:', leads.length, 'leads para funil', funnelId);
        console.log('📋 Leads detalhados:', leads);
        setFunnelLeads(leads);
      } else {
        console.error('❌ Erro na resposta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar leads:', error);
    }
  };

  const createFunnel = async () => {
    if (!newFunnelName.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/funnels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: newFunnelName }),
      });

      if (response.ok) {
        const newFunnel = await response.json();
        setFunnels([newFunnel, ...funnels]);
        setSelectedFunnel(newFunnel);
        setNewFunnelName('');
        setShowCreateModal(false);
        console.log('Funil criado no banco:', newFunnel);
      } else {
        console.error('Erro ao criar funil:', response.statusText);
        alert('Erro ao criar funil. Verifique sua conexão.');
      }
    } catch (error) {
      console.error('Erro ao criar funil:', error);
      alert('Erro ao criar funil. Verifique sua conexão.');
    }
  };

  const deleteFunnel = async (funnelId: string) => {
    if (!confirm('Tem certeza que deseja deletar este funil? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/funnels/${funnelId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Remover funil da lista
        const updatedFunnels = funnels.filter(f => f.id !== funnelId);
        setFunnels(updatedFunnels);
        
        // Se o funil deletado era o selecionado, selecionar outro ou limpar
        if (selectedFunnel?.id === funnelId) {
          setSelectedFunnel(updatedFunnels.length > 0 ? updatedFunnels[0] : null);
        }
        
        console.log('Funil deletado com sucesso');
      } else {
        const error = await response.text();
        alert(`Erro ao deletar funil: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar funil:', error);
      alert('Erro ao deletar funil. Verifique sua conexão.');
    }
  };

  const deleteStep = async (stepId: string) => {
    if (!selectedFunnel) return;

    // Contar quantos leads existem nesta etapa
    const stepLeads = funnelLeads.filter(lead => lead.stepId === stepId);
    const leadCount = stepLeads.length;

    // Encontrar o nome da etapa
    const step = selectedFunnel.steps.find(s => s.id === stepId);
    const stepName = step?.name || 'esta etapa';

    // Mensagem de confirmação mais detalhada
    let confirmMessage = `Tem certeza que deseja deletar a etapa "${stepName}"?`;

    if (leadCount > 0) {
      confirmMessage += `\n\n⚠️ ATENÇÃO: Esta ação irá deletar permanentemente ${leadCount} lead(s) que estão nesta etapa!`;
      confirmMessage += '\n\nEsta ação NÃO PODE ser desfeita.';
    } else {
      confirmMessage += '\n\nEsta ação não pode ser desfeita.';
    }

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/steps/${stepId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const result = await response.json();

        // Buscar o funil atualizado
        const updatedFunnelResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/funnels/${selectedFunnel.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (updatedFunnelResponse.ok) {
          const updatedFunnel = await updatedFunnelResponse.json();
          setFunnels(funnels.map(f => f.id === selectedFunnel.id ? updatedFunnel : f));
          setSelectedFunnel(updatedFunnel);

          // Recarregar os leads do funil
          fetchLeadsForFunnel(selectedFunnel.id);

          // Mostrar mensagem de sucesso com informações sobre leads deletados
          if (result.deletedLeadsCount > 0) {
            alert(`Etapa deletada com sucesso!\n${result.deletedLeadsCount} lead(s) foram removidos junto com a etapa.`);
          } else {
            alert('Etapa deletada com sucesso!');
          }

          console.log('Etapa deletada com sucesso. Leads removidos:', result.deletedLeadsCount);
        }
      } else {
        const error = await response.text();
        alert(`Erro ao deletar etapa: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao deletar etapa:', error);
      alert('Erro ao deletar etapa. Verifique sua conexão.');
    }
  };

  const createLead = async () => {
    if (!selectedStep || !leadData.phone.trim()) {
      alert('Telefone é obrigatório!');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          phone: leadData.phone,
          name: leadData.name || null,
          funnelId: selectedFunnel?.id,
          stepId: selectedStep.id,
          responsibleId: leadData.responsibleId || null,
          dentistaId: leadData.dentistaId || null,
          valorVenda: leadData.valorVenda ? parseFloat(leadData.valorVenda) : null,
          dataConsulta: leadData.dataConsulta || null,
          duracaoConsulta: leadData.duracaoConsulta ? parseInt(leadData.duracaoConsulta) : null,
          tipoProcura: leadData.tipoProcura || null,
          meioCaptacao: leadData.meioCaptacao || null,
          closerNegociacao: leadData.closerNegociacao || null,
          closerFollow: leadData.closerFollow || null,
          motivoPerda: leadData.motivoPerda || null,
          dentistaParticipou: leadData.dentistaParticipou || null,
          previsaoFechamento: leadData.previsaoFechamento || null,
          objecao: leadData.objecao || null,
          observacoes: leadData.observacoes || null,
        }),
      });

      if (response.ok) {
        const newLead = await response.json();
        console.log('Lead criado:', newLead);
        
        // Resetar formulário
        resetLeadForm();
        setShowLeadModal(false);
        setSelectedStep(null);
        
        // Recarregar apenas os leads do funil atual
        if (selectedFunnel) {
          fetchLeadsForFunnel(selectedFunnel.id);
        }
        
        alert('Lead criado com sucesso!');
      } else {
        const error = await response.text();
        alert(`Erro ao criar lead: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      alert('Erro ao criar lead. Verifique sua conexão.');
    }
  };

  const updateLead = async () => {
    if (!editingLead || !leadData.phone.trim()) {
      alert('Telefone é obrigatório!');
      return;
    }

    if (!leadData.funnelId || !leadData.stepId) {
      alert('Funil e Etapa são obrigatórios!');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${editingLead.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          phone: leadData.phone,
          name: leadData.name || null,
          funnelId: leadData.funnelId || null,
          stepId: leadData.stepId || null,
          responsibleId: leadData.responsibleId || null,
          dentistaId: leadData.dentistaId || null,
          valorVenda: leadData.valorVenda ? parseFloat(leadData.valorVenda) : null,
          valorOrcamento: leadData.valorOrcamento ? parseFloat(leadData.valorOrcamento) : null,
          dataConsulta: leadData.dataConsulta || null,
          duracaoConsulta: leadData.duracaoConsulta ? parseInt(leadData.duracaoConsulta) : null,
          tipoProcura: leadData.tipoProcura || null,
          meioCaptacao: leadData.meioCaptacao || null,
          closerNegociacao: leadData.closerNegociacao || null,
          closerFollow: leadData.closerFollow || null,
          motivoPerda: leadData.motivoPerda || null,
          dentistaParticipou: leadData.dentistaParticipou || null,
          previsaoFechamento: leadData.previsaoFechamento || null,
          objecao: leadData.objecao || null,
          observacoes: leadData.observacoes || null,
          statusVenda: leadData.statusVenda ? leadData.statusVenda : null,
          dataFechamento: leadData.dataFechamento ? leadData.dataFechamento : null,
        }),
      });

      if (response.ok) {
        const updatedLead = await response.json();
        console.log('Lead atualizado:', updatedLead);
        
        // Resetar formulário e estados
        resetLeadForm();
        setShowEditLeadModal(false);
        setEditingLead(null);
        
        // SEMPRE recarregar a lista de funis para atualizar contadores
        const updatedFunnels = await fetchFunnels();
        
        // Determinar quais funis precisam ter seus leads recarregados
        const funnelsToReload = new Set<string>();
        
        // Sempre recarregar o funil atual (se existir)
        if (selectedFunnel) {
          funnelsToReload.add(selectedFunnel.id);
        }
        
        // Se mudou de funil, recarregar o funil de destino também
        if (leadData.funnelId !== editingLead.funnelId && leadData.funnelId) {
          funnelsToReload.add(leadData.funnelId);
        }
        
        // Recarregar leads de todos os funis afetados
        for (const funnelId of funnelsToReload) {
          fetchLeadsForFunnel(funnelId);
        }
        
        console.log(`Lead movido de ${editingLead.funnelId} para ${leadData.funnelId}`);
        
        alert('Lead realocado com sucesso!');
      } else {
        const error = await response.text();
        alert(`Erro ao atualizar lead: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      alert('Erro ao atualizar lead. Verifique sua conexão.');
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${leadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Fechar modal de edição
        setShowEditLeadModal(false);
        setEditingLead(null);

        // Recarregar leads do funil atual
        if (selectedFunnel) {
          fetchLeadsForFunnel(selectedFunnel.id);
        }

        alert('Lead excluído com sucesso!');
      } else {
        const error = await response.text();
        alert(`Erro ao excluir lead: ${error}`);
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error);
      alert('Erro ao excluir lead. Verifique sua conexão.');
    }
  };

  const resetLeadForm = () => {
    setLeadData({
      phone: '',
      name: '',
      valorVenda: '',
      valorOrcamento: '',
      dataConsulta: '',
      tipoProcura: '',
      meioCaptacao: '',
      closerNegociacao: '',
      closerFollow: '',
      dentista: '',
      motivoPerda: '',
      dentistaParticipou: '',
      previsaoFechamento: '',
      objecao: '',
      observacoes: '',
      responsibleId: '',
      funnelId: '',
      stepId: '',
      statusVenda: '',
      dataFechamento: ''
    });
    setAvailableSteps([]);
  };

  const handleFunnelChange = (funnelId: string) => {
    const selectedFunnelData = funnels.find(f => f.id === funnelId);
    setAvailableSteps(selectedFunnelData?.steps || []);
    setLeadData({
      ...leadData,
      funnelId: funnelId,
      stepId: '' // Reset step quando muda o funil
    });
  };

  const createStep = async () => {
    if (!selectedFunnel || !newStepName.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/funnels/${selectedFunnel.id}/steps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: newStepName,
          order: selectedFunnel.steps.length + 1,
          tipoConceitual: newStepTipoConceitual
        }),
      });

      if (response.ok) {
        const updatedFunnel = await response.json();
        setFunnels(funnels.map(f => f.id === selectedFunnel.id ? updatedFunnel : f));
        setSelectedFunnel(updatedFunnel);
        setNewStepName('');
        setNewStepTipoConceitual('CAPTACAO');
        setShowStepModal(false);
        console.log('Etapa criada no banco:', updatedFunnel);
      } else {
        console.error('Erro ao criar etapa:', response.statusText);
        alert('Erro ao criar etapa. Verifique sua conexão.');
      }
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
      alert('Erro ao criar etapa. Verifique sua conexão.');
    }
  };

  if (isLoading) {
    return (
      <div id="loading-container" className={`flex items-center justify-center min-h-screen`}>
        <div id="loading-spinner" className={`animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600`}></div>
      </div>
    );
  }

  return (
    <div id="funnels-main-container" className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900`}>
      {/* Header */}
      <div id="funnels-header" className={`bg-white border-b-2 border-gray-100 p-6 ${styles.linhasuperiorfunil}`}>
        <div id="header-content" className={`flex items-center justify-between`}>
          <div id="header-title-section" className={`flex items-center ${styles.alinhatitulo}`}>
            <h1 className={`text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent`}>Funis de Vendas</h1>
            {/* Dropdown de Seleção de Funil */}
            {funnels.length > 0 && (
              <div id="funnel-dropdown-container" className={`relative`} data-dropdown>
                <button
                  onClick={() => setShowFunnelDropdown(!showFunnelDropdown)}
                  className={`bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-md text-sm flex items-center gap-2 min-w-[220px] justify-between shadow-sm ${styles.dropperson}`}
                  type="button"
                >
                  <span className={`truncate text-gray-700`}>
                    {selectedFunnel ? selectedFunnel.name : 'Selecionar funil'}
                  </span>
                  <span className={`transform transition-transform text-gray-500 ${showFunnelDropdown ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {showFunnelDropdown && (
                  <div id="funnel-dropdown-menu" className={`absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto ${styles.dropfunil}`}>
                    {funnels.map((funnel) => (
                      <div
                        key={funnel.id}
                        id={`funnel-dropdown-item-${funnel.id}`}
                        className={`flex items-center justify-between px-3 py-2 text-sm first:rounded-t-md last:rounded-b-md ${
                          selectedFunnel?.id === funnel.id ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedFunnel(funnel);
                            setShowFunnelDropdown(false);
                          }}
                          className={`flex-1 text-left truncate ${styles.nomesfunisdropdown}`}
                          type="button"
                        >
                          {funnel.name}
                        </button>
                        <div id={`funnel-info-${funnel.id}`} className={`flex items-center gap-2 pl-2 ${styles.etapasfunil}`}>
                          <span className={`text-xs text-gray-400`}>{funnel.steps.length} etapas</span>
                          {user?.role === 'ADMIN' && funnel.name.toLowerCase() !== DEFAULT_FUNNEL_NAME.toLowerCase() && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteFunnel(funnel.id);
                              }}
                              className={`text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 ${styles.deletarfunil}`}
                              title="Deletar funil"
                              type="button"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className={`bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm ${styles['btn-primaryperson']}`}
              type="button"
            >
              + Novo Funil
            </button>
            {selectedFunnel && (
            <button
              onClick={() => setShowStepModal(true)}
              className={`bg-violet-600 hover:bg-violet-700 px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm ${styles['btn-primaryperson']}`}
              type="button"
            >
              Nova Etapa
            </button>
          )}
          </div>
          
        </div>
      </div>

      <div id="main-content-wrapper" className={`flex`}>
        {/* Main Content - Detalhes do Funil */}
        <div id="funnel-details-container" className={`flex-1 p-8`} style={{minWidth: 0, maxWidth: '100%'}}>
          {selectedFunnel ? (
            <div id="selected-funnel-content">
              <div id="funnel-title-section" className={`flex items-center justify-between mb-8 ${styles.titulofunilespaco}`}>
                <h2 className={`text-xl font-semibold tracking-tight text-gray-800`}>{selectedFunnel.name}</h2>
                
              </div>

              {/* Kanban Board com Botões Flutuantes */}
              <div style={{ position: 'relative' }}>
                {/* Botão Esquerdo Flutuante */}
                {canScrollLeft && (
                  <button
                    onClick={() => scrollKanban('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all hover:scale-110"
                    style={{ marginLeft: '1rem' }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Botão Direito Flutuante */}
                {canScrollRight && (
                  <button
                    onClick={() => scrollKanban('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 backdrop-blur-sm p-3 rounded-full shadow-xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all hover:scale-110"
                    style={{ marginRight: '1rem' }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

              <div
                id="kanban-board-container"
                className={styles.kanbanScroll}
                style={{
                minHeight: '60vh',
                width: '100vw',
                marginLeft: '-2rem',
                marginRight: '-2rem',
                paddingLeft: '2rem',
                paddingRight: '2rem',
                paddingTop: '20px',
                paddingBottom: '20px',
                overflowX: 'scroll',
                overflowY: 'visible',
                background: 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  paddingBottom: '8px',
                  paddingRight: '2rem',
                  width: '7000px'
                }}>
                {selectedFunnel.steps.map((step, index) => {
                  // Calcular largura dinâmica baseada no número de etapas
                  const numSteps = selectedFunnel.steps.length;
                  let columnWidth: number;

                  if (numSteps <= 3) {
                    // Poucas etapas: colunas mais largas
                    columnWidth = 380;
                  } else if (numSteps <= 5) {
                    // Número médio: largura padrão
                    columnWidth = 320;
                  } else if (numSteps <= 8) {
                    // Várias etapas: colunas mais compactas
                    columnWidth = 280;
                  } else {
                    // Muitas etapas: colunas bem compactas
                    columnWidth = 260;
                  }

                  return (
                  <div
                    key={step.id}
                    id={`kanban-step-${step.id}`}
                    className={`rounded-2xl p-4 bg-white`}
                    style={{
                      minWidth: `${columnWidth}px`,
                      width: `${columnWidth}px`,
                      flexShrink: 0,
                      flexGrow: 0,
                      flexBasis: `${columnWidth}px`,
                      border: '2px solid #F3F4F6',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                    }}
                  >
                    {(() => {
                      const stepLeads = funnelLeads.filter(lead => lead.stepId === step.id);
                      const tipoConceitual = getTipoConceitual(step.tipoConceitual || 'CAPTACAO');
                      return (
                        <>
                          <div id={`step-header-${step.id}`} className={`flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100`}>
                            <div id={`step-title-${step.id}`} className={`flex items-center gap-3`}>
                              <h3 className={`font-bold text-gray-800 text-base`}>{step.name}</h3>
                              <span className={`inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-full shadow-sm`}>
                                {stepLeads.length}
                              </span>
                            </div>
                            <div id={`step-actions-${step.id}`} className={`flex items-center gap-2`}>
                              <span className={`text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md`}>#{step.order}</span>
                              {user?.role === 'ADMIN' && !(selectedFunnel?.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase() && step.order === 1) && (
                                <button
                                  onClick={() => deleteStep(step.id)}
                                  className={`text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 ${styles.deletarfunil}`}
                                  title="Deletar etapa"
                                  type="button"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* Rótulo Conceitual */}
                          <div id={`step-type-label-${step.id}`} className={`mb-4`}>
                            <div
                              id={`step-type-badge-${step.id}`}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm`}
                              style={{
                                backgroundColor: tipoConceitual.color + '18',
                                color: tipoConceitual.color,
                                border: `2px solid ${tipoConceitual.color}40`
                              }}
                              title={tipoConceitual.description}
                            >
                              {tipoConceitual.icon && React.createElement(tipoConceitual.icon, { className: 'w-3.5 h-3.5' })}
                              <span className="font-semibold">{tipoConceitual.label}</span>
                            </div>
                          </div>
                          {/* Ação: Adicionar lead (chip) */}
                          <div id={`add-lead-section-${step.id}`} className={`mb-3 ${styles.adicionarlead}`}>
                            <button
                              onClick={() => {
                                setSelectedStep(step);
                                setShowLeadModal(true);
                              }}
                              className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${styles.adicionarleadbuttonfilho}`}
                              type="button"
                            >
                              <Plus className="w-4 h-4" />
                              Adicionar Lead
                            </button>
                          </div>
                          {/* Lista de leads */}
                          <div id={`leads-list-${step.id}`} className={`space-y-3`}>
                            {stepLeads.length > 0 ? (
                              stepLeads.map((lead) => (
                                <div
                                  key={lead.id}
                                  id={`lead-card-${lead.id}`}
                                  className={`bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow transition-shadow ${styles.kanbanboardsinglepai}`}
                                >
                                  <div id={`lead-content-${lead.id}`} className={`flex justify-between items-start ${styles.kanbanboardsinglefilho}`}>
                                    <div id={`lead-info-${lead.id}`} className={`flex-1`}>
                                      <div className={`inline-flex items-center mb-2 ${styles.telefoneleadalinha}`}>
                                        <span className={`inline-flex items-center rounded-full border border-violet-300 text-violet-700 text-[11px] px-2 py-0.5 ${styles.telefonelead}`}>
                                          {lead.phone}
                                        </span>
                                      </div>
                                      <div className={`font-medium text-gray-900 ${styles.nomelead}`}>{lead.name || 'Lead sem nome'}</div>
                                      <div className={`mt-2 flex items-center gap-2`}>
                                        <span className={`inline-block h-4 w-4 rounded-full bg-violet-500`} />
                                        <TaskIndicator leadId={lead.id} stepId={lead.stepId} />
                                      </div>
                                      <div className={`mt-3 text-xs text-gray-500 flex items-center gap-1`}>
                                        
                                        <span className={`${styles.datacalendariolead}`}>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                    </div>
                                    <div className={`flex flex-col items-end space-y-1`}>
                                      <button
                                        onClick={() => {
                                          setEditingLead(lead);
                                          setLeadData({
                                            phone: lead.phone || '',
                                            name: lead.name || '',
                                            valorVenda: lead.valorVenda ? lead.valorVenda.toString() : '',
                                            valorOrcamento: lead.valorOrcamento ? lead.valorOrcamento.toString() : '',
                                            dataConsulta: lead.dataConsulta || '',
                                            tipoProcura: lead.tipoProcura || '',
                                            meioCaptacao: lead.meioCaptacao || '',
                                            closerNegociacao: lead.closerNegociacao || '',
                                            closerFollow: lead.closerFollow || '',
                                            dentista: lead.dentista || '',
                                            motivoPerda: lead.motivoPerda || '',
                                            dentistaParticipou: lead.dentistaParticipou || '',
                                            previsaoFechamento: lead.previsaoFechamento || '',
                                            objecao: lead.objecao || '',
                                            observacoes: lead.observacoes || '',
                                            responsibleId: lead.responsibleId || '',
                                            funnelId: lead.funnelId || '',
                                            stepId: lead.stepId || '',
                                            statusVenda: lead.statusVenda || '',
                                            dataFechamento: lead.dataFechamento || ''
                                          });
                                          const currentFunnel = funnels.find(f => f.id === lead.funnelId);
                                          setAvailableSteps(currentFunnel?.steps || []);
                                          setShowEditLeadModal(true);
                                        }}
                                        className={`text-xs text-violet-700 hover:text-violet-800 px-2 py-1 bg-violet-50 rounded border border-violet-200 hover:bg-violet-100 transition-colors ${styles.editarlead}`}
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className={`text-center py-12 px-4`}>
                                <div className={`text-gray-400 mb-2`}>
                                  <Briefcase className="w-10 h-10 mx-auto opacity-30" />
                                </div>
                                <div className={`text-sm text-gray-400 font-medium`}>Nenhum lead nesta etapa</div>
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  );
                })}
                </div>
              </div>
              </div>
            </div>
          ) : (
            <div id="no-funnel-selected" className={`text-center py-12`}>
              <h3 className={`text-xl font-semibold mb-2`}>Nenhum funil selecionado</h3>
              <p className={`text-gray-500`}>Selecione um funil da lista ou crie um novo</p>
            </div>
          )}
        </div>
      </div>



      {/* Modal Criar Funil - VERSÃO SIMPLES */}
      {showCreateModal ? (
        <div
          id="create-funnel-modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999
          }}
          onClick={() => {
            console.log('Clicou no overlay - fechando modal');
            setShowCreateModal(false);
            setNewFunnelName('');
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'black', fontSize: '20px', marginBottom: '16px' }}>
              Criar Novo Funil
            </h3>
            <input
              type="text"
              placeholder="Nome do funil"
              value={newFunnelName}
              onChange={(e) => setNewFunnelName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                color: 'black'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  console.log('Criando funil:', newFunnelName);
                  createFunnel();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={!newFunnelName.trim()}
              >
                Criar
              </button>
              <button
                onClick={() => {
                  console.log('Cancelando criação');
                  setShowCreateModal(false);
                  setNewFunnelName('');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Criar Etapa - VERSÃO SIMPLES */}
      {showStepModal && selectedFunnel ? (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999
          }}
          onClick={() => {
            console.log('Clicou no overlay - fechando modal de etapa');
            setShowStepModal(false);
            setNewStepName('');
            setNewStepTipoConceitual('CAPTACAO');
          }}
        >
          <div 
            style={{
              backgroundColor: 'white',
              padding: '24px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: 'black', fontSize: '20px', marginBottom: '8px' }}>
              Adicionar Etapa ao Funil
            </h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '14px' }}>
              Funil: {selectedFunnel.name}
            </p>
            <input
              type="text"
              placeholder="Nome da etapa"
              value={newStepName}
              onChange={(e) => setNewStepName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                color: 'black',
                marginBottom: '16px'
              }}
              autoFocus
            />
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: 'black', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
                Tipo Conceitual (para relatórios)
              </label>
              <select
                value={newStepTipoConceitual}
                onChange={(e) => setNewStepTipoConceitual(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: 'black',
                  backgroundColor: 'white'
                }}
              >
                {tiposConceituais.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label} - {tipo.description}
                  </option>
                ))}
              </select>
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Lightbulb className="w-4 h-4" style={{ flexShrink: 0 }} />
                O tipo conceitual permite relatórios universais mesmo com nomes personalizados de etapas
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button
                onClick={() => {
                  console.log('Criando etapa:', newStepName);
                  createStep();
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                disabled={!newStepName.trim()}
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  console.log('Cancelando criação de etapa');
                  setShowStepModal(false);
                  setNewStepName('');
                  setNewStepTipoConceitual('CAPTACAO');
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Modal Criar Lead */}
      {showLeadModal ? (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999
          }}
          onClick={() => {
            setShowLeadModal(false);
            setSelectedStep(null);
            setLeadData({
              phone: '',
              name: '',
              valorVenda: '',
              dataConsulta: '',
              tipoProcura: '',
              meioCaptacao: '',
              closerNegociacao: '',
              closerFollow: '',
              dentista: '',
              motivoPerda: '',
              dentistaParticipou: '',
              previsaoFechamento: '',
              objecao: '',
              observacoes: '',
              responsibleId: '',
              funnelId: '',
              stepId: ''
            });
          }}
        >
          <div 
            style={{
              backgroundColor: '#1f2937',
              padding: '24px',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: 'white'
            }}>
              Novo Lead - {selectedStep?.name}
            </h3>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              {/* Telefone - OBRIGATÓRIO */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white', fontWeight: 'bold' }}>
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                  required
                />
              </div>

              {/* Nome */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Nome
                </label>
                <input
                  type="text"
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  placeholder="Nome do lead"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                />
              </div>

              {/* Valor da Venda */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Valor da Venda (R$)
                </label>
                <input
                  type="number"
                  value={leadData.valorVenda}
                  onChange={(e) => setLeadData({ ...leadData, valorVenda: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                />
              </div>

              {/* Data da Consulta */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Data e Hora da Consulta
                </label>
                <input
                  type="datetime-local"
                  value={leadData.dataConsulta}
                  onChange={(e) => setLeadData({ ...leadData, dataConsulta: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                />
              </div>

              {/* Tipo de Procura */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Tipo de Procura
                </label>
                <select
                  value={leadData.tipoProcura}
                  onChange={(e) => setLeadData({ ...leadData, tipoProcura: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {tipoProcuraOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Meio de Captação */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Meio de Captação
                </label>
                <select
                  value={leadData.meioCaptacao}
                  onChange={(e) => setLeadData({ ...leadData, meioCaptacao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {meioCaptacaoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Closer Negociação */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Closer de Negociação
                </label>
                <select
                  value={leadData.closerNegociacao}
                  onChange={(e) => setLeadData({ ...leadData, closerNegociacao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {getClosersNegociacao().map(colab => (
                    <option key={colab.id} value={colab.name}>{colab.name}</option>
                  ))}
                </select>
              </div>

              {/* Closer Follow */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Closer de Follow
                </label>
                <select
                  value={leadData.closerFollow}
                  onChange={(e) => setLeadData({ ...leadData, closerFollow: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {getClosersFollow().map(colab => (
                    <option key={colab.id} value={colab.name}>{colab.name}</option>
                  ))}
                </select>
              </div>

              {/* Dentista */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Dentista
                </label>
                <select
                  value={leadData.dentistaId}
                  onChange={(e) => setLeadData({ ...leadData, dentistaId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {getDentistas().map(dentista => (
                    <option key={dentista.id} value={dentista.id}>{dentista.name}</option>
                  ))}
                </select>
              </div>

              {/* Motivo da Perda */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Motivo da Perda
                </label>
                <select
                  value={leadData.motivoPerda}
                  onChange={(e) => setLeadData({ ...leadData, motivoPerda: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {motivoPerdaOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Dentista Participou */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Dentista Participou
                </label>
                <select
                  value={leadData.dentistaParticipou}
                  onChange={(e) => setLeadData({ ...leadData, dentistaParticipou: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  <option value="SIM">SIM</option>
                  <option value="NAO">NÃO</option>
                </select>
              </div>

              {/* Previsão de Fechamento */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Previsão de Fechamento
                </label>
                <input
                  type="date"
                  value={leadData.previsaoFechamento}
                  onChange={(e) => setLeadData({ ...leadData, previsaoFechamento: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                />
              </div>

              {/* Objeção */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                  Objeção
                </label>
                <select
                  value={leadData.objecao}
                  onChange={(e) => setLeadData({ ...leadData, objecao: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#374151',
                    border: '1px solid #6b7280',
                    borderRadius: '4px',
                    color: 'white'
                  }}
                >
                  <option value="">Selecione...</option>
                  {objecaoOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Observações - Campo grande */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'white' }}>
                Observações
              </label>
              <textarea
                value={leadData.observacoes}
                onChange={(e) => setLeadData({ ...leadData, observacoes: e.target.value })}
                placeholder="Observações sobre o lead..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#374151',
                  border: '1px solid #6b7280',
                  borderRadius: '4px',
                  color: 'white',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Botões */}
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px' 
            }}>
              <button
                onClick={createLead}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Criar Lead
              </button>
              <button
                onClick={() => {
                  setShowLeadModal(false);
                  setSelectedStep(null);
                  setLeadData({
                    phone: '',
                    name: '',
                    valorVenda: '',
                    dataConsulta: '',
                    tipoProcura: '',
                    meioCaptacao: '',
                    closerNegociacao: '',
                    closerFollow: '',
                    dentista: '',
                    motivoPerda: '',
                    dentistaParticipou: '',
                    previsaoFechamento: '',
                    objecao: '',
                    observacoes: '',
                    responsibleId: '',
                    funnelId: '',
                    stepId: ''
                  });
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Lead Detail Panel - Master-Detail Layout */}
      <LeadDetailPanel
        lead={editingLead}
        isOpen={showEditLeadModal}
        onClose={() => {
          setShowEditLeadModal(false);
          setEditingLead(null);
          resetLeadForm();
        }}
        onSave={async (formData) => {
          if (!editingLead) return;

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${editingLead.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              phone: formData.phone,
              name: formData.name || null,
              funnelId: formData.funnelId || null,
              stepId: formData.stepId || null,
              responsibleId: formData.responsibleId || null,
              dentistaId: formData.dentistaId || null,
              valorVenda: formData.valorVenda ? parseFloat(formData.valorVenda) : null,
              valorOrcamento: formData.valorOrcamento ? parseFloat(formData.valorOrcamento) : null,
              dataConsulta: formData.dataConsulta || null,
              duracaoConsulta: formData.duracaoConsulta || null,
              tipoProcura: formData.tipoProcura || null,
              meioCaptacao: formData.meioCaptacao || null,
              closerNegociacao: formData.closerNegociacao || null,
              closerFollow: formData.closerFollow || null,
              motivoPerda: formData.motivoPerda || null,
              dentistaParticipou: formData.dentistaParticipou || null,
              previsaoFechamento: formData.previsaoFechamento || null,
              objecao: formData.objecao || null,
              observacoes: formData.observacoes || null,
              statusVenda: formData.statusVenda || null,
              dataFechamento: formData.dataFechamento || null,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar lead');
          }

          // Resetar e recarregar
          resetLeadForm();
          setShowEditLeadModal(false);
          setEditingLead(null);

          // Recarregar funis
          await fetchFunnels();

          // Recarregar leads do funil atual
          if (selectedFunnel) {
            fetchLeadsForFunnel(selectedFunnel.id);
          }

          // Se mudou de funil, recarregar também
          if (formData.funnelId !== editingLead.funnelId && formData.funnelId) {
            fetchLeadsForFunnel(formData.funnelId);
          }

          alert('Lead atualizado com sucesso!');
        }}
        onDelete={async (leadId) => {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads/${leadId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });

          if (!response.ok) {
            throw new Error('Erro ao deletar lead');
          }

          // Recarregar
          await fetchFunnels();
          if (selectedFunnel) {
            fetchLeadsForFunnel(selectedFunnel.id);
          }

          alert('Lead excluído com sucesso!');
        }}
        funnels={funnels}
        users={colaboradores}
      />
    </div>
  );
} 