import { Module } from '@nestjs/common';
import { OdontogramaController } from './odontograma.controller';
import { OdontogramaService } from './odontograma.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [OdontogramaController],
    providers: [OdontogramaService],
    exports: [OdontogramaService],
})
export class OdontogramaModule { }
