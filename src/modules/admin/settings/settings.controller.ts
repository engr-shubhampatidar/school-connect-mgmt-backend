import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminSettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin - Settings')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/settings')
export class AdminSettingsController {
  constructor(private svc: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get school's settings" })
  async get(@Req() req: Request & { user?: { school?: { id?: string } } }) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.getSettings(schoolId);
  }

  @Put()
  @ApiOperation({ summary: "Update school's settings" })
  async update(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Body() dto: UpdateSettingsDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.updateSettings(schoolId, dto);
  }
}
