import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateWhatsAppConnectionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;
}
