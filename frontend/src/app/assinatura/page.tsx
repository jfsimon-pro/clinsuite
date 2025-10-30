'use client';

import { useState } from 'react';
import {
  CreditCard,
  Calendar,
  Check,
  Zap,
  Building2,
  Crown,
  ArrowRight,
  Download,
  Barcode,
  Wallet,
  Shield,
  Lock
} from 'lucide-react';

export default function AssinaturaPage() {
  const [activeTab, setActiveTab] = useState<'cartao' | 'boleto'>('cartao');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Dados fictícios do plano atual
  const currentPlan = {
    name: 'Plano Premium',
    price: 'R$ 297,00',
    period: 'mensal',
    nextBilling: '15/11/2025',
    status: 'Ativo',
    features: [
      'Até 5 usuários',
      'Gestão completa de pacientes',
      'CRM avançado com funis',
      'WhatsApp integrado',
      'Automações ilimitadas',
      'Suporte prioritário',
    ]
  };

  // Dados fictícios de histórico de pagamentos
  const paymentHistory = [
    { date: '15/10/2025', amount: 'R$ 297,00', status: 'Pago', method: 'Cartão de Crédito' },
    { date: '15/09/2025', amount: 'R$ 297,00', status: 'Pago', method: 'Cartão de Crédito' },
    { date: '15/08/2025', amount: 'R$ 297,00', status: 'Pago', method: 'Boleto Bancário' },
  ];

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    setCardNumber(formatCardNumber(value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardExpiry(formatExpiry(value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(value);
  };

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Pagamento com cartão de crédito processado! (Fictício)');
  };

  const handleGenerateBoleto = () => {
    alert('Boleto bancário gerado! (Fictício)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Assinatura</h1>
          <p className="text-gray-600">Gerencie seu plano e forma de pagamento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Informações do Plano */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card do Plano Atual */}
            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{currentPlan.name}</h3>
                  <span className="text-sm text-white/80">Assinatura {currentPlan.period}</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="text-3xl font-bold mb-1">{currentPlan.price}</div>
                <div className="text-sm text-white/80">por mês</div>
              </div>

              <div className="space-y-2 mb-4">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-white/90" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/20">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-white/80">Status:</span>
                  <span className="font-semibold">{currentPlan.status}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/80">Próxima cobrança:</span>
                  <span className="font-semibold">{currentPlan.nextBilling}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-gray-600">Cliente desde</span>
                </div>
                <div className="text-lg font-bold text-gray-900">15/05/2025</div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-gray-600">Pagamentos</span>
                </div>
                <div className="text-lg font-bold text-gray-900">3 meses</div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Formas de Pagamento */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white border border-gray-200 rounded-xl p-1 flex gap-1 shadow-sm">
              <button
                onClick={() => setActiveTab('cartao')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'cartao'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Cartão de Crédito</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('boleto')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  activeTab === 'boleto'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Barcode className="w-4 h-4" />
                  <span>Boleto Bancário</span>
                </div>
              </button>
            </div>

            {/* Conteúdo do Tab - Cartão de Crédito */}
            {activeTab === 'cartao' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Pagamento Seguro</h3>
                </div>

                <form onSubmit={handleSubmitCard} className="space-y-6">
                  {/* Preview do Cartão */}
                  <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-6 text-white mb-6 aspect-[1.586/1] max-w-md mx-auto relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />

                    <div className="relative z-10 h-full flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-yellow-400" />
                          <span className="text-xs font-semibold">SEGURO</span>
                        </div>
                        <CreditCard className="w-10 h-10 text-white/50" />
                      </div>

                      <div>
                        <div className="text-2xl font-mono tracking-wider mb-4">
                          {cardNumber || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs text-white/60 mb-1">Nome no cartão</div>
                            <div className="font-semibold text-sm uppercase">
                              {cardName || 'SEU NOME'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-white/60 mb-1">Validade</div>
                            <div className="font-semibold text-sm">
                              {cardExpiry || 'MM/AA'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Campos do Formulário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Como está escrito no cartão"
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Validade
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={handleCvvChange}
                        placeholder="123"
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Atualizar Método de Pagamento</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-xs text-gray-600 text-center">
                    Seus dados são protegidos com criptografia de ponta a ponta
                  </p>
                </form>
              </div>
            )}

            {/* Conteúdo do Tab - Boleto */}
            {activeTab === 'boleto' && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Barcode className="w-5 h-5 text-orange-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Boleto Bancário</h3>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <Wallet className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Pagamento via Boleto Bancário
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Gere um boleto bancário para pagamento da sua assinatura.
                        O boleto pode ser pago em qualquer banco ou lotérica.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Vencimento em 3 dias úteis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Confirmação em até 2 dias úteis após o pagamento</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-green-600" />
                      <span>Sem taxas adicionais</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 text-sm">Valor da assinatura:</span>
                      <span className="text-2xl font-bold text-gray-900">{currentPlan.price}</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Referente ao período de {currentPlan.nextBilling}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateBoleto}
                    className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Gerar Boleto Bancário</span>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="text-sm">
                      <p className="text-blue-900 font-medium mb-1">
                        Pague em qualquer banco
                      </p>
                      <p className="text-gray-700">
                        Após gerar o boleto, você pode pagá-lo em qualquer banco,
                        internet banking, caixas eletrônicos ou casas lotéricas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Histórico de Pagamentos */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Histórico de Pagamentos</h3>

              <div className="space-y-3">
                {paymentHistory.map((payment, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-violet-300 hover:bg-violet-50/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-gray-900 font-medium">{payment.amount}</div>
                          <div className="text-sm text-gray-600">{payment.method}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">{payment.date}</div>
                        <div className="text-sm font-medium text-green-600">{payment.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
