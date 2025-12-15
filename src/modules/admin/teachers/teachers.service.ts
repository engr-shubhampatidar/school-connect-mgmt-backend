import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
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
      role: UserRole.TEACHER,
      school,
    })) as User;

    const teacherObj: Partial<TeacherProfile> & { user: User; school: School } =
      {
        user: savedUser,
        school,
      };
    if (dto.phone) teacherObj.phone = dto.phone;

    // If subject names provided, ensure Subject records exist (no direct teacher relation)
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

    // NEW: Handle assignClassSubjects (class-subject combinations)
    if (dto.assignClassSubjects && dto.assignClassSubjects.length) {
      const classIds = dto.assignClassSubjects.map((a) => a.classId);
      const subjectIds = dto.assignClassSubjects
        .map((a) => a.subjectId)
        .filter((id) => id !== undefined && id !== null);

      // Validate classes exist and belong to school
      const classes = await this.classRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: classIds })
        .andWhere('c.schoolId = :schoolId', { schoolId })
        .getMany();

      if (classes.length !== classIds.length) {
        throw new BadRequestException(
          'One or more classes are invalid or not in school',
        );
      }

      // Validate subjects exist and belong to school (if provided)
      if (subjectIds.length > 0) {
        const subjects = await this.subjectRepo
          .createQueryBuilder('s')
          .where('s.id IN (:...ids)', { ids: subjectIds })
          .andWhere('s.schoolId = :schoolId', { schoolId })
          .getMany();

        if (subjects.length !== subjectIds.length) {
          throw new BadRequestException(
            'One or more subjects are invalid or not in school',
          );
        }
      }

      // Check for class teacher conflicts (isClassTeacher = true)
      const classTeacherAssignments = dto.assignClassSubjects.filter(
        (a) => a.isClassTeacher === true,
      );
      if (classTeacherAssignments.length > 0) {
        const classTeacherClassIds = classTeacherAssignments.map(
          (a) => a.classId,
        );
        const existingClassTeachers = await this.assignmentRepo
          .createQueryBuilder('a')
          .where('a.classId IN (:...ids)', { ids: classTeacherClassIds })
          .andWhere('a.isClassTeacher = :isClassTeacher', {
            isClassTeacher: true,
          })
          .getMany();

        if (existingClassTeachers.length > 0) {
          throw new BadRequestException(
            'One or more classes already have a class teacher',
          );
        }
      }

      // Create assignments
      const assignments = dto.assignClassSubjects.map((assignment) =>
        this.assignmentRepo.create({
          classId: assignment.classId,
          teacherId: saved.id,
          subjectId: assignment.subjectId || null,
          isClassTeacher: assignment.isClassTeacher || false,
          schoolId,
        }),
      );
      await this.assignmentRepo.save(assignments);
    }

    // DEPRECATED: Keep backward compatibility - optional: assign as class teacher (single class leader)
    if (dtoAs.classId) {
      // ensure class exists and belongs to school
      const cls = await this.classRepo.findOne({
        where: { id: dtoAs.classId },
        relations: ['school'],
      });
      if (!cls || !cls.school || cls.school.id !== schoolId)
        throw new BadRequestException('Class invalid or not in school');

      // ensure class doesn't already have a class teacher (isClassTeacher = true)
      const existing = await this.assignmentRepo
        .createQueryBuilder('a')
        .where('a.classId = :classId', { classId: dtoAs.classId })
        .andWhere('a.isClassTeacher = :isClassTeacher', {
          isClassTeacher: true,
        })
        .getOne();
      if (existing) {
        throw new BadRequestException('Class already has a class teacher');
      }

      // create assignment in a transaction
      await this.assignmentRepo.manager.transaction(async (manager) => {
        const assignment = manager.create(ClassTeacherAssignment, {
          classId: dtoAs.classId,
          teacherId: saved.id,
          subjectId: null,
          isClassTeacher: true,
          schoolId,
        });
        await manager.save(assignment);
      });
    }

    // If assignClassIds provided on create, create assignments for each class
    if (dto.assignClassIds && dto.assignClassIds.length) {
      const classes = await this.classRepo
        .createQueryBuilder('c')
        .where('c.id IN (:...ids)', { ids: dto.assignClassIds })
        .andWhere('c.schoolId = :schoolId', { schoolId })
        .getMany();
      if (classes.length) {
        const assignments = classes.map((c) =>
          this.assignmentRepo.create({
            classId: c.id,
            teacherId: saved.id,
            schoolId,
          }),
        );
        await this.assignmentRepo.save(assignments);
      }
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
      .select(['t.id', 't.phone', 'user.id', 'user.fullName', 'user.email'])
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

    // Fetch assignments with classes and subjects for each teacher
    if (items.length > 0) {
      const teacherIds = items.map((t) => t.id);
      const assignments = await this.assignmentRepo
        .createQueryBuilder('a')
        .leftJoinAndSelect('a.classEntity', 'class')
        .leftJoinAndSelect('a.subject', 'subject')
        .where('a.teacherId IN (:...teacherIds)', { teacherIds })
        .select([
          'a.id',
          'a.teacherId',
          'a.isClassTeacher',
          'class.id',
          'class.name',
          'class.section',
          'subject.id',
          'subject.name',
        ])
        .getMany();

      // Map assignments to teachers
      const teachersWithAssignments = items.map((teacher) => ({
        ...teacher,
        assignments: assignments
          .filter((a) => a.teacherId === teacher.id)
          .map((a) => ({
            classId: a.classEntity?.id,
            className: a.classEntity?.name,
            classSection: a.classEntity?.section,
            subjectId: a.subject?.id,
            subjectName: a.subject?.name,
            isClassTeacher: a.isClassTeacher,
          })),
      }));

      return { items: teachersWithAssignments, total, page, limit };
    }

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

    // NEW: Handle assignClassSubjects (replaces all assignments)
    if (dto.assignClassSubjects !== undefined) {
      // Delete all existing assignments for this teacher
      await this.assignmentRepo.delete({ teacherId: id });

      if (dto.assignClassSubjects.length > 0) {
        const classIds = dto.assignClassSubjects.map((a) => a.classId);
        const subjectIds = dto.assignClassSubjects
          .map((a) => a.subjectId)
          .filter((id) => id !== undefined && id !== null);

        // Validate classes
        const classes = await this.classRepo
          .createQueryBuilder('c')
          .where('c.id IN (:...ids)', { ids: classIds })
          .andWhere('c.schoolId = :schoolId', { schoolId })
          .getMany();

        if (classes.length !== classIds.length) {
          throw new BadRequestException('One or more classes are invalid');
        }

        // Validate subjects (if provided)
        if (subjectIds.length > 0) {
          const subjects = await this.subjectRepo
            .createQueryBuilder('s')
            .where('s.id IN (:...ids)', { ids: subjectIds })
            .andWhere('s.schoolId = :schoolId', { schoolId })
            .getMany();

          if (subjects.length !== subjectIds.length) {
            throw new BadRequestException('One or more subjects are invalid');
          }
        }

        // Check for class teacher conflicts
        const classTeacherAssignments = dto.assignClassSubjects.filter(
          (a) => a.isClassTeacher === true,
        );
        if (classTeacherAssignments.length > 0) {
          const classTeacherClassIds = classTeacherAssignments.map(
            (a) => a.classId,
          );
          const existingClassTeachers = await this.assignmentRepo
            .createQueryBuilder('a')
            .where('a.classId IN (:...ids)', { ids: classTeacherClassIds })
            .andWhere('a.isClassTeacher = :isClassTeacher', {
              isClassTeacher: true,
            })
            .andWhere('a.teacherId != :teacherId', { teacherId: id })
            .getMany();

          if (existingClassTeachers.length > 0) {
            throw new BadRequestException(
              'One or more classes already have a class teacher',
            );
          }
        }

        // Create new assignments
        const assignments = dto.assignClassSubjects.map((assignment) =>
          this.assignmentRepo.create({
            classId: assignment.classId,
            teacherId: id,
            subjectId: assignment.subjectId || null,
            isClassTeacher: assignment.isClassTeacher || false,
            schoolId,
          }),
        );
        await this.assignmentRepo.save(assignments);
      }
    }

    // DEPRECATED: Keep backward compatibility
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
    return { message: `Invite resent to ${teacher.user.email ?? 'no-email'}` };
  }
}
