import { Request, Response } from 'express';
import { FileService, FileUploadResult } from '../services/FileService';

export class FileController {
  /**
   * Upload a manuscript file
   */
  static async uploadManuscript(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          error: 'No file uploaded',
          message: 'Please select a PDF file to upload',
        });
        return;
      }

      // Upload file to Cloudinary
      const uploadResult: FileUploadResult = await FileService.uploadPDF(
        req.file.buffer,
        req.file.originalname,
        'manuscripts'
      );

      res.status(200).json({
        message: 'File uploaded successfully',
        data: {
          fileId: uploadResult.publicId,
          url: uploadResult.secureUrl,
          originalName: uploadResult.originalFilename,
          size: uploadResult.size,
          format: uploadResult.format,
        },
      });
    } catch (error: any) {
      console.error('File upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error.message,
      });
    }
  }

  /**
   * Get secure download URL for a file
   */
  static async getDownloadUrl(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;
      const expiresIn = req.query?.expiresIn;

      if (!fileId) {
        res.status(400).json({
          error: 'Missing file ID',
          message: 'File ID is required',
        });
        return;
      }

      const expires = expiresIn ? parseInt(expiresIn as string) : 3600; // Default 1 hour
      const downloadUrl = FileService.generateSecureUrl(fileId, expires);

      res.status(200).json({
        message: 'Download URL generated successfully',
        data: {
          downloadUrl,
          expiresIn: expires,
          expiresAt: new Date(Date.now() + expires * 1000).toISOString(),
        },
      });
    } catch (error: any) {
      console.error('Download URL generation error:', error);
      res.status(500).json({
        error: 'Failed to generate download URL',
        message: error.message,
      });
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          error: 'Missing file ID',
          message: 'File ID is required',
        });
        return;
      }

      const deleted = await FileService.deleteFile(fileId);

      if (deleted) {
        res.status(200).json({
          message: 'File deleted successfully',
        });
      } else {
        res.status(404).json({
          error: 'File not found',
          message: 'The specified file could not be found or deleted',
        });
      }
    } catch (error: any) {
      console.error('File deletion error:', error);
      res.status(500).json({
        error: 'Deletion failed',
        message: error.message,
      });
    }
  }

  /**
   * Get file information
   */
  static async getFileInfo(req: Request, res: Response): Promise<void> {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({
          error: 'Missing file ID',
          message: 'File ID is required',
        });
        return;
      }

      const fileInfo = await FileService.getFileInfo(fileId);

      res.status(200).json({
        message: 'File information retrieved successfully',
        data: {
          publicId: fileInfo.public_id,
          url: fileInfo.secure_url,
          size: fileInfo.bytes,
          format: fileInfo.format,
          createdAt: fileInfo.created_at,
          resourceType: fileInfo.resource_type,
        },
      });
    } catch (error: any) {
      console.error('File info retrieval error:', error);
      res.status(404).json({
        error: 'File not found',
        message: 'The specified file could not be found',
      });
    }
  }
}