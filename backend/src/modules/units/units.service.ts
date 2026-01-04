import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUnitDto, UpdateUnitDto } from './units.dto';

@Injectable()
export class UnitsService {
    constructor(private prisma: PrismaService) { }

    async createUnit(data: CreateUnitDto, companyId: string, userId: string) {
        // Verificar se code já existe para esta company (se fornecido)
        if (data.code) {
            const existing = await this.prisma.unit.findUnique({
                where: {
                    companyId_code: {
                        companyId,
                        code: data.code,
                    },
                },
            });

            if (existing) {
                throw new BadRequestException(`Já existe uma unidade com o código '${data.code}'`);
            }
        }

        // Criar unidade
        return this.prisma.unit.create({
            data: {
                ...data,
                companyId,
            },
            include: {
                company: {
                    select: { id: true, name: true },
                },
                manager: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: {
                        funnels: true,
                        leads: true,
                        users: true,
                    },
                },
            },
        });
    }

    async getUnits(companyId: string, userId: string, userRole: string) {
        // Se é ADMIN, retorna todas as unidades da company
        // Se é MANAGER, retorna apenas unidades que gerencia
        // Se é DENTIST, retorna apenas sua unidade principal

        let where: any = { companyId, active: true };

        if (userRole === 'MANAGER') {
            where.managerId = userId;
        } else if (userRole === 'DENTIST') {
            // Buscar unitId do usuário
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { unitId: true },
            });

            if (user?.unitId) {
                where.id = user.unitId;
            } else {
                // Se dentista não tem unidade, retorna vazio
                return [];
            }
        }

        return this.prisma.unit.findMany({
            where,
            include: {
                company: {
                    select: { id: true, name: true },
                },
                manager: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: {
                        funnels: true,
                        leads: true,
                        users: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    async getUnitById(id: string, companyId: string, userId: string, userRole: string) {
        const unit = await this.prisma.unit.findFirst({
            where: { id, companyId },
            include: {
                company: {
                    select: { id: true, name: true },
                },
                manager: {
                    select: { id: true, name: true, email: true },
                },
                _count: {
                    select: {
                        funnels: true,
                        leads: true,
                        users: true,
                    },
                },
            },
        });

        if (!unit) {
            throw new NotFoundException('Unidade não encontrada');
        }

        // Verificar permissões
        if (userRole === 'MANAGER' && unit.managerId !== userId) {
            throw new ForbiddenException('Você não tem permissão para acessar esta unidade');
        } else if (userRole === 'DENTIST') {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { unitId: true },
            });

            if (user?.unitId !== id) {
                throw new ForbiddenException('Você não tem permissão para acessar esta unidade');
            }
        }

        return unit;
    }

    async updateUnit(id: string, data: UpdateUnitDto, companyId: string, userId: string, userRole: string) {
        // Verificar se existe
        const unit = await this.getUnitById(id, companyId, userId, userRole);

        // MANAGER pode atualizar apenas unidades que gerencia
        if (userRole === 'MANAGER' && unit.managerId !== userId) {
            throw new ForbiddenException('Você não tem permissão para editar esta unidade');
        }

        // DENTIST não pode editar unidades
        if (userRole === 'DENTIST') {
            throw new ForbiddenException('Você não tem permissão para editar unidades');
        }

        // Verificar se code já existe (se está mudando)
        if (data.code && data.code !== unit.code) {
            const existing = await this.prisma.unit.findUnique({
                where: {
                    companyId_code: {
                        companyId,
                        code: data.code,
                    },
                },
            });

            if (existing) {
                throw new BadRequestException(`Já existe uma unidade com o código '${data.code}'`);
            }
        }

        return this.prisma.unit.update({
            where: { id },
            data,
            include: {
                company: {
                    select: { id: true, name: true },
                },
                manager: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: {
                        funnels: true,
                        leads: true,
                        users: true,
                    },
                },
            },
        });
    }

    async deleteUnit(id: string, companyId: string, userRole: string) {
        // Apenas ADMIN pode deletar unidades
        if (userRole !== 'ADMIN') {
            throw new ForbiddenException('Apenas administradores podem deletar unidades');
        }

        const unit = await this.prisma.unit.findFirst({
            where: { id, companyId },
            include: {
                _count: {
                    select: {
                        funnels: true,
                        leads: true,
                        users: true,
                    },
                },
            },
        });

        if (!unit) {
            throw new NotFoundException('Unidade não encontrada');
        }

        // Verificar se é a unidade SEDE
        if (unit.code === 'SEDE') {
            throw new BadRequestException('Não é possível deletar a unidade Sede');
        }

        // Verificar se tem dados associados
        if (unit._count.funnels > 0 || unit._count.leads > 0) {
            throw new BadRequestException(
                `Não é possível deletar esta unidade pois ela possui ${unit._count.funnels} funil(is) e ${unit._count.leads} lead(s). Mova os dados para outra unidade primeiro.`
            );
        }

        // Soft delete - desativar ao invés de deletar
        return this.prisma.unit.update({
            where: { id },
            data: { active: false },
        });
    }
}
