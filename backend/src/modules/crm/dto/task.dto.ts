import { IsString, IsDateString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  leadId: string;

  @IsString()
  ruleId: string;

  @IsString()
  assignedId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assignedId?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED'])
  status?: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
}

export class CompleteTaskDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class TaskFiltersDto {
  @IsOptional()
  @IsString()
  assignedId?: string;

  @IsOptional()
  @IsString()
  leadId?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'COMPLETED', 'EXPIRED', 'CANCELLED'])
  status?: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

  @IsOptional()
  @IsDateString()
  dueBefore?: string;

  @IsOptional()
  @IsDateString()
  dueAfter?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  overdue?: boolean;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class GenerateTasksDto {
  @IsString()
  leadId: string;

  @IsString()
  stepId: string;
}

export class TaskStatsQueryDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}