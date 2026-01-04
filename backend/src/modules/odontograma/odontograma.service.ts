import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OdontogramaService {
    constructor(private prisma: PrismaService) { }

    async getOdontograma(leadId: string, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        let odontograma = await this.prisma.odontograma.findUnique({
            where: { leadId },
        });

        // Se não existe, criar um odontograma vazio
        if (!odontograma) {
            odontograma = await this.prisma.odontograma.create({
                data: {
                    leadId,
                    dentes: this.createEmptyOdontograma(),
                },
            });
        }

        return odontograma;
    }

    async createOdontograma(leadId: string, dentes: any, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        // Verificar se já existe um odontograma
        const existing = await this.prisma.odontograma.findUnique({
            where: { leadId },
        });

        if (existing) {
            // Se já existe, atualizar
            return this.updateOdontograma(leadId, dentes, companyId);
        }

        return this.prisma.odontograma.create({
            data: {
                leadId,
                dentes: dentes || this.createEmptyOdontograma(),
            },
        });
    }

    async updateOdontograma(leadId: string, dentes: any, companyId: string) {
        // Verificar se o lead existe e pertence à empresa
        const lead = await this.prisma.lead.findFirst({
            where: { id: leadId, companyId },
        });

        if (!lead) {
            throw new NotFoundException('Paciente não encontrado');
        }

        const odontograma = await this.prisma.odontograma.findUnique({
            where: { leadId },
        });

        if (!odontograma) {
            throw new NotFoundException('Odontograma não encontrado');
        }

        return this.prisma.odontograma.update({
            where: { leadId },
            data: { dentes },
        });
    }

    private createEmptyOdontograma() {
        const dentes = {};
        // Criar estrutura vazia para os 32 dentes
        for (let i = 1; i <= 32; i++) {
            dentes[i] = {
                status: 'HIGIDO', // Dente saudável por padrão
                observacoes: '',
            };
        }
        return dentes;
    }
}
