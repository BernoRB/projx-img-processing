import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StatusService {
  private readonly logger = new Logger(StatusService.name);
  private readonly processingServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.processingServiceUrl =
      this.configService.get<string>('PROCESSING_SERVICE_URL') ||
      'http://processing-service:3001';
  }

  async getImageStatus(imageId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.processingServiceUrl}/api/status/${imageId}`,
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching image status: ${error.message}`);

      if (error.response?.status === 404) {
        throw new NotFoundException('Image not found');
      }

      throw error;
    }
  }
}
