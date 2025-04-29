import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { join } from 'path';
import * as fs from 'fs';

describe('Uploads Endpoint (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/uploads (POST) should reject requests without files', () => {
    return request(app.getHttpServer())
      .post('/uploads')
      .field('title', 'Test Image')
      .field('description', 'Test Description')
      .expect(400);
  });

  it('/uploads (POST) should accept valid image uploads', async () => {
    const testImagePath = join(__dirname, 'test-image.jpg');

    if (!fs.existsSync(testImagePath)) {
      fs.writeFileSync(testImagePath, Buffer.from('fake image content'));
    }

    const response = await request(app.getHttpServer())
      .post('/uploads')
      .attach('file', testImagePath)
      .field('title', 'Test Image')
      .field('description', 'Test Description')
      .expect(201);

    // Limpiar archivo de prueba
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    expect(response.body).toBeDefined();
    expect(response.body.originalName).toBe('test-image.jpg');
    expect(response.body.status).toBe('uploaded');
  });
});
