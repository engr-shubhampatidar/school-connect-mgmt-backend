// src/modules/public/public.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Contact } from '../contact/entities/contact.entity';
import { School } from '../schools/entities/school.entity';
import { User } from '../users/entities/user.entity';
import { RegisterSchoolDto } from './dto/register-school.dto';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Contact) private contactRepo: Repository<Contact>,
  ) {}

  /**
   * Register a school and create an admin user (role = admin).
   * For Phase-0 we simply create records in the same DB.
   */
  async registerSchool(dto: RegisterSchoolDto) {
    // basic duplicate checks
    const existing = await this.schoolRepo.findOne({
      where: { email: dto.email },
    });
    if (existing)
      throw new BadRequestException(
        'School or admin email already registered.',
      );

    // create school
    const school = this.schoolRepo.create({
      name: dto.name,
      email: dto.email,
      address: dto.address,
      contact: dto.contact,
      logoUrl: dto.logoUrl,
    });
    const savedSchool = await this.schoolRepo.save(school);

    // create admin user
    const saltRounds = 10;
    const pwHash = await bcrypt.hash(dto.password, saltRounds);

    const adminUser = this.userRepo.create({
      fullName: `${dto.name} Admin`,
      email: dto.email,
      passwordHash: pwHash,
      role: 'admin',
      school: savedSchool,
    });
    const savedUser = await this.userRepo.save(adminUser);

    // return minimal payload (do not return passwordHash)
    return {
      schoolId: savedSchool.id,
      adminUserId: savedUser.id,
      message: 'School registered successfully',
    };
  }

  async getTenantStatus(subdomain: string) {
    // Placeholder: in future this will look up master registry by subdomain.
    // For now, treat "subdomain" as school email local part or school name slug.
    const school = await this.schoolRepo.findOne({
      where: { name: subdomain },
    });
    if (!school) return { subdomain, status: 'not_found' };
    return { subdomain, status: school.provisioningStatus };
  }

  async contact(dto: {
    name: string;
    email: string;
    phone?: string;
    message?: string;
  }) {
    const contact = this.contactRepo.create(dto);
    await this.contactRepo.save(contact);
    return { id: contact.id, message: 'Contact request received' };
  }
}
