import { IsString, IsEmail, IsOptional, IsBoolean } from 'class-validator';

export class CreateUnitDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    managerId?: string;
}

export class UpdateUnitDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    managerId?: string;

    @IsOptional()
    @IsBoolean()
    active?: boolean;
}

export class UnitResponseDto {
    id: string;
    name: string;
    code?: string;
    address?: string;
    phone?: string;
    email?: string;
    managerId?: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    company?: {
        id: string;
        name: string;
    };
    manager?: {
        id: string;
        name: string;
    };
    _count?: {
        funnels: number;
        leads: number;
        users: number;
    };
}
