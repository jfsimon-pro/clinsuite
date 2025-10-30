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
  UseInterceptors,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CrmService } from './crm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (request.method === 'PUT' && request.url.includes('/crm/leads/')) {
      console.log('🔴 INTERCEPTOR - RAW BODY (antes do ValidationPipe):', JSON.stringify(request.body, null, 2));
      console.log('🔴 INTERCEPTOR - duracaoConsulta RAW:', request.body.duracaoConsulta, typeof request.body.duracaoConsulta);
    }
    return next.handle();
  }
}

interface CreateLeadDto {
  phone: string;
  name?: string;
  funnelId: string;
  stepId: string;
  responsibleId?: string;
  valorVenda?: number;
  dataConsulta?: string;
  tipoProcura?: string;
  meioCaptacao?: string;
  closerNegociacao?: string;
  closerFollow?: string;
  dentista?: string;
  motivoPerda?: string;
  dentistaParticipou?: string;
  previsaoFechamento?: string;
  objecao?: string;
  observacoes?: string;
}

interface UpdateLeadDto {
  phone?: string;
  name?: string;
  funnelId?: string;  // ← ADICIONADO!
  stepId?: string;
  responsibleId?: string;
  valorVenda?: number;
  dataConsulta?: string;
  tipoProcura?: string;
  meioCaptacao?: string;
  closerNegociacao?: string;
  closerFollow?: string;
  dentista?: string;
  motivoPerda?: string;
  dentistaParticipou?: string;
  previsaoFechamento?: string;
  objecao?: string;
  observacoes?: string;
}

@Controller('crm/leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly crmService: CrmService) {}

  @Post()
  async createLead(@Body() data: CreateLeadDto, @Request() req) {
    // Implementação temporária simplificada
    return this.crmService.createLead(data as any, req.user.companyId);
  }

  @Get()
  async getLeads(
    @Request() req,
    @Query('funnelId') funnelId?: string,
    @Query('stepId') stepId?: string,
  ) {
    return this.crmService.getLeads(req.user.companyId, funnelId, stepId);
  }

  @Get('my-patients')
  async getMyPatients(@Request() req) {
    return this.crmService.getLeadsByDentist(req.user.id, req.user.companyId);
  }

  @Get(':id')
  async getLead(@Param('id') id: string, @Request() req) {
    return this.crmService.getLead(id, req.user.companyId);
  }

  @Put(':id')
  @UseInterceptors(LoggingInterceptor)
  async updateLead(
    @Param('id') id: string,
    @Body() data: UpdateLeadDto,
    @Request() req,
  ) {
    console.log('🟢 CONTROLLER - Dados APÓS ValidationPipe:', JSON.stringify(data, null, 2));
    console.log('🟢 CONTROLLER - duracaoConsulta APÓS ValidationPipe:', (data as any).duracaoConsulta, typeof (data as any).duracaoConsulta);
    console.log('🟢 CONTROLLER - Todas as keys:', Object.keys(data));
    return this.crmService.updateLead(id, data as any, req.user.companyId);
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: string, @Request() req) {
    return this.crmService.deleteLead(id, req.user.companyId);
  }

  @Put(':id/move')
  async moveLeadToStep(
    @Param('id') id: string,
    @Body() data: { stepId: string },
    @Request() req,
  ) {
    return this.crmService.moveLeadToStep(id, data.stepId, req.user.companyId);
  }
}