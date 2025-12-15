import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty({ example: 'Grade 5' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({
    description: 'Optional teacher id to assign to this class',
  })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Optional subject id for the assigned teacher',
  })
  @IsOptional()
  @IsUUID()
  subjectId?: string;
}
