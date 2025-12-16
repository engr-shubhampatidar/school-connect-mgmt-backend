import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TeacherAssignmentDto {
  @ApiPropertyOptional({ example: 'uuid-class-123' })
  classId?: string;

  @ApiPropertyOptional({ example: '5' })
  className?: string;

  @ApiPropertyOptional({ example: 'A' })
  classSection?: string;

  @ApiPropertyOptional({ example: 'uuid-subject-456' })
  subjectId?: string;

  @ApiPropertyOptional({ example: 'Mathematics' })
  subjectName?: string;

  @ApiProperty({ example: false })
  isClassTeacher: boolean;
}

export class TeacherUserDto {
  @ApiProperty({ example: 'uuid-user-123' })
  id: string;

  @ApiProperty({ example: 'Jane Smith' })
  fullName: string;

  @ApiProperty({ example: 'jane.smith@school.com' })
  email: string;
}

export class TeacherItemDto {
  @ApiProperty({ example: 'uuid-teacher-456' })
  id: string;

  @ApiPropertyOptional({ example: '+1-555-0123' })
  phone?: string;

  @ApiProperty({ type: TeacherUserDto })
  user: TeacherUserDto;

  @ApiProperty({ type: [TeacherAssignmentDto] })
  assignments: TeacherAssignmentDto[];
}

export class TeacherListResponseDto {
  @ApiProperty({ type: [TeacherItemDto] })
  items: TeacherItemDto[];

  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}
