import { IsString, IsOptional, IsDecimal, IsDateString, IsEnum, IsUUID, IsInt, Min, Max, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoProcura {
  ORTODONTIA = 'ORTODONTIA',
  IMPLANTE = 'IMPLANTE',
  ESTETICA = 'ESTETICA',
  LIMPEZA = 'LIMPEZA',
  CANAL = 'CANAL',
  EXTRACAO = 'EXTRACAO',
  PROTESE = 'PROTESE',
  CLAREAMENTO = 'CLAREAMENTO',
  OUTROS = 'OUTROS',
}

export enum MeioCaptacao {
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  GOOGLE_ADS = 'GOOGLE_ADS',
  INDICACAO = 'INDICACAO',
  SITE = 'SITE',
  TELEFONE = 'TELEFONE',
  PRESENCIAL = 'PRESENCIAL',
  OUTROS = 'OUTROS',
}

export enum CloserNegociacao {
  IANARA = 'IANARA',
  FUNCIONARIO_1 = 'FUNCIONARIO_1',
  FUNCIONARIO_2 = 'FUNCIONARIO_2',
  FUNCIONARIO_3 = 'FUNCIONARIO_3',
  OUTROS = 'OUTROS',
}

export enum CloserFollow {
  IANARA = 'IANARA',
  FUNCIONARIO_1 = 'FUNCIONARIO_1',
  FUNCIONARIO_2 = 'FUNCIONARIO_2',
  FUNCIONARIO_3 = 'FUNCIONARIO_3',
  OUTROS = 'OUTROS',
}

export enum Dentista {
  IANARA = 'IANARA',
  DENTISTA_1 = 'DENTISTA_1',
  DENTISTA_2 = 'DENTISTA_2',
  DENTISTA_3 = 'DENTISTA_3',
  OUTROS = 'OUTROS',
}

export enum MotivoPerda {
  PRECO = 'PRECO',
  TEMPO = 'TEMPO',
  LOCALIZACAO = 'LOCALIZACAO',
  CONFIANCA = 'CONFIANCA',
  CONCORRENCIA = 'CONCORRENCIA',
  NAO_INTERESSADO = 'NAO_INTERESSADO',
  NAO_RESPONDEU = 'NAO_RESPONDEU',
  OUTROS = 'OUTROS',
}

export enum DentistaParticipou {
  SIM = 'SIM',
  NAO = 'NAO',
}

export enum Objecao {
  PRECO_ALTO = 'PRECO_ALTO',
  TEMPO_TRATAMENTO = 'TEMPO_TRATAMENTO',
  DOR_MEDO = 'DOR_MEDO',
  SEGUNDA_OPINIAO = 'SEGUNDA_OPINIAO',
  PENSANDO = 'PENSANDO',
  CONVERSAR_FAMILIA = 'CONVERSAR_FAMILIA',
  CONDICOES_PAGAMENTO = 'CONDICOES_PAGAMENTO',
  OUTROS = 'OUTROS',
}

// NOVOS ENUMS PARA ANALYTICS
export enum StatusVenda {
  QUALIFICANDO = 'QUALIFICANDO',
  INTERESSE_DEMONSTRADO = 'INTERESSE_DEMONSTRADO',
  CONSULTA_AGENDADA = 'CONSULTA_AGENDADA',
  CONSULTA_REALIZADA = 'CONSULTA_REALIZADA',
  ORCAMENTO_ENVIADO = 'ORCAMENTO_ENVIADO',
  NEGOCIACAO = 'NEGOCIACAO',
  GANHO = 'GANHO',
  PERDIDO = 'PERDIDO',
  PAUSADO = 'PAUSADO',
}

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

export class CreateLeadDto {
  @IsString()
  phone: string; // OBRIGATÓRIO

  @IsUUID()
  funnelId: string; // OBRIGATÓRIO

  @IsUUID()
  stepId: string; // OBRIGATÓRIO

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  responsibleId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  dentistaId?: string;

  @IsOptional()
  @IsDecimal()
  valorVenda?: number;

  @IsOptional()
  @IsDateString()
  dataConsulta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(300)
  duracaoConsulta?: number; // Duração da consulta em minutos

  @IsOptional()
  @IsEnum(TipoProcura)
  tipoProcura?: TipoProcura;

  @IsOptional()
  @IsEnum(MeioCaptacao)
  meioCaptacao?: MeioCaptacao;

  @IsOptional()
  @IsEnum(CloserNegociacao)
  closerNegociacao?: CloserNegociacao;

  @IsOptional()
  @IsEnum(CloserFollow)
  closerFollow?: CloserFollow;

  @IsOptional()
  @IsEnum(Dentista)
  dentista?: Dentista;

  @IsOptional()
  @IsEnum(MotivoPerda)
  motivoPerda?: MotivoPerda;

  @IsOptional()
  @IsEnum(DentistaParticipou)
  dentistaParticipou?: DentistaParticipou;

  @IsOptional()
  @IsDateString()
  previsaoFechamento?: string;

  @IsOptional()
  @IsEnum(Objecao)
  objecao?: Objecao;

  @IsOptional()
  @IsString()
  observacoes?: string;

  // NOVOS CAMPOS PARA ANALYTICS
  @IsOptional()
  @IsEnum(StatusVenda)
  statusVenda?: StatusVenda;

  @IsOptional()
  @IsDecimal()
  valorOrcamento?: number;

  @IsOptional()
  @IsDateString()
  dataOrcamento?: string;

  @IsOptional()
  @IsDateString()
  dataFechamento?: string;

  @IsOptional()
  @IsDecimal()
  valorDesconto?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probabilidadeFecho?: number;
}

export class UpdateLeadDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  funnelId?: string;

  @IsOptional()
  @IsUUID()
  stepId?: string;

  @IsOptional()
  @IsUUID()
  responsibleId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUUID()
  dentistaId?: string;

  @IsOptional()
  @IsDecimal()
  valorVenda?: number;

  @IsOptional()
  @IsDateString()
  dataConsulta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(15)
  @Max(300)
  duracaoConsulta?: number; // Duração da consulta em minutos

  @IsOptional()
  @IsEnum(TipoProcura)
  tipoProcura?: TipoProcura;

  @IsOptional()
  @IsEnum(MeioCaptacao)
  meioCaptacao?: MeioCaptacao;

  @IsOptional()
  @IsEnum(CloserNegociacao)
  closerNegociacao?: CloserNegociacao;

  @IsOptional()
  @IsEnum(CloserFollow)
  closerFollow?: CloserFollow;

  @IsOptional()
  @IsEnum(Dentista)
  dentista?: Dentista;

  @IsOptional()
  @IsEnum(MotivoPerda)
  motivoPerda?: MotivoPerda;

  @IsOptional()
  @IsEnum(DentistaParticipou)
  dentistaParticipou?: DentistaParticipou;

  @IsOptional()
  @IsDateString()
  previsaoFechamento?: string;

  @IsOptional()
  @IsEnum(Objecao)
  objecao?: Objecao;

  @IsOptional()
  @IsString()
  observacoes?: string;

  // NOVOS CAMPOS PARA ANALYTICS
  @IsOptional()
  @IsEnum(StatusVenda)
  statusVenda?: StatusVenda;

  @IsOptional()
  @IsDecimal()
  valorOrcamento?: number;

  @IsOptional()
  @IsDateString()
  dataOrcamento?: string;

  @IsOptional()
  @IsDateString()
  dataFechamento?: string;

  @IsOptional()
  @IsDecimal()
  valorDesconto?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probabilidadeFecho?: number;
}