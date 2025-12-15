import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { School } from '../schools/entities/school.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { Subject } from './entities/subject.entity';
import { ClassTeacherAssignment } from './classes/entities/class-teacher-assignment.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminTeachersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TeacherProfile)
    private teacherRepo: Repository<TeacherProfile>,
    @InjectRepository(School)
    private schoolRepo: Repository<School>,
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,
    @InjectRepository(ClassTeacherAssignment)
    private assignmentRepo: Repository<ClassTeacherAssignment>,
  ) {}

  private async ensureSchool(schoolId: string) {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new BadRequestException('Invalid school context');
    return school;
  }

  async create(schoolId: string, dto: CreateTeacherDto) {
    const school = await this.ensureSchool(schoolId);

    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new BadRequestException('Email already in use');

    const pw = Math.random().toString(36).slice(-8);
    const hash = await bcrypt.hash(pw, 10);

    const savedUser = (await this.userRepo.save({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: hash,
      role: UserRole.TEACHER,
      school,
    })) as User;

    const teacherObj: Partial<TeacherProfile> & { user: User; school: School } =
      {
        user: savedUser,
        school,
      };
    if (dto.phone) teacherObj.phone = dto.phone;

    // Ensure provided subjects exist; assignments are canonical via ClassTeacherAssignment
    if (dto.subjects && dto.subjects.length) {
      for (const name of dto.subjects) {
        const s = await this.subjectRepo
          .createQueryBuilder('s')
          .where('s.name = :name', { name })
          .andWhere('s.schoolId = :schoolId', { schoolId })
          .getOne();
        if (!s) {
          await this.subjectRepo.save({ name, school });
        }
      }
    }

    const saved = (await this.teacherRepo.save(teacherObj)) as TeacherProfile;

    // invite logic stub: in production, queue email with token
    return { id: saved.id, userId: savedUser.id, message: 'Teacher created' };
  }

  async findAll(
    schoolId: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      classId?: string;
      subject?: string;
    },
  ) {
    await this.ensureSchool(schoolId);
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.teacherRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.user', 'user')
      .where('t.schoolId = :schoolId', { schoolId });

    if (query?.search) {
      qb.andWhere(
        '(user.fullName ILIKE :s OR user.email ILIKE :s OR t.phone ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }
    if (query?.classId) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM class_teacher_assignments a WHERE a.teacherId = t.id AND a.classId = :classId)',
        { classId: query.classId },
      );
    }
    if (query?.subject) {
      qb.andWhere(
        'EXISTS (SELECT 1 FROM class_teacher_assignments a JOIN subjects s ON s.id = a.subjectId WHERE a.teacherId = t.id AND s.name = :subject)',
        { subject: query.subject },
      );
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit };
  }

  async update(schoolId: string, id: string, dto: UpdateTeacherDto) {
    const school = await this.ensureSchool(schoolId);
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');

    if (dto.fullName) teacher.user.fullName = dto.fullName;
    if (dto.phone !== undefined) teacher.phone = dto.phone;

    if (dto.assignClassIds) {
      // replace existing class assignments (subjectId NULL) with provided list
      await this.assignmentRepo.delete({ teacherId: id, subjectId: IsNull() });
      const classes = await this.classRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: dto.assignClassIds })
        .andWhere('c.schoolId = :schoolId', { schoolId })
        .getMany();
      if (classes.length) {
        const assignments = classes.map((c) =>
          this.assignmentRepo.create({ classId: c.id, teacherId: id }),
        );
        await this.assignmentRepo.save(assignments);
      }
    }

    if (dto.subjects) {
      for (const name of dto.subjects) {
        const s = await this.subjectRepo
          .createQueryBuilder('s')
          .where('s.name = :name', { name })
          .andWhere('s.schoolId = :schoolId', { schoolId })
          .getOne();
        if (!s) await this.subjectRepo.save({ name, school });
      }
    }

    await this.userRepo.save(teacher.user);
    const saved = await this.teacherRepo.save(teacher);
    return { id: saved.id, message: 'Teacher updated' };
  }

  async resendInvite(schoolId: string, id: string) {
    await this.ensureSchool(schoolId);
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');
    // stub: trigger email send
    return { message: `Invite resent to ${teacher.user.email ?? 'no-email'}` };
  }
}
