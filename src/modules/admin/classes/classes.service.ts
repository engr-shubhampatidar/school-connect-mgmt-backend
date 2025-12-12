import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';

@Injectable()
export class AdminClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
    @InjectRepository(School)
    private schoolRepo: Repository<School>,
    @InjectRepository(TeacherProfile)
    private teacherRepo: Repository<TeacherProfile>,
  ) {}

  private async ensureSchool(schoolId: string) {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new BadRequestException('Invalid school context');
    return school;
  }

  async create(schoolId: string, dto: CreateClassDto) {
    const school = await this.ensureSchool(schoolId);
    // check duplicate by name+section using query builder (avoids null typing issues)
    const qb = this.classRepo
      .createQueryBuilder('c')
      .where('c.name = :name', { name: dto.name })
      .andWhere('c.schoolId = :schoolId', { schoolId });
    if (dto.section !== undefined) {
      qb.andWhere('c.section = :section', { section: dto.section });
    } else {
      qb.andWhere('c.section IS NULL');
    }
    const exists = await qb.getOne();
    if (exists)
      throw new BadRequestException(
        'Class with this name/section already exists',
      );

    const cls = this.classRepo.create({
      name: dto.name,
      section: dto.section,
      school,
    });
    const saved = await this.classRepo.save(cls);
    return { id: saved.id, name: saved.name };
  }

  async list(schoolId: string, filters?: { name?: string; section?: string }) {
    await this.ensureSchool(schoolId);
    const qb = this.classRepo
      .createQueryBuilder('c')
      .where('c.schoolId = :schoolId', { schoolId });
    if (filters?.name)
      qb.andWhere('c.name ILIKE :name', { name: `%${filters.name}%` });
    if (filters?.section)
      qb.andWhere('c.section = :section', { section: filters.section });
    const items = await qb.getMany();
    return { items };
  }

  async update(schoolId: string, id: string, dto: UpdateClassDto) {
    await this.ensureSchool(schoolId);
    const cls = await this.classRepo.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');
    if (dto.name !== undefined) cls.name = dto.name;
    if (dto.section !== undefined) cls.section = dto.section;
    const saved = await this.classRepo.save(cls);
    return { id: saved.id, name: saved.name };
  }

  async assignTeacher(schoolId: string, id: string, dto: AssignTeacherDto) {
    await this.ensureSchool(schoolId);
    const cls = await this.classRepo.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.school?.id !== schoolId)
      throw new BadRequestException('Class does not belong to your school');

    const teacher = await this.teacherRepo.findOne({
      where: { id: dto.teacherId },
      relations: ['school'],
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.school?.id !== schoolId)
      throw new BadRequestException('Teacher does not belong to your school');

    // Use transaction via manager to add relation safely
    await this.teacherRepo.manager.transaction(async (manager) => {
      await manager
        .createQueryBuilder()
        .relation(TeacherProfile, 'classes')
        .of(teacher.id)
        .add(cls.id);
    });

    return { message: 'Teacher assigned' };
  }
}
