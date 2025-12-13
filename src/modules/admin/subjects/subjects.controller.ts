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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { Subject } from '../entities/subject.entity';

@ApiTags('Admin - Subjects')
@ApiExtraModels(Subject)
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/subjects')
export class AdminSubjectsController {
  constructor(private svc: AdminSubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create subject' })
  @ApiCreatedResponse({ type: Subject })
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
  @ApiOkResponse({
    schema: {
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(Subject) } },
      },
    },
  })
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
  @ApiOkResponse({ type: Subject })
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
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  async remove(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.remove(schoolId, id);
  }
}
