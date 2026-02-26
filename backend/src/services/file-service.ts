import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

interface UploadResult {
  url: string;
  publicId: string;
  filename: string;
  size: number;
  mimeType: string;
}

class FileService {
  /**
   * Upload a file buffer to Cloudinary
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string = 'manuscripts'
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: `pan-afri-journal/${folder}`,
          public_id: `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          access_mode: 'authenticated',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            filename,
            size: result.bytes,
            mimeType,
          });
        }
      );

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);
      readable.pipe(stream);
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  }

  /**
   * Get a signed download URL (time-limited)
   */
  getDownloadUrl(publicId: string, expiresInSeconds: number = 3600): string {
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'authenticated',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    });
  }
}

export default new FileService();
