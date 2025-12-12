import { IsOptional, IsString } from 'class-validator';

export class QuerySubjectsDto {
  @IsOptional()
  @IsString()
  search?: string;
}
