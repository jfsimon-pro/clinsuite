import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PagamentoService } from './pagamento.service';

@Controller('pagamentos')
@UseGuards(JwtAuthGuard)
export class PagamentoController {
    constructor(private readonly pagamentoService: PagamentoService) { }

    @Get()
    async getAllPagamentos(@Request() req, @Query('unitId') unitId?: string) {
        return this.pagamentoService.getAllPagamentos(req.user.companyId, unitId);
    }

    @Post()
    async createPagamento(@Body() data: any, @Request() req) {
        return this.pagamentoService.createPagamento(data, req.user.companyId);
    }

    @Get('lead/:leadId')
    async getPagamentosByLead(@Param('leadId') leadId: string, @Request() req) {
        return this.pagamentoService.getPagamentosByLead(leadId, req.user.companyId);
    }

    @Put(':id')
    async updatePagamento(
        @Param('id') id: string,
        @Body() data: any,
        @Request() req,
    ) {
        return this.pagamentoService.updatePagamento(id, data, req.user.companyId);
    }

    @Delete(':id')
    async deletePagamento(@Param('id') id: string, @Request() req) {
        return this.pagamentoService.deletePagamento(id, req.user.companyId);
    }

    @Put(':id/marcar-pago')
    async marcarComoPago(@Param('id') id: string, @Request() req) {
        return this.pagamentoService.marcarComoPago(id, req.user.companyId);
    }
}
