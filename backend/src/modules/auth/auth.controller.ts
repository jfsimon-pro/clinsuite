import {
  Controller,
  Post,
  Get,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshToken(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  async getCompanyUsers(@Request() req) {
    return this.authService.getCompanyUsers(req.user.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id')
  @HttpCode(HttpStatus.OK)
  async updateUser(@Request() req, @Param('id') userId: string, @Body() updateUserDto: UpdateUserDto) {
    // Apenas ADMIN pode atualizar usuários
    if (req.user.role !== 'ADMIN') {
      throw new Error('Apenas administradores podem atualizar usuários');
    }
    
    return this.authService.updateUser(userId, updateUserDto, req.user.companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Request() req, @Param('id') userId: string) {
    // Apenas ADMIN pode excluir usuários
    if (req.user.role !== 'ADMIN') {
      throw new Error('Apenas administradores podem excluir usuários');
    }
    
    // Não pode excluir a si mesmo
    if (req.user.id === userId) {
      throw new Error('Você não pode excluir sua própria conta');
    }
    
    return this.authService.deleteUser(userId, req.user.companyId);
  }
} 