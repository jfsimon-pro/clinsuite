import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskAutomationService } from './task-automation.service';
import { FUNNEL_TEMPLATES, FunnelTemplate, FUNNEL_TEMPLATES_HIBRIDO } from './templates/funnel-templates';
// import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';

export interface CreateFunnelDto {
  name: string;
  companyId: string;
}

export interface UpdateFunnelDto {
  name?: string;
}

export interface CreateFunnelStepDto {
  name: string;
  order: number;
  funnelId: string;
  tipoConceitual?: 'CAPTACAO' | 'QUALIFICACAO' | 'APRESENTACAO' | 'PROPOSTA' | 'NEGOCIACAO' | 'FECHAMENTO';
}

export interface UpdateFunnelStepDto {
  name?: string;
  order?: number;
  tipoConceitual?: 'CAPTACAO' | 'QUALIFICACAO' | 'APRESENTACAO' | 'PROPOSTA' | 'NEGOCIACAO' | 'FECHAMENTO';
}

export interface ReorderStepsDto {
  stepIds: string[];
}

const DEFAULT_FUNNEL_NAME = 'Novos Contatos';
const DEFAULT_STEP_NAME = 'Novas Entradas';

@Injectable()
export class CrmService {
  constructor(
    private prisma: PrismaService,
    private taskAutomationService: TaskAutomationService,
  ) {}

  // Garante que o funil padrão exista para a empresa
  private async ensureDefaultFunnel(companyId: string) {
    const existing = await this.prisma.funnel.findFirst({
      where: { companyId, name: DEFAULT_FUNNEL_NAME },
      include: { steps: true },
    });
    if (existing) {
      // Garante etapa inicial
      if (!existing.steps.some((s) => s.order === 1 && s.name === DEFAULT_STEP_NAME)) {
        await this.prisma.funnelStep.create({
          data: { name: DEFAULT_STEP_NAME, order: 1, funnelId: existing.id },
        });
      }
      return existing;
    }

    // Criar funil e etapa inicial
    return this.prisma.$transaction(async (tx) => {
      const funnel = await tx.funnel.create({
        data: { name: DEFAULT_FUNNEL_NAME, companyId },
      });
      await tx.funnelStep.create({
        data: { name: DEFAULT_STEP_NAME, order: 1, funnelId: funnel.id },
      });
      return funnel;
    });
  }

  // ===== FUNNEL METHODS =====

