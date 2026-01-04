import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PatientAuthController } from './patient-auth.controller';
import { PatientAuthService } from './patient-auth.service';
import { PatientAuthGuard } from './guards/patient-auth.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            global: false,
            secret: process.env.JWT_SECRET || 'your-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
    ],
    controllers: [PatientAuthController],
    providers: [PatientAuthService, PatientAuthGuard],
    exports: [PatientAuthService, PatientAuthGuard],
})
export class PatientAuthModule { }
