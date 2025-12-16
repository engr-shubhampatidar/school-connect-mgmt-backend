import { IsUUID, IsOptional } from 'class-validator';
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

  // `isClassTeacher` removed — use top-level `classTeacher` on create/update instead
}
