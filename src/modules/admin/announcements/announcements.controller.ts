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
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin - Announcements')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/announcements')
export class AdminAnnouncementsController {
  constructor(private svc: AdminAnnouncementsService) {}

  @Post()
  @ApiOperation({ summary: 'Create announcement' })
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
  async list(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Query() q: QueryAnnouncementsDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.list(schoolId, q);
  }
}
