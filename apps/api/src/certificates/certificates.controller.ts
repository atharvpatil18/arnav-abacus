import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('certificates')
@UseGuards(JwtAuthGuard)
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Get('completion/:studentId/:levelId')
  async getCompletionCertificate(
    @Param('studentId') studentId: string,
    @Param('levelId') levelId: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.certificatesService.generateCompletionCertificate(+studentId, +levelId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=completion-certificate-${studentId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  }

  @Get('achievement/:studentId')
  async getAchievementCertificate(
    @Param('studentId') studentId: string,
    @Query('achievement') achievement: string,
    @Query('description') description: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.certificatesService.generateAchievementCertificate(
      +studentId,
      achievement,
      description
    );
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=achievement-certificate-${studentId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  }

  @Get('idcard/:studentId')
  async getIDCard(
    @Param('studentId') studentId: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.certificatesService.generateIDCard(+studentId);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=id-card-${studentId}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  }

  @Get('reportcard/:studentId')
  async getReportCard(
    @Param('studentId') studentId: string,
    @Query('term') term: string,
    @Res() res: Response
  ) {
    const pdfBuffer = await this.certificatesService.generateReportCard(+studentId, term || 'Q1');
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report-card-${studentId}-${term}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.send(pdfBuffer);
  }
}
