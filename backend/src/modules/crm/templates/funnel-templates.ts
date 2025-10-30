export interface FunnelTemplate {
  name: string;
  description: string;
  steps: StepTemplate[];
}

export interface StepTemplate {
  name: string;
  tipoEtapa: string;
  tipoConceitual: string; // Novo campo para sistema híbrido
  metaConversao?: number;
  tempoMedioEtapa?: number;
  valorMedioEtapa?: number;
  corEtapa?: string;
  iconEtapa?: string;
}

// Importar os novos templates híbridos
export * from './funnel-templates-updated';

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  // Funil Geral - "Novos Contatos"
  {
    name: "Novos Contatos - Geral",
    description: "Funil padrão para captação e conversão de novos leads",
    steps: [
      {
        name: "Novo Contato",
        tipoEtapa: "CAPTACAO",
        tipoConceitual: "CAPTACAO",
        metaConversao: 80,
        tempoMedioEtapa: 1,
        corEtapa: "#3B82F6",
        iconEtapa: "👋"
      },
      {
        name: "Primeiro Contato",
        tipoEtapa: "QUALIFICACAO",
        tipoConceitual: "QUALIFICACAO",
        metaConversao: 70,
        tempoMedioEtapa: 2,
        corEtapa: "#10B981",
        iconEtapa: "📞"
      },
      {
        name: "Interesse Demonstrado",
        tipoEtapa: "QUALIFICACAO",
        tipoConceitual: "QUALIFICACAO",
        metaConversao: 85,
        tempoMedioEtapa: 3,
        corEtapa: "#F59E0B",
        iconEtapa: "💡"
      },
      {
        name: "Consulta Agendada",
        tipoEtapa: "AGENDAMENTO",
        tipoConceitual: "APRESENTACAO",
        metaConversao: 75,
        tempoMedioEtapa: 5,
        corEtapa: "#8B5CF6",
        iconEtapa: "📅"
      },
      {
        name: "Consulta Realizada",
        tipoEtapa: "ATENDIMENTO",
        tipoConceitual: "APRESENTACAO",
        metaConversao: 65,
        tempoMedioEtapa: 7,
        valorMedioEtapa: 2500,
        corEtapa: "#EC4899",
        iconEtapa: "🦷"
      },
      {
        name: "Orçamento Enviado",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA",
        metaConversao: 45,
        tempoMedioEtapa: 10,
        valorMedioEtapa: 3500,
        corEtapa: "#F97316",
        iconEtapa: "💰"
      },
      {
        name: "Negociação",
        tipoEtapa: "NEGOCIACAO",
        tipoConceitual: "NEGOCIACAO",
        metaConversao: 60,
        tempoMedioEtapa: 15,
        valorMedioEtapa: 3200,
        corEtapa: "#EF4444",
        iconEtapa: "🤝"
      },
      {
        name: "Fechado - Ganho",
        tipoEtapa: "FECHAMENTO",
        tipoConceitual: "FECHAMENTO",
        metaConversao: 100,
        tempoMedioEtapa: 1,
        corEtapa: "#22C55E",
        iconEtapa: "✅"
      }
    ]
  },

  // Funil Ortodontia
  {
    name: "Ortodontia Especializada",
    description: "Funil específico para tratamentos ortodônticos",
    steps: [
      {
        name: "Interesse em Ortodontia",
        tipoEtapa: "CAPTACAO",
        tipoConceitual: "CAPTACAO",
        metaConversao: 75,
        tempoMedioEtapa: 1,
        valorMedioEtapa: 5000,
        corEtapa: "#6366F1",
        iconEtapa: "🦷"
      },
      {
        name: "Avaliação Inicial",
        tipoEtapa: "QUALIFICACAO",
        tipoConceitual: "QUALIFICACAO",
        metaConversao: 80,
        tempoMedioEtapa: 3,
        valorMedioEtapa: 5500,
        corEtapa: "#8B5CF6",
        iconEtapa: "🔍"
      },
      {
        name: "Documentação Ortodôntica",
        tipoEtapa: "ATENDIMENTO",
        tipoConceitual: "APRESENTACAO",
        metaConversao: 70,
        tempoMedioEtapa: 7,
        valorMedioEtapa: 6000,
        corEtapa: "#A855F7",
        iconEtapa: "📋"
      },
      {
        name: "Plano de Tratamento",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA",
        metaConversao: 55,
        tempoMedioEtapa: 10,
        valorMedioEtapa: 6500,
        corEtapa: "#C084FC",
        iconEtapa: "📊"
      },
      {
        name: "Aprovação dos Responsáveis",
        tipoEtapa: "NEGOCIACAO",
        tipoConceitual: "NEGOCIACAO",
        metaConversao: 65,
        tempoMedioEtapa: 14,
        valorMedioEtapa: 6200,
        corEtapa: "#DDD6FE",
        iconEtapa: "👨‍👩‍👧‍👦"
      },
      {
        name: "Contrato Assinado",
        tipoEtapa: "FECHAMENTO",
        tipoConceitual: "FECHAMENTO",
        metaConversao: 100,
        tempoMedioEtapa: 2,
        corEtapa: "#22C55E",
        iconEtapa: "📝"
      }
    ]
  },

  // Funil Implante
  {
    name: "Implantes Dentários",
    description: "Funil especializado para implantes e cirurgias",
    steps: [
      {
        name: "Consulta Implante",
        tipoEtapa: "CAPTACAO",
        tipoConceitual: "CAPTACAO",
        metaConversao: 70,
        tempoMedioEtapa: 2,
        valorMedioEtapa: 3500,
        corEtapa: "#DC2626",
        iconEtapa: "🦴"
      },
      {
        name: "Avaliação Óssea",
        tipoEtapa: "ATENDIMENTO",
        tipoConceitual: "APRESENTACAO",
        metaConversao: 75,
        tempoMedioEtapa: 5,
        valorMedioEtapa: 4000,
        corEtapa: "#EA580C",
        iconEtapa: "🔬"
      },
      {
        name: "Planejamento 3D",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA",
        metaConversao: 60,
        tempoMedioEtapa: 10,
        valorMedioEtapa: 4800,
        corEtapa: "#F97316",
        iconEtapa: "🖥️"
      },
      {
        name: "Aprovação Financeira",
        tipoEtapa: "NEGOCIACAO",
        tipoConceitual: "NEGOCIACAO",
        metaConversao: 50,
        tempoMedioEtapa: 15,
        valorMedioEtapa: 4500,
        corEtapa: "#FBBF24",
        iconEtapa: "💳"
      },
      {
        name: "Cirurgia Agendada",
        tipoEtapa: "FECHAMENTO",
        tipoConceitual: "FECHAMENTO",
        metaConversao: 100,
        tempoMedioEtapa: 3,
        corEtapa: "#22C55E",
        iconEtapa: "🏥"
      }
    ]
  },

  // Funil Estética
  {
    name: "Odontologia Estética",
    description: "Funil para procedimentos estéticos (clareamento, facetas, etc)",
    steps: [
      {
        name: "Interesse Estético",
        tipoEtapa: "CAPTACAO",
        tipoConceitual: "CAPTACAO",
        metaConversao: 85,
        tempoMedioEtapa: 1,
        valorMedioEtapa: 1800,
        corEtapa: "#F472B6",
        iconEtapa: "✨"
      },
      {
        name: "Avaliação do Sorriso",
        tipoEtapa: "QUALIFICACAO",
        tipoConceitual: "QUALIFICACAO",
        metaConversao: 80,
        tempoMedioEtapa: 2,
        valorMedioEtapa: 2200,
        corEtapa: "#EC4899",
        iconEtapa: "😊"
      },
      {
        name: "Simulação Digital",
        tipoEtapa: "ATENDIMENTO",
        tipoConceitual: "APRESENTACAO",
        metaConversao: 75,
        tempoMedioEtapa: 5,
        valorMedioEtapa: 2800,
        corEtapa: "#DB2777",
        iconEtapa: "📱"
      },
      {
        name: "Proposta Personalizada",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA",
        metaConversao: 65,
        tempoMedioEtapa: 7,
        valorMedioEtapa: 3200,
        corEtapa: "#BE185D",
        iconEtapa: "🎨"
      },
      {
        name: "Aprovação do Tratamento",
        tipoEtapa: "NEGOCIACAO",
        tipoConceitual: "NEGOCIACAO",
        metaConversao: 70,
        tempoMedioEtapa: 10,
        valorMedioEtapa: 3000,
        corEtapa: "#9D174D",
        iconEtapa: "👍"
      },
      {
        name: "Início do Tratamento",
        tipoEtapa: "FECHAMENTO",
        tipoConceitual: "FECHAMENTO",
        metaConversao: 100,
        tempoMedioEtapa: 3,
        corEtapa: "#22C55E",
        iconEtapa: "🚀"
      }
    ]
  }
];