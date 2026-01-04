'use client';

import { useState } from 'react';
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Plus,
  Copy,
  Trash2,
  Upload,
  CheckCircle,
  MessageSquare,
  Lock
} from 'lucide-react';
import './whatsapp-official.css';

interface Message {
  id: string;
  sender: 'user' | 'contact';
  text: string;
  timestamp: Date;
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'rejected';
  requiresApproval?: boolean;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
  status: 'online' | 'offline' | 'away';
}

interface ApprovedTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  approvedDate: Date;
  status: 'approved' | 'pending' | 'rejected';
}

const mockApprovedTemplates: ApprovedTemplate[] = [
  {
    id: '1',
    name: 'Confirmação de Agendamento',
    content: 'Olá {{name}}, sua consulta foi confirmada para {{date}} às {{time}}. Nos vemos em breve! 😊',
    category: 'Agendamento',
    approvedDate: new Date(Date.now() - 30 * 24 * 3600000),
    status: 'approved'
  },
  {
    id: '2',
    name: 'Lembrete de Consulta',
    content: 'Oi {{name}}, é um lembrete da sua consulta amanhã às {{time}}. Chegue 10 minutos antes!',
    category: 'Lembrete',
    approvedDate: new Date(Date.now() - 20 * 24 * 3600000),
    status: 'approved'
  },
  {
    id: '3',
    name: 'Pós-Consulta',
    content: 'Obrigado pela visita, {{name}}! Segue as instruções: {{instructions}}. Qualquer dúvida, nos contacte!',
    category: 'Acompanhamento',
    approvedDate: new Date(Date.now() - 15 * 24 * 3600000),
    status: 'approved'
  },
  {
    id: '4',
    name: 'Promoção Limpeza',
    content: '🎉 Limpeza completa com 20% OFF! Aproveite: {{promo_code}}. Agende agora pelo link: {{link}}',
    category: 'Promoção',
    approvedDate: new Date(Date.now() - 10 * 24 * 3600000),
    status: 'approved'
  },
  {
    id: '5',
    name: 'Boas-vindas',
    content: 'Bem-vindo à Clínica Ianara Pinho! 👋 Estamos felizes em tê-lo conosco. Como podemos ajudá-lo?',
    category: 'Boas-vindas',
    approvedDate: new Date(Date.now() - 7 * 24 * 3600000),
    status: 'approved'
  },
  {
    id: '6',
    name: 'Recebimento de Pagamento',
    content: 'Seu pagamento de R$ {{amount}} foi recebido com sucesso! Referência: {{ref}}. Obrigado!',
    category: 'Pagamento',
    approvedDate: new Date(Date.now() - 5 * 24 * 3600000),
    status: 'approved'
  }
];

