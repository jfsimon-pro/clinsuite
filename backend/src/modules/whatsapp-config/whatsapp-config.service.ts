import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { randomBytes } from 'crypto';

export interface SaveConfigDto {
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
}

@Injectable()
export class WhatsAppConfigService {
    constructor(private prisma: PrismaService) { }

    async getConfig(companyId: string) {
        const config = await this.prisma.whatsAppConfig.findUnique({
            where: { companyId },
        });

        if (!config) {
            return null;
        }

        // Mascarar o token para segurança
        return {
            ...config,
            accessToken: this.maskToken(config.accessToken),
        };
    }

    async saveConfig(companyId: string, dto: SaveConfigDto) {
        const existing = await this.prisma.whatsAppConfig.findUnique({
            where: { companyId },
        });

        // Se já existe, atualiza
        if (existing) {
            // Se o token vier mascarado ou vazio, mantém o antigo
            const accessToken =
                dto.accessToken && !dto.accessToken.includes('***')
                    ? dto.accessToken
                    : existing.accessToken;

            return this.prisma.whatsAppConfig.update({
                where: { companyId },
                data: {
                    phoneNumberId: dto.phoneNumberId,
                    wabaId: dto.wabaId,
                    accessToken,
                },
            });
        }

        // Se não existe, cria novo
        // Gera um verifyToken aleatório seguro
        const verifyToken = randomBytes(32).toString('hex');

        return this.prisma.whatsAppConfig.create({
            data: {
                companyId,
                phoneNumberId: dto.phoneNumberId,
                wabaId: dto.wabaId,
                accessToken: dto.accessToken,
                verifyToken,
            },
        });
    }

    // Utilitário para mascarar token
    private maskToken(token: string): string {
        if (!token || token.length < 10) return '******';
        return `${token.substring(0, 4)}******${token.substring(token.length - 4)}`;
    }
}
