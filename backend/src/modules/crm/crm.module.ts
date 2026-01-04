import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { CrmController } from './crm.controller';
import { LeadsController } from './leads.controller';
import { StageTaskRuleController } from './stage-task-rule.controller';
import { TaskController } from './task.controller';
import { AnalyticsController } from './analytics.controller';
import { TagController } from './tag.controller';
import { CrmService } from './crm.service';
import { StageTaskRuleService } from './stage-task-rule.service';
import { TaskService } from './task.service';
import { TaskAutomationService } from './task-automation.service';
import { AnalyticsService } from './analytics.service';
import { AlertsService } from './alerts.service';
import { TagService } from './tag.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TaskAutomationProcessor } from './processors/task-automation.processor';
import { QueueModule } from '../../common/queues/queue.module';
import { EventsModule } from '../../common/events/events.module';
import { TaskAutomationEventListener } from './listeners/task-automation.listener';

@Module({
  imports: [
    PrismaModule,
    QueueModule,
    EventsModule,
    BullModule.registerQueue({ name: 'task-automation' }),
  ],
  controllers: [
    CrmController,
    LeadsController,
    StageTaskRuleController,
    TaskController,
    AnalyticsController,
    TagController
  ],
  providers: [
    CrmService,
    StageTaskRuleService,
    TaskService,
    TaskAutomationService,
    AnalyticsService,
    AlertsService,
    TagService,
    TaskAutomationProcessor,
    TaskAutomationEventListener,
  ],
  exports: [
    CrmService,
    StageTaskRuleService,
    TaskService,
    TaskAutomationService,
    AnalyticsService,
    AlertsService,
    TagService
  ],
})
export class CrmModule { }  