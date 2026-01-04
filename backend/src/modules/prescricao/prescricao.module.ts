import { Module } from '@nestjs/common';
import { PrescricaoController } from './prescricao.controller';
import { PrescricaoService } from './prescricao.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PrescricaoController],
    providers: [PrescricaoService],
    exports: [PrescricaoService],
})
export class PrescricaoModule { }
