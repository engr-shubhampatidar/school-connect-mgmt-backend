import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStudent } from './entities/attendance-student.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { Student } from '../students/entities/student.entity';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';
import { ClassTeacherAssignment } from '../admin/classes/entities/class-teacher-assignment.entity';
import { User, UserRole } from '../users/entities/user.entity';

interface AuthUser {
  id: string;
  schoolId: string;
}

@Injectable()
export class AttendanceService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(AttendanceStudent)
    private attendanceStudentRepo: Repository<AttendanceStudent>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(TeacherProfile)
    private teacherRepo: Repository<TeacherProfile>,
    @InjectRepository(ClassTeacherAssignment)
    private classAssignRepo: Repository<ClassTeacherAssignment>,
  ) {}

  async create(createDto: CreateAttendanceDto, user: AuthUser) {
    const schoolId = user.schoolId;
    const { classId, date, students } = createDto;

    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Attendance, {
        where: { schoolId, classId, date },
      });
      if (existing)
        throw new ConflictException(
          'Attendance already marked for this class and date',
        );

      // Validate students
      const studentIds = students.map((s) => s.studentId);
      const foundStudents = await manager.findByIds(Student, studentIds);
      if (foundStudents.length !== studentIds.length)
        throw new BadRequestException('Some students not found');

      // Ensure all students belong to class and school
      for (const s of foundStudents) {
        if (s.classId !== classId)
          throw new BadRequestException(
            `Student ${s.id} does not belong to class ${classId}`,
          );
        if (s.schoolId !== schoolId)
          throw new BadRequestException(
            `Student ${s.id} does not belong to your school`,
          );
      }

      const attendance = manager.create(Attendance, {
        schoolId,
        classId,
        date,
        markedBy: user.id,
        status: 'MARKED',
      } as any);

      const saved = await manager.save(attendance);

      const studentEntities = students.map((s) => {
        return manager.create(AttendanceStudent, {
          attendanceId: saved.id,
          studentId: s.studentId,
          status: s.status,
        } as any);
      });

      await manager.save(studentEntities);

      return this.attendanceRepo.findOne({
        where: { id: saved.id },
        relations: ['students'],
      });
    });
  }

  async getAttendance(classId: string, date: string, user: AuthUser) {
    const schoolId = user.schoolId;
    // If the requester is a teacher, ensure they are class teacher for this class
    const attendance = await this.attendanceRepo.findOne({
      where: { schoolId, classId, date },
      relations: ['students'],
    });
    if (!attendance) return null;

    const maybeUser = user as unknown as User;
    if (maybeUser && maybeUser.role === UserRole.TEACHER) {
      // find teacher profile
      const teacherProfile = await this.teacherRepo.findOne({
        where: { user: { id: maybeUser.id } },
      });
      if (!teacherProfile)
        throw new BadRequestException('Teacher profile not found');

      const assignment = await this.classAssignRepo.findOne({
        where: {
          classId,
          teacherId: teacherProfile.id,
          schoolId,
        },
      });
      if (!assignment) throw new BadRequestException('Not authorized');
    }

    return attendance;
  }

  async update(attendanceId: string, dto: UpdateAttendanceDto, user: AuthUser) {
    const schoolId = user.schoolId;
    return this.dataSource.transaction(async (manager) => {
      const attendance = await manager.findOne(Attendance, {
        where: { id: attendanceId, schoolId },
      });
      if (!attendance) throw new NotFoundException('Attendance not found');

      // If date is being changed, ensure uniqueness for class+date
      if (dto.date && dto.date !== attendance.date) {
        const existing = await manager.findOne(Attendance, {
          where: { schoolId, classId: attendance.classId, date: dto.date },
        });
        if (existing)
          throw new ConflictException(
            'Another attendance exists for this class and date',
          );
        attendance.date = dto.date;
      }

      await manager.save(attendance);

      // If students are provided, validate they belong to the same class and school
      if (dto.students && dto.students.length) {
        const studentIds = dto.students.map((s) => s.studentId);
        const foundStudents = await manager.findByIds(Student, studentIds);
        if (foundStudents.length !== studentIds.length)
          throw new BadRequestException('Some students not found');

        for (const s of foundStudents) {
          if (s.classId !== attendance.classId)
            throw new BadRequestException(
              `Student ${s.id} does not belong to class ${attendance.classId}`,
            );
          if (s.schoolId !== schoolId)
            throw new BadRequestException(
              `Student ${s.id} does not belong to your school`,
            );
        }

        for (const s of dto.students) {
          const existing = await manager.findOne(AttendanceStudent, {
            where: { attendanceId: attendance.id, studentId: s.studentId },
          });
          if (existing) {
            existing.status = s.status;
            await manager.save(existing);
          } else {
            const newRec = manager.create(AttendanceStudent, {
              attendanceId: attendance.id,
              studentId: s.studentId,
              status: s.status,
            } as any);
            await manager.save(newRec);
          }
        }
      }

      return this.attendanceRepo.findOne({
        where: { id: attendance.id },
        relations: ['students'],
      });
    });
  }

  async getClassHistory(
    classId: string,
    from: string | undefined,
    to: string | undefined,
    user: AuthUser,
  ) {
    const schoolId = user.schoolId;
    const maybeUser = user as unknown as User;
    if (maybeUser && maybeUser.role === UserRole.TEACHER) {
      const teacherProfile = await this.teacherRepo.findOne({
        where: { user: { id: maybeUser.id } },
      });
      if (!teacherProfile)
        throw new BadRequestException('Teacher profile not found');
      const assignment = await this.classAssignRepo.findOne({
        where: { classId, teacherId: teacherProfile.id, schoolId },
      });
      if (!assignment) throw new BadRequestException('Not authorized');
    }
    const qb = this.attendanceRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.students', 's')
      .where('a.schoolId = :schoolId', { schoolId })
      .andWhere('a.classId = :classId', { classId });
    if (from) qb.andWhere('a.date >= :from', { from });
    if (to) qb.andWhere('a.date <= :to', { to });
    qb.orderBy('a.date', 'DESC');
    return qb.getMany();
  }

  async getStudentHistory(studentId: string, user: AuthUser) {
    const schoolId = user.schoolId;
    // Ensure student belongs to same school
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.schoolId !== schoolId)
      throw new NotFoundException('Student not found in your school');

    const maybeUser = user as unknown as User;
    if (maybeUser && maybeUser.role === UserRole.TEACHER) {
      const teacherProfile = await this.teacherRepo.findOne({
        where: { user: { id: maybeUser.id } },
      });
      if (!teacherProfile)
        throw new BadRequestException('Teacher profile not found');
      const assignment = await this.classAssignRepo.findOne({
        where: {
          classId: student.classId,
          teacherId: teacherProfile.id,
          schoolId,
        },
      });
      if (!assignment) throw new BadRequestException('Not authorized');
    }

    const qb = this.attendanceStudentRepo
      .createQueryBuilder('as')
      .leftJoinAndSelect('as.attendance', 'a')
      .where('as.studentId = :studentId', { studentId })
      .andWhere('a.schoolId = :schoolId', { schoolId })
      .orderBy('a.date', 'DESC');
    return qb.getMany();
  }
}
