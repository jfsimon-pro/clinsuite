import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CrmService, CreateFunnelDto, UpdateFunnelDto, CreateFunnelStepDto, UpdateFunnelStepDto, ReorderStepsDto } from './crm.service';
// import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) { }

  // ===== FUNNEL ENDPOINTS =====

  @Post('funnels')
  async createFunnel(@Body() data: { name: string; unitId?: string }, @Request() req) {
    const createFunnelDto: CreateFunnelDto = {
      name: data.name,
      companyId: req.user.companyId,
      unitId: data.unitId,
    };
    return this.crmService.createFunnel(createFunnelDto);
  }

  @Get('funnels')
  async getFunnels(@Request() req, @Query('unitId') unitId?: string) {
    return this.crmService.getFunnels(req.user.companyId, unitId);
  }

  @Get('funnels/:id')
  async getFunnel(@Param('id') id: string, @Request() req) {
    return this.crmService.getFunnel(id, req.user.companyId);
  }

  @Put('funnels/:id')
  async updateFunnel(
    @Param('id') id: string,
    @Body() data: UpdateFunnelDto,
    @Request() req,
  ) {
    return this.crmService.updateFunnel(id, data, req.user.companyId);
  }

  @Delete('funnels/:id')
  async deleteFunnel(@Param('id') id: string, @Request() req) {
    return this.crmService.deleteFunnel(id, req.user.companyId);
  }

  // ===== FUNNEL STEP ENDPOINTS =====

  @Post('funnels/:funnelId/steps')
  async createFunnelStep(
    @Param('funnelId') funnelId: string,
    @Body() data: { name: string; order: number; tipoConceitual?: string },
    @Request() req,
  ) {
    console.log('🔍 DEBUG - Dados recebidos:', data);
    const createStepDto: CreateFunnelStepDto = {
      name: data.name,
      order: data.order,
      funnelId,
      tipoConceitual: data.tipoConceitual as any || 'CAPTACAO',
    };
    console.log('🔍 DEBUG - DTO criado:', createStepDto);
    const result = await this.crmService.createFunnelStep(createStepDto, req.user.companyId);
    console.log('🔍 DEBUG - Resultado:', JSON.stringify(result, null, 2));
    return result;
  }

  @Put('steps/:id')
  async updateFunnelStep(
    @Param('id') id: string,
    @Body() data: UpdateFunnelStepDto,
    @Request() req,
  ) {
    return this.crmService.updateFunnelStep(id, data, req.user.companyId);
  }

  @Delete('steps/:id')
  async deleteFunnelStep(@Param('id') id: string, @Request() req) {
    return this.crmService.deleteFunnelStep(id, req.user.companyId);
  }

  @Put('funnels/:funnelId/reorder-steps')
  async reorderSteps(
    @Param('funnelId') funnelId: string,
    @Body() data: ReorderStepsDto,
    @Request() req,
  ) {
    return this.crmService.reorderSteps(funnelId, data, req.user.companyId);
  }

  @Post('templates/install')
  async installFunnelTemplates(@Request() req) {
    const companyId = req.user.companyId;
    return this.crmService.installFunnelTemplates(companyId);
  }

  @Get('templates')
  async getFunnelTemplates() {
    return this.crmService.getFunnelTemplates();
  }

  // ===== LEAD ENDPOINTS =====
  // Leads são gerenciados pelo LeadsController separado

  // @Get('leads/:id')
  // async getLead(@Param('id') id: string, @Request() req) {
  //   return this.crmService.getLead(id, req.user.companyId);
  // }

  // @Put('leads/:id')
  // async updateLead(
  //   @Param('id') id: string,
  //   @Body() data: UpdateLeadDto,
  //   @Request() req,
  // ) {
  //   return this.crmService.updateLead(id, data, req.user.companyId);
  // }

  // @Delete('leads/:id')
  // async deleteLead(@Param('id') id: string, @Request() req) {
  //   return this.crmService.deleteLead(id, req.user.companyId);
  // }

  // @Put('leads/:id/move')
  // async moveLeadToStep(
  //   @Param('id') id: string,
  //   @Body() data: { stepId: string },
  //   @Request() req,
  // ) {
  //   return this.crmService.moveLeadToStep(id, data.stepId, req.user.companyId);
  // }
} 