import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Admin - Classes')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/classes')
export class AdminClassesController {
  constructor(private svc: AdminClassesService) {}

  @Post()
  @ApiOperation({ summary: 'Create class' })
  async create(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Body() dto: CreateClassDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.create(schoolId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List classes' })
  async list(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Query('name') name?: string,
    @Query('section') section?: string,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.list(schoolId, { name, section });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update class' })
  async update(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.update(schoolId, id, dto);
  }

  @Post(':id/assign-teacher')
  @ApiOperation({ summary: 'Assign teacher to class' })
  async assignTeacher(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
    @Body() dto: AssignTeacherDto,
  ) {
    const schoolId = req.user?.school?.id;
    if (!schoolId) throw new BadRequestException('Missing school context');
    return this.svc.assignTeacher(schoolId, id, dto);
  }
}
