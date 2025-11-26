import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TaskService } from './task.service';
import { TaskAutomationService } from './task-automation.service';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
  CompleteTaskDto,
  TaskFiltersDto,
  GenerateTasksDto,
  TaskStatsQueryDto,
} from './dto/task.dto';

@Controller('crm/tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(
    private taskService: TaskService,
    private taskAutomationService: TaskAutomationService,
    @InjectQueue('task-automation')
    private readonly taskAutomationQueue: Queue,
  ) {}

  @Post()
  async create(@Request() req: any, @Body() createDto: CreateTaskDto) {
    return this.taskService.create({
      ...createDto,
      dueDate: new Date(createDto.dueDate),
    }, req.user.companyId);
  }

  @Get()
  async findAll(@Request() req: any, @Query() filters: TaskFiltersDto) {
    const processedFilters = {
      ...filters,
      dueBefore: filters.dueBefore ? new Date(filters.dueBefore) : undefined,
      dueAfter: filters.dueAfter ? new Date(filters.dueAfter) : undefined,
    };
    
    return this.taskService.findAllByCompany(req.user.companyId, processedFilters);
  }

  @Get('my-tasks')
  async getMyTasks(
    @Request() req: any, 
    @Query('status') status?: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  ) {
    return this.taskService.findAllByUser(req.user.id, req.user.companyId, status);
  }

  @Get('my-tasks/upcoming')
  async getUpcomingTasks(
    @Request() req: any, 
    @Query('days') days?: string
  ) {
    const daysAhead = days ? parseInt(days) : 7;
    return this.taskService.getUpcomingTasks(req.user.id, req.user.companyId, daysAhead);
  }

  @Get('my-tasks/overdue')
  async getOverdueTasks(@Request() req: any) {
    return this.taskService.getOverdueTasks(req.user.id, req.user.companyId);
  }

  @Get('lead/:leadId')
  async findByLead(@Request() req: any, @Param('leadId') leadId: string) {
    return this.taskService.findAllByLead(leadId, req.user.companyId);
  }

  @Get('stats')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getStatistics(@Request() req: any, @Query() query: TaskStatsQueryDto) {
    const period = query.startDate && query.endDate ? {
      startDate: new Date(query.startDate),
      endDate: new Date(query.endDate),
    } : undefined;

    return this.taskService.getTaskStatistics(req.user.companyId, period);
  }

  @Get('automation/stats')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getAutomationStats(@Request() req: any) {
    return this.taskAutomationService.getAutomationStats(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.taskService.findById(id, req.user.companyId);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateTaskDto,
  ) {
    const processedData = {
      ...updateDto,
      dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : undefined,
    };

    return this.taskService.update(id, processedData, req.user.companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.taskService.delete(id, req.user.companyId);
  }

  @Post(':id/complete')
  async complete(
    @Request() req: any,
    @Param('id') id: string,
    @Body() completeDto: CompleteTaskDto,
  ) {
    const completedTask = await this.taskService.completeTask(
      id,
      req.user.id,
      req.user.companyId,
      completeDto
    );

    // Enfileirar criação da próxima tarefa na sequência
    await this.taskAutomationQueue.add(
      'task-completed',
      {
        taskId: id,
        companyId: req.user.companyId,
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

    return completedTask;
  }

  @Post('generate')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async generateTasks(@Request() req: any, @Body() generateDto: GenerateTasksDto) {
    return this.taskService.generateTasksForLead(
      generateDto.leadId,
      generateDto.stepId,
      req.user.companyId,
    );
  }

  @Post('process-expired')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async processExpiredTasks(@Request() req: any) {
    const count = await this.taskAutomationService.processExpiredTasks(req.user.companyId);
    return { processedTasks: count };
  }

  @Post('lead/:leadId/cancel-tasks')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async cancelLeadTasks(
    @Request() req: any,
    @Param('leadId') leadId: string,
    @Body('reason') reason?: string,
  ) {
    const count = await this.taskAutomationService.cancelLeadTasks(
      leadId,
      req.user.companyId,
      reason,
    );
    return { cancelledTasks: count };
  }

  @Post('lead/:leadId/reactivate-tasks')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async reactivateLeadTasks(
    @Request() req: any,
    @Param('leadId') leadId: string,
  ) {
    const count = await this.taskAutomationService.reactivateLeadTasks(
      leadId,
      req.user.companyId,
    );
    return { reactivatedTasks: count };
  }
}