import { Controller, Get, Post, Put, Body, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OdontogramaService } from './odontograma.service';

@Controller('odontograma')
@UseGuards(JwtAuthGuard)
export class OdontogramaController {
    constructor(private readonly odontogramaService: OdontogramaService) { }

    @Get('lead/:leadId')
    async getOdontograma(@Param('leadId') leadId: string, @Request() req) {
        return this.odontogramaService.getOdontograma(leadId, req.user.companyId);
    }

    @Post('lead/:leadId')
    async createOdontograma(
        @Param('leadId') leadId: string,
        @Body() data: any,
        @Request() req,
    ) {
        return this.odontogramaService.createOdontograma(leadId, data.dentes, req.user.companyId);
    }

    @Put('lead/:leadId')
    async updateOdontograma(
        @Param('leadId') leadId: string,
        @Body() data: any,
        @Request() req,
    ) {
        return this.odontogramaService.updateOdontograma(leadId, data.dentes, req.user.companyId);
    }
}
