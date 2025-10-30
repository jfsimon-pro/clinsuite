export interface FunnelTemplate {
  name: string;
  description: string;
  steps: StepTemplate[];
}

export interface StepTemplate {
  name: string;
  tipoEtapa: string;
  tipoConceitual: string; // Campo principal para relatórios universais
  metaConversao?: number;
  tempoMedioEtapa?: number;
  valorMedioEtapa?: number;
  corEtapa?: string;
  iconEtapa?: string;
}

export const FUNNEL_TEMPLATES_HIBRIDO: FunnelTemplate[] = [
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
        tipoConceitual: "APRESENTACAO", // Agendamento faz parte da apresentação
        metaConversao: 75,
        tempoMedioEtapa: 5,
        corEtapa: "#8B5CF6",
        iconEtapa: "📅"
      },
      {
        name: "Consulta Realizada",
        tipoEtapa: "ATENDIMENTO",
        tipoConceitual: "APRESENTACAO", // Consulta é apresentação
        metaConversao: 65,
        tempoMedioEtapa: 7,
        valorMedioEtapa: 2500,
        corEtapa: "#EC4899",
        iconEtapa: "🦷"
      },
      {
        name: "Orçamento Enviado",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA", // Orçamento é proposta
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
        tipoConceitual: "APRESENTACAO", // Documentação é parte da apresentação
        metaConversao: 70,
        tempoMedioEtapa: 7,
        valorMedioEtapa: 6000,
        corEtapa: "#A855F7",
        iconEtapa: "📋"
      },
      {
        name: "Plano de Tratamento",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA", // Plano é proposta
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
        tipoConceitual: "APRESENTACAO", // Avaliação é apresentação
        metaConversao: 75,
        tempoMedioEtapa: 5,
        valorMedioEtapa: 4000,
        corEtapa: "#EA580C",
        iconEtapa: "🔬"
      },
      {
        name: "Planejamento 3D",
        tipoEtapa: "ORCAMENTO",
        tipoConceitual: "PROPOSTA", // Planejamento é proposta
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
        tipoConceitual: "APRESENTACAO", // Simulação é apresentação
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

// Mapeamento conceitual para facilitar relatórios
export const MAPEAMENTO_CONCEITUAL = {
  CAPTACAO: {
    nome: "Captação",
    descricao: "Geração inicial de leads",
    cor: "#3B82F6",
    icone: "🎯",
    exemplos: ["Novo Contato", "WhatsApp Inicial", "Lead Site", "Interesse Estético"]
  },
  QUALIFICACAO: {
    nome: "Qualificação",
    descricao: "Validação de interesse e necessidade",
    cor: "#10B981",
    icone: "🔍",
    exemplos: ["Primeiro Contato", "Triagem", "Avaliação Inicial", "Interesse Demonstrado"]
  },
  APRESENTACAO: {
    nome: "Apresentação",
    descricao: "Consultas, avaliações e demonstrações",
    cor: "#F59E0B",
    icone: "🦷",
    exemplos: ["Consulta Realizada", "Documentação", "Avaliação Óssea", "Simulação Digital"]
  },
  PROPOSTA: {
    nome: "Proposta",
    descricao: "Orçamentos e planos de tratamento",
    cor: "#F97316",
    icone: "💰",
    exemplos: ["Orçamento Enviado", "Plano de Tratamento", "Planejamento 3D", "Proposta Personalizada"]
  },
  NEGOCIACAO: {
    nome: "Negociação",
    descricao: "Discussão de valores e condições",
    cor: "#EF4444",
    icone: "🤝",
    exemplos: ["Negociação", "Aprovação dos Responsáveis", "Aprovação Financeira", "Aprovação do Tratamento"]
  },
  FECHAMENTO: {
    nome: "Fechamento",
    descricao: "Decisão final e início do tratamento",
    cor: "#22C55E",
    icone: "✅",
    exemplos: ["Fechado - Ganho", "Contrato Assinado", "Cirurgia Agendada", "Início do Tratamento"]
  }
};