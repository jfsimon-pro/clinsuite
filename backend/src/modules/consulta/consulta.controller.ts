import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConsultaService } from './consulta.service';

@Controller('consultas')
@UseGuards(JwtAuthGuard)
export class ConsultaController {
    constructor(private readonly consultaService: ConsultaService) { }

    @Post()
    async createConsulta(@Body() data: any, @Request() req) {
        return this.consultaService.createConsulta({
            ...data,
            dentistaId: req.user.id,
        }, req.user.companyId);
    }

    @Get('lead/:leadId')
    async getConsultasByLead(@Param('leadId') leadId: string, @Request() req) {
        return this.consultaService.getConsultasByLead(leadId, req.user.companyId);
    }

    @Get(':id')
    async getConsulta(@Param('id') id: string, @Request() req) {
        return this.consultaService.getConsulta(id, req.user.companyId);
    }

    @Put(':id')
    async updateConsulta(
        @Param('id') id: string,
        @Body() data: any,
        @Request() req,
    ) {
        return this.consultaService.updateConsulta(id, data, req.user.companyId);
    }

    @Delete(':id')
    async deleteConsulta(@Param('id') id: string, @Request() req) {
        return this.consultaService.deleteConsulta(id, req.user.companyId);
    }
}
