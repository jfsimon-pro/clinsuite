import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name,
        role: registerDto.role || 'WORKER',
        specialty: registerDto.specialty || 'GENERAL',
        companyId: registerDto.companyId,
        ...(registerDto.unitId && { unitId: registerDto.unitId }),
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logoUrl: true,
            primaryColor: true,
          },
        },
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    const { password, ...result } = user;

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: result,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              primaryColor: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      };

      const accessToken = this.jwtService.sign(newPayload);
      const refreshToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      });

      const { password, ...result } = user;

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: result,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCompanyUsers(companyId: string) {
    const users = await this.prisma.user.findMany({
      where: {
        companyId,
        // Exclui SUPER_ADMIN da lista de colaboradores
        role: {
          not: 'SUPER_ADMIN',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialty: true,
        unitId: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return users;
  }

  async deleteUser(userId: string, companyId: string) {
    // Verificar se o usuário existe e pertence à empresa
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o usuário tem leads atribuídos
    const leadsCount = await this.prisma.lead.count({
      where: {
        responsibleId: userId,
      },
    });

    if (leadsCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir este usuário pois ele possui ${leadsCount} lead(s) atribuído(s). Transfira os leads para outro usuário antes de excluir.`
      );
    }

    // Verificar se o usuário tem tarefas atribuídas
    const tasksCount = await this.prisma.task.count({
      where: {
        assignedId: userId,
        status: {
          in: ['PENDING', 'EXPIRED'], // Não considerar tarefas concluídas ou canceladas
        },
      },
    });

    if (tasksCount > 0) {
      throw new BadRequestException(
        `Não é possível excluir este usuário pois ele possui ${tasksCount} tarefa(s) pendente(s). Conclua ou reassine as tarefas antes de excluir.`
      );
    }

    // Se chegou até aqui, pode excluir o usuário
    await this.prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      message: 'Usuário excluído com sucesso',
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, companyId: string) {
    // Verificar se o usuário existe e pertence à empresa
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        companyId,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Atualizar o usuário
    const updatedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...(updateUserDto.name && { name: updateUserDto.name }),
        ...(updateUserDto.role && { role: updateUserDto.role }),
        ...(updateUserDto.specialty && { specialty: updateUserDto.specialty }),
        ...(updateUserDto.unitId !== undefined && { unitId: updateUserDto.unitId || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        specialty: true,
        unitId: true,
        createdAt: true,
      },
    });

    return {
      message: 'Usuário atualizado com sucesso',
      user: updatedUser,
    };
  }
} 