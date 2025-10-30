'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, User, DollarSign, Calendar, Phone, Mail, Building2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

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
}

export default function LeadDetailPanel({
  lead,
  isOpen,
  onClose,
  onSave,
  onDelete,
  funnels,
  users = []
}: LeadDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'dados' | 'historico'>('dados');
  const [isSaving, setIsSaving] = useState(false);
  const [availableSteps, setAvailableSteps] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    phone: '',
    name: '',
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
    statusVenda: '',
    dataFechamento: ''
  });

  // Helper para converter data ISO para formato datetime-local
  const formatDateTimeLocal = (isoDate: string | null | undefined) => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      // Formato: YYYY-MM-DDTHH:mm
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Helper para converter data YYYY-MM-DD para formato datetime-local
  const formatDateLocal = (isoDate: string | null | undefined) => {
    if (!isoDate) return '';
    try {
      return isoDate.split('T')[0]; // Pega só a parte da data
    } catch {
      return '';
    }
  };

  // Atualizar form quando lead mudar
  useEffect(() => {
    if (lead) {
      setFormData({
        phone: lead.phone || '',
        name: lead.name || '',
        valorVenda: lead.valorVenda ? lead.valorVenda.toString() : '',
        valorOrcamento: lead.valorOrcamento ? lead.valorOrcamento.toString() : '',
        dataConsulta: formatDateTimeLocal(lead.dataConsulta),
        duracaoConsulta: lead.duracaoConsulta ? lead.duracaoConsulta.toString() : '60',
        tipoProcura: lead.tipoProcura || '',
        meioCaptacao: lead.meioCaptacao || '',
        closerNegociacao: lead.closerNegociacao || '',
        closerFollow: lead.closerFollow || '',
        dentista: lead.dentista || '',
        dentistaId: lead.dentistaId || '',
        motivoPerda: lead.motivoPerda || '',
        dentistaParticipou: lead.dentistaParticipou || '',
        previsaoFechamento: formatDateLocal(lead.previsaoFechamento),
        objecao: lead.objecao || '',
        observacoes: lead.observacoes || '',
        responsibleId: lead.responsibleId || '',
        funnelId: lead.funnelId || '',
        stepId: lead.stepId || '',
        statusVenda: lead.statusVenda || '',
        dataFechamento: formatDateLocal(lead.dataFechamento)
      });

      // Carregar etapas do funil
      const funnel = funnels.find((f) => f.id === lead.funnelId);
      if (funnel) {
        setAvailableSteps(funnel.steps || []);
      }
    }
  }, [lead, funnels]);

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
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
        style={{
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
      />

      {/* Painel lateral */}
      <div
        className="fixed top-0 right-0 h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          width: '500px',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-violet-400" />
              Editar Lead
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Criado em {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Lead Info Card */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Phone className="w-4 h-4" />
              <span className="font-mono text-sm">{lead.phone}</span>
            </div>
            <h3 className="text-lg font-bold">{lead.name || 'Lead sem nome'}</h3>
            {formData.statusVenda && (
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                <CheckCircle2 className="w-3 h-3" />
                {statusVendaOptions.find(s => s.value === formData.statusVenda)?.label}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dados')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'dados'
                  ? 'text-violet-400 border-violet-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              Dados do Lead
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'historico'
                  ? 'text-violet-400 border-violet-400'
                  : 'text-gray-400 border-transparent hover:text-gray-300'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'dados' ? (
            <div className="space-y-4">
              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Telefone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Nome
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>

              {/* Funil e Etapa - Grid 2 colunas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Funil *
                  </label>
                  <select
                    value={formData.funnelId}
                    onChange={(e) => handleFunnelChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="">Selecione...</option>
                    {funnels.map((funnel) => (
                      <option key={funnel.id} value={funnel.id}>
                        {funnel.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Etapa *
                  </label>
                  <select
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
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                  Status da Venda *
                </label>
                <select
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

              {/* Valores - Grid 2 colunas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Valor Orçamento
                  </label>
                  <input
                    type="number"
                    value={formData.valorOrcamento}
                    onChange={(e) => setFormData({ ...formData, valorOrcamento: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="R$ 0,00"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    Valor Venda
                  </label>
                  <input
                    type="number"
                    value={formData.valorVenda}
                    onChange={(e) => setFormData({ ...formData, valorVenda: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="R$ 0,00"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Datas - Grid 3 colunas */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Data Consulta
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.dataConsulta}
                    onChange={(e) => setFormData({ ...formData, dataConsulta: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400" />
                    Duração (min)
                  </label>
                  <select
                    value={formData.duracaoConsulta}
                    onChange={(e) => setFormData({ ...formData, duracaoConsulta: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hora</option>
                    <option value="90">1h 30min</option>
                    <option value="120">2 horas</option>
                    <option value="150">2h 30min</option>
                    <option value="180">3 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    Previsão Fechamento
                  </label>
                  <input
                    type="date"
                    value={formData.previsaoFechamento}
                    onChange={(e) => setFormData({ ...formData, previsaoFechamento: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Tipo de Procura */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Tipo de Procura
                </label>
                <select
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
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Meio de Captação
                </label>
                <select
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

              {/* Closers - Grid 2 colunas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Closer Negociação
                  </label>
                  <input
                    type="text"
                    value={formData.closerNegociacao}
                    onChange={(e) => setFormData({ ...formData, closerNegociacao: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Closer Follow
                  </label>
                  <input
                    type="text"
                    value={formData.closerFollow}
                    onChange={(e) => setFormData({ ...formData, closerFollow: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    placeholder="Nome"
                  />
                </div>
              </div>

              {/* Dentista */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Dentista
                </label>
                <select
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

              {/* Objeção */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  Objeção
                </label>
                <select
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
                  <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    Motivo da Perda
                  </label>
                  <select
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
                <label className="block text-sm font-medium text-gray-300 mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                  placeholder="Adicione observações sobre o lead..."
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">
                  Histórico de atividades em desenvolvimento
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Ações */}
        <div className="border-t border-gray-700 p-6 bg-gray-900">
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            {onDelete && (
              <button
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
