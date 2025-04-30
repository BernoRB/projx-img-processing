import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as AWS from 'aws-sdk';
import { UploadedFile } from './interfaces/file.interface';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  async processUpload(
    file: UploadedFile,
    metadata: { title?: string; description?: string; operations?: any[] },
  ) {
    // Generate ID
    const imageId: string = uuidv4();

    try {
      // Upload to S3
      this.logger.log(
        `Uploading file ${file.originalname} to S3 with ID: ${imageId}`,
      );

      const s3Key = `${imageId}/${file.originalname}`;
      const s3Bucket = process.env.S3_BUCKET_ORIGINAL || '';

      const s3Client = new AWS.S3({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      const uploadResult = await s3Client
        .upload({
          Bucket: s3Bucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        })
        .promise();

      this.logger.log(`File uploaded to S3: ${uploadResult.Location}`);

      // Save on DynamoDB
      const dynamoClient = new AWS.DynamoDB.DocumentClient({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      await dynamoClient
        .put({
          TableName: process.env.DYNAMO_TABLE || '',
          Item: {
            id: imageId,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            s3Key: s3Key,
            s3Url: uploadResult.Location,
            metadata: {
              title: metadata.title || '',
              description: metadata.description || '',
            },
            status: 'uploaded',
            createdAt: new Date().toISOString(),
          },
        })
        .promise();

      // Send sqs msg for processing
      this.logger.log(`Sending message to SQS for processing: ${imageId}`);

      const operations = metadata.operations || '';
      const sqsClient = new AWS.SQS({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      await sqsClient
        .sendMessage({
          QueueUrl: process.env.SQS_PROCESSING_QUEUE_URL || '',
          MessageBody: JSON.stringify({
            imageId,
            s3Key,
            operations,
          }),
        })
        .promise();

      this.logger.log(`Message sent to SQS for processing: ${imageId}`);

      return {
        id: imageId,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        s3Url: uploadResult.Location,
        metadata: {
          title: metadata.title || '',
          description: metadata.description || '',
          operations: operations,
        },
        status: 'uploaded',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error processing upload: ${error.message}`);
      throw new InternalServerErrorException('Failed to process upload');
    }
  }
}
