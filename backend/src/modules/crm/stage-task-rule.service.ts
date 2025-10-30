import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StageTaskRule, Prisma } from '@prisma/client';

export interface CreateStageTaskRuleDto {
  stepId: string;
  name: string;
  description?: string;
  order: number;
  delayDays: number;
  delayType: 'ABSOLUTE' | 'AFTER_PREVIOUS';
  assignType: 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN';
  assignedUserId?: string | null;
  isActive?: boolean;
}

export interface UpdateStageTaskRuleDto {
  name?: string;
  description?: string;
  delayDays?: number;
  delayType?: 'ABSOLUTE' | 'AFTER_PREVIOUS';
  assignType?: 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN';
  assignedUserId?: string | null;
  isActive?: boolean;
}

export interface TaskRuleFilters {
  stepId?: string;
  isActive?: boolean;
}

@Injectable()
export class StageTaskRuleService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateStageTaskRuleDto, companyId: string): Promise<StageTaskRule> {
    // Validar se a etapa existe e pertence à empresa
    const step = await this.prisma.funnelStep.findFirst({
      where: {
        id: data.stepId,
        funnel: {
          companyId,
        },
      },
    });

    if (!step) {
      throw new NotFoundException('Etapa não encontrada');
    }

    // Validar se a ordem não está duplicada
    const existingRule = await this.prisma.stageTaskRule.findFirst({
      where: {
        stepId: data.stepId,
        order: data.order,
        companyId,
      },
    });

    if (existingRule) {
      throw new BadRequestException(`Já existe uma tarefa na ordem ${data.order}`);
    }

