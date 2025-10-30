import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  VendasMetrics,
  ConversaoFunil,
  ConversaoEtapa,
  PipelineValue,
  PerformanceEquipe,
  OrigemLeads,
  AnalyseProcedimentos,
  TaskStats,
  DashboardResumo,
  DateRangeDto,
  DashboardFiltrosDto
} from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getVendasMetrics(companyId: string, filtros?: DashboardFiltrosDto): Promise<VendasMetrics> {
    const now = new Date();
    const startDate = filtros?.startDate ? new Date(filtros.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = filtros?.endDate ? new Date(filtros.endDate) : now;

    // Período anterior para comparação
    const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate.getTime() - (diffDays * 24 * 60 * 60 * 1000));
    const previousEndDate = new Date(startDate.getTime() - (24 * 60 * 60 * 1000));

    // Leads convertidos (status GANHO) - usando novos campos
    const leadsConvertidos = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: 'GANHO',
        // Usar dataFechamento se disponível, senão updatedAt
        OR: [
          {
            dataFechamento: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dataFechamento: null,
            statusVenda: 'GANHO',
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
        ...(filtros?.funnelId && { funnelId: filtros.funnelId }),
        ...(filtros?.responsibleId && { responsibleId: filtros.responsibleId }),
      },
      select: {
        valorVenda: true,
        valorOrcamento: true,
        dataFechamento: true,
        createdAt: true,
      },
    });

    // Receita período anterior
    const leadsConvertidosAnterior = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: 'GANHO',
        dataFechamento: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      },
      select: {
        valorVenda: true,
        valorOrcamento: true
      },
    });

    // Total de leads no período
    const totalLeads = await this.prisma.lead.count({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(filtros?.funnelId && { funnelId: filtros.funnelId }),
        ...(filtros?.responsibleId && { responsibleId: filtros.responsibleId }),
      },
    });

    // Leads criados este mês
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const leadsEsteMes = await this.prisma.lead.count({
      where: {
        companyId,
        createdAt: { gte: inicioMes },
      },
    });

    // Cálculos - priorizar valorVenda, fallback para valorOrcamento
    const receitaTotal = leadsConvertidos.reduce((sum, lead) =>
      sum + (Number(lead.valorVenda) || Number(lead.valorOrcamento) || 0), 0);
    const receitaMesAnterior = leadsConvertidosAnterior.reduce((sum, lead) =>
      sum + (Number(lead.valorVenda) || Number(lead.valorOrcamento) || 0), 0);
    const ticketMedio = leadsConvertidos.length > 0 ? receitaTotal / leadsConvertidos.length : 0;
    const taxaConversao = totalLeads > 0 ? (leadsConvertidos.length / totalLeads) * 100 : 0;
    const crescimentoReceita = receitaMesAnterior > 0 ? ((receitaTotal - receitaMesAnterior) / receitaMesAnterior) * 100 : 0;

    // Tempo médio de fechamento
    const temposFechar = leadsConvertidos
      .filter(lead => lead.dataFechamento && lead.createdAt)
      .map(lead => {
        const diff = lead.dataFechamento!.getTime() - lead.createdAt.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24)); // dias
      });
    const tempoMedioFechamento = temposFechar.length > 0
      ? temposFechar.reduce((sum, tempo) => sum + tempo, 0) / temposFechar.length
      : 0;

    return {
      receitaTotal,
      receitaMes: receitaTotal,
      receitaMesAnterior,
      ticketMedio,
      totalLeads,
      leadsConvertidos: leadsConvertidos.length,
      leadsEsteMes,
      taxaConversao,
      tempoMedioFechamento,
      crescimentoReceita,
    };
  }

  async getConversaoFunil(funnelId: string, companyId: string, filtros?: DateRangeDto): Promise<ConversaoFunil> {
    const funnel = await this.prisma.funnel.findFirst({
      where: { id: funnelId, companyId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { leads: true } },
          },
        },
      },
    });

    if (!funnel) {
      throw new Error('Funil não encontrado');
    }

    const etapas: ConversaoEtapa[] = [];
    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const nextStep = funnel.steps[i + 1];

      // Leads na etapa atual
      const leadsEtapa = await this.prisma.lead.findMany({
        where: {
          stepId: step.id,
          companyId,
          ...(filtros && {
            createdAt: {
              gte: new Date(filtros.startDate),
              lte: new Date(filtros.endDate),
            },
          }),
        },
        select: {
          valorOrcamento: true,
          valorVenda: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totalLeads = leadsEtapa.length;
      const valorTotal = leadsEtapa.reduce((sum, lead) =>
        sum + (Number(lead.valorOrcamento) || Number(lead.valorVenda) || 0), 0
      );
      const valorMedio = totalLeads > 0 ? valorTotal / totalLeads : 0;

      // Taxa de conversão para próxima etapa
      let taxaConversao = 0;
      if (nextStep) {
        const leadsProximaEtapa = await this.prisma.lead.count({
          where: {
            stepId: nextStep.id,
            companyId,
            ...(filtros && {
              createdAt: {
                gte: new Date(filtros.startDate),
                lte: new Date(filtros.endDate),
              },
            }),
          },
        });
        taxaConversao = totalLeads > 0 ? (leadsProximaEtapa / totalLeads) * 100 : 0;
      }

      // Tempo médio na etapa
      const temposEtapa = leadsEtapa.map(lead => {
        const diff = lead.updatedAt.getTime() - lead.createdAt.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
      });
      const tempoMedio = temposEtapa.length > 0
        ? temposEtapa.reduce((sum, tempo) => sum + tempo, 0) / temposEtapa.length
        : 0;

      etapas.push({
        etapaId: step.id,
        nome: step.name,
        ordem: step.order,
        totalLeads,
        valorTotal,
        valorMedio,
        taxaConversao,
        tempoMedio,
        cor: step.corEtapa || undefined,
        icone: step.iconEtapa || undefined,
      });
    }

    // Taxa de conversão geral (primeira para última etapa)
    const primeiraEtapa = etapas[0];
    const ultimaEtapa = etapas[etapas.length - 1];
    const taxaConversaoGeral = primeiraEtapa && ultimaEtapa && primeiraEtapa.totalLeads > 0
      ? (ultimaEtapa.totalLeads / primeiraEtapa.totalLeads) * 100
      : 0;

    const valorTotalPipeline = etapas.reduce((sum, etapa) => sum + etapa.valorTotal, 0);
    const tempoMedioTotal = etapas.reduce((sum, etapa) => sum + etapa.tempoMedio, 0);

    return {
      funnelId: funnel.id,
      funnelNome: funnel.name,
      etapas,
      taxaConversaoGeral,
      valorTotalPipeline,
      tempoMedioTotal,
    };
  }

  async getPipelineValue(companyId: string, filtros?: DashboardFiltrosDto): Promise<PipelineValue> {
    // Leads ativos no pipeline (não ganhos nem perdidos)
    const leadsAtivos = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: {
          notIn: ['GANHO', 'PERDIDO'],
        },
        ...(filtros?.funnelId && { funnelId: filtros.funnelId }),
      },
      include: {
        step: true,
      },
    });

    // Agrupar por etapa
    const etapasMap = new Map();
    let valorTotal = 0;
    let somaProbabilidades = 0;
    let countProbabilidades = 0;

    leadsAtivos.forEach(lead => {
      const etapaId = lead.step.id;
      // Usar valorOrcamento primeiro para pipeline (mais preciso), fallback para valorVenda
      const valor = Number(lead.valorOrcamento) || Number(lead.valorVenda) || 0;
      const probabilidade = lead.probabilidadeFecho || 50; // Default 50% se não informado

      valorTotal += valor;
      if (probabilidade > 0) {
        somaProbabilidades += probabilidade;
        countProbabilidades++;
      }

      if (!etapasMap.has(etapaId)) {
        etapasMap.set(etapaId, {
          etapaId,
          etapaNome: lead.step.name,
          valor: 0,
          quantidade: 0,
          valorMedio: 0,
        });
      }

      const etapa = etapasMap.get(etapaId);
      etapa.valor += valor;
      etapa.quantidade += 1;
      etapa.valorMedio = etapa.valor / etapa.quantidade;
    });

    const valorPorEtapa = Array.from(etapasMap.values());

    // Previsão do mês baseada na probabilidade média
    const probabilidadeMedia = countProbabilidades > 0 ? somaProbabilidades / countProbabilidades : 50;
    const previsaoMes = (valorTotal * probabilidadeMedia) / 100;

    return {
      valorTotal,
      valorPorEtapa,
      previsaoMes,
      probabilidadeMedia,
    };
  }

  async getPerformanceEquipe(companyId: string, filtros?: DateRangeDto): Promise<PerformanceEquipe> {
    const startDate = filtros?.startDate ? new Date(filtros.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filtros?.endDate ? new Date(filtros.endDate) : new Date();

    // Buscar todos os usuários da empresa
    const usuarios = await this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        leads: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            id: true,
            statusVenda: true,
            valorVenda: true,
          },
        },
        assignedTasks: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          select: {
            status: true,
          },
        },
      },
    });

    const performanceUsuarios = usuarios.map(user => {
      const leadsAtribuidos = user.leads.length;
      const leadsConvertidos = user.leads.filter(lead => lead.statusVenda === 'GANHO').length;
      const taxaConversao = leadsAtribuidos > 0 ? (leadsConvertidos / leadsAtribuidos) * 100 : 0;
      const receitaGerada = user.leads
        .filter(lead => lead.statusVenda === 'GANHO')
        .reduce((sum, lead) => sum + (Number(lead.valorVenda) || 0), 0);
      const ticketMedio = leadsConvertidos > 0 ? receitaGerada / leadsConvertidos : 0;

      const tarefasConcluidas = user.assignedTasks.filter(task => task.status === 'COMPLETED').length;
      const tarefasVencidas = user.assignedTasks.filter(task => task.status === 'EXPIRED').length;

      return {
        userId: user.id,
        userName: user.name,
        leadsAtribuidos,
        leadsConvertidos,
        taxaConversao,
        receitaGerada,
        ticketMedio,
        tempoMedioResposta: 0, // TODO: implementar com dados reais
        tarefasConcluidas,
        tarefasVencidas,
      };
    });

    const totalReceita = performanceUsuarios.reduce((sum, user) => sum + user.receitaGerada, 0);
    const totalLeads = performanceUsuarios.reduce((sum, user) => sum + user.leadsAtribuidos, 0);
    const taxaConversaoMedia = totalLeads > 0
      ? (performanceUsuarios.reduce((sum, user) => sum + user.leadsConvertidos, 0) / totalLeads) * 100
      : 0;

    // Melhor performer por receita
    const melhorPerformer = performanceUsuarios.reduce((best, current) =>
      current.receitaGerada > best.receitaGerada ? current : best
    );

    return {
      periodo: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      usuarios: performanceUsuarios,
      totalReceita,
      totalLeads,
      taxaConversaoMedia,
      melhorPerformer: {
        userId: melhorPerformer.userId,
        userName: melhorPerformer.userName,
        metrica: 'receita',
      },
    };
  }

  async getOrigemLeads(companyId: string, filtros?: DateRangeDto): Promise<OrigemLeads[]> {
    const startDate = filtros?.startDate ? new Date(filtros.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filtros?.endDate ? new Date(filtros.endDate) : new Date();

    const leads = await this.prisma.lead.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        meioCaptacao: true,
        statusVenda: true,
        valorVenda: true,
      },
    });

    // Agrupar por meio de captação
    const origensMap = new Map();

    leads.forEach(lead => {
      const meio = lead.meioCaptacao || 'NAO_INFORMADO';

      if (!origensMap.has(meio)) {
        origensMap.set(meio, {
          meio,
          totalLeads: 0,
          leadsConvertidos: 0,
          receitaGerada: 0,
        });
      }

      const origem = origensMap.get(meio);
      origem.totalLeads += 1;

      if (lead.statusVenda === 'GANHO') {
        origem.leadsConvertidos += 1;
        origem.receitaGerada += Number(lead.valorVenda) || 0;
      }
    });

    return Array.from(origensMap.values()).map(origem => ({
      ...origem,
      taxaConversao: origem.totalLeads > 0 ? (origem.leadsConvertidos / origem.totalLeads) * 100 : 0,
    }));
  }

  async getAnalyseProcedimentos(companyId: string, filtros?: DateRangeDto): Promise<AnalyseProcedimentos[]> {
    const startDate = filtros?.startDate ? new Date(filtros.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filtros?.endDate ? new Date(filtros.endDate) : new Date();

    const leads = await this.prisma.lead.findMany({
      where: {
        companyId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        tipoProcura: true,
        statusVenda: true,
        valorVenda: true,
        createdAt: true,
        dataFechamento: true,
      },
    });

    // Agrupar por tipo de procedimento
    const procedimentosMap = new Map();

    leads.forEach(lead => {
      const procedimento = lead.tipoProcura || 'NAO_INFORMADO';

      if (!procedimentosMap.has(procedimento)) {
        procedimentosMap.set(procedimento, {
          procedimento,
          totalLeads: 0,
          leadsConvertidos: 0,
          receitaGerada: 0,
          temposFechamento: [],
        });
      }

      const proc = procedimentosMap.get(procedimento);
      proc.totalLeads += 1;

      if (lead.statusVenda === 'GANHO') {
        proc.leadsConvertidos += 1;
        proc.receitaGerada += Number(lead.valorVenda) || 0;

        if (lead.dataFechamento) {
          const tempo = Math.ceil((lead.dataFechamento.getTime() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24));
          proc.temposFechamento.push(tempo);
        }
      }
    });

    return Array.from(procedimentosMap.values()).map(proc => ({
      procedimento: proc.procedimento,
      totalLeads: proc.totalLeads,
      leadsConvertidos: proc.leadsConvertidos,
      receitaGerada: proc.receitaGerada,
      ticketMedio: proc.leadsConvertidos > 0 ? proc.receitaGerada / proc.leadsConvertidos : 0,
      taxaConversao: proc.totalLeads > 0 ? (proc.leadsConvertidos / proc.totalLeads) * 100 : 0,
      tempoMedioFechamento: proc.temposFechamento.length > 0
        ? proc.temposFechamento.reduce((sum: number, tempo: number) => sum + tempo, 0) / proc.temposFechamento.length
        : 0,
    }));
  }

  async getDashboardResumo(companyId: string, filtros?: DashboardFiltrosDto): Promise<DashboardResumo> {
    const dateRange: DateRangeDto | undefined = filtros?.startDate && filtros?.endDate ? {
      startDate: filtros.startDate,
      endDate: filtros.endDate,
    } : undefined;

    const [vendas, pipeline, performance, origens, procedimentos] = await Promise.all([
      this.getVendasMetrics(companyId, filtros),
      this.getPipelineValue(companyId, filtros),
      this.getPerformanceEquipe(companyId, dateRange),
      this.getOrigemLeads(companyId, dateRange),
      this.getAnalyseProcedimentos(companyId, dateRange),
    ]);

    // Buscar estatísticas de tarefas
    const tarefas = await this.prisma.task.findMany({
      where: {
        companyId,
        ...(dateRange && {
          createdAt: {
            gte: new Date(dateRange.startDate),
            lte: new Date(dateRange.endDate),
          },
        }),
      },
      include: {
        assigned: { select: { id: true, name: true } },
      },
    });

    const taskStats: TaskStats = {
      totalTarefas: tarefas.length,
      tarefasConcluidas: tarefas.filter(t => t.status === 'COMPLETED').length,
      tarefasVencidas: tarefas.filter(t => t.status === 'EXPIRED').length,
      tarefasPendentes: tarefas.filter(t => t.status === 'PENDING').length,
      taxaConclusao: tarefas.length > 0 ? (tarefas.filter(t => t.status === 'COMPLETED').length / tarefas.length) * 100 : 0,
      tempoMedioConclusao: 0, // TODO: calcular baseado em dados reais
      porUsuario: [], // TODO: implementar agrupamento por usuário
    };

    return {
      vendas,
      pipeline,
      performance,
      origens,
      procedimentos,
      tarefas: taskStats,
    };
  }

  // NOVO MÉTODO: Receita Diária para gráfico temporal
  async getReceitaDiaria(companyId: string, filtros?: DateRangeDto): Promise<any[]> {
    const startDate = filtros?.startDate ? new Date(filtros.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filtros?.endDate ? new Date(filtros.endDate) : new Date();

    // Buscar leads ganhos no período com dataFechamento
    const leadsGanhos = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: 'GANHO',
        OR: [
          {
            dataFechamento: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            dataFechamento: null,
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        ],
      },
      select: {
        valorVenda: true,
        valorOrcamento: true,
        dataFechamento: true,
        updatedAt: true,
      },
      orderBy: {
        dataFechamento: 'asc',
      },
    });

    // Agrupar por data
    const receitaPorDia = new Map<string, number>();

    leadsGanhos.forEach(lead => {
      const data = lead.dataFechamento || lead.updatedAt;
      const dataStr = data.toISOString().split('T')[0]; // YYYY-MM-DD
      const valor = Number(lead.valorVenda) || Number(lead.valorOrcamento) || 0;

      if (!receitaPorDia.has(dataStr)) {
        receitaPorDia.set(dataStr, 0);
      }

      receitaPorDia.set(dataStr, receitaPorDia.get(dataStr)! + valor);
    });

    // Converter para array e preencher dias vazios
    const resultado: Array<{ date: string; name: string; value: number }> = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dataStr = currentDate.toISOString().split('T')[0];
      const valor = receitaPorDia.get(dataStr) || 0;

      resultado.push({
        date: dataStr,
        name: currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        value: Math.round(valor * 100) / 100, // 2 casas decimais
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return resultado;
  }

  // NOVO MÉTODO: Analytics Universais usando Tipos Conceituais
  async getConversaoUniversal(companyId: string, periodo?: DateRangeDto): Promise<any> {
    const startDate = periodo?.startDate ? new Date(periodo.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = periodo?.endDate ? new Date(periodo.endDate) : new Date();

    // Query universal agrupando por tipoConceitual
    const result = await this.prisma.$queryRaw`
      SELECT
        fs."tipoConceitual" as tipo_conceitual,
        COUNT(DISTINCT l.id) as total_leads,
        COUNT(DISTINCT CASE WHEN l."statusVenda" = 'GANHO' THEN l.id END) as leads_convertidos,
        AVG(CASE WHEN l."valorOrcamento" IS NOT NULL THEN l."valorOrcamento" ELSE l."valorVenda" END) as valor_medio,
        AVG(EXTRACT(DAYS FROM l."updatedAt" - l."createdAt")) as tempo_medio
      FROM "Lead" l
      JOIN "FunnelStep" fs ON l."stepId" = fs.id
      WHERE l."companyId" = ${companyId}
        AND l."createdAt" BETWEEN ${startDate} AND ${endDate}
      GROUP BY fs."tipoConceitual"
      ORDER BY
        CASE fs."tipoConceitual"
          WHEN 'CAPTACAO' THEN 1
          WHEN 'QUALIFICACAO' THEN 2
          WHEN 'APRESENTACAO' THEN 3
          WHEN 'PROPOSTA' THEN 4
          WHEN 'NEGOCIACAO' THEN 5
          WHEN 'FECHAMENTO' THEN 6
        END
    ` as any[];

    // Mapeamento dos dados para formato padronizado
    const mapeamento = {
      CAPTACAO: { nome: "Captação", cor: "#3B82F6", icone: "🎯" },
      QUALIFICACAO: { nome: "Qualificação", cor: "#10B981", icone: "🔍" },
      APRESENTACAO: { nome: "Apresentação", cor: "#F59E0B", icone: "🦷" },
      PROPOSTA: { nome: "Proposta", cor: "#F97316", icone: "💰" },
      NEGOCIACAO: { nome: "Negociação", cor: "#EF4444", icone: "🤝" },
      FECHAMENTO: { nome: "Fechamento", cor: "#22C55E", icone: "✅" }
    };

    const etapasConceituais = result.map(row => {
      const tipoConceitual = row.tipo_conceitual;
      const totalLeads = parseInt(row.total_leads) || 0;
      const leadsConvertidos = parseInt(row.leads_convertidos) || 0;
      const valorMedio = parseFloat(row.valor_medio) || 0;
      const tempoMedio = parseFloat(row.tempo_medio) || 0;

      return {
        tipoConceitual,
        nome: mapeamento[tipoConceitual]?.nome || tipoConceitual,
        cor: mapeamento[tipoConceitual]?.cor || "#6B7280",
        icone: mapeamento[tipoConceitual]?.icone || "📊",
        totalLeads,
        leadsConvertidos,
        valorMedio: Math.round(valorMedio),
        tempoMedio: Math.round(tempoMedio * 10) / 10,
        taxaConversao: totalLeads > 0 ? Math.round((leadsConvertidos / totalLeads) * 1000) / 10 : 0,
        valorTotal: Math.round(valorMedio * totalLeads),
      };
    });

    // Calcular taxa de conversão entre etapas
    const etapasComConversao = etapasConceituais.map((etapa, index) => {
      if (index === 0) {
        return { ...etapa, conversaoParaProxima: 0 };
      }

      const etapaAnterior = etapasConceituais[index - 1];
      const conversaoParaProxima = etapaAnterior.totalLeads > 0
        ? Math.round((etapa.totalLeads / etapaAnterior.totalLeads) * 1000) / 10
        : 0;

      return { ...etapa, conversaoParaProxima };
    });

    // Calcular métricas gerais
    const primeiraEtapa = etapasConceituais[0];
    const ultimaEtapa = etapasConceituais[etapasConceituais.length - 1];

    return {
      periodo: { startDate: startDate.toISOString(), endDate: endDate.toISOString() },
      etapasConceituais: etapasComConversao,
      metricas: {
        totalInicial: primeiraEtapa?.totalLeads || 0,
        totalFinalizado: ultimaEtapa?.leadsConvertidos || 0,
        conversaoGeral: primeiraEtapa?.totalLeads > 0
          ? Math.round(((ultimaEtapa?.leadsConvertidos || 0) / primeiraEtapa.totalLeads) * 1000) / 10
          : 0,
        valorTotalPipeline: etapasConceituais.reduce((sum, etapa) => sum + etapa.valorTotal, 0),
        tempoMedioTotal: etapasConceituais.length > 0
          ? Math.round(etapasConceituais.reduce((sum, etapa) => sum + etapa.tempoMedio, 0) / etapasConceituais.length * 10) / 10
          : 0,
      }
    };
  }
}