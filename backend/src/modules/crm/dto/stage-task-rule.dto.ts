import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStageTaskRuleDto {
  @IsString()
  stepId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  order: number;

  @IsNumber()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  delayDays: number;

  @IsEnum(['ABSOLUTE', 'AFTER_PREVIOUS'])
  delayType: 'ABSOLUTE' | 'AFTER_PREVIOUS';

  @IsEnum(['LEAD_OWNER', 'FIXED_USER', 'ROUND_ROBIN'])
  assignType: 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN';

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStageTaskRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  @Type(() => Number)
  delayDays?: number;

  @IsOptional()
  @IsEnum(['ABSOLUTE', 'AFTER_PREVIOUS'])
  delayType?: 'ABSOLUTE' | 'AFTER_PREVIOUS';

  @IsOptional()
  @IsEnum(['LEAD_OWNER', 'FIXED_USER', 'ROUND_ROBIN'])
  assignType?: 'LEAD_OWNER' | 'FIXED_USER' | 'ROUND_ROBIN';

  @IsOptional()
  @IsString()
  assignedUserId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ReorderStageTaskRulesDto {
  @IsString({ each: true })
  ruleIds: string[];
}

export class DuplicateStageTaskRulesDto {
  @IsString()
  toStepId: string;
}