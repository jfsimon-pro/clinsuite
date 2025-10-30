import { IsString, IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';

// DTOs para filtros
export class DateRangeDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}

export class DashboardFiltrosDto {
  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  funnelId?: string;

  @IsOptional()
  @IsUUID()
  responsibleId?: string;
}

// DTOs para responses
export interface VendasMetrics {
  receitaTotal: number;
  receitaMes: number;
  receitaMesAnterior: number;
  ticketMedio: number;
  totalLeads: number;
  leadsConvertidos: number;
  leadsEsteMes: number;
  taxaConversao: number;
  tempoMedioFechamento: number; // em dias
  crescimentoReceita: number; // %
}

export interface ConversaoEtapa {
  etapaId: string;
  nome: string;
  ordem: number;
  totalLeads: number;
  valorTotal: number;
  valorMedio: number;
  taxaConversao: number; // % que passa para próxima etapa
  tempoMedio: number; // dias médios na etapa
  cor?: string;
  icone?: string;
}

export interface ConversaoFunil {
  funnelId: string;
  funnelNome: string;
  etapas: ConversaoEtapa[];
  taxaConversaoGeral: number; // % do início ao fim
  valorTotalPipeline: number;
  tempoMedioTotal: number;
}

export interface PipelineValue {
  valorTotal: number;
  valorPorEtapa: {
    etapaId: string;
    etapaNome: string;
    valor: number;
    quantidade: number;
    valorMedio: number;
  }[];
  previsaoMes: number;
  probabilidadeMedia: number;
}

export interface PerformanceUsuario {
  userId: string;
  userName: string;
  leadsAtribuidos: number;
  leadsConvertidos: number;
  taxaConversao: number;
  receitaGerada: number;
  ticketMedio: number;
  tempoMedioResposta: number; // em horas
  tarefasConcluidas: number;
  tarefasVencidas: number;
}

export interface PerformanceEquipe {
  periodo: DateRangeDto;
  usuarios: PerformanceUsuario[];
  totalReceita: number;
  totalLeads: number;
  taxaConversaoMedia: number;
  melhorPerformer: {
    userId: string;
    userName: string;
    metrica: string; // 'conversao' | 'receita' | 'leads'
  };
}

export interface OrigemLeads {
  meio: string;
  totalLeads: number;
  leadsConvertidos: number;
  taxaConversao: number;
  receitaGerada: number;
  custoPorLead?: number;
  roi?: number;
}

export interface AnalyseProcedimentos {
  procedimento: string;
  totalLeads: number;
  leadsConvertidos: number;
  receitaGerada: number;
  ticketMedio: number;
  taxaConversao: number;
  tempoMedioFechamento: number;
}

export interface TaskStats {
  totalTarefas: number;
  tarefasConcluidas: number;
  tarefasVencidas: number;
  tarefasPendentes: number;
  taxaConclusao: number;
  tempoMedioConclusao: number;
  porUsuario: {
    userId: string;
    userName: string;
    concluidas: number;
    vencidas: number;
    pendentes: number;
  }[];
}

export interface DashboardResumo {
  vendas: VendasMetrics;
  pipeline: PipelineValue;
  performance: PerformanceEquipe;
  origens: OrigemLeads[];
  procedimentos: AnalyseProcedimentos[];
  tarefas: TaskStats;
}