  async createFunnel(data: CreateFunnelDto) {
    if (data.name.trim().toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase()) {
      throw new BadRequestException('O funil padrão já existe automaticamente.');
    }
    return this.prisma.funnel.create({
      data: {
        name: data.name,
        companyId: data.companyId,
      },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { leads: true },
        },
      },
    });
  }

  async getFunnels(companyId: string) {
    await this.ensureDefaultFunnel(companyId);
    return this.prisma.funnel.findMany({
      where: { companyId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { leads: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFunnel(id: string, companyId: string) {
    const funnel = await this.prisma.funnel.findFirst({
      where: { id, companyId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { leads: true },
        },
      },
    });

    if (!funnel) {
      throw new NotFoundException('Funnel não encontrado');
    }

    return funnel;
  }

  async updateFunnel(id: string, data: UpdateFunnelDto, companyId: string) {
    const current = await this.getFunnel(id, companyId); // Verifica se existe

    if (
      current.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase() &&
      data.name &&
      data.name.trim() !== current.name
    ) {
      throw new BadRequestException('Não é permitido renomear o funil padrão.');
    }

    return this.prisma.funnel.update({
      where: { id },
      data,
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deleteFunnel(id: string, companyId: string) {
    const funnel = await this.getFunnel(id, companyId);

    if (funnel.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase()) {
      throw new BadRequestException('Não é possível deletar o funil padrão.');
    }
    
    // Verifica se há leads no funil
    const leadCount = await this.prisma.lead.count({
      where: { funnelId: id },
    });

    if (leadCount > 0) {
      throw new BadRequestException('Não é possível deletar um funil que possui leads');
    }

    return this.prisma.funnel.delete({
      where: { id },
    });
  }

  // ===== FUNNEL STEP METHODS =====

  async createFunnelStep(data: CreateFunnelStepDto, companyId: string) {
    // Verifica se o funil pertence à empresa
    const funnel = await this.getFunnel(data.funnelId, companyId);

    // Impedir alteração estrutural indevida no funil padrão: a primeira etapa precisa existir
    if (
      funnel.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase() &&
      data.order === 1
    ) {
      throw new BadRequestException('A etapa inicial do funil padrão já existe.');
    }

    // Verifica se já existe uma etapa com esta ordem
    const existingStep = await this.prisma.funnelStep.findFirst({
      where: {
        funnelId: data.funnelId,
        order: data.order,
      },
    });

    if (existingStep) {
      throw new BadRequestException('Já existe uma etapa com esta ordem');
    }

    await this.prisma.funnelStep.create({
      data,
    });

    // Retornar o funil completo atualizado
    return this.getFunnel(data.funnelId, companyId);
  }

  async updateFunnelStep(id: string, data: UpdateFunnelStepDto, companyId: string) {
    const step = await this.prisma.funnelStep.findFirst({
      where: { id },
      include: { funnel: true },
    });

    if (!step || step.funnel.companyId !== companyId) {
      throw new NotFoundException('Etapa não encontrada');
    }

    // Proteger etapa inicial do funil padrão contra exclusão acidental via rename de ordem
    if (step.funnel.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase()) {
      if (step.order === 1) {
        if (data.order && data.order !== 1) {
          throw new BadRequestException('Não é permitido mover a etapa inicial do funil padrão.');
        }
        // Permitir renomear se quiser? Mantemos o nome padrão se não enviar
        if (data.name && data.name.trim() !== DEFAULT_STEP_NAME) {
          // Permite renomear? Vamos bloquear para manter padrão
          throw new BadRequestException('Não é permitido renomear a etapa inicial do funil padrão.');
        }
      }
    }

    // Se estiver alterando a ordem, verifica conflitos
    if (data.order !== undefined && data.order !== step.order) {
      const existingStep = await this.prisma.funnelStep.findFirst({
        where: {
          funnelId: step.funnelId,
          order: data.order,
          id: { not: id },
        },
      });

      if (existingStep) {
        throw new BadRequestException('Já existe uma etapa com esta ordem');
      }
    }

    return this.prisma.funnelStep.update({
      where: { id },
      data,
      include: {
        funnel: true,
      },
    });
  }

  async deleteFunnelStep(id: string, companyId: string) {
    const step = await this.prisma.funnelStep.findFirst({
      where: { id },
      include: {
        funnel: true,
        _count: {
          select: { leads: true }
        }
      },
    });

    if (!step || step.funnel.companyId !== companyId) {
      throw new NotFoundException('Etapa não encontrada');
    }

    // Proteger etapa inicial do funil padrão
    if (
      step.funnel.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase() &&
      step.order === 1
    ) {
      throw new BadRequestException('Não é possível deletar a etapa inicial do funil padrão.');
    }

    // Informar quantos leads serão deletados junto
    const leadCount = step._count.leads;

    // Deletar a etapa (cascade delete irá deletar automaticamente os leads, reminders, tasks, etc.)
    const deletedStep = await this.prisma.funnelStep.delete({
      where: { id },
    });

    return {
      ...deletedStep,
      deletedLeadsCount: leadCount
    };
  }

  async reorderSteps(funnelId: string, data: ReorderStepsDto, companyId: string) {
    // Verifica se o funil pertence à empresa
    const funnel = await this.getFunnel(funnelId, companyId);

    // Impedir mover etapa inicial do funil padrão
    if (funnel.name.toLowerCase() === DEFAULT_FUNNEL_NAME.toLowerCase()) {
      const initialStep = await this.prisma.funnelStep.findFirst({ where: { funnelId, order: 1 } });
      if (initialStep && data.stepIds[0] !== initialStep.id) {
        throw new BadRequestException('A etapa inicial do funil padrão deve permanecer em primeiro.');
      }
    }

    // Verifica se todas as etapas pertencem ao funil
    const steps = await this.prisma.funnelStep.findMany({
      where: {
        id: { in: data.stepIds },
        funnelId,
      },
    });

    if (steps.length !== data.stepIds.length) {
      throw new BadRequestException('Algumas etapas não pertencem ao funil');
    }

    // Atualiza a ordem das etapas
    const updates = data.stepIds.map((stepId, index) => ({
      where: { id: stepId },
      data: { order: index + 1 },
    }));

    await this.prisma.$transaction(
      updates.map(update => this.prisma.funnelStep.update(update))
    );

    return this.getFunnel(funnelId, companyId);
  }

  // ===== LEAD METHODS =====

  async createLead(data: any, companyId: string) {
    // Verificar se o funil e etapa existem e pertencem à empresa
    const funnel = await this.prisma.funnel.findFirst({
      where: { id: data.funnelId, companyId },
    });

    if (!funnel) {
      throw new NotFoundException('Funil não encontrado');
    }

    const step = await this.prisma.funnelStep.findFirst({
      where: { id: data.stepId, funnelId: data.funnelId },
    });

    if (!step) {
      throw new NotFoundException('Etapa não encontrada');
    }

    // Verificar se o responsável existe e pertence à empresa (se fornecido)
    if (data.responsibleId) {
      const responsible = await this.prisma.user.findFirst({
        where: { id: data.responsibleId, companyId },
      });

      if (!responsible) {
        throw new NotFoundException('Responsável não encontrado');
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        ...data,
        companyId,
        valorVenda: data.valorVenda ? Number(data.valorVenda) : null,
        dataConsulta: data.dataConsulta ? new Date(data.dataConsulta) : null,
        previsaoFechamento: data.previsaoFechamento ? new Date(data.previsaoFechamento) : null,
      },
      include: {
        funnel: true,
        step: true,
        responsible: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    // Trigger task automation for new lead
    try {
      await this.taskAutomationService.onLeadMoveToStep(lead.id, lead.stepId, companyId);
    } catch (error) {
      console.error('Erro ao criar tarefas automáticas para lead:', error);
      // Não falha a criação do lead se houver erro na automação
    }

    return lead;
  }

  async getLeads(companyId: string, funnelId?: string, stepId?: string) {
    const where: any = { companyId };
    
    if (funnelId) {
      where.funnelId = funnelId;
    }
    
    if (stepId) {
      where.stepId = stepId;
    }

    return this.prisma.lead.findMany({
      where,
      include: {
        funnel: true,
        step: true,
        responsible: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { notes: true, reminders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLead(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
      include: {
        funnel: true,
        step: true,
        responsible: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
        notes: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        reminders: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return lead;
  }

  async updateLead(id: string, data: any, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    // Verificar se o funil existe e pertence à empresa (se fornecido)
    if (data.funnelId) {
      const funnel = await this.prisma.funnel.findFirst({
        where: { id: data.funnelId, companyId },
      });

      if (!funnel) {
        throw new NotFoundException('Funil não encontrado');
      }
    }

    // Verificar se a etapa existe (se fornecida)
    if (data.stepId) {
      const step = await this.prisma.funnelStep.findFirst({
        where: { 
          id: data.stepId, 
          funnel: { 
            companyId,
            // Se funnelId foi fornecido, garantir que a etapa pertence a esse funil
            ...(data.funnelId && { id: data.funnelId })
          } 
        },
      });

      if (!step) {
        throw new NotFoundException('Etapa não encontrada ou não pertence ao funil especificado');
      }
    }

    // Verificar se o responsável existe e pertence à empresa (se fornecido)
    if (data.responsibleId) {
      const responsible = await this.prisma.user.findFirst({
        where: { id: data.responsibleId, companyId },
      });

      if (!responsible) {
        throw new NotFoundException('Responsável não encontrado');
      }
    }

    // Verificar se o dentista existe e pertence à empresa (se fornecido)
    if (data.dentistaId) {
      const dentist = await this.prisma.user.findFirst({
        where: { id: data.dentistaId, companyId, role: 'DENTIST' },
      });

      if (!dentist) {
        throw new NotFoundException('Dentista não encontrado');
      }
    }

    // Verificar conflito de horários (se estiver marcando/alterando consulta)
    if (data.dataConsulta && data.dentistaId) {
      const duracaoConsulta = data.duracaoConsulta || 60; // Padrão 60 minutos
      const consultaInicio = new Date(data.dataConsulta);
      const consultaFim = new Date(consultaInicio.getTime() + duracaoConsulta * 60000);

      // Buscar consultas do mesmo dentista que possam conflitar
      const consultasConflitantes = await this.prisma.lead.findMany({
        where: {
          id: { not: id }, // Excluir o lead atual
          dentistaId: data.dentistaId,
          companyId,
          dataConsulta: { not: null },
        },
        select: {
          id: true,
          name: true,
          dataConsulta: true,
          duracaoConsulta: true,
        },
      });

      // Verificar se há conflito
      for (const consulta of consultasConflitantes) {
        const outraInicio = new Date(consulta.dataConsulta!);
        const outraDuracao = consulta.duracaoConsulta || 60;
        const outraFim = new Date(outraInicio.getTime() + outraDuracao * 60000);

        // Verifica se os horários se sobrepõem
        const haConflito =
          (consultaInicio >= outraInicio && consultaInicio < outraFim) || // Nova consulta começa durante outra
          (consultaFim > outraInicio && consultaFim <= outraFim) || // Nova consulta termina durante outra
          (consultaInicio <= outraInicio && consultaFim >= outraFim); // Nova consulta engloba outra

        if (haConflito) {
          throw new BadRequestException(
            `Conflito de horário: O dentista já possui uma consulta agendada com ${consulta.name || 'outro paciente'} às ${outraInicio.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}`
          );
        }
      }
    }

    // DEBUG: Log dos dados recebidos
    console.log('🔍 DEBUG updateLead - Dados recebidos:', {
      dataConsulta: data.dataConsulta,
      dataConsultaType: typeof data.dataConsulta,
      duracaoConsulta: data.duracaoConsulta,
      duracaoConsultaType: typeof data.duracaoConsulta,
      previsaoFechamento: data.previsaoFechamento,
      dataFechamento: data.dataFechamento,
    });

    const dataToUpdate = {
      ...data,
      valorVenda: data.valorVenda ? Number(data.valorVenda) : undefined,
      valorOrcamento: data.valorOrcamento ? Number(data.valorOrcamento) : undefined,
      dataConsulta: data.dataConsulta ? new Date(data.dataConsulta) : undefined,
      duracaoConsulta: data.duracaoConsulta ? Number(data.duracaoConsulta) : undefined,
      previsaoFechamento: data.previsaoFechamento ? new Date(data.previsaoFechamento) : undefined,
      dataFechamento: data.dataFechamento ? new Date(data.dataFechamento) : undefined,
    };

    // DEBUG: Log dos dados após conversão
    console.log('🔍 DEBUG updateLead - Após conversão:', {
      dataConsulta: dataToUpdate.dataConsulta,
      dataConsultaISO: dataToUpdate.dataConsulta?.toISOString(),
      duracaoConsulta: dataToUpdate.duracaoConsulta,
      duracaoConsultaTipo: typeof dataToUpdate.duracaoConsulta,
    });

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: dataToUpdate,
      include: {
        funnel: true,
        step: true,
        responsible: {
          select: { id: true, name: true, email: true },
        },
        dentistUser: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });

    // DEBUG: Log do lead atualizado
    console.log('🔍 DEBUG updateLead - Lead retornado do banco:', {
      dataConsulta: updatedLead.dataConsulta,
      dataConsultaISO: updatedLead.dataConsulta?.toISOString(),
      duracaoConsulta: updatedLead.duracaoConsulta,
      valorOrcamento: updatedLead.valorOrcamento,
      valorVenda: updatedLead.valorVenda,
    });

    // Trigger task automation if step changed
    if (data.stepId && data.stepId !== lead.stepId) {
      try {
        await this.taskAutomationService.onLeadMoveToStep(id, data.stepId, companyId);
      } catch (error) {
        console.error('Erro ao criar tarefas automáticas para lead atualizado:', error);
        // Não falha a atualização do lead se houver erro na automação
      }
    }

    return updatedLead;
  }

  async deleteLead(id: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  async getLeadsByDentist(userId: string, companyId: string) {
    return this.prisma.lead.findMany({
      where: {
        dentistaId: userId,
        companyId,
      },
      include: {
        funnel: {
          select: { id: true, name: true },
        },
        step: {
          select: { id: true, name: true },
        },
        dentistUser: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async moveLeadToStep(leadId: string, stepId: string, companyId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id: leadId, companyId },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const step = await this.prisma.funnelStep.findFirst({
      where: { id: stepId, funnel: { companyId } },
    });

    if (!step) {
      throw new NotFoundException('Etapa não encontrada');
    }

    const updatedLead = await this.prisma.lead.update({
      where: { id: leadId },
      data: { stepId },
      include: {
        funnel: true,
        step: true,
        responsible: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Trigger task automation for moved lead
    try {
      await this.taskAutomationService.onLeadMoveToStep(leadId, stepId, companyId);
    } catch (error) {
      console.error('Erro ao criar tarefas automáticas para lead movido:', error);
      // Não falha a movimentação do lead se houver erro na automação
    }

    return updatedLead;
  }

  // ===== TEMPLATE METHODS =====

  async getFunnelTemplates(): Promise<FunnelTemplate[]> {
    return FUNNEL_TEMPLATES;
  }

  async installFunnelTemplates(companyId: string) {
    const results: Array<{
      template: string;
      status: 'created' | 'skipped' | 'error';
      message: string;
      funnelId?: string;
      stepsCount?: number;
    }> = [];

    for (const template of FUNNEL_TEMPLATES_HIBRIDO) {
      try {
        // Verificar se funil já existe
        const existingFunnel = await this.prisma.funnel.findFirst({
          where: {
            companyId,
            name: template.name
          },
        });

        if (existingFunnel) {
          results.push({
            template: template.name,
            status: 'skipped',
            message: 'Funil já existe'
          });
          continue;
        }

        // Criar funil
        const funnel = await this.prisma.funnel.create({
          data: {
            name: template.name,
            companyId,
          },
        });

        // Criar etapas
        const createdSteps: any[] = [];
        for (let i = 0; i < template.steps.length; i++) {
          const stepTemplate = template.steps[i];

          const step = await this.prisma.funnelStep.create({
            data: {
              name: stepTemplate.name,
              order: i + 1,
              funnelId: funnel.id,
              tipoEtapa: stepTemplate.tipoEtapa as any,
              tipoConceitual: stepTemplate.tipoConceitual as any, // Novo campo!
              metaConversao: stepTemplate.metaConversao,
              tempoMedioEtapa: stepTemplate.tempoMedioEtapa,
              valorMedioEtapa: stepTemplate.valorMedioEtapa,
              corEtapa: stepTemplate.corEtapa,
              iconEtapa: stepTemplate.iconEtapa,
            },
          });

          createdSteps.push(step);
        }

        results.push({
          template: template.name,
          status: 'created',
          message: `Funil criado com ${createdSteps.length} etapas`,
          funnelId: funnel.id,
          stepsCount: createdSteps.length
        });

      } catch (error) {
        results.push({
          template: template.name,
          status: 'error',
          message: error.message
        });
      }
    }

    return {
      message: 'Instalação de templates concluída',
      results,
      summary: {
        total: FUNNEL_TEMPLATES_HIBRIDO.length,
        created: results.filter(r => r.status === 'created').length,
        skipped: results.filter(r => r.status === 'skipped').length,
        errors: results.filter(r => r.status === 'error').length,
      }
    };
  }
} 