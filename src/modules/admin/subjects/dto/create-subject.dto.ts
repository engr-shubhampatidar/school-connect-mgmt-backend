import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Subject name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Optional subject code' })
  @IsOptional()
  @IsString()
  code?: string;
}
