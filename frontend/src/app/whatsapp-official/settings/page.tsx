'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Copy, Eye, EyeOff, Lock } from 'lucide-react';
import api from '@/lib/api';
import '../whatsapp-official.css';




export default function WhatsappOfficialSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        phoneNumberId: '',
        wabaId: '',
        accessToken: '',
        verifyToken: 'Carregando...'
    });

    // Carregar configurações ao iniciar
    useEffect(() => {
        async function loadConfig() {
            try {
                const response = await api.get('/whatsapp-config');
                if (response.data) {
                    setFormData({
                        phoneNumberId: response.data.phoneNumberId || '',
                        wabaId: response.data.wabaId || '',
                        accessToken: response.data.accessToken || '',
                        verifyToken: response.data.verifyToken || 'Será gerado ao salvar'
                    });
                } else {
                    setFormData(prev => ({ ...prev, verifyToken: 'Será gerado ao salvar' }));
                }
            } catch (error) {
                console.error('Erro ao carregar configurações:', error);
            }
        }
        loadConfig();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');

        try {
            const response = await api.post('/whatsapp-config', {
                phoneNumberId: formData.phoneNumberId,
                wabaId: formData.wabaId,
                accessToken: formData.accessToken
            });

            setSuccessMessage('Configurações salvas com sucesso!');

            // Atualizar verifyToken se foi gerado agora
            if (response.data.verifyToken) {
                setFormData(prev => ({ ...prev, verifyToken: response.data.verifyToken }));
            }

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar configurações. Verifique o console.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Poderia adicionar um toast aqui
    };

    return (
        <div className="whatsapp-official-main p-6 relative group">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Configurações do WhatsApp Oficial</h1>
                    <p className="text-slate-500">
                        Conecte sua conta do WhatsApp Business API (Cloud API) para enviar e receber mensagens oficiais.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna Principal - Formulário */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Card de Credenciais */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    1
                                </div>
                                Credenciais da API
                            </h2>

                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label htmlFor="phoneNumberId" className="block text-sm font-medium text-slate-700 mb-1">
                                        Phone Number ID
                                    </label>
                                    <input
                                        type="text"
                                        id="phoneNumberId"
                                        name="phoneNumberId"
                                        value={formData.phoneNumberId}
                                        onChange={handleChange}
                                        placeholder="Ex: 105954558974412"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Encontrado no painel do Meta for Developers {'>'} WhatsApp {'>'} API Setup.
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="wabaId" className="block text-sm font-medium text-slate-700 mb-1">
                                        WhatsApp Business Account ID
                                    </label>
                                    <input
                                        type="text"
                                        id="wabaId"
                                        name="wabaId"
                                        value={formData.wabaId}
                                        onChange={handleChange}
                                        placeholder="Ex: 102345678901234"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="accessToken" className="block text-sm font-medium text-slate-700 mb-1">
                                        Access Token (Token Permanente)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showToken ? "text" : "password"}
                                            id="accessToken"
                                            name="accessToken"
                                            value={formData.accessToken}
                                            onChange={handleChange}
                                            placeholder="EAAG..."
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowToken(!showToken)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showToken ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Recomendado usar um System User Token com permissões <code>whatsapp_business_messaging</code> e <code>whatsapp_business_management</code>.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`
                      flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg text-white font-medium transition-all
                      ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
                    `}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={18} />
                                                Salvar Configurações
                                            </>
                                        )}
                                    </button>
                                </div>

                                {successMessage && (
                                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 border border-green-200 animate-in fade-in slide-in-from-top-2">
                                        <CheckCircle size={18} />
                                        {successMessage}
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Card de Webhook */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-75 hover:opacity-100 transition-opacity">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    2
                                </div>
                                Configuração do Webhook
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800 flex gap-3">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <p>
                                        Configure estes dados no painel do Meta for Developers para receber mensagens em tempo real.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Callback URL
                                    </label>
                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-slate-100 px-3 py-2 rounded border border-slate-200 text-slate-600 font-mono text-sm overflow-x-auto">
                                            https://api.ianaraerp.com/webhooks/whatsapp
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard('https://api.ianaraerp.com/webhooks/whatsapp')}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Copiar"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Verify Token
                                    </label>
                                    <div className="flex gap-2">
                                        <code className="flex-1 bg-slate-100 px-3 py-2 rounded border border-slate-200 text-slate-600 font-mono text-sm">
                                            {formData.verifyToken}
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard(formData.verifyToken)}
                                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                            title="Copiar"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Coluna Lateral - Ajuda */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-3">Como configurar?</h3>
                            <ol className="space-y-3 text-sm text-slate-600 list-decimal pl-4">
                                <li>Acesse <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Meta for Developers</a>.</li>
                                <li>Crie um app do tipo "Business".</li>
                                <li>Adicione o produto "WhatsApp" ao seu app.</li>
                                <li>Gere um Token Permanente em "Business Settings" {'>'} "System Users".</li>
                                <li>Copie o <strong>Phone Number ID</strong> e <strong>WABA ID</strong>.</li>
                                <li>Cole os dados no formulário ao lado e salve.</li>
                                <li>Configure o Webhook usando a URL e Token fornecidos abaixo.</li>
                            </ol>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Atenção
                            </h3>
                            <p className="text-sm text-yellow-700">
                                Para produção, você precisará verificar sua empresa no Business Manager e adicionar um método de pagamento.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 flex flex-col items-center justify-center cursor-not-allowed">
                <div className="bg-white p-4 rounded-full shadow-xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Disponível Junto com WhatsApp</h3>
                <p className="text-gray-600 font-medium">Esta funcionalidade será desbloqueada junto com o módulo do WhatsApp</p>
            </div>
        </div>
    );
}
