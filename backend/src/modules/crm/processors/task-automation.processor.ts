import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TaskAutomationService } from '../task-automation.service';

@Processor('task-automation')
export class TaskAutomationProcessor {
  private readonly logger = new Logger(TaskAutomationProcessor.name);

  constructor(private readonly taskAutomationService: TaskAutomationService) {}

  /**
   * Processa eventos de lead movido para uma nova etapa
   * Cria tarefas automáticas baseado nas regras configuradas
   */
  @Process('lead-moved-to-step')
  async handleLeadMovedToStep(
    job: Job<{ leadId: string; stepId: string; companyId: string }>,
  ) {
    const { leadId, stepId, companyId } = job.data;

    this.logger.log(
      `[lead-moved-to-step] Processando Lead ${leadId} -> Etapa ${stepId}`,
    );

    try {
      const tasks = await this.taskAutomationService.onLeadMoveToStep(
        leadId,
        stepId,
        companyId,
      );

      this.logger.log(
        `[lead-moved-to-step] ${tasks.length} tarefa(s) criada(s) para lead ${leadId}`,
      );

      return { success: true, tasksCreated: tasks.length, tasks };
    } catch (error) {
      this.logger.error(
        `[lead-moved-to-step] Erro ao processar lead ${leadId}:`,
        error,
      );
      // Re-throw para que Bull faça retry automaticamente
      throw error;
    }
  }

  /**
   * Processa conclusão de tarefas e cria a próxima em sequência
   */
  @Process('task-completed')
  async handleTaskCompleted(
    job: Job<{ taskId: string; companyId: string }>,
  ) {
    const { taskId, companyId } = job.data;

    this.logger.log(`[task-completed] Processando conclusão de tarefa ${taskId}`);

    try {
      const nextTask = await this.taskAutomationService.onTaskCompleted(
        taskId,
        companyId,
      );

      this.logger.log(
        `[task-completed] Próxima tarefa criada: ${nextTask?.title || 'nenhuma'}`,
      );

      return { success: true, nextTask };
    } catch (error) {
      this.logger.error(
        `[task-completed] Erro ao processar conclusão de tarefa ${taskId}:`,
        error,
      );
      throw error;
    }
  }

}
