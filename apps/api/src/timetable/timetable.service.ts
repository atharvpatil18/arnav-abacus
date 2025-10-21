import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  // Create Timetable Entry
  async create(data: any) {
    // Check for conflicts
    const conflict = await this.checkConflict(data.batchId, data.dayOfWeek, data.startTime, data.endTime, data.teacherId);
    if (conflict) {
      throw new Error('Timetable conflict detected');
    }

    return this.prisma.timetable.create({ data });
  }

  // Update Timetable
  async update(id: number, data: any) {
    return this.prisma.timetable.update({ where: { id }, data });
  }

  // Get by Batch
  async getByBatch(batchId: number) {
    return this.prisma.timetable.findMany({
      where: { batchId, isActive: true },
      include: { batch: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
  }

  // Get by Teacher
  async getByTeacher(teacherId: number) {
    return this.prisma.timetable.findMany({
      where: { teacherId, isActive: true },
      include: { batch: { include: { level: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
  }

  // Conflict Detection
  async checkConflict(batchId: number, dayOfWeek: number, startTime: string, endTime: string, teacherId?: number) {
    const conflicts = await this.prisma.timetable.findMany({
      where: {
        OR: [
          { batchId, dayOfWeek },
          ...(teacherId ? [{ teacherId, dayOfWeek }] : [])
        ],
        isActive: true
      }
    });

    return conflicts.some(t => {
      return (startTime >= t.startTime && startTime < t.endTime) ||
             (endTime > t.startTime && endTime <= t.endTime) ||
             (startTime <= t.startTime && endTime >= t.endTime);
    });
  }

  // Export to Calendar Format (iCal)
  async exportToCalendar(batchId: number) {
    const timetable = await this.getByBatch(batchId);
    
    const icsEvents = timetable.map(t => ({
      summary: `${t.batch.name} Class`,
      dtstart: this.getNextOccurrence(t.dayOfWeek, t.startTime),
      dtend: this.getNextOccurrence(t.dayOfWeek, t.endTime),
      rrule: `FREQ=WEEKLY;BYDAY=${this.getDayAbbr(t.dayOfWeek)}`,
      location: t.room || '',
      description: `Teacher ID: ${t.teacherId || 'TBA'}`
    }));

    return { format: 'ical', events: icsEvents };
  }

  private getNextOccurrence(dayOfWeek: number, time: string) {
    const now = new Date();
    const targetDay = dayOfWeek;
    const currentDay = now.getDay();
    const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
    
    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntilTarget);
    
    const [hours, minutes] = time.split(':');
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    return nextDate.toISOString();
  }

  private getDayAbbr(day: number) {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return days[day];
  }

  // Delete
  async delete(id: number) {
    return this.prisma.timetable.update({
      where: { id },
      data: { isActive: false }
    });
  }
}
