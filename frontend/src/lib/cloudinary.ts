import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface FileUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  originalFilename: string;
  size: number;
  format: string;
}

export class CloudinaryService {
  /**
   * Upload a manuscript file to Cloudinary
   */
  static async uploadManuscript(
    fileBuffer: Buffer,
    originalFilename: string,
    authorId: string
  ): Promise<FileUploadResult> {
    try {
      const timestamp = Date.now();
      const sanitizedFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const publicId = `manuscripts/${authorId}/${timestamp}_${sanitizedFilename}`;

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw', // For non-image files like PDFs, DOCX
            public_id: publicId,
            folder: `manuscripts/${authorId}`,
            use_filename: true,
            unique_filename: false,
            access_mode: 'authenticated', // Secure access
          },
          (error, result) => {
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
      console.error('Cloudinary upload error:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Generate a secure download URL for a manuscript
   */
  static async getSecureDownloadUrl(publicId: string): Promise<string> {
    try {
      return cloudinary.url(publicId, {
        resource_type: 'raw',
        sign_url: true,
        secure: true,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
      });
    } catch (error) {
      console.error('Error generating secure URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Delete a manuscript file from Cloudinary
   */
  static async deleteManuscript(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw'
      });
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

export default cloudinary;
