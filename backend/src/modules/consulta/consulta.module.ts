import { Module } from '@nestjs/common';
import { ConsultaController } from './consulta.controller';
import { ConsultaService } from './consulta.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ConsultaController],
    providers: [ConsultaService],
    exports: [ConsultaService],
})
export class ConsultaModule { }
