import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { QueryAnnouncementsDto } from './dto/query-announcements.dto';

@Injectable()
export class AdminAnnouncementsService {
  private readonly logger = new Logger(AdminAnnouncementsService.name);

  constructor(
    @InjectRepository(Announcement)
    private annRepo: Repository<Announcement>,
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
  ) {}

  private parseAudience(audience?: string) {
    if (!audience || audience === 'all') return { type: 'all' as const };
    if (audience.startsWith('class:')) {
      const id = audience.split(':')[1];
      return { type: 'class' as const, id };
    }
    throw new BadRequestException('Invalid audience value');
  }

  async create(
    schoolId: string,
    dto: CreateAnnouncementDto,
    createdByUserId: string,
  ) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    const aud = this.parseAudience(dto.audience);
    let targetClassId: string | null = null;
    if (aud.type === 'class') {
      // verify class exists and belongs to school
      const cls = await this.classRepo.findOne({
        where: { id: aud.id },
        relations: ['school'],
      });
      if (!cls) throw new BadRequestException('Target class not found');
      if (cls.school?.id !== schoolId)
        throw new BadRequestException('Class does not belong to your school');
      targetClassId = cls.id;
    }

    const ann = this.annRepo.create({
      title: dto.title,
      message: dto.message,
      targetClassId: targetClassId ?? null,
      schoolId,
      attachments: dto.attachments ?? null,
      createdByUserId,
    } as Partial<Announcement>);

    const saved = await this.annRepo.save(ann);
    // stub notification pipeline — log for now
    this.logger.log(`Announcement ${saved.id} created for school ${schoolId}`);
    return saved;
  }

  async list(schoolId: string, q: QueryAnnouncementsDto) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    const page = q.page ?? 1;
    const limit = q.limit ?? 20;
    const qb = this.annRepo
      .createQueryBuilder('a')
      .where('a.schoolId = :schoolId', { schoolId });
    if (q.audience) {
      if (q.audience === 'all') qb.andWhere('a.targetClassId IS NULL');
      else if (q.audience === 'class' && q.classId)
        qb.andWhere('a.targetClassId = :classId', { classId: q.classId });
    }
    if (q.classId)
      qb.andWhere('a.targetClassId = :classId', { classId: q.classId });
    if (q.date) qb.andWhere('DATE(a.createdAt) = :date', { date: q.date });
    if (q.search)
      qb.andWhere('(a.title ILIKE :s OR a.message ILIKE :s)', {
        s: `%${q.search}%`,
      });
    qb.orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }
}
