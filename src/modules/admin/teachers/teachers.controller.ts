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
import { AdminTeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeacherListResponseDto } from './dto/teacher-response.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Admin - Teachers')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/teachers')
export class AdminTeachersController {
  constructor(private svc: AdminTeachersService) {}

  @Post()
  @ApiOperation({ summary: 'Create teacher' })
  @ApiBody({ type: CreateTeacherDto })
  async create(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Body() dto: CreateTeacherDto,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.create(req.user.school.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List teachers (paginated)' })
  @ApiResponse({
    status: 200,
    description:
      'Returns paginated list of teachers with their class and subject assignments',
    type: TeacherListResponseDto,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by name, email, or phone',
  })
  @ApiQuery({
    name: 'classId',
    required: false,
    type: String,
    description: 'Filter by class ID',
  })
  @ApiQuery({
    name: 'subject',
    required: false,
    type: String,
    description: 'Filter by subject name',
  })
  async list(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('classId') classId?: string,
    @Query('subject') subject?: string,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.findAll(req.user.school.id, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      classId,
      subject,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update teacher' })
  async update(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
    @Body() dto: UpdateTeacherDto,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.update(req.user.school.id, id, dto);
  }

  @Post(':id/resend-invite')
  @ApiOperation({ summary: 'Resend invite to teacher' })
  async resend(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.resendInvite(req.user.school.id, id);
  }
}
