import {
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ClassSubjectAssignmentDto } from './class-subject-assignment.dto';

export class UpdateTeacherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    description:
      'Class ID to set this teacher as the class teacher (homeroom teacher)',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  classTeacher?: string;

  @ApiPropertyOptional({
    description:
      'Replace all assignments with new class-subject combinations. Use subjectId null for class teacher assignments.',
    type: [ClassSubjectAssignmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassSubjectAssignmentDto)
  assignClassSubjects?: ClassSubjectAssignmentDto[];
}