const mockChats: Chat[] = [
  {
    id: '1',
    name: 'João Silva',
    avatar: 'JS',
    lastMessage: 'Ótimo, obrigado!',
    timestamp: new Date(Date.now() - 5 * 60000),
    unread: 2,
    status: 'online'
  },
  {
    id: '2',
    name: 'Maria Santos',
    avatar: 'MS',
    lastMessage: 'Podemos marcar para próxima semana?',
    timestamp: new Date(Date.now() - 2 * 60000),
    unread: 0,
    status: 'offline'
  },
  {
    id: '3',
    name: 'Carlos Mendes',
    avatar: 'CM',
    lastMessage: 'Sim, tudo bem!',
    timestamp: new Date(Date.now() - 15 * 60000),
    unread: 1,
    status: 'away'
  },
  {
    id: '4',
    name: 'Ana Costa',
    avatar: 'AC',
    lastMessage: 'Excelente, muito obrigado',
    timestamp: new Date(Date.now() - 1 * 3600000),
    unread: 0,
    status: 'online'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: 'contact',
    text: 'Olá! Tudo bem?',
    timestamp: new Date(Date.now() - 30 * 60000),
    status: 'read'
  },
  {
    id: '2',
    sender: 'user',
    text: 'Oi! Tudo certo por aqui! Como posso ajudar?',
    timestamp: new Date(Date.now() - 28 * 60000),
    status: 'read'
  },
  {
    id: '3',
    sender: 'contact',
    text: 'Gostaria de saber mais sobre os serviços de limpeza',
    timestamp: new Date(Date.now() - 25 * 60000),
    status: 'read'
  },
  {
    id: '4',
    sender: 'user',
    text: 'Claro! Oferecemos diferentes pacotes. Qual seu interesse?',
    timestamp: new Date(Date.now() - 20 * 60000),
    status: 'read'
  },
  {
    id: '5',
    sender: 'contact',
    text: 'Qual é o preço da limpeza completa?',
    timestamp: new Date(Date.now() - 15 * 60000),
    status: 'read'
  },
  {
    id: '6',
    sender: 'user',
    text: 'A limpeza completa custa R$ 150. Inclui limpeza profunda, polimento e aplicação de flúor.',
    timestamp: new Date(Date.now() - 10 * 60000),
    status: 'delivered',
    requiresApproval: true
  },
  {
    id: '7',
    sender: 'contact',
    text: 'Ótimo! Vou pensar e entro em contato',
    timestamp: new Date(Date.now() - 5 * 60000),
    status: 'read'
  }
];

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
}

function StatusIcon({ status }: { status?: string }) {
  switch (status) {
    case 'pending':
      return <Clock size={14} className="status-pending" title="Pendente" />;
    case 'sent':
      return <Check size={14} className="status-sent" title="Enviado" />;
    case 'delivered':
      return <CheckCheck size={14} className="status-delivered" title="Entregue" />;
    case 'read':
      return <CheckCheck size={14} className="status-read" title="Lido" />;
    case 'rejected':
      return <AlertCircle size={14} className="status-rejected" title="Rejeitado" />;
    default:
      return null;
  }
}

