import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminAnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { QueryAnnouncementsDto } from './dto/query-announcements.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { Announcement } from '../../announcements/entities/announcement.entity';

@ApiTags('Admin - Announcements')
@ApiExtraModels(Announcement)
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/announcements')
export class AdminAnnouncementsController {
  constructor(private svc: AdminAnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create announcement' })
  @ApiCreatedResponse({ type: Announcement })
  async create(
    @Req() req: Request & { user?: { id?: string; school?: { id?: string } } },
    @Body() dto: CreateAnnouncementDto,
  ) {
    const userId = req.user?.id;
    const schoolId = req.user?.school?.id;
    if (!userId || !schoolId) throw new BadRequestException('Missing context');
    return this.svc.create(schoolId, dto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'List announcements' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: getSchemaPath(Announcement) } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  async list(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Query() q: QueryAnnouncementsDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.list(schoolId, q);
  }
}
