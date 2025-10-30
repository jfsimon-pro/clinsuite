'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Connection {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
}

interface Chat {
  id: string;
  contactName?: string;
  contactPhone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  fromMe: boolean;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT';
}

export default function WhatsAppPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const authHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token
      ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' } as Record<string, string>;
  };

  const fetchConnections = async () => {
    try {
      setAuthError(null);
      setApiError(null);
      const resp = await fetch(`${API_BASE_URL}/whatsapp/connections`, { headers: authHeaders() });
      if (resp.status === 401) { setAuthError('Faça login para ver as conversas'); return; }
      if (!resp.ok) { setApiError('Falha ao carregar conexões'); return; }
      const list: Connection[] = await resp.json();
      setConnections(list);
      if (!activeConnectionId) {
        const connected = list.find(c => c.status === 'CONNECTED');
        setActiveConnectionId((connected || list[0])?.id || null);
      }
    } catch (e) {
      setApiError('Erro de rede ao carregar conexões');
    }
  };

  const fetchChats = async () => {
    if (!activeConnectionId) return;
    try {
      setLoadingChats(true);
      setAuthError(null);
      setApiError(null);
      const resp = await fetch(`${API_BASE_URL}/whatsapp/connections/${activeConnectionId}/chats`, {
        headers: authHeaders(),
      });
      if (resp.status === 401) { setAuthError('Faça login para ver as conversas'); return; }
      if (!resp.ok) { setApiError('Não foi possível carregar os chats'); return; }
      const data = await resp.json();
      setChats(data);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      setLoadingMessages(true);
      setAuthError(null);
      setApiError(null);
      const resp = await fetch(`${API_BASE_URL}/whatsapp/chats/${chatId}/messages`, {
        headers: authHeaders(),
      });
      if (resp.status === 401) { setAuthError('Faça login para ver as mensagens'); return; }
      if (!resp.ok) { setApiError('Não foi possível carregar as mensagens'); return; }
      const data = await resp.json();
      setMessages(data);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (!activeConnectionId) return;
    fetchChats();
    const iv = setInterval(fetchChats, 3000);
    return () => clearInterval(iv);
  }, [activeConnectionId]);

  useEffect(() => {
    if (!selectedChatId) return;
    fetchMessages(selectedChatId);
    const iv = setInterval(() => fetchMessages(selectedChatId), 3000);
    return () => clearInterval(iv);
  }, [selectedChatId]);

  const selectedChat = useMemo(() => chats.find(c => c.id === selectedChatId) || null, [chats, selectedChatId]);

  const handleSendMessage = async () => {
    const text = message.trim();
    if (!text || !selectedChatId) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/whatsapp/chats/${selectedChatId}/messages`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ content: text })
      });
      if (!resp.ok) {
        const errText = await resp.text();
        console.error('Send message error:', resp.status, errText);
        setApiError('Falha ao enviar mensagem');
        return;
      }
      setMessage('');
      fetchMessages(selectedChatId);
    } catch (e) {
      console.error('Send message network error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center ring-1 ring-black/5">
                <span className="text-emerald-600 text-xl">💬</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
                <p className="text-gray-500 text-sm">Gerencie suas conversas do WhatsApp</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/whatsapp/connect"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-sm"
                title="Conectar WhatsApp"
              >
                <span>📱</span>
                <span>Conectar WhatsApp</span>
              </Link>
              <button className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold shadow-sm" title="Configurações">
                ⚙️ <span className="hidden sm:inline">Configurações</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {(authError || apiError) && (
          <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg">
            {authError || apiError}
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex h-[calc(100vh-260px)] max-h-[calc(100vh-260px)] min-h-[520px] overflow-hidden">
            {/* Lista de Chats */}
            <div className="w-1/3 bg-gray-50/80 backdrop-blur border-r border-gray-200 flex-shrink-0 min-w-[300px] max-w-[420px]">
              <div className="p-5 border-b border-gray-200 bg-white/80 backdrop-blur">
                <div className="space-y-3">
                  {/* Seletor de conexão */}
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-300"
                    value={activeConnectionId || ''}
                    onChange={(e) => {
                      setActiveConnectionId(e.target.value || null);
                      setSelectedChatId(null);
                      setMessages([]);
                    }}
                  >
                    <option value="" disabled>Selecione a conexão</option>
                    {connections.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.status === 'CONNECTED' ? '✅' : c.status === 'CONNECTING' ? '⏳' : '❌'}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="🔍 Pesquisar conversas..."
                      className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors"
                    />
                    <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto h-full">
                {loadingChats && chats.length === 0 ? (
                  <div className="p-6 text-gray-500">Carregando...</div>
                ) : chats.length === 0 ? (
                  <div className="p-6 text-gray-500">Nenhuma conversa</div>
                ) : (
                  chats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-all duration-200 group ${
                        selectedChatId === chat.id ? 'bg-emerald-50 border-l-4 border-l-emerald-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                          📱
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">{chat.contactName || chat.contactPhone}</h3>
                            <span className="text-xs text-gray-500">
                              {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString() : ''}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate group-hover:text-gray-700">{chat.lastMessage}</p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold shadow-sm">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Área de Chat */}
            <div className="flex-1 flex flex-col bg-white min-w-0">
              {selectedChat ? (
                <>
                  {/* Header do Chat */}
                  <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center text-xl shadow-sm flex-shrink-0">
                        📱
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {selectedChat.contactName || selectedChat.contactPhone}
                        </h3>
                        <p className="text-sm text-gray-500">Conversa</p>
                      </div>
                    </div>
                  </div>

                  {/* Mensagens */}
                  <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {loadingMessages && messages.length === 0 ? (
                      <div className="text-gray-500">Carregando...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-gray-500">Sem mensagens</div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((m) => (
                          <div key={m.id} className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${m.fromMe ? 'bg-emerald-500 text-white' : 'bg-white border border-gray-200'} px-4 py-3 rounded-2xl max-w-xs shadow-sm`}> 
                              <p className="text-sm leading-relaxed break-words">{m.content}</p>
                              <p className={`text-[11px] mt-1 ${m.fromMe ? 'opacity-80' : 'text-gray-500'}`}>{new Date(m.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Input de Mensagem */}
                  <div className="bg-white border-t border-gray-200 p-6">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-colors shadow-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 transition-colors shadow-sm"
                      >
                        📤
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Estado vazio quando nenhum chat está selecionado */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="text-7xl mb-4">💬</div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Selecione uma conversa</h3>
                    <p className="text-gray-500">Escolha um chat da lista para começar a conversar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
