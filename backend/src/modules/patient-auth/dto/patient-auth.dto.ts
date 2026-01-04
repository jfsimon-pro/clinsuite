import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PatientSetupDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
    password: string;
}

export class PatientLoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class PatientForgotPasswordDto {
    @IsEmail()
    email: string;
}

export class PatientResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class PatientChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;
}

export class PatientUpdateProfileDto {
    @IsString()
    name?: string;

    @IsEmail()
    email?: string;

    @IsString()
    phone?: string;

    @IsString()
    endereco?: string;

    @IsString()
    cidade?: string;

    @IsString()
    estado?: string;

    @IsString()
    cep?: string;
}
