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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import { SettingsResponseDto } from './dto/settings-response.dto';

@ApiTags('Admin - Settings')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/settings')
export class AdminSettingsController {
  constructor(private svc: AdminSettingsService) {}

  @Get()
  @ApiOperation({ summary: "Get school's settings" })
  @ApiOkResponse({ type: SettingsResponseDto })
  async get(@Req() req: Request & { user?: { school?: { id?: string } } }) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.getSettings(schoolId);
  }

  @Put()
  @ApiOperation({ summary: "Update school's settings" })
  @ApiOkResponse({ type: SettingsResponseDto })
  async update(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Body() dto: UpdateSettingsDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.updateSettings(schoolId, dto);
  }
}
