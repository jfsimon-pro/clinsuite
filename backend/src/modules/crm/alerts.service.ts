import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';

export interface Alert {
  id: string;
  type: 'LEAD_QUENTE' | 'TAXA_BAIXA' | 'OPORTUNIDADE' | 'PRAZO_PROXIMO' | 'LEAD_PARADO';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  icon: string;
  leadId?: string;
  funnelId?: string;
  stepId?: string;
  userId?: string;
  data?: any;
  createdAt: Date;
}

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private analyticsService: AnalyticsService,
  ) {}

  async getCompanyAlerts(companyId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // 1. 🔥 LEAD QUENTE - Alto valor há muito tempo na negociação
    const leadsQuentes = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: {
          in: ['NEGOCIACAO', 'ORCAMENTO_ENVIADO']
        },
        valorOrcamento: {
          gte: 3000 // Valor alto
        },
        updatedAt: {
          lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 dias sem atualização
        }
      },
      include: {
        responsible: { select: { name: true } },
        step: { select: { name: true } }
      },
      take: 10
    });

    for (const lead of leadsQuentes) {
      const diasParado = Math.ceil((Date.now() - lead.updatedAt.getTime()) / (1000 * 60 * 60 * 24));

      alerts.push({
        id: `lead-quente-${lead.id}`,
        type: 'LEAD_QUENTE',
        priority: 'HIGH',
        title: '🔥 Lead Quente Parado',
        description: `${lead.name || lead.phone} (R$ ${Number(lead.valorOrcamento)?.toLocaleString('pt-BR')}) está ${diasParado} dias sem movimento na ${lead.step.name}`,
        icon: '🔥',
        leadId: lead.id,
        stepId: lead.stepId,
        userId: lead.responsibleId || undefined,
        data: {
          valor: Number(lead.valorOrcamento),
          diasParado,
          stepName: lead.step.name,
          responsibleName: lead.responsible?.name
        },
        createdAt: new Date()
      });
    }

    // 2. ⚠️ TAXA BAIXA - Conversão abaixo da meta
    const funnels = await this.prisma.funnel.findMany({
      where: { companyId },
      include: {
        steps: {
          include: {
            leads: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    for (const funnel of funnels) {
      for (let i = 0; i < funnel.steps.length - 1; i++) {
        const currentStep = funnel.steps[i];
        const nextStep = funnel.steps[i + 1];

        const leadsCurrentStep = currentStep.leads.length;
        const leadsNextStep = nextStep.leads.length;

        if (leadsCurrentStep > 0) {
          const taxaConversao = (leadsNextStep / leadsCurrentStep) * 100;
          const metaConversao = currentStep.metaConversao || 50;

          if (taxaConversao < metaConversao * 0.7) { // 30% abaixo da meta
            alerts.push({
              id: `taxa-baixa-${currentStep.id}`,
              type: 'TAXA_BAIXA',
              priority: 'MEDIUM',
              title: '⚠️ Taxa de Conversão Baixa',
              description: `${currentStep.name} → ${nextStep.name}: ${taxaConversao.toFixed(1)}% (Meta: ${metaConversao}%)`,
              icon: '⚠️',
              funnelId: funnel.id,
              stepId: currentStep.id,
              data: {
                taxaAtual: taxaConversao,
                metaConversao,
                leadsCurrentStep,
                leadsNextStep,
                stepName: currentStep.name,
                nextStepName: nextStep.name
              },
              createdAt: new Date()
            });
          }
        }
      }
    }

    // 3. 📈 OPORTUNIDADE - Lead com alta probabilidade
    const oportunidades = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: {
          notIn: ['GANHO', 'PERDIDO']
        },
        probabilidadeFecho: {
          gte: 80 // Alta probabilidade
        },
        valorOrcamento: {
          gte: 2000 // Valor interessante
        }
      },
      include: {
        responsible: { select: { name: true } },
        step: { select: { name: true } }
      },
      orderBy: { probabilidadeFecho: 'desc' },
      take: 5
    });

    for (const lead of oportunidades) {
      alerts.push({
        id: `oportunidade-${lead.id}`,
        type: 'OPORTUNIDADE',
        priority: 'MEDIUM',
        title: '📈 Oportunidade Quente',
        description: `${lead.name || lead.phone} tem ${lead.probabilidadeFecho}% de chance (R$ ${Number(lead.valorOrcamento)?.toLocaleString('pt-BR')})`,
        icon: '📈',
        leadId: lead.id,
        userId: lead.responsibleId || undefined,
        data: {
          probabilidade: lead.probabilidadeFecho,
          valor: Number(lead.valorOrcamento),
          stepName: lead.step.name,
          responsibleName: lead.responsible?.name
        },
        createdAt: new Date()
      });
    }

    // 4. ⏰ PRAZO - Previsão de fechamento próxima
    const prazosProximos = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: {
          notIn: ['GANHO', 'PERDIDO']
        },
        previsaoFechamento: {
          gte: new Date(),
          lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Próximos 3 dias
        }
      },
      include: {
        responsible: { select: { name: true } },
        step: { select: { name: true } }
      },
      orderBy: { previsaoFechamento: 'asc' },
      take: 10
    });

    for (const lead of prazosProximos) {
      const diasParaVencer = Math.ceil((lead.previsaoFechamento!.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      alerts.push({
        id: `prazo-${lead.id}`,
        type: 'PRAZO_PROXIMO',
        priority: diasParaVencer === 0 ? 'HIGH' : 'MEDIUM',
        title: '⏰ Prazo de Fechamento Próximo',
        description: `${lead.name || lead.phone} tem previsão para ${diasParaVencer === 0 ? 'hoje' : `${diasParaVencer} dia(s)`}`,
        icon: '⏰',
        leadId: lead.id,
        userId: lead.responsibleId || undefined,
        data: {
          previsaoFechamento: lead.previsaoFechamento,
          diasParaVencer,
          valor: Number(lead.valorOrcamento || lead.valorVenda),
          stepName: lead.step.name,
          responsibleName: lead.responsible?.name
        },
        createdAt: new Date()
      });
    }

    // 5. 🚨 LEADS PARADOS - Muito tempo na mesma etapa
    const leadsParados = await this.prisma.lead.findMany({
      where: {
        companyId,
        statusVenda: {
          notIn: ['GANHO', 'PERDIDO', 'PAUSADO']
        },
        updatedAt: {
          lte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 dias sem movimento
        }
      },
      include: {
        responsible: { select: { name: true } },
        step: { select: { name: true, tempoMedioEtapa: true } }
      },
      take: 15
    });

    for (const lead of leadsParados) {
      const diasParado = Math.ceil((Date.now() - lead.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      const tempoMedioEtapa = lead.step.tempoMedioEtapa || 7;

      if (diasParado > tempoMedioEtapa * 2) { // Dobro do tempo médio
        alerts.push({
          id: `parado-${lead.id}`,
          type: 'LEAD_PARADO',
          priority: 'LOW',
          title: '🚨 Lead Parado há Muito Tempo',
          description: `${lead.name || lead.phone} está ${diasParado} dias em ${lead.step.name} (média: ${tempoMedioEtapa} dias)`,
          icon: '🚨',
          leadId: lead.id,
          stepId: lead.stepId,
          userId: lead.responsibleId || undefined,
          data: {
            diasParado,
            tempoMedioEtapa,
            stepName: lead.step.name,
            responsibleName: lead.responsible?.name
          },
          createdAt: new Date()
        });
      }
    }

    // Ordenar por prioridade e data
    return alerts.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getAlertsSummary(companyId: string) {
    const alerts = await this.getCompanyAlerts(companyId);

    const summary = {
      total: alerts.length,
      high: alerts.filter(a => a.priority === 'HIGH').length,
      medium: alerts.filter(a => a.priority === 'MEDIUM').length,
      low: alerts.filter(a => a.priority === 'LOW').length,
      byType: {
        LEAD_QUENTE: alerts.filter(a => a.type === 'LEAD_QUENTE').length,
        TAXA_BAIXA: alerts.filter(a => a.type === 'TAXA_BAIXA').length,
        OPORTUNIDADE: alerts.filter(a => a.type === 'OPORTUNIDADE').length,
        PRAZO_PROXIMO: alerts.filter(a => a.type === 'PRAZO_PROXIMO').length,
        LEAD_PARADO: alerts.filter(a => a.type === 'LEAD_PARADO').length,
      }
    };

    return {
      summary,
      recentAlerts: alerts.slice(0, 10)
    };
  }
}