    // Se assignType é FIXED_USER, validar se o usuário existe
    if (data.assignType === 'FIXED_USER' && data.assignedUserId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: data.assignedUserId,
          companyId,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário responsável não encontrado');
      }
    }

    // Limpar assignedUserId se não for FIXED_USER
    const createData = { ...data };
    if (createData.assignType !== 'FIXED_USER') {
      createData.assignedUserId = null;
    }

    return this.prisma.stageTaskRule.create({
      data: {
        ...createData,
        companyId,
        isActive: createData.isActive ?? true,
      },
      include: {
        step: {
          include: {
            funnel: true,
          },
        },
        assignedUser: true,
      },
    });
  }

  async findAllByStep(stepId: string, companyId: string): Promise<StageTaskRule[]> {
    // Validar se a etapa pertence à empresa
    const step = await this.prisma.funnelStep.findFirst({
      where: {
        id: stepId,
        funnel: {
          companyId,
        },
      },
    });

    if (!step) {
      throw new NotFoundException('Etapa não encontrada');
    }

    return this.prisma.stageTaskRule.findMany({
      where: {
        stepId,
        companyId,
      },
      include: {
        step: {
          include: {
            funnel: true,
          },
        },
        assignedUser: true,
        tasks: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findAllByCompany(companyId: string, filters?: TaskRuleFilters): Promise<StageTaskRule[]> {
    const where: Prisma.StageTaskRuleWhereInput = {
      companyId,
    };

    if (filters?.stepId) {
      where.stepId = filters.stepId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    return this.prisma.stageTaskRule.findMany({
      where,
      include: {
        step: {
          include: {
            funnel: true,
          },
        },
        assignedUser: true,
        tasks: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: [
        { step: { funnel: { name: 'asc' } } },
        { step: { order: 'asc' } },
        { order: 'asc' },
      ],
    });
  }

  async findById(id: string, companyId: string): Promise<StageTaskRule> {
    const rule = await this.prisma.stageTaskRule.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        step: {
          include: {
            funnel: true,
          },
        },
        assignedUser: true,
        tasks: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            lead: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException('Regra de tarefa não encontrada');
    }

    return rule;
  }

  async update(id: string, data: UpdateStageTaskRuleDto, companyId: string): Promise<StageTaskRule> {
    const existingRule = await this.findById(id, companyId);

    // Se mudou assignType para FIXED_USER, validar usuário
    if (data.assignType === 'FIXED_USER' && data.assignedUserId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: data.assignedUserId,
          companyId,
        },
      });

      if (!user) {
        throw new NotFoundException('Usuário responsável não encontrado');
      }
    }

    // Limpar assignedUserId se não for FIXED_USER
    const updateData = { ...data };
    if (updateData.assignType && updateData.assignType !== 'FIXED_USER') {
      updateData.assignedUserId = null;
    }

    return this.prisma.stageTaskRule.update({
      where: { id },
      data: updateData,
      include: {
        step: {
          include: {
            funnel: true,
          },
        },
        assignedUser: true,
      },
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    const rule = await this.findById(id, companyId);

    // Verificar se há tarefas pendentes
    const pendingTasks = await this.prisma.task.count({
      where: {
        ruleId: id,
        status: 'PENDING',
      },
    });

    if (pendingTasks > 0) {
      throw new BadRequestException(
        `Não é possível deletar a regra. Existem ${pendingTasks} tarefa(s) pendente(s) baseada(s) nesta regra.`,
      );
    }

    await this.prisma.stageTaskRule.delete({
      where: { id },
    });
  }

  async reorderRules(stepId: string, newOrder: string[], companyId: string): Promise<void> {
    // Validar se a etapa pertence à empresa
    const step = await this.prisma.funnelStep.findFirst({
      where: {
        id: stepId,
        funnel: {
          companyId,
        },
      },
    });

    if (!step) {
      throw new NotFoundException('Etapa não encontrada');
    }

    // Validar se todos os IDs existem
    const rules = await this.prisma.stageTaskRule.findMany({
      where: {
        stepId,
        companyId,
        id: { in: newOrder },
      },
    });

    if (rules.length !== newOrder.length) {
      throw new BadRequestException('Uma ou mais regras não foram encontradas');
    }

    // Atualizar ordem das regras
    const updatePromises = newOrder.map((ruleId, index) =>
      this.prisma.stageTaskRule.update({
        where: { id: ruleId },
        data: { order: index + 1 },
      }),
    );

    await Promise.all(updatePromises);
  }

  async duplicateRulesFromStep(fromStepId: string, toStepId: string, companyId: string): Promise<StageTaskRule[]> {
    // Validar ambas as etapas
    const [fromStep, toStep] = await Promise.all([
      this.prisma.funnelStep.findFirst({
        where: {
          id: fromStepId,
          funnel: { companyId },
        },
      }),
      this.prisma.funnelStep.findFirst({
        where: {
          id: toStepId,
          funnel: { companyId },
        },
      }),
    ]);

    if (!fromStep || !toStep) {
      throw new NotFoundException('Uma das etapas não foi encontrada');
    }

    // Buscar regras da etapa origem
    const sourceRules = await this.prisma.stageTaskRule.findMany({
      where: {
        stepId: fromStepId,
        companyId,
      },
      orderBy: { order: 'asc' },
    });

    if (sourceRules.length === 0) {
      throw new BadRequestException('Etapa origem não possui regras para duplicar');
    }

    // Criar regras duplicadas na etapa destino
    const duplicatedRules = await Promise.all(
      sourceRules.map((rule) =>
        this.prisma.stageTaskRule.create({
          data: {
            stepId: toStepId,
            name: `${rule.name} (Cópia)`,
            description: rule.description,
            order: rule.order,
            delayDays: rule.delayDays,
            delayType: rule.delayType,
            assignType: rule.assignType,
            assignedUserId: rule.assignedUserId,
            companyId,
          },
          include: {
            step: {
              include: {
                funnel: true,
              },
            },
            assignedUser: true,
          },
        }),
      ),
    );

    return duplicatedRules;
  }

  async toggleActive(id: string, isActive: boolean, companyId: string): Promise<StageTaskRule> {
    await this.findById(id, companyId); // Validar se existe

    return this.prisma.stageTaskRule.update({
      where: { id },
      data: { isActive },
      include: {
        step: {
          include: {
            funnel: true,
          },
        },
        assignedUser: true,
      },
    });
  }

  async getStatistics(companyId: string): Promise<any> {
    const stats = await this.prisma.stageTaskRule.groupBy({
      by: ['stepId'],
      where: { companyId },
      _count: {
        id: true,
      },
    });

    const totalRules = await this.prisma.stageTaskRule.count({
      where: { companyId },
    });

    const activeRules = await this.prisma.stageTaskRule.count({
      where: { companyId, isActive: true },
    });

    return {
      totalRules,
      activeRules,
      inactiveRules: totalRules - activeRules,
      rulesByStep: stats,
    };
  }
}