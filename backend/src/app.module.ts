import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CrmModule } from './modules/crm/crm.module';
import { WhatsAppModule } from './modules/whatsapp/whatsapp.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { CompanyMiddleware } from './common/middleware/company.middleware';
import { DecimalInterceptor } from './common/interceptors/decimal.interceptor';
import configuration from './config/configuration';
import { QueueModule } from './common/queues/queue.module';
import { EventsModule } from './common/events/events.module';
import { WhatsAppConfigModule } from './modules/whatsapp-config/whatsapp-config.module';
import { ConsultaModule } from './modules/consulta/consulta.module';
import { OdontogramaModule } from './modules/odontograma/odontograma.module';
import { DocumentoModule } from './modules/documento/documento.module';
import { PagamentoModule } from './modules/pagamento/pagamento.module';
import { PrescricaoModule } from './modules/prescricao/prescricao.module';
import { UnitsModule } from './modules/units/units.module';
import { PatientAuthModule } from './modules/patient-auth/patient-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    EventsModule,
    QueueModule,
    AuthModule,
    CrmModule,
    WhatsAppModule,
    WhatsAppConfigModule,
    CompaniesModule,
    UnitsModule,
    ConsultaModule,
    OdontogramaModule,
    DocumentoModule,
    PagamentoModule,
    PrescricaoModule,
    PatientAuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DecimalInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanyMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'patient-auth/setup', method: RequestMethod.POST },
        { path: 'patient-auth/login', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