export default function WhatsappOfficialPage() {
  const [activeTab, setActiveTab] = useState<'conversas' | 'templates'>('conversas');
  const [selectedChat, setSelectedChat] = useState<string>('1');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateText, setTemplateText] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState('Geral');
  const [approvedTemplates, setApprovedTemplates] = useState<ApprovedTemplate[]>(mockApprovedTemplates);
  const [pendingTemplates, setPendingTemplates] = useState<ApprovedTemplate[]>([]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: messageText,
      timestamp: new Date(),
      status: 'pending',
      requiresApproval: true
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handleApproveMessage = (messageId: string) => {
    setMessages(messages.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'sent' as const, requiresApproval: false }
        : msg
    ));
  };

  const handleRejectMessage = (messageId: string) => {
    setMessages(messages.map(msg =>
      msg.id === messageId
        ? { ...msg, status: 'rejected' as const, requiresApproval: false }
        : msg
    ));
  };

  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateText.trim() || !templateName.trim()) return;

    const newTemplate: ApprovedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      content: templateText,
      category: templateCategory,
      approvedDate: new Date(),
      status: 'pending'
    };

    setPendingTemplates([...pendingTemplates, newTemplate]);
    setTemplateName('');
    setTemplateText('');
    setTemplateCategory('Geral');
  };

  const handleApproveTemplate = (templateId: string) => {
    const template = pendingTemplates.find(t => t.id === templateId);
    if (template) {
      setApprovedTemplates([...approvedTemplates, { ...template, status: 'approved' }]);
      setPendingTemplates(pendingTemplates.filter(t => t.id !== templateId));
    }
  };

  const handleRejectTemplate = (templateId: string) => {
    setPendingTemplates(pendingTemplates.filter(t => t.id !== templateId));
  };

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setApprovedTemplates(approvedTemplates.filter(t => t.id !== templateId));
  };

  const filteredChats = mockChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentChat = mockChats.find(c => c.id === selectedChat);

  return (
    <div className="whatsapp-official-main relative group">
      {/* Tabs Navigation */}
      <div className="tabs-navigation">
        <button
          className={`tab-button ${activeTab === 'conversas' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversas')}
        >
          <MessageSquare size={18} />
          Conversas
        </button>
        <button
          className={`tab-button ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <CheckCircle size={18} />
          Mensagens Aprovadas
          {pendingTemplates.length > 0 && (
            <span className="badge-count">{pendingTemplates.length}</span>
          )}
        </button>
      </div>

      {/* Conversas Tab */}
      {activeTab === 'conversas' && (
        <div className="whatsapp-official-container">
          {/* Sidebar de Chats */}
          <div className="whatsapp-sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Mensagens</h2>
              <button className="btn-new-chat" title="Nova conversa">
                <Plus size={20} />
              </button>
            </div>

            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Pesquisar conversa..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="chats-list">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${selectedChat === chat.id ? 'active' : ''}`}
                  onClick={() => setSelectedChat(chat.id)}
                >
                  <div className="chat-avatar">
                    {chat.avatar}
                    <span className={`status-dot ${chat.status}`} />
                  </div>
                  <div className="chat-info">
                    <div className="chat-header">
                      <span className="chat-name">{chat.name}</span>
                      <span className="chat-time">{formatDate(chat.timestamp)}</span>
                    </div>
                    <div className="chat-preview">
                      <p className="preview-text">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="unread-badge">{chat.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área de Conversa */}
          <div className="whatsapp-chat">
            {currentChat && (
              <>
                {/* Chat Header */}
                <div className="chat-header-top">
                  <div className="chat-header-left">
                    <div className="chat-avatar-header">
                      {currentChat.avatar}
                      <span className={`status-dot ${currentChat.status}`} />
                    </div>
                    <div className="chat-header-info">
                      <h3 className="chat-header-name">{currentChat.name}</h3>
                      <p className={`chat-header-status ${currentChat.status}`}>
                        {currentChat.status === 'online'
                          ? 'Online agora'
                          : currentChat.status === 'away'
                            ? 'Ativo(a) agora'
                            : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="chat-header-actions">
                    <button className="header-action-btn" title="Chamada de voz">
                      <Phone size={20} />
                    </button>
                    <button className="header-action-btn" title="Videochamada">
                      <Video size={20} />
                    </button>
                    <button className="header-action-btn" title="Mais opções">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="messages-container">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message-wrapper ${msg.sender === 'user' ? 'sent' : 'received'}`}
                    >
                      <div className={`message ${msg.sender === 'user' ? 'user-message' : 'contact-message'}`}>
                        <p className="message-text">{msg.text}</p>
                        {msg.requiresApproval && msg.sender === 'user' && (
                          <div className="approval-actions">
                            <button
                              className="btn-approve"
                              onClick={() => handleApproveMessage(msg.id)}
                              title="Aprovar mensagem"
                            >
                              Aprovar
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRejectMessage(msg.id)}
                              title="Rejeitar mensagem"
                            >
                              Rejeitar
                            </button>
                          </div>
                        )}
                        <div className="message-footer">
                          <span className="message-time">{formatTime(msg.timestamp)}</span>
                          {msg.sender === 'user' && <StatusIcon status={msg.status} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <form className="message-input-container" onSubmit={handleSendMessage}>
                  <button type="button" className="input-action-btn" title="Anexar arquivo">
                    <Paperclip size={20} />
                  </button>
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    className="message-input"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <button type="button" className="input-action-btn" title="Emoji">
                    <Smile size={20} />
                  </button>
                  <button
                    type="submit"
                    className="btn-send"
                    disabled={!messageText.trim()}
                    title="Enviar mensagem"
                  >
                    <Send size={20} />
                  </button>
                </form>

                {/* Info Box - Envio para Aprovação */}
                <div className="approval-info-box">
                  <AlertCircle size={16} />
                  <p>
                    As mensagens aguardando aprovação devem ser revisadas pelo Meta antes de serem enviadas.
                    Clique em "Aprovar" para enviar ou "Rejeitar" para descartar.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="templates-section">
          <div className="templates-container">
            {/* Coluna 1: Formulário para enviar templates */}
            <div className="templates-form-column">
              <div className="form-header">
                <h3>Enviar Mensagem para Aprovação</h3>
              </div>

              <form onSubmit={handleSubmitTemplate} className="template-form">
                <div className="form-group">
                  <label htmlFor="templateName">Nome do Template</label>
                  <input
                    id="templateName"
                    type="text"
                    placeholder="Ex: Confirmação de Agendamento"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="templateCategory">Categoria</label>
                  <select
                    id="templateCategory"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                    className="form-select"
                  >
                    <option>Geral</option>
                    <option>Agendamento</option>
                    <option>Lembrete</option>
                    <option>Acompanhamento</option>
                    <option>Promoção</option>
                    <option>Boas-vindas</option>
                    <option>Pagamento</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="templateText">Conteúdo da Mensagem</label>
                  <textarea
                    id="templateText"
                    placeholder="Digite a mensagem. Use {{variavel}} para variáveis dinâmicas"
                    value={templateText}
                    onChange={(e) => setTemplateText(e.target.value)}
                    className="form-textarea"
                    rows={6}
                  />
                  <small className="form-hint">
                    Use {`{{name}}`}, {`{{date}}`}, {`{{time}}`}, {`{{link}}`}, etc para variáveis
                  </small>
                </div>

                <button type="submit" className="btn-submit-template">
                  <Upload size={16} />
                  Enviar para Aprovação
                </button>
              </form>

              {/* Mensagens Pendentes */}
              {pendingTemplates.length > 0 && (
                <div className="pending-section">
                  <h4>Aguardando Aprovação ({pendingTemplates.length})</h4>
                  <div className="templates-list">
                    {pendingTemplates.map((template) => (
                      <div key={template.id} className="template-card pending">
                        <div className="template-card-header">
                          <div>
                            <h5 className="template-name">{template.name}</h5>
                            <span className="template-category">{template.category}</span>
                          </div>
                          <span className="status-badge pending">Pendente</span>
                        </div>
                        <p className="template-content">{template.content}</p>
                        <div className="template-actions">
                          <button
                            className="btn-action approve"
                            onClick={() => handleApproveTemplate(template.id)}
                            title="Aprovar"
                          >
                            <Check size={14} /> Aprovar
                          </button>
                          <button
                            className="btn-action reject"
                            onClick={() => handleRejectTemplate(template.id)}
                            title="Rejeitar"
                          >
                            <Trash2 size={14} /> Rejeitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Coluna 2: Mensagens Aprovadas */}
            <div className="approved-templates-column">
              <div className="approved-header">
                <h3>Mensagens Aprovadas pelo Meta</h3>
                <span className="count-badge">{approvedTemplates.length}</span>
              </div>

              <div className="approved-templates-list">
                {approvedTemplates.length === 0 ? (
                  <div className="empty-state">
                    <CheckCircle size={48} />
                    <p>Nenhuma mensagem aprovada ainda</p>
                  </div>
                ) : (
                  approvedTemplates.map((template) => (
                    <div key={template.id} className="approved-template-card">
                      <div className="card-header">
                        <div className="header-info">
                          <h5 className="template-name">{template.name}</h5>
                          <div className="card-meta">
                            <span className="category-tag">{template.category}</span>
                            <span className="date-tag">
                              {template.approvedDate.toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                        <span className="status-badge approved">
                          <CheckCircle size={14} /> Aprovado
                        </span>
                      </div>

                      <div className="card-content">
                        <p className="content-text">{template.content}</p>
                      </div>

                      <div className="card-actions">
                        <button
                          className="btn-card-action copy"
                          onClick={() => handleCopyTemplate(template.content)}
                          title="Copiar"
                        >
                          <Copy size={14} /> Copiar
                        </button>
                        <button
                          className="btn-card-action delete"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Deletar"
                        >
                          <Trash2 size={14} /> Deletar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
