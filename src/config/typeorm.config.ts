import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { ClassEntity } from 'src/modules/classes/entities/class.entity';
import { Contact } from 'src/modules/contact/entities/contact.entity';
import { School } from 'src/modules/schools/entities/school.entity';
import { Student } from 'src/modules/students/entities/student.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Subject } from 'src/modules/admin/entities/subject.entity';
import { TeacherProfile } from 'src/modules/admin/entities/teacher-profile.entity';
import { ClassTeacherAssignment } from 'src/modules/admin/classes/entities/class-teacher-assignment.entity';
import { Announcement } from 'src/modules/announcements/entities/announcement.entity';
import { Attendance } from 'src/modules/attendance/entities/attendance.entity';
import { AttendanceStudent } from 'src/modules/attendance/entities/attendance-student.entity';
dotenv.config();

const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? process.env.USER,
  password: process.env.DB_PASSWORD ?? undefined,
  database: process.env.DB_NAME ?? 'schoolconnect_dev',
  entities: [
    School,
    User,
    Contact,
    ClassEntity,
    Student,
    Subject,
    TeacherProfile,
    ClassTeacherAssignment,
    Announcement,
    Attendance,
    AttendanceStudent,
  ],
  synchronize: true, // dev-only. Use migrations in prod.
  logging: false,
};

export default config;
