import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DocumentoService {
    constructor(private prisma: PrismaService) { }

    async createDocumento(data: any, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: data.leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        return this.prisma.documento.create({
            data: {
                leadId: data.leadId,
                tipo: data.tipo, // 'FOTO', 'RAIO_X', 'PDF'
                categoria: data.categoria,
                url: data.url,
                descricao: data.descricao,
                uploadedBy: data.uploadedBy,
            },
            include: {
                uploader: {
                    select: { id: true, name: true },
                },
            },
        });
    }

    async getDocumentosByLead(leadId: string, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        return this.prisma.documento.findMany({
            where: { leadId },
            include: {
                uploader: {
                    select: { id: true, name: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteDocumento(id: string, companyId: string) {
        const documento = await this.prisma.documento.findFirst({
            where: {
                id,
                lead: { companyId },
            },
        });

        if (!documento) {
            throw new NotFoundException('Documento não encontrado');
        }

        return this.prisma.documento.delete({
            where: { id },
        });
    }
}
