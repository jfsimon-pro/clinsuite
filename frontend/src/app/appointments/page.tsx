'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Calendar, Clock, User, Phone, DollarSign, X, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Configurar localização para português
const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Patient {
  id: string;
  name: string;
  phone: string;
  statusVenda: string;
  valorOrcamento: number | null;
  dataConsulta: string | null;
  duracaoConsulta: number | null;
  tipoProcura: string | null;
  observacoes: string | null;
  funnel: {
    name: string;
  };
  step: {
    name: string;
  };
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Patient;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);

      if (userData.role !== 'DENTIST') {
        router.push('/dashboard');
        return;
      }
    } else {
      router.push('/login');
      return;
    }

    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/crm/leads/my-patients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      } else {
        console.error('Erro ao buscar pacientes');
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Converter pacientes com consulta em eventos do calendário
  const events: CalendarEvent[] = useMemo(() => {
    return patients
      .filter(patient => patient.dataConsulta)
      .map(patient => {
        const start = new Date(patient.dataConsulta!);
        const duracao = patient.duracaoConsulta || 60; // Padrão 60 minutos
        const end = new Date(start.getTime() + duracao * 60000); // Adicionar duração em milissegundos

        return {
          id: patient.id,
          title: patient.name || 'Sem nome',
          start,
          end,
          resource: patient,
        };
      });
  }, [patients]);

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDateTime = (date: Date) => {
    return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'QUALIFICANDO': 'bg-blue-500',
      'INTERESSE_DEMONSTRADO': 'bg-purple-500',
      'CONSULTA_AGENDADA': 'bg-yellow-500',
      'CONSULTA_REALIZADA': 'bg-green-500',
      'ORCAMENTO_ENVIADO': 'bg-indigo-500',
      'NEGOCIACAO': 'bg-orange-500',
      'GANHO': 'bg-green-600',
      'PERDIDO': 'bg-red-500',
      'PAUSADO': 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'QUALIFICANDO': 'Qualificando',
      'INTERESSE_DEMONSTRADO': 'Interesse Demonstrado',
      'CONSULTA_AGENDADA': 'Consulta Agendada',
      'CONSULTA_REALIZADA': 'Consulta Realizada',
      'ORCAMENTO_ENVIADO': 'Orçamento Enviado',
      'NEGOCIACAO': 'Negociação',
      'GANHO': 'Ganho',
      'PERDIDO': 'Perdido',
      'PAUSADO': 'Pausado',
    };
    return labels[status] || status;
  };

  // Customizar estilo dos eventos
  const eventStyleGetter = (event: CalendarEvent) => {
    const status = event.resource.statusVenda;
    const backgroundColor = getStatusColor(status).replace('bg-', '');

    const colorMap: Record<string, string> = {
      'blue-500': '#3b82f6',
      'purple-500': '#a855f7',
      'yellow-500': '#eab308',
      'green-500': '#22c55e',
      'indigo-500': '#6366f1',
      'orange-500': '#f97316',
      'green-600': '#16a34a',
      'red-500': '#ef4444',
      'gray-500': '#6b7280',
    };

    return {
      style: {
        backgroundColor: colorMap[backgroundColor] || '#6b7280',
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
      },
    };
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  // Estatísticas rápidas
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const consultasHoje = events.filter(event => {
      const eventDate = new Date(event.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;

    const consultasEstaSemana = events.filter(event => {
      const eventDate = new Date(event.start);
      const weekStart = startOfWeek(today, { locale: ptBR });
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return eventDate >= weekStart && eventDate < weekEnd;
    }).length;

    return {
      total: events.length,
      hoje: consultasHoje,
      semana: consultasEstaSemana,
    };
  }, [events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Agenda</h1>
              <p className="text-gray-600">
                Gerencie suas consultas e compromissos
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium mb-1">Consultas Hoje</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.hoje}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium mb-1">Esta Semana</p>
                  <p className="text-3xl font-bold text-green-900">{stats.semana}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium mb-1">Total Agendadas</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.total}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <style jsx global>{`
            .rbc-calendar {
              color: #000;
              font-family: inherit;
            }

            .rbc-header {
              padding: 12px 4px;
              font-weight: 600;
              font-size: 14px;
              color: #4b5563;
              border-bottom: 1px solid #e5e7eb;
              background: #f9fafb;
            }

            .rbc-month-view {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              background: #fff;
            }

            .rbc-month-row {
              border-color: #e5e7eb;
            }

            .rbc-day-bg {
              border-color: #e5e7eb;
            }

            .rbc-today {
              background-color: rgba(59, 130, 246, 0.05);
            }

            .rbc-off-range-bg {
              background-color: #f9fafb;
            }

            .rbc-date-cell {
              padding: 8px;
              text-align: right;
            }

            .rbc-date-cell > a {
              color: #374151;
              font-weight: 500;
            }

            .rbc-off-range {
              color: #d1d5db;
            }

            .rbc-event {
              padding: 4px 6px;
              cursor: pointer;
            }

            .rbc-event:hover {
              opacity: 1 !important;
            }

            .rbc-toolbar {
              padding: 16px 0;
              margin-bottom: 20px;
              gap: 12px;
              flex-wrap: wrap;
            }

            .rbc-toolbar button {
              color: #374151;
              border: 1px solid #d1d5db;
              background: #fff;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: 500;
              transition: all 0.2s;
            }

            .rbc-toolbar button:hover {
              background: #f3f4f6;
              border-color: #9ca3af;
            }

            .rbc-toolbar button.rbc-active {
              background: #3b82f6;
              border-color: #3b82f6;
              color: white;
            }

            .rbc-toolbar-label {
              font-weight: 700;
              font-size: 18px;
              color: #1f2937;
              text-transform: capitalize;
            }

            .rbc-time-view {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }

            .rbc-time-header {
              border-bottom: 1px solid #e5e7eb;
            }

            .rbc-time-content {
              border-top: 1px solid #e5e7eb;
            }

            .rbc-timeslot-group {
              border-left: 1px solid #e5e7eb;
            }

            .rbc-time-slot {
              border-top: 1px solid #f3f4f6;
            }

            .rbc-current-time-indicator {
              background-color: #ef4444;
              height: 2px;
            }

            .rbc-agenda-view {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }

            .rbc-agenda-table {
              border: none;
            }

            .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
              padding: 12px;
              border-color: #e5e7eb;
              color: #374151;
            }

            .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
              padding: 12px;
              border-color: #e5e7eb;
              background: #f9fafb;
              color: #6b7280;
              font-weight: 600;
            }
          `}</style>

          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            culture="pt-BR"
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => setSelectedEvent(event)}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              date: 'Data',
              time: 'Hora',
              event: 'Consulta',
              noEventsInRange: 'Não há consultas agendadas neste período.',
              showMore: (total) => `+ ${total} mais`,
            }}
          />
        </div>

        {/* Lista de próximas consultas */}
        {events.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Consultas</h2>
            <div className="grid gap-3">
              {events
                .filter(event => event.start >= new Date())
                .sort((a, b) => a.start.getTime() - b.start.getTime())
                .slice(0, 5)
                .map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-semibold mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDateTime(event.start)}</span>
                          </div>
                          {event.resource.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{event.resource.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(event.resource.statusVenda)} text-white`}>
                        {getStatusLabel(event.resource.statusVenda)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes da Consulta */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header do Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEvent.resource.name || 'Sem nome'}
                </h2>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{formatDateTime(selectedEvent.start)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(selectedEvent.resource.statusVenda)} text-white`}>
                  {getStatusLabel(selectedEvent.resource.statusVenda)}
                </span>
              </div>

              {/* Grid de Informações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telefone */}
                {selectedEvent.resource.phone && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-medium text-gray-600">Telefone</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {selectedEvent.resource.phone}
                    </div>
                  </div>
                )}

                {/* Procedimento */}
                {selectedEvent.resource.tipoProcura && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-gray-600">Procedimento</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {selectedEvent.resource.tipoProcura}
                    </div>
                  </div>
                )}

                {/* Orçamento */}
                {selectedEvent.resource.valorOrcamento && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-medium text-gray-600">Orçamento</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {formatCurrency(selectedEvent.resource.valorOrcamento)}
                    </div>
                  </div>
                )}

                {/* Funil/Etapa */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-medium text-gray-600">Pipeline</span>
                  </div>
                  <div className="text-sm text-gray-900 font-medium">
                    {selectedEvent.resource.funnel.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {selectedEvent.resource.step.name}
                  </div>
                </div>
              </div>

              {/* Observações */}
              {selectedEvent.resource.observacoes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-gray-600 mb-2">Observações</div>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {selectedEvent.resource.observacoes}
                  </div>
                </div>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
