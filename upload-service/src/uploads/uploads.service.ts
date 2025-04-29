import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { UploadedFile } from './interfaces/file.interface';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  async processUpload(
    file: UploadedFile,
    metadata: { title?: string; description?: string },
  ) {
    // Generar un ID único para esta imagen
    const imageId: string = uuidv4();

    // TODO upload to S3
    this.logger.log(
      `Uploading file ${file.originalname} to S3 with ID: ${imageId}`,
    );

    const s3Url = `https://example-bucket.s3.amazonaws.com/${imageId}`;

    // TODO send sqs msg
    this.logger.log(`Sending message to SQS for processing: ${imageId}`);

    // Devolver información al cliente
    return {
      id: imageId,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      s3Url,
      metadata,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
    };
  }
}
