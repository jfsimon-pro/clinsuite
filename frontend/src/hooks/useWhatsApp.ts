import { useState, useEffect, useCallback } from 'react';

interface WhatsAppConnection {
  id: string;
  name: string;
  phone?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
  lastSeen?: string;
  qrCode?: string;
}

interface WhatsAppChat {
  id: string;
  contactName?: string;
  contactPhone: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface WhatsAppMessage {
  id: string;
  content: string;
  fromMe: boolean;
  timestamp: string;
  type: 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT' | 'LOCATION' | 'CONTACT';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'ERROR';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useWhatsApp() {
  const [connections, setConnections] = useState<WhatsAppConnection[]>([]);
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = (): HeadersInit => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token
      ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
  };

  // Buscar conexões
  const fetchConnections = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/connections`, {
        headers: authHeaders(),
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar conexões');
      }

      const data = await response.json();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar nova conexão
  const createConnection = useCallback(async (name: string): Promise<WhatsAppConnection | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/connections`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar conexão');
      }

      const newConnection = await response.json();
      setConnections(prev => [newConnection, ...prev]);
      return newConnection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Conectar WhatsApp
  const connectWhatsApp = useCallback(async (connectionId: string): Promise<{ qrCode?: string; status: string } | null> => {
    console.log('🔍 [DEBUG] connectWhatsApp chamado com connectionId:', connectionId);
    setLoading(true);
    setError(null);
    
    try {
      const url = `${API_BASE_URL}/whatsapp/connections/${connectionId}/connect`;
      console.log('🔍 [DEBUG] Fazendo requisição para:', url);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s para aguardar QR
      
      const response = await fetch(url, {
        method: 'POST',
        headers: authHeaders(),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('🔍 [DEBUG] Response status:', response.status);
      console.log('🔍 [DEBUG] Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('🔍 [DEBUG] Erro na resposta:', errorData);
        throw new Error(errorData.message || 'Erro ao conectar WhatsApp');
      }

      const result = await response.json();
      console.log('🔍 [DEBUG] Resultado da conexão:', result);
      
      // Atualizar status da conexão
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: result.status, qrCode: result.qrCode }
            : conn
        )
      );

      return result;
    } catch (err: any) {
      console.log('🔍 [DEBUG] Erro capturado:', err);
      
      if (err.name === 'AbortError') {
        setError('Timeout: O WhatsApp está demorando para emitir o QR. Tente novamente.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Desconectar WhatsApp
  const disconnectWhatsApp = useCallback(async (connectionId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/whatsapp/connections/${connectionId}/connect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao desconectar WhatsApp');
      }

      // Atualizar status da conexão
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: 'DISCONNECTED', qrCode: undefined }
            : conn
        )
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar chats de uma conexão
  const fetchChats = useCallback(async (connectionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/whatsapp/connections/${connectionId}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar chats');
      }

      const data = await response.json();
      setChats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar mensagens de um chat
  const fetchMessages = useCallback(async (chatId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/whatsapp/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar mensagens');
      }

      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Enviar mensagem
  const sendMessage = useCallback(async (chatId: string, content: string): Promise<WhatsAppMessage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/whatsapp/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem');
      }

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar status da conexão
  const checkConnectionStatus = useCallback(async (connectionId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/whatsapp/connections/${connectionId}/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar status');
      }

      const status = await response.json();
      
      // Atualizar status da conexão
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, status: status.status, lastSeen: status.lastSeen }
            : conn
        )
      );

      return status;
    } catch (err) {
      console.error('Erro ao verificar status:', err);
      return null;
    }
  }, []);

  return {
    connections,
    chats,
    messages,
    loading,
    error,
    fetchConnections,
    createConnection,
    connectWhatsApp,
    disconnectWhatsApp,
    fetchChats,
    fetchMessages,
    sendMessage,
    checkConnectionStatus,
  };
}
