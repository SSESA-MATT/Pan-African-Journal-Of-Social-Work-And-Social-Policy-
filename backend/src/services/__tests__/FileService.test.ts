import { FileService } from '../FileService';

// Mock Cloudinary
jest.mock('../../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn(),
    destroy: jest.fn(),
  },
  api: {
    resource: jest.fn(),
  },
  utils: {
    private_download_url: jest.fn(),
  },
}));

describe('FileService', () => {
  describe('validateFile', () => {
    it('should validate PDF files correctly', () => {
      const validFile = {
        mimetype: 'application/pdf',
        size: 5 * 1024 * 1024, // 5MB
      } as Express.Multer.File;

      const result = FileService.validateFile(validFile);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-PDF files', () => {
      const invalidFile = {
        mimetype: 'application/msword',
        size: 5 * 1024 * 1024,
      } as Express.Multer.File;

      const result = FileService.validateFile(invalidFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Only PDF files are allowed');
    });

    it('should reject files larger than 10MB', () => {
      const largeFile = {
        mimetype: 'application/pdf',
        size: 15 * 1024 * 1024, // 15MB
      } as Express.Multer.File;

      const result = FileService.validateFile(largeFile);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('File size must be less than 10MB');
    });
  });

  describe('generateSecureUrl', () => {
    it('should generate secure URL with default expiration', () => {
      const mockUrl = 'https://res.cloudinary.com/test/raw/upload/secure_url';
      const cloudinary = require('../../config/cloudinary');
      cloudinary.utils.private_download_url.mockReturnValue(mockUrl);

      const result = FileService.generateSecureUrl('test-public-id');
      
      expect(cloudinary.utils.private_download_url).toHaveBeenCalledWith(
        'test-public-id',
        'raw',
        expect.objectContaining({
          expires_at: expect.any(Number),
        })
      );
      expect(result).toBe(mockUrl);
    });

    it('should generate secure URL with custom expiration', () => {
      const mockUrl = 'https://res.cloudinary.com/test/raw/upload/secure_url';
      const cloudinary = require('../../config/cloudinary');
      cloudinary.utils.private_download_url.mockReturnValue(mockUrl);

      const customExpiry = 7200; // 2 hours
      const result = FileService.generateSecureUrl('test-public-id', customExpiry);
      
      expect(cloudinary.utils.private_download_url).toHaveBeenCalledWith(
        'test-public-id',
        'raw',
        expect.objectContaining({
          expires_at: expect.any(Number),
        })
      );
      expect(result).toBe(mockUrl);
    });
  });
});