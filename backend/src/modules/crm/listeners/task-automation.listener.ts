import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { LeadCreatedEvent, LeadMovedToStepEvent } from '../../../common/events/lead.events';

/**
 * Listener para eventos de Lead
 * Enfileira tarefas de processamento automatizado
 */
@Injectable()
export class TaskAutomationEventListener {
  private readonly logger = new Logger(TaskAutomationEventListener.name);

  constructor(
    @InjectQueue('task-automation')
    private readonly taskAutomationQueue: Queue,
  ) {}

  /**
   * Listener para quando um lead é criado
   * Enfileira a criação de tarefas automáticas
   */
  @OnEvent('lead.created', { async: true })
  async handleLeadCreated(event: LeadCreatedEvent) {
    this.logger.log(
      `[listener] Lead criado: ${event.leadId} na etapa ${event.stepId}`,
    );

    try {
      // Enfileira o processamento de tarefas automáticas
      const job = await this.taskAutomationQueue.add(
        'lead-moved-to-step',
        {
          leadId: event.leadId,
          stepId: event.stepId,
          companyId: event.companyId,
        },
        {
          attempts: 3, // Tentar 3 vezes em caso de falha
          backoff: {
            type: 'exponential',
            delay: 2000, // Começa com 2 segundos
          },
          removeOnComplete: true, // Remover do histórico após completar
          removeOnFail: false, // Manter no histórico se falhar
          delay: 0, // Processar imediatamente
        },
      );

      this.logger.log(`[listener] Job enfileirado: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `[listener] Erro ao enfileirar tarefa para lead ${event.leadId}:`,
        error,
      );
    }
  }

  /**
   * Listener para quando um lead é movido para nova etapa
   * Enfileira a criação de tarefas automáticas
   */
  @OnEvent('lead.movedToStep', { async: true })
  async handleLeadMovedToStep(event: LeadMovedToStepEvent) {
    this.logger.log(
      `[listener] Lead movido: ${event.leadId} para etapa ${event.newStepId}`,
    );

    try {
      const job = await this.taskAutomationQueue.add(
        'lead-moved-to-step',
        {
          leadId: event.leadId,
          stepId: event.newStepId,
          companyId: event.companyId,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
          delay: 0,
        },
      );

      this.logger.log(`[listener] Job enfileirado: ${job.id}`);
    } catch (error) {
      this.logger.error(
        `[listener] Erro ao enfileirar tarefa para lead ${event.leadId}:`,
        error,
      );
    }
  }
}
