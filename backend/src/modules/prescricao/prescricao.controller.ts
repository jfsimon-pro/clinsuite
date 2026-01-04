import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrescricaoService } from './prescricao.service';

@Controller('prescricoes')
@UseGuards(JwtAuthGuard)
export class PrescricaoController {
    constructor(private readonly prescricaoService: PrescricaoService) { }

    @Post()
    async createPrescricao(@Body() data: any, @Request() req) {
        return this.prescricaoService.createPrescricao({
            ...data,
            dentistaId: req.user.id,
        }, req.user.companyId);
    }

    @Get('consulta/:consultaId')
    async getPrescricoesByConsulta(@Param('consultaId') consultaId: string, @Request() req) {
        return this.prescricaoService.getPrescricoesByConsulta(consultaId, req.user.companyId);
    }

    @Get('lead/:leadId')
    async getPrescricoesByLead(@Param('leadId') leadId: string, @Request() req) {
        return this.prescricaoService.getPrescricoesByLead(leadId, req.user.companyId);
    }
}
