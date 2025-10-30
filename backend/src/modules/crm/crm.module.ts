import { Module } from '@nestjs/common';
import { CrmController } from './crm.controller';
import { LeadsController } from './leads.controller';
import { StageTaskRuleController } from './stage-task-rule.controller';
import { TaskController } from './task.controller';
import { AnalyticsController } from './analytics.controller';
import { CrmService } from './crm.service';
import { StageTaskRuleService } from './stage-task-rule.service';
import { TaskService } from './task.service';
import { TaskAutomationService } from './task-automation.service';
import { AnalyticsService } from './analytics.service';
import { AlertsService } from './alerts.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [
    CrmController,
    LeadsController,
    StageTaskRuleController,
    TaskController,
    AnalyticsController
  ],
  providers: [
    CrmService,
    StageTaskRuleService,
    TaskService,
    TaskAutomationService,
    AnalyticsService,
    AlertsService
  ],
  exports: [
    CrmService,
    StageTaskRuleService,
    TaskService,
    TaskAutomationService,
    AnalyticsService,
    AlertsService
  ],
})
export class CrmModule {} 