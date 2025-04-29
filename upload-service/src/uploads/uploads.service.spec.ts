import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { Logger } from '@nestjs/common';

describe('UploadsService', () => {
  let service: UploadsService;
  let mockLogger: Partial<Logger>;

  beforeEach(async () => {
    mockLogger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processUpload', () => {
    it('should process an uploaded file and return metadata', async () => {
      // Mock data
      const mockFile = {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 12345,
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      const mockMetadata = {
        title: 'Test Image',
        description: 'A test image description',
      };

      // Execute method
      const result = await service.processUpload(mockFile, mockMetadata);

      // Assert
      expect(result).toBeDefined();
      expect(result.originalName).toBe('test-image.jpg');
      expect(result.size).toBe(12345);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.metadata).toEqual(mockMetadata);
      expect(result.status).toBe('uploaded');
      expect(result.id).toBeDefined();
      expect(result.s3Url).toContain(result.id);
    });
  });
});
