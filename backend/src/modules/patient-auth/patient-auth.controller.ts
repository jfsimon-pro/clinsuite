import { Controller, Post, Get, Body, UseGuards, Request, Put } from '@nestjs/common';
import { PatientAuthService } from './patient-auth.service';
import { PatientAuthGuard } from './guards/patient-auth.guard';
import {
    PatientSetupDto,
    PatientLoginDto,
    PatientChangePasswordDto,
    PatientUpdateProfileDto,
} from './dto/patient-auth.dto';

@Controller('patient-auth')
export class PatientAuthController {
    constructor(private patientAuthService: PatientAuthService) { }

    /**
     * PRIMEIRO ACESSO - Criar senha
     */
    @Post('setup')
    async setup(@Body() data: PatientSetupDto) {
        return this.patientAuthService.setup(data);
    }

    /**
     * LOGIN
     */
    @Post('login')
    async login(@Body() data: PatientLoginDto) {
        return this.patientAuthService.login(data);
    }

    /**
     * OBTER DADOS DO PACIENTE LOGADO
     */
    @Get('me')
    @UseGuards(PatientAuthGuard)
    async getMe(@Request() req) {
        return this.patientAuthService.getMe(req.patient.id);
    }

    /**
     * TROCAR SENHA
     */
    @Put('change-password')
    @UseGuards(PatientAuthGuard)
    async changePassword(@Request() req, @Body() data: PatientChangePasswordDto) {
        return this.patientAuthService.changePassword(req.patient.id, data);
    }

    /**
     * ATUALIZAR PERFIL
     */
    @Put('profile')
    @UseGuards(PatientAuthGuard)
    async updateProfile(@Request() req, @Body() data: PatientUpdateProfileDto) {
        return this.patientAuthService.updateProfile(req.patient.id, data);
    }

    /**
     * OBTER CONSULTAS
     */
    @Get('appointments')
    @UseGuards(PatientAuthGuard)
    async getAppointments(@Request() req) {
        return this.patientAuthService.getAppointments(req.patient.id);
    }

    /**
     * OBTER DOCUMENTOS
     */
    @Get('documents')
    @UseGuards(PatientAuthGuard)
    async getDocuments(@Request() req) {
        return this.patientAuthService.getDocuments(req.patient.id);
    }

    /**
     * OBTER PAGAMENTOS
     */
    @Get('payments')
    @UseGuards(PatientAuthGuard)
    async getPayments(@Request() req) {
        return this.patientAuthService.getPayments(req.patient.id);
    }

    /**
     * OBTER ODONTOGRAMA
     */
    @Get('odontogram')
    @UseGuards(PatientAuthGuard)
    async getOdontogram(@Request() req) {
        return this.patientAuthService.getOdontogram(req.patient.id);
    }
}
