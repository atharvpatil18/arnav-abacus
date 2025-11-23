import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { StudentsModule } from './students/students.module';
import { BatchesModule } from './batches/batches.module';
import { LevelsModule } from './levels/levels.module';
import { TestsModule } from './tests/tests.module';
import { FeesModule } from './fees/fees.module';
import { AttendanceModule } from './attendance/attendance.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FilesModule } from './files/files.module';
import { ReportsModule } from './reports/reports.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ParentsModule } from './parents/parents.module';
import { HomeworkModule } from './homework/homework.module';
import { TimetableModule } from './timetable/timetable.module';
import { SiblingsModule } from './siblings/siblings.module';
import { ReferralsModule } from './referrals/referrals.module';
import { MessagesModule } from './messages/messages.module';
import { MessageTemplatesModule } from './message-templates/message-templates.module';
// import { EventsModule } from './events/events.module';
import { ExpenditureModule } from './expenditure/expenditure.module';
// import { HolidaysModule } from './holidays/holidays.module';
import { LeaveModule } from './leave/leave.module';
// import { InventoryModule } from './inventory/inventory.module';
import { GuardiansModule } from './guardians/guardians.module';
import { FeeTemplatesModule } from './fee-templates/fee-templates.module';
import { CertificatesModule } from './certificates/certificates.module';
// import { CommunicationsModule } from './communications/communications.module';
// import { BroadcastsModule } from './broadcasts/broadcasts.module';
// import { AnnouncementsModule } from './announcements/announcements.module';
import { HealthModule } from './health/health.module';
import { TeacherModule } from './teacher/teacher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time window in milliseconds (60 seconds = 1 minute)
      limit: 100, // Maximum number of requests per ttl (100 requests per minute)
    }]),
    HealthModule,
    AuthModule,
    UsersModule,
    TeacherModule,
    StudentsModule,
    ParentsModule,
    GuardiansModule,
    BatchesModule,
    LevelsModule,
    TestsModule,
    HomeworkModule,
    FeesModule,
    FeeTemplatesModule,
    ExpenditureModule,
    AttendanceModule,
    LeaveModule,
    TimetableModule,
    NotificationsModule,
    MessagesModule,
    MessageTemplatesModule,
    // CommunicationsModule,
    // BroadcastsModule,
    // AnnouncementsModule,
    // EventsModule,
    // HolidaysModule,
    SiblingsModule,
    ReferralsModule,
    CertificatesModule,
    // InventoryModule,
    FilesModule,
    ReportsModule,
    AnalyticsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}