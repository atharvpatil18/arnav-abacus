import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    // In production, we would upload to S3 here
    // const s3 = new AWS.S3();
    // await s3.upload({
    //   Bucket: process.env.AWS_S3_BUCKET,
    //   Key: `uploads/${file.filename}`,
    //   Body: file.buffer
    // }).promise();

    // For development, return local path
    return {
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  }
}
