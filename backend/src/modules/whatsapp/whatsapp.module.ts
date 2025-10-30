import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { VenomService } from './venom.service';
import { BaileysService } from './baileys.service';

@Module({
  controllers: [WhatsAppController],
  providers: [WhatsAppService, VenomService, BaileysService],
  exports: [WhatsAppService, VenomService, BaileysService],
})
export class WhatsAppModule {}
