import cloudinary from '../config/cloudinary';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface FileUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  originalFilename: string;
  size: number;
  format: string;
}

export interface FileUploadError {
  message: string;
  code?: string;
}

export class FileService {
  /**
   * Upload a PDF file to Cloudinary
   */
  static async uploadPDF(
    fileBuffer: Buffer,
    originalFilename: string,
    folder: string = 'manuscripts'
  ): Promise<FileUploadResult> {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const publicId = `${folder}/${timestamp}_${sanitizedFilename}`;

      const result: UploadApiResponse = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw', // For non-image files like PDFs
            public_id: publicId,
            folder: folder,
            use_filename: true,
            unique_filename: false,
          },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result);
            } else {
              reject(new Error('Upload failed with no result'));
            }
          }
        ).end(fileBuffer);
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        originalFilename,
        size: result.bytes,
        format: result.format,
      };
    } catch (error: any) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Delete a file from Cloudinary
   */
  static async deleteFile(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
      });
      return result.result === 'ok';
    } catch (error: any) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * Get file information from Cloudinary
   */
  static async getFileInfo(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: 'raw',
      });
      return result;
    } catch (error: any) {
      throw new Error(`Failed to get file info: ${error.message}`);
    }
  }

  /**
   * Generate a secure download URL for a file
   */
  static generateSecureUrl(publicId: string, expiresIn: number = 3600): string {
    try {
      return cloudinary.utils.private_download_url(publicId, 'raw', {
        expires_at: Math.floor(Date.now() / 1000) + expiresIn,
      });
    } catch (error: any) {
      throw new Error(`Failed to generate secure URL: ${error.message}`);
    }
  }

  /**
   * Validate file type and size
   */
  static validateFile(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // Check file type
    if (file.mimetype !== 'application/pdf') {
      return {
        isValid: false,
        error: 'Only PDF files are allowed',
      };
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB',
      };
    }

    return { isValid: true };
  }
}