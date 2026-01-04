'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Save, Trash2, User, DollarSign, Calendar, Phone, Mail, Building2, FileText, AlertCircle, CheckCircle2, Tag } from 'lucide-react';
import LeadTags from './LeadTags';

interface Lead {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  valorVenda?: number;
  valorOrcamento?: number;
  dataConsulta?: string;
  duracaoConsulta?: number;
  tipoProcura?: string;
  meioCaptacao?: string;
  closerNegociacao?: string;
  closerFollow?: string;
  dentista?: string;
  dentistaId?: string;
  motivoPerda?: string;
  dentistaParticipou?: string;
  previsaoFechamento?: string;
  objecao?: string;
  observacoes?: string;
  statusVenda?: string;
  dataFechamento?: string;
  responsibleId?: string;
  funnelId: string;
  stepId: string;
  createdAt: string;
  updatedAt: string;
}

interface LeadDetailPanelProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: any) => Promise<void>;
  onDelete?: (leadId: string) => Promise<void>;
  funnels: any[];
  users?: any[];
  units?: any[];
}

export default function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onSave,
  onDelete,
  funnels,
  users = [],
  units = []
}: LeadDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'negociacao' | 'detalhes' | 'historico'>('geral');
  const [isSaving, setIsSaving] = useState(false);
  const [availableSteps, setAvailableSteps] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    email: '',
    valorVenda: '',
    valorOrcamento: '',
    dataConsulta: '',
    duracaoConsulta: '60',
    tipoProcura: '',
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
    unitId: '',
    statusVenda: '',
    dataFechamento: ''
  });

  // Helper para converter data ISO para formato datetime-local usando date-fns
  const formatDateTimeLocal = (isoDate: string | null | undefined) => {
    if (!isoDate) return '';
    try {
      return format(new Date(isoDate), "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error('Erro ao formatar data:', isoDate, error);
      return '';
    }
  };

  // Atualizar form quando lead mudar
  useEffect(() => {
    if (lead) {
      console.log('🔄 LeadDetailPanel - Inicializando com lead:', {
        id: lead.id,
        name: lead.name,
        dataConsulta: lead.dataConsulta,
        dentistaId: lead.dentistaId
      });

      const formattedDate = formatDateTimeLocal(lead.dataConsulta);
      console.log('📅 Data formatada para input:', formattedDate);

      setFormData({
        phone: lead.phone || '',
        name: lead.name || '',
        email: (lead as any).email || '',
        valorVenda: lead.valorVenda ? lead.valorVenda.toString() : '',
        valorOrcamento: lead.valorOrcamento ? lead.valorOrcamento.toString() : '',
        dataConsulta: formattedDate,
        duracaoConsulta: lead.duracaoConsulta ? lead.duracaoConsulta.toString() : '60',
        tipoProcura: lead.tipoProcura || '',
        meioCaptacao: lead.meioCaptacao || '',
        closerNegociacao: lead.closerNegociacao || '',
        closerFollow: lead.closerFollow || '',
        dentista: lead.dentista || '',
        dentistaId: lead.dentistaId || '',
        motivoPerda: lead.motivoPerda || '',
        dentistaParticipou: lead.dentistaParticipou || '',
        previsaoFechamento: lead.previsaoFechamento ? lead.previsaoFechamento.split('T')[0] : '',
        objecao: lead.objecao || '',
        observacoes: lead.observacoes || '',
        responsibleId: lead.responsibleId || '',
        funnelId: lead.funnelId || '',
        stepId: lead.stepId || '',
        unitId: (lead as any).unitId || '',
        statusVenda: lead.statusVenda || '',
        dataFechamento: lead.dataFechamento ? lead.dataFechamento.split('T')[0] : ''
      });

      // Carregar etapas do funil
      const funnel = funnels.find((f) => f.id === lead.funnelId);
      if (funnel) {
        setAvailableSteps(funnel.steps || []);
      }
    }
  }, [lead, funnels]);

  // Funis filtrados por unidade selecionada
  const filteredFunnels = formData.unitId
    ? funnels.filter((f: any) => f.unitId === formData.unitId)
    : funnels;

  // Handler para mudança de unidade - reseta funil e etapa
  const handleUnitChange = (unitId: string) => {
    setFormData({
      ...formData,
      unitId,
      funnelId: '', // Resetar funil ao mudar unidade
      stepId: ''    // Resetar etapa ao mudar unidade
    });
    setAvailableSteps([]);
  };

  const handleFunnelChange = (funnelId: string) => {
    setFormData({ ...formData, funnelId, stepId: '' });
    const funnel = funnels.find((f) => f.id === funnelId);
    setAvailableSteps(funnel?.steps || []);
  };

  const handleSave = async () => {
    if (!formData.phone) {
      alert('Telefone é obrigatório!');
      return;
    }

    setIsSaving(true);
    try {
      // Converter strings vazias em null para datas (mas manter strings com valor)
      const dataToSave = {
        ...formData,
        dataConsulta: formData.dataConsulta && formData.dataConsulta.trim() !== '' ? formData.dataConsulta : null,
        previsaoFechamento: formData.previsaoFechamento && formData.previsaoFechamento.trim() !== '' ? formData.previsaoFechamento : null,
        dataFechamento: formData.dataFechamento && formData.dataFechamento.trim() !== '' ? formData.dataFechamento : null,
        duracaoConsulta: formData.duracaoConsulta ? parseInt(formData.duracaoConsulta) : null,
        unitId: formData.unitId || null,
      };

      console.log('🔍 DEBUG Frontend - Salvando dados:', {
        dataConsulta: dataToSave.dataConsulta,
        dataConsultaTipo: typeof dataToSave.dataConsulta,
        dataConsultaLength: dataToSave.dataConsulta?.length,
        duracaoConsulta: dataToSave.duracaoConsulta,
        duracaoConsultaTipo: typeof dataToSave.duracaoConsulta,
        todosOsDados: dataToSave
      });
      await onSave(dataToSave);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);

      // Extrair mensagem de erro mais amigável
      const errorMessage = error?.message || 'Erro ao salvar lead. Tente novamente.';

      // Mostrar alert estilizado
      if (errorMessage.includes('Conflito de horário')) {
        alert('⚠️ ' + errorMessage);
      } else {
        alert('❌ ' + errorMessage);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead || !onDelete) return;

    const confirm = window.confirm(`Tem certeza que deseja deletar o lead ${lead.name || lead.phone}?`);
    if (confirm) {
      try {
        await onDelete(lead.id);
        onClose();
      } catch (error) {
        console.error('Erro ao deletar:', error);
        alert('Erro ao deletar lead. Tente novamente.');
      }
    }
  };

  if (!isOpen || !lead) return null;

  // Opções para dropdowns
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

  const tipoProcuraOptions = ['ORTODONTIA', 'IMPLANTE', 'ESTETICA', 'LIMPEZA', 'CANAL', 'EXTRACAO', 'PROTESE', 'CLAREAMENTO', 'OUTROS'];
  const meioCaptacaoOptions = ['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_ADS', 'INDICACAO', 'SITE', 'TELEFONE', 'PRESENCIAL', 'OUTROS'];

  // Obter dentistas reais da empresa
  const dentistas = users.filter(user => user.role === 'DENTIST');

  const motivoPerdaOptions = ['PRECO', 'TEMPO', 'LOCALIZACAO', 'CONFIANCA', 'CONCORRENCIA', 'NAO_INTERESSADO', 'NAO_RESPONDEU', 'OUTROS'];
  const objecaoOptions = ['PRECO_ALTO', 'TEMPO_TRATAMENTO', 'DOR_MEDO', 'SEGUNDA_OPINIAO', 'PENSANDO', 'CONVERSAR_FAMILIA', 'CONDICOES_PAGAMENTO', 'OUTROS'];

  return (
    <>
      {/* Overlay semi-transparente */}
      <div
        id="lead-detail-overlay"
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      />

      {/* Painel lateral */}
      <div
        id="lead-detail-panel"
        className="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out w-full md:w-[500px]"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-600" />
              Editar Lead
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Criado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            id="lead-detail-close-btn"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Lead Info Card */}
        <div id="lead-info-card" className="px-6 pt-4 pb-2">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              <span id="lead-phone-display" className="font-mono text-sm">{lead.phone}</span>
            </div>
            <h3 id="lead-name-display" className="text-lg font-bold">{lead.name || 'Lead sem nome'}</h3>
            {formData.statusVenda && (
              <div id="lead-status-badge" className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                <CheckCircle2 className="w-3 h-3" />
                {statusVendaOptions.find(s => s.value === formData.statusVenda)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Tags Section */}
        <div className="px-6 py-3">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-medium text-gray-600">Tags</span>
          </div>
          <LeadTags
            leadId={lead.id}
            initialTags={(lead as any).tags?.map((t: any) => t.tag) || []}
          />
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              id="tab-geral"
              onClick={() => setActiveTab('geral')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'geral'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Geral
            </button>
            <button
              id="tab-negociacao"
              onClick={() => setActiveTab('negociacao')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'negociacao'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Negociação
            </button>
            <button
              id="tab-detalhes"
              onClick={() => setActiveTab('detalhes')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'detalhes'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Detalhes
            </button>
            <button
              id="tab-historico-lead"
              onClick={() => setActiveTab('historico')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === 'historico'
                ? 'text-violet-600 border-violet-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'geral' && (
            <div className="space-y-6">

              {/* --- 1. DADOS DE CONTATO --- */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Dados de Contato
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Telefone e Nome */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Telefone *
                      </label>
                      <input
                        id="input-lead-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nome
                      </label>
                      <input
                        id="input-lead-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Nome completo"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Email (para Portal do Paciente)
                    </label>
                    <input
                      id="input-lead-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </section>

              {/* --- 2. ORIGEM E INTERESSE --- */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Origem e Interesse
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Tipo de Procura */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tipo de Procura
                    </label>
                    <select
                      id="select-lead-tipo-procura"
                      value={formData.tipoProcura}
                      onChange={(e) => setFormData({ ...formData, tipoProcura: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {tipoProcuraOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Meio de Captação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Meio de Captação
                    </label>
                    <select
                      id="select-lead-meio-captacao"
                      value={formData.meioCaptacao}
                      onChange={(e) => setFormData({ ...formData, meioCaptacao: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {meioCaptacaoOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'negociacao' && (
            <div className="space-y-6">
              {/* --- 3. CLASSIFICAÇÃO NO FUNIL --- */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Classificação no Funil
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Unidade */}
                  {units.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-violet-600" />
                        Unidade
                      </label>
                      <select
                        id="select-lead-unit"
                        value={formData.unitId}
                        onChange={(e) => handleUnitChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="">Todas as unidades</option>
                        {units.map((unit: any) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} {unit.code ? `(${unit.code})` : ''}
                          </option>
                        ))}
                      </select>
                      {formData.unitId && filteredFunnels.length === 0 && (
                        <p className="text-xs text-yellow-600 mt-1">⚠️ Nenhum funil encontrado nesta unidade</p>
                      )}
                    </div>
                  )}

                  {/* Funil e Etapa - Grid 2 colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Funil *
                      </label>
                      <select
                        id="select-lead-funnel"
                        value={formData.funnelId}
                        onChange={(e) => handleFunnelChange(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {filteredFunnels.map((funnel: any) => (
                          <option key={funnel.id} value={funnel.id}>
                            {funnel.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Etapa *
                      </label>
                      <select
                        id="select-lead-step"
                        value={formData.stepId}
                        onChange={(e) => setFormData({ ...formData, stepId: e.target.value })}
                        disabled={!formData.funnelId}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.funnelId ? 'Selecione...' : 'Selecione funil'}
                        </option>
                        {availableSteps.map((step) => (
                          <option key={step.id} value={step.id}>
                            {step.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status da Venda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-violet-600" />
                      Status da Venda *
                    </label>
                    <select
                      id="select-lead-status"
                      value={formData.statusVenda}
                      onChange={(e) => setFormData({ ...formData, statusVenda: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {statusVendaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* --- 4. AGENDAMENTO E VALORES --- */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Agendamento e Valores
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Datas - Grid 3 colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        Data Consulta
                      </label>
                      <input
                        id="input-lead-data-consulta"
                        type="datetime-local"
                        value={formData.dataConsulta}
                        onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        Duração
                      </label>
                      <select
                        id="select-lead-duracao-consulta"
                        value={formData.duracaoConsulta}
                        onChange={(e) => setFormData({ ...formData, duracaoConsulta: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="15">15 min</option>
                        <option value="30">30 min</option>
                        <option value="45">45 min</option>
                        <option value="60">1h</option>
                        <option value="90">1h30</option>
                        <option value="120">2h</option>
                        <option value="150">2h30</option>
                        <option value="180">3h</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      Previsão Fechamento
                    </label>
                    <input
                      id="input-lead-previsao-fechamento"
                      type="date"
                      value={formData.previsaoFechamento}
                      onChange={(e) => setFormData({ ...formData, previsaoFechamento: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  {/* Valores - Grid 2 colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Valor Orçamento
                      </label>
                      <input
                        id="input-lead-valor-orcamento"
                        type="number"
                        value={formData.valorOrcamento}
                        onChange={(e) => setFormData({ ...formData, valorOrcamento: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="R$ 0,00"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        Valor Venda
                      </label>
                      <input
                        id="input-lead-valor-venda"
                        type="number"
                        value={formData.valorVenda}
                        onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="R$ 0,00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'detalhes' && (
            <div className="space-y-6">
              {/* --- 5. EQUIPE RESPONSÁVEL --- */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Equipe Responsável
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Dentista */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Dentista
                    </label>
                    <select
                      id="select-lead-dentista"
                      value={formData.dentistaId}
                      onChange={(e) => setFormData({ ...formData, dentistaId: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {dentistas.map((dentista) => (
                        <option key={dentista.id} value={dentista.id}>
                          {dentista.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Closers - Grid 2 colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Closer Negociação
                      </label>
                      <input
                        id="input-lead-closer-negociacao"
                        type="text"
                        value={formData.closerNegociacao}
                        onChange={(e) => setFormData({ ...formData, closerNegociacao: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Nome"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Closer Follow
                      </label>
                      <input
                        id="input-lead-closer-follow"
                        type="text"
                        value={formData.closerFollow}
                        onChange={(e) => setFormData({ ...formData, closerFollow: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                        placeholder="Nome"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* --- 6. FINALIZAÇÃO --- */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-gray-100">
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Finalização e Obs
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Objeção */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Objeção
                    </label>
                    <select
                      id="select-lead-objecao"
                      value={formData.objecao}
                      onChange={(e) => setFormData({ ...formData, objecao: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {objecaoOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Motivo Perda (se PERDIDO) */}
                  {formData.statusVenda === 'PERDIDO' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        Motivo da Perda
                      </label>
                      <select
                        id="select-lead-motivo-perda"
                        value={formData.motivoPerda}
                        onChange={(e) => setFormData({ ...formData, motivoPerda: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="">Selecione...</option>
                        {motivoPerdaOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Observações
                    </label>
                    <textarea
                      id="textarea-lead-observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                      placeholder="Adicione observações sobre o lead..."
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-8 text-gray-500">
                <p>Histórico de interações será implementado em breve.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Ações */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex gap-3">
            <button
              id="btn-save-lead"
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {onDelete && (
              <button
                id="btn-delete-lead"
                onClick={handleDelete}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
