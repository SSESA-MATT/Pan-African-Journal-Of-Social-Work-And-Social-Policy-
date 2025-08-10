# File Upload System Documentation

## Overview

The file upload system provides secure manuscript upload, storage, and management capabilities for the Africa Journal platform. It uses Cloudinary for cloud storage and supports PDF files up to 10MB.

## Features

- **Secure Upload**: JWT-authenticated file uploads
- **Cloud Storage**: Files stored on Cloudinary with CDN delivery
- **File Validation**: PDF-only uploads with size limits
- **Progress Tracking**: Real-time upload progress indicators
- **Secure Downloads**: Time-limited secure download URLs
- **File Management**: Upload, download, view info, and delete operations

## API Endpoints

### Upload Manuscript
```
POST /api/files/upload/manuscript
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: FormData with 'manuscript' field containing PDF file
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "data": {
    "fileId": "manuscripts/123_filename.pdf",
    "url": "https://res.cloudinary.com/...",
    "originalName": "filename.pdf",
    "size": 1024000,
    "format": "pdf"
  }
}
```

### Get Download URL
```
GET /api/files/:fileId/download?expiresIn=3600
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Download URL generated successfully",
  "data": {
    "downloadUrl": "https://secure-download-url.com",
    "expiresIn": 3600,
    "expiresAt": "2023-12-01T12:00:00.000Z"
  }
}
```

### Get File Information
```
GET /api/files/:fileId/info
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "File information retrieved successfully",
  "data": {
    "publicId": "manuscripts/123_filename.pdf",
    "url": "https://res.cloudinary.com/...",
    "size": 1024000,
    "format": "pdf",
    "createdAt": "2023-12-01T10:00:00.000Z",
    "resourceType": "raw"
  }
}
```

### Delete File
```
DELETE /api/files/:fileId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "File deleted successfully"
}
```

## File Validation Rules

- **File Type**: Only PDF files (`application/pdf`) are accepted
- **File Size**: Maximum 10MB per file
- **Authentication**: All operations require valid JWT token
- **File Name**: Original filenames are preserved with timestamp prefixes

## Frontend Components

### FileUpload Component
- Drag-and-drop interface
- Progress indicators
- File validation
- Error handling
- Success feedback

### FileManager Component
- List uploaded files
- Download functionality
- File information display
- Delete operations
- Loading states

## Environment Configuration

Required environment variables:

```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

## Security Features

- **Authentication**: All endpoints require valid JWT tokens
- **File Validation**: Server-side validation of file type and size
- **Secure URLs**: Time-limited download URLs prevent unauthorized access
- **Cloud Storage**: Files stored securely on Cloudinary infrastructure
- **Error Handling**: Comprehensive error messages without exposing sensitive data

## Usage Examples

### Backend Service Usage
```typescript
import { FileService } from '../services/FileService';

// Upload a file
const result = await FileService.uploadPDF(fileBuffer, 'document.pdf', 'manuscripts');

// Generate secure download URL
const downloadUrl = FileService.generateSecureUrl(result.publicId, 3600);

// Delete a file
const deleted = await FileService.deleteFile(result.publicId);
```

### Frontend Component Usage
```tsx
import { FileUpload } from '../components/FileUpload';

<FileUpload
  onUploadSuccess={(result) => console.log('Uploaded:', result)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

## Testing

The system includes comprehensive tests:

- **Unit Tests**: FileService and FileController
- **Integration Tests**: API endpoint testing
- **Component Tests**: Frontend component testing

Run tests:
```bash
npm test -- --testPathPattern="FileService|FileController|file-upload"
```

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid file type, size, or missing file
- `401 Unauthorized`: Missing or invalid authentication token
- `500 Internal Server Error`: Upload/storage service errors

## Performance Considerations

- Files are uploaded directly to Cloudinary (no local storage)
- Progress tracking provides user feedback during uploads
- Secure URLs expire automatically to prevent unauthorized access
- CDN delivery ensures fast download speeds globally