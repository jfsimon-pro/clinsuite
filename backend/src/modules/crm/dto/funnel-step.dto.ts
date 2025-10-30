import { IsString, IsOptional, IsDecimal, IsEnum, IsUUID, IsInt, IsNumber } from 'class-validator';

export enum TipoEtapa {
  CAPTACAO = 'CAPTACAO',
  QUALIFICACAO = 'QUALIFICACAO',
  AGENDAMENTO = 'AGENDAMENTO',
  ATENDIMENTO = 'ATENDIMENTO',
  ORCAMENTO = 'ORCAMENTO',
  NEGOCIACAO = 'NEGOCIACAO',
  FECHAMENTO = 'FECHAMENTO',
  POS_VENDA = 'POS_VENDA',
}

export enum TipoEtapaConceitual {
  CAPTACAO = 'CAPTACAO',
  QUALIFICACAO = 'QUALIFICACAO',
  APRESENTACAO = 'APRESENTACAO',
  PROPOSTA = 'PROPOSTA',
  NEGOCIACAO = 'NEGOCIACAO',
  FECHAMENTO = 'FECHAMENTO',
}

export class CreateFunnelStepDto {
  @IsString()
  name: string;

  @IsInt()
  order: number;

  @IsUUID()
  funnelId: string;

  // NOVOS CAMPOS PARA ANALYTICS
  @IsOptional()
  @IsEnum(TipoEtapa)
  tipoEtapa?: TipoEtapa;

  @IsOptional()
  @IsEnum(TipoEtapaConceitual)
  tipoConceitual?: TipoEtapaConceitual;

  @IsOptional()
  @IsNumber()
  metaConversao?: number; // Meta de conversão para próxima etapa (%)

  @IsOptional()
  @IsInt()
  tempoMedioEtapa?: number; // Tempo médio em dias

  @IsOptional()
  @IsDecimal()
  valorMedioEtapa?: number; // Valor médio dos leads nesta etapa

  @IsOptional()
  @IsString()
  corEtapa?: string; // Cor para visualização

  @IsOptional()
  @IsString()
  iconEtapa?: string; // Ícone para visualização
}

export class UpdateFunnelStepDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  order?: number;

  // NOVOS CAMPOS PARA ANALYTICS
  @IsOptional()
  @IsEnum(TipoEtapa)
  tipoEtapa?: TipoEtapa;

  @IsOptional()
  @IsEnum(TipoEtapaConceitual)
  tipoConceitual?: TipoEtapaConceitual;

  @IsOptional()
  @IsNumber()
  metaConversao?: number;

  @IsOptional()
  @IsInt()
  tempoMedioEtapa?: number;

  @IsOptional()
  @IsDecimal()
  valorMedioEtapa?: number;

  @IsOptional()
  @IsString()
  corEtapa?: string;

  @IsOptional()
  @IsString()
  iconEtapa?: string;
}