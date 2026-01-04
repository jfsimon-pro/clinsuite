import { IsString, IsOptional, IsEnum } from 'class-validator';

enum UserSpecialty {
  GENERAL = 'GENERAL',
  CLOSER_NEGOCIACAO = 'CLOSER_NEGOCIACAO',
  CLOSER_FOLLOW = 'CLOSER_FOLLOW',
}

enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  WORKER = 'WORKER',
  DENTIST = 'DENTIST',
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsEnum(UserSpecialty)
  specialty?: UserSpecialty;

  @IsOptional()
  @IsString()
  unitId?: string;
}