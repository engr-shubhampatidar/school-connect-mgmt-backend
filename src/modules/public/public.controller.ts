import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';
import { RegisterSchoolDto } from './dto/register-school.dto';
import { ContactDto } from './dto/contact.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Public')
@Controller('api/public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Post('register-school')
  @ApiOperation({ summary: 'Register school and create admin user' })
  async registerSchool(@Body() dto: RegisterSchoolDto) {
    return this.publicService.registerSchool(dto);
  }

  @Get('tenant-status/:subdomain')
  @ApiOperation({ summary: 'Check provisioning/tenant status' })
  async tenantStatus(@Param('subdomain') subdomain: string) {
    return this.publicService.getTenantStatus(subdomain);
  }

  @Post('contact')
  @ApiOperation({ summary: 'Contact / demo request' })
  async contact(@Body() dto: ContactDto) {
    return this.publicService.contact(dto);
  }
}
