import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TeacherProfile } from '../entities/teacher-profile.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Subject } from '../entities/subject.entity';
import { ClassTeacherAssignment } from '../classes/entities/class-teacher-assignment.entity';
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

    const dtoAs = dto as unknown as { classId?: string };

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
      role: 'teacher',
      school,
    })) as User;

    const teacherObj: Partial<TeacherProfile> & { user: User; school: School } =
      {
        user: savedUser,
        school,
      };
    if (dto.phone) teacherObj.phone = dto.phone;

    if (dto.assignClassIds && dto.assignClassIds.length) {
      const classes = await this.classRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: dto.assignClassIds })
        .andWhere('c.schoolId = :schoolId', { schoolId })
        .getMany();
      teacherObj.classes = classes;
    }

    if (dto.subjects && dto.subjects.length) {
      const subjects: Subject[] = [];
      for (const name of dto.subjects) {
        let s = await this.subjectRepo
          .createQueryBuilder('s')
          .where('s.name = :name', { name })
          .andWhere('s.schoolId = :schoolId', { schoolId })
          .getOne();
        if (!s) {
          s = (await this.subjectRepo.save({ name, school })) as Subject;
        }
        subjects.push(s);
      }
      teacherObj.subjects = subjects;
    }

    const saved = (await this.teacherRepo.save(teacherObj)) as TeacherProfile;

    // optional: assign as class teacher (single class leader)
    if (dtoAs.classId) {
      // ensure class exists and belongs to school
      const cls = await this.classRepo.findOne({
        where: { id: dtoAs.classId },
        relations: ['school'],
      });
      if (!cls || !cls.school || cls.school.id !== schoolId)
        throw new BadRequestException('Class invalid or not in school');

      // ensure class doesn't already have a class teacher (subjectId IS NULL)
      const existing = await this.assignmentRepo
        .createQueryBuilder('a')
        .where('a.classId = :classId', { classId: dtoAs.classId })
        .andWhere('a.subjectId IS NULL')
        .getOne();
      if (existing) {
        throw new BadRequestException('Class already has a class teacher');
      }

      // create assignment and add relation in a transaction
      await this.assignmentRepo.manager.transaction(async (manager) => {
        const assignment = manager.create(ClassTeacherAssignment, {
          classId: dtoAs.classId,
          teacherId: saved.id,
          subjectId: null,
        });
        await manager.save(assignment);

        await manager
          .createQueryBuilder()
          .relation(TeacherProfile, 'classes')
          .of(saved.id)
          .add(dtoAs.classId as string);
      });
    }

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
      .leftJoinAndSelect('t.classes', 'classes')
      .leftJoinAndSelect('t.subjects', 'subjects')
      .where('t.schoolId = :schoolId', { schoolId });

    if (query?.search) {
      qb.andWhere(
        '(user.fullName ILIKE :s OR user.email ILIKE :s OR t.phone ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }
    if (query?.classId) {
      qb.andWhere('classes.id = :classId', { classId: query.classId });
    }
    if (query?.subject) {
      qb.andWhere('subjects.name = :subject', { subject: query.subject });
    }

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit };
  }

  async update(schoolId: string, id: string, dto: UpdateTeacherDto) {
    const school = await this.ensureSchool(schoolId);
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['user', 'classes', 'subjects'],
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');

    if (dto.fullName) teacher.user.fullName = dto.fullName;
    if (dto.phone !== undefined) teacher.phone = dto.phone;

    if (dto.assignClassIds) {
      const classes = await this.classRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: dto.assignClassIds })
        .andWhere('c.schoolId = :schoolId', { schoolId })
        .getMany();
      teacher.classes = classes;
    }

    if (dto.subjects) {
      const subjects: Subject[] = [];
      for (const name of dto.subjects) {
        let s = await this.subjectRepo
          .createQueryBuilder('s')
          .where('s.name = :name', { name })
          .andWhere('s.schoolId = :schoolId', { schoolId })
          .getOne();
        if (!s) s = (await this.subjectRepo.save({ name, school })) as Subject;
        subjects.push(s);
      }
      teacher.subjects = subjects;
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
    return { message: `Invite resent to ${teacher.user.email ?? 'no-email'}` };
  }
}
