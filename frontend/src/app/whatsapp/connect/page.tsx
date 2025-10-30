'use client';

import { useState, useEffect } from 'react';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function WhatsAppConnectPage() {
  const {
    connections,
    loading: isLoading,
    error,
    fetchConnections,
    createConnection,
    connectWhatsApp,
    disconnectWhatsApp,
  } = useWhatsApp();

  const [newConnectionName, setNewConnectionName] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [phoneInputById, setPhoneInputById] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Carregar conexões quando página carregar
  useEffect(() => {
    fetchConnections();
  }, []); // Remover fetchConnections da dependência

  const handleConnect = async (connectionId: string) => {
    console.log('🔍 [DEBUG] handleConnect chamado com connectionId:', connectionId);
    const result = await connectWhatsApp(connectionId);
    console.log('🔍 [DEBUG] Resultado do connectWhatsApp:', result);
    
    if (result?.qrCode) {
      console.log('🔍 [DEBUG] QR Code recebido, atualizando estado');
      setQrCode(result.qrCode);
      setSelectedConnection(connectionId);
      
      // Iniciar polling para buscar QR Code atualizado no backend
      const pollQRCode = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/whatsapp/connections/${connectionId}/qr`, {
            headers: authHeaders(),
          });
          if (response.ok) {
            const data = await response.json();
            if (data.qrCode && data.qrCode !== result.qrCode) {
              console.log('🔍 [DEBUG] QR Code real/atualizado recebido!');
              setQrCode(data.qrCode);
            }
          }
        } catch (error) {
          console.log('🔍 [DEBUG] Erro ao buscar QR Code atualizado:', error);
        }
      };
      
      // Polling a cada 1s por 120s (mais tempo para escanear)
      const qrInterval = setInterval(pollQRCode, 1000);
      setTimeout(() => clearInterval(qrInterval), 120000);

      // Polling de status para detectar CONNECTED
      const pollStatus = async () => {
        try {
          const resp = await fetch(`${API_BASE_URL}/whatsapp/connections`, {
            headers: authHeaders(),
          });
          if (!resp.ok) return;
          const list = await resp.json();
          const target = Array.isArray(list) ? list.find((c: any) => c.id === connectionId) : null;
          if (target?.status === 'CONNECTED') {
            // Atualiza UI: fecha modal, mostra toast e recarrega conexões
            setQrCode(null);
            setSelectedConnection(null);
            setToast('Conectado com sucesso');
            setTimeout(() => setToast(null), 4000);
            fetchConnections();
          }
        } catch {}
      };
      const statusInterval = setInterval(pollStatus, 1000);
      setTimeout(() => clearInterval(statusInterval), 120000);
    } else {
      console.log('🔍 [DEBUG] Nenhum QR Code recebido');
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Tem certeza que deseja desconectar este WhatsApp?')) return;
    await disconnectWhatsApp(connectionId);
  };

  const handleAddConnection = async () => {
    if (!newConnectionName.trim()) return;
    
    const newConnection = await createConnection(newConnectionName);
    if (newConnection) {
      setNewConnectionName('');
    }
  };

  const handleCloseQR = () => {
    setQrCode(null);
    setSelectedConnection(null);
  };

  const handleGetPairingCode = async (connectionId: string) => {
    const value = phoneInputById[connectionId] || '';
    if (!value.trim()) {
      alert('Informe o telefone no formato 55DDDNÚMERO');
      return;
    }
    try {
      const resp = await fetch(`${API_BASE_URL}/whatsapp/connections/${connectionId}/pairing-code?phone=${encodeURIComponent(value)}`, {
        headers: authHeaders(),
      });
      if (!resp.ok) throw new Error('Falha ao gerar código');
      const data = await resp.json().catch(async () => ({ message: await resp.text() }));
      if ((data as any).code) setPairingCode((data as any).code);
      else alert((data as any).message || 'Falha ao gerar código');
      setSelectedConnection(connectionId);
      setQrCode(null);
    } catch (e) {
      alert('Erro ao gerar código: ' + (e as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/whatsapp"
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
              title="Voltar"
            >
              ←
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Conectar WhatsApp</h1>
              <p className="text-gray-600">Gerencie suas instâncias do WhatsApp</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[10001]">
            {toast}
          </div>
        )}

        {/* QR Code Modal */}
        {qrCode && selectedConnection && (
          <div className="qr-modal-overlay">
            <div className="qr-modal-content">
              <h3 className="qr-modal-title">📱 Conectar WhatsApp</h3>
              <p className="qr-modal-description">
                Escaneie o QR Code com seu WhatsApp
              </p>
              <div className="qr-code-container">
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="qr-code-image"
                />
              </div>
              <button
                onClick={handleCloseQR}
                className="qr-modal-button"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        )}
        
        {/* Debug Info */}
        <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
          Debug: qrCode={qrCode ? 'SIM' : 'NÃO'}, selectedConnection={selectedConnection || 'NÃO'}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Adicionar Nova Conexão */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">➕</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">Adicionar Nova Conexão</h3>
                <p className="text-gray-600 text-sm">Crie uma nova instância do WhatsApp</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                value={newConnectionName}
                onChange={(e) => setNewConnectionName(e.target.value)}
                placeholder="Nome da conexão (ex: WhatsApp Principal)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                onClick={handleAddConnection}
                disabled={!newConnectionName.trim() || isLoading}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-semibold transition-colors"
              >
                {isLoading ? 'Adicionando...' : 'Adicionar Conexão'}
              </button>
            </div>
          </div>

          {/* Status Geral */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-800">Status Geral</h3>
                <p className="text-gray-600 text-sm">Resumo das conexões</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Conexões Ativas</span>
                <span className="text-2xl font-bold text-green-600">
                  {connections.filter(c => c.status === 'CONNECTED').length}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Total de Conexões</span>
                <span className="text-2xl font-bold text-blue-600">
                  {connections.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Conexões */}
        <div className="mt-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 text-xl">📱</span>
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-800">Conexões Existentes</h3>
              <p className="text-gray-600 text-sm">Gerencie suas instâncias conectadas</p>
            </div>
          </div>
          
          {isLoading && connections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando conexões...</p>
            </div>
          ) : connections.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">📱</div>
              <p className="text-gray-600 text-lg mb-2">Nenhuma conexão encontrada</p>
              <p className="text-sm text-gray-500">Adicione uma nova conexão acima</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connections.map((connection) => (
                <div
                  key={connection.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        connection.status === 'CONNECTED' ? 'bg-green-500' :
                        connection.status === 'CONNECTING' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800">{connection.name}</h4>
                        {connection.phone && (
                          <p className="text-sm text-gray-600">{connection.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      connection.status === 'CONNECTED' ? 'bg-green-100 text-green-700' :
                      connection.status === 'CONNECTING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {connection.status === 'CONNECTED' ? 'Conectado' :
                       connection.status === 'CONNECTING' ? 'Conectando' : 'Desconectado'}
                    </div>
                  </div>
                  
                  {connection.lastSeen && connection.status === 'CONNECTED' && (
                    <p className="text-xs text-gray-500 mb-4">
                      Última vez: {new Date(connection.lastSeen).toLocaleString()}
                    </p>
                  )}
                  
                  <div className="flex flex-col space-y-3">
                    {connection.status === 'CONNECTED' ? (
                      <button
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={isLoading}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 disabled:opacity-50 font-semibold transition-colors"
                      >
                        🔌 Desconectar
                      </button>
                    ) : (
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-3 space-y-3 md:space-y-0">
                        <button
                          onClick={() => handleConnect(connection.id)}
                          disabled={isLoading}
                          className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 font-semibold transition-colors"
                        >
                          🔗 Conectar com QR
                        </button>
                        <div className="flex-1 flex items-center space-x-2">
                          <input
                            type="text"
                            value={phoneInputById[connection.id] || ''}
                            onChange={(e) => setPhoneInputById((prev) => ({ ...prev, [connection.id]: e.target.value }))}
                            placeholder="55DDDNÚMERO"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <button
                            onClick={() => handleGetPairingCode(connection.id)}
                            disabled={isLoading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 font-semibold transition-colors whitespace-nowrap"
                          >
                            🔢 Código
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {pairingCode && selectedConnection === connection.id && (
                    <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800 text-center font-mono text-lg">
                      Código de pareamento: <span className="font-bold">{pairingCode}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              <span className="font-semibold">
                {connections.filter(c => c.status === 'CONNECTED').length} de {connections.length} conectados
              </span>
            </div>
            <Link
              href="/whatsapp"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold transition-colors"
            >
              ✕ Voltar ao WhatsApp
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
