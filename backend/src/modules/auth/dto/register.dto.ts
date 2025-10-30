import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
  DENTIST = 'DENTIST',
}

enum UserSpecialty {
  GENERAL = 'GENERAL',
  CLOSER_NEGOCIACAO = 'CLOSER_NEGOCIACAO',
  CLOSER_FOLLOW = 'CLOSER_FOLLOW',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserSpecialty)
  specialty?: UserSpecialty;
} 