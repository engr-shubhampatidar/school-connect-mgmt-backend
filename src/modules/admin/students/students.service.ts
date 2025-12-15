import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { CreateStudentDto } from './dto/create-student.dto';
// `xlsx` is loaded dynamically inside the import handler to avoid global `any` typings

@Injectable()
export class AdminStudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
    @InjectRepository(School)
    private schoolRepo: Repository<School>,
  ) {}

  private async ensureSchool(schoolId: string) {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new BadRequestException('Invalid school context');
    return school;
  }

  async create(schoolId: string, dto: CreateStudentDto) {
    await this.ensureSchool(schoolId);

    // validate class belongs to school
    const cls = await this.classRepo.findOne({
      where: { id: dto.classId, school: { id: schoolId } },
    });
    if (!cls) throw new BadRequestException('Invalid class for this school');

    const student = this.studentRepo.create({
      name: dto.name,
      rollNo: dto.rollNo,
      currentClass: cls,
      school: { id: schoolId },
      photoUrl: dto.photoUrl,
    });

    const saved = await this.studentRepo.save(student);
    return { id: saved.id, name: saved.name };
  }

  async list(
    schoolId: string,
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      classId?: string;
    },
  ) {
    await this.ensureSchool(schoolId);
    const page = query?.page ?? 1;
    const limit = query?.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.studentRepo
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.currentClass', 'c')
      .where('s.schoolId = :schoolId', { schoolId });
    if (query?.search)
      qb.andWhere('(s.name ILIKE :q OR s.rollNo ILIKE :q)', {
        q: `%${query.search}%`,
      });
    if (query?.classId)
      qb.andWhere('s.classId = :classId', { classId: query.classId });

    const [items, total] = await qb.skip(skip).take(limit).getManyAndCount();
    return { items, total, page, limit };
  }

  async update(schoolId: string, id: string, dto: Partial<CreateStudentDto>) {
    await this.ensureSchool(schoolId);
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['currentClass'],
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.school?.id !== schoolId)
      throw new BadRequestException('Not allowed');

    if (dto.classId) {
      const cls = await this.classRepo.findOne({
        where: { id: dto.classId, school: { id: schoolId } },
      });
      if (!cls) throw new BadRequestException('Invalid class for this school');
      student.currentClass = cls;
    }

    if (dto.name !== undefined) student.name = dto.name;
    if (dto.rollNo !== undefined) student.rollNo = dto.rollNo;
    if ('photoUrl' in dto && dto.photoUrl !== undefined)
      student.photoUrl = dto.photoUrl;

    const saved = await this.studentRepo.save(student);
    return { id: saved.id, name: saved.name };
  }

  async importCsvBuffer(schoolId: string, buffer: Buffer) {
    await this.ensureSchool(schoolId);
    const text = buffer.toString('utf8');
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) throw new BadRequestException('Empty file');

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const nameIdx = header.indexOf('name');
    const rollIdx = header.indexOf('rollno');
    const classIdx = header.indexOf('classid');
    const photoIdx = header.indexOf('photourl');
    if (nameIdx === -1 || classIdx === -1)
      throw new BadRequestException(
        'CSV must include name and classId columns',
      );

    const toInsert: Student[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim());
      const rowNum = i + 1;
      const name = row[nameIdx] ?? '';
      const rollNo = rollIdx !== -1 ? (row[rollIdx] ?? '') : undefined;
      const classId = row[classIdx] ?? '';
      const photoUrl =
        photoIdx !== -1 ? (row[photoIdx] ?? undefined) : undefined;

      if (!name) {
        errors.push({ row: rowNum, error: 'Missing name' });
        continue;
      }
      if (!classId) {
        errors.push({ row: rowNum, error: 'Missing classId' });
        continue;
      }

      const cls = await this.classRepo.findOne({
        where: { id: classId, school: { id: schoolId } },
      });
      if (!cls) {
        errors.push({ row: rowNum, error: 'Invalid classId for this school' });
        continue;
      }

      const s = this.studentRepo.create({
        name,
        rollNo: rollNo || undefined,
        currentClass: cls,
        school: { id: schoolId },
        photoUrl,
      });
      toInsert.push(s);
    }

    let inserted = 0;
    if (toInsert.length) {
      const saved = await this.studentRepo.save(toInsert);
      inserted = saved.length;
    }

    return {
      total: lines.length - 1,
      success: inserted,
      failed: errors.length,
      errors,
    };
  }

  async importExcelBuffer(schoolId: string, buffer: Buffer) {
    await this.ensureSchool(schoolId);
    type ExcelUtils = {
      sheet_to_json: (sheet: unknown, opts?: any) => unknown[];
    };
    type LocalWorkbook = {
      SheetNames: string[];
      Sheets: Record<string, unknown>;
      utils: ExcelUtils;
    };
    const mod = (await import('xlsx')) as {
      read: (d: Buffer, opts?: any) => LocalWorkbook;
    };
    const workbook: LocalWorkbook = mod.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = workbook.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
    }) as unknown[][];
    if (!rows || rows.length === 0)
      throw new BadRequestException('Empty sheet');

    const firstRow = rows[0];
    const cellToString = (v: unknown) => {
      if (typeof v === 'string') return v.trim();
      if (v == null) return '';
      if (typeof v === 'number' || typeof v === 'boolean')
        return String(v).trim();
      if (typeof v === 'object') {
        try {
          return JSON.stringify(v);
        } catch {
          return '';
        }
      }
      return '';
    };
    const header: string[] = firstRow.map((h) => {
      const s = cellToString(h);
      return s.toLowerCase();
    });
    const nameIdx = header.indexOf('name');
    const rollIdx = header.indexOf('rollno');
    const classIdx = header.indexOf('classid');
    const photoIdx = header.indexOf('photourl');
    if (nameIdx === -1 || classIdx === -1)
      throw new BadRequestException(
        'Sheet must include name and classId columns',
      );

    const toInsert: Student[] = [];
    const errors: Array<{ row: number; error: string }> = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;
      const name = cellToString(row[nameIdx]);
      const rollNo = rollIdx !== -1 ? cellToString(row[rollIdx]) : undefined;
      const classId = cellToString(row[classIdx]);
      const photoUrl =
        photoIdx !== -1 ? cellToString(row[photoIdx]) : undefined;

      if (!name) {
        errors.push({ row: rowNum, error: 'Missing name' });
        continue;
      }
      if (!classId) {
        errors.push({ row: rowNum, error: 'Missing classId' });
        continue;
      }

      const cls = await this.classRepo.findOne({
        where: { id: classId, school: { id: schoolId } },
      });
      if (!cls) {
        errors.push({ row: rowNum, error: 'Invalid classId for this school' });
        continue;
      }

      const s = this.studentRepo.create({
        name,
        rollNo: rollNo || undefined,
        currentClass: cls,
        school: { id: schoolId },
        photoUrl,
      });
      toInsert.push(s);
    }

    let inserted = 0;
    if (toInsert.length) {
      const saved = await this.studentRepo.save(toInsert);
      inserted = saved.length;
    }

    return {
      total: rows.length - 1,
      success: inserted,
      failed: errors.length,
      errors,
    };
  }
}
