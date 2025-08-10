import { Request, Response } from 'express';
import { FileController } from '../FileController';
import { FileService } from '../../services/FileService';

// Mock FileService
jest.mock('../../services/FileService');

describe('FileController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadManuscript', () => {
    it('should upload file successfully', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

      const mockUploadResult = {
        publicId: 'manuscripts/123_test.pdf',
        secureUrl: 'https://res.cloudinary.com/test/secure_url',
        originalFilename: 'test.pdf',
        size: 1024,
        format: 'pdf',
      };

      mockRequest.file = mockFile;
      (FileService.uploadPDF as jest.Mock).mockResolvedValue(mockUploadResult);

      await FileController.uploadManuscript(mockRequest as Request, mockResponse as Response);

      expect(FileService.uploadPDF).toHaveBeenCalledWith(
        mockFile.buffer,
        mockFile.originalname,
        'manuscripts'
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'File uploaded successfully',
        data: {
          fileId: mockUploadResult.publicId,
          url: mockUploadResult.secureUrl,
          originalName: mockUploadResult.originalFilename,
          size: mockUploadResult.size,
          format: mockUploadResult.format,
        },
      });
    });

    it('should handle missing file', async () => {
      mockRequest.file = undefined;

      await FileController.uploadManuscript(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No file uploaded',
        message: 'Please select a PDF file to upload',
      });
    });

    it('should handle upload error', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        originalname: 'test.pdf',
      } as Express.Multer.File;

      mockRequest.file = mockFile;
      (FileService.uploadPDF as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await FileController.uploadManuscript(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Upload failed',
        message: 'Upload failed',
      });
    });
  });

  describe('getDownloadUrl', () => {
    it('should generate download URL successfully', async () => {
      const mockUrl = 'https://res.cloudinary.com/test/secure_download_url';
      mockRequest.params = { fileId: 'test-file-id' };
      mockRequest.query = { expiresIn: '7200' };

      (FileService.generateSecureUrl as jest.Mock).mockReturnValue(mockUrl);

      await FileController.getDownloadUrl(mockRequest as Request, mockResponse as Response);

      expect(FileService.generateSecureUrl).toHaveBeenCalledWith('test-file-id', 7200);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Download URL generated successfully',
        data: {
          downloadUrl: mockUrl,
          expiresIn: 7200,
          expiresAt: expect.any(String),
        },
      });
    });

    it('should handle missing file ID', async () => {
      mockRequest.params = {};
      mockRequest.query = {};

      await FileController.getDownloadUrl(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Missing file ID',
        message: 'File ID is required',
      });
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      mockRequest.params = { fileId: 'test-file-id' };
      (FileService.deleteFile as jest.Mock).mockResolvedValue(true);

      await FileController.deleteFile(mockRequest as Request, mockResponse as Response);

      expect(FileService.deleteFile).toHaveBeenCalledWith('test-file-id');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'File deleted successfully',
      });
    });

    it('should handle file not found', async () => {
      mockRequest.params = { fileId: 'test-file-id' };
      (FileService.deleteFile as jest.Mock).mockResolvedValue(false);

      await FileController.deleteFile(mockRequest as Request, mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'File not found',
        message: 'The specified file could not be found or deleted',
      });
    });
  });
});