import request from 'supertest';
import express from 'express';
import fileRoutes from '../routes/files';
import { authenticate } from '../middleware/auth';

// Mock the auth middleware
jest.mock('../middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'author',
    };
    next();
  }),
}));

// Mock the FileService
jest.mock('../services/FileService', () => ({
  FileService: {
    uploadPDF: jest.fn().mockResolvedValue({
      publicId: 'manuscripts/123_test.pdf',
      secureUrl: 'https://res.cloudinary.com/test/secure_url',
      originalFilename: 'test.pdf',
      size: 1024,
      format: 'pdf',
    }),
    generateSecureUrl: jest.fn().mockReturnValue('https://secure-download-url.com'),
    deleteFile: jest.fn().mockResolvedValue(true),
    getFileInfo: jest.fn().mockResolvedValue({
      public_id: 'manuscripts/123_test.pdf',
      secure_url: 'https://res.cloudinary.com/test/secure_url',
      bytes: 1024,
      format: 'pdf',
      created_at: '2023-01-01T00:00:00Z',
      resource_type: 'raw',
    }),
    validateFile: jest.fn().mockReturnValue({ isValid: true }),
  },
}));

// Create test app
const app = express();
app.use(express.json());
app.use('/api/files', fileRoutes);

describe('File Upload Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/files/upload/manuscript', () => {
    it('should upload a PDF file successfully', async () => {
      const response = await request(app)
        .post('/api/files/upload/manuscript')
        .attach('manuscript', Buffer.from('fake pdf content'), 'test.pdf')
        .expect(200);

      expect(response.body).toEqual({
        message: 'File uploaded successfully',
        data: {
          fileId: 'manuscripts/123_test.pdf',
          url: 'https://res.cloudinary.com/test/secure_url',
          originalName: 'test.pdf',
          size: 1024,
          format: 'pdf',
        },
      });
    });

    it('should reject non-PDF files', async () => {
      const response = await request(app)
        .post('/api/files/upload/manuscript')
        .attach('manuscript', Buffer.from('fake content'), 'test.txt')
        .expect(400);

      expect(response.body.error).toBe('Invalid file type');
    });

    it('should reject requests without files', async () => {
      const response = await request(app)
        .post('/api/files/upload/manuscript')
        .expect(400);

      expect(response.body.error).toBe('No file uploaded');
    });
  });

  describe('GET /api/files/:fileId/download', () => {
    it('should generate download URL successfully', async () => {
      const response = await request(app)
        .get('/api/files/test-file-id/download')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Download URL generated successfully',
        data: {
          downloadUrl: 'https://secure-download-url.com',
          expiresIn: 3600,
          expiresAt: expect.any(String),
        },
      });
    });

    it('should handle custom expiration time', async () => {
      const response = await request(app)
        .get('/api/files/test-file-id/download?expiresIn=7200')
        .expect(200);

      expect(response.body.data.expiresIn).toBe(7200);
    });
  });

  describe('GET /api/files/:fileId/info', () => {
    it('should return file information successfully', async () => {
      const response = await request(app)
        .get('/api/files/test-file-id/info')
        .expect(200);

      expect(response.body).toEqual({
        message: 'File information retrieved successfully',
        data: {
          publicId: 'manuscripts/123_test.pdf',
          url: 'https://res.cloudinary.com/test/secure_url',
          size: 1024,
          format: 'pdf',
          createdAt: '2023-01-01T00:00:00Z',
          resourceType: 'raw',
        },
      });
    });
  });

  describe('DELETE /api/files/:fileId', () => {
    it('should delete file successfully', async () => {
      const response = await request(app)
        .delete('/api/files/test-file-id')
        .expect(200);

      expect(response.body).toEqual({
        message: 'File deleted successfully',
      });
    });
  });
});