import { Module } from '@nestjs/common';
import { WhatsAppConfigService } from './whatsapp-config.service';
import { WhatsAppConfigController } from './whatsapp-config.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [WhatsAppConfigController],
    providers: [WhatsAppConfigService],
    exports: [WhatsAppConfigService],
})
export class WhatsAppConfigModule { }
