import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'RN-001' })
  @IsOptional()
  @IsString()
  rollNo?: string;

  @ApiProperty({ description: 'Class id (uuid)' })
  @IsUUID('4')
  classId: string;

  @ApiPropertyOptional({ example: 'https://...' })
  @IsOptional()
  @IsString()
  photoUrl?: string;
}
