import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;
    
    // Se não há usuário, deixar passar (será verificado pelo guard)
    if (!user) {
      return next();
    }

    if (!user.companyId) {
      throw new UnauthorizedException('Company ID is required');
    }

    // Verificar se a empresa existe
    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
    });

    if (!company) {
      throw new UnauthorizedException('Company not found');
    }

    // Adicionar company_id ao request para uso posterior
    (req as any).companyId = user.companyId;
    
    next();
  }
} 