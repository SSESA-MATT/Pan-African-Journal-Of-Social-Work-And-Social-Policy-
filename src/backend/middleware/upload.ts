import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { FileService } from '../services/FileService';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Only allow PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only one file at a time
  },
});

// Middleware for single file upload
export const uploadSingle = upload.single('manuscript');

// Error handling middleware for multer
export const handleUploadError = (error: any, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: 'File size must be less than 10MB',
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: 'Only one file can be uploaded at a time',
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected field',
          message: 'File must be uploaded in the "manuscript" field',
        });
      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message,
        });
    }
  }

  if (error.message === 'Only PDF files are allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only PDF files are allowed',
    });
  }

  next(error);
};

// Middleware to validate uploaded file
export const validateUploadedFile = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded',
      message: 'Please select a PDF file to upload',
    });
  }

  const validation = FileService.validateFile(req.file);
  if (!validation.isValid) {
    return res.status(400).json({
      error: 'File validation failed',
      message: validation.error,
    });
  }

  next();
};