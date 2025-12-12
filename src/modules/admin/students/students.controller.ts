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
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../admin.guard';
import { AdminStudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('Admin - Students')
@UseGuards(AdminGuard)
@ApiBearerAuth()
@Controller('api/admin/students')
export class AdminStudentsController {
  constructor(private svc: AdminStudentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create student' })
  async create(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Body() dto: CreateStudentDto,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.create(req.user.school.id, dto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import students (CSV)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @UploadedFile() file: any,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    if (!file) throw new BadRequestException('Missing file');
    interface UploadedFileLike {
      originalname: string;
      buffer: Buffer;
    }
    const uploaded = file as UploadedFileLike;
    const name = uploaded.originalname.toLowerCase();
    if (name.endsWith('.csv'))
      return this.svc.importCsvBuffer(req.user.school.id, uploaded.buffer);
    if (name.endsWith('.xls') || name.endsWith('.xlsx'))
      return this.svc.importExcelBuffer(req.user.school.id, uploaded.buffer);
    throw new BadRequestException(
      'Unsupported file type; only CSV or Excel (.xls/.xlsx) supported',
    );
  }

  @Get()
  @ApiOperation({ summary: 'List students (paginated)' })
  async list(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('classId') classId?: string,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.list(req.user.school.id, {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      classId,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update student' })
  async update(
    @Req() req: Request & { user?: { school?: { id?: string } } },
    @Param('id') id: string,
    @Body() dto: Partial<CreateStudentDto>,
  ) {
    if (!req.user?.school?.id)
      throw new BadRequestException('Missing school context');
    return this.svc.update(req.user.school.id, id, dto);
  }
}
