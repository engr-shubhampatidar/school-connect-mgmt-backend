import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from '../entities/subject.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectsDto } from './dto/query-subjects.dto';
import { TeacherProfile } from '../entities/teacher-profile.entity';
import { School } from '../../schools/entities/school.entity';

@Injectable()
export class AdminSubjectsService {
  constructor(
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,
    @InjectRepository(TeacherProfile)
    private teacherRepo: Repository<TeacherProfile>,
    @InjectRepository(School)
    private schoolRepo: Repository<School>,
  ) {}

  private async ensureSchoolExists(schoolId: string) {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new BadRequestException('Invalid school context');
    return school;
  }

  async create(schoolId: string, dto: CreateSubjectDto) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    await this.ensureSchoolExists(schoolId);

    const exists = await this.subjectRepo
      .createQueryBuilder('s')
      .where('s.name = :name', { name: dto.name })
      .andWhere('s.schoolId = :schoolId', { schoolId })
      .andWhere('s.deletedAt IS NULL')
      .getOne();
    if (exists)
      throw new BadRequestException('Subject with this name already exists');

    const school = await this.ensureSchoolExists(schoolId);
    const payload: Partial<Subject> = { name: dto.name, school };
    if (dto.code !== undefined) payload.code = dto.code;
    const subject = this.subjectRepo.create(payload);
    return this.subjectRepo.save(subject);
  }

  async list(schoolId: string, q?: QuerySubjectsDto) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    await this.ensureSchoolExists(schoolId);

    const qb = this.subjectRepo
      .createQueryBuilder('s')
      .where('s.schoolId = :schoolId', { schoolId })
      .andWhere('s.deletedAt IS NULL');

    if (q?.search)
      qb.andWhere('s.name ILIKE :search', { search: `%${q.search}%` });

    const items = await qb.orderBy('s.name', 'ASC').getMany();
    return { items };
  }

  async update(schoolId: string, id: string, dto: UpdateSubjectDto) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    await this.ensureSchoolExists(schoolId);

    const subject = await this.subjectRepo.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!subject || subject.deletedAt)
      throw new NotFoundException('Subject not found');
    if (subject.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');

    if (dto.name !== undefined) subject.name = dto.name;
    if (dto.code !== undefined) subject.code = dto.code;

    return this.subjectRepo.save(subject);
  }

  async remove(schoolId: string, id: string) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    await this.ensureSchoolExists(schoolId);

    const subject = await this.subjectRepo.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!subject || subject.deletedAt)
      throw new NotFoundException('Subject not found');
    if (subject.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');

    const assignedCount = await this.teacherRepo
      .createQueryBuilder('t')
      .innerJoin('t.subjects', 'subj', 'subj.id = :id', { id })
      .getCount();
    if (assignedCount > 0)
      throw new BadRequestException(
        'Cannot delete subject assigned to teachers or classes',
      );

    subject.deletedAt = new Date();
    await this.subjectRepo.save(subject);
    return { message: 'Subject soft-deleted' };
  }
}
