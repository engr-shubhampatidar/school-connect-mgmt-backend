import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import {
  GetAttendanceQueryDto,
  ClassHistoryQueryDto,
} from './dto/query-attendance.dto';
import { AttachUserGuard } from './guards/attach-user.guard';
import { CreateAttendanceGuard } from './guards/create-attendance.guard';
import { AdminGuard } from '../admin/admin.guard';

interface AuthUser {
  id: string;
  schoolId: string;
}

@Controller('attendance')
@ApiTags('Attendance')
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create attendance for a class and date' })
  @ApiResponse({
    status: 201,
    description: 'Attendance created or already exists',
  })
  @UseGuards(CreateAttendanceGuard)
  async create(
    @Body() dto: CreateAttendanceDto,
    @Req() req: { user: AuthUser },
  ) {
    const user = req.user;
    return this.attendanceService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get attendance for a class on a date' })
  @ApiResponse({ status: 200, description: 'Attendance record or null' })
  @UseGuards(AttachUserGuard)
  async get(
    @Query() query: GetAttendanceQueryDto,
    @Req() req: { user: AuthUser },
  ) {
    return this.attendanceService.getAttendance(
      query.classId,
      query.date,
      req.user,
    );
  }

  @Put(':attendanceId')
  @ApiOperation({ summary: 'Update attendance (Admin only)' })
  @ApiResponse({ status: 200, description: 'Updated attendance record' })
  @UseGuards(AdminGuard)
  async update(
    @Param('attendanceId', new ParseUUIDPipe()) attendanceId: string,
    @Body() dto: UpdateAttendanceDto,
    @Req() req: { user: AuthUser },
  ) {
    return this.attendanceService.update(attendanceId, dto, req.user);
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get class attendance history' })
  @ApiResponse({
    status: 200,
    description: 'Array of attendance records for the class',
  })
  @UseGuards(AttachUserGuard)
  async classHistory(
    @Param('classId') classId: string,
    @Query() query: ClassHistoryQueryDto,
    @Req() req: { user: AuthUser },
  ) {
    return this.attendanceService.getClassHistory(
      classId,
      query.from,
      query.to,
      req.user,
    );
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get attendance history for a student' })
  @ApiResponse({ status: 200, description: "Student's attendance records" })
  @UseGuards(AttachUserGuard)
  async studentHistory(
    @Param('studentId') studentId: string,
    @Req() req: { user: AuthUser },
  ) {
    return this.attendanceService.getStudentHistory(studentId, req.user);
  }
}
