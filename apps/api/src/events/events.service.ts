import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Create Event
  async create(data: any) {
    return this.prisma.event.create({ data });
  }

  // Get All Events
  async getAll(upcoming: boolean = false) {
    const where: any = { isActive: true };
    
    if (upcoming) {
      where.startDate = { gte: new Date() };
    }

    return this.prisma.event.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true }
        }
      },
      orderBy: { startDate: 'asc' }
    });
  }

  // Get Event Details
  async getById(id: number) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            student: true
          }
        }
      }
    });
  }

  // Update Event
  async update(id: number, data: any) {
    return this.prisma.event.update({ where: { id }, data });
  }

  // Delete Event
  async delete(id: number) {
    return this.prisma.event.update({
      where: { id },
      data: { isActive: false }
    });
  }

  // Register Student
  async register(eventId: number, studentId: number) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { registrations: true } } }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Capacity checking removed - can be added to schema later if needed
    // Registration deadline checking removed - can be added to schema later if needed

    return this.prisma.eventRegistration.create({
      data: { eventId, studentId }
    });
  }

  // Cancel Registration
  async cancelRegistration(eventId: number, studentId: number) {
    return this.prisma.eventRegistration.update({
      where: { eventId_studentId: { eventId, studentId } },
      data: { status: 'CANCELLED' }
    });
  }

  // Mark Attendance (using EventRegistration status field)
  async markAttendance(eventId: number, studentId: number, status: string, notes?: string) {
    return this.prisma.eventRegistration.update({
      where: { eventId_studentId: { eventId, studentId } },
      data: { status }
    });
  }

  // Get Attendance Report
  async getAttendanceReport(eventId: number) {
    return this.prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        event: { select: { title: true, startDate: true } },
        student: { select: { firstName: true, lastName: true } }
      }
    });
  }

  // Export to Calendar
  async exportToCalendar(eventId: number) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    
    if (!event) {
      throw new Error('Event not found');
    }

    return {
      format: 'ical',
      event: {
        summary: event.title,
        description: event.description,
        location: event.location,
        dtstart: event.startDate.toISOString(),
        dtend: event.endDate.toISOString()
      }
    };
  }
}
