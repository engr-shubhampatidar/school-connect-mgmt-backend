import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTeacherDto {
  @ApiProperty({ description: 'Teacher id (uuid)' })
  @IsUUID('4')
  teacherId: string;
}
