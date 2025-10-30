import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  cnpj: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  primaryColor?: string;

  // Dados do admin inicial
  @IsString()
  adminName: string;

  @IsEmail()
  adminEmail: string;

  @IsString()
  adminPassword: string;
}
