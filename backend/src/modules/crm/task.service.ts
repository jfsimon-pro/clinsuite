import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Task, TaskStatus, Prisma } from '@prisma/client';

export interface CreateTaskDto {
  leadId: string;
  ruleId: string;
  assignedId: string;
  title: string;
  description?: string;
  dueDate: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  dueDate?: Date;
  assignedId?: string;
  status?: TaskStatus;
}

export interface CompleteTaskDto {
  notes?: string;
}

export interface TaskFilters {
  assignedId?: string;
  leadId?: string;
  status?: TaskStatus;
  dueBefore?: Date;
  dueAfter?: Date;
  overdue?: boolean;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  expiredTasks: number;
  cancelledTasks: number;
  tasksByUser: Array<{
    userId: string;
    userName: string;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    expiredTasks: number;
  }>;
  tasksByStep: Array<{
    stepId: string;
    stepName: string;
    totalTasks: number;
    completedTasks: number;
    avgCompletionTime: number; // em dias
  }>;
}

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) { }

  async create(data: CreateTaskDto, companyId: string): Promise<Task> {
    // Validar se o lead existe e pertence à empresa
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: data.leadId,
        companyId,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    // Validar se a regra existe e pertence à empresa
    const rule = await this.prisma.stageTaskRule.findFirst({
      where: {
        id: data.ruleId,
        companyId,
      },
    });

    if (!rule) {
      throw new NotFoundException('Regra de tarefa não encontrada');
    }

    // Validar se o usuário responsável existe e pertence à empresa
    const assignedUser = await this.prisma.user.findFirst({
      where: {
        id: data.assignedId,
        companyId,
      },
    });

    if (!assignedUser) {
      throw new NotFoundException('Usuário responsável não encontrado');
    }

    return this.prisma.task.create({
      data: {
        ...data,
        companyId,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            step: {
              select: {
                id: true,
                name: true,
                funnel: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAllByUser(userId: string, companyId: string, status?: TaskStatus): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {
      assignedId: userId,
      companyId,
    };

    if (status) {
      where.status = status;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            step: {
              select: {
                id: true,
                name: true,
                funnel: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING primeiro
        { dueDate: 'asc' }, // Vencimento mais próximo primeiro
      ],
    });
  }

  async findAllByLead(leadId: string, companyId: string): Promise<Task[]> {
    // Validar se o lead pertence à empresa
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        companyId,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    return this.prisma.task.findMany({
      where: {
        leadId,
        companyId,
      },
      include: {
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    });
  }

  async findAllByCompany(companyId: string, filters?: TaskFilters): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {
      companyId,
    };

    if (filters?.assignedId) {
      where.assignedId = filters.assignedId;
    }

    if (filters?.leadId) {
      where.leadId = filters.leadId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dueBefore || filters?.dueAfter) {
      const dateFilter: any = {};
      if (filters.dueBefore) dateFilter.lte = filters.dueBefore;
      if (filters.dueAfter) dateFilter.gte = filters.dueAfter;
      where.dueDate = dateFilter;
    }

    if (filters?.overdue) {
      where.dueDate = { lt: new Date() };
      where.status = 'PENDING';
    }

    return this.prisma.task.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' },
        { dueDate: 'asc' },
      ],
    });
  }

  async findById(id: string, companyId: string): Promise<Task> {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        companyId,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            step: {
              select: {
                id: true,
                name: true,
                funnel: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
            order: true,
            delayDays: true,
            delayType: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }

    return task;
  }

  async update(id: string, data: UpdateTaskDto, companyId: string): Promise<Task> {
    const task = await this.findById(id, companyId);

    // Se mudou o responsável, validar se o usuário existe
    if (data.assignedId && data.assignedId !== task.assignedId) {
      const user = await this.prisma.user.findFirst({
        where: {
          id: data.assignedId,
          companyId,
        },
      });

      if (!user) {
        throw new NotFoundException('Novo responsável não encontrado');
      }
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string, companyId: string): Promise<void> {
    const task = await this.findById(id, companyId);

    if (task.status === 'COMPLETED') {
      throw new BadRequestException('Não é possível deletar uma tarefa já concluída');
    }

    await this.prisma.task.delete({
      where: { id },
    });
  }

  async completeTask(id: string, userId: string, companyId: string, data?: CompleteTaskDto): Promise<Task> {
    const task = await this.findById(id, companyId);

    if (task.status === 'COMPLETED') {
      throw new BadRequestException('Tarefa já foi concluída');
    }

    if (task.status === 'CANCELLED') {
      throw new BadRequestException('Não é possível completar uma tarefa cancelada');
    }

    // Verificar se o usuário tem permissão (apenas o responsável ou admin)
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.role !== 'ADMIN' && task.assignedId !== userId) {
      throw new ForbiddenException('Apenas o responsável pela tarefa ou um administrador pode concluí-la');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completedBy: userId,
        notes: data?.notes,
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        rule: {
          select: {
            id: true,
            name: true,
            description: true,
            order: true,
            delayDays: true,
            delayType: true,
            stepId: true,
          },
        },
        assigned: {
          select: {
            id: true,
            name: true,
          },
        },
        completedByUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updatedTask;
  }

  async generateTasksForLead(leadId: string, stepId: string, companyId: string): Promise<Task[]> {
    // Buscar regras ativas da etapa
    const rules = await this.prisma.stageTaskRule.findMany({
      where: {
        stepId,
        companyId,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });

    if (rules.length === 0) {
      return [];
    }

    // Buscar dados do lead
    const lead = await this.prisma.lead.findFirst({
      where: {
        id: leadId,
        companyId,
      },
      include: {
        responsible: true,
      },
    });

    if (!lead) {
      throw new NotFoundException('Lead não encontrado');
    }

    const createdTasks: Task[] = [];

    for (const rule of rules) {
      // Determinar responsável
      let assignedId: string;

      switch (rule.assignType) {
        case 'LEAD_OWNER':
          if (!lead.responsibleId) {
            continue; // Pula se lead não tem responsável
          }
          assignedId = lead.responsibleId;
          break;

        case 'FIXED_USER':
          if (!rule.assignedUserId) {
            continue; // Pula se regra não tem usuário fixo
          }
          assignedId = rule.assignedUserId;
          break;

        case 'ROUND_ROBIN':
          // TODO: Implementar round robin
          // Por enquanto, usar o responsável do lead ou pular
          if (!lead.responsibleId) {
            continue;
          }
          assignedId = lead.responsibleId;
          break;

        default:
          continue;
      }

      // Calcular data de vencimento
      let dueDate: Date;

      if (rule.delayType === 'ABSOLUTE') {
        // X dias após lead entrar na etapa (agora)
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + rule.delayDays);
      } else {
        // AFTER_PREVIOUS - será calculado quando a tarefa anterior for concluída
        // Por enquanto, usar delay absoluto como fallback
        dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + rule.delayDays);
      }

      try {
        const task = await this.create({
          leadId,
          ruleId: rule.id,
          assignedId,
          title: rule.name,
          description: rule.description || '',
          dueDate,
        }, companyId);

        createdTasks.push(task);
      } catch (error) {
        console.error(`Erro ao criar tarefa para regra ${rule.id}:`, error);
        // Continua criando outras tarefas mesmo se uma falhar
      }
    }

    return createdTasks;
  }

  async processExpiredTasks(companyId?: string): Promise<void> {
    const where: Prisma.TaskWhereInput = {
      status: 'PENDING',
      dueDate: {
        lt: new Date(),
      },
    };

    if (companyId) {
      where.companyId = companyId;
    }

    await this.prisma.task.updateMany({
      where,
      data: {
        status: 'EXPIRED',
      },
    });
  }

  async getTaskStatistics(companyId: string, period?: DateRange): Promise<TaskStats> {
    const where: Prisma.TaskWhereInput = { companyId };

    if (period) {
      where.createdAt = {
        gte: period.startDate,
        lte: period.endDate,
      };
    }

    // Estatísticas gerais
    const [total, pending, completed, expired, cancelled] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.task.count({ where: { ...where, status: 'COMPLETED' } }),
      this.prisma.task.count({ where: { ...where, status: 'EXPIRED' } }),
      this.prisma.task.count({ where: { ...where, status: 'CANCELLED' } }),
    ]);

    // Estatísticas por usuário
    const tasksByUser = await this.prisma.task.groupBy({
      by: ['assignedId'],
      where,
      _count: {
        id: true,
      },
    });

    const userStats = await Promise.all(
      tasksByUser.map(async (stat) => {
        const user = await this.prisma.user.findUnique({
          where: { id: stat.assignedId },
          select: { name: true },
        });

        const [userCompleted, userPending, userExpired] = await Promise.all([
          this.prisma.task.count({
            where: { ...where, assignedId: stat.assignedId, status: 'COMPLETED' },
          }),
          this.prisma.task.count({
            where: { ...where, assignedId: stat.assignedId, status: 'PENDING' },
          }),
          this.prisma.task.count({
            where: { ...where, assignedId: stat.assignedId, status: 'EXPIRED' },
          }),
        ]);

        return {
          userId: stat.assignedId,
          userName: user?.name || 'Usuário não encontrado',
          totalTasks: stat._count.id,
          completedTasks: userCompleted,
          pendingTasks: userPending,
          expiredTasks: userExpired,
        };
      }),
    );

    // Estatísticas por etapa
    const stepStats = await this.prisma.$queryRaw`
      SELECT
        fs.id as "stepId",
        fs.name as "stepName",
        COUNT(t.id)::int as "totalTasks",
        COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END)::int as "completedTasks",
        COALESCE(AVG(EXTRACT(DAY FROM (t."completedAt" - t."createdAt"))), 0)::int as "avgCompletionTime"
      FROM "FunnelStep" fs
      LEFT JOIN "StageTaskRule" str ON str."stepId" = fs.id
      LEFT JOIN "Task" t ON t."ruleId" = str.id AND t."companyId" = ${companyId}
      WHERE fs."funnelId" IN (
        SELECT id FROM "Funnel" WHERE "companyId" = ${companyId}
      )
      GROUP BY fs.id, fs.name
      ORDER BY fs."order"
    ` as Array<{
      stepId: string;
      stepName: string;
      totalTasks: number;
      completedTasks: number;
      avgCompletionTime: number;
    }>;

    return {
      totalTasks: total,
      pendingTasks: pending,
      completedTasks: completed,
      expiredTasks: expired,
      cancelledTasks: cancelled,
      tasksByUser: userStats,
      tasksByStep: stepStats,
    };
  }

  async getUpcomingTasks(userId: string, companyId: string, days: number = 7): Promise<Task[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.task.findMany({
      where: {
        assignedId: userId,
        companyId,
        status: 'PENDING',
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        rule: {
          select: {
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  async getOverdueTasks(userId: string, companyId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        assignedId: userId,
        companyId,
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        rule: {
          select: {
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });
  }
}