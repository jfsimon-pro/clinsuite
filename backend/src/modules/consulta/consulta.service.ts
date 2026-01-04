import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConsultaService {
    constructor(private prisma: PrismaService) { }

    async createConsulta(data: any, companyId: string) {
        console.log('🔍 [DEBUG] createConsulta chamado com:', {
            leadId: data.leadId,
            proximaConsulta: data.proximaConsulta,
            proximaConsultaTipo: typeof data.proximaConsulta,
            allData: data
        });

        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: data.leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        // Validar proximaConsulta se fornecida
        let proximaConsultaDate: Date | null = null;
        if (data.proximaConsulta) {
            const tempDate = new Date(data.proximaConsulta);
            if (isNaN(tempDate.getTime())) {
                console.error('❌ [DEBUG] Data inválida:', data.proximaConsulta);
                throw new Error(`Data de próxima consulta inválida: ${data.proximaConsulta}. Use o formato correto (YYYY-MM-DDTHH:mm)`);
            }
            proximaConsultaDate = tempDate;
        }

        // Usar transação para garantir atomicidade
        return this.prisma.$transaction(async (tx) => {
            // Criar a consulta
            const consulta = await tx.consulta.create({
                data: {
                    leadId: data.leadId,
                    dentistaId: data.dentistaId,
                    dataConsulta: new Date(data.dataConsulta),
                    duracao: data.duracao || 60,
                    procedimentos: data.procedimentos || [],
                    dentesAtendidos: data.dentesAtendidos || [],
                    anestesiaUsada: data.anestesiaUsada,
                    materiaisUsados: data.materiaisUsados,
                    observacoes: data.observacoes,
                    compareceu: data.compareceu !== undefined ? data.compareceu : true,
                    valorCobrado: data.valorCobrado,
                    proximaConsulta: proximaConsultaDate,
                },
                include: {
                    lead: {
                        select: { id: true, name: true, phone: true },
                    },
                    dentista: {
                        select: { id: true, name: true, email: true },
                    },
                },
            });

            console.log('✅ [DEBUG] Consulta criada, proximaConsulta:', consulta.proximaConsulta);

            // Se há próxima consulta agendada, atualizar dataConsulta do Lead
            if (proximaConsultaDate) {
                console.log('📅 [DEBUG] Atualizando Lead com proximaConsulta:', proximaConsultaDate);
                const leadAtualizado = await tx.lead.update({
                    where: { id: data.leadId },
                    data: {
                        dataConsulta: proximaConsultaDate,
                        duracaoConsulta: data.duracao || 60,
                    },
                });
                console.log('✅ [DEBUG] Lead atualizado, dataConsulta:', leadAtualizado.dataConsulta);
            } else {
                console.log('⚠️  [DEBUG] proximaConsulta está vazio/null, não atualizará o Lead');
            }

            return this.transformConsulta(consulta);
        });
    }

    private transformConsulta(consulta: any) {
        if (!consulta) return null;
        return {
            ...consulta,
            dataConsulta: consulta.dataConsulta?.toISOString(),
            proximaConsulta: consulta.proximaConsulta?.toISOString(),
            createdAt: consulta.createdAt?.toISOString(),
            updatedAt: consulta.updatedAt?.toISOString(),
        };
    }

    async getConsultasByLead(leadId: string, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        const consultas = await this.prisma.consulta.findMany({
            where: { leadId },
            include: {
                dentista: {
                    select: { id: true, name: true, email: true },
                },
                prescricoes: true,
            },
            orderBy: { dataConsulta: 'desc' },
        });

        return consultas.map(c => this.transformConsulta(c));
    }

    async getConsulta(id: string, companyId: string) {
        const consulta = await this.prisma.consulta.findFirst({
            where: {
                id,
                lead: { companyId },
            },
            include: {
                lead: {
                    select: { id: true, name: true, phone: true },
                },
                dentista: {
                    select: { id: true, name: true, email: true },
                },
                prescricoes: true,
            },
        });

        if (!consulta) {
            throw new NotFoundException('Consulta não encontrada');
        }

        return this.transformConsulta(consulta);
    }

    async updateConsulta(id: string, data: any, companyId: string) {
        const consulta = await this.prisma.consulta.findFirst({
            where: {
                id,
                lead: { companyId },
            },
        });

        if (!consulta) {
            throw new NotFoundException('Consulta não encontrada');
        }

        // Usar transação para garantir atomicidade
        return this.prisma.$transaction(async (tx) => {
            // Atualizar a consulta
            const consultaAtualizada = await tx.consulta.update({
                where: { id },
                data: {
                    dataConsulta: data.dataConsulta ? new Date(data.dataConsulta) : undefined,
                    duracao: data.duracao,
                    procedimentos: data.procedimentos,
                    dentesAtendidos: data.dentesAtendidos,
                    anestesiaUsada: data.anestesiaUsada,
                    materiaisUsados: data.materiaisUsados,
                    observacoes: data.observacoes,
                    compareceu: data.compareceu,
                    valorCobrado: data.valorCobrado,
                    proximaConsulta: data.proximaConsulta ? new Date(data.proximaConsulta) : null,
                },
                include: {
                    lead: {
                        select: { id: true, name: true, phone: true },
                    },
                    dentista: {
                        select: { id: true, name: true, email: true },
                    },
                },
            });

            // Se proximaConsulta foi atualizada, sincronizar com Lead
            if (data.proximaConsulta !== undefined) {
                await tx.lead.update({
                    where: { id: consulta.leadId },
                    data: {
                        dataConsulta: data.proximaConsulta ? new Date(data.proximaConsulta) : null,
                        duracaoConsulta: data.duracao || consulta.duracao,
                    },
                });
            }

            return this.transformConsulta(consultaAtualizada);
        });
    }

    async deleteConsulta(id: string, companyId: string) {
        const consulta = await this.prisma.consulta.findFirst({
            where: {
                id,
                lead: { companyId },
            },
        });

        if (!consulta) {
            throw new NotFoundException('Consulta não encontrada');
        }

        return this.prisma.consulta.delete({
            where: { id },
        });
    }
}
