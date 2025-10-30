import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(createCompanyDto: CreateCompanyDto) {
    // Verificar se CNPJ já existe
    const existingCompany = await this.prisma.company.findUnique({
      where: { cnpj: createCompanyDto.cnpj },
    });

    if (existingCompany) {
      throw new ConflictException('CNPJ já cadastrado');
    }

    // Verificar se email do admin já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createCompanyDto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email do administrador já cadastrado');
    }

    // Criar empresa e admin em uma transação
    const result = await this.prisma.$transaction(async (prisma) => {
      // Criar empresa
      const company = await prisma.company.create({
        data: {
          name: createCompanyDto.name,
          cnpj: createCompanyDto.cnpj,
          logoUrl: createCompanyDto.logoUrl,
          primaryColor: createCompanyDto.primaryColor,
        },
      });

      // Criar admin
      const hashedPassword = await bcrypt.hash(createCompanyDto.adminPassword, 10);
      const admin = await prisma.user.create({
        data: {
          name: createCompanyDto.adminName,
          email: createCompanyDto.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          specialty: 'GENERAL',
          companyId: company.id,
        },
      });

      return { company, admin };
    });

    // Retornar sem a senha
    const { password, ...adminWithoutPassword } = result.admin;
    return {
      company: result.company,
      admin: adminWithoutPassword,
    };
  }

  async findAll() {
    const companies = await this.prisma.company.findMany({
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        leads: {
          select: {
            id: true,
          },
        },
        funnels: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            leads: true,
            funnels: true,
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return companies;
  }

  async findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            specialty: true,
            createdAt: true,
          },
        },
        funnels: true,
        _count: {
          select: {
            users: true,
            leads: true,
            funnels: true,
            tasks: true,
          },
        },
      },
    });
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(id: string) {
    // Soft delete ou hard delete? Por segurança, vou manter hard delete
    // mas em produção deveria ser soft delete
    return this.prisma.company.delete({
      where: { id },
    });
  }

  async getStats() {
    const totalCompanies = await this.prisma.company.count();
    const totalUsers = await this.prisma.user.count();
    const totalLeads = await this.prisma.lead.count();

    return {
      totalCompanies,
      totalUsers,
      totalLeads,
    };
  }

  async toggleActive(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      throw new ConflictException('Company not found');
    }

    return this.prisma.company.update({
      where: { id },
      data: {
        active: !company.active,
      },
    });
  }
}
