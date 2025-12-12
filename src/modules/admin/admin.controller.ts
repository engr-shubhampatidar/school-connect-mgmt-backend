import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';
import { AdminService } from './admin.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AdminGuard } from './admin.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiBody,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DashboardDto } from './dto/dashboard.dto';

@ApiTags('Admin')
@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  @ApiOperation({ summary: 'Admin login (email + password)' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async login(@Body() dto: LoginDto) {
    const user = await this.adminService.validateCredentials(
      dto.email,
      dto.password,
    );
    return this.adminService.login(user);
  }

  @Post('auth/refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.adminService.refresh(dto.refreshToken);
  }

  @Get('dashboard')
  @UseGuards(AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin dashboard summary (authenticated)' })
  @ApiOkResponse({ type: DashboardDto })
  async dashboard(@Req() req: Request & { user?: User }) {
    const user = req.user as User | undefined;
    // user.school should be loaded by the guard
    const schoolId = user?.school?.id;
    return this.adminService.getDashboard(schoolId ?? null);
  }
}
