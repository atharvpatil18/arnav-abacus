import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async generateCompletionCertificate(studentId: number, levelId: number): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: {
          include: {
            level: true
          }
        }
      }
    });

    const level = await this.prisma.level.findUnique({
      where: { id: levelId }
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();

      // Header
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#0066cc')
        .text('Arnav Abacus Academy', 100, 80, { align: 'center' });

      doc.fontSize(24)
        .fillColor('#333333')
        .text('Certificate of Completion', 100, 130, { align: 'center' });

      // Decorative line
      doc.moveTo(250, 170).lineTo(550, 170).stroke();

      // Body
      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#000000')
        .text('This is to certify that', 100, 200, { align: 'center' });

      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#cc0000')
        .text(`${student?.firstName} ${student?.lastName || ''}`, 100, 240, { align: 'center' });

      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#000000')
        .text('has successfully completed', 100, 290, { align: 'center' });

      doc.fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#0066cc')
        .text(`${level?.name}`, 100, 330, { align: 'center' });

      doc.fontSize(14)
        .font('Helvetica')
        .text(`with dedication and excellent performance`, 100, 380, { align: 'center' });

      // Date
      doc.fontSize(12)
        .text(`Date: ${new Date().toLocaleDateString()}`, 100, 450, { align: 'center' });

      // Signatures
      doc.fontSize(10)
        .text('_____________________', 150, 500)
        .text('Principal', 170, 520)
        .text('_____________________', 500, 500)
        .text('Teacher', 530, 520);

      doc.end();
    });
  }

  async generateAchievementCertificate(studentId: number, achievement: string, description: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke();
      doc.rect(35, 35, doc.page.width - 70, doc.page.height - 70).stroke();

      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#0066cc')
        .text('Arnav Abacus Academy', 100, 80, { align: 'center' });

      doc.fontSize(24)
        .fillColor('#FFD700')
        .text('🏆 Certificate of Achievement 🏆', 100, 130, { align: 'center' });

      doc.fontSize(16)
        .fillColor('#000000')
        .text('Presented to', 100, 200, { align: 'center' });

      doc.fontSize(28)
        .font('Helvetica-Bold')
        .fillColor('#cc0000')
        .text(`${student?.firstName} ${student?.lastName || ''}`, 100, 240, { align: 'center' });

      doc.fontSize(16)
        .font('Helvetica')
        .text('for', 100, 290, { align: 'center' });

      doc.fontSize(20)
        .font('Helvetica-Bold')
        .fillColor('#0066cc')
        .text(achievement, 100, 330, { align: 'center' });

      doc.fontSize(14)
        .font('Helvetica')
        .text(description, 100, 380, { align: 'center', width: 600 });

      doc.fontSize(12)
        .text(`Date: ${new Date().toLocaleDateString()}`, 100, 450, { align: 'center' });

      doc.fontSize(10)
        .text('_____________________', 150, 500)
        .text('Principal', 170, 520)
        .text('_____________________', 500, 500)
        .text('Teacher', 530, 520);

      doc.end();
    });
  }

  async generateIDCard(studentId: number): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: {
          include: {
            level: true
          }
        }
      }
    });

    const qrCodeDataUrl = await QRCode.toDataURL(student?.enrollmentNumber || `STUDENT-${studentId}`);
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: [240, 360] }); // ID card size
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Background color
      doc.rect(0, 0, 240, 80).fill('#0066cc');

      // Header
      doc.fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF')
        .text('Arnav Abacus', 20, 20, { align: 'center', width: 200 })
        .fontSize(12)
        .text('Academy', 20, 45, { align: 'center', width: 200 });

      // QR Code
      doc.image(qrCodeBuffer, 70, 100, { width: 100 });

      // Student Details
      doc.fontSize(10)
        .fillColor('#000000')
        .font('Helvetica')
        .text(`ID: ${student?.enrollmentNumber}`, 20, 220, { align: 'center', width: 200 });

      doc.fontSize(14)
        .font('Helvetica-Bold')
        .text(`${student?.firstName} ${student?.lastName || ''}`, 20, 240, { align: 'center', width: 200 });

      doc.fontSize(10)
        .font('Helvetica')
        .text(`Level: ${student?.batch?.level?.name}`, 20, 270, { align: 'center', width: 200 })
        .text(`Batch: ${student?.batch?.name}`, 20, 290, { align: 'center', width: 200 });

      const validTill = new Date();
      validTill.setFullYear(validTill.getFullYear() + 1);
      doc.fontSize(8)
        .text(`Valid Till: ${validTill.toLocaleDateString()}`, 20, 320, { align: 'center', width: 200 });

      doc.end();
    });
  }

  async generateReportCard(studentId: number, term: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        batch: {
          include: {
            level: true
          }
        },
        tests: {
          orderBy: { date: 'desc' },
          take: 10
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 100
        }
      }
    });

    // Calculate attendance percentage
    const totalDays = student?.attendances?.length || 0;
    const presentDays = student?.attendances?.filter(a => a.status === 'PRESENT').length || 0;
    const attendancePercent = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

    // Calculate average test score
    const avgScore = student?.tests && student.tests.length > 0
      ? (student.tests.reduce((sum, t) => sum + t.percent, 0) / student.tests.length).toFixed(1)
      : '0';

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#0066cc')
        .text('PROGRESS REPORT CARD', { align: 'center' });

      doc.fontSize(12)
        .fillColor('#666666')
        .text(`Term: ${term} | Academic Year: ${new Date().getFullYear()}`, { align: 'center' });

      doc.moveDown(2);

      // Student Information
      doc.fontSize(10).fillColor('#000000').font('Helvetica');
      doc.text(`Enrollment No: ${student?.enrollmentNumber || 'N/A'}`, 50);
      doc.text(`Name: ${student?.firstName} ${student?.lastName || ''}`, 50);
      doc.text(`Level: ${student?.batch?.level?.name}`, 50);
      doc.text(`Batch: ${student?.batch?.name}`, 50);

      doc.moveDown(2);

      // Attendance Section
      doc.fontSize(14).font('Helvetica-Bold').text('ATTENDANCE', 50);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Days: ${totalDays}`, 50);
      doc.text(`Present: ${presentDays}`, 50);
      doc.text(`Attendance %: ${attendancePercent}%`, 50);

      doc.moveDown(2);

      // Test Results Section
      doc.fontSize(14).font('Helvetica-Bold').text('TEST RESULTS', 50);
      doc.fontSize(10).font('Helvetica');

      if (student?.tests && student.tests.length > 0) {
        student.tests.slice(0, 5).forEach((test, i) => {
          doc.text(`${test.testName}: ${test.percent}% (${test.totalObtained}/${test.totalPossible})`, 50);
        });
      } else {
        doc.text('No tests recorded yet', 50);
      }

      doc.moveDown(2);

      // Overall Performance
      doc.fontSize(14).font('Helvetica-Bold').text('OVERALL PERFORMANCE', 50);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Average Score: ${avgScore}%`, 50);
      doc.text(`Attendance: ${attendancePercent}%`, 50);

      let grade = 'C';
      if (parseFloat(avgScore) >= 90) grade = 'A+';
      else if (parseFloat(avgScore) >= 80) grade = 'A';
      else if (parseFloat(avgScore) >= 70) grade = 'B';
      else if (parseFloat(avgScore) >= 60) grade = 'C';
      else grade = 'D';

      doc.text(`Grade: ${grade}`, 50);

      doc.moveDown(3);

      // Signatures
      doc.fontSize(10);
      doc.text('_____________________', 100, 650)
        .text('Teacher', 120, 670)
        .text('_____________________', 350, 650)
        .text('Principal', 370, 670);

      doc.end();
    });
  }
}
