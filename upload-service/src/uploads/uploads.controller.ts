import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { Express } from 'express';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('description') description: string,
  ) {
    console.log('Received file:', file);
    console.log('Title:', title);
    console.log('Description:', description);
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Check it is an image
    if (!file.mimetype.includes('image')) {
      throw new BadRequestException('File must be an image');
    }

    return this.uploadsService.processUpload(file, { title, description });
  }
}
