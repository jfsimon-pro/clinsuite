import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getCompanies() {
    return this.prisma.company.findMany();
  }

  async createCompany(data: { name: string; cnpj: string }) {
    return this.prisma.company.create({
      data,
    });
  }
}
