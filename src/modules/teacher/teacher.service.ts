import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassTeacherAssignment } from '../admin/classes/entities/class-teacher-assignment.entity';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';
import { Student } from '../students/entities/student.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TeacherClassService {
  constructor(
    @InjectRepository(ClassTeacherAssignment)
    private classAssignRepo: Repository<ClassTeacherAssignment>,
    @InjectRepository(TeacherProfile)
    private teacherRepo: Repository<TeacherProfile>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
  ) {}

  async getClassForTeacher(user: User) {
    try {
      if (!user) throw new ForbiddenException('Unauthenticated');
      if (user.role !== UserRole.TEACHER)
        throw new ForbiddenException('Not a teacher');

      if (!user.schoolId)
        throw new ForbiddenException('Missing school context');

      const schoolId = user.schoolId;

      const teacherProfile = await this.teacherRepo.findOne({
        where: { user: { id: user.id }, school: { id: schoolId } },
      });
      if (!teacherProfile)
        throw new NotFoundException('Teacher profile not found');

      const assignment = await this.classAssignRepo.findOne({
        where: {
          teacherId: teacherProfile.id,
          isClassTeacher: true,
          schoolId,
        },
        relations: ['classEntity'],
      });

      if (!assignment || !assignment.classEntity) {
        throw new NotFoundException('Teacher is not assigned as class teacher');
      }

      const klass = assignment.classEntity;

      const students = await this.studentRepo.find({
        where: { currentClass: { id: klass.id }, school: { id: schoolId } },
        relations: ['currentClass', 'school'],
      });

      return {
        class: {
          id: klass.id,
          name: klass.name,
          section: klass.section,
        },
        students: students.map((s) => ({
          id: s.id,
          name: s.name,
          rollNo: s.rollNo,
          photoUrl: s.photoUrl ?? null,
        })),
      };
    } catch (err) {
      if (err instanceof NotFoundException || err instanceof ForbiddenException)
        throw err;
      throw new InternalServerErrorException('Failed to fetch teacher class');
    }
  }
}
