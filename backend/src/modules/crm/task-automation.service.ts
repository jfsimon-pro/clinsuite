import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TaskService } from './task.service';
import { Task, TaskStatus } from '@prisma/client';

@Injectable()
export class TaskAutomationService {
  private readonly logger = new Logger(TaskAutomationService.name);

  constructor(
    private prisma: PrismaService,
    private taskService: TaskService,
  ) {}

  /**
   * Chamado quando um lead é movido para uma nova etapa
   * Cria automaticamente as tarefas configuradas para a etapa
   */
  async onLeadMoveToStep(leadId: string, stepId: string, companyId: string): Promise<Task[]> {
    this.logger.log(`Processando mudança de etapa para lead ${leadId} -> etapa ${stepId}`);

    try {
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
        this.logger.log(`Nenhuma regra de tarefa ativa encontrada para etapa ${stepId}`);
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
        this.logger.error(`Lead ${leadId} não encontrado`);
        return [];
      }

      const createdTasks: Task[] = [];

      // Criar apenas a primeira tarefa da sequência (order = 1)
      // As próximas serão criadas quando esta for concluída
      const firstRule = rules.find(rule => rule.order === 1);
      
      if (!firstRule) {
        this.logger.log(`Nenhuma regra com order=1 encontrada para etapa ${stepId}`);
        return [];
      }

      const assignedId = await this.determineTaskAssignee(firstRule, leadId, companyId);
      if (!assignedId) {
        this.logger.warn(`Não foi possível determinar responsável para tarefa da regra ${firstRule.id}`);
        return [];
      }

      const dueDate = await this.calculateTaskDueDate(firstRule, leadId, null);

      try {
        const task = await this.taskService.create({
          leadId,
          ruleId: firstRule.id,
          assignedId,
          title: firstRule.name,
          description: firstRule.description || '',
          dueDate,
        }, companyId);

        createdTasks.push(task);
        this.logger.log(`Tarefa criada: ${task.title} para lead ${leadId}`);
      } catch (error) {
        this.logger.error(`Erro ao criar tarefa para regra ${firstRule.id}:`, error);
      }

      return createdTasks;
    } catch (error) {
      this.logger.error(`Erro ao processar mudança de etapa:`, error);
      return [];
    }
  }

  /**
   * Chamado quando uma tarefa é concluída
   * Cria automaticamente a próxima tarefa da sequência
   */
  async onTaskCompleted(taskId: string, companyId: string): Promise<Task | null> {
    this.logger.log(`Processando conclusão de tarefa ${taskId}`);

    try {
      const completedTask = await this.prisma.task.findFirst({
        where: {
          id: taskId,
          companyId,
        },
        include: {
          rule: true,
        },
      });
      
      if (!completedTask || !completedTask.rule) {
        this.logger.warn(`Tarefa ${taskId} não encontrada ou não tem regra associada`);
        return null;
      }

      // Buscar próxima regra na sequência
      const nextRule = await this.prisma.stageTaskRule.findFirst({
        where: {
          stepId: completedTask.rule.stepId,
          order: completedTask.rule.order + 1,
          companyId,
          isActive: true,
        },
      });

      if (!nextRule) {
        this.logger.log(`Nenhuma próxima regra encontrada após order ${completedTask.rule.order} na etapa ${completedTask.rule.stepId}`);
        return null;
      }

      // Criar próxima tarefa
      const nextTask = await this.createNextTaskInSequence(completedTask, nextRule, companyId);
      
      if (nextTask) {
        this.logger.log(`Próxima tarefa criada: ${nextTask.title}`);
      }

      return nextTask;
    } catch (error) {
      this.logger.error(`Erro ao processar conclusão de tarefa:`, error);
      return null;
    }
  }

  /**
   * Cria a próxima tarefa na sequência
   */
  private async createNextTaskInSequence(completedTask: any, nextRule: any, companyId: string): Promise<Task | null> {
    try {
      const assignedId = await this.determineTaskAssignee(nextRule, completedTask.leadId, companyId);
      if (!assignedId) {
        this.logger.warn(`Não foi possível determinar responsável para próxima tarefa da regra ${nextRule.id}`);
        return null;
      }

      const dueDate = await this.calculateTaskDueDate(nextRule, completedTask.leadId, completedTask);

      const nextTask = await this.taskService.create({
        leadId: completedTask.leadId,
        ruleId: nextRule.id,
        assignedId,
        title: nextRule.name,
        description: nextRule.description || '',
        dueDate,
      }, companyId);

      return nextTask;
    } catch (error) {
      this.logger.error(`Erro ao criar próxima tarefa na sequência:`, error);
      return null;
    }
  }

  /**
   * Determina quem será o responsável pela tarefa
   */
  private async determineTaskAssignee(rule: any, leadId: string, companyId: string): Promise<string | null> {
    let assignedId: string | null = null;

    switch (rule.assignType) {
      case 'LEAD_OWNER':
        const lead = await this.prisma.lead.findFirst({
          where: { id: leadId, companyId },
          select: { responsibleId: true },
        });
        assignedId = lead?.responsibleId || null;
        break;

      case 'FIXED_USER':
        if (rule.assignedUserId) {
          // Verificar se o usuário ainda existe e pertence à empresa
          const user = await this.prisma.user.findFirst({
            where: { id: rule.assignedUserId, companyId },
            select: { id: true },
          });
          assignedId = user?.id || null;
        }
        break;

      case 'ROUND_ROBIN':
        // TODO: Implementar distribuição round-robin
        // Por enquanto, usar o responsável do lead
        const leadForRoundRobin = await this.prisma.lead.findFirst({
          where: { id: leadId, companyId },
          select: { responsibleId: true },
        });
        assignedId = leadForRoundRobin?.responsibleId || null;
        break;

      default:
        this.logger.warn(`Tipo de atribuição desconhecido: ${rule.assignType}`);
        return null;
    }

    // Se não conseguiu determinar o responsável, usar fallback: primeiro ADMIN da empresa
    if (!assignedId) {
      this.logger.log(`Responsável não definido, usando fallback para primeiro ADMIN da empresa ${companyId}`);
      const fallbackUser = await this.prisma.user.findFirst({
        where: { 
          companyId,
          role: 'ADMIN'
        },
        select: { id: true },
        orderBy: { createdAt: 'asc' },
      });
      assignedId = fallbackUser?.id || null;
    }

    return assignedId;
  }

  /**
   * Calcula a data de vencimento da tarefa
   */
  private async calculateTaskDueDate(rule: any, leadId: string, previousTask: any): Promise<Date> {
    const now = new Date();
    
    if (rule.delayType === 'ABSOLUTE') {
      // X dias a partir de agora
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + rule.delayDays);
      return dueDate;
    } else if (rule.delayType === 'AFTER_PREVIOUS' && previousTask) {
      // X dias após a conclusão da tarefa anterior
      const completedAt = new Date(previousTask.completedAt || now);
      const dueDate = new Date(completedAt);
      dueDate.setDate(dueDate.getDate() + rule.delayDays);
      return dueDate;
    } else {
      // Fallback: usar delay absoluto
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + rule.delayDays);
      return dueDate;
    }
  }

  /**
   * Processa tarefas vencidas
   * Deve ser chamado periodicamente (cron job)
   */
  async processExpiredTasks(companyId?: string): Promise<number> {
    this.logger.log('Processando tarefas vencidas...');

    try {
      const where: any = {
        status: 'PENDING',
        dueDate: {
          lt: new Date(),
        },
      };

      if (companyId) {
        where.companyId = companyId;
      }

      // Buscar tarefas vencidas
      const expiredTasks = await this.prisma.task.findMany({
        where,
        select: {
          id: true,
          title: true,
          assigned: {
            select: {
              name: true,
              email: true,
            },
          },
          lead: {
            select: {
              name: true,
              phone: true,
            },
          },
        },
      });

      if (expiredTasks.length === 0) {
        this.logger.log('Nenhuma tarefa vencida encontrada');
        return 0;
      }

      // Atualizar status para EXPIRED
      const result = await this.prisma.task.updateMany({
        where,
        data: {
          status: 'EXPIRED',
        },
      });

      this.logger.log(`${result.count} tarefas marcadas como vencidas`);

      // TODO: Enviar notificações para os responsáveis
      for (const task of expiredTasks) {
        this.logger.log(`Tarefa vencida: ${task.title} - Responsável: ${task.assigned.name}`);
        // Aqui seria integrado com sistema de notificações (email, WhatsApp, etc.)
      }

      return result.count;
    } catch (error) {
      this.logger.error('Erro ao processar tarefas vencidas:', error);
      return 0;
    }
  }

  /**
   * Cancela todas as tarefas pendentes de um lead
   * Útil quando lead sai do funil ou muda drasticamente de etapa
   */
  async cancelLeadTasks(leadId: string, companyId: string, reason?: string): Promise<number> {
    this.logger.log(`Cancelando tarefas pendentes do lead ${leadId}`);

    try {
      const result = await this.prisma.task.updateMany({
        where: {
          leadId,
          companyId,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
          notes: reason || 'Cancelada automaticamente',
        },
      });

      this.logger.log(`${result.count} tarefas canceladas para lead ${leadId}`);
      return result.count;
    } catch (error) {
      this.logger.error(`Erro ao cancelar tarefas do lead ${leadId}:`, error);
      return 0;
    }
  }

  /**
   * Reativa tarefas canceladas de um lead
   */
  async reactivateLeadTasks(leadId: string, companyId: string): Promise<number> {
    this.logger.log(`Reativando tarefas canceladas do lead ${leadId}`);

    try {
      const result = await this.prisma.task.updateMany({
        where: {
          leadId,
          companyId,
          status: 'CANCELLED',
        },
        data: {
          status: 'PENDING',
          notes: 'Reativada automaticamente',
        },
      });

      this.logger.log(`${result.count} tarefas reativadas para lead ${leadId}`);
      return result.count;
    } catch (error) {
      this.logger.error(`Erro ao reativar tarefas do lead ${leadId}:`, error);
      return 0;
    }
  }

  /**
   * Recalcula prazos de tarefas pendentes quando regras são alteradas
   */
  async recalculateTaskDueDates(ruleId: string, companyId: string): Promise<number> {
    this.logger.log(`Recalculando prazos de tarefas para regra ${ruleId}`);

    try {
      const rule = await this.prisma.stageTaskRule.findFirst({
        where: { id: ruleId, companyId },
      });

      if (!rule) {
        this.logger.warn(`Regra ${ruleId} não encontrada`);
        return 0;
      }

      const pendingTasks = await this.prisma.task.findMany({
        where: {
          ruleId,
          status: 'PENDING',
        },
        include: {
          lead: true,
        },
      });

      let updatedCount = 0;

      for (const task of pendingTasks) {
        const newDueDate = await this.calculateTaskDueDate(rule, task.leadId, null);
        
        await this.prisma.task.update({
          where: { id: task.id },
          data: { dueDate: newDueDate },
        });

        updatedCount++;
      }

      this.logger.log(`${updatedCount} tarefas tiveram prazos recalculados`);
      return updatedCount;
    } catch (error) {
      this.logger.error(`Erro ao recalcular prazos de tarefas:`, error);
      return 0;
    }
  }

  /**
   * Estatísticas de automação
   */
  async getAutomationStats(companyId: string): Promise<any> {
    try {
      const [
        totalRules,
        activeRules,
        totalTasks,
        automatedTasks,
        completedTasks,
        expiredTasks,
      ] = await Promise.all([
        this.prisma.stageTaskRule.count({ where: { companyId } }),
        this.prisma.stageTaskRule.count({ where: { companyId, isActive: true } }),
        this.prisma.task.count({ where: { companyId } }),
        this.prisma.task.count({ 
          where: { 
            companyId,
            ruleId: { not: null as any }, // Tarefas criadas por regras
          } 
        }),
        this.prisma.task.count({ where: { companyId, status: 'COMPLETED' } }),
        this.prisma.task.count({ where: { companyId, status: 'EXPIRED' } }),
      ]);

      const automationRate = totalTasks > 0 ? (automatedTasks / totalTasks) * 100 : 0;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      const expirationRate = totalTasks > 0 ? (expiredTasks / totalTasks) * 100 : 0;

      return {
        totalRules,
        activeRules,
        inactiveRules: totalRules - activeRules,
        totalTasks,
        automatedTasks,
        manualTasks: totalTasks - automatedTasks,
        completedTasks,
        expiredTasks,
        automationRate: Math.round(automationRate * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        expirationRate: Math.round(expirationRate * 100) / 100,
      };
    } catch (error) {
      this.logger.error('Erro ao gerar estatísticas de automação:', error);
      return {};
    }
  }
}