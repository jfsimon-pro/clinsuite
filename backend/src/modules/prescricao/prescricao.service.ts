import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrescricaoService {
    constructor(private prisma: PrismaService) { }

    async createPrescricao(data: any, companyId: string) {
        // Verificar se a consulta existe
        const consulta = await this.prisma.consulta.findFirst({
            where: {
                id: data.consultaId,
                lead: { companyId },
            },
        });

        if (!consulta) {
            throw new NotFoundException('Consulta não encontrada');
        }

        return this.prisma.prescricao.create({
            data: {
                consultaId: data.consultaId,
                leadId: consulta.leadId,
                dentistaId: data.dentistaId,
                medicamentos: data.medicamentos,
                observacoes: data.observacoes,
            },
            include: {
                dentista: {
                    select: { id: true, name: true, email: true },
                },
                lead: {
                    select: { id: true, name: true, phone: true },
                },
            },
        });
    }

    async getPrescricoesByConsulta(consultaId: string, companyId: string) {
        // Verificar se a consulta existe
        const consulta = await this.prisma.consulta.findFirst({
            where: {
                id: consultaId,
                lead: { companyId },
            },
        });

        if (!consulta) {
            throw new NotFoundException('Consulta não encontrada');
        }

        return this.prisma.prescricao.findMany({
            where: { consultaId },
            include: {
                dentista: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPrescricoesByLead(leadId: string, companyId: string) {
        // Verificar se o lead existe
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        return this.prisma.prescricao.findMany({
            where: { leadId },
            include: {
                dentista: {
                    select: { id: true, name: true, email: true },
                },
                consulta: {
                    select: { id: true, dataConsulta: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
