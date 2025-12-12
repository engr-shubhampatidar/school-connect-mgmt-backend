import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  Put,
  Param,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminSubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { QuerySubjectsDto } from './dto/query-subjects.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin - Subjects')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/subjects')
export class AdminSubjectsController {
  constructor(private svc: AdminSubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create subject' })
  async create(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Body() dto: CreateSubjectDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.create(schoolId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List subjects' })
  async list(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Query() q: QuerySubjectsDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.list(schoolId, q);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update subject' })
  async update(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.update(schoolId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete subject' })
  async remove(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.remove(schoolId, id);
  }
}
