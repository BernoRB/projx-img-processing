/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { BadRequestException } from '@nestjs/common';

describe('UploadsController', () => {
  let controller: UploadsController;
  let mockUploadsService: Partial<UploadsService>;

  beforeEach(async () => {
    // Mock para el servicio
    mockUploadsService = {
      processUpload: jest.fn().mockImplementation((file, metadata) => {
        return {
          id: 'mock-uuid',
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          s3Url: 'https://example-bucket.s3.amazonaws.com/mock-uuid',
          metadata,
          status: 'uploaded',
          createdAt: new Date().toISOString(),
        };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should reject non-image files', async () => {
      const mockFile = {
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
        size: 12345,
      } as Express.Multer.File;

      await expect(
        controller.uploadFile(mockFile, 'Test Title', 'Test Description')
      ).rejects.toThrow(BadRequestException);
    });

    it('should process valid image files', async () => {
      const mockFile = {
        originalname: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: 12345,
      } as Express.Multer.File;

      const result = await controller.uploadFile(
        mockFile,
        'Test Title',
        'Test Description'
      );

      expect(result).toBeDefined();
      expect(result.originalName).toBe('test-image.jpg');
      expect(mockUploadsService.processUpload).toHaveBeenCalledWith(
        mockFile, { title: 'Test Title', description: 'Test Description' }      
      );
    });
  });
});
