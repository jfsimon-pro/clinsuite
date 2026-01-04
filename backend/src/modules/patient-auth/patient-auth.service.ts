import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { PatientSetupDto, PatientLoginDto, PatientChangePasswordDto, PatientUpdateProfileDto } from './dto/patient-auth.dto';

@Injectable()
export class PatientAuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    /**
     * PRIMEIRO ACESSO - Criar senha para o paciente
     * Regra: Só pode criar senha se dataConsulta !== null (é paciente!)
     */
    async setup(data: PatientSetupDto) {
        // Buscar lead pelo telefone e email
        const lead = await this.prisma.lead.findFirst({
            where: {
                phone: data.phone,
                email: data.email,
            },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado. Verifique seu telefone e email.');
        }

        // Validar se é realmente um paciente (tem consulta agendada)
        if (!lead.dataConsulta) {
            throw new BadRequestException('Você ainda não é um paciente. Agende uma consulta primeiro.');
        }

        // Verificar se já tem senha
        if (lead.password) {
            throw new BadRequestException('Você já possui uma senha. Use a opção "Esqueci minha senha" se necessário.');
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Atualizar lead com senha e habilitar portal
        const updatedLead = await this.prisma.lead.update({
            where: { id: lead.id },
            data: {
                password: hashedPassword,
                emailVerified: true, // Como não estamos enviando email, marcar como verificado
                portalEnabled: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                dataConsulta: true,
            },
        });

        return {
            message: 'Senha criada com sucesso! Você já pode fazer login.',
            patient: updatedLead,
        };
    }

    /**
     * LOGIN - Autenticar paciente
     */
    async login(data: PatientLoginDto) {
        // Buscar paciente pelo email
        const lead = await this.prisma.lead.findFirst({
            where: {
                email: data.email,
                emailVerified: true,
            },
            include: {
                company: {
                    select: { id: true, name: true, logoUrl: true, primaryColor: true },
                },
                dentistUser: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!lead) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        // Verificar se é paciente
        if (!lead.dataConsulta) {
            throw new UnauthorizedException('Você ainda não é um paciente');
        }

        // Verificar se tem senha
        if (!lead.password) {
            throw new UnauthorizedException('Você precisa criar uma senha primeiro. Use a opção "Primeiro Acesso".');
        }

        // Verificar se o portal está habilitado
        if (!lead.portalEnabled) {
            throw new UnauthorizedException('Seu acesso ao portal está desabilitado. Entre em contato com a clínica.');
        }

        // Verificar senha
        const isPasswordValid = await bcrypt.compare(data.password, lead.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou senha incorretos');
        }

        // Atualizar último login
        await this.prisma.lead.update({
            where: { id: lead.id },
            data: { lastLogin: new Date() },
        });

        // Gerar token JWT
        const payload = {
            sub: lead.id,
            email: lead.email,
            companyId: lead.companyId,
            type: 'patient', // Diferencia de user normal
        };

        const token = this.jwtService.sign(payload);

        return {
            token,
            patient: {
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                dataConsulta: lead.dataConsulta,
                company: lead.company,
                dentist: lead.dentistUser,
            },
        };
    }

    /**
     * OBTER DADOS DO PACIENTE LOGADO
     */
    async getMe(patientId: string) {
        const lead = await this.prisma.lead.findUnique({
            where: { id: patientId },
            include: {
                company: {
                    select: { id: true, name: true, logoUrl: true, primaryColor: true },
                },
                dentistUser: {
                    select: { id: true, name: true, email: true },
                },
                funnel: {
                    select: { id: true, name: true },
                },
                step: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: {
                        consultas: true,
                        documentos: true,
                        pagamentos: true,
                    },
                },
            },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        return {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            cpf: lead.cpf,
            dataNascimento: lead.dataNascimento,
            endereco: lead.endereco,
            cidade: lead.cidade,
            estado: lead.estado,
            cep: lead.cep,
            dataConsulta: lead.dataConsulta,
            statusVenda: lead.statusVenda,
            valorOrcamento: lead.valorOrcamento,
            valorVenda: lead.valorVenda,
            tipoProcura: lead.tipoProcura,
            observacoes: lead.observacoes,
            anamnese: lead.anamnese, // Adicionado para a página de saúde
            company: lead.company,
            dentist: lead.dentistUser,
            funnel: lead.funnel,
            step: lead.step,
            stats: {
                consultas: lead._count.consultas,
                documentos: lead._count.documentos,
                pagamentos: lead._count.pagamentos,
            },
        };
    }

    /**
     * TROCAR SENHA
     */
    async changePassword(patientId: string, data: PatientChangePasswordDto) {
        const lead = await this.prisma.lead.findUnique({
            where: { id: patientId },
        });

        if (!lead || !lead.password) {
            throw new NotFoundException('Paciente não encontrado');
        }

        // Verificar senha atual
        const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, lead.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Senha atual incorreta');
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(data.newPassword, 10);

        // Atualizar senha
        await this.prisma.lead.update({
            where: { id: patientId },
            data: { password: hashedPassword },
        });

        return { message: 'Senha alterada com sucesso' };
    }

    /**
     * ATUALIZAR PERFIL
     */
    async updateProfile(patientId: string, data: PatientUpdateProfileDto) {
        // Se está alterando o email, verificar se não está em uso
        if (data.email) {
            const existingEmail = await this.prisma.lead.findFirst({
                where: {
                    email: data.email,
                    id: { not: patientId },
                },
            });

            if (existingEmail) {
                throw new BadRequestException('Este email já está em uso');
            }
        }

        const updatedLead = await this.prisma.lead.update({
            where: { id: patientId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                endereco: data.endereco,
                cidade: data.cidade,
                estado: data.estado,
                cep: data.cep,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                endereco: true,
                cidade: true,
                estado: true,
                cep: true,
            },
        });

        return {
            message: 'Perfil atualizado com sucesso',
            patient: updatedLead,
        };
    }

    /**
     * OBTER CONSULTAS DO PACIENTE
     * Retorna a consulta agendada (do Lead) + consultas realizadas (tabela Consulta)
     */
    async getAppointments(patientId: string) {
        // Buscar o lead para pegar a consulta agendada
        const lead = await this.prisma.lead.findUnique({
            where: { id: patientId },
            include: {
                dentistUser: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        // Buscar consultas realizadas (tabela Consulta)
        const consultasRealizadas = await this.prisma.consulta.findMany({
            where: { leadId: patientId },
            include: {
                dentista: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { dataConsulta: 'desc' },
        });

        // Montar array de consultas
        const appointments: any[] = [];

        // Adicionar consulta agendada do Lead (se existir)
        if (lead?.dataConsulta) {
            appointments.push({
                id: `lead-${lead.id}`,
                tipo: 'AGENDADA',
                dataConsulta: lead.dataConsulta.toISOString(),
                duracao: lead.duracaoConsulta || 60,
                dentista: lead.dentistUser,
                procedimentos: lead.tipoProcura ? [lead.tipoProcura] : [],
                observacoes: lead.observacoes || null,
                compareceu: null, // Ainda não ocorreu
                source: 'lead',
            });
        }

        // Adicionar consultas realizadas
        for (const consulta of consultasRealizadas) {
            appointments.push({
                id: consulta.id,
                tipo: 'REALIZADA',
                dataConsulta: consulta.dataConsulta.toISOString(),
                duracao: consulta.duracao || 60,
                dentista: consulta.dentista,
                procedimentos: consulta.procedimentos || [],
                observacoes: consulta.observacoes || null,
                compareceu: consulta.compareceu,
                source: 'consulta',
            });
        }

        // Ordenar por data (mais recentes primeiro)
        appointments.sort((a, b) =>
            new Date(b.dataConsulta).getTime() - new Date(a.dataConsulta).getTime()
        );

        return appointments;
    }

    /**
     * OBTER DOCUMENTOS DO PACIENTE
     */
    async getDocuments(patientId: string) {
        const documents = await this.prisma.documento.findMany({
            where: { leadId: patientId },
            include: {
                uploader: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Converter datas para ISO string
        return documents.map(doc => ({
            ...doc,
            createdAt: doc.createdAt?.toISOString(),
        }));
    }

    /**
     * OBTER PAGAMENTOS DO PACIENTE
     */
    async getPayments(patientId: string) {
        const payments = await this.prisma.pagamento.findMany({
            where: { leadId: patientId },
            orderBy: { dataVencimento: 'asc' },
        });

        // Converter datas para ISO string
        return payments.map(payment => ({
            ...payment,
            dataVencimento: payment.dataVencimento?.toISOString(),
            dataPagamento: payment.dataPagamento?.toISOString(),
            createdAt: payment.createdAt?.toISOString(),
        }));
    }

    /**
     * OBTER ODONTOGRAMA DO PACIENTE
     */
    async getOdontogram(patientId: string) {
        const odontograma = await this.prisma.odontograma.findUnique({
            where: { leadId: patientId },
        });

        if (!odontograma) {
            return { dados: {} };
        }

        return {
            id: odontograma.id,
            dados: odontograma.dentes, // Campo no banco é 'dentes', mas frontend espera 'dados'
            createdAt: odontograma.createdAt?.toISOString(),
            updatedAt: odontograma.updatedAt?.toISOString(),
        };
    }
}
