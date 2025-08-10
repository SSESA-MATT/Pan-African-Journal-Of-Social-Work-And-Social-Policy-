import express from 'express';
import { FileController } from '../controllers/FileController';
import { uploadSingle, handleUploadError, validateUploadedFile } from '../middleware/upload';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @route POST /api/files/upload/manuscript
 * @desc Upload a manuscript PDF file
 * @access Private (Authors, Editors, Admins)
 */
router.post(
  '/upload/manuscript',
  authenticate,
  uploadSingle,
  handleUploadError,
  validateUploadedFile,
  FileController.uploadManuscript
);

/**
 * @route GET /api/files/:fileId/download
 * @desc Get secure download URL for a file
 * @access Private (Authenticated users)
 */
router.get(
  '/:fileId/download',
  authenticate,
  FileController.getDownloadUrl
);

/**
 * @route GET /api/files/:fileId/info
 * @desc Get file information
 * @access Private (Authenticated users)
 */
router.get(
  '/:fileId/info',
  authenticate,
  FileController.getFileInfo
);

/**
 * @route DELETE /api/files/:fileId
 * @desc Delete a file
 * @access Private (File owner, Editors, Admins)
 */
router.delete(
  '/:fileId',
  authenticate,
  FileController.deleteFile
);

export default router;