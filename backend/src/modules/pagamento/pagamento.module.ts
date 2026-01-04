import { Module } from '@nestjs/common';
import { PagamentoController } from './pagamento.controller';
import { PagamentoService } from './pagamento.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PagamentoController],
    providers: [PagamentoService],
    exports: [PagamentoService],
})
export class PagamentoModule { }
