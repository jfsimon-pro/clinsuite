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
  ParseBoolPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { StageTaskRuleService } from './stage-task-rule.service';
import { 
  CreateStageTaskRuleDto, 
  UpdateStageTaskRuleDto, 
  ReorderStageTaskRulesDto,
  DuplicateStageTaskRulesDto,
} from './dto/stage-task-rule.dto';

@Controller('crm/task-rules')
@UseGuards(JwtAuthGuard)
export class StageTaskRuleController {
  constructor(private stageTaskRuleService: StageTaskRuleService) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@Request() req: any, @Body() createDto: CreateStageTaskRuleDto) {
    return this.stageTaskRuleService.create(createDto, req.user.companyId);
  }

  @Get()
  async findAll(@Request() req: any, @Query('stepId') stepId?: string) {
    if (stepId) {
      return this.stageTaskRuleService.findAllByStep(stepId, req.user.companyId);
    }
    return this.stageTaskRuleService.findAllByCompany(req.user.companyId);
  }

  @Get('step/:stepId')
  async findByStep(@Request() req: any, @Param('stepId') stepId: string) {
    return this.stageTaskRuleService.findAllByStep(stepId, req.user.companyId);
  }

  @Get('stats')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getStatistics(@Request() req: any) {
    return this.stageTaskRuleService.getStatistics(req.user.companyId);
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.stageTaskRuleService.findById(id, req.user.companyId);
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateStageTaskRuleDto,
  ) {
    return this.stageTaskRuleService.update(id, updateDto, req.user.companyId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.stageTaskRuleService.delete(id, req.user.companyId);
  }

  @Put('step/:stepId/reorder')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(
    @Request() req: any,
    @Param('stepId') stepId: string,
    @Body() reorderDto: ReorderStageTaskRulesDto,
  ) {
    await this.stageTaskRuleService.reorderRules(
      stepId,
      reorderDto.ruleIds,
      req.user.companyId,
    );
  }

  @Post('step/:stepId/duplicate')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async duplicate(
    @Request() req: any,
    @Param('stepId') fromStepId: string,
    @Body() duplicateDto: DuplicateStageTaskRulesDto,
  ) {
    return this.stageTaskRuleService.duplicateRulesFromStep(
      fromStepId,
      duplicateDto.toStepId,
      req.user.companyId,
    );
  }

  @Put(':id/toggle')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async toggleActive(
    @Request() req: any,
    @Param('id') id: string,
    @Query('active', ParseBoolPipe) isActive: boolean,
  ) {
    return this.stageTaskRuleService.toggleActive(id, isActive, req.user.companyId);
  }
}