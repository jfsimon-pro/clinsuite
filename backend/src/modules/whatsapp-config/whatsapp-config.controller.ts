import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WhatsAppConfigService, SaveConfigDto } from './whatsapp-config.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('whatsapp-config')
@UseGuards(JwtAuthGuard)
export class WhatsAppConfigController {
    constructor(private readonly service: WhatsAppConfigService) { }

    @Get()
    async getConfig(@Request() req) {
        const companyId = req.user.companyId;
        return this.service.getConfig(companyId);
    }

    @Post()
    async saveConfig(@Request() req, @Body() dto: SaveConfigDto) {
        const companyId = req.user.companyId;
        return this.service.saveConfig(companyId, dto);
    }
}
