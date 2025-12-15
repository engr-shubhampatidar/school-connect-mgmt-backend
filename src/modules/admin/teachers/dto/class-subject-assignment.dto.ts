import { IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClassSubjectAssignmentDto {
  @ApiProperty({ example: 'uuid-class-123', description: 'Class ID' })
  @IsUUID()
  classId: string;

  @ApiPropertyOptional({
    example: 'uuid-subject-456',
    description:
      'Subject ID - specify which subject the teacher teaches to this class',
  })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({
    example: false,
    description:
      'Set to true to make this teacher the class teacher (homeroom teacher) for this class. Each class can have only one class teacher.',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isClassTeacher?: boolean;
}
