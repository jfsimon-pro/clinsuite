import React, { useState } from 'react';
import { X, User, Phone, DollarSign, Calendar, Search, Share2, Briefcase, FileText, AlertCircle, Clock, CheckCircle, LayoutGrid, Users, Activity } from 'lucide-react';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  leadData: any;
  setLeadData: (data: any) => void;
  stepName?: string;
  options: {
    tipoProcura: string[];
    meioCaptacao: string[];
    motivoPerda: string[];
    objecao: string[];
    closersNegociacao: any[];
    closersFollow: any[];
    dentistas: any[];
  };
}

type TabType = 'pessoais' | 'venda' | 'responsaveis' | 'status';

export default function CreateLeadModal({
  isOpen,
  onClose,
  onSave,
  leadData,
  setLeadData,
  stepName,
  options
}: CreateLeadModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pessoais');

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setLeadData({ ...leadData, [field]: value });
  };

  const tabs = [
    { id: 'pessoais', label: 'Dados Pessoais', icon: User },
    { id: 'venda', label: 'Detalhes da Venda', icon: DollarSign },
    { id: 'responsaveis', label: 'Responsáveis', icon: Users },
    { id: 'status', label: 'Status e Obs', icon: Activity },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100 h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <LayoutGrid size={20} />
              </div>
              Novo Lead
            </h3>
            {stepName && (
              <p className="text-sm text-slate-500 mt-1 ml-11">
                Adicionando na etapa: <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{stepName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 pt-2 border-b border-slate-100 flex gap-1 overflow-x-auto shrink-0 bg-white">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'}
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
          <div className="max-w-2xl mx-auto">

            {/* Tab: Dados Pessoais */}
            {activeTab === 'pessoais' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-blue-500" />
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={leadData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-lg"
                      required
                      autoFocus
                    />
                    <p className="text-xs text-slate-400 pl-1">Digite apenas números ou formato padrão.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      Nome
                    </label>
                    <input
                      type="text"
                      value={leadData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="Nome do lead"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Detalhes da Venda */}
            {activeTab === 'venda' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      Valor da Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={leadData.valorVenda}
                      onChange={(e) => handleChange('valorVenda', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 text-lg font-medium text-green-700"
                    />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Data da Consulta
                    </label>
                    <input
                      type="datetime-local"
                      value={leadData.dataConsulta}
                      onChange={(e) => handleChange('dataConsulta', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Duração (min)
                    </label>
                    <select
                      value={leadData.duracaoConsulta || '60'}
                      onChange={(e) => handleChange('duracaoConsulta', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
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

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-slate-400" />
                      Tipo de Procura
                    </label>
                    <select
                      value={leadData.tipoProcura}
                      onChange={(e) => handleChange('tipoProcura', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    >
                      <option value="">Selecione...</option>
                      {options.tipoProcura.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Share2 className="w-4 h-4 text-slate-400" />
                      Meio de Captação
                    </label>
                    <select
                      value={leadData.meioCaptacao}
                      onChange={(e) => handleChange('meioCaptacao', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    >
                      <option value="">Selecione...</option>
                      {options.meioCaptacao.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Responsáveis */}
            {activeTab === 'responsaveis' && (
              <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      Closer de Negociação
                    </label>
                    <select
                      value={leadData.closerNegociacao}
                      onChange={(e) => handleChange('closerNegociacao', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    >
                      <option value="">Selecione...</option>
                      {options.closersNegociacao.map(colab => (
                        <option key={colab.id} value={colab.name}>{colab.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      Closer de Follow
                    </label>
                    <select
                      value={leadData.closerFollow}
                      onChange={(e) => handleChange('closerFollow', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    >
                      <option value="">Selecione...</option>
                      {options.closersFollow.map(colab => (
                        <option key={colab.id} value={colab.name}>{colab.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-400" />
                      Dentista
                    </label>
                    <select
                      value={leadData.dentistaId}
                      onChange={(e) => handleChange('dentistaId', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    >
                      <option value="">Selecione...</option>
                      {options.dentistas.map(dentista => (
                        <option key={dentista.id} value={dentista.id}>{dentista.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-slate-400" />
                      Dentista Participou?
                    </label>
                    <select
                      value={leadData.dentistaParticipou}
                      onChange={(e) => handleChange('dentistaParticipou', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                    >
                      <option value="">Selecione...</option>
                      <option value="SIM">Sim</option>
                      <option value="NAO">Não</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Status e Obs */}
            {activeTab === 'status' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        Motivo da Perda
                      </label>
                      <select
                        value={leadData.motivoPerda}
                        onChange={(e) => handleChange('motivoPerda', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                      >
                        <option value="">Selecione...</option>
                        {options.motivoPerda.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Previsão de Fechamento
                      </label>
                      <input
                        type="date"
                        value={leadData.previsaoFechamento}
                        onChange={(e) => handleChange('previsaoFechamento', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        Objeção
                      </label>
                      <select
                        value={leadData.objecao}
                        onChange={(e) => handleChange('objecao', e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-600"
                      >
                        <option value="">Selecione...</option>
                        {options.objecao.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-slate-400" />
                    Observações
                  </label>
                  <textarea
                    value={leadData.observacoes}
                    onChange={(e) => handleChange('observacoes', e.target.value)}
                    placeholder="Observações sobre o lead..."
                    rows={4}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 resize-y"
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-400">
            * Campos obrigatórios
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle size={16} />
              Salvar Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
