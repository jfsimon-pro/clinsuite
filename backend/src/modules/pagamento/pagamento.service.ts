import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PagamentoService {
    constructor(private prisma: PrismaService) { }

    async getAllPagamentos(companyId: string, unitId?: string) {
        const pagamentos = await this.prisma.pagamento.findMany({
            where: {
                lead: {
                    companyId,
                    ...(unitId && { unitId }), // Filtrar por unidade se especificada
                },
            },
            include: {
                lead: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        unitId: true,
                    },
                },
            },
            orderBy: { dataVencimento: 'desc' },
        });

        // Conforme regra de datas: converter para ISO string
        return pagamentos.map(p => ({
            ...p,
            dataVencimento: p.dataVencimento?.toISOString(),
            dataPagamento: p.dataPagamento?.toISOString(),
            createdAt: p.createdAt?.toISOString(),
        }));
    }

    async createPagamento(data: any, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: data.leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        return this.prisma.pagamento.create({
            data: {
                leadId: data.leadId,
                valor: data.valor,
                formaPagamento: data.formaPagamento,
                dataVencimento: new Date(data.dataVencimento),
                dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
                status: data.status || 'PENDENTE',
                numeroParcela: data.numeroParcela,
                totalParcelas: data.totalParcelas,
                observacoes: data.observacoes,
            },
        });
    }

    async getPagamentosByLead(leadId: string, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        return this.prisma.pagamento.findMany({
            where: { leadId },
            orderBy: [
                { numeroParcela: 'asc' },
                { dataVencimento: 'asc' },
            ],
        });
    }

    async updatePagamento(id: string, data: any, companyId: string) {
        const pagamento = await this.prisma.pagamento.findFirst({
            where: {
                id,
                lead: { companyId },
            },
        });

        if (!pagamento) {
            throw new NotFoundException('Pagamento não encontrado');
        }

        return this.prisma.pagamento.update({
            where: { id },
            data: {
                valor: data.valor,
                formaPagamento: data.formaPagamento,
                dataVencimento: data.dataVencimento ? new Date(data.dataVencimento) : undefined,
                dataPagamento: data.dataPagamento ? new Date(data.dataPagamento) : null,
                status: data.status,
                numeroParcela: data.numeroParcela,
                totalParcelas: data.totalParcelas,
                observacoes: data.observacoes,
            },
        });
    }

    async marcarComoPago(id: string, companyId: string) {
        const pagamento = await this.prisma.pagamento.findFirst({
            where: {
                id,
                lead: { companyId },
            },
        });

        if (!pagamento) {
            throw new NotFoundException('Pagamento não encontrado');
        }

        return this.prisma.pagamento.update({
            where: { id },
            data: {
                status: 'PAGO',
                dataPagamento: new Date(),
            },
        });
    }

    async deletePagamento(id: string, companyId: string) {
        const pagamento = await this.prisma.pagamento.findFirst({
            where: {
                id,
                lead: { companyId },
            },
        });

        if (!pagamento) {
            throw new NotFoundException('Pagamento não encontrado');
        }

        return this.prisma.pagamento.delete({
            where: { id },
        });
    }
